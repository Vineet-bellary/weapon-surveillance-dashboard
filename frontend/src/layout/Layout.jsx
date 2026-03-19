import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Drawer, IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VideocamIcon from "@mui/icons-material/Videocam";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import WarningIcon from "@mui/icons-material/Warning";
import SecurityIcon from "@mui/icons-material/Security";

import colors from "../theme/colors";

function SidebarContent({ onNavigate, linkBase, radius }) {
  return (
    <>
      <h3 style={{ marginBottom: "20px", color: colors.text }}>Dashboard</h3>

      <NavLink
        to="/"
        onClick={onNavigate}
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
        onClick={onNavigate}
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
        onClick={onNavigate}
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
        onClick={onNavigate}
        style={({ isActive }) => ({
          ...linkBase,
          background: isActive ? colors.border : "transparent",
        })}
      >
        <WarningIcon style={{ color: colors.accent }} />
        Detections
      </NavLink>
    </>
  );
}

function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 899px)");

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
        height: "100dvh",
        overflow: "hidden",
        background: colors.secondary,
        padding: isMobile ? "0px" : "10px",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          background: colors.secondary,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            height: "72px",
            background: colors.primary,
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            padding: "0 16px",
            borderBottom: `1px solid ${colors.border}`,
            gap: "12px",
          }}
        >
          {/* Burger button — mobile only */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                color: colors.text,
                p: 0.5,
                "&:hover": { backgroundColor: `${colors.accent}20` },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <SecurityIcon style={{ color: colors.accent }} />
          <h1 style={{ fontSize: "18px", margin: 0, color: colors.text }}>
            Weapon Surveillance
          </h1>
        </div>

        {/* BODY */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* PERMANENT SIDEBAR — desktop only */}
          {!isMobile && (
            <div
              style={{
                width: "220px",
                flexShrink: 0,
                background: colors.primary,
                padding: "20px 15px",
                borderRight: `1px solid ${colors.border}`,
                borderTopLeftRadius: radius,
                borderBottomLeftRadius: radius,
                overflowY: "auto",
              }}
            >
              <SidebarContent linkBase={linkBase} radius={radius} />
            </div>
          )}

          {/* MOBILE DRAWER */}
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: "240px",
                background: colors.primary,
                padding: "20px 15px",
                color: colors.text,
                borderRight: `1px solid ${colors.border}`,
              },
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <SidebarContent
              onNavigate={() => setDrawerOpen(false)}
              linkBase={linkBase}
              radius={radius}
            />
          </Drawer>

          {/* CONTENT */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              padding: isMobile ? "16px" : "25px",
              color: colors.text,
              borderTopRightRadius: radius,
              borderBottomRightRadius: radius,
              overflowY: "auto",
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
