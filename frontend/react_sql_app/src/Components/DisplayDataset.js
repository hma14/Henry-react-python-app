// DisplayDataset.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
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

const DisplayDataset = (props) => {
  const { endpoint } = props;
  const [data, setData] = useState("");

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [endpoint]);

  return (
    <div className="card">
      <h1 className="text-info center">Preprocess Dataset Results</h1>
      {data ? (
        <div
          className="card-body  ml-4"
          dangerouslySetInnerHTML={{ __html: data }}
        />
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
          <p>Loading...</p>
        </Box>
      )}
    </div>
  );
};

export default DisplayDataset;
