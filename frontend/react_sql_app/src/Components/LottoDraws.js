import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap'
import '../App.css'



function LottoDraws(props) {
  const { endpoint, page_number, columns } = props
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
  }, [page_number, columns, endpoint]);

  const getHeader = () => {
    return (
      
      <thead className="table-danger text-center">      
        <tr>
          <th className="text-light bg-info">Draws</th>
          <th className="text-light bg-info">Date</th>
          {lottoData.slice(0, 1).map(row => row.Numbers.sort((a, b) => (a - b)).map((no) => (no.Value < columns ?
            (<th key={no.Value} className='text-warning bg-success fst-italic'>{no.Value}</th>) :
            (no.Value === columns ? (<th key={no.Value} className='text-warning bg-success fst-italic'>Bonus ({no.Value})</th>) : ''))))}
        </tr>
      </thead >
    )
  }


  return (

    <div>
      {lottoData &&
        <Table striped bordered hover  className="table-primary mb-4" >
          {console.log(columns)}
          {getHeader()}
          <tbody className='fw-bold' >
            {lottoData.map(row =>
              <tr key={row.DrawNumber}>
                <td className="text-light bg-primary">{row.DrawNumber}</td>
                <td className="text-light bg-success">{row.DrawDate}</td>
                {row.Numbers
                  .sort((a, b) => (b.IsBonusNumber === true && a.IsBonusNumber === false && (b.Value - a.Value)))
                  .sort((a, b) => (a.IsBonusNumber === false && b.IsBonusNumber === false && (a.Value - b.Value)))
                  .map(no => no.IsHit === true ?
                    (<td className='text-primary bg-greenyellow' key={no.Value}>
                      {no.IsBonusNumber === true ? <span className='fs-5 text-success'>{no.Value}</span> : <span className='fs-5 text-primary'>{no.Value}</span>}
                      (<span className='text-danger fst-italic'>{no.NumberOfDrawsWhenHit}</span>)
                      (<span className='text-secondary fst-italic'>{no.TotalHits}</span>)</td>)
                    : '')}
              </tr>
            )}
          </tbody>
          {getHeader()}
        </Table>}

    </div>
  )
}

export default LottoDraws