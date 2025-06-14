import React, { useState } from "react";
import { debounce } from "lodash";
import "./Slider.css";

const NET_API_URL = "https://localhost:5006/api/";
//const NET_API_URL = "http://api.lottotry.com/api/";

function Slider({ value, setValue }) {
  // Debounced function to send value to backend
  const sendValueToBackend = debounce(async (newValue) => {
    try {
      const response = await fetch(`${NET_API_URL}slider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sliderValue: newValue }),
      });

      if (!response.ok) {
        console.error("Failed to send slider value:", response.statusText);
      } else {
        const data = await response.json();
        console.log("Backend response:", data);
      }
    } catch (error) {
      console.error("Error sending slider value:", error);
    }
  }, 500); // Wait 500ms after last change

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    sendValueToBackend(newValue);
  };

  return (
    <div className="slider-container">
      <div className="slider-card">
        <h2>Adjust Target Rows</h2>
        <div className="slider-label">
          <label>Value: {value}</label>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          value={value}
          onChange={handleChange}
          className="slider-input"
        />
        <div className="slider-range">
          <span>5</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

export default Slider;
