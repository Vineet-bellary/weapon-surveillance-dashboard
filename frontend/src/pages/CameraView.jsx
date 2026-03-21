import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, Chip, Tooltip } from "@mui/material";
import LiveTvIcon from "@mui/icons-material/LiveTv";

import { getCamerahealth } from "../api/health";
import colors from "../theme/colors";

export default function CameraView() {
  const { id } = useParams();
  const [status, setStatus] = useState("UNKNOWN");
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getCamerahealth();

        const camHealth = data.find((item) => item.camera_id === Number(id));
        if (camHealth) {
          setStatus(camHealth.status);
          setLastSeen(camHealth.last_seen);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHealth();
  }, [id]);

  const formattedLastSeen = lastSeen
    ? new Date(lastSeen * 1000).toLocaleString("en-IN")
    : "N/A";

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #1e293b",
        }}
      >
        <LiveTvIcon sx={{ color: colors.accent, fontSize: 28 }} />

        <Typography variant="h5" color="white" fontWeight={600}>
          Camera {id}
        </Typography>
      </Box>

      {/* Stream */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", py: 2 }}>
        <img
          src={`http://127.0.0.1:8000/stream/${id}`}
          alt="Live Stream"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "10px",
          }}
        />
      </Box>

      {/* Status + Last Seen */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Tooltip title="Current backend health state for this camera">
          <Chip
            label={status}
            color={status === "ONLINE" ? "success" : "error"}
            sx={{ mb: 1 }}
          />
        </Tooltip>

        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Last Seen: {formattedLastSeen}
        </Typography>
      </Box>
    </Box>
  );
}
