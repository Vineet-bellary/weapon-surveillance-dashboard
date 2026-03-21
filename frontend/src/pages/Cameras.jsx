import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getCameras,
  updateCamera,
  createCamera,
  deleteCamera,
} from "../api/cameras";
import colors from "../theme/colors";
import CameraCard from "../components/cameras/CameraCard";
import CameraModal from "../components/cameras/CameraModal";

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");

  // Helpers
  const navigate = useNavigate();

  const refreshCameras = async () => {
    const data = await getCameras();
    setCameras(data);
  };

  // Camera fetching logic
  useEffect(() => {
    refreshCameras();
  }, []);

  // Camera update logic
  useEffect(() => {
    if (selectedCamera) {
      setName(selectedCamera.name);
      setStreamUrl(selectedCamera.stream_url || "");
    }
  }, [selectedCamera]);

  const handleSave = async () => {
    try {
      if (selectedCamera) {
        // UPDATE
        await updateCamera(selectedCamera.id, {
          name,
          stream_url: streamUrl,
        });
      } else {
        // CREATE
        await createCamera({
          name,
          stream_url: streamUrl,
          is_active: true,
        });
      }

      setOpenModal(false);

      await refreshCameras();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  // Delete Camera logic
  const handleDelete = async (id) => {
    try {
      await deleteCamera(id);

      await refreshCameras();
    } catch (error) {
      console.log("Delete failed; ", error);
    }
  };

  // Toggle camera status
  const handleToggleActive = async (cam) => {
    try {
      await updateCamera(cam.id, {
        is_active: !cam.is_active,
      });

      // refresh cameras
      await refreshCameras();
    } catch (error) {
      console.log("Toggle failed: ", error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.secondary,
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={600}
          gutterBottom
          sx={{
            mb: { xs: 1, sm: 3 },
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
          }}
        >
          Cameras
        </Typography>

        <Button
          variant="contained"
          onClick={() => {
            setSelectedCamera(null);
            setName("");
            setStreamUrl("");
            setOpenModal(true);
          }}
          sx={{
            whiteSpace: "nowrap",
            backgroundColor: colors.accent,
            color: colors.accentText,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: colors.accentHover,
            },
          }}
        >
          + Add Camera
        </Button>
      </div>
      {cameras.length === 0 ? (
        <Typography sx={{ color: colors.error, textAlign: "center", mt: 5 }}>
          No cameras found
        </Typography>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {cameras.map((cam) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cam.id}>
              <CameraCard
                cam={cam}
                onEdit={(cam) => {
                  setSelectedCamera(cam);
                  setOpenModal(true);
                }}
                onDelete={handleDelete}
                onToggle={handleToggleActive}
                onOpen={(id) => navigate(`/camera/${id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      <CameraModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        selectedCamera={selectedCamera}
        name={name}
        setName={setName}
        streamUrl={streamUrl}
        setStreamUrl={setStreamUrl}
      />
    </div>
  );
}
