import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography, Grid, Button, CircularProgress } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";

import StatCard from "../components/dashboard/StatCard";
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");

  // Helpers
  const navigate = useNavigate();

  const refreshCameras = async () => {
    try {
      const data = await getCameras();
      setCameras(data);

      const total = data.length;
      const active = data.filter((c) => c.is_active).length;
      const inactive = total - active;

      setStats({ total, active, inactive });
    } catch (err) {
      console.error(err);
    }
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
      {/* Dashboard stats */}
      <Typography
        variant="h4"
        fontWeight={600}
        gutterBottom
        sx={{
          mb: { xs: 1, sm: 3 },
          fontSize: { xs: "1.75rem", sm: "2.125rem" },
        }}
      >
        Dashboard
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* Stats */}
        <Grid
          container
          spacing={3}
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: { xs: "100%", md: "850px" },
          }}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Total"
              value={stats.total}
              icon={<VideocamIcon />}
              color={colors.accent}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Online"
              value={stats.active}
              icon={<CheckCircleIcon />}
              color={colors.success}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Offline"
              value={stats.inactive}
              icon={<CancelIcon />}
              color={colors.error}
            />
          </Grid>
        </Grid>

        {/* Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedCamera(null);
            setName("");
            setStreamUrl("");
            setOpenModal(true);
          }}
          sx={{
            whiteSpace: "nowrap",
            height: "fit-content",
            backgroundColor: colors.accent,
            color: colors.accentText,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: colors.accentHover,
            },
          }}
        >
          Add Camera
        </Button>
      </div>

      {/* Cameras Section */}
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
            marginTop: "10px",
          }}
        >
          Cameras
        </Typography>
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
