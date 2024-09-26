//Appapi.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("./db");
const crypto = require("crypto");
const { sendEmail, mailTemplate } = require("./utils/email");

dotenv.config();

const app = express();
const jsonParser = bodyParser.json();
const saltRounds = 10;
const secret = process.env.API_KEY || "API_KEY_2024";
const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);
const classroomRoutes = require("./Api_create");

app.use(cors());
app.use(express.json());
app.use("/api", classroomRoutes);

// Endpoint  Verify identity (teacher)
app.post("/verify_password", jsonParser, async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await db.getGlobalPassword();
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "error", message: "Incorrect password" });
    }
  } catch (err) {
    console.error("Server error:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Server error: " + err.message });
  }
});

// Remove user
app.delete("/userdelete", jsonParser, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { email } = req.body;

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    jwt.verify(token, secret);
    const result = await db.deleteUserByEmail(email);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the user",
    });
  }
});

// Update user profile
app.put("/users/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = req.params.id;
  const { fname, lname, email, major, faculty, studentId } = req.body;

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    jwt.verify(token, secret);
    const result = await db.updateUserData(
      userId,
      studentId,
      fname,
      lname,
      email,
      major,
      faculty
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "success", message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating data:", err.message);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});

// Get user profile
app.get("/users", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const email = decoded.email;
    const users = await db.getAllNisitData(email);

    if (!users.length) {
      return res
        .status(404)
        .json({ status: "error", message: "No users found" });
    }

    res.json(users);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});

// Update teacher profile
app.put("/teachers", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { fname, lname, email } = req.body;

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, secret);
    const teacherId = decoded.id; // ใช้ teacherId จาก token

    // ทำการอัพเดตข้อมูลโดยใช้ teacherId
    const result = await db.updateTeacherData(teacherId, fname, lname, email);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Teacher not found" });
    }

    res.json({ status: "success", message: "Teacher updated successfully" });
  } catch (err) {
    console.error("Error updating teacher:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Error updating teacher data" });
  }
});

// Authentication endpoint
app.post("/Authen", jsonParser, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret);

    res.json({ status: "success", decoded, email: decoded.email });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// Login endpoint
app.post("/login", jsonParser, async (req, res) => {
  try {
    const user = await db.getUserByEmail(req.body.email);

    if (!user) {
      return res.json({ status: "error", message: "User not found" });
    }

    if (!user.role) {
      return res.json({ status: "error", message: "User role not found" });
    }

    const isLogin = await bcrypt.compare(req.body.password, user.password);
    if (isLogin) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: "24h" }
      );
      res.json({
        status: "success",
        message: "Login Success",
        token,
        email: user.email,
        role: user.role,
        id: user.id,
      });
    } else {
      res.json({ status: "error", message: "Invalid Password" });
    }
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// Registration for student
app.post("/registernisit", jsonParser, async (req, res) => {
  try {
    const { email, password, fname, lname, major, faculty, studentId } =
      req.body;
    const emailExists = await db.checkEmailExists(email);

    if (emailExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.registerNisit(
      email,
      hashedPassword,
      fname,
      lname,
      "nisit",
      major,
      faculty,
      studentId
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Registration for teacher
app.post("/registerteacher", jsonParser, async (req, res) => {
  try {
    const { email, password, fname, lname } = req.body;
    const emailExists = await db.checkEmailExists(email);

    if (emailExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.registerUser(email, hashedPassword, "teacher", fname, lname);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Password reset request
app.post("/forgotpassword", jsonParser, async function (req, res) {
  try {
    console.log("req.body.email", req.body.email);
    const email = req.body.email;
    const user = await db.getUserByEmail(email);
    console.log("req.body:", req.body);

    if (!user) {
      return res.json({
        success: false,
        message: "You are not registered!",
      });
    }

    const token = crypto.randomBytes(10).toString("hex"); //สร้าง token แบบสุ่มและแปลงเป็นรูปแบบ hex
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    // อัพเดทฐานข้อมูลสำหรับผู้ใช้ที่ตรงกับอีเมลส่งมา
    await db.update_forgot_password_token(user.id, resetToken);

    const mailOption = {
      email: email,
      subject: "Forgot Password Link",
      message: mailTemplate(
        "We have received a request to reset your password. Please reset your password using the link below.",
        `${process.env.FRONTEND_URL}/resetPassword?id=${user.id}&token=${resetToken}`,
        "Reset Password"
      ),
    };

    await sendEmail(mailOption);
    res.json({
      success: true,
      message: "A password reset link has been sent to your email.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
});

// Check if email exists
app.post("/check_email", async (req, res) => {
  const email = req.body.email;

  try {
    const existsInBothTables = await db.check_email(email);
    res.json({ emailExistsInBothTables: existsInBothTables });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Reset password
app.post("/resetPassword", jsonParser, async (req, res) => {
  const { password, token, userId } = req.body;

  try {
    const userToken = await db.get_password_reset_token(userId);

    if (!userToken || userToken.length === 0) {
      return res.json({ success: false, message: "Some problem occurred!" });
    }

    const currDateTime = new Date();
    const expiresAt = new Date(userToken[0].expires_at);

    if (currDateTime > expiresAt) {
      return res.json({
        success: false,
        message: "Reset Password link has expired!",
      });
    }

    if (userToken[0].token !== token) {
      return res.json({ success: false, message: "Invalid token!" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.updatePassword(userId, hashedPassword);
    await db.delete_forgot_password_token(userId);

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password.",
    });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
