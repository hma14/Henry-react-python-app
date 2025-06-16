import React, { useEffect, useRef } from "react";
import { debounce } from "lodash";
import "./Slider.css";

function Slider({ value, setValue }) {
  const sliderRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10); // Parse as integer since step=1
    setValue(newValue);
  };

  // Handle hover tooltip
  useEffect(() => {
    const slider = sliderRef.current;
    const tooltip = tooltipRef.current;

    const handleMouseMove = (event) => {
      const rect = slider.getBoundingClientRect();
      const minVal = parseFloat(slider.min) || 5;
      const maxVal = parseFloat(slider.max) || 50;
      const stepVal = parseFloat(slider.step) || 1;
      const mouseX = event.clientX - rect.left;
      const percent = Math.min(Math.max(mouseX / rect.width, 0), 1); // Clamp to 0-1
      let value = minVal + percent * (maxVal - minVal);
      value = Math.round(value / stepVal) * stepVal; // Round to nearest step
      value = Math.max(minVal, Math.min(maxVal, value)); // Clamp to min/max
      tooltip.textContent = value; // Integer, no decimal places
      tooltip.style.left = `${mouseX}px`;
      tooltip.style.display = "block";
    };

    const handleMouseOut = () => {
      tooltip.style.display = "none";
    };

    const handleMouseOver = () => {
      tooltip.style.display = "block";
    };

    slider.addEventListener("mousemove", handleMouseMove);
    slider.addEventListener("mouseout", handleMouseOut);
    slider.addEventListener("mouseover", handleMouseOver);

    return () => {
      slider.removeEventListener("mousemove", handleMouseMove);
      slider.removeEventListener("mouseout", handleMouseOut);
      slider.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div className="slider-container">
      <div className="slider-card">
        <h2>Adjust Target Rows</h2>
        <div className="slider-label">
          <label>
            Value: <span className="slider-value">{value}</span>
          </label>
        </div>
        <div className="slider-wrapper">
          <input
            type="range"
            ref={sliderRef}
            min="5"
            max="50"
            step="1"
            value={value}
            onChange={handleChange}
            className="slider-input"
          />
          <span ref={tooltipRef} className="slider-tooltip">
            {value}
          </span>
        </div>
        <div className="slider-range">
          <span>5</span>
          <span>50</span>
        </div>
      </div>
    </div>
  );
}

export default Slider;
