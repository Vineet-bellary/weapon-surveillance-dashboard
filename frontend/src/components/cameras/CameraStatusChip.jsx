import { Chip } from "@mui/material";
import colors from "../../theme/colors";

export default function CameraStatusChip({ isActive, onToggle }) {
  return (
    <Chip
      label={isActive ? "Active" : "Inactive"}
      clickable
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      icon={
        isActive ? (
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

        backgroundColor: isActive
          ? `${colors.success}20`
          : `${colors.error}20`,

        color: isActive ? colors.success : colors.error,

        border: `1px solid ${isActive ? colors.success : colors.error}`,

        transition: "all 0.2s ease",

        "& .MuiChip-icon": {
          color: isActive ? colors.success : colors.error,
          ml: "4px",
        },

        "&:hover": {
          transform: "scale(1.05)",
          backgroundColor: isActive
            ? `${colors.success}30`
            : `${colors.error}30`,
        },
      }}
    />
  );
}
