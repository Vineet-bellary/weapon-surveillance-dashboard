from dataclasses import dataclass
from typing import Any

import cv2
import torch
from torch import nn
from torchvision.models import efficientnet_b0, mobilenet_v3_large
from torchvision.ops import nms


FEATURE_MAP_SIZE = 20
IMAGE_SIZE = 640
NUM_ANCHORS = 16
SCALES = [0.05, 0.1, 0.2, 0.35]
ASPECT_RATIOS = [0.5, 1.0, 2.0, 3.0]


class EfficientNetBackbone(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = efficientnet_b0(weights=None).features

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.features(inputs)


class MobileNetV3LargeBackbone(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = mobilenet_v3_large(weights=None).features

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.features(inputs)


class SSDHead(nn.Module):
    def __init__(self, in_channels: int, num_classes: int):
        super().__init__()
        self.num_classes = num_classes
        self.cls_head = nn.Conv2d(
            in_channels, NUM_ANCHORS * num_classes, kernel_size=3, padding=1
        )
        self.loc_head = nn.Conv2d(
            in_channels, NUM_ANCHORS * 4, kernel_size=3, padding=1
        )

    def forward(self, feature_map: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        batch_size = feature_map.size(0)

        cls_logits = self.cls_head(feature_map)
        bbox_preds = self.loc_head(feature_map)

        cls_logits = cls_logits.permute(0, 2, 3, 1).contiguous()
        cls_logits = cls_logits.view(batch_size, -1, self.num_classes)

        bbox_preds = bbox_preds.permute(0, 2, 3, 1).contiguous()
        bbox_preds = bbox_preds.view(batch_size, -1, 4)

        return cls_logits, bbox_preds


class CompactSSD(nn.Module):
    def __init__(self, backbone: nn.Module, in_channels: int, num_classes: int):
        super().__init__()
        self.backbone = backbone
        self.head = SSDHead(in_channels=in_channels, num_classes=num_classes)

    def forward(self, inputs: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        feature_map = self.backbone(inputs)
        return self.head(feature_map)


def build_anchors() -> torch.Tensor:
    anchors = []

    for row in range(FEATURE_MAP_SIZE):
        for col in range(FEATURE_MAP_SIZE):
            center_x = (col + 0.5) / FEATURE_MAP_SIZE
            center_y = (row + 0.5) / FEATURE_MAP_SIZE

            for scale in SCALES:
                for aspect_ratio in ASPECT_RATIOS:
                    width = scale * (aspect_ratio**0.5)
                    height = scale / (aspect_ratio**0.5)
                    anchors.append([center_x, center_y, width, height])

    return torch.tensor(anchors, dtype=torch.float32).clamp_(0.0, 1.0)


def decode_boxes(predicted_boxes: torch.Tensor, priors: torch.Tensor) -> torch.Tensor:
    centers = priors[:, :2] + predicted_boxes[:, :2] * priors[:, 2:]
    sizes = priors[:, 2:] * torch.exp(predicted_boxes[:, 2:])

    top_left = centers - sizes / 2
    bottom_right = centers + sizes / 2
    return torch.cat([top_left, bottom_right], dim=1)


@dataclass
class CompactSSDRuntime:
    model: CompactSSD
    anchors: torch.Tensor
    device: torch.device
    label_map: dict[int, str]
    nms_iou_threshold: float

    @classmethod
    def load(
        cls,
        model_path: str,
        model_type: str,
        label_map: dict[int, str],
        nms_iou_threshold: float,
    ) -> "CompactSSDRuntime":
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        checkpoint = torch.load(model_path, map_location=device, weights_only=True)

        if model_type == "ssd_efficientnet_b0":
            backbone = EfficientNetBackbone()
            in_channels = 1280
        elif model_type == "ssd_mobilenet_v3_large":
            backbone = MobileNetV3LargeBackbone()
            in_channels = 960
        else:
            raise ValueError(f"Unsupported compact SSD model type: {model_type}")

        cls_head_weight = checkpoint.get("head.cls_head.weight")
        if cls_head_weight is None:
            raise ValueError("Checkpoint is missing head.cls_head.weight")

        num_classes = cls_head_weight.shape[0] // NUM_ANCHORS
        model = CompactSSD(
            backbone=backbone,
            in_channels=in_channels,
            num_classes=num_classes,
        ).to(device)
        model.load_state_dict(checkpoint)
        model.eval()

        anchors = build_anchors().to(device)
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
        resized = cv2.resize(frame_rgb, (IMAGE_SIZE, IMAGE_SIZE))
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
        object_probs = cls_probs[:, 1:]
        scores, labels = torch.max(object_probs, dim=-1)
        labels = labels + 1
        candidate_mask = scores > confidence_threshold

        if not torch.any(candidate_mask):
            return [], {
                "raw_count": int(labels.numel()),
                "filtered_count": 0,
                "raw_classes": [],
                "filter_enabled": True,
            }

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

        return detections, {
            "raw_count": int(labels.numel()),
            "filtered_count": len(detections),
            "raw_classes": raw_classes,
            "filter_enabled": True,
        }
