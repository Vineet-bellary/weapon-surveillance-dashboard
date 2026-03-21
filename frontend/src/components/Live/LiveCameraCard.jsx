import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import colors from "../../theme/colors";

export default function LiveCameraCard({
  cam,
  isBroken,
  isInactive,
  isFullscreen,
  onFullscreen,
  onRetry,
  setFailedStreams,
  streamRefs,
}) {
  const streamSrc = `http://127.0.0.1:8000/stream/${cam.id}`;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.5, borderBottom: `1px solid ${colors.border}` }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={700}>{cam.name}</Typography>

          <Chip
            size="small"
            label={isInactive ? "Inactive" : "Live"}
            sx={{
              backgroundColor: isInactive
                ? `${colors.error}20`
                : `${colors.success}20`,
              color: isInactive ? colors.error : colors.success,
              border: `1px solid ${isInactive ? colors.error : colors.success}`,
              fontWeight: 700,
            }}
          />
        </Stack>

        <Tooltip title={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}>
          <span>
            <IconButton
              size="small"
              onClick={() => onFullscreen(cam.id)}
              disabled={isInactive}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Stream */}
      <Box
        ref={(node) => {
          streamRefs.current[cam.id] = node;
        }}
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          backgroundColor: colors.primary,
        }}
      >
        {isInactive ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
          >
            <LiveTvIcon />
            <Typography>This camera is inactive</Typography>
          </Stack>
        ) : isBroken ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
          >
            <WarningAmberIcon />
            <Typography>Stream unavailable</Typography>

            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          </Stack>
        ) : (
          <img
            src={streamSrc}
            alt="stream"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() =>
              setFailedStreams((prev) => ({
                ...prev,
                [cam.id]: true,
              }))
            }
          />
        )}
      </Box>
    </Box>
  );
}
