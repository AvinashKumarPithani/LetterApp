import React, { useState, useEffect } from "react";
import { Container, Grid, Paper, Typography, Box, Button } from "@mui/material";
import LetterEditor from "./LetterEditor";
import LetterList from "./LetterList";
import LetterContent from "./LetterContent";
import axios from "axios";

const Dashboard = () => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [letterContent, setLetterContent] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#e0e0e0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "80%",
          padding: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2
          }}
        >
          <Typography variant="h4">Welcome {user?.displayName || "User"} 👋</Typography>
          <Button variant="contained" color="secondary" onClick={handleLogout}>Logout</Button>
        </Box>

        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          <Grid item xs={12} md={selectedLetter ? 3 : 6}>
            <LetterEditor user={user} />
          </Grid>
          <Grid item xs={12} md={selectedLetter ? 4.5 : 6}>
            <LetterList setSelectedLetter={setSelectedLetter} setLetterContent={setLetterContent} />
          </Grid>
          {selectedLetter && (
            <Grid item xs={12} md={4.5}>
              <LetterContent letterContent={letterContent} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
