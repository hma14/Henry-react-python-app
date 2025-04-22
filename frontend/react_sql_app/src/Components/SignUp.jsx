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

const SignUp = ({ endpoint }) => {
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
      return;
    }
    console.log("Signup submitted", { email, password });

    // Basic validation
    if (!username) {
      setErrors((prev) => ({ ...prev, username: "UserName is required" }));
      return;
    }
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }
    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }
    if (!role) {
      setErrors((prev) => ({ ...prev, role: "Role is required" }));
      return;
    }

    const data = {
      username,
      email: { value: email },
      passwordHash: password,
      role,
    };

    try {
      //console.log("SignUp: Sending to", endpoint, "with data:", data);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setRedirect(true);
      } else {
        const errorData = await response.json(); // <-- Await this!
        const errorMessage = errorData.message || JSON.stringify(errorData);

        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message }));
    }
  };

  if (redirect) {
    return (
      <Navigate
        to="/login"
        state={{ successMessage: "Account created! Please log in." }}
        replace
      />
    );
  }

  return (
    <Container
      maxWidth="sm"
      className="min-h-screen flex items-center justify-center"
      sx={{ mt: "10px" }}
    >
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Box
          className="flex flex-col items-center mb-4"
          sx={{
            padding: "5px",
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
          }}
        >
          <div className="flex">
            <Avatar
              //src="%PUBLIC_URL%/LottoTryLogo.png"
              src="./LottoTryLogo.png"
              alt="LottoTry"
              sx={{ width: 60, height: 60, marginRight: 2 }}
            />
            <Typography
              sx={{ display: "inline" }}
              variant="h3"
              component="h3"
              align="center"
              gutterBottom
            >
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
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-helper-label">Role</InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={role}
                label="Role"
                fullWidth
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={1}>Member</MenuItem>
                <MenuItem value={2}>Admin</MenuItem>
              </Select>
              {errors.role && <Alert severity="warning">{errors.role}</Alert>}
            </FormControl>

            {errors.general && <Alert severity="error">{errors.general}</Alert>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="mt-4 py-3"
              onClick={handleSubmit}
            >
              Sign Up
            </Button>
            <Typography className="mt-4 text-center">
              Already have an account?{"  "}
              <Link href="/login" underline="hover">
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
