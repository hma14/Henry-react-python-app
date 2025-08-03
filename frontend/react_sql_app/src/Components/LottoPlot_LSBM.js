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
import CircularProgress from "@mui/material/CircularProgress";
import "../App.css";

const LottoPlot_LSBM = (props) => {
  const { endpoint } = props;
  const [image, setImage] = useState("");
  const [numbers, setNumbers] = useState("");
  useEffect(() => {
    axios
      .get(endpoint)
      .then((res) => {
        try {
          const parsedData =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          setImage(`data:image/png;base64,${parsedData.image}`);
          setNumbers(parsedData.numbers);
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
        {image ? (
          <div className="card">
            <h1 className="text-info center">
              Lottery Prediction Plot with{" "}
              <span style={{ color: "red" }}>LightGBM</span> Model
            </h1>
            <img src={image} alt="Lottery Plot" style={{ width: "100%" }} />
            <Box sx={{ marginTop: "10px" }}>
              <Typography
                sx={{ fontSize: "24px", color: "green", textAlign: "center" }}
              >
                <p style={{ color: "gray", fontSize: "18px" }}>
                  Below are the 10 most possible potential numbers for next draw
                  (ordered by probability in descending from left to right, in
                  line with above the graphics):
                </p>
                <span style={{ color: "green", fontSize: "32px" }}>
                  {numbers.join(", ")}
                </span>
              </Typography>
            </Box>
          </div>
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

export default LottoPlot_LSBM;
