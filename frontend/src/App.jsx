import { useEffect, useState } from "react";
import { Button, Typography, Container } from "@mui/material";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend response:", data);
        setMessage(data.message);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Weapons Surrveillance Dashboard
      </Typography>

      <Button variant="outlined" sx={{ mt: 2 }}>
        Test MUI Button
      </Button>
    </Container>
  );
}

export default App;
