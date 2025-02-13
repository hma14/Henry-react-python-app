// DisplayDataset.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { Table } from "react-bootstrap";

const LottoModelTrainingResult = (props) => {
  const { endpoint } = props;
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        setMetrics(response.data.metrics);
        setFeatureImportance(response.data.feature_importance || []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [endpoint]);

  return (
    <div>
      <h2>Model Training Results</h2>
      {metrics && (
        <div>
          <h3>Performance Metrics</h3>
          <ul>
            {Object.keys(metrics).map((key) => (
              <li key={key}>
                {key}:{" "}
                {(
                  metrics[key].reduce((a, b) => a + b, 0) / metrics[key].length
                ).toFixed(4)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {featureImportance.length > 0 && (
        <div>
          <h3>Feature Importance</h3>
          <ul>
            {featureImportance.map((feat, index) => (
              <li key={index}>
                {feat.feature}: {feat.importance.toFixed(4)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default LottoModelTrainingResult;
