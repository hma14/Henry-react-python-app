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
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import classNames from "classnames";
import Slider from "./Slider";

const AiAnalysis = (props) => {
  const { endpoint, sortType, lottoName } = props;
  const [hot, setHot] = useState([]);
  const [cold, setCold] = useState([]);
  const [neutral, setNeutral] = useState([]);
  const [generatedDraws, setGeneratedDraws] = useState([]);
  const [aiGeneratedDraws, setAiGeneratedDraws] = useState("");
  const [combos, setCombos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analyze, setAnalyze] = useState(false);
  const [numberDraws, setNumberDraws] = useState(5);
  const [sliderMin, setSliderMinValue] = useState(2);
  const [sliderMax, setSliderMaxValue] = useState(4);
  const [maxValue, setMaxValue] = useState(3);

  const numbers = Array.from({ length: 10 }, (_, index) => index + 1);

  // Function to parse arrays from response string
  const parseCombos = (text) => {
    const regex = /\[\d+(?:,\s*\d+)*\]/g;
    const matches = text.match(regex) || [];
    return matches.map((match) => JSON.parse(match));
  };

  const initializeSet = (objectList) => {
    const set = new Set();

    objectList.forEach((obj) => {
      const value = Number(obj.Value);
      if (!isNaN(value) && Number.isInteger(value)) {
        set.add(value);
      }
    });
    /* 
    for (const obj of objectList) {
      const value = Number(obj.Value); // Convert to number
      if (!isNaN(value) && Number.isInteger(value)) {
        set.add(value);
      }
    } 
    */
    if (set.size === 0 && objectList.length > 0) {
      console.warn("No valid integer Values found in the objects");
    }
    return set;
  };

  const hotSet = initializeSet(hot);
  const neutralSet = initializeSet(neutral);
  const coldSet = initializeSet(cold);

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

  const fetchData = useCallback(
    async (analyze, numberDraws, sliderMin, sliderMax) => {
      setIsLoading(true);
      const endpoint2 =
        endpoint +
        analyze +
        "&count=" +
        numberDraws +
        "&sliderMin=" +
        sliderMin +
        "&sliderMax=" +
        sliderMax;
      axios
        .get(endpoint2)
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
    },
    [endpoint]
  );

  useEffect(() => {
    fetchData(analyze, numberDraws, sliderMin, sliderMax);
  }, [endpoint, analyze, numberDraws, sliderMin, sliderMax]);

  useEffect(() => {
    if (lottoName === 1 || lottoName === 2) {
      setMaxValue(6);
    } else if (lottoName === 3) {
      setMaxValue(7);
    } else if (lottoName === 4) {
      setMaxValue(5);
    }
  }, [lottoName]);

  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        <div className="card">
          <h1 className="text-info text-center">
            Number Categories and Generated Draws
          </h1>
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
                          {d.Value}
                          <br />
                          <span className={"fst-italic text-info fs-7"}>
                            {d.Distance}
                          </span>
                          <br />
                          <span className="my-color-4 fst-italic fs-7">
                            {d.TotalHits}
                          </span>
                          <br />
                          <span
                            className={classNames(
                              "txt-color",
                              {
                                "text-danger fst-italic fs-7":
                                  d.NumberofDrawsWhenHit > 10,
                              },
                              {
                                "text-success fst-italic fs-7":
                                  d.NumberofDrawsWhenHit <= 10,
                              }
                            )}
                          >
                            {d.NumberofDrawsWhenHit !== 0 &&
                              d.NumberofDrawsWhenHit}
                          </span>
                          <br />
                          <span
                            className={classNames(
                              "txt-color",
                              {
                                "red-indigo fst-italic fs-7": d.Probability > 0,
                              },
                              {
                                "my-color-1 fst-italic fs-7":
                                  d.Probability === 0,
                              }
                            )}
                          >
                            {d.Probability}
                          </span>
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
                          {d.Value}{" "}
                          <span className={"fst-italic text-info fs-7"}>
                            ( {d.Distance} )
                          </span>
                          <span className="my-color-4 fst-italic fs-7">
                            ( {d.TotalHits} )
                          </span>
                          <span
                            className={classNames(
                              "txt-color",
                              {
                                "red-indigo fst-italic fs-7": d.Probability > 0,
                              },
                              {
                                "my-color-1 fst-italic fs-7":
                                  d.Probability === 0,
                              }
                            )}
                          >
                            ( {d.Probability} )
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </Table>
                <h3 className="text-info">Cold Numbers</h3>
                <Table>
                  <thead className="table-danger">
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
                        <td className="bg-color1 text-info fs-5 fw-bold px-2">
                          {d.Value}
                          <br />
                          <span className={"fst-italic text-info fs-7"}>
                            ({d.Distance} )
                          </span>
                          <span className="my-color-4 fst-italic fs-7">
                            ( {d.TotalHits} )
                          </span>
                          <span
                            className={classNames(
                              "txt-color",
                              {
                                "red-indigo fst-italic fs-7": d.Probability > 0,
                              },
                              {
                                "my-color-1 fst-italic fs-7":
                                  d.Probability === 0,
                              }
                            )}
                          >
                            ( {d.Probability} )
                          </span>
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
                      <th className="text-light bg-info">#</th>
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
                        <td className="text-light bg-info text-center fw-bold fs-9">
                          {index + 1}
                        </td>
                        {row.map((d) => (
                          <td className="bg-color1 text-center text-success fs-5 fw-bold px-2">
                            <span
                              key={d.Value}
                              className={`inline-block px-2 py-1 m-1 rounded ${getCellColor(
                                d.Value
                              )}`}
                            >
                              {d.Value}
                            </span>
                            <span className={"fst-italic text-info fs-7"}>
                              ( {d.Distance} )
                            </span>
                            <span className="my-color-4 fst-italic fs-7">
                              ( {d.TotalHits} )
                            </span>
                            {d.NumberofDrawsWhenHit !== 0 && (
                              <span
                                className={classNames(
                                  "txt-color",
                                  {
                                    "text-danger fst-italic fs-7":
                                      d.NumberofDrawsWhenHit > 10,
                                  },
                                  {
                                    "text-success fst-italic fs-7":
                                      d.NumberofDrawsWhenHit <= 10,
                                  }
                                )}
                              >
                                ({d.NumberofDrawsWhenHit})
                              </span>
                            )}
                            <span
                              className={classNames(
                                "txt-color",
                                {
                                  "red-indigo fst-italic fs-7":
                                    d.Probability > 0,
                                },
                                {
                                  "my-color-1 fst-italic fs-7":
                                    d.Probability === 0,
                                }
                              )}
                            >
                              ( {d.Probability} )
                            </span>{" "}
                            <span className="my-color-5 fs-7">
                              [{d.NumberOfAppearing - 1}]
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="mb-4 flex justify-end items-center space-x-4 mr-4">
                <div className="slider">
                  <Slider
                    value={sliderMin}
                    setValue={setSliderMinValue}
                    title="Min HOT Range"
                    start={1}
                    end={3}
                  />
                </div>
                <div className="slider">
                  <Slider
                    value={sliderMax}
                    setValue={setSliderMaxValue}
                    title="Max HOT Range"
                    start={4}
                    end={maxValue}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-info">
                    Select Number of Draws
                  </label>
                  <select
                    labelId="select-number-draws-label"
                    value={numberDraws}
                    id="select-number-draws"
                    className="dropdown dropdown-width-2  btn bg-info text-white dropdown-toggle margin-right fw-bolder, mb-4"
                    onChange={(e) => setNumberDraws(e.target.value)}
                  >
                    {numbers.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    fetchData(analyze, numberDraws, sliderMin, sliderMax)
                  }
                  className="btn btn-info text-white fw-bold mb-2 three-d-button mt-2"
                  fullWidth
                  disabled={isLoading}
                >
                  Generate Potential Draws
                </button>
              </div>
              <div className="mb-4 flex justify-end mr-4">
                <Checkbox
                  checked={analyze}
                  onChange={(e) => setAnalyze(e.target.checked)}
                  inputProps={{ "aria-label": "Request AI Analyze" }}
                  size="large"
                />
                <span className="my-label text-info">Request AI Analysis</span>
              </div>
              {analyze && aiGeneratedDraws && !isLoading ? (
                <div>
                  <h1 className="text-info mb-4 text-center">
                    AI Analyze & Feedback
                  </h1>
                  <Box
                    sx={{
                      color: "green",
                      fontWeight: "bold",
                      fontSize: "22px",
                      //textAlign: "center",
                      //fontStyle: "italic",
                    }}
                  >
                    <pre className="ml-4">{aiGeneratedDraws}</pre>
                  </Box>{" "}
                </div>
              ) : analyze ? (
                <div className="loader-container-2">
                  <CircularProgress />
                </div>
              ) : (
                ""
              )}
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
export default AiAnalysis;
