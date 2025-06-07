import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import CircularProgress from "@mui/material/CircularProgress";
import "../App.css";

const LSTMTrainingResult = (props) => {
  const { endpoint } = props;
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        try {
          setPredictions(response.data.predictions);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [endpoint]);

  const PredictionChart = ({ predictions }) => {
    const flattenedPredictions = predictions.map((arr) => arr[0]);
    const data = {
      labels: predictions.map((_, index) => index), // X-axis (Index)
      datasets: [
        {
          label: "LSTM Predictions",
          data: flattenedPredictions, // Y-axis (Predicted values)
          borderColor: "blue",
          borderWidth: 6,
          fill: false,
        },
      ],
    };

    return <Line data={data} />;
  };

  return (
    <div>
      <h2>LSTM Prediction Results</h2>

      {predictions.length > 0 ? (
        <PredictionChart predictions={predictions} />
      ) : (
        <div className="loader-container">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default LSTMTrainingResult;
