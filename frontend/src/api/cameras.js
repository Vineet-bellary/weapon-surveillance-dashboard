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

export const updateCamera = async (id, payload) => {
  try{
    const res = await api.put(`/cameras/${id}`, payload);

    console.log("Camera Updated: ", res.data);

    return res.data;
  } catch (error){
    console.error("Error updating camera: ", error);
    throw error;
  }
};
