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

const AiPredictNextDraw = (props) => {
  const { endpoint } = props;
  const [data, setData] = useState([]);
  const [numbers, setNumbers] = useState([]);

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        console.log("Response Data:", response.data);
        setNumbers(response.data);
        console.log("numbers:", numbers);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [endpoint]);

  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        {numbers && (
          <Container
            maxWidth={false}
            sx={{
              width: "100%",
              bgcolor: "#f5f5f5",
              height: "100%",
              color: "InfoText",
            }}
          >
            <Box
              sx={{ color: "yellowgreen", textAlign: "center", height: "10vh" }}
            >
              <h1>Potential Hits for Next Draw</h1>
            </Box>
            <Typography
              sx={{ fontSize: "24px", color: "green", textAlign: "center" }}
            >
              <span>{numbers.sort().join(", ")}</span>
            </Typography>
          </Container>
        )}
      </React.Fragment>
    </div>
  );
};
export default AiPredictNextDraw;
