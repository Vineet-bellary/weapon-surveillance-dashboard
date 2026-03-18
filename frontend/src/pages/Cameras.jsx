import { useEffect, useState } from "react";
import { Typography, Grid, Card, CardContent, Chip } from "@mui/material";

import { getCameras } from "../api/cameras";

export default function Cameras() {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCameras();
        console.log(data);
        setCameras(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        Cameras
      </Typography>
      {cameras.length === 0 ? (
        <Typography color="text.secondary">No cameras found</Typography>
      ) : (
        <Grid container spacing={3}>
          {cameras.map((cam) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={cam.id}>
              <Card
                onClick={() => window.open(`/camera/${cam.id}`, "_blank")}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  backgroundColor: "#1e293b", // dark card
                  color: "#e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.7)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {cam.name}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "#94a3b8", mt: 1 }}>
                    ID: {cam.id}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                    Created:{" "}
                    {new Date(cam.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Typography>

                  <Chip
                    label={cam.is_active ? "Active" : "Inactive"}
                    color={cam.is_active ? "success" : "error"}
                    size="medium"
                    sx={{ mt: 2, fontWeight: 500 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}
