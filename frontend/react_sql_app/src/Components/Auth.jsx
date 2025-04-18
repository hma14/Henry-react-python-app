import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const urlSignUp = "https://localhost:5006/api/auth/signup";
  const urlLogin = "https://localhost:5006/api/auth/login";

  return (
    <div
      style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
    >
      {showLogin ? (
        <>
          <Login endpoint={urlLogin} />
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => setShowLogin(false)}
              style={{ border: "none", background: "none", color: "#007bff" }}
            >
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <SignUp endpoint={urlSignUp} />
          <p>
            Already have an account?{" "}
            <button
              onClick={() => setShowLogin(true)}
              style={{ border: "none", background: "none", color: "#007bff" }}
            >
              Log in
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default Auth;
