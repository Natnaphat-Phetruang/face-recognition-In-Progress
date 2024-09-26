import { React } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockResetIcon from "@mui/icons-material/LockReset";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Card, CardContent } from "@mui/material";
import { toast } from "react-toastify";
import { useState } from "react";

import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  let navigate = useNavigate();
  const userId = searchParams.get("id");
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    lengthError: "",
    uppercaseError: "",
    specialCharError: "",
    matchError: "",
  });

  const validatePassword = (password) => {
    const lengthValid = password.length >= 6;
    const uppercaseValid = /[A-Z]/.test(password);
    const specialCharValid = /[\W_]/.test(password);

    let lengthError = "";
    let uppercaseError = "";
    let specialCharError = "";

    if (!lengthValid) {
      lengthError = "Password must be at least 6 characters";
    } else if (!uppercaseValid) {
      uppercaseError = "Password must include at least one uppercase letter";
    } else if (!specialCharValid) {
      specialCharError = "Password must include at least one special character";
    }

    setErrors({
      ...errors,
      lengthError,
      uppercaseError,
      specialCharError,
    });

    return lengthValid && uppercaseValid && specialCharValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isPasswordValid = validatePassword(newPassword);
    const isPasswordMatch = newPassword === confirmPassword;

    if (!isPasswordValid) {
      return;
    }

    if (!isPasswordMatch) {
      setErrors({
        ...errors,
        matchError: "New Password and Confirm Password do not match",
      });
      return;
    }

    // Clear errors
    setErrors({
      lengthError: "",
      uppercaseError: "",
      specialCharError: "",
      matchError: "",
    });

    const url = "http://localhost:3333/resetPassword";
    const res = await axios.post(url, {
      password: newPassword,
      token: token,
      userId: userId,
    });
    if (res.data.success === false) {
      toast.error(res.data.message, {
        autoClose: 2000,
        position: "top-center",
      });
    } else {
      toast.success(res.data.message, {
        autoClose: 2000,
        position: "top-center",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2200);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ boxShadow: "4" }}>
          <CardContent sx={{ m: 3 }}>
            <Avatar sx={{ m: "auto", bgcolor: "primary.main" }}>
              <LockResetIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
              Reset Password
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                name="newpassword"
                id="newpassword"
                label="New Password"
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                name="confirmpassword"
                id="confirmpassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.matchError}
                helperText={errors.matchError}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Submit
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ResetPassword;
