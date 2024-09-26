require("dotenv").config({ path: "Project_comsci/server/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const db = require("./db");
const jwt = require("jsonwebtoken");
const secret = process.env.API_KEY || "API_KEY_2024";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ตรวจสอบ token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ status: "error", message: "Token is invalid" });
    }
    req.user = user; // เก็บข้อมูล
    next();
  });
};

// Middleware ตรวจสิทธิ์ผู้ใช้
const authorizeTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res
      .status(403)
      .json({ status: "error", message: "You do not have permission" });
  }
  next();
};

//เพิ่มห้องเรียน;
router.post(
  "/classroom",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const {
      // code,
      teacher_id,
      days,
      endTime,
      group,
      room,
      startTime,
      subject,
      type,
    } = req.body;

    // ตรวจสอบว่าฟิลด์ที่จำเป็นทั้งหมดมีอยู่
    if (
      // !code ||
      !teacher_id ||
      !days ||
      !endTime ||
      !group ||
      !room ||
      !startTime ||
      !subject ||
      !type
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    // ตรวจสอบว่า teacher_id  ตรงกับ id ที่ได้จาก token
    if (teacher_id !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to create this classroom",
      });
    }
    try {
      // สร้างห้องเรียน
      const classroomId = await db.createClassroom({
        // code,
        teacher_id,
        days,
        endTime,
        group,
        room,
        startTime,
        subject,
        type,
      });

      res.json({
        status: "success",
        message: "Classroom created",
        classroomId,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// เพิ่มสมาชิกเข้าห้องเรียน
router.post(
  "/classroom/:classroomId/member",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const { studentId } = req.body;
    const classroomId = req.params.classroomId;

    try {
      await db.addClassroomMember(classroomId, studentId);
      res.json({ status: "success", message: "Member added to classroom" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ดึงสมาชิกในห้องเรียน
router.get(
  "/classroom/:classroomId/members",
  authenticateToken,
  async (req, res) => {
    const classroomId = req.params.classroomId;

    try {
      const members = await db.getClassroomMembers(classroomId);
      if (!members.length) {
        return res
          .status(404)
          .json({ status: "error", message: "No members found" });
      }
      res.json(members);
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ลบสมาชิกออกจากห้องเรียน
router.delete(
  "/classroom/:classroomId/member/:studentId",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const classroomId = req.params.classroomId;
    const studentId = req.params.studentId;

    try {
      await db.removeClassroomMember(classroomId, studentId);
      res.json({ status: "success", message: "Member removed from classroom" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ดึงข้อมูลห้องเรียน
router.get("/classroom/:classroomId", authenticateToken, async (req, res) => {
  const classroomId = req.params.classroomId;

  try {
    const classroom = await db.getClassroomById(classroomId);
    if (!classroom) {
      return res
        .status(404)
        .json({ status: "error", message: "Classroom not found" });
    }
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// อัปเดตข้อมูลห้องเรียน
router.put(
  "/classroom/:classroomId",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const classroomId = req.params.classroomId;
    const { name, subject } = req.body;

    try {
      await db.updateClassroom(classroomId, name, subject);
      res.json({
        status: "success",
        message: "Classroom updated successfully",
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ลบห้องเรียน
router.delete(
  "/classroom/:classroomId",
  authenticateToken,
  authorizeTeacher,
  async (req, res) => {
    const classroomId = req.params.classroomId;

    try {
      const members = await db.getClassroomMembers(classroomId);
      if (members.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Cannot delete classroom with members",
        });
      }

      await db.deleteClassroom(classroomId);
      res.json({
        status: "success",
        message: "Classroom deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// ลบนิสิตออกจากห้องเรียน
router.delete(
  "/classroom/:classroomId/member/self",
  authenticateToken,
  async (req, res) => {
    const classroomId = req.params.classroomId;
    const studentId = req.user.id; // ใช้ ID นิสิต token

    try {
      await db.removeClassroomMember(classroomId, studentId);
      res.json({ status: "success", message: "You have left the classroom" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

module.exports = router;
