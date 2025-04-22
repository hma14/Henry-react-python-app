import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const responseData = await response.json();
      console.log("Login: Response:", responseData);
      if (response.ok) {
        localStorage.setItem("accessToken", responseData.accessToken);
        localStorage.setItem("refreshToken", responseData.refreshToken);
        console.log("Login: Tokens stored, redirecting");
        setTimeout(() => {
          console.log("Login: Triggering redirect to /dashboard");
          setRedirect(true);
          //return <Navigate to="/dashboard" replace />;
        }, 0);
      } else {
        const errorMessage =
          responseData.message || JSON.stringify(responseData);

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
    //return <Navigate to="/dashboard" />;

    window.location.href = "/dashboard";
    //navigate("/dashboard");
  }

  return (
    <div
      style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
    >
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.password && <p className="error">{errors.password}</p>}
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
          Login
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
