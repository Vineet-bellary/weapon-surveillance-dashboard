import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Live from "./pages/Live";
import Detections from "./pages/Detections";
import CameraView from "./pages/CameraView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/live" element={<Live />} />
          <Route path="/detections" element={<Detections />} />
        </Route>
        <Route path="/camera/:id" element={<CameraView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
