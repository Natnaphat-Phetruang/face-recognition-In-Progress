import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
} from "@mui/material";

function CreateClassrooms() {
  const [role, setRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        if (decodedToken.role) {
          setRole(decodedToken.role);
        }
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      alert("กรุณาเข้าสู่ระบบก่อน");
      navigate("/login");
    }
  }, [navigate]);

  const handleCreateClassroom = () => {
    if (role === "teacher") {
      setShowForm(true);
      console.log("Form should appear");
    } else {
      alert("คุณไม่มีสิทธิ์สร้างห้องเรียน");
    }
  };

  const handleJoinClassroom = () => {
    const classroomCode = prompt("กรุณาใส่รหัสห้องเรียน:");
    if (classroomCode) {
      localStorage.setItem("joinedClassroomCode", classroomCode);
      alert(`เข้าร่วมห้องเรียนด้วยรหัส '${classroomCode}' เรียบร้อยแล้ว!`);
      navigate("/display");
    }
  };

  return (
    <Box sx={{ textAlign: "center", paddingTop: "2rem" }}>
      {!showForm && (
        <>
          <Button variant="contained" onClick={handleCreateClassroom}>
            Create Classroom
          </Button>
          {/* <Button variant="outlined" onClick={handleJoinClassroom}>
            Join Classroom
          </Button> */}
        </>
      )}
      {showForm && (
        <CreateClassroom setShowForm={setShowForm} navigate={navigate} />
      )}
    </Box>
  );
}

function CreateClassroom({ setShowForm, navigate }) {
  const [formData, setFormData] = useState({
    subject: "",
    group: "",
    room: "",
    type: "Lecture",
    days: [],
    startTime: "",
    endTime: "",
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        days: checked
          ? [...prevData.days, value]
          : prevData.days.filter((day) => day !== value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const { subject, group, room, days, startTime, endTime } = formData;
    if (
      !subject ||
      !group ||
      !room ||
      days.length === 0 ||
      !startTime ||
      !endTime
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const generateRandomCode = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const classroomCode = generateRandomCode();
    const token = localStorage.getItem("token");
    let teacherId;

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        teacherId = decodedToken.id;
      } catch (error) {
        console.error("Invalid token", error);
      }
    }

    const newClassroom = {
      ...formData,
      code: classroomCode,
      teacher_id: teacherId,
      days: JSON.stringify(formData.days),
    };

    try {
      const response = await axios.post(
        "http://localhost:3333/classroom",
        newClassroom
      );
      if (response.status === 201) {
        alert(
          `ห้องเรียน '${formData.subject}' ถูกสร้างแล้ว! รหัสห้องเรียนคือ: ${classroomCode}`
        );
        setShowForm(false);
        navigate("/display");
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างห้องเรียน");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างห้องเรียน");
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: "0 auto", width: "400px" }}>
      <Typography variant="h5" gutterBottom>
        Create a Classroom
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="ชื่อวิชา"
          fullWidth
          margin="normal"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
        />
        <TextField
          label="หมู่เรียน"
          fullWidth
          margin="normal"
          name="group"
          value={formData.group}
          onChange={handleChange}
        />
        <TextField
          label="ห้องเรียน"
          fullWidth
          margin="normal"
          name="room"
          value={formData.room}
          onChange={handleChange}
        />
        <Typography variant="body1" gutterBottom>
          ประเภท:
        </Typography>
        <RadioGroup
          row
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <FormControlLabel
            value="Lecture"
            control={<Radio />}
            label="Lecture"
          />
          <FormControlLabel value="Lab" control={<Radio />} label="Lab" />
        </RadioGroup>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            label="เวลาเริ่ม"
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
          />
          <TextField
            label="เวลาสิ้นสุด"
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
          />
        </Box>
        <Typography variant="body1" gutterBottom>
          วันเรียน:
        </Typography>
        {["M", "T", "W", "Thu", "F"].map((day) => (
          <FormControlLabel
            key={day}
            control={
              <Checkbox
                checked={formData.days.includes(day)}
                onChange={handleChange}
                name="days"
                value={day}
              />
            }
            label={day}
          />
        ))}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          สร้างห้องเรียน
        </Button>
      </form>
    </Paper>
  );
}

export default CreateClassrooms;
