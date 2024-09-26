//db.js
require("dotenv").config();

const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const saltRounds = 10; // รอบhash

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
});

let db = {};

// Global Password
db.getGlobalPassword = async () => {
  const query = "SELECT password FROM keytap WHERE id = 1";
  try {
    const results = await execute(query);
    if (results.length === 0) {
      throw new Error("Password not found in keytap table");
    }
    return results[0].password; // คืนรหัสผ่านที่แฮช
  } catch (error) {
    throw new Error(`Error fetching global password: ${error.message}`);
  }
};

db.setGlobalPassword = async (plainPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const query = `REPLACE INTO keytap (id, password) VALUES (1, ?)`;
    await execute(query, [hashedPassword]);
    console.log("Global password set successfully");
  } catch (error) {
    console.error("Error setting global password:", error);
  }
};

// Email Checking and User Management
db.checkEmailExists = (email) => {
  const query = ` 
    SELECT COUNT(*) AS count FROM teacher WHERE email = ?
    UNION
    SELECT COUNT(*) AS count FROM nisit WHERE email = ?`;
  return execute(query, [email, email]).then((result) => {
    const totalCount = result.reduce((sum, row) => sum + row.count, 0);
    return totalCount > 0; // ถ้าเจออีเมลในตารางใดตารางหนึ่งจะคืนค่า true
  });
};

db.deleteUserByEmail = async (email) => {
  const query = `DELETE FROM nisit WHERE email = ?`;
  try {
    const result = await execute(query, [email]);
    return result;
  } catch (err) {
    console.error("Database error:", err.message);
    throw new Error("Failed to delete user from database");
  }
};

db.updateUserData = async (
  userId,
  studentId,
  fname,
  lname,
  email,
  major,
  faculty
) => {
  try {
    const query = `
      UPDATE nisit
      SET studentId = ?, fname = ?, lname = ?, email = ?, major = ?, faculty = ?
      WHERE id = ?`;
    const result = await execute(query, [
      studentId,
      fname,
      lname,
      email,
      major,
      faculty,
      userId,
    ]);
    return result;
  } catch (err) {
    throw new Error("Database query failed: " + err.message);
  }
};

// Fetching Student Data
db.getAllNisitData = async (email) => {
  const query = `
    SELECT id, studentId, fname, lname, email, major, faculty
    FROM nisit
    WHERE email = ?`;
  return await execute(query, [email]);
};

// User Registration
db.registerUser = (email, password, role, fname, lname) => {
  const query = `INSERT INTO teacher (email, password, role, fname, lname) VALUES (?, ?, ?, ?, ?)`;
  return execute(query, [email, password, role, fname, lname]);
};

db.registerNisit = (
  email,
  password,
  fname,
  lname,
  role,
  major,
  faculty,
  studentId
) => {
  const query = `INSERT INTO nisit (email, password, fname, lname, role, major, faculty, studentId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  return execute(query, [
    email,
    password,
    fname,
    lname,
    role,
    major,
    faculty,
    studentId,
  ]);
};

// User Authentication and Password Reset
db.getUserByEmail = async (email) => {
  const query = `
    SELECT email, id, password, role FROM nisit WHERE email = ?
    UNION
    SELECT email, id, password, role FROM teacher WHERE email = ?`;
  const results = await execute(query, [email, email]);
  return results.length > 0 ? results[0] : null;
};

db.update_forgot_password_token = (id, token) => {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000).toISOString();
  const query = `INSERT INTO reset_tokens(token, created_at, expires_at, user_id)
                 VALUES(?, ?, ?, ?)`;
  return execute(query, [token, createdAt, expiresAt, id]);
};

db.check_email = (email) => {
  const query = `SELECT * FROM nisit WHERE email = ?`;
  return execute(query, [email]);
};

db.get_password_reset_token = (id) => {
  const query = `SELECT token, expires_at FROM reset_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;
  return execute(query, [id]);
};

db.update_password_reset_token = (id) => {
  const query = `DELETE FROM reset_tokens WHERE user_id = ?`;
  return execute(query, [id]);
};

db.update_user_password = (id, password) => {
  const query = `UPDATE teacher SET password = ? WHERE id = ?`;
  return execute(query, [password, id]);
};

// Adding Attendance History
db.addAttendanceHistory = async (studentId, classroomId, date, status) => {
  const query = `
    INSERT INTO attendance_history (student_id, classroom_id, date, status)
    VALUES (?, ?, ?, ?);
  `;
  try {
    const result = await execute(query, [studentId, classroomId, date, status]);
    return result;
  } catch (error) {
    throw new Error(`Error adding attendance history: ${error.message}`);
  }
};

// Retrieving Attendance History
db.getAttendanceHistory = async (studentId) => {
  const query = `
    SELECT * FROM attendance_history WHERE student_id = ?;
  `;
  try {
    const rows = await execute(query, [studentId]);
    return rows;
  } catch (error) {
    throw new Error(`Error fetching attendance history: ${error.message}`);
  }
};

// Adding a Student to a Classroom
db.addClassroomMember = async (classroomId, studentId) => {
  const query = `
    INSERT INTO classroom_members (classroom_id, student_id)
    VALUES (?, ?);
  `;
  try {
    const result = await execute(query, [classroomId, studentId]);
    return result;
  } catch (error) {
    throw new Error(`Error adding student to classroom: ${error.message}`);
  }
};

// Retrieving Classroom Members
db.getClassroomMembers = async (classroomId) => {
  const query = `
    SELECT * FROM classroom_members WHERE classroom_id = ?;
  `;
  try {
    const rows = await execute(query, [classroomId]);
    return rows;
  } catch (error) {
    throw new Error(`Error fetching classroom members: ${error.message}`);
  }
};

//Update data
async function updateTeacherData(teacherId, fname, lname, email) {
  const query = `
    UPDATE teachers 
    SET fname = ?, lname = ?, email = ? 
    WHERE id = ?
  `;
  const values = [fname, lname, email, teacherId];

  return await db.query(query, values);
}

db.createClassroom = async ({
  days,
  endTime,
  group,
  room,
  startTime,
  subject,
  type,
}) => {
  const query = `
    INSERT INTO classrooms (days, endTime, \`group\`, room, startTime, subject, type)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    JSON.stringify(days),
    endTime,
    group,
    room,
    startTime,
    subject,
    type,
  ];

  try {
    const result = await execute(query, values);
    return result.insertId; // ส่งกลับ ID ของห้องเรียนที่สร้างใหม่
  } catch (error) {
    throw new Error(`Error creating classroom: ${error.message}`);
  }
};

// Retrieving Classrooms for a Teacher
db.getClassrooms = async (teacherId) => {
  const query = `
    SELECT * FROM classrooms WHERE teacher_id = ?;
  `;
  try {
    const rows = await execute(query, [teacherId]);
    return rows;
  } catch (error) {
    throw new Error(`Error fetching classrooms: ${error.message}`);
  }
};

// Updating Classroom Information
db.updateClassroom = async (classroomId, name, subject) => {
  const query = `
    UPDATE classrooms
    SET name = ?, subject = ?
    WHERE id = ?;
  `;
  try {
    const result = await execute(query, [name, subject, classroomId]);
    return result;
  } catch (error) {
    throw new Error(`Error updating classroom: ${error.message}`);
  }
};

// Deleting a Classroom
db.deleteClassroom = async (classroomId) => {
  const query = `
    DELETE FROM classrooms WHERE id = ?;
  `;
  try {
    const result = await execute(query, [classroomId]);
    return result;
  } catch (error) {
    throw new Error(`Error deleting classroom: ${error.message}`);
  }
};

const execute = (query, params) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
};

module.exports = db;
