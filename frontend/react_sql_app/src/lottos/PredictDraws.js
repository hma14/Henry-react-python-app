import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Table } from 'react-bootstrap'
import '../App.css'
import classNames from 'classnames'



const PredictDraws = (props) => {
  const { endpoint, endpoint2, columns, lotto_name } = props

  const [numbers, setNumbers] = useState()
  const [predicts, setPredicts] = useState([])

  useEffect(() => {
    // Fetch data from the specified endpoint

    (async () => {
      const result = await axios(endpoint)
      setNumbers(result.data.data[0].Numbers)
      //console.log(numbers)
    })()

  }, [columns, endpoint]);


  const processNextPrediction = async () => {

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

  const fetchData = async () => {
    try {
      const result = await processNextPrediction();
      setPredicts(result[0]);
      return predicts
    } catch (error) {
      console.error('Error updating predicts:', error);
    }
  };


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


  const getHeader = () => {
    return (
      <thead className="table-danger text-center">
        <tr>
          {Array.from(Array(10).keys()).map((no) =>
            (<th key={no} className='text-warning bg-success'>{no + 1}</th>))}
        </tr>
      </thead>
    )
  }

  const getRow = (start, end) => {
    return (
      <tr>
        {numbers
          .map(no => no.Value > start && no.Value <= end ?
            (<td className={classNames('bg-color', { 'bg-color8': predicts.indexOf(no.Value) > -1 }, { 'bg-greenyellow': predicts.indexOf(no.Value) < 0 })} key={no.Value}>
              <span className={classNames('fs-5 font-color', { 'text-danger': predicts.indexOf(no.Value) > -1 }, { 'text-success': predicts.indexOf(no.Value) < 0 })}>{no.Value}   </span>
              <span className='text-primary fst-italic'>({no.Distance})</span>
              <span className='my-color-2 fst-italic'>({no.TotalHits})</span></td>)
            : '')}
      </tr>
    )
  }



  return (

    <div>

      {numbers &&
        <Table responsive className="table-primary mb-3" size="lg" >
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
      <div>
        <Table responsive>
          <thead className="table-danger text-center">
            <tr>
              {Array.from(Array(columns).keys()).map((no) =>
                (<th key={no} className='text-warning bg-success'>{no + 1}</th>))}
              <th className='text-warning bg-success'>Bonus</th>
            </tr>
          </thead>
          <tr>
            {predicts.map(p => (<td className='bg-color1 text-center text-danger fs-4 fw-bold px-2' key={p}>{p}</td>))}
          </tr>
        </Table>
        <button
          type="button"
          /* onClick={() => setPredicts(getPredicts(columns + 1))} */
          onClick={fetchData}
          className="btn btn-primary fw-bold float-end">Predict Next Draw</button>
      </div>
    </div>
  )
}


export default PredictDraws