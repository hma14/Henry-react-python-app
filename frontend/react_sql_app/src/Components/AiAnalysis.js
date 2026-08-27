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

import {
  createMatchedDic,
  getTD,
  getHeader_4,
  getHeader_5,
} from "./PredictDraws";

const AiAnalysis = (props) => {
  const {
    endpoint,
    endpoint3,
    endpoint4,
    lottoName,
    drawNumber,
    columns,
  } = props;
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
  const [aiModel, setAiModel] = useState("gpt-5");
  const [maxTokens, setMaxTokens] = useState(100);
  const [numMatches, setNumMatches] = useState(3);
  const [matched, setMatched] = useState([]);
  const [targetNumber, setTargetNumber] = useState([]);
  const [maxMatches, setMaxMatches] = useState(0);
  const [matchedDic, setMatchedDic] = useState({});
  const [targetDrawDic, setTargetDrawDic] = useState({});
  const [numbers, setNumbers] = useState();

  const numbers_select = Array.from({ length: 100 }, (_, index) => index + 1);

  // Function to parse arrays from response string
  const parseCombos = (text) => {
    const regex = /\[\d+(?:,\s*\d+)*\]/g;
    const matches = text.match(regex) || [];
    return matches.map((match) => JSON.parse(match));
  };

  const ai_models = [
    "deepseek-chat",
    "gpt-4.1",
    "gpt-4-1106-preview",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o4-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4o-realtime-preview",
    "gpt-4o-mini-tts",
    "dall-e-3",
    "gpt-5",
  ];
  const max_tokens = [1, 100, 200, 300, 400, 500, 1000, 1500, 2000, 3000];
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
    async (analyze, numberDraws, sliderMin, sliderMax, aiModel, maxTokens) => {
      setIsLoading(true);
      const endpoint2 =
        endpoint +
        analyze +
        "&count=" +
        numberDraws +
        "&sliderMin=" +
        sliderMin +
        "&sliderMax=" +
        sliderMax +
        "&aiModel=" +
        aiModel +
        "&maxTokens=" +
        maxTokens;
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
    [endpoint],
  );

  const getNumbers = useCallback(async () => {
    try {
      const response = await axios(endpoint4);
      setNumbers(response.data[0]?.Numbers);
    } catch (error) {
      console.error("Error fetching draw number:", error);
    }
  }, [endpoint]);

  const getMatched = useCallback(async () => {
    try {
      const requestData = {
        lotto_name: lottoName,
        draw_number: drawNumber,
        num_matches: numMatches,
        tickets: generatedDraws.map((row) => row.map((number) => number.Value)),
      };

      const response = await axios.post(endpoint3, requestData);

      const { canMatch, matching_results } = response.data;

      if (!canMatch) {
        document.getElementById("matchingResult").style.display = "none";
        return;
      } else {
        document.getElementById("matchingResult").style.display = "";
        setMatched(matching_results.matches);
        setTargetNumber(matching_results.target_draw.split(/\s+/).map(Number));
      }
      const targetNumbers = matching_results.target_draw
        .split(/\s+/)
        .map(Number);

      const maxM = Math.max(
        0,
        ...matching_results.matches.map((x) => x.matches),
      );

      const { matchedDic, targetDrawDic } = createMatchedDic(
        numbers,
        matching_results.matches,
        targetNumbers,
      );

      // Now update the states
      setMatched(matching_results.matches);
      setTargetNumber(targetNumbers);
      setMaxMatches(maxM);
      setMatchedDic(matchedDic);
      setTargetDrawDic(targetDrawDic);
    } catch (error) {
      console.error("Error fetching matched numbers:", error);
    }
  }, [endpoint, endpoint3, lottoName, drawNumber, numMatches, generatedDraws]);

  useEffect(() => {
    fetchData(analyze, numberDraws, sliderMin, sliderMax, aiModel, maxTokens);
    getNumbers();
  }, [
    endpoint,
    analyze,
    numberDraws,
    sliderMin,
    sliderMax,
    aiModel,
    maxTokens,
  ]);

  useEffect(() => {
    if (lottoName === 1 || lottoName === 2) {
      setMaxValue(6);
    } else if (lottoName === 3) {
      setMaxValue(7);
    } else if (lottoName === 4) {
      setMaxValue(5);
    }
  }, [lottoName]);

  useEffect(() => {
    if (generatedDraws.length > 0) {
      getMatched();
    }
  }, [endpoint, generatedDraws, drawNumber, lottoName, numMatches]);

  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        <div className="card">
          <h3 className="text-info text-center fst-italic">
            Number Categories and Generated Draws
          </h3>
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
                    <tr>{hot.map((d) => getTD(d, 3))}</tr>
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
                    <tr>{neutral.map((d) => getTD(d, 3))}</tr>
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
                    <tr>{cold.map((d) => getTD(d, 3))}</tr>
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
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="fw-bold align-middle">
                    {generatedDraws.map((row, index) => (
                      <tr key={index}>
                        <td className="text-light bg-info text-center fw-bold fs-9">
                          {index + 1}
                        </td>
                        {row.map((d) => getTD(d))}
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div id="matchingResult">
                  <h4 className="text-success fst-italic mt-4 text-center">
                    Generated draws are matched to the past target draw, if
                    target draw is not a future draw.
                  </h4>

                  <div className="text-danger ticketHeader fst-italic mt-4 text-center">
                    {!isLoading &&
                    Array.isArray(targetNumber) &&
                    targetNumber.length > 0 &&
                    targetDrawDic != undefined ? (
                      <Table bordered className="table-light mb-2" size="lg">
                        {getHeader_5(
                          Array.from({ length: columns }, (_, i) => i),
                        )}
                        <tbody className="fw-bold align-middle">
                          <tr>
                            <td className="text-danger bg-color19 fs-4 fw-bold">
                              {drawNumber + 1}
                            </td>
                            {targetNumber.map((number) => {
                              const value = targetDrawDic[number];
                              return value ? getTD(value, 0) : null;
                            })}
                          </tr>
                        </tbody>
                      </Table>
                    ) : (
                      " "
                    )}
                  </div>
                  <div className="mt-2  fw-bold mb-2 d-flex justify-content-end">
                    <label className="text-success ps-3 fw-bold mr-2">
                      Minimum Matches:
                    </label>
                    <select
                      className="dropdown btn bg-info text-white dropdown-toggle ps-4 fw-bolder"
                      fullWidth
                      style={{ width: "200px" }}
                      value={numMatches}
                      onChange={(e) => setNumMatches(Number(e.target.value))}
                    >
                      {Array.from({ length: columns - 1 }, (_, i) => i + 2).map(
                        (col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  {Array.isArray(matched) &&
                  matched.length > 0 &&
                  matchedDic &&
                  !isLoading ? (
                    <Table
                      bordered
                      hover
                      responsive
                      className="table-light mb-2"
                      size="lg"
                    >
                      {getHeader_4(
                        Array.from({ length: columns }, (_, i) => i),
                        maxMatches,
                      )}
                      <tbody className="fw-bold align-middle">
                        {matched.map((row, index) => (
                          <tr key={index}>
                            <td className="bg-color3 text-primary fs-5 fst-italic">
                              {index + 1}
                            </td>
                            {row.ticket
                              .split(/\s+/)
                              .map(Number)
                              .map((number) => getTD(matchedDic[number], 0))}
                            <td className="bg-color19 text-center text-success fs-4 fw-bold px-2">
                              {row.matches}
                            </td>
                            <td className="bg-color6 text-center text-success fs-4 fw-bold px-2">
                              {row.matched_numbers}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {getHeader_4(
                        Array.from({ length: columns }, (_, i) => i),
                        maxMatches,
                      )}
                    </Table>
                  ) : (
                    <p className="text-danger text-center fst-italic fs-5 mt-4">
                      No matched draws found.
                    </p>
                  )}
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      onClick={() =>
                        fetchData(
                          analyze,
                          numberDraws,
                          sliderMin,
                          sliderMax,
                          aiModel,
                          1,
                        )
                      }
                      className="btn btn-info text-white fw-bold mb-2 three-d-button"
                      fullWidth
                      disabled={isLoading}
                    >
                      Generate Potential Draws
                    </button>
                  </div>
                </div>
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
                  <label className="block text-sm font-medium text-info">
                    Select Number of Draws
                  </label>
                  <select
                    labelId="select-number-draws-label"
                    value={numberDraws}
                    id="select-number-draws"
                    className="dropdown dropdown-width-2  btn bg-info text-white dropdown-toggle margin-right fw-bolder"
                    onChange={(e) => setNumberDraws(e.target.value)}
                  >
                    {numbers_select.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    fetchData(
                      analyze,
                      numberDraws,
                      sliderMin,
                      sliderMax,
                      aiModel,
                      1,
                    )
                  }
                  className="btn btn-info text-white fw-bold mt-4 three-d-button"
                  fullWidth
                  disabled={isLoading}
                >
                  Generate Potential Draws
                </button>
              </div>
              <div className="mb-4 mt-4 flex justify-end items-center space-x-4 mr-4">
                <div>
                  <label className="block text-sm font-medium text-info">
                    Select AI Model
                  </label>
                  <select
                    labelId="select-number-draws-2-label"
                    value={aiModel}
                    id="select-number-draws-2"
                    className="dropdown dropdown-width-2  btn bg-info text-white dropdown-toggle margin-right fw-bolder mb-4"
                    onChange={(e) => setAiModel(e.target.value)}
                  >
                    {ai_models.map((m, index) => (
                      <option key={index} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-info">
                    Select Max Tokes
                  </label>
                  <select
                    labelId="select-number-draws-3-label"
                    value={maxTokens}
                    id="select-number-draws-3"
                    className="dropdown dropdown-width-2  btn bg-info text-white dropdown-toggle margin-right fw-bolder mb-4"
                    onChange={(e) => setMaxTokens(e.target.value)}
                  >
                    {max_tokens.map((m, index) => (
                      <option key={index} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex text-sm font-medium text-info">
                    Request AI Analysis
                  </label>
                  <Checkbox
                    checked={analyze}
                    onChange={(e) => setAnalyze(e.target.checked)}
                    size="large"
                    className="text-info"
                  />
                </div>
              </div>
              {analyze && aiGeneratedDraws && !isLoading ? (
                <div>
                  <h2 className="text-info mb-4 text-center">
                    AI Analyze & Feedback
                  </h2>
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
                <div className="loader-container">
                  <CircularProgress size={120} />
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
                <CircularProgress size={120} />
              </div>
            </Box>
          )}
        </div>
      </React.Fragment>
    </div>
  );
};
export default AiAnalysis;
