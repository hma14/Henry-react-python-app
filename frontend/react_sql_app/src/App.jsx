import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { ClipLoader } from "react-spinners";

const App = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [page, setPage] = useState("signup");
  const timeoutDuration = 30 * 60 * 1000; // 30 minutes

  // Function to handle logout
  const handleLogout = () => {
    setTimeout(() => {
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
      navigate("/login");
    }, 1000); // 1-second delay to show the animation
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      console.log("App: Checking accessToken:", token);
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  // Idle timeout logic
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, timeoutDuration);
    };

    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("keypress", resetTimer);
    resetTimer();

    return () => {
      document.removeEventListener("mousemove", resetTimer);
      document.removeEventListener("keypress", resetTimer);
      clearTimeout(timeout);
    };
  }, [navigate, timeoutDuration]);

  console.log("App: Rendering with isAuthenticated:", isAuthenticated); // Debug

  if (isAuthenticated === null) {
    //return <div>Loading...</div>;
    return (
      <div>
        {/* <ClipLoader size={40} color="#3498db" /> */}
        <CircularProgress />{" "}
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div>
                <h1>Welcome to LottoTry</h1>
                <button onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div>
                <h1>Please Log In</h1>
                <button onClick={() => navigate("/login")}>Go to Login</button>
              </div>
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignUp onSuccess={() => setPage("login")} />
            )
          }
        />
        <Route path="/confirm" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/logout"
          element={
            <div className="logout-container">
              <div className="spinner"></div>
              <p>Logging Out...</p>
            </div>
          }
        />
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;
