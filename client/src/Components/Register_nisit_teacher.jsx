import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

const Register = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState("nisit");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState("");
  const [errors, setErrors] = useState({
    emailError: "",
    lengthError: "",
    uppercaseError: "",
    specialCharError: "",
    passwordVerificationError: "",
  });
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    major: "",
    faculty: "",
    studentId: "",
  });
  const [showPasswordVerification, setShowPasswordVerification] =
    useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === "teacher") {
      setShowPasswordVerification(true);
    } else {
      setShowPasswordVerification(false);
    }

    setFormData({
      fname: "",
      lname: "",
      major: "",
      faculty: "",
      studentId: "",
    });
    setEmail("");
    setPassword("");
    setErrors({
      emailError: "",
      lengthError: "",
      uppercaseError: "",
      specialCharError: "",
      passwordVerificationError: "",
    });
  };

  const handlePasswordVerification = async () => {
    if (!password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        passwordVerificationError: "Password is required",
      }));
      return; // หยุดการทำงานของฟังก์ชันถ้ารหัสผ่านไม่ได้กรอก
    }

    try {
      const response = await axios.post(
        "http://localhost:3333/verify_password",
        { password }
      );

      if (response.data.status === "success") {
        toast.success("Password verification successful.", {
          autoClose: 1000,
          position: "top-center",
        });

        // รอจนกว่า toast จะแสดงเสร็จ
        setTimeout(() => {
          setTabValue("teacher");
          setShowPasswordVerification(false);
          setPassword("");
        }, 600); // เวลาหน่วงก่อนเปลี่ยนหน้า
      } else if (response.data.status === "error") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          passwordVerificationError: "Incorrect password. ",
        }));
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data.message);
        toast.error(`Error: ${error.response.data.message}`, {
          autoClose: 1000,
          position: "top-center",
        });
      }
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@ku\.th$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const lengthValid = password.length >= 6;
    const uppercaseValid = /[A-Z]/.test(password);
    const specialCharValid = /[\W_]/.test(password);

    let lengthError = "";
    let uppercaseError = "";
    let specialCharError = "";

    if (!lengthValid) {
      lengthError = "Password must be at least 6 characters.";
    } else if (!uppercaseValid) {
      uppercaseError = "Password must contain at least one uppercase letter.";
    } else if (!specialCharValid) {
      specialCharError =
        "Password must contain at least one special character.";
    }

    setErrors({
      lengthError,
      uppercaseError,
      specialCharError,
    });

    return lengthValid && uppercaseValid && specialCharValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (showPasswordVerification) {
      handlePasswordVerification();
      return;
    }

    const emailValid = validateEmail(email);
    if (!emailValid) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        emailError: "Please use your @ku.th email address.",
      }));
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    try {
      // ตรวจสอบว่าอีเมลมีอยู่ในฐานข้อมูลไหม
      const emailCheckResponse = await axios.post(
        "http://localhost:3333/check_email",
        { email }
      );
      const emailCheckData = emailCheckResponse.data;

      if (emailCheckData.emailExists) {
        setResult("This email address is already in use.");
        return;
      }

      // กำหนดข้อมูลที่ต้องการส่ง
      const jsonData = {
        email,
        password,
        fname: formData.fname,
        lname: formData.lname,
        ...(tabValue === "nisit" && {
          major: formData.major,
          faculty: formData.faculty,
          studentId: formData.studentId,
        }),
      };

      // เรียก API
      const registerResponse = await axios.post(
        `http://localhost:3333/${
          tabValue === "nisit" ? "registernisit" : "registerteacher"
        }`,
        jsonData
      );
      const registerData = registerResponse.data;

      if (registerData.status === "success") {
        toast.success("Register successfully", {
          autoClose: 900,
          position: "top-center",
        });
        setTimeout(() => {
          navigate("/Login");
        }, 1500);
      } else {
        toast.error("Registration failed: " + registerData.message, {
          autoClose: 1000,
          position: "top-center",
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.message;

        if (serverMessage === "Email already exists") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            emailError: "This email address is already in use.",
          }));
        } else {
          toast.error(serverMessage, {
            autoClose: 1000,
            position: "top-center",
          });
        }
      } else {
        toast.error("An error occurred during registration", {
          autoClose: 1000,
          position: "top-center",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 3, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="register tabs"
          >
            <Tab label="Nisit" value="nisit" />
            <Tab label="Teacher" value="teacher" />
          </Tabs>
          {showPasswordVerification ? (
            <Box mt={2}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Confirm Password"
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.passwordVerificationError}
                helperText={errors.passwordVerificationError}
                InputProps={{
                  endAdornment: (
                    <div
                      onClick={() => setVisible(!visible)}
                      style={{ cursor: "pointer" }}
                    >
                      {visible ? (
                        <EyeOutlined className="icon" />
                      ) : (
                        <EyeInvisibleOutlined className="icon" />
                      )}
                    </div>
                  ),
                }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handlePasswordVerification}
                sx={{ mt: 2 }}
              >
                Verify Password
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Row 1 */}
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    name="fname"
                    fullWidth
                    required
                    variant="outlined"
                    margin="dense"
                    value={formData.fname}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    name="lname"
                    fullWidth
                    required
                    variant="outlined"
                    margin="dense"
                    value={formData.lname}
                    onChange={handleChange}
                  />
                </Grid>

                {tabValue === "nisit" && (
                  <>
                    {/* Row 2 */}
                    <Grid item xs={6}>
                      <TextField
                        label="Faculty"
                        name="faculty"
                        fullWidth
                        required
                        variant="outlined"
                        margin="dense"
                        value={formData.faculty}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Major"
                        name="major"
                        fullWidth
                        required
                        variant="outlined"
                        margin="dense"
                        value={formData.major}
                        onChange={handleChange}
                      />
                    </Grid>
                    {/* Row 3 */}
                    <Grid item xs={12}>
                      <TextField
                        label="Student ID"
                        name="studentId"
                        fullWidth
                        required
                        variant="outlined"
                        margin="dense"
                        value={formData.studentId || ""}
                        onChange={handleChange}
                      />
                    </Grid>
                  </>
                )}

                {/* Row 4 */}
                <Grid item xs={12}>
                  <TextField
                    label="Email @ku.th"
                    name="email"
                    fullWidth
                    required
                    variant="outlined"
                    margin="dense"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.emailError}
                    helperText={errors.emailError}
                  />
                </Grid>

                {/* Row 5 */}
                <Grid item xs={12}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      label="Password"
                      name="password"
                      type={visible ? "text" : "password"}
                      fullWidth
                      required
                      variant="outlined"
                      margin="dense"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={
                        !!errors.lengthError ||
                        !!errors.uppercaseError ||
                        !!errors.specialCharError
                      }
                      helperText={
                        errors.lengthError ||
                        errors.uppercaseError ||
                        errors.specialCharError
                      }
                      InputProps={{
                        endAdornment: (
                          <div
                            onClick={() => setVisible(!visible)}
                            style={{ cursor: "pointer" }}
                          >
                            {visible ? (
                              <EyeOutlined className="icon" />
                            ) : (
                              <EyeInvisibleOutlined className="icon" />
                            )}
                          </div>
                        ),
                      }}
                    />
                  </div>
                </Grid>

                {result && (
                  <Grid item xs={12}>
                    <Alert severity="error">{result}</Alert>
                  </Grid>
                )}
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
            </form>
          )}
          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Link to="/Login" style={{ textDecoration: "none", color: "blue" }}>
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
