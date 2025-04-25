import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
import Dashboard from "./Dashboard";

const Login = ({ endpoint }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigateRef = useRef();

  /*   useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: "", password: "" });

    if (!username) {
      setErrors((prev) => ({ ...prev, username: "UserName is required" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    try {
      console.log("Login: Sending to", endpoint, "with data:", {
        username,
        password,
      });
      const response = await api.login(username, password);

      if (response.success) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        console.log("Login: Tokens stored, redirecting");

        //setRedirect(true);

        /* setTimeout(() => setRedirect(true), 1000);
        //return redirect ? <Navigate to="/dashboard" replace /> : null;
        return redirect ? navigate("/dashboard") : null; */

        window.location.href = "/dashboard";

        //setTimeout(() => navigateRef.current("/dashboard"), 1000);
      } else {
        const errorMessage = response.message || JSON.stringify(response);

        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message }));
    }
    //return submitSuccess ? <Navigate to="/dashboard" replace /> : null;
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
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {errors.username && (
              <Alert severity="warning">{errors.username}</Alert>
            )}
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
            >
              Login
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
