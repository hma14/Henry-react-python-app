import { useState, useEffect } from "react";
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
    <div className="card">
      <h1 className="text-info center">Lottery Prediction Plot</h1>
      {image ? (
        <>
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
        </>
      ) : (
        <p>Loading plot...</p>
      )}
    </div>
  );
};

export default LottoPlot;
