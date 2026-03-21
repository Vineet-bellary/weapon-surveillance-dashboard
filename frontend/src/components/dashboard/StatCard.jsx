import { CardContent, Typography, Box } from "@mui/material";
import AppCard from "../common/AppCard";

export default function StatCard({ title, value, icon, color }) {
  return (
    <AppCard>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
            <Typography variant="body2" sx={{ color: "muted" }}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              backgroundColor: `${color}20`,
              color: color,
              "& svg": {
                fontSize: 28,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </AppCard>
  );
}
