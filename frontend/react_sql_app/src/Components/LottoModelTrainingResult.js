// DisplayDataset.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { Table } from "react-bootstrap";
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

const LottoModelTrainingResult = (props) => {
  const { endpoint } = props;
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        try {
          const parsedData =
            typeof response.data === "string"
              ? JSON.parse(response.data)
              : response.data;
          setFeatureImportance(parsedData.feature_importance);
          setMetrics(parsedData.metrics);
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
        <Container
          maxWidth={false}
          sx={{
            width: "100%",
            bgcolor: "#f5f5f5",
            height: "100%",
            color: "InfoText",
          }}
        >
          <Box sx={{ textAlign: "center", height: "10vh" }}>
            <h1>Model Training Results</h1>
          </Box>
          <Box sx={{ fontSize: "24px" }}>
            <Grid container spacing={2}>
              {metrics && (
                <Grid size={5}>
                  <h3>Performance Metrics</h3>
                  <ul>
                    {Object.keys(metrics).map((key) => (
                      <li key={key}>
                        <Typography>
                          {key}:{" "}
                          <span style={{ color: "red", fontWeight: "bolder" }}>
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
              )}

              {featureImportance.length > 0 && (
                <Grid size={5}>
                  <h3>Feature Importance</h3>
                  <ul>
                    {featureImportance.map((feat, index) => (
                      <li key={index}>
                        <Typography>
                          {feat.feature}:{" "}
                          <span style={{ color: "red", fontWeight: "bolder" }}>
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
        </Container>
      </React.Fragment>
    </div>
  );
};
export default LottoModelTrainingResult;
