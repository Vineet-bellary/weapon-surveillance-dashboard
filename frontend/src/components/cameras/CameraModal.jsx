import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import colors from "../../theme/colors";

export default function CameraModal({
  open,
  onClose,
  onSave,
  selectedCamera,
  name,
  setName,
  streamUrl,
  setStreamUrl,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Tooltip title="Display name shown on dashboard cards">
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
        </Tooltip>

        <Tooltip title="RTSP/HTTP URL or camera index used by backend">
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
        </Tooltip>
      </DialogContent>

      <DialogActions>
        <Tooltip title="Close without saving changes">
          <Button onClick={onClose} sx={{ color: colors.muted }}>
            Cancel
          </Button>
        </Tooltip>

        <Tooltip title="Save camera details">
          <Button
            variant="contained"
            onClick={onSave}
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
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
