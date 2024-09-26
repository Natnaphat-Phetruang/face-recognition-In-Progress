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

const TeacherSettings = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userEmail = localStorage.getItem("userEmail");
        const response = await axios.get(`http://localhost:3333/teachers/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const teacherResponse = await axios.get(
          `http://localhost:3333/teachers/${userEmail}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeacher(teacherResponse.data);
        setFormData({
          fname: teacherResponse.data.fname,
          lname: teacherResponse.data.lname,
          email: teacherResponse.data.email,
        });
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3333/teachers/${teacher.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the teacher data after editing
      setTeacher({ ...teacher, ...formData });
      setEditMode(false);
    } catch (error) {
      setError("Error updating data");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      fname: teacher.fname,
      lname: teacher.lname,
      email: teacher.email,
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Teacher Settings
      </Typography>
      <Paper style={{ padding: "20px" }}>
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
                InputProps={{ readOnly: !editMode }}
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
                InputProps={{ readOnly: !editMode }}
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
              {editMode ? (
                <>
                  <Button variant="contained" color="primary" type="submit">
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    style={{ marginLeft: "10px" }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TeacherSettings;
