import { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

import { getCameras, updateCamera } from "../api/cameras";
import colors from "../theme/colors";

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");

  // Camera fetching logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCameras();
        console.log(data);
        setCameras(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
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
      await updateCamera(selectedCamera.id, {
        name: name,
        stream_url: streamUrl,
      });

      setOpenModal(false);

      // Refresh camera list after update
      const data = await getCameras();
      setCameras(data);
    } catch (error) {
      console.error("Error updating camera: ", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        Cameras
      </Typography>
      {cameras.length === 0 ? (
        <Typography color="text.secondary">No cameras found</Typography>
      ) : (
        <Grid container spacing={3}>
          {cameras.map((cam) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={cam.id}>
              <Card
                onClick={() => window.open(`/camera/${cam.id}`, "_blank")}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  backgroundColor: colors.card, // dark card
                  color: colors.text,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.7)",
                  },
                }}
              >
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h5" fontWeight={600}>
                      {cam.name}
                    </Typography>

                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCamera(cam);
                        setOpenModal(true);
                      }}
                      sx={{
                        color: colors.muted,
                        "&:hover": {
                          color: colors.accent,
                          backgroundColor: `${colors.accent}20`,
                        },
                      }}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </div>

                  <Typography
                    variant="body1"
                    sx={{ color: colors.muted, mt: 1 }}
                  >
                    ID: {cam.id}
                  </Typography>

                  <Typography variant="body1" sx={{ color: colors.muted }}>
                    Created:{" "}
                    {new Date(cam.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Typography>

                  <Chip
                    label={cam.is_active ? "Active" : "Inactive"}
                    sx={{
                      mt: 2,
                      fontWeight: 500,
                      backgroundColor: cam.is_active
                        ? colors.success
                        : colors.error,
                      color: "#fff",
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
            },
          },
          paper: {
            sx: {
              backgroundColor: colors.secondary,
              color: colors.text,
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>
          Update Camera: {selectedCamera?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Camera Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              "& .MuiInputBase-input": {
                color: colors.text,
              },
              "& .MuiInputLabel-root": {
                color: colors.muted,
              },
              "& .MuiOutlinedInput-root": {
                backgroundColor: colors.primary,
                "& fieldset": {
                  borderColor: colors.border,
                },
                "&:hover fieldset": {
                  borderColor: colors.accentHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.accent,
                },
              },
            }}
          />
          <TextField
            label="Stream URL"
            fullWidth
            margin="normal"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            sx={{
              "& .MuiInputBase-input": {
                color: colors.text,
              },
              "& .MuiInputLabel-root": {
                color: colors.muted,
              },
              "& .MuiOutlinedInput-root": {
                backgroundColor: colors.primary,
                "& fieldset": {
                  borderColor: colors.border,
                },
                "&:hover fieldset": {
                  borderColor: colors.accentHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.accent,
                },
              },
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{ color: colors.muted }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: colors.accent,
              color: "#020617",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: colors.accentHover,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
