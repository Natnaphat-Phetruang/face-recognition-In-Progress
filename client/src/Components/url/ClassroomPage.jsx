import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ClassroomPage() {
  const [hasJoinedClassroom, setHasJoinedClassroom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจlocale ว่าเคยเข้าร่วมห้องแล้วหรือยัง
    const joinedClassroom = localStorage.getItem("joinedClassroom");
    if (joinedClassroom) {
      setHasJoinedClassroom(true);
    }
  }, []);

  const handleCreateClassroom = () => {
    navigate("/create");
  };

  const handleJoinClassroom = () => {
    const classroomCode = prompt("กรุณาใส่รหัสห้องเรียน:");
    if (classroomCode) {
      // จำลองการเช็คการเข้าร่วมห้อง
      localStorage.setItem("joinedClassroom", classroomCode);
      setHasJoinedClassroom(true);
    }
  };

  return (
    <div>
      {!hasJoinedClassroom ? (
        <div>
          <h2>กรุณาเลือกการดำเนินการ</h2>
          <button onClick={handleCreateClassroom}>สร้างห้องเรียน</button>
          <button onClick={handleJoinClassroom}>เข้าร่วมห้องเรียน</button>
        </div>
      ) : (
        <div>
          <h2>คุณเข้าร่วมห้องเรียนแล้ว</h2>
          <button onClick={() => navigate("/display")}>
            ดูข้อมูลห้องเรียน
          </button>
        </div>
      )}
    </div>
  );
}

export default ClassroomPage;
