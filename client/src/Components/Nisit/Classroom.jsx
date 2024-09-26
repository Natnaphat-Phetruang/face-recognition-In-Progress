import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";

function JoinClassroom() {
  const [classCode, setClassCode] = useState("");

  const handleJoinClassroom = () => {
    if (classCode.trim() === "") {
      alert("Please enter a valid classroom code.");
      return;
    }
    console.log("Joining classroom with code:", classCode);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <ClassIcon
          sx={{
            fontSize: 50,
            color: "#3f51b5",
            marginBottom: 2,
          }}
        />
        <Typography variant="h5" gutterBottom>
          Join a Classroom
        </Typography>
        <TextField
          variant="outlined"
          label="Classroom Code"
          fullWidth
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          sx={{
            marginBottom: 3,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleJoinClassroom}
          sx={{
            backgroundColor: "#3f51b5",
            "&:hover": {
              backgroundColor: "#303f9f",
            },
          }}
        >
          Join
        </Button>
      </Paper>
    </Box>
  );
}

export default JoinClassroom;
