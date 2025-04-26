import { useState } from "react";
import { Navigate } from "react-router-dom";

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
  Select,
  InputLabel,
  MenuItem,
  FormControl,
} from "@mui/material";
import SpinningLogo from "./SpinningLogo";
import api from "./Api";

const SignUp = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [redirect, setRedirect] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    general: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Validate email on change
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setErrors({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      general: "",
    }); // Clear previous errors

    // Check email validity and password match before submission
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    console.log("Signup submitted", { email, password });

    // Basic validation
    if (!username) {
      setErrors((prev) => ({ ...prev, username: "UserName is required" }));
      setIsLoading(false);
      return;
    }
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      setIsLoading(false);
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      setIsLoading(false);
      return;
    }
    if (!role) {
      setErrors((prev) => ({ ...prev, role: "Role is required" }));
      setIsLoading(false);
      return;
    }

    const data = {
      username,
      email: email,
      passwordHash: password,
      role,
    };

    try {
      //console.log("SignUp: Sending to", endpoint, "with data:", data);
      const response = await api.register(data);
      if (response.Succeeded) {
        setMessage("Please check your email for confirmation link");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.Message,
        }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message }));
    }
    setIsLoading(false);
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
          sx={{
            padding: "5px",
          }}
        >
          <div className="flex">
            <SpinningLogo />
            <Typography variant="h3" component="h3" align="center" gutterBottom>
              Sign Up
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
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              required
              error={!!emailError}
              helperText={emailError}
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
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <Alert severity="warning">{errors.confirmPassword}</Alert>
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel id="demo-simple-select-helper-label">Role</InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"Member"}>Member</MenuItem>
                <MenuItem value={"Admin"}>Admin</MenuItem>
              </Select>
              {errors.role && <Alert severity="warning">{errors.role}</Alert>}
            </FormControl>

            {errors.general && <Alert severity="error">{errors.general}</Alert>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-4 py-3 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "Registering..." : "Sign Up"}
            </Button>
            {message && (
              <Typography
                variant="subtitle2"
                component="p"
                className="text-center text-sm"
              >
                {message}
              </Typography>
            )}

            <Typography className="mt-4 text-center">
              Already have an account?{"  "}
              <a
                href="/login"
                className="text-blue-500"
                onClick={() => onSuccess()}
              >
                Login
              </a>
              {/* <Link href="/login" underline="hover">
                Login
              </Link> */}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
