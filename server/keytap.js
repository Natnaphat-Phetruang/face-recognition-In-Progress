require("dotenv").config({ path: "Project_comsci/server/.env" }); // โหลดการตั้งค่าจากไฟล์ .env

const db = require("./db"); // นำเข้า db.js

const globalPassword = process.env.GLOBAL_PASSWORD;

if (!globalPassword) {
  console.error("Global password not found in environment variables.");
  process.exit(1);
}

// ตั้งค่ารหัสผ่าน
db.setGlobalPassword(globalPassword)
  .then(() => {
    console.log("Password updated successfully.");
  })
  .catch((error) => {
    console.error("Failed to update password:", error);
  });
