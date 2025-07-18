import React, { useEffect, useRef } from "react";
import { debounce } from "lodash";
import "./Slider.css";

function Slider({ value, setValue, title, start, end }) {
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

    const updateTooltip = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const minVal = parseFloat(slider.min) || 5;
      const maxVal = parseFloat(slider.max) || 50;
      const stepVal = parseFloat(slider.step) || 1;
      const mouseX = clientX - rect.left;
      const percent = Math.min(Math.max(mouseX / rect.width, 0), 1);
      let value = minVal + percent * (maxVal - minVal);
      value = Math.round(value / stepVal) * stepVal;
      value = Math.max(minVal, Math.min(maxVal, value));
      tooltip.textContent = value;
      tooltip.style.left = `${mouseX}px`;
      tooltip.style.display = "block";
    };

    const handleMouseMove = (event) => {
      updateTooltip(event.clientX);
    };

    const handleTouchMove = (event) => {
      event.preventDefault(); // Prevent scrolling
      const touch = event.touches[0];
      updateTooltip(touch.clientX);
    };

    const handleMouseOut = () => {
      tooltip.style.display = "none";
    };

    slider.addEventListener("mousemove", handleMouseMove);
    slider.addEventListener("touchmove", handleTouchMove, { passive: false }); // Non-passive for preventDefault
    slider.addEventListener("mouseout", handleMouseOut);
    slider.addEventListener("touchend", handleMouseOut); // Hide tooltip on touch end
    slider.addEventListener("mouseover", () => {
      tooltip.style.display = "block";
    });
    slider.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault(); // Prevent default touch behavior (e.g., zooming)
        tooltip.style.display = "block";
      },
      { passive: false }
    );

    return () => {
      slider.removeEventListener("mousemove", handleMouseMove);
      slider.removeEventListener("touchmove", handleTouchMove);
      slider.removeEventListener("mouseout", handleMouseOut);
      slider.removeEventListener("touchend", handleMouseOut);
      slider.removeEventListener("mouseover", () => {});
      slider.removeEventListener("touchstart", () => {});
    };
  }, []);

  return (
    <div className="slider-card">
      <h3 className="text-info text-center fs-6 fw-bold">{title}</h3>
      <div className="slider-label">
        <label>
          Value: <span className="slider-value">{value}</span>
        </label>
      </div>
      <div className="slider-wrapper">
        <input
          type="range"
          ref={sliderRef}
          min={String(start)}
          max={String(end)}
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
        <span>{start}</span>
        <span>{end}</span>
      </div>
    </div>
  );
}

export default Slider;
