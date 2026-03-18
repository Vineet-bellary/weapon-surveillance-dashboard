import api from "./axios";

// GET /cameras
export const getCameras = async () => {
  try {
    const response = await api.get("/cameras");

    console.log("FULL RESPONSE:", response);

    return response.data;
  } catch (error) {
    console.error("Error fetching cameras: ", error);
    throw error;
  }
};
