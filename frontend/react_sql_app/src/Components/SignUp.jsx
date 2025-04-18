import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

const SignUp = ({ endpoint }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [redirect, setRedirect] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: "", email: "", password: "", role: "", general: "" }); // Clear previous errors

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
    <div
      style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
    >
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: "100%", padding: "8px" }}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ width: "100%", padding: "8px" }}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: "8px" }}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            className={errors.role ? "input-error" : ""}
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && <p className="error">{errors.role}</p>}
        </div>

        {errors.general && (
          <p className="error general-error">{errors.general}</p>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          Sign Up
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default SignUp;
