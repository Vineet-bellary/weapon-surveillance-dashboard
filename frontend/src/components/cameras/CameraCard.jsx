import { CardContent, Typography, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";

import AppCard from "../common/AppCard";
import CameraStatusChip from "./CameraStatusChip";
import colors from "../../theme/colors";

export default function CameraCard({
  cam,
  onEdit,
  onDelete,
  onToggle,
  onOpen,
}) {
  return (
    <AppCard onClick={() => onOpen(cam.id)}>
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>
            {cam.name}
          </Typography>

          <div style={{ display: "flex", gap: "4px" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(cam);
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

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(cam.id);
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

        <Typography sx={{ color: colors.muted }}>ID: {cam.id}</Typography>

        <Typography sx={{ color: colors.muted }}>
          Created: {new Date(cam.created_at).toLocaleString("en-IN")}
        </Typography>

        <CameraStatusChip
          isActive={cam.is_active}
          onToggle={() => onToggle(cam)}
        />
      </CardContent>
    </AppCard>
  );
}
