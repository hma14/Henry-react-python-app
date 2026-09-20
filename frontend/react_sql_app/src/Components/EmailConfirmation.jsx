import { useEffect, useRef, useState } from "react";
import api from "./Api";

const EmailConfirmation = ({ onSuccess }) => {
  const [message, setMessage] = useState("Confirming your email...");
  const [error, setError] = useState(false);

  const hasConfirmed = useRef(false);

  useEffect(() => {
    // Prevent duplicate API calls
    if (hasConfirmed.current) {
      return;
    }

    hasConfirmed.current = true;

    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setError(true);
          setMessage("Confirmation token is missing.");
          return;
        }

        console.log("Calling confirmEmail with token:", token);

        //const response = await confirmEmail(token);
        const response = await api.confirmEmail(token);

        if (response.success) {
          setMessage(
            "Your email has been successfully confirmed. You can now log in.",
          );
          //setTimeout(() => onSuccess(), 2000);
        } else {
          setError(true);
          setMessage(response.message || "Email confirmation failed.");
        }
      } catch (error) {
        console.error("Email confirmation error:", error);

        setError(true);
        setMessage(error.message || "Unable to confirm your email.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="container mt-5 text-center">
      <h2>Email Confirmation</h2>

      <p className={error ? "text-danger" : "text-success"}>{message}</p>
    </div>
  );
};

export default EmailConfirmation;
