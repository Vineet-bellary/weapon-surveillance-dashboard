import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  clearDetections,
  deleteDetection,
  getDetections,
} from "../api/detections";
import { getCameras } from "../api/cameras";
import colors from "../theme/colors";

function Detections() {
  const [detections, setDetections] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");

  const [cameraId, setCameraId] = useState("");
  const [objectClass, setObjectClass] = useState("");
  const [minConfidence, setMinConfidence] = useState("0.7");

  const handleClearLogs = async () => {
    const targetText = cameraId ? `for selected camera` : "for all cameras";
    const ok = window.confirm(`Delete detection logs ${targetText}?`);
    if (!ok) {
      return;
    }

    try {
      await clearDetections({ cameraId });
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to clear detection logs.");
    }
  };

  const handleDeleteOne = async (detectionId) => {
    try {
      await deleteDetection(detectionId);
      setDetections((prev) => prev.filter((d) => d.id !== detectionId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete detection.");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [detectionData, cameraData] = await Promise.all([
        getDetections({
          cameraId,
          objectClass,
          minConfidence,
          limit: 200,
        }),
        getCameras(),
      ]);

      setDetections(Array.isArray(detectionData) ? detectionData : []);
      setCameras(Array.isArray(cameraData) ? cameraData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load detections.");
    }
  }, [cameraId, objectClass, minConfidence]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const controlSx = {
    minWidth: 170,
    color: colors.text,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.accent,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: colors.accent,
    },
    "& .MuiSvgIcon-root": {
      color: colors.muted,
    },
  };

  return (
    <Box sx={{ backgroundColor: colors.secondary, minHeight: "100%", p: 2.5 }}>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 0.5, fontSize: { xs: "1.8rem", sm: "2.1rem" } }}
        >
          Weapon Detections
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{
            p: 1.5,
          }}
        >
          <Select
            size="small"
            value={cameraId}
            onChange={(e) => setCameraId(e.target.value)}
            displayEmpty
            sx={controlSx}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: colors.primary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                },
              },
            }}
          >
            <MenuItem value="">All Cameras</MenuItem>
            {cameras.map((cam) => (
              <MenuItem key={cam.id} value={cam.id}>
                {cam.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={objectClass}
            onChange={(e) => setObjectClass(e.target.value)}
            displayEmpty
            sx={{ ...controlSx, minWidth: 180 }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: colors.primary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                },
              },
            }}
          >
            <MenuItem value="">All Classes</MenuItem>
            <MenuItem value="pistol">Pistol</MenuItem>
            <MenuItem value="rifle">Rifle</MenuItem>
            <MenuItem value="shotgun">Shotgun</MenuItem>
            <MenuItem value="knife">Knife</MenuItem>
          </Select>

          <TextField
            size="small"
            label="Min confidence"
            value={minConfidence}
            onChange={(e) => setMinConfidence(e.target.value)}
            sx={{
              ...controlSx,
              maxWidth: 170,
              "& .MuiInputBase-input": {
                color: colors.text,
              },
              "& .MuiInputLabel-root": {
                color: colors.muted,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: colors.accent,
              },
            }}
          />

          <Button
            variant="outlined"
            onClick={handleClearLogs}
            disabled={detections.length === 0}
            sx={{
              minWidth: 150,
              borderColor: colors.error,
              color: colors.error,
              fontWeight: 700,
              backgroundColor: `${colors.error}12`,
              "&:hover": {
                borderColor: colors.error,
                backgroundColor: `${colors.error}24`,
              },
              "&.Mui-disabled": {
                borderColor: colors.border,
                color: colors.muted,
                backgroundColor: "transparent",
              },
            }}
          >
            Clear Logs
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {detections.length === 0 ? (
        <Box
          sx={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography sx={{ color: colors.muted }}>
            No detections found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {detections.map((det) => (
            <Grid key={det.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 6px 20px rgba(2, 6, 23, 0.35)",
                }}
              >
                {det.image_path ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={`http://127.0.0.1:8000${det.image_path}`}
                    alt={det.object_class}
                  />
                ) : null}
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {det.object_class}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteOne(det.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography variant="body2" sx={{ color: colors.muted }}>
                    Confidence: {Math.round(det.confidence * 100)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.muted }}>
                    Camera ID: {det.camera_id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.muted }}>
                    Model: {det.model_name || "unknown"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.muted }}>
                    {new Date(det.detected_at).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Detections;
