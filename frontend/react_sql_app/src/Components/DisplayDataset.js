// DisplayDataset.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const DisplayDataset = (props) => {
  const { endpoint } = props;
  const [data, setData] = useState("");

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

  return (
    <div className="card">
      <h3 className="text-info">Displaying Dataset</h3>
      {data ? (
        <div
          className="card-body  ml-4"
          dangerouslySetInnerHTML={{ __html: data }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DisplayDataset;
