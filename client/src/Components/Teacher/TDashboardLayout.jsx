import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Tsidebar";
import Headbar from "./THeadbar";
import { Box } from "@mui/material";

function TDashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบว่ามี token
    const token = localStorage.getItem("token");

    if (!token) {
      // ไม่มี token ให้ลบ token local ไปหน้า login
      localStorage.removeItem("token");
      navigate("/Login");
    }
  }, [navigate]);

  return (
    <div>
      <Sidebar />
      <Headbar />
      <Outlet />
    </div>
  );
}

export default TDashboardLayout;
