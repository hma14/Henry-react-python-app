import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid2 as Grid,
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

const LottoPlot = (props) => {
  const { endpoint } = props;
  const [image, setImage] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);

  useEffect(() => {
    axios
      .get(endpoint)
      .then((res) => {
        try {
          const parsedData =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          setImage(`data:image/png;base64,${parsedData.image}`);
          setNumbers(parsedData.numbers);
          setFeatureImportance(parsedData.feature_importance);
          setMetrics(parsedData.metrics);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));

    console.log("image = ", image);
  }, [endpoint]);

  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        {metrics ? (
          <>
            <div className="card" style={{ marginBottom: "2px" }}>
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

            <div className="card">
              <h1 className="text-info center">
                Lottery Prediction Plot with{" "}
                <span style={{ color: "red" }}>Pipeline</span> Model
              </h1>
              <img src={image} alt="Lottery Plot" style={{ width: "100%" }} />
              <Box sx={{ marginTop: "10px" }}>
                <Typography
                  sx={{ fontSize: "24px", color: "green", textAlign: "center" }}
                >
                  <p style={{ color: "gray", fontSize: "18px" }}>
                    Below are the 10 most possible potential numbers for next
                    draw (ordered by probability in descending from left to
                    right, in line with above the graphics):
                  </p>
                  <span style={{ color: "green", fontSize: "32px" }}>
                    {numbers.join(", ")}
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
            <span>Loading...</span>
          </Box>
        )}
      </React.Fragment>
    </div>
  );
};

export default LottoPlot;
