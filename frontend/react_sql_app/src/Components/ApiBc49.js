// ApiBc49.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

const ApiBc49 = ({ endpoint }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch data from the specified endpoint
        axios.get(endpoint)
            .then(response => {
                setData(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [endpoint]);

    return (
        <div className="card">
            <span className='App-link'>{endpoint}</span>
            <table responsive="true" className="table mb-4" size="sm" hover="true" striped="true">
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
        </div>
    )
}

export default ApiBc49