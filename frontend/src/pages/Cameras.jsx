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
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getCameras,
  updateCamera,
  createCamera,
  deleteCamera,
} from "../api/cameras";
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

      const data = await getCameras();
      setCameras(data);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  // Delete Camera logic
  const handelDelete = async (id) => {
    try {
      await deleteCamera(id);

      const data = await getCameras();
      setCameras(data);
    } catch (error) {
      console.log("Delete failed; ", error);
    }
  };

  // Toggle camaera status
  const handleToggleActive = async (cam) => {
    try {
      await updateCamera(cam.id, {
        is_active: !cam.is_active,
      });

      // refresh cameras
      const data = await getCameras();
      setCameras(data);
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
        <Grid container spacing={{ xs: 2, sm: 3 }} >
          {cameras.map((cam) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cam.id}>
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
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        wordBreak: "break-word",
                      }}
                      title={cam.name}
                    >
                      {cam.name}
                    </Typography>

                    {/* Icons Group */}
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      {/* Settings Button */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCamera(cam);
                          setOpenModal(true);
                        }}
                        sx={{
                          p: 0.5,
                          color: colors.muted,
                          "&:hover": {
                            color: colors.accent,
                            backgroundColor: `${colors.accent}20`,
                          },
                        }}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>

                      {/* Delete Button */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handelDelete(cam.id);
                        }}
                        sx={{
                          p: 0.5,
                          color: colors.error,
                          "&:hover": {
                            backgroundColor: `${colors.error}20`,
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
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
                    clickable
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(cam);
                    }}
                    icon={
                      cam.is_active ? (
                        <span style={{ fontSize: "10px" }}>●</span>
                      ) : (
                        <span style={{ fontSize: "10px" }}>●</span>
                      )
                    }
                    sx={{
                      mt: 2,
                      px: 1,
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      borderRadius: "999px", // pill shape
                      cursor: "pointer",

                      backgroundColor: cam.is_active
                        ? `${colors.success}20`
                        : `${colors.error}20`,

                      color: cam.is_active ? colors.success : colors.error,

                      border: `1px solid ${
                        cam.is_active ? colors.success : colors.error
                      }`,

                      transition: "all 0.2s ease",

                      "& .MuiChip-icon": {
                        color: cam.is_active ? colors.success : colors.error,
                        ml: "4px",
                      },

                      "&:hover": {
                        transform: "scale(1.05)",
                        backgroundColor: cam.is_active
                          ? `${colors.success}30`
                          : `${colors.error}30`,
                      },
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
          {selectedCamera
            ? `Update Camera: ${selectedCamera?.name}`
            : "Add Camera"}
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
              color: colors.accentText,
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
