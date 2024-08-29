import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap'
import '../App.css'
import classNames from 'classnames'



const PredictDraws = (props) => {
  const { endpoint, endpoint2, columns, rows, drawNumber } = props

  const [numbers, setNumbers] = useState()
  const [predicts, setPredicts] = useState([])
  const [hitting, setHitting] = useState([])
  const [missing, setMissing] = useState([])

  const fetchData = useCallback(async () => {
    const processNextPotentialDraws = async () => {

      try {
        const promises = [await axios.post(endpoint2)]
        const responses = await Promise.all(promises);

        // Extract data from each response
        const result = responses.map(response => response.data);
        return result
      } catch (error) {
        console.error('Error processing next prediction:', error);
      }
    }

    try {
      var result = null;
      result = await processNextPotentialDraws();
      var data = result[0]
      var hit = data.pop()
      var miss = data.pop()

      setHitting(hit)
      setMissing(miss)
      setPredicts(data)

    } catch (error) {
      console.error('Error updating predicts:', error);
    }
    console.log('Fetching data...');
  }, [endpoint2]);

  const getNumbers = useCallback(async () => {
    try {
      const response = await axios(endpoint);
      setNumbers(response.data.data[0]?.Numbers);
    } catch (error) {
      console.error('Error fetching draw number:', error);
    }
  }, [endpoint])

  useEffect(() => {
    fetchData();
    getNumbers();
  }, [fetchData, getNumbers, columns, endpoint, endpoint2, rows]);





  /*
    const getPredicts = (cols) => {
  
      var pred = []
  
      // take 1 from last hits
      let lastHits = getLastHitNumbers()
      var indx = Math.random() * (lastHits.length)
      pred.push(lastHits[parseInt(indx)])
  
      // select 3 groups based on totalHits
      var flip_coin = Math.random() * 2
  
      var arr = flip_coin >= 1 ? getTotalHitsNumbers() : getDistanceNumbers()
      let low = arr[0]
      let middle = arr[1]
      let high = arr[2]
  
  
      // take 1 low
      indx = Math.random() * low.length
      pred.push(low[parseInt(indx)].Value)
  
  
      // take 2 middle
      indx = Math.random() * middle.length
      pred.push(middle[parseInt(indx)].Value)
  
      indx = Math.random() * middle.length
      pred.push(middle[parseInt(indx)].Value)
  
      if (flip_coin < 1) {
        // add two more
        indx = Math.random() * middle.length
        pred.push(middle[parseInt(indx)].Value)
        indx = Math.random() * middle.length
        pred.push(middle[parseInt(indx)].Value)
      }
  
      pred = [...new Set(pred)]
      if (pred.length < 4) {
        indx = Math.random() * middle.length
        pred.push(middle[parseInt(indx)].Value)
      }
  
      // take 3 high
      indx = Math.random() * high.length
      pred.push(high[parseInt(indx)].Value)
      if (flip_coin >= 1) {
        indx = Math.random() * high.length
        pred.push(high[parseInt(indx)].Value)
  
        indx = Math.random() * high.length
        pred.push(high[parseInt(indx)].Value)
      }
  
      pred = [...new Set(pred)]
      while (pred.length < cols) {
        indx = Math.random() * high.length
        pred.push(high[parseInt(indx)].Value)
        pred = [...new Set(pred)]
      }
      pred.sort((a, b) => a - b)
  
      console.log(pred)
      return pred
  
    }
  
    const getLastHitNumbers = () => {
      var arr = []
      for (var i = 0; i < numbers.length; i++) {
        if (numbers[i].IsHit === true)
          arr.push(numbers[i].Value)
      }
  
      return arr.sort((a, b) => a - b)
    }
  
    const getTotalHitsNumbers = () => {
  
      var tmp = numbers.sort((a, b) => a.TotalHits > b.TotalHits ? 1 : -1)
      var low = []
      var middle = []
      var high = []
  
      var oneThird = parseInt(tmp.length / 3 + 1)
      var twoThird = parseInt((tmp.length * 2) / 3 + 1)
  
      for (var i = 0; i < tmp.length; i++) {
        if (i < oneThird) {
          low.push(tmp[i])
        }
        else if (i < twoThird) {
          middle.push(tmp[i])
        }
        else {
          high.push(tmp[i])
        }
      }
  
      var arr = []
      arr.push(low)
      arr.push(middle)
      arr.push(high)
  
      return arr
    }
  
  
    const getDistanceNumbers = () => {
  
      var tmp = numbers.sort((a, b) => a.Distance > b.Distance ? 1 : -1)
      var low = []
      var middle = []
      var high = []
  
      var oneThird = parseInt(tmp.length / 3 + 1)
      var twoThird = parseInt((tmp.length * 2) / 3 + 1)
  
      for (var i = 0; i < tmp.length; i++) {
        if (tmp[i].Distance === 0) continue
  
        if (i < oneThird) {
          low.push(tmp[i])
        }
        else if (i < twoThird) {
          middle.push(tmp[i])
        }
        else {
          high.push(tmp[i])
        }
      }
  
      var arr = []
      arr.push(low)
      arr.push(middle)
      arr.push(high)
  
      return arr
    }
  */

  const getHeader = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          {Array.from(Array(10).keys()).map((no) =>
            (<th key={no} className='text-warning bg-success fst-italic'>{no + 1}</th>))}
        </tr>
      </thead>
    )
  }

  const getHeader_2 = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          <th className='text-warning bg-primary'>#</th>
          {Array.from(Array(columns).keys()).map((no) =>
            (<th key={no} className='text-warning bg-success fst-italic'>{no + 1}</th>))}
        </tr>
      </thead>
    )
  }
  const getHeader_3 = (arr) => {
    return (
      <thead className="table-danger text-center">
        <tr>
          {Array.from(Array(arr.length).keys()).map((no) =>
            (<th key={no} className='text-warning bg-success fst-italic'>{no + 1}</th>))}
        </tr>
      </thead>
    )
  }


  const getRow = (start, end) => {
    return (
      <tr>
        {numbers
          .map(number => number.Value > start && number.Value <= end ?
            (<td className='bg-color1 text-center text-success fs-5 fw-bold px-2'
              key={number.Value}><span className={classNames('txt-color', { 'my-color-4 fs-5': (number.Distance === 0) }, { 'text-danger fs-5': (number.Distance > 10) })}>{number.Value}</span>
              <span className={classNames('txt-color', { 'fst-italic my-color-1 fs-6': (number.Distance > 10) }, { 'fst-italic text-success fs-6': (number.Distance <= 10) })}>({number.Distance})</span>
              <span className='text-primary fst-italic fs-6'>({number.TotalHits})</span>
            </td>)
            : '')}
      </tr>
    )
  }

  const getTD = (number, n = 1) => {
    return (
      <td className={getBgColors(number)}
        key={number.Value}>
        <span className={classNames('txt-color', { 'my-color-4 fs-4': (number.Distance === 0) }, { 'text-danger fs-4': (number.Distance > 10) })}>{number.Value}</span> {n === 2 ? <br /> : null}
        <span className={classNames('txt-color', { 'fst-italic my-color-1 fs-6': (number.Distance > 10) }, { 'fst-italic text-success fs-6': (number.Distance <= 10) })}>({number.Distance})</span> {n === 2 ? <br /> : null}
        <span className='text-primary fst-italic fs-6'>({number.TotalHits})</span> {n === 2 ? <br /> : null}
        {n !== 3 ? <span className='my-color-2 fst-italic fs-6'>[{number.NumberOfAppearing - 1}]</span> : null}
      </td>
    )
  }

  const getBgColors = (number) => {

    if (number.Value < 10)
      return 'bg-color20 text-center text-success fs-4 fw-bold px-2'
    else if (number.Value < 20)
      return 'bg-color7 text-center text-success fs-4 fw-bold px-2'
    else if (number.Value < 30)
      return 'bg-color6 text-center text-success fs-4 fw-bold px-2'
    else if (number.Value < 40)
      return 'bg-color3 text-center text-success fs-4 fw-bold px-2'
    else
      return 'bg-color10 text-center text-success fs-4 fw-bold px-2'

  }

  return (

    <div>
      {numbers &&
        <Table striped bordered hover responsive className="table-light mb-2" size="lg" >
          {getHeader()}
          <tbody className='fw-bold' >
            {getRow(0, 10)}
            {getRow(10, 20)}
            {getRow(20, 30)}
            {getRow(30, 40)}
            {getRow(40, 50)}
          </tbody>
          {getHeader()}
        </Table>}
      <div className='row-container'>
        <h4 className='text-success fst-italic'>Potential next draws</h4>
        <h4 className='text-primary'>Current Draw: <span className='fst-italic fw-bold text-danger'>{drawNumber}</span></h4>
        <button
          type="button"
          onClick={() => fetchData()}
          className="btn btn-success fw-bold mb-2 three-d-button">Generate Potential Draws
        </button>
      </div>
      {predicts && predicts.length > 0 &&
        <Table bordered hover responsive className="table-light mb-2" size="lg" >
          {getHeader_2()}
          <tbody className='fw-bold align-middle' >
            {predicts.map((row, index) => (
              <tr key={index}>
                <td className='bg-color3 text-primary fs-5 fst-italic'>{index + 1}</td>
                {row.map((number) => getTD(number))}
              </tr>
            ))}
          </tbody>
          {getHeader_2()}
        </Table>}

      <h4 className='text-success fst-italic mt-4'>Numbers were hit above</h4>
      {hitting && hitting.length > 0 && (
        <div className="table-container">
          <Table bordered className="mt-2" size="lg" >
            {getHeader_3(hitting)}
            <tbody className='fw-bold align-middle' >
              <tr >
                {hitting.map((number) => getTD(number, 2))}
              </tr>
            </tbody>
          </Table>
        </div>)}

      <h4 className='text-success fst-italic mt-4'>Numbers were NOT hit above</h4>
      {missing && missing.length > 0 && (
        <div className="table-container">
          <Table bordered className="mt-2 " size="lg" >
            {getHeader_3(missing)}
            <tbody className='fw-bold align-middle' >
              <tr >
                {missing.map((number) => getTD(number, 3))}
              </tr>
            </tbody>
          </Table>
        </div>)}
      <div className='d-flex justify-content-end'>
        <button
          type="button"
          onClick={() => fetchData()}
          className="btn btn-success fw-bold mb-2 three-d-button">Generate Potential Draws
        </button>
      </div>
    </div>
  )
}


export default PredictDraws