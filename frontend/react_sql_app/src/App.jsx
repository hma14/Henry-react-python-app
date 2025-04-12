// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard"; // Protected page example

const App = () => {
  /*   
  const urlSignUp = "http://ep.lottotry.com:5001/api/auth/ignup";
  const urlLogin = "http://ep.lottotry.com:5001/api/auth/login";
 */

  const urlSignUp = "https://localhost:5006/api/auth/signup";
  const urlLogin = "https://localhost:5006/api/auth/login";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />{" "}
        {/* Redirect to /signup */}
        <Route path="/signup" element={<SignUp endpoint={urlSignUp} />} />
        <Route path="/login" element={<Login endpoint={urlLogin} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
