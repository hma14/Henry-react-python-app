import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import { useEffect, useState } from "react";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const urlSignUp = "https://localhost:5006/api/auth/signup";
  const urlLogin = "https://localhost:5006/api/auth/login";

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      console.log("App: Checking accessToken:", token);
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  console.log("App: Rendering with isAuthenticated:", isAuthenticated); // Debug

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login endpoint={urlLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SignUp endpoint={urlSignUp} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          {/* Catch-all for undefined routes */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
