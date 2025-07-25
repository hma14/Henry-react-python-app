import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
//import moment   from 'moment'
import "../App.css";
import styled from "styled-components";

const StyledTable = styled.table`
  width: 100%;
  table-layout: auto;
`;

const MetaColumn = styled.th`
  width: 5%;
`;
const MetaColumnTd = styled.td`
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
          <MetaColumn className="text-success bg-info">#</MetaColumn>
          <MetaColumn className="text-success bg-info">Draws</MetaColumn>
          <DateColumn className="text-success bg-info">Date</DateColumn>
          <th className="text-success bg-info">1-9</th>
          <th className="text-success bg-info">10-19</th>
          <th className="text-success bg-info">20-29</th>
          <th className="text-success bg-info">30-39</th>
          {lottoName === 3 ? (
            <th className="text-success bg-info">40-50</th>
          ) : (
            <th className="text-success bg-info">40-49</th>
          )}
        </tr>
      </thead>
    );
  };

  return (
    <div>
      {lottoData && lottoData.length > 0 && (
        <StyledTable bordered hover className="table table-secondary mb-4">
          {getHeader(lottoName)}
          <tbody className="fw-bold">
            {lottoData.map((row, index) => (
              <tr key={row[0]}>
                <MetaColumnTd className="text-light bg-info">
                  {index + 1}
                </MetaColumnTd>
                <MetaColumnTd className="text-light bg-info">
                  {row[0]}
                </MetaColumnTd>
                <DateColumnId className="text-light bg-info">
                  {row[1]}
                </DateColumnId>
                {row[2]["1-9"] > 0 ? (
                  <td className="text-danger bg-warning wider-td">
                    {row[2]["1-9"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["10-19"] > 0 ? (
                  <td className="text-danger bg-warning wider-td">
                    {row[2]["10-19"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["20-29"] > 0 ? (
                  <td className="text-danger bg-warning wider-td">
                    {row[2]["20-29"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["30-39"] > 0 ? (
                  <td className="text-danger bg-warning wider-td">
                    {row[2]["30-39"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
                {row[2]["40-49"] > 0 ? (
                  <td className="text-danger bg-warning wider-td">
                    {row[2]["40-49"]}
                  </td>
                ) : (
                  <td className="bg-greenyellow wider-td"></td>
                )}
              </tr>
            ))}
          </tbody>
          {getHeader(lottoName)}
        </StyledTable>
      )}
    </div>
  );
}
export default HitNumberDistribution;
