import { useEffect, useState } from "react";
import api from "./Api";

function EmailConfirmation({ onSuccess }) {
  const [message, setMessage] = useState("Verifying email...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      api
        .confirmEmail(token)
        .then((response) => {
          if (response.success) {
            setMessage("Email confirmed! Redirecting to login...");
            setTimeout(() => onSuccess(), 2000);
          } else {
            setMessage(response.message || "Invalid or expired token");
          }
        })
        .catch(() => setMessage("An error occurred"));
    } else {
      setMessage("No confirmation token provided");
    }
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Email Confirmation
      </h2>
      <p className="text-center">{message}</p>
    </div>
  );
}

export default EmailConfirmation;
