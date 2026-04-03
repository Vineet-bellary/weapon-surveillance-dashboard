import api from "./axios";

export const getAlerts = async (limit = 20) => {
  const res = await api.get(`/alerts?limit=${limit}`);
  return res.data;
};

export const dismissAlert = async (alertId) => {
  const res = await api.delete(`/alerts/${alertId}`);
  return res.data;
};
