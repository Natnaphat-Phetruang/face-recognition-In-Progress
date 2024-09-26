import { Route, Routes } from "react-router-dom";
import Login from "./Components/Teacher/Login";
import Profile from "./Components/Teacher/Profile";

import ForgotPassword from "./Components/Teacher/ForgotPassword";
import Resetpassword from "./Components/Teacher/Resetpassword";
import Register_nisit_teacher from "./Components/Register_nisit_teacher";
import TDashboardLayout from "./Components/Teacher/TDashboardLayout";
import TeacherSettings from "./Components/Teacher/TSettings";

import DashboardLayout from "./Components/Nisit/DashboardLayout";
import Classroom from "./Components/Nisit/Classroom";
// import Face from "./Components/Nisit/Face";
import Home from "./Components/Nisit/Home";
import Settings from "./Components/Nisit/Settings";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import CreateClassrooms from "C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Project_comsci/client/src/Components/url/CreateRoom.jsx";
import CameraStream from "C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Project_comsci/client/src/Components/url/cam.jsx";
// import DisplayData from "./url/room.jsx";
// import RoleSelection from "./url/role.jsx";
import FaceUpload from "C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Project_comsci/client/src/Components/url/upload.jsx";

function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<Resetpassword />} />

        <Route path="/Register" element={<Register_nisit_teacher />} />

        {/* Protected Routes with Sidebar */}
        <Route path="/*" element={<DashboardLayout />}>
          <Route path="Classroom" element={<Classroom />} />
          <Route path="createclassroom" element={<CreateClassrooms />} />
          <Route path="upload" element={<FaceUpload />} />
          <Route path="Home" element={<Home />} />
          <Route path="Settings" element={<Settings />} />
          <Route path="camera" element={<CameraStream />} />
          {/* Add other routes that should be within the Sidebar layout here */}
        </Route>
        <Route path="/*" element={<TDashboardLayout />}>
          <Route path="TSettings" element={<TeacherSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
