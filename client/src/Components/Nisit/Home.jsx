import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { styled } from "@mui/system";

const AnnouncementBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: "#424242",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)",
  },
}));

function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f9f9f9",
        p: 30,
      }}
    >
      {/* Subject Area */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
          mb: 8, // margin-bottom
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{ fontWeight: "bold", color: "#000" }}
        >
          Document
        </Typography>
      </Box>

      {/* Announcement Area */}
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <AnnouncementBox>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#000" }}
            >
              Important Announcement
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This is where you can put important announcements or messages for
              users. Make sure your message is clear and engaging to ensure that
              it grabs attention.
            </Typography>
          </AnnouncementBox>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
