// ApiBc49.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table } from "react-bootstrap";
import "../App.css";
import "../App.scss";
import classNames from "classnames";

const ApiNumbers = (props) => {
  const { endpoint, sortType } = props;
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(endpoint)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [endpoint]);

  const types = {
    number: "number",
    distance: "Distance",
    totalHits: "TotalHits",
  };
  const sortProperty = types[sortType];

  const getBgColors = (sortType, number) => {
    if (sortType.toLowerCase() === types.distance.toLowerCase()) {
      switch (number.Distance) {
        case 1:
          return "bg-color18 text-success fw-bold";
        case 2:
          return "bg-color2 text-success fw-bold";
        case 3:
          return "bg-color3 text-success fw-bold";
        case 4:
          return "bg-color1 text-success fw-bold";
        case 5:
          return "bg-color5 text-success fw-bold";
        case 6:
          return "bg-color6 text-success fw-bold";
        case 7:
          return "bg-color7 text-success fw-bold";
        case 8:
          return "bg-color8 text-success fw-bold";
        case 9:
          return "bg-color9 text-success fw-bold";
        case 10:
          return "bg-color10 text-success fw-bold";
        case 11:
          return "bg-color11 text-success fw-bold";
        case 12:
          return "bg-color12 text-success fw-bold";
        case 13:
          return "bg-color13 text-success fw-bold";
        case 14:
          return "bg-color14 text-success fw-bold";
        case 15:
          return "bg-color15 text-success fw-bold";
        case 16:
          return "bg-color16 text-success fw-bold";
        case 17:
          return "bg-color17 text-success fw-bold";
        case 18:
          return "bg-color18 text-success fw-bold";
        case 19:
          return "bg-color19 text-success fw-bold";
        case 20:
          return "bg-color20 text-success fw-bold";
        case 21:
          return "bg-color21 text-success fw-bold";
        case 22:
          return "bg-color22 text-success fw-bold";
        case 23:
          return "bg-color23 text-success fw-bold";
        case 24:
          return "bg-color24 text-success fw-bold";
        case 25:
          return "bg-color25 text-success fw-bold";
        default:
          return "bg-color1 text-success fw-bold";
      }
    } else {
      if (number.IsNextPotentialHit === true) {
        return "text-success bg-color-ph fw-bold";
      }
      return "text-success bg-light fw-bold";
    }
  };

  const headerBgColorMap = [
    {
      minValue: 0,
      className:
        "bg-color20 text-center text-danger fs-6 fw-bold px-2 fst-italic",
    },
    {
      minValue: 10,
      className:
        "bg-color7 text-center text-danger fs-6 fw-bold px-2 fst-italic",
    },
    {
      minValue: 20,
      className:
        "bg-color6 text-center text-danger fs-6 fw-bold px-2 fst-italic",
    },
    {
      minValue: 30,
      className:
        "bg-color3 text-center text-danger fs-6 fw-bold px-2 fst-italic",
    },
    {
      minValue: 40,
      className:
        "bg-color10 text-center text-danger fs-6 fw-bold px-2 fst-italic",
    },
    {
      minValue: 50,
      className:
        "bg-color11 text-center text-danger fs-6 fw-bold px-2 fst-italic",
    },
  ];

  const getHeaderBgColor = (n) => {
    return headerBgColorMap
      .slice()
      .reverse()
      .find((item) => n.Value >= item.minValue).className;
  };

  const getHeader = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          <th className="text-light bg-info">#</th>
          <th className="text-light bg-info">Draws</th>
          <th className="text-light bg-info">Date</th>
          {data.slice(0, 1).map((row) =>
            [...row.Numbers]
              .sort((a, b) => a.value - b.value)
              .map((no) => (
                <th key={no.Value} className={getHeaderBgColor(no)}>
                  {no.Value}
                </th>
              ))
          )}
        </tr>
      </thead>
    );
  };

  const getColors = (number) => {
    if (number.IsHit === true) {
      return (
        <td
          className={classNames(
            "bg-color",
            { "my-color-1 bg-color12": number.IsBonusNumber },
            { "my-color-1 bg-color1": !number.IsBonusNumber },
            { "bg-color5": number.IsNextPotentialHit === true }
          )}
        >
          {number.Value}
          <br />(
          <span
            className={classNames(
              "txt-color",
              {
                "my-color-3 fst-italic fs-7": number.NumberOfDrawsWhenHit > 10,
              },
              {
                "text-danger fst-italic fs-7":
                  number.NumberOfDrawsWhenHit <= 10,
              }
            )}
          >
            {number.NumberOfDrawsWhenHit}
          </span>
          )<br />(
          <span className="text-secondary fst-italic fs-7">
            {number.TotalHits}
          </span>
          ) (
          <span
            className={classNames(
              "txt-color",
              { "red-indigo fst-italic fs-7": number.Probability > 0 },
              { "teal-indigo fst-italic fs-7": number.Probability === 0 }
            )}
          >
            {number.Probability}
          </span>
          )
          {/* {number.isNextPotentialHit !== null && number.isNextPotentialHit === true ? (<><br />(<span className='text-danger fst-italic'>{number.isNextPotentialHit === true ? "PH" : ""}</span>)</>) : ""} */}
        </td>
      );
    } else {
      return (
        <td className={getBgColors(sortType, number)}>
          {number.Value}
          <br />(
          <span
            className={classNames(
              "txt-color",
              { "fst-italic my-color-1 fs-7": number.Distance > 10 },
              { "fst-italic text-success fs-7": number.Distance <= 10 }
            )}
          >
            {number.Distance}
          </span>
          )<br />(
          <span className="text-primary fst-italic fs-7">
            {number.TotalHits}
          </span>
          ) (
          <span
            className={classNames(
              "txt-color",
              { "red-indigo fst-italic fs-7": number.Probability > 0 },
              { "cyan-indigo fst-italic fs-7": number.Probability === 0 }
            )}
          >
            {number.Probability}
          </span>
          )
          {/* {number.isNextPotentialHit !== null && number.isNextPotentialHit === true ? (<><br />(<span className='text-danger fst-italic'>{number.isNextPotentialHit === true ? "PH" : ""}</span>)</>) : ""} */}
        </td>
      ); /* The `}` closing curly brace in the code snippet you provided is closing the `ApiNumbers`
      functional component in JavaScript. This brace marks the end of the component's definition
      and encapsulates all the JSX elements and logic within the component. */
    }
  };

  return (
    <div>
      {data && data.length > 0 && (
        <Table responsive className="table-default mb-4" size="sm" hover="true">
          {getHeader()}
          <tbody className="fw-bold">
            {data.map((draw, index) => (
              <tr key={draw.DrawNumber}>
                <td className="text-danger bg-color9 fs-9">{index + 1}</td>
                <td className="text-warning bg-primary fs-7">
                  {draw.DrawNumber}
                </td>
                <td className="text-warning bg-success fs-7">
                  {draw.DrawDate}
                </td>
                {[...draw.Numbers]
                  .sort((a, b) =>
                    a[sortProperty] === b[sortProperty]
                      ? a.value - b.value
                      : a[sortProperty] - b[sortProperty]
                  )
                  .map((no) => getColors(no))}
              </tr>
            ))}
          </tbody>
          {getHeader()}
        </Table>
      )}
    </div>
  );
};

export default ApiNumbers;
