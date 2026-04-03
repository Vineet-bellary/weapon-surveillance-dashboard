import api from "./axios";

export const getDetections = async ({
  cameraId,
  objectClass,
  minConfidence,
  limit = 200,
} = {}) => {
  const params = new URLSearchParams();

  if (cameraId !== undefined && cameraId !== null && cameraId !== "") {
    params.append("camera_id", String(cameraId));
  }

  if (objectClass) {
    params.append("object_class", objectClass);
  }

  if (
    minConfidence !== undefined &&
    minConfidence !== null &&
    minConfidence !== ""
  ) {
    params.append("min_confidence", String(minConfidence));
  }

  params.append("limit", String(limit));

  const res = await api.get(`/detections?${params.toString()}`);
  return res.data;
};

export const deleteDetection = async (detectionId) => {
  const res = await api.delete(`/detections/${detectionId}`);
  return res.data;
};

export const clearDetections = async ({ cameraId } = {}) => {
  const params = new URLSearchParams();
  if (cameraId !== undefined && cameraId !== null && cameraId !== "") {
    params.append("camera_id", String(cameraId));
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  const res = await api.delete(`/detections${suffix}`);
  return res.data;
};
