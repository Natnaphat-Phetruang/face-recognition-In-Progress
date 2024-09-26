import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from "@mui/material";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    major: "",
    faculty: "",
    studentId: "",
  });
  const [studentIdError, setStudentIdError] = useState(""); // เก็บข้อความแจ้งเตือน

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3333/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      major: user.major,
      faculty: user.faculty,
      studentId: user.studentId,
    });
    setStudentIdError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // ตรวจความถูกต้อง studentId
    if (name === "studentId") {
      if (!/^\d{10}$/.test(value)) {
        setStudentIdError("Student ID must be a 10-digit number");
      } else {
        setStudentIdError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (studentIdError) {
      return; // หยุดถ้ามีข้อผิดพลาดในฟิลด์ studentId
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3333/users/${editUser.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // รีเฟรชข้อมูลหลังจากการอัปเดต
      const response = await axios.get("http://localhost:3333/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setEditUser(null);
      setFormData({
        fname: "",
        lname: "",
        email: "",
        major: "",
        faculty: "",
        studentId: "",
      });
    } catch (error) {
      setError("Error updating data");
    }
  };

  const handleBack = () => {
    setEditUser(null);
    setFormData({
      fname: "",
      lname: "",
      email: "",
      major: "",
      faculty: "",
      studentId: "",
    });
    setStudentIdError("");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        User List
      </Typography>
      {editUser && (
        <Paper style={{ padding: "20px", marginBottom: "20px" }}>
          <Typography variant="h6" gutterBottom>
            Edit User
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fname"
                  label="First Name"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lname"
                  label="Last Name"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="major"
                  label="Major"
                  value={formData.major}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="faculty"
                  label="Faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="studentId"
                  label="Student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  error={Boolean(studentIdError)}
                  helperText={studentIdError}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formData.email}
                  InputProps={{ readOnly: true }} // ฟิลด์ email ไม่สามารถแก้ไขได้
                  sx={{ backgroundColor: "lightgrey" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit">
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                  style={{ marginLeft: "10px" }}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      {!editUser && (
        <Paper style={{ padding: "20px" }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} key={user.id}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={user.fname}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={user.lname}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Major"
                      value={user.major}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Faculty"
                      value={user.faculty}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Student ID"
                      value={user.studentId}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user.email}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default UserList;
