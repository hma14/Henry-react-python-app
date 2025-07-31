import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "../index.css";
import "../App.css";

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Alert,
  Avatar,
} from "@mui/material";
import SpinningLogo from "./SpinningLogo";
import api from "./Api";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: "", password: "" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "UserName is required" }));
      setIsLoading(false);
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      setIsLoading(false);
      return;
    }

    try {
      console.log("Login: Sending to", "with data:", {
        email: email,
        password,
      });
      const response = await api.login(email, password);

      if (response.success) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        console.log("Login: Tokens stored, redirecting");

        window.location.href = "/";
      } else {
        const errorMessage = response.message || JSON.stringify(response);

        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
        setIsLoading(false);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message }));
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      className="min-h-screen flex items-center justify-center"
      sx={{ mt: "10px" }}
    >
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Box
          className="flex flex-col flex-nowrap items-center mb-4"
          sx={{ padding: "5px" }}
        >
          <div className="flex">
            <SpinningLogo />
            <Typography variant="h3" component="h1" align="center" gutterBottom>
              Login
            </Typography>
          </div>
          <Box component="div" onSubmit={handleSubmit} className="mt-4 w-full">
            <TextField
              label="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <Alert severity="warning">{errors.email}</Alert>}
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <Alert severity="warning">{errors.password}</Alert>
            )}
            {errors.general && <Alert severity="error">{errors.general}</Alert>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="mt-4 py-3"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={120} /> : "Login"}
            </Button>
            <Typography className="mt-4 text-center">
              Don't have an account?{" "}
              <Link href="/signup" underline="hover">
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
