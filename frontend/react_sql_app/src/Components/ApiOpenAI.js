// ApiOpenAI.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'

const ApiOpenAI = (props) => {
    const {endpoint} = props
    const [data, setData] = useState('');

    useEffect(() => {
        // Fetch data from the specified endpoint
        axios.get(endpoint)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [endpoint]);

    return (
        
        <div className="card">
            <h3 className="text-info">Open AI Response</h3>
            <div className="card-body bg-success ml-4">
                <div className='card-text text-light fs-4'> {data}</div>
            </div>
        </div>
    )
}

export default ApiOpenAI