import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Headbar from "./Headbar";

function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจ token
    const token = localStorage.getItem("token");

    if (!token) {
      // ไม่มีลบ token จาก local ไปที่หน้า login
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

export default DashboardLayout;
