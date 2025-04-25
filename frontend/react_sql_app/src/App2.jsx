import { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./Components/SignUp";
import EmailConfirmation from "./Components/EmailConfirmation";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const urlSignUp = "https://localhost:5006/api/auth/signup";
  const urlLogin = "https://localhost:5006/api/auth/login";

  const [page, setPage] = useState("signup");

  const renderPage = () => {
    switch (page) {
      case "signup":
        return <SignUp onSuccess={() => setPage("login")} />;
      case "confirm":
        return <EmailConfirmation onSuccess={() => setPage("login")} />;
      case "login":
        return (
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <p className="text-center">
              Login page implementation would go here
            </p>
            <p className="text-center text-sm">
              Need an account?{" "}
              <a
                href="#signup"
                className="text-blue-500"
                onClick={() => setPage("signup")}
              >
                Sign Up
              </a>
            </p>
          </div>
        );
    }
  };

  return <div className="min-h-screen bg-gray-100">{renderPage()}</div>;
};

export default App;
