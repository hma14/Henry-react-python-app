import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table } from "react-bootstrap";
import "../App.css";
import classNames from "classnames";
import CircularProgress from "@mui/material/CircularProgress";
import {
  createMatchedDic,
  getTD,
  getHeader_4,
  getHeader_5,
} from "./PredictDraws";

const RandomGeneratedDraws = (props) => {
  const {
    endpoint,
    endpoint2,
    columns,
    drawNumber,
    lottoName,
    pageSize,
  } = props;

  const [matched, setMatched] = useState([]);
  const [numbers, setNumbers] = useState();
  const [randomTickets, setRandomTickets] = useState([]);
  const [hitting, setHitting] = useState([]);
  const [missing, setMissing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numMatches, setNumMatches] = useState(3);
  const [matchedDic, setMatchedDic] = useState({});
  const [randomTicketsDic, setRandomTicketsDic] = useState({});
  const [targetDrawDic, setTargetDrawDic] = useState({});
  const [maxMatches, setMaxMatches] = useState(0);
  const [targetNumber, setTargetNumber] = useState([]);
  const [canMatch, setCanMatch] = useState(false);
  const [rows, setRows] = useState(0);

  const generateLottoTickets = (db) => {
    let numbersPerDraw, maxNumber;

    switch (db) {
      case 3:
        numbersPerDraw = 7;
        maxNumber = 52;

        break;
      case 25:
        numbersPerDraw = 5;
        maxNumber = 36;
        break;
      case 33:
        numbersPerDraw = 3;
        maxNumber = 10;
        break;
      default:
        numbersPerDraw = 6;
        maxNumber = 49;
    }

    const ticketCount = pageSize;

    let allTickets = [];

    for (let i = 0; i < ticketCount; i++) {
      let nums = [];

      while (nums.length < numbersPerDraw) {
        let n = Math.floor(Math.random() * maxNumber) + 1;

        if (!nums.includes(n)) {
          nums.push(n);
        }
      }

      nums.sort(function(a, b) {
        return a - b;
      });

      let line = nums
        .map(function(n) {
          return ("0" + n).slice(-2);
        })
        .join(" ");

      allTickets.push(line);
    }

    return allTickets.map((ticket) => ticket.split(/\s+/).map(Number));

    //document.getElementById("txtTickets").value = allTickets.join("\n");
    //document.getElementById("lblGeneratedCount").innerText = allTickets.length;
  };

  const createRandomNumberDic = (allNumbers, tickets) => {
    // Build matchedDic here
    const ranNumDic = {};
    if (tickets.length === 0) {
      return ranNumDic;
    }

    tickets.forEach((ticket) => {
      ticket.forEach((value) => {
        const number = allNumbers.find((x) => x.Value === value);

        if (number) {
          ranNumDic[value] = {
            Value: number.Value,
            IsHit: number.IsHit,
            Distance: number.Distance,
            TotalHits: number.TotalHits,
            NumberofDrawsWhenHit: number.NumberofDrawsWhenHit,
            Probability: number.Probability,
            Frequency: number.Frequency,
          };
        }
      });
    });
    return ranNumDic;
  };

  const getNumbers = useCallback(async () => {
    try {
      let response = null;
      if (canMatch) {
        const nextDrawNumber = drawNumber + 1;
        response = await axios(
          endpoint.replace(
            `drawNumber=${drawNumber}`,
            `drawNumber=${nextDrawNumber}`,
          ),
        );
      } else {
        response = await axios(endpoint);
      }

      setNumbers(response?.data[0]?.Numbers);

      const randomNumbers = generateLottoTickets(lottoName);
      setRandomTickets(randomNumbers);
      const ranTickets = createRandomNumberDic(
        response.data[0]?.Numbers,
        randomNumbers,
      );
      setRandomTicketsDic(ranTickets);
    } catch (error) {
      console.error("Error fetching draw number:", error);
    }
    console.log("Random tickets generated:", randomTickets);
  }, [endpoint, pageSize]);

  const getMatched = useCallback(async () => {
    if (randomTickets.length === 0) {
      console.log("No random tickets to match.");
      return;
    }
    try {
      const requestData = {
        lotto_name: lottoName,
        draw_number: drawNumber,
        num_matches: numMatches,
        tickets: randomTickets,
      };

      const response = await axios.post(endpoint2, requestData);

      const { canMatch, matching_results } = response.data;
      setCanMatch(canMatch);
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
  }, [endpoint, endpoint2, lottoName, drawNumber, numMatches, randomTickets]);

  // Get predictions
  useEffect(() => {
    getNumbers();
  }, [drawNumber, lottoName, pageSize]);

  // Match tickets whenever predictions change
  useEffect(() => {
    setRows(pageSize);

    if (randomTickets?.length > 0) {
      getMatched();
    }
  }, [drawNumber, lottoName, numMatches, pageSize, randomTickets]);

  const getHeader = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          {Array.from(Array(10).keys()).map((no) => (
            <th key={no} className="text-warning bg-success fst-italic">
              {no + 1}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const getHeader_2 = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          <th className="text-warning bg-primary">#</th>
          {Array.from(Array(columns).keys()).map((no) => (
            <th key={no} className="text-warning bg-success fst-italic">
              {no + 1}
            </th>
          ))}
        </tr>
      </thead>
    );
  };
  const getHeader_3 = (arr) => {
    return (
      <thead className="table-danger text-center">
        <tr>
          {Array.from(Array(arr.length).keys()).map((no) => (
            <th key={no} className="text-warning bg-success fst-italic">
              {no + 1}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const getRow = (start, end, rows) => {
    return (
      <tr>
        {numbers.map((number) =>
          number.Value > start && number.Value <= end ? (
            <td
              className="bg-color1 text-center text-success fs-4 fw-bold px-2"
              key={number.Value}
            >
              <span
                className={classNames(
                  "txt-color",
                  { "text-danger fs-4": number.Distance === 0 },
                  { "my-color-4 fs-4": number.Distance > 10 },
                )}
              >
                {number.Value}
              </span>
              <span
                className={classNames(
                  "txt-color",
                  { "fst-italic my-color-2 fs-6": number.Distance > 10 },
                  { "fst-italic text-success fs-6": number.Distance <= 10 },
                )}
              >
                ({number.IsHit ? number.NumberofDrawsWhenHit : number.Distance})
              </span>
              <span className="text-primary fst-italic fs-6">
                ({number.TotalHits})
              </span>
              <span className="text-danger fst-italic fs-6">
                ({number.Frequency})
              </span>
              <span
                className={classNames(
                  "txt-color",
                  "teal-indigo fst-italic fs-6",
                )}
              >
                ({number.Probability})
              </span>
            </td>
          ) : (
            ""
          ),
        )}
      </tr>
    );
  };

  return (
    <div>
      {numbers && (
        <Table
          striped
          bordered
          hover
          responsive
          className="table-light mb-2"
          size="lg"
        >
          {getHeader()}
          <tbody className="fw-bold">
            {getRow(0, 10, rows)}
            {getRow(10, 20, rows)}
            {getRow(20, 30, rows)}
            {getRow(30, 40, rows)}
            {getRow(40, 50, rows)}
          </tbody>
          {getHeader()}
        </Table>
      )}
      <div className="row-container">
        <h2 className="text-success fst-italic text-center">
          Potential next draws
        </h2>
        <h4 className="text-primary">
          Current Draw:{" "}
          <span className="fst-italic fw-bold text-danger">{drawNumber}</span>
        </h4>
        <button
          type="button"
          onClick={() => getNumbers()}
          className="btn btn-info text-white fw-bold mb-2 three-d-button"
          disabled={isLoading}
        >
          Generate Random Draws
        </button>
      </div>
      {Array.isArray(randomTickets) &&
      randomTickets.length > 0 &&
      !isLoading ? (
        <Table bordered hover responsive className="table-light mb-2" size="lg">
          {getHeader_2()}
          <tbody className="fw-bold align-middle">
            {randomTickets.map((row, index) => (
              <tr key={index}>
                <td className="bg-color3 text-primary fs-5 fst-italic">
                  {index + 1}
                </td>
                {row.map((number) => getTD(randomTicketsDic[number], rows, 0))}
              </tr>
            ))}
          </tbody>
          {getHeader_2()}
        </Table>
      ) : (
        <div className="loader-container">
          <CircularProgress size={120} />
        </div>
      )}
      <div id="matchingResult" className="card bg-color27 mt-2 mb-4">
        <h4 className="text-success fst-italic mt-4 text-center">
          Random generated draws are matched to the past target draw, if target
          draw is not a future draw.
        </h4>

        <div className="text-danger ticketHeader fst-italic mt-4 text-center">
          {!isLoading &&
          Array.isArray(targetNumber) &&
          targetNumber.length > 0 &&
          targetDrawDic &&
          Object.keys(targetDrawDic).length > 0 ? (
            <Table bordered className="table-light mb-2" size="lg">
              {getHeader_5(Array.from({ length: columns }, (_, i) => i))}
              <tbody className="fw-bold align-middle">
                <tr>
                  <td className="text-danger bg-color19 fs-4 fw-bold">
                    {drawNumber + 1}
                  </td>
                  {targetNumber.map((number) => {
                    const value = targetDrawDic[number];
                    return value ? getTD(value, rows, 0) : null;
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
            style={{ width: "200px" }}
            value={numMatches}
            onChange={(e) => setNumMatches(Number(e.target.value))}
          >
            {Array.from({ length: columns - 1 }, (_, i) => i + 2).map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        {Array.isArray(matched) &&
        matched.length > 0 &&
        matchedDic &&
        Object.keys(matchedDic).length > 0 &&
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
                    .map((number) => getTD(matchedDic[number], rows, 0))}
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
            onClick={() => getNumbers()}
            className="btn btn-info text-white fw-bold mb-2 three-d-button"
            disabled={isLoading}
          >
            Generate Random Draws
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomGeneratedDraws;
