import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
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
    <div>
      <h1>Weapons Surveillance Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
