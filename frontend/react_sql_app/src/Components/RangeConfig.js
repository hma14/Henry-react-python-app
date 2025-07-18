import React, { useState } from "react";
import axios from "axios"; // For making HTTP requests to the backend

const RangeConfig = () => {
  const [minValue, setMinValue] = useState(2); // Default min
  const [maxValue, setMaxValue] = useState(6); // Default max
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    // Basic validation
    if (minValue >= maxValue) {
      setError("Minimum value must be less than maximum value");
      return;
    }
    setError("");

    try {
      // Send range to backend
      const res = await axios.post("http://your-backend-api/random", {
        min: minValue,
        max: maxValue,
      });
      setResponse(res.data); // Store backend response (e.g., generated random number)
    } catch (err) {
      setError("Failed to send range to backend");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Configure Random Range</h2>
      <div>
        <label>
          Minimum Value:
          <input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Maximum Value:
          <input
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(Number(e.target.value))}
          />
        </label>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmit}>Submit Range</button>
      {response && <p>Random Number from Backend: {response.random_number}</p>}
    </div>
  );
};

export default RangeConfig;
