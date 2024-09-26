import { json, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  TextField,
  Box,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
function NisitRegister() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
    return emailPattern.test(email);
  };

  const [errors, setErrors] = useState({
    emailError: "",
    lengthError: "",
    uppercaseError: "",
    specialCharError: "",
  });

  const validatePassword = (password) => {
    const lengthValid = password.length === 10;

    let lengthError = "";

    if (!lengthValid) {
      lengthError = "Student ID number must include 10 numbers.";
    }
    setErrors({
      lengthError,
    });
    return lengthValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const emailValid = validateEmail(email);
    if (!emailValid) {
      toast.error("Please enter a valid email address", {
        autoClose: 1000,
        position: "top-center",
      });
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    setErrors({
      lengthError: "",
    });

    try {
      // Check if email already exists
      const emailCheckResponse = await axios.post(
        "http://localhost:3333/check_email",
        { email }
      );

      const emailCheckData = emailCheckResponse.data;

      if (emailCheckData.emailExists) {
        setResult("This email ");
        return;
      }

      const jsonData = {
        email: data.get("email"),
        password: data.get("password"),
        fname: data.get("fname"),
        lname: data.get("lname"),
        faculty: data.get("faculty"),
        major: data.get("major"),
      };

      // Register the user
      const registerResponse = await axios.post(
        "http://localhost:3333/registernisit",
        jsonData
      );

      const registerData = registerResponse.data;

      if (registerData.status === "success") {
        toast.success("Register successfully", {
          autoClose: 900,
          position: "top-center",
        });
        setTimeout(() => {
          navigate("/NisitLogin");
        }, 1500);
      } else {
        toast.error("This email address is already in use.", {
          autoClose: 1000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during registration", {
        autoClose: 1000,
        position: "top-center",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "aliceblue",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 3, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
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
                />
              </Grid>

              {/* Row 2 */}
              <Grid item xs={6}>
                <TextField
                  label="Faculty"
                  name="faculty"
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
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
                />
              </Grid>

              {/* Row 3 */}
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
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

              {/* Row 4 */}
              <Grid item xs={12}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    label="Student ID"
                    name="password"
                    type=""
                    fullWidth
                    required
                    variant="outlined"
                    margin="dense"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.lengthError}
                    helperText={errors.lengthError}
                    inputProps={{ maxLength: 10 }}
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
          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Link
              to="/Nisitlogin"
              style={{ textDecoration: "none", color: "blue" }}
            >
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
export default NisitRegister;
