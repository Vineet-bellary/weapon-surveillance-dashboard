import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Cameras from "./pages/Cameras";
import Live from "./pages/Live";
import Detections from "./pages/Detections";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/cameras" element={<Cameras />} />
          <Route path="/live" element={<Live />} />
          <Route path="/detections" element={<Detections />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
