import { NavLink, Outlet } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VideocamIcon from "@mui/icons-material/Videocam";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import WarningIcon from "@mui/icons-material/Warning";
import SecurityIcon from "@mui/icons-material/Security";

import colors from "../theme/colors";

function Layout() {
  const radius = "10px";
  const linkBase = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: radius,
    textDecoration: "none",
    color: colors.text,
    fontSize: "14px",
    transition: "0.2s",
  };

  return (
    <div
      style={{
        height: "100vh",
        background: colors.secondary,
        padding: "10px",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: colors.secondary,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            height: "60px",
            background: colors.primary,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: `1px solid ${colors.border}`,
            gap: "10px",
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
          }}
        >
          <SecurityIcon style={{ color: colors.accent }} />
          <h1 style={{ fontSize: "18px", margin: 0, color: colors.text }}>
            Weapon Surveillance
          </h1>
        </div>

        {/* BODY */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* SIDEBAR */}
          <div
            style={{
              width: "220px",
              background: colors.primary,
              padding: "20px 15px",
              borderRight: `1px solid ${colors.border}`,
              borderTopLeftRadius: radius,
              borderBottomLeftRadius: radius,
            }}
          >
            <h3 style={{ marginBottom: "20px", color: colors.text }}>
              Dashboard
            </h3>

            <NavLink
              to="/"
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive ? colors.border : "transparent",
              })}
            >
              <DashboardIcon style={{ color: colors.accent }} />
              Home
            </NavLink>

            <NavLink
              to="/cameras"
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive ? colors.border : "transparent",
              })}
            >
              <VideocamIcon style={{ color: colors.accent }} />
              Cameras
            </NavLink>

            <NavLink
              to="/live"
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive ? colors.border : "transparent",
              })}
            >
              <LiveTvIcon style={{ color: colors.accent }} />
              Live
            </NavLink>

            <NavLink
              to="/detections"
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive ? colors.border : "transparent",
              })}
            >
              <WarningIcon style={{ color: colors.accent }} />
              Detections
            </NavLink>
          </div>

          {/* CONTENT */}
          <div
            style={{
              flex: 1,
              padding: "25px",
              color: colors.text,
              borderTopRightRadius: radius,
              borderBottomRightRadius: radius,
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
