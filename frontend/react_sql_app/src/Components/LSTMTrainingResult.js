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

const LSTMTrainingResult = (props) => {
  const { endpoint } = props;
  const [data, setData] = useState([]);

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
          setData(parsedData.predictions);
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
        <div className="card">
          <h1 className="text-info center">LSTM Predict Results</h1>
          {data && data.length > 0 ? (
            <>
              <Box
                sx={{
                  color: "yellowgreen",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                <h3>Predict</h3>
                <span>{data.join(", ")}</span>
              </Box>
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
        </div>
      </React.Fragment>
    </div>
  );
};
export default LSTMTrainingResult;
