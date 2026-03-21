import { Box, CircularProgress, Typography } from "@mui/material";
import colors from "../../theme/colors";

export default function Loader({ text = "Loading..." }) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "60vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography sx={{ color: colors.muted }}>{text}</Typography>
    </Box>
  );
}
