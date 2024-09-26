import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DisplayDataPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [joinedClassroomCode, setJoinedClassroomCode] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      navigate("/login");
      return;
    } else {
      setRole(storedRole);
    }

    const storedClassrooms =
      JSON.parse(localStorage.getItem("classrooms")) || [];
    setClassrooms(storedClassrooms);

    const storedCode = localStorage.getItem("joinedClassroomCode");
    setJoinedClassroomCode(storedCode);
  }, [navigate]);

  const handleDeleteClassroom = (code) => {
    const updatedClassrooms = classrooms.filter(
      (classroom) => classroom.code !== code
    );
    setClassrooms(updatedClassrooms);
    localStorage.setItem("classrooms", JSON.stringify(updatedClassrooms));

    if (joinedClassroomCode === code) {
      localStorage.removeItem("joinedClassroomCode");
      setJoinedClassroomCode(null);
      alert("คุณออกจากห้องเรียนที่ถูกลบ");
    } else {
      alert("ห้องเรียนถูกลบเรียบร้อยแล้ว");
    }
  };

  const handleLeaveClassroom = () => {
    localStorage.removeItem("joinedClassroomCode");
    setJoinedClassroomCode(null);
    alert("คุณออกจากห้องเรียนเรียบร้อยแล้ว");
  };

  return (
    <div>
      <h2>ข้อมูลห้องเรียน</h2>
      <div className="container">
        {classrooms
          .filter((classroom) => {
            if (role === "student") {
              return classroom.code === joinedClassroomCode;
            }
            return true; // ครูเห็นห้องเรียนทั้งหมด
          })
          .map((classroom, index) => (
            <div className="card" key={index}>
              <img
                src="path/to/your/image.jpg"
                alt="Classroom"
                className="classroom-image"
              />
              <div className="card-content">
                <h3>{classroom.subject}</h3>
                <p>กลุ่มเรียน: {classroom.group}</p>
                <p>ห้องเรียน: {classroom.room}</p>
                <p>วัน: {classroom.days.join(", ")}</p>
                <p>ประเภท: {classroom.type}</p>
                <p>รหัสห้องเรียน: {classroom.code}</p>

                {role === "teacher" && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClassroom(classroom.code)}
                  >
                    ลบห้องเรียน
                  </button>
                )}

                {role === "student" && (
                  <button className="leave-btn" onClick={handleLeaveClassroom}>
                    ออกจากห้องเรียน
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default DisplayDataPage;
