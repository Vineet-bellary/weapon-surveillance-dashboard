import { Alert, IconButton, Snackbar, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState } from "react";
import { useAlerts } from "../../context/AlertContext";

function AlertPopup() {
  const { alerts, dismiss } = useAlerts();
  const [closing, setClosing] = useState(false);

  const activeAlert = useMemo(() => alerts[0], [alerts]);

  if (!activeAlert) {
    return null;
  }

  const handleClose = async (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    if (closing) {
      return;
    }
    setClosing(true);
    await dismiss(activeAlert.id);
    setClosing(false);
  };

  const confidence = `${Math.round(activeAlert.confidence * 100)}%`;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      autoHideDuration={2500}
      onClose={handleClose}
    >
      <Alert
        severity="error"
        variant="filled"
        action={
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Stack spacing={0.5}>
          <Typography fontWeight={700}>Weapon Detected</Typography>
          <Typography variant="body2">
            Camera #{activeAlert.camera_id} - {activeAlert.object_class} (
            {confidence})
          </Typography>
        </Stack>
      </Alert>
    </Snackbar>
  );
}

export default AlertPopup;
