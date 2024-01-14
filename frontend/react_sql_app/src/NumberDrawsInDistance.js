import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap'
//import moment   from 'moment'
import './App.css'



function NumberDrawsInDistance(props) {

  const { endpoint, rows } = props
  const [lottoData, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the specified endpoint
    axios.get(endpoint)
      .then(response => {
        setData(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [rows, endpoint]);

  const cols = 11
  const newList = Array(rows).fill(0).map(r => new Array(cols + 1).fill(0))
  const columns = Array.from(Array(cols + 1).keys()).slice(1, cols + 1)

  lottoData.map((row, i) => {
    let arr = new Array(cols).fill(0)
    row.Numbers.map(no => {
      if (no.IsHit === true && no.NumberOfDrawsWhenHit < cols) {
        arr[no.NumberOfDrawsWhenHit]++
      }
    })
    let sum = arr.reduce((a, b) => a = a + b, 0)
    let obj = [row.DrawNumber, row.DrawDate, ...arr.slice(1, cols), sum]
    newList[i] = obj
  })

  const getHeader = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          <th className="text-light bg-info">Draws</th>
          <th className="text-light bg-info">Date</th>
          {columns.map((no) => no < cols ?
            (<th key={no} className='text-warning bg-success'>{no}</th>) :
            (no === cols ?
              (<th className='text-light bg-info'>Sum of Hits</th>) :
              ''))}
        </tr>
      </thead>
    )
  }




  return (
    <div>
      {lottoData && lottoData.length > 0 &&
        <Table responsive className="table-primary mb-4" size="sm" hover="true" >
          {getHeader()}
          <tbody className='fw-bold' >
            {newList.map((row) =>
              <tr key={row[0]}>
                <td className="text-warning bg-primary">{row[0]}</td>
                <td className="text-warning bg-success">{row[1]}</td>
                {row.slice(2, cols + 1).map(no => no > 0 ?
                  <td className='text-danger bg-warning' key={no}>{no}</td> :
                  <td className='bg-greenyellow'></td>
                )}
                {row[cols + 1] < 4 ?
                  <td className="text-light bg-success">{row[cols + 1]}</td> :
                  <td className="text-warning bg-success">{row[cols + 1]}</td>
                }
              </tr>
            )}
          </tbody>
          {getHeader()}
        </Table>}
    </div>
  )
}
export default NumberDrawsInDistance