// Printout.js
import React, { useState, useEffect, useCallback } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import classNames from "classnames";

const Printout = (props) => {
  const { endpoint } = props;
  const [hot, setHot] = useState([]);
  const [cold, setCold] = useState([]);
  const [neutral, setNeutral] = useState([]);
  const [generatedDraws, setGeneratedDraws] = useState([]);
  const [aiGeneratedDraws, setAiGeneratedDraws] = useState("");
  const [combos, setCombos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to parse arrays from response string
  const parseCombos = (text) => {
    const regex = /\[\d+(?:,\s*\d+)*\]/g;
    const matches = text.match(regex) || [];
    return matches.map((match) => JSON.parse(match));
  };

  const hotSet = new Set(hot);
  const neutralSet = new Set(neutral);
  const coldSet = new Set(cold);
  const getCellColor = (number) => {
    if (hotSet.has(number)) {
      return "text-danger";
    }
    if (neutralSet.has(number)) {
      return "text-success";
    }
    if (coldSet.has(number)) {
      return "text-info";
    }
    return "bg-gray-100";
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    axios
      .get(endpoint)
      .then((response) => {
        const [
          hotData,
          coldData,
          neutralData,
          generatedDrawsData,
          aiGeneratedDrawsData,
        ] = response.data;

        setHot(hotData);
        setCold(coldData);
        setNeutral(neutralData);
        setGeneratedDraws(generatedDrawsData);
        setAiGeneratedDraws(aiGeneratedDrawsData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        <div className="card">
          <h1 className="text-info center">Print Out</h1>
          {hot && hot.length > 0 ? (
            <>
              <div className="table-container">
                <h3 className="text-danger">Hot Numbers</h3>
                <Table>
                  <thead className="table-danger text-center">
                    <tr>
                      {Array.from(Array(hot.length).keys()).map((no) => (
                        <th
                          key={no}
                          className="text-warning bg-success fst-italic"
                        >
                          {no + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {hot.map((d) => (
                        <td className="bg-color1 text-center text-danger fs-5 fw-bold px-2">
                          {d}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </Table>
                <h3 className="text-success">Neutral Numbers</h3>
                <Table>
                  <thead className="table-danger text-center">
                    <tr>
                      {Array.from(Array(neutral.length).keys()).map((no) => (
                        <th
                          key={no}
                          className="text-warning bg-success fst-italic"
                        >
                          {no + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {neutral.map((d) => (
                        <td className="bg-color1 text-center text-success fs-5 fw-bold px-2">
                          {d}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </Table>
                <h3 className="text-info">Cold Numbers</h3>
                <Table>
                  <thead className="table-danger text-center">
                    <tr>
                      {Array.from(Array(cold.length).keys()).map((no) => (
                        <th
                          key={no}
                          className="text-warning bg-success fst-italic"
                        >
                          {no + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {cold.map((d) => (
                        <td className="bg-color1 text-center text-info fs-5 fw-bold px-2">
                          {d}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </Table>
              </div>
              <div className="mt-4">
                <h3 className="text-secondary">Generated Draws</h3>
                <Table>
                  <thead className="table-danger text-center">
                    <tr>
                      {Array.from(Array(generatedDraws[0].length).keys()).map(
                        (no) => (
                          <th
                            key={no}
                            className="text-warning bg-success fst-italic"
                          >
                            {no + 1}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedDraws.map((row, index) => (
                      <tr key={index}>
                        {row.map((number) => (
                          <td className="bg-color1 text-center text-success fs-5 fw-bold px-2">
                            <span
                              key={number}
                              className={`inline-block px-2 py-1 m-1 rounded ${getCellColor(
                                number
                              )}`}
                            >
                              {number}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  onClick={() => fetchData()}
                  className="btn btn-info text-white fw-bold mb-2 three-d-button"
                  fullWidth
                  disabled={isLoading}
                >
                  Generate Potential Draws
                </button>
              </div>
              <h3 className="text-secondary">AI Analyze & Feedback</h3>
              <Box
                sx={{
                  //color: "green",
                  //fontWeight: "bold",
                  fontSize: "18px",
                  //textAlign: "center",
                  //fontStyle: "italic",
                }}
              >
                <pre>{aiGeneratedDraws}</pre>
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
              <div className="loader-container">
                <CircularProgress />
              </div>
            </Box>
          )}
        </div>
      </React.Fragment>
    </div>
  );
};
export default Printout;
