import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table } from "react-bootstrap";
import "../App.css";
import classNames from "classnames";
import CircularProgress from "@mui/material/CircularProgress";
import Slider from "./Slider";

export const getTD = (number, n = 1) => {
  return (
    <td className={getBgColors(number)} key={number.Value}>
      <span
        className={classNames(
          "txt-color",
          { "my-color-4 fs-4": number.Distance === 0 },
          { "text-danger fs-4": number.Distance > 10 },
        )}
      >
        {number.Value}
      </span>{" "}
      {n >= 2 ? <br /> : null}
      <span
        className={classNames(
          "txt-color",
          { "fst-italic my-color-1 fs-6": number.Distance > 10 },
          { "fst-italic text-success fs-6": number.Distance <= 10 },
        )}
      >
        ({number.Distance})
      </span>{" "}
      {n >= 2 ? <br /> : null}
      <span className="text-primary fst-italic fs-6">
        ({number.TotalHits})
      </span>{" "}
      <span className="text-danger fst-italic fs-6">({number.Frequency})</span>{" "}
      {n >= 2 ? <br /> : null}
      <span
        className={classNames(
          "txt-color",
          { "yellow-indigo fst-italic fs-6": number.Probability > 0 },
          { "teal-indigo fst-italic fs-6": number.Probability === 0 },
        )}
      >
        ({number.Probability})
      </span>{" "}
      {n !== 3 && n !== 0 ? (
        <span className="my-color-5 fs-7">
          {" "}
          [{number.NumberOfAppearing - 1}]
        </span>
      ) : null}
    </td>
  );
};

export const createMatchedDic = (allNumbers, matchedNumbers, targetDraw) => {
  // Build matchedDic here
  const matchedDic = {};
  const targetDrawDic = {};

  const tickets = matchedNumbers.map((item) =>
    item.ticket.split(/\s+/).map(Number),
  );
  tickets.forEach((ticket) => {
    ticket.forEach((value) => {
      const number = allNumbers.find((x) => x.Value === value);

      if (number) {
        matchedDic[value] = {
          Value: number.Value,
          Distance: number.Distance,
          TotalHits: number.TotalHits,
          Probability: number.Probability,
          Frequency: number.Frequency,
        };
      }
    });
  });
  targetDraw.forEach((value) => {
    const number = allNumbers.find((x) => x.Value === value);
    if (number) {
      targetDrawDic[value] = {
        Value: number.Value,
        Distance: number.Distance,
        TotalHits: number.TotalHits,
        Probability: number.Probability,
        Frequency: number.Frequency,
      };
    }
  });
  return { matchedDic, targetDrawDic };
};

export const getHeader_4 = (arr, matchedNumbers_length) => {
  return (
    <thead className="table-danger text-center">
      <tr>
        <th className="text-warning bg-primary">#</th>
        {arr.map((no) => (
          <th key={no} className="text-warning bg-success fst-italic">
            {no + 1}
          </th>
        ))}
        <th className="text-warning bg-danger fst-italic">Matches</th>
        <th
          colSpan={matchedNumbers_length}
          className="text-warning bg-primary fst-italic"
        >
          Match Numbers
        </th>
      </tr>
    </thead>
  );
};
export const getHeader_5 = (arr) => {
  return (
    <thead className="table-danger text-center">
      <tr>
        <th className="text-warning bg-success">Target Draw NUmber</th>
        {arr.map((no) => (
          <th key={no} className="text-warning bg-success fst-italic">
            {no + 1}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const getBgColors = (number) => {
  if (number.Value < 10) {
    return "bg-color20 text-center text-success fs-4 fw-bold px-2";
  } else if (number.Value < 20) {
    return "bg-color19 text-center text-success fs-4 fw-bold px-2";
  } else if (number.Value < 30) {
    return "bg-color6 text-center text-success fs-4 fw-bold px-2";
  } else if (number.Value < 40) {
    return "bg-color3 text-center text-success fs-4 fw-bold px-2";
  } else {
    return "bg-color10 text-center text-success fs-4 fw-bold px-2";
  }
};

const PredictDraws = (props) => {
  const {
    endpoint,
    endpoint2,
    endpoint3,
    columns,
    drawNumber,
    lottoName,
  } = props;

  const [matched, setMatched] = useState([]);
  const [numbers, setNumbers] = useState();
  const [predicts, setPredicts] = useState([]);
  const [hitting, setHitting] = useState([]);
  const [missing, setMissing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numMatches, setNumMatches] = useState(3);
  const [matchedDic, setMatchedDic] = useState({});
  const [targetDrawDic, setTargetDrawDic] = useState({});
  const [maxMatches, setMaxMatches] = useState(0);
  const [targetNumber, setTargetNumber] = useState([]);
  const [canMatch, setCanMatch] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const processNextPotentialDraws = async () => {
      try {
        const promises = [await axios.post(endpoint2)];
        const responses = await Promise.all(promises);

        // Extract data from each response
        return responses.map((response) => response.data);
      } catch (error) {
        console.error("Error processing next prediction:", error);
      }
    };

    try {
      const result = await processNextPotentialDraws();
      const data = result[0];
      const hit = data.pop();
      const miss = data.pop();

      setHitting(hit);
      setMissing(miss);
      setPredicts(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating predicts:", error);
    }
    console.log("Fetching data...");
  }, [endpoint2]);

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
        tickets: predicts.map((row) => row.map((number) => number.Value)),
      };

      const response = await axios.post(endpoint3, requestData);

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
  }, [endpoint2, endpoint3, lottoName, drawNumber, numMatches, predicts]);

  // Get predictions
  useEffect(() => {
    fetchData();
    getNumbers();
  }, [fetchData, getNumbers, drawNumber]);

  // Match tickets whenever predictions change
  useEffect(() => {
    if (predicts.length > 0) {
      getMatched();
    }
  }, [endpoint2, predicts, drawNumber, lottoName, numMatches]);

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

  const getRow = (start, end) => {
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
                  { "my-color-4 fs-4": number.Distance === 0 },
                  { "text-danger fs-4": number.Distance > 10 },
                )}
              >
                {number.Value}
              </span>
              <span
                className={classNames(
                  "txt-color",
                  { "fst-italic my-color-1 fs-6": number.Distance > 10 },
                  { "fst-italic text-success fs-6": number.Distance <= 10 },
                )}
              >
                ({number.Distance})
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
            {getRow(0, 10)}
            {getRow(10, 20)}
            {getRow(20, 30)}
            {getRow(30, 40)}
            {getRow(40, 50)}
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
          onClick={() => fetchData()}
          className="btn btn-info text-white fw-bold mb-2 three-d-button"
          disabled={isLoading}
        >
          Generate Potential Draws
        </button>
      </div>
      {Array.isArray(predicts) && predicts.length > 0 && !isLoading ? (
        <Table bordered hover responsive className="table-light mb-2" size="lg">
          {getHeader_2()}
          <tbody className="fw-bold align-middle">
            {predicts.map((row, index) => (
              <tr key={index}>
                <td className="bg-color3 text-primary fs-5 fst-italic">
                  {index + 1}
                </td>
                {row.map((number) => getTD(number))}
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
      <div id="matchingResult">
        <h4 className="text-success fst-italic mt-4 text-center">
          Predict draws are matched to the past target draw, if target draw is
          not a future draw.
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
            onClick={() => fetchData()}
            className="btn btn-info text-white fw-bold mb-2 three-d-button"
            disabled={isLoading}
          >
            Generate Potential Draws
          </button>
        </div>
      </div>
      <h4 className="text-success fst-italic mt-4 text-center">
        Numbers were hit above
      </h4>
      {hitting && hitting.length > 0 && !isLoading ? (
        <div className="table-container">
          <Table bordered className="mt-2" size="lg">
            {getHeader_3(hitting)}
            <tbody className="fw-bold align-middle">
              <tr>{hitting.map((number) => getTD(number, 2))}</tr>
            </tbody>
          </Table>
        </div>
      ) : (
        ""
      )}
      <h4 className="text-danger fst-italic mt-4 text-center">
        Numbers were NOT hit above
      </h4>
      {missing && missing.length > 0 && !isLoading ? (
        <div className="table-container">
          <Table bordered className="mt-2 " size="lg">
            {getHeader_3(missing)}
            <tbody className="fw-bold align-middle">
              <tr>{missing.map((number) => getTD(number, 3))}</tr>
            </tbody>
          </Table>
        </div>
      ) : (
        ""
      )}

      <div className="d-flex justify-content-end">
        <button
          type="button"
          onClick={() => fetchData()}
          className="btn btn-info text-white fw-bold mb-2 three-d-button"
          disabled={isLoading}
        >
          Generate Potential Draws
        </button>
      </div>
    </div>
  );
};

export default PredictDraws;
