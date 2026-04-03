import math
from dataclasses import dataclass
from typing import Any

import cv2
import torch
from torch import nn
from torchvision.models import resnet50
from torchvision.ops import nms


class SSDHead(nn.Module):
    def __init__(self, in_channels: int, num_anchors: int, num_classes: int):
        super().__init__()
        self.cls_conv = nn.Conv2d(
            in_channels, num_anchors * (num_classes + 1), kernel_size=3, padding=1
        )
        self.bbox_conv = nn.Conv2d(
            in_channels, num_anchors * 4, kernel_size=3, padding=1
        )
        self.dropout = nn.Dropout(p=0.2)
        self.num_anchors = num_anchors
        self.num_classes = num_classes

    def forward(self, feature_map: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        cls_logits = self.cls_conv(feature_map)
        bbox_preds = self.bbox_conv(feature_map)

        batch_size, _, height, width = cls_logits.shape

        cls_logits = cls_logits.permute(0, 2, 3, 1).contiguous()
        cls_logits = cls_logits.view(
            batch_size, height * width * self.num_anchors, self.num_classes + 1
        )
        cls_logits = self.dropout(cls_logits)

        bbox_preds = bbox_preds.permute(0, 2, 3, 1).contiguous()
        bbox_preds = bbox_preds.view(batch_size, height * width * self.num_anchors, 4)
        bbox_preds = self.dropout(bbox_preds)

        return cls_logits, bbox_preds


class ResNet50Backbone(nn.Module):
    def __init__(self):
        super().__init__()
        backbone = resnet50(weights=None)
        children = list(backbone.children())
        self.stage1 = nn.Sequential(*children[:6])
        self.stage2 = nn.Sequential(*children[6:7])
        self.stage3 = nn.Sequential(*children[7:8])

    def forward(self, inputs: torch.Tensor) -> list[torch.Tensor]:
        feature1 = self.stage1(inputs)
        feature2 = self.stage2(feature1)
        feature3 = self.stage3(feature2)
        return [feature1, feature2, feature3]


class SSDModel(nn.Module):
    def __init__(
        self,
        backbone: nn.Module,
        feature_channels: list[int],
        num_anchors: int,
        num_classes: int,
    ):
        super().__init__()
        self.backbone = backbone
        self.heads = nn.ModuleList(
            [
                SSDHead(in_channels, num_anchors, num_classes)
                for in_channels in feature_channels
            ]
        )

    def forward(self, inputs: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        features = self.backbone(inputs)
        all_cls_logits = []
        all_bbox_preds = []

        for feature_map, head in zip(features, self.heads):
            cls_logits, bbox_preds = head(feature_map)
            all_cls_logits.append(cls_logits)
            all_bbox_preds.append(bbox_preds)

        return torch.cat(all_cls_logits, dim=1), torch.cat(all_bbox_preds, dim=1)


def generate_anchors(
    feature_map_size: int, scales: list[float], aspect_ratios: list[float]
) -> torch.Tensor:
    anchors = []
    step = 1.0 / feature_map_size

    for row in range(feature_map_size):
        for col in range(feature_map_size):
            center_x = (col + 0.5) * step
            center_y = (row + 0.5) * step
            for scale in scales:
                for aspect_ratio in aspect_ratios:
                    width = scale * math.sqrt(aspect_ratio)
                    height = scale / math.sqrt(aspect_ratio)
                    anchors.append([center_x, center_y, width, height])

    return torch.tensor(anchors, dtype=torch.float32)


def build_all_anchors() -> torch.Tensor:
    feature_maps = [38, 19, 10]
    scale_config = {
        38: [0.1, 0.2, 0.3],
        19: [0.4, 0.5, 0.6],
        10: [0.7, 0.8, 0.9],
    }
    aspect_ratios = [1, 2, 0.5, 3, 1 / 3, 4, 1 / 4]
    anchors = [
        generate_anchors(
            feature_map_size, scale_config[feature_map_size], aspect_ratios
        )
        for feature_map_size in feature_maps
    ]
    all_anchors = torch.cat(anchors, dim=0)
    return all_anchors.clamp_(0.0, 1.0)


def decode_boxes(predicted_boxes: torch.Tensor, priors: torch.Tensor) -> torch.Tensor:
    prior_centers = priors[:, :2]
    prior_sizes = priors[:, 2:]

    decoded_centers = predicted_boxes[:, :2] * 0.1 * prior_sizes + prior_centers
    decoded_sizes = torch.exp(predicted_boxes[:, 2:] * 0.2) * prior_sizes

    top_left = decoded_centers - decoded_sizes / 2
    bottom_right = decoded_centers + decoded_sizes / 2
    return torch.cat([top_left, bottom_right], dim=1)


@dataclass
class SSDRuntime:
    model: SSDModel
    anchors: torch.Tensor
    device: torch.device
    label_map: dict[int, str]
    nms_iou_threshold: float

    @classmethod
    def load(
        cls, model_path: str, label_map: dict[int, str], nms_iou_threshold: float
    ) -> "SSDRuntime":
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = SSDModel(
            backbone=ResNet50Backbone(),
            feature_channels=[512, 1024, 2048],
            num_anchors=21,
            num_classes=4,
        ).to(device)

        checkpoint = torch.load(model_path, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint["model_state"])
        model.eval()

        anchors = build_all_anchors().to(device)
        return cls(
            model=model,
            anchors=anchors,
            device=device,
            label_map={
                int(class_id): label.lower() for class_id, label in label_map.items()
            },
            nms_iou_threshold=nms_iou_threshold,
        )

    def detect(
        self, frame_bgr: Any, confidence_threshold: float
    ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        if frame_bgr is None:
            return [], {
                "raw_count": 0,
                "filtered_count": 0,
                "raw_classes": [],
                "filter_enabled": True,
            }

        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        original_height, original_width = frame_rgb.shape[:2]
        resized = cv2.resize(frame_rgb, (300, 300))
        image_tensor = (
            torch.from_numpy(resized)
            .permute(2, 0, 1)
            .float()
            .div(255.0)
            .unsqueeze(0)
            .to(self.device)
        )

        with torch.no_grad():
            cls_logits, bbox_preds = self.model(image_tensor)

        cls_probs = torch.softmax(cls_logits[0], dim=-1)
        scores, labels = torch.max(cls_probs, dim=-1)
        candidate_mask = (labels > 0) & (scores > confidence_threshold)

        if not torch.any(candidate_mask):
            debug = {
                "raw_count": int(labels.numel()),
                "filtered_count": 0,
                "raw_classes": [],
                "filter_enabled": True,
            }
            return [], debug

        filtered_preds = bbox_preds[0][candidate_mask]
        filtered_anchors = self.anchors[candidate_mask]
        filtered_scores = scores[candidate_mask]
        filtered_labels = labels[candidate_mask]
        decoded_boxes = decode_boxes(filtered_preds, filtered_anchors).clamp_(0.0, 1.0)
        kept_indices = nms(decoded_boxes, filtered_scores, self.nms_iou_threshold)

        detections = []
        raw_classes = []
        for index in kept_indices.tolist():
            label_id = int(filtered_labels[index].item())
            class_name = self.label_map.get(label_id, f"class_{label_id}")
            raw_classes.append(class_name)

            box = decoded_boxes[index].detach().cpu().tolist()
            x1 = float(box[0] * original_width)
            y1 = float(box[1] * original_height)
            x2 = float(box[2] * original_width)
            y2 = float(box[3] * original_height)

            detections.append(
                {
                    "object_class": class_name,
                    "confidence": float(filtered_scores[index].item()),
                    "bbox": [x1, y1, x2, y2],
                }
            )

        debug = {
            "raw_count": int(labels.numel()),
            "filtered_count": len(detections),
            "raw_classes": raw_classes,
            "filter_enabled": True,
        }
        return detections, debug
