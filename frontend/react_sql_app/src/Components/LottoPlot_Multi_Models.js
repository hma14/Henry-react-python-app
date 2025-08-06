import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  CssBaseline,
  Paper,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import "../App.css";

const LottoPlot_Multi_Models = (props) => {
  const { endpoint } = props;
  const [images, setImages] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [missedNumbers, setMissedNumbers] = useState([]);
  const [modelNames, setModelNames] = useState([]);

  useEffect(() => {
    axios
      .get(endpoint)
      .then((res) => {
        try {
          const parsedData =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          const base64Images = parsedData.images.map(
            (img) => `data:image/png;base64,${img}`
          );
          setImages(base64Images);
          //const nums = parsedData.numbers.map((n) => n);
          setNumbers(parsedData.numbers);
          setFeatureImportance(parsedData.feature_importance);
          setMetrics(parsedData.metrics);
          setMissedNumbers(parsedData.missed_numbers);
          setModelNames(parsedData.model_names);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [endpoint]);

  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        {metrics ? (
          <>
            <div className="card" style={{ marginBottom: "5px" }}>
              <h1 className="text-info center">Model Training Results</h1>
              <Box sx={{ fontSize: "24px" }}>
                <Grid container spacing={2}>
                  <Grid size={5}>
                    <h3>Performance Metrics</h3>
                    <ul>
                      {Object.keys(metrics).map((key) => (
                        <li key={key}>
                          <Typography>
                            {key}:{" "}
                            <span
                              style={{ color: "red", fontWeight: "bolder" }}
                            >
                              {(
                                metrics[key].reduce((a, b) => a + b, 0) /
                                metrics[key].length
                              ).toFixed(4)}
                            </span>
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                  {featureImportance.length > 0 && (
                    <Grid size={5}>
                      <h3>Feature Importance</h3>
                      <ul>
                        {featureImportance.map((feat, index) => (
                          <li key={index}>
                            <Typography>
                              {feat.feature}:{" "}
                              <span
                                style={{ color: "red", fontWeight: "bolder" }}
                              >
                                {feat.importance.toFixed(4)}
                              </span>
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </div>
            {images.map((image, index) => (
              <div
                className="card borderRadius"
                style={{
                  marginBottom: "4px",
                  borderStyle: "outset",
                  borderWidth: "2px",
                }}
              >
                <h1 className="text-info center">
                  Lottery Prediction Plot with{" "}
                  <span style={{ color: "red" }}>{modelNames[index]}</span>{" "}
                  Model
                </h1>

                <img src={image} alt="Lottery Plot" style={{ width: "100%" }} />
                <Box sx={{ marginTop: "10px" }}>
                  <Typography
                    sx={{
                      fontSize: "24px",
                      color: "green",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ color: "gray", fontSize: "18px" }}>
                      Below are the 10 most possible potential numbers for next
                      draw (ordered by probability in descending from left to
                      right, in line with above the graphics):
                    </p>
                    <span style={{ color: "green", fontSize: "32px" }}>
                      {numbers[index].join(", ")}
                    </span>
                  </Typography>
                </Box>
              </div>
            ))}
            <div className="card" style={{ marginTop: "10px" }}>
              <Box sx={{ marginTop: "10px" }}>
                <Typography
                  sx={{
                    fontSize: "24px",
                    color: "green",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "gray", fontSize: "18px" }}>
                    Below are the{" "}
                    <span style={{ color: "red", fontStyle: "italic" }}>
                      missing
                    </span>{" "}
                    numbers excluded from above predicted numbers:
                  </p>
                  <p>
                    <span
                      style={{
                        color: "red",
                        fontStyle: "italic",
                        fontWeight: "bold",
                      }}
                    >
                      {missedNumbers.length}
                    </span>{" "}
                    missing numbers
                  </p>
                  <span style={{ color: "Highlight", fontSize: "32px" }}>
                    {missedNumbers.join(", ")}
                  </span>
                </Typography>
              </Box>
            </div>
          </>
        ) : (
          <Box
            sx={{
              color: "green",
              fontWeight: "bold",
              fontSize: "18px",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            <div className="loader-container">
              <CircularProgress size={120} />
            </div>
          </Box>
        )}
      </React.Fragment>
    </div>
  );
};

export default LottoPlot_Multi_Models;
