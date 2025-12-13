import { Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import ApiNumbers from "./ApiNumbers";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import axios from "axios";
import "../App.css";
import "../styles.css";
import LottoTryLogo from "../images/LottoTryLogo.png";
import PredictDraws from "./PredictDraws";
import PotentialNumbers from "./PotentialNumbers";
import LottoDraws from "./LottoDraws";
import NumberDrawsInDistance from "./NumberDrawsInDistance";
import ApiOpenAI from "./ApiOpenAI";
import DisplayDataset from "./DisplayDataset";
import PredictionChart from "./PredictionChart_LSTM";
import LottoPlot from "./LottoPlot";
import LottoPlot_LSBM from "./LottoPlot_LSBM";
import LottoPlot_LSTM from "./LottoPlot_LSTM";
import LottoPlot_Multi_Models from "./LottoPlot_Multi_Models";
import { grey, lime, blue, lightBlue, red } from "@mui/material/colors";
import AiAnalysis from "./AiAnalysis";
import DalleImageGenerator from "./DalleImageGenerator";
import HitNumberDistribution from "./HitNumberDistribution";
import ImageEditor from "./ImageEditor";
import ImageUpload from "./UploadImage";
import DragDropUpload from "./DragDropUpload";
import ImageGallery from "./ImageGallery";

import {
  AppBar,
  Toolbar,
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
  Button,
} from "@mui/material";

//export const BASE_URL = "http://127.0.0.1:5001";
export const BASE_URL = "http://ep.lottotry.com:5001";

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
      text-align: center;
    }
  }
`;

const Dashboard = () => {
  //const [selectedLotto, setSelectedLotto] = useState('AllNumbers')
  const [sortType, setSortType] = useState("number");
  const [numberRange, setNumberRange] = useState(49);

  // change default lotto options
  const [lottoName, setLottoName] = useState(1);
  const [lottoColumns, setLottoColumns] = useState(7);
  const [potentialColumns, setPotentialColumns] = useState(6);
  const [selectedOption, setSelectedOption] = useState("BC49");
  const [selectedStatsOption, setSelectedStatsOption] = useState("");
  const [selectedValue, setSelectedValue] = React.useState(""); // Default empty
  const [selectedAiOption, setSelectedAiOption] = React.useState(""); // Default empty
  const [lastSelected, setLastSelected] = React.useState(""); // Track last changed dropdown
  const [selectedOp, setSelectedOp] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(1);
  //const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10);
  const [drawNumber, setDrawNumber] = useState(1);
  const [error, setError] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const url10 =
    `${BASE_URL}/api/lotto/getCurrentDrawNumber?lotto_name=` + lottoName;
  const url = `${BASE_URL}/api/openai`;
  const url4 =
    `${BASE_URL}/api/lotto/allNumbers?lotto_name=` +
    lottoName +
    "&page_number=" +
    page +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;
  const url5 =
    `${BASE_URL}/api/lotto/predict?lotto_name=` +
    lottoName +
    "&columns=" +
    lottoColumns +
    "&drawNumber=" +
    drawNumber;

  const url7 =
    `${BASE_URL}/api/lotto/lottoDraws?lotto_name=` +
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
    `${BASE_URL}/api/lotto/numberDraws?lotto_name=` +
    lottoName +
    "&page_number=" +
    page +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;
  const url9 =
    `${BASE_URL}/api/lotto/potential_draws?lotto_name=` +
    lottoName +
    "&columns=" +
    potentialColumns +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;
  const url20 =
    `${BASE_URL}/api/preprocess_dataset?lotto_name=` +
    lottoName +
    "&drawNumber=" +
    drawNumber;

  const url21 = `${BASE_URL}/api/train_scikit_learn_model`;
  const url22 =
    "${BASE_URL}/api/train_lottery_model?lotto_name=" +
    lottoName +
    "&drawNumber=" +
    drawNumber;
  const url23 =
    `${BASE_URL}/api/predict_next_draw_lgbm?lotto_name=` +
    lottoName +
    "&drawNumber=" +
    drawNumber;
  const url24 =
    `${BASE_URL}/api/train_multi_models?lotto_name=` +
    lottoName +
    "&drawNumber=" +
    drawNumber;

  const url25 =
    `${BASE_URL}/api/lstm_predict_next_draw?lotto_name=` +
    lottoName +
    "&drawNumber=" +
    drawNumber;

  const url26 =
    `${BASE_URL}/api/lotto/potential_numbers?lotto_name=` +
    lottoName +
    "&columns=" +
    potentialColumns +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber +
    "&targetRows=";
  const url27 =
    `${BASE_URL}/api/AiAnalysis?lotto_name=` +
    lottoName +
    "&drawNumber=" +
    drawNumber +
    "&analyze=";

  const url28 =
    `${BASE_URL}/api/lotto/pastDraws?lotto_name=` +
    lottoName +
    "&page_number=" +
    page +
    "&page_size=" +
    pageSize +
    "&drawNumber=" +
    drawNumber;

  const url29 = `${BASE_URL}/api/generate-image`;

  const url30 = `${BASE_URL}/images/edit-image`;

  const url31 = `${BASE_URL}/images/upload`;
  const url32 = `${BASE_URL}/images/uploads`;
  const url33 = `${BASE_URL}/images`;

  

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

    //console.log();
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
    setSelectedOp(value);
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
    potentialNumbers: "Get Potential Hit Numbers for Next Draw",
    AiAnalysis: "Gen Draws & AI Analysis",
    pastDraws: "Past Draws Distribution",
    openai_saying: "OpenAI Says",
  };

  const aiTrainingOptionLabels = {
    train_lotto_model: "Train Pipeline Prediction",
    train_lotto_model_lgbm: "Train LightGBM Prediction",
    train_LSTM_model: "Train LSTM Prediction",
    train_multi_models: "Train Multi Models Prediction",
  };

  const aiImageOptions = {
    generate_image: "Generate DALL·E-3 image",
    upload_image: "Upload image",
    dragdrop_upload_image: "Drag & Drop Upload",
    image_gallery: "AI Image Gallery",
    edit_image: "Edit image (Inpaint)",
    kaia_countdown: "Kaia Birth Date Countdown",
  };

  const handleChange2 = (value) => {
    setSelectedOp(value);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.clear();
    //return <Navigate to="/login" replace />;
    setRedirect(true);
  };

  if (redirect) {
    //return <Navigate to="/login" replace />;
    window.location.href = "/";
  }

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
                          {Object.keys(aiTrainingOptionLabels).map(
                            (item, index) => (
                              <option key={index} value={item}>
                                {aiTrainingOptionLabels[item]}
                              </option>
                            )
                          )}
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
                          {[5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500].map(
                            (pageSize) => (
                              <option key={pageSize} value={pageSize}>
                                {" "}
                                {pageSize}
                              </option>
                            )
                          )}
                        </select>
                        <span className="bg-info text-white ps-2 fw-bolder">
                          draws / per page
                        </span>
                      </div>
                    </li>
                    <li className="nav-item">
                      <div className="margin-left mt-1 row  dropdown-width">
                        <div className="col-md-6 mt-1">
                          <label
                            htmlFor="textInput"
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
                    <li className="nav-item">
                      <div className="mt-1 margin-left margin-right fw-bold">
                        <select
                          className="dropdown btn bg-info text-white dropdown-toggle ps-4 fw-bolder margin-right"
                          value={selectedAiOption}
                          //onChange={(e) => handleChange2(e.target.value)}
                          onChange={(e) => {
                            if (e.target.value == "kaia_countdown") {
                              window.location.href = e.target.value + ".html";
                            } else {
                              return handleChange2(e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled hidden>
                            AI Generated Image
                          </option>
                          {Object.keys(aiImageOptions).map((item, index) => (
                            <option key={index} value={item}>
                              {aiImageOptions[item]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  </ul>
                </>
              )}
            </Stack>
            <Box
              sx={{
                ml: "auto",
                mr: "10px",
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: grey[100],
                  color: red["A700"],
                  fontWeight: 700,
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </nav>
          <>
            {(() => {
              switch (selectedOp) {
                case "openai_saying":
                  return <ApiOpenAI endpoint={url} />;
                case "train_lotto_model":
                  return <LottoPlot endpoint={url22} />;
                case "train_lotto_model_lgbm":
                  return <LottoPlot_LSBM endpoint={url23} />;
                case "train_multi_models":
                  return <LottoPlot_Multi_Models endpoint={url24} />;
                case "train_LSTM_model":
                  return <LottoPlot_LSTM endpoint={url25} />;
                case "lottoDraws":
                  return <LottoDraws endpoint={url7} columns={lottoColumns} />;
                case "pastDraws":
                  return (
                    <HitNumberDistribution
                      endpoint={url28}
                      lottoName={lottoName}
                    />
                  );
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
                case "potentialNumbers":
                  return (
                    <PotentialNumbers
                      endpoint={url5}
                      endpoint2={url26}
                      columns={potentialColumns}
                      rows={pageSize}
                      drawNumber={drawNumber}
                    />
                  );
                case "AiAnalysis":
                  return (
                    <AiAnalysis
                      endpoint={url27}
                      sortType={sortType}
                      lottoName={lottoName}
                    />
                  );
                case "generate_image":
                  return <DalleImageGenerator endpoint={url29} />;
                case "upload_image":
                  return <ImageUpload endpoint={url31} />;
                case "dragdrop_upload_image":
                  return <DragDropUpload endpoint={url32} />;
                case "image_gallery":
                  return <ImageGallery endpoint={url33} />;
                case "edit_image":
                  return <ImageEditor endpoint={url30} />;
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

export default Dashboard;
