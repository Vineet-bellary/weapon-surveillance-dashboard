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

// PUT /cameras/:id
export const updateCamera = async (id, payload) => {
  try {
    const res = await api.put(`/cameras/${id}`, payload);

    console.log("Camera Updated: ", res.data);

    return res.data;
  } catch (error) {
    console.error("Error updating camera: ", error);
    throw error;
  }
};

// POST /cameras
export const createCamera = async (payload) => {
  try {
    const res = await api.post("/cameras", payload);
    console.log("Camera Created; ", res.data);

    return res.data;
  } catch (error) {
    console.error("Error creating camera: ", error);
    throw error;
  }
};

export const deleteCamera = async (id) => {
  try {
    await api.delete(`/cameras/${id}`);
    console.log("Camera Deleted:", id);
  } catch (error) {
    console.error("Error deleting camera:", error);
    throw error;
  }
};
