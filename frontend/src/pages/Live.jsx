import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import LiveCameraCard from "../components/Live/LiveCameraCard";
import { getCameras } from "../api/cameras";
import colors from "../theme/colors";

function Live() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedStreams, setFailedStreams] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [fullscreenId, setFullscreenId] = useState(null);
  const streamRefs = useRef({});

  const activeCameras = useMemo(
    () => cameras.filter((cam) => cam.is_active),
    [cameras],
  );

  const visibleCameras = useMemo(() => {
    if (showInactive) {
      return cameras;
    }
    return activeCameras;
  }, [showInactive, cameras, activeCameras]);

  const fetchCameras = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      const data = await getCameras();
      setCameras(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load cameras. Please check backend connection.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  const handleFullscreen = async (cameraId) => {
    const streamContainer = streamRefs.current[cameraId];
    if (!streamContainer) {
      return;
    }

    try {
      if (document.fullscreenElement === streamContainer) {
        await document.exitFullscreen();
        setFullscreenId(null);
      } else {
        await streamContainer.requestFullscreen();
        setFullscreenId(cameraId);
      }
    } catch (err) {
      console.error("Fullscreen failed", err);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCameras({ silent: true });
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchCameras]);

  useEffect(() => {
    const syncFullscreenState = () => {
      const currentId = Object.entries(streamRefs.current).find(
        ([, element]) => element === document.fullscreenElement,
      )?.[0];

      setFullscreenId(currentId ? Number(currentId) : null);
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  return (
    <Box sx={{ backgroundColor: colors.secondary, minHeight: "100%", p: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Live Camera Feeds
          </Typography>
          <Typography sx={{ color: colors.muted }}>
            Showing {visibleCameras.length} camera
            {visibleCameras.length === 1 ? "" : "s"} ({activeCameras.length}
            active)
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <FormControlLabel
            control={
              <Tooltip title="Include inactive cameras in the grid">
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
              </Tooltip>
            }
            label="Show inactive"
            sx={{ color: colors.text, mr: { xs: 0, sm: 1 } }}
          />

          <Tooltip title="Refresh camera list now">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchCameras()}
              sx={{
                backgroundColor: colors.accent,
                color: colors.accentText,
                fontWeight: 700,
                "&:hover": { backgroundColor: colors.accentHover },
              }}
            >
              Refresh
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {loading ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ py: 8, gap: 1 }}
        >
          <CircularProgress sx={{ color: colors.accent }} />
          <Typography sx={{ color: colors.muted }}>
            Loading cameras...
          </Typography>
        </Stack>
      ) : error ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ py: 8, gap: 1, color: colors.error }}
        >
          <WarningAmberIcon />
          <Typography>{error}</Typography>
        </Stack>
      ) : visibleCameras.length === 0 ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ py: 8, gap: 1 }}
        >
          <LiveTvIcon sx={{ color: colors.muted }} />
          <Typography sx={{ color: colors.muted }}>
            No active cameras available.
          </Typography>
        </Stack>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {visibleCameras.map((cam) => {
            const isBroken = failedStreams[cam.id];
            const isInactive = !cam.is_active;
            const isFullscreen = fullscreenId === cam.id;

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={cam.id}>
                <LiveCameraCard
                  cam={cam}
                  isBroken={isBroken}
                  isInactive={isInactive}
                  isFullscreen={isFullscreen}
                  onFullscreen={handleFullscreen}
                  onRetry={() =>
                    setFailedStreams((prev) => ({
                      ...prev,
                      [cam.id]: false,
                    }))
                  }
                  setFailedStreams={setFailedStreams}
                  streamRefs={streamRefs}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default Live;
