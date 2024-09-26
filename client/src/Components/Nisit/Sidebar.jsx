import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CameraAlt as CameraAltIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  DocumentScannerOutlined,
  Settings as SettingsIcon,
} from "@mui/icons-material";

const drawerWidth = "16vw";
const drawerHeight = "100vh";

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

function NProfile() {
  const [user, setUser] = useState();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUserData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3333/Authen",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        if (data.status === "success") {
          setUser(data.decoded);
        } else {
          Swal.fire("Error", "Failed to fetch user data.", "error");
          localStorage.removeItem("token");
          navigate("/Login");
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire(
          "Error",
          "An error occurred. Please try again later.",
          "error"
        );
      }
    };

    fetchUserData();
  }, [navigate]);

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ padding: 1, backgroundColor: "#616161", color: "#000" }}>
        <Typography variant="h6" noWrap>
          {user ? (
            <Box display="flex" alignItems="center">
              <Avatar {...stringAvatar(`${user.fname} ${user.lname}`)} />
              <div style={{ marginLeft: "10px" }}>
                <h6>{user.fname}</h6>
                <h6>{user.lname}</h6>
              </div>
            </Box>
          ) : (
            <p>Loading...</p>
          )}
        </Typography>
      </Box>
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer}></Drawer>
      <List>
        {["Document", "Upload", "Classroom", "Settings", "Logout"].map(
          (text) => {
            let icon;
            let path = text.toLowerCase();
            let onClickHandler = () => navigate(path);

            switch (text) {
              case "Document":
                icon = <DocumentScannerOutlined />;
                path = "/Home";
                break;
              case "Upload":
                icon = <CameraAltIcon />;
                path = "/upload";
                break;
              case "Classroom":
                icon = <DashboardIcon />;
                path = "/createclassroom";
                break;
              case "Settings":
                icon = <SettingsIcon />;
                path = "/Settings";
                break;
              case "Logout":
                icon = <LogoutIcon />;
                onClickHandler = handleLogout;
                break;
              default:
                break;
            }

            return (
              <ListItem
                Button
                key={text}
                onClick={onClickHandler}
                sx={{
                  "&:hover": {
                    backgroundColor: "#424242",
                    color: "#ffffff",
                    transition: "0.3s",
                  },
                  "&:active": {
                    backgroundColor: "#616161",
                    color: "#ffffff",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            );
          }
        )}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
      }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: drawerHeight,
            boxSizing: "border-box",
            backgroundColor: "#212121",
            color: "#ffffff",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default NProfile;
