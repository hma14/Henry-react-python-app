import React, { useEffect, useState } from "react";
import ApiNumbers from "./Components/ApiNumbers";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import axios from "axios";
import "./App.css";
import LottoTryLogo from "./images/LottoTryLogo.png";
import PredictDraws from "./Components/PredictDraws";
import LottoDraws from "./Components/LottoDraws";
import NumberDrawsInDistance from "./Components/NumberDrawsInDistance";
import ApiOpenAI from "./Components/ApiOpenAI";
import DisplayDataset from "./Components/DisplayDataset";
import ModelTrainingResult from "./Components/ModelTrainingResult";
import LottoModelTrainingResult from "./Components/LottoModelTrainingResult";
import AiPredictNextDraw from "./Components/AiPredictNextDraw";

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
  Stack,
  TextField,
} from "@mui/material";
//import { Stack } from "react-bootstrap";

const Styles = styled.div`
  padding: 0rem;

  table {
    alignment: center;
    /*     border-spacing: 2px;
    border: 1px solid black;
 */
    align-items: center;
    border: 2px outset grey;
    pddding: 2px;

    tr {
      :last-child {
        td {
          //border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 2;
      padding: 3px; //0.3rem;
      /*
       border-bottom: 1px solid black;
      border-right: 1px solid black;
      border: 1px double;
      cellpadding:2px;
      cellspacing:2px;*/

      :last-child {
        border-right: 1px;
      }
      border: 2px inset grey;
      margin: 1px;
      1text-align: center;
    }
  }
`;

const App = () => {
  //const [selectedLotto, setSelectedLotto] = useState('AllNumbers')
  const [sortType, setSortType] = useState("number");
  const [, setNumberRange] = useState(49);

  // change default lotto options
  const [lottoName, setLottoName] = useState(1);
  const [lottoColumns, setLottoColumns] = useState(7);
  const [potentialColumns, setPotentialColumns] = useState(6);
  const [selectedOption, setSelectedOption] = useState("BC49");
  const [selectedStatsOption, setSelectedStatsOption] = useState("");
  const [selectedValue, setSelectedValue] = React.useState(""); // Default empty
  const [selectedAiOption, setSelectedAiOption] = React.useState(""); // Default empty
  const [lastSelected, setLastSelected] = React.useState(""); // Track last changed dropdown

  // end

  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(1);
  //const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10);
  const [drawNumber, setDrawNumber] = useState(1);
  const [error, setError] = useState(null);

  /*
const url10 = 'http://ep.lottotry.com:5001/api/lotto/getCurrentDrawNumber?lotto_name=' + lottoName
const url = 'http://ep.lottotry.com:5001/api/openai'
const url4 = 'http://ep.lottotry.com:5001/api/lotto/allNumbers?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize + '&drawNumber=' + drawNumber
const url5 = 'http://ep.lottotry.com:5001/api/lotto/predict?lotto_name=' + lottoName + '&columns=' + lottoColumns + '&drawNumber=' + drawNumber
const url9 = 'http://ep.lottotry.com:5001/api/lotto/potential_draws?lotto_name=' + lottoName + '&columns=' + potentialColumns + '&page_size=' + pageSize + '&drawNumber=' + drawNumber
const url7 = 'http://ep.lottotry.com:5001/api/lotto/lottoDraws?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize + '&drawNumber=' + drawNumber
const url8 = 'http://ep.lottotry.com:5001/api/lotto/numberDraws?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize + '&drawNumber=' + drawNumber
*/

  const url10 =
    "http://127.0.0.1:5001/api/lotto/getCurrentDrawNumber?lotto_name=" +
    lottoName;
  const url = "http://127.0.0.1:5001/api/openai";
  const url4 =
    "http://127.0.0.1:5001/api/lotto/allNumbers?lotto_name=" +
    lottoName +
    "&page_number=" +
    page +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;
  const url5 =
    "http://127.0.0.1:5001/api/lotto/predict?lotto_name=" +
    lottoName +
    "&columns=" +
    lottoColumns +
    "&drawNumber=" +
    drawNumber;
  const url9 =
    "http://127.0.0.1:5001/api/lotto/potential_draws?lotto_name=" +
    lottoName +
    "&columns=" +
    potentialColumns +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;
  const url7 =
    "http://127.0.0.1:5001/api/lotto/lottoDraws?lotto_name=" +
    lottoName +
    "&page_number=" +
    page +
    "&columns=" +
    lottoColumns +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;
  const url8 =
    "http://127.0.0.1:5001/api/lotto/numberDraws?lotto_name=" +
    lottoName +
    "&page_number=" +
    page +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;

  const url20 =
    "http://127.0.0.1:5001/api/preprocess_dataset?lotto_name=" + lottoName;

  const url21 = "http://127.0.0.1:5001/api/train_scikit_learn_model";
  const url22 = "http://127.0.0.1:5001/api/train_lottery_model";
  const url23 = "http://127.0.0.1:5001/api/predict_next_draw";

  useEffect(() => {
    const getCurrentDrawNumber = async () => {
      try {
        setError(null);
        const response = await axios(url10);
        setDrawNumber(response.data.drawNumber);
      } catch (err) {
        setError(
          "Failed to fetch the draw number. Please try again later, error: " +
            err
        );
      }
    };

    getCurrentDrawNumber();

    //console.log(drawNumber)
  }, [url10]);

  const lottoNameToInt = {
    BC49: 1,
    Lotto649: 2,
    LottoMax: 3,
    DailyGrand: 4,
    DailyGrand_GrandNumber: 5,
    openai_saying: 6,
    Lotto_Dataset: 7,
  };

  const selectLotto = (value) => {
    setLottoName(lottoNameToInt[value]);

    console.log();
    setSelectedOption(value);
    switch (value) {
      case "BC49":
        setNumberRange(49);
        setPotentialColumns(6);
        return setLottoColumns(7);
      case "Lotto649":
        setNumberRange(49);
        setPotentialColumns(6);
        return setLottoColumns(7);
      case "LottoMax":
        setNumberRange(50);
        setPotentialColumns(7);
        return setLottoColumns(8);
      case "DailyGrand":
        setNumberRange(49);
        setPotentialColumns(5);
        return setLottoColumns(5);
      case "DailyGrand_GrandNumber":
        setNumberRange(7);
        return setLottoColumns(1);
      default:
        return setLottoColumns(6);
    }
  };

  const setPlayType = (value) => {
    setSelectedStatsOption(value);
    setSelectedAiOption("");
    setLastSelected("selectedStatsOption");
    setSortType(value);
  };

  const handleDrawNumberChange = (event) => {
    // Ensure that only numeric values are entered
    //const numericValue = event.target.value.replace(/[^0-9]/g, '')
    const numericValue = parseInt(event.target.value);
    if (!isNaN(numericValue)) {
      setDrawNumber(numericValue);
    }
  };

  const lottoStatisticsOptionLabels = {
    number: "Lotto Numbers",
    distance: "Number Distance",
    totalHits: "Number's Total Hits",
    lottoDraws: "Lotto Draw History",
    numberDraws: "Hit Numbers in Number Category",
    predictDraws: "Predict Next Draw",
    openai_saying: "OpenAI Says",
  };

  const aiTrainingOptionLabels = {
    preprocess_dataset: "Preprocess Dataset",
    lotto_training_model: "Train Lotto Model",
    train_lotto_model: "Lotto Model Training",
    predict_next_draw: "Predict Next Draw",
  };

  const handleChange2 = (value) => {
    setSelectedAiOption(value);
    setSelectedStatsOption("");
    setLastSelected("selectedAiOption");
  };

  const selectedOp =
    lastSelected === "selectedAiOption"
      ? selectedAiOption
      : selectedStatsOption;

  return (
    <Styles>
      {
        <div>
          <nav className="navbar navbar-expand-xl bg-info sticky noqII">
            <Stack
              direction="row"
              spacing={-10}
              sx={{
                width: "100%",
                flexWrap: "wrap",
                justifyContent: "normal",
                alignItems: "center",
                padding: "8px 16px 2px 2px",
                flexGrow: 1,
              }}
            >
              {error ? (
                <p style={{ color: "red" }}>{error}</p>
              ) : drawNumber === null ? (
                <p>Loading...</p>
              ) : (
                <>
                  <a href="/images">
                    <img
                      src={LottoTryLogo}
                      className="App-logo img-fluid"
                      alt="Lottotry Logo"
                      style={{
                        width: "60%",
                        height: "auto",
                        position: "relative",
                        zIndex: 10,
                      }}
                    />
                  </a>
                  <ul className="navbar-nav" style={{ width: "90%" }}>
                    <li className="nav-item">
                      <div className="mt-1 margin-left fw-bold">
                        <select
                          value={selectedOption}
                          id="rpp"
                          className="dropdown btn bg-info text-white dropdown-toggle margin-right fw-bolder"
                          onChange={(e) => selectLotto(e.target.value)}
                        >
                          {[
                            "BC49",
                            "LottoMax",
                            "Lotto649",
                            "DailyGrand",
                            "DailyGrand_GrandNumber",
                          ].map((lotto) => (
                            <option key={lotto} value={lotto}>
                              {lotto}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>

                    <li className="nav-item">
                      <div className="mt-1 margin-left margin-right fw-bold">
                        <select
                          value={selectedStatsOption}
                          className="dropdown btn bg-info text-white dropdown-toggle  fw-bolder"
                          onChange={(e) => setPlayType(e.target.value)}
                        >
                          <option value="" disabled hidden>
                            Select Lotto Statistics
                          </option>
                          {Object.keys(lottoStatisticsOptionLabels).map(
                            (item) => (
                              <option key={item} value={item}>
                                {lottoStatisticsOptionLabels[item]}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </li>

                    <li className="nav-item">
                      <div className="mt-1 margin-left margin-right fw-bold">
                        <select
                          className="dropdown btn bg-info text-white dropdown-toggle ps-4 fw-bolder margin-right"
                          value={selectedAiOption}
                          onChange={(e) => handleChange2(e.target.value)}
                        >
                          <option value="" disabled hidden>
                            Select AI Options
                          </option>
                          {Object.keys(aiTrainingOptionLabels).map((item) => (
                            <option key={item} value={item}>
                              {aiTrainingOptionLabels[item]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>

                    <li className="nav-item">
                      <div className="mt-1 margin-left margin-right fw-bold dropdown-width">
                        <select
                          className="dropdown btn bg-info text-white dropdown-toggle ps-4 fw-bolder"
                          value={pageSize}
                          onChange={(e) => setPageSize(e.target.value)}
                        >
                          {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                              {" "}
                              {pageSize}
                            </option>
                          ))}
                        </select>
                        <span className="bg-info text-white ps-2 fw-bolder">
                          draws / per page
                        </span>
                      </div>
                    </li>

                    <li className="nav-item">
                      <div className="margin-left mt-1 row  dropdown-width">
                        <div class="col-md-6 mt-1">
                          <label
                            for="textInput"
                            className="bg-info text-white ps-3 fw-bold"
                          >
                            Current Draw
                          </label>
                        </div>
                        <TextField
                          type="number"
                          sx={{
                            width: 100, // Width of the text field
                            padding: "0px",
                            borderRadius: "1px",
                            "& .MuiInputBase-input": {
                              color: "red", // Text color
                              fontWeight: "bold", // Make text bold
                              fontSize: "16px", // Text size
                              textAlign: "center", // Align text to center
                              fontStyle: "italic",
                              background: "lightYellow",
                              overflow: "auto",
                              padding: "5px",
                            },
                          }}
                          id="numberInput"
                          name="numberInput"
                          value={drawNumber}
                          onChange={handleDrawNumberChange}
                        />
                      </div>
                    </li>
                  </ul>
                </>
              )}
            </Stack>
          </nav>
          <>
            {(() => {
              switch (selectedOp) {
                case "openai_saying":
                  return <ApiOpenAI endpoint={url} />;
                case "preprocess_dataset":
                  return <DisplayDataset endpoint={url20} />;
                case "training_model":
                  return <ModelTrainingResult endpoint={url21} />;
                case "train_lotto_model":
                  return <LottoModelTrainingResult endpoint={url22} />;
                case "predict_next_draw":
                  return <AiPredictNextDraw endpoint={url23} />;
                case "lottoDraws":
                  return <LottoDraws endpoint={url7} columns={lottoColumns} />;
                case "numberDraws":
                  return (
                    <NumberDrawsInDistance endpoint={url8} rows={pageSize} />
                  );
                case "predictDraws":
                  return (
                    <PredictDraws
                      endpoint={url5}
                      endpoint2={url9}
                      columns={potentialColumns}
                      rows={pageSize}
                      drawNumber={drawNumber}
                    />
                  );
                default:
                  return <ApiNumbers endpoint={url4} sortType={sortType} />;
              }
            })()}
          </>
        </div>
      }
    </Styles>
  );
};

export default App;
