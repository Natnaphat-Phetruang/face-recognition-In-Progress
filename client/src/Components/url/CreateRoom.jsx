import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
    <div className="app">
      {!showForm && (
        <div>
          <button onClick={handleCreateClassroom}>Create Classroom</button>
          <button onClick={handleJoinClassroom}>Join Classroom</button>
        </div>
      )}
      {showForm && (
        <CreateClassroom setShowForm={setShowForm} navigate={navigate} />
      )}
    </div>
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

    const validString = (str) => {
      const regex = /^[A-Za-zก-๙0-9\s]+$/;
      if (!regex.test(str)) {
        alert("ข้อมูลควรเป็นตัวอักษรภาษาอังกฤษ, ภาษาไทย, หรือเลขเท่านั้น");
        return false;
      }
      if (str.length < 1) {
        alert("ข้อมูลควรมีความยาวมากกว่า 1 ตัวอักษร");
        return false;
      }
      return true;
    };

    if (!validString(subject) || !validString(group) || !validString(room)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitted Data:", formData);
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
        teacherId = decodedToken.id; // กำหนดค่า teacherId จาก decoded token
      } catch (error) {
        console.error("Invalid token", error);
      }
    }

    const newClassroom = {
      ...formData,
      code: classroomCode,
      teacher_id: teacherId, // เพิ่ม teacher_id
      days: JSON.stringify(formData.days),
    };

    try {
      console.log("Classroom data being sent:", newClassroom);
      const response = await axios.post(
        "http://localhost:3333/classroom",
        newClassroom
      );
      console.log("Response data:", response.data);

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
      console.error(
        "Error creating classroom:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างห้องเรียน"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="subject">ชื่อวิชา:</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="group">หมู่เรียน:</label>
        <input
          type="text"
          id="group"
          name="group"
          value={formData.group}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="room">ห้องเรียน:</label>
        <input
          type="text"
          id="room"
          name="room"
          value={formData.room}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="type">ประเภท:</label>
        <input
          type="radio"
          id="lecture"
          name="type"
          value="Lecture"
          checked={formData.type === "Lecture"}
          onChange={handleChange}
        />
        <label htmlFor="lecture">Lecture</label>
        <input
          type="radio"
          id="lab"
          name="type"
          value="Lab"
          checked={formData.type === "Lab"}
          onChange={handleChange}
        />
        <label htmlFor="lab">Lab</label>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <label htmlFor="startTime">เวลาเริ่ม:</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="endTime">เวลาสิ้นสุด:</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <label>วันเรียน:</label>
        <input
          type="checkbox"
          id="monday"
          name="days"
          value="M"
          checked={formData.days.includes("M")}
          onChange={handleChange}
        />
        <label htmlFor="monday">จ</label>
        <input
          type="checkbox"
          id="tuesday"
          name="days"
          value="T"
          checked={formData.days.includes("T")}
          onChange={handleChange}
        />
        <label htmlFor="tuesday">อ</label>
        <input
          type="checkbox"
          id="wednesday"
          name="days"
          value="W"
          checked={formData.days.includes("W")}
          onChange={handleChange}
        />
        <label htmlFor="wednesday">พ</label>
        <input
          type="checkbox"
          id="thursday"
          name="days"
          value="R"
          checked={formData.days.includes("R")}
          onChange={handleChange}
        />
        <label htmlFor="thursday">พฤ</label>
        <input
          type="checkbox"
          id="friday"
          name="days"
          value="F"
          checked={formData.days.includes("F")}
          onChange={handleChange}
        />
        <label htmlFor="friday">ศ</label>
        <input
          type="checkbox"
          id="saturday"
          name="days"
          value="S"
          checked={formData.days.includes("S")}
          onChange={handleChange}
        />
        <label htmlFor="saturday">ส</label>
      </div>
      <button type="submit">ส่ง</button>
    </form>
  );
}

export default CreateClassrooms;
