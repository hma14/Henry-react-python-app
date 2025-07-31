import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
//import moment   from 'moment'
import "../App.css";
import styled from "styled-components";
import classNames from "classnames";

/* const StyledTable = styled.table`
  width: 100%;
  table-layout: auto;
  hover: true;
`;
 */
const MetaColumn = styled.th`
  width: 5%;
`;
const MetaColumnId = styled.td`
  width: 5%;
`;

const DateColumn = styled.th`
  width: 10%;
`;
const DateColumnId = styled.th`
  width: 10%;
`;

function HitNumberDistribution(props) {
  const { endpoint, lottoName } = props;

  const [lottoData, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [endpoint]);

  const getHeader = (lottoName) => {
    return (
      <thead className="table-danger text-center">
        <tr>
          <MetaColumn className="text-warning bg-color16">#</MetaColumn>
          <MetaColumn className="text-warning bg-color16">Draws</MetaColumn>
          <DateColumn className="text-warning bg-color16">Date</DateColumn>
          <th className="text-warning bg-color16">1-9</th>
          <th className="text-warning bg-color16">10-19</th>
          <th className="text-warning bg-color16">20-29</th>
          <th className="text-warning bg-color16">30-39</th>
          {lottoName === 3 ? (
            <th className="text-warning bg-color16">40-50</th>
          ) : (
            <th className="text-warning bg-color16">40-49</th>
          )}
        </tr>
      </thead>
    );
  };

  return (
    <div>
      {lottoData && lottoData.length > 0 && (
        <Table responsive className="table-primary mb-4" size="sm" hover="true">
          {getHeader(lottoName)}
          <tbody className="fw-bold">
            {lottoData.map((row, index) => (
              <tr key={row[0]}>
                <MetaColumnId className="text-secondary bg-color16">
                  {index + 1}
                </MetaColumnId>
                <MetaColumnId className="text-secondary bg-color16">
                  {row[0]}
                </MetaColumnId>
                <DateColumnId className="text-secondary bg-color16">
                  {row[1]}
                </DateColumnId>
                {row[2]["1-9"] > 0 ? (
                  <td
                    className={classNames(
                      "bg-color",
                      {
                        "text-danger bg-warning  fst-italic":
                          row[2]["1-9"] >= 4,
                      },
                      { "text-success bg-warning": row[2]["1-9"] < 4 }
                    )}
                  >
                    {row[2]["1-9"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["10-19"] > 0 ? (
                  <td
                    className={classNames(
                      "bg-color",
                      {
                        "text-danger bg-warning fst-italic":
                          row[2]["10-19"] >= 4,
                      },
                      { "text-success bg-warning": row[2]["10-19"] < 4 }
                    )}
                  >
                    {row[2]["10-19"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["20-29"] > 0 ? (
                  <td
                    className={classNames(
                      "bg-color",
                      {
                        "text-danger bg-warning fst-italic":
                          row[2]["20-29"] >= 4,
                      },
                      { "text-success bg-warning": row[2]["20-29"] < 4 }
                    )}
                  >
                    {row[2]["20-29"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["30-39"] > 0 ? (
                  <td
                    className={classNames(
                      "bg-color",
                      {
                        "text-danger bg-warning fst-italic":
                          row[2]["30-39"] >= 4,
                      },
                      { "text-success bg-warning": row[2]["30-39"] < 4 }
                    )}
                  >
                    {row[2]["30-39"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["40-49"] > 0 ? (
                  <td
                    className={classNames(
                      "bg-color",
                      {
                        "text-danger bg-warning fst-italic":
                          row[2]["40-49"] >= 4,
                      },
                      { "text-success bg-warning": row[2]["40-49"] < 4 }
                    )}
                  >
                    {row[2]["40-49"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
              </tr>
            ))}
          </tbody>
          {getHeader(lottoName)}
        </Table>
      )}
    </div>
  );
}
export default HitNumberDistribution;
