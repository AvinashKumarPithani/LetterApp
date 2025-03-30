import React from "react";
import { Button, Typography, Paper, Box } from "@mui/material";

const Login = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google"; // Redirect to Google OAuth
  };

  return (
    <Box
      sx={{
        position: "fixed",  // Ensures full coverage
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          padding: 4,
          width: 350,
          textAlign: "center",
          borderRadius: 3,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" gutterBottom>
          LetterApp
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
          Sign in to continue
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ width: "100%", padding: 1, borderRadius: 2 }}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
