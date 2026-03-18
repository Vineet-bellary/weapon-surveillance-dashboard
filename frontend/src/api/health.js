import api from "./axios";

export const getCamerahealth = async () => {
  const res = await api.get("/camera-health");
  return res.data;
};
