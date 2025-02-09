// DisplayDataset.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { Table } from "react-bootstrap";

const ModelTrainingResult = (props) => {
  const { endpoint } = props;
  const [data, setData] = useState("");

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios
      .get(endpoint)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [endpoint]);

  return (
    <div className="card">
      <h3 className="text-secondary mt-2 text-center">
        Model Prediction Results
      </h3>
      {data ? (
        <Table striped borderd hover className="text-center mt-2">
          <thead className="text-center">
            <th className="text-info">Index</th>
            <th className="text-info">Number</th>
            <th className="text-info">Probability</th>
          </thead>
          <tbody className="fw-bold">
            {data.numbers.map((num, index) => (
              <tr key={index}>
                <td className="text-warning">{index + 1}</td>
                <td className="text-primary">{num}</td>
                <td className="text-success">
                  {data.probabilities[index].toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ModelTrainingResult;
