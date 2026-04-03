import api from "./axios";

export const getModels = async () => {
  const res = await api.get("/models");
  return res.data;
};

export const switchModel = async (modelKey) => {
  const res = await api.post(`/models/switch/${modelKey}`);
  return res.data;
};
