import { Container, Paper, Typography, Button, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
  const handleLogin = () => {
    window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
  };

  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 5,
          borderRadius: 3,
          textAlign: "center",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to Letterly ✉️
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          Sign in to create and manage your letters.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={handleLogin}
          sx={{ width: "100%", padding: 1 }}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
