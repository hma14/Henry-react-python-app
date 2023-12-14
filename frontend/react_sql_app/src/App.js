import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  const [data, setData] = useState([]);
  const [openai_response, setOpenai_response] = useState('');

  useEffect(() => {
    /*  axios.get('http://localhost:5000/api/data')
       .then(response => setData(response.data.data))
       .catch(error => console.error('Error fetching data: ', error)); */

    axios.get('http://localhost:5000/api/openai')
      .then(response => setOpenai_response(response.data))
      .catch(error => console.error('Error fetching data: ', error));

    //console.log({ translate })
  }, []);

  return (

    openai_response === null ? (

      <div className="container-fluid mt-5">
        <nav className="navbar navbar-expand-xl bg-color8 sticky noqII"></nav>
        <table responsive className="table mb-4" size="sm" hover="true" striped="true">
          <thead className="table-danger text-center">
            <tr>
              <th className="text-light bg-info">Draw Number</th>
              <th className="text-light bg-info">Date</th>
              <th className="text-light bg-info">No.1</th>
              <th className="text-light bg-info">No.2</th>
              <th className="text-light bg-info">No.3</th>
              <th className="text-light bg-info">No.4</th>
              <th className="text-light bg-info">No.5</th>
              <th className="text-light bg-info">No.6</th>
              <th className="text-light bg-info">Bonus</th>
              {/* Add more table headers if needed */}
            </tr>
          </thead>
          <tbody >
            {data.map(item => (
              <tr key={item.DrawNumber}>
                <td className="text-warning bg-primary">{item.DrawNumber}</td>
                <td className="text-warning bg-success">{item.DrawDate}</td>
                <td>{item.Number1}</td>
                <td>{item.Number2}</td>
                <td>{item.Number3}</td>
                <td>{item.Number4}</td>
                <td>{item.Number5}</td>
                <td>{item.Number6}</td>
                <td>{item.Bonus}</td>
                {/* Add more table cells if needed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>) : (
      <div className="card mt-4">
        <h3 className="it">Open AI Response</h3>
        <div className="card-body bg-success ml-4">
          <div className='card-text text-light fs-4'> {openai_response}</div>
        </div>
      </div>
    ))
}

export default App;
