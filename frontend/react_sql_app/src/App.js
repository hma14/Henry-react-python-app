import React, { useEffect, useState } from 'react';
import ApiNumbers from './Components/ApiNumbers';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components'
import './App.css'
import LottoTryLogo from './images/LottoTryLogo.png'
import PredictDraws from './PredictDraws'
import LottoDraws from './LottoDraws'
import NumberDrawsInDistance from './NumberDrawsInDistance'
import ApiOpenAI from './ApiOpenAI'




const Styles = styled.div`
  padding: 1rem;

  table {
    alignment:center;
/*     border-spacing: 2px;
    border: 1px solid black;
 */   
    align-items: center;
    border:4px outset grey; pddding:2px;

    tr {
      :last-child {
        td {
          //border-bottom: 0;
        }
      }
    }

    th,
    td {
     
      margin: 2;
      padding: 5px;  //0.3rem;
      /*
       border-bottom: 1px solid black;
      border-right: 1px solid black;
      border: 1px double;
      cellpadding:2px;
      cellspacing:2px;*/ 

      :last-child {
        border-right: 1px;
      }
      border:3px inset grey; margin:1px;
      overflow-wrap: break-word;
      text-align:center;
    }
  }
`




const App = () => {

  const [selectedLotto, setSelectedLotto] = useState('AllNumbers')
  const [sortType, setSortType] = useState('predictDraws')
  const [numberRange, setNumberRange] = useState(49)


  // change default lotto options
  const [lottoName, setLottoName] = useState(1)
  const [lottoColumns, setLottoColumns] = useState(6)
  const [selectedOption, setSelectedOption] = useState('BC49');
  const [selectedTypeOption, setSelectedTypeOption] = useState('predictDraws');

  // end 

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [drawNumber, setDrawNumber] = useState(1)




  /*
    const url = 'http://184.67.115.214:5000/api/openai';
    const url4 = 'http://184.67.115.214:5000/api/lotto/allnumbers?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize;
    const url5 = 'http://184.67.115.214:5000/api/lotto/predict?lotto_name=' + lottoName + '&columns=' + lottoColumns;
    const url6 = 'http://184.67.115.214:5000/api/lotto/predict_draw?lotto_name=' + lottoName + '&columns=' + lottoColumns;
    const url7 = 'http://184.67.115.214:5000/api/lotto/lottoDraws?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize;
    const url8 = 'http://184.67.115.214:5000/api/lotto/numberDraws?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize;
   */

  const url = 'http://127.0.0.1:5000/api/openai';
  const url4 = 'http://127.0.0.1:5000/api/lotto/allnumbers?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize;
  const url5 = 'http://127.0.0.1:5000/api/lotto/predict?lotto_name=' + lottoName + '&columns=' + lottoColumns;
  const url6 = 'http://127.0.0.1:5000/api/lotto/predict_draw?lotto_name=' + lottoName + '&columns=' + lottoColumns;
  const url7 = 'http://127.0.0.1:5000/api/lotto/lottoDraws?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize;
  const url8 = 'http://127.0.0.1:5000/api/lotto/numberDraws?lotto_name=' + lottoName + '&page_number=' + page + '&page_size=' + pageSize;




  useEffect(() => {

  }, [selectedLotto, sortType, lottoName])


  const lottoNameToInt = {
    'BC49': 1,
    'Lotto649': 2,
    'LottoMax': 3,
    'DailyGrand': 4,
    'DailyGrand_GrandNumber': 5,
    'openai_saying': 6
  }


  const selectLotto = (value) => {
    setLottoName(lottoNameToInt[value])

    setSelectedOption(value)
    switch (value) {
      case "BC49":
        setNumberRange(49)
        return setLottoColumns(7)
      case "Lotto649":
        setNumberRange(49)
        return setLottoColumns(7)
      case "LottoMax":
        setNumberRange(50)
        return setLottoColumns(8)
      case "DailyGrand":
        setNumberRange(49)
        return setLottoColumns(5)
      case "DailyGrand_GrandNumber":
        setNumberRange(7)
        return setLottoColumns(1)
      default: return setLottoColumns(7)
    }
  }

  const setPlayType = (value) => {
    setSelectedTypeOption(value)
    setSortType(value)
  }


  return (
    <Styles>{
      <div className="container-fluid">
        <nav className="navbar navbar-expand-xl bg-color8 sticky noqII">
          <a className="nav=item" href="/images">
            <img src={LottoTryLogo} className="img-fluid" alt="Lottotry Logo" width="60%" />
          </a>
          <ul className="navbar-nav my-color-1">
            <li className="nav-item">

            </li>
            <li className="nav-item">
              <div className="mt-1 margin-left margin-right fw-bold">
                <select value={selectedOption} id="rpp" className="dropdown btn bg-color8 my-color-1 dropdown-toggle margin-right fw-bold"
                  onChange={(e) => selectLotto(e.target.value)}>
                  {['BC49', 'LottoMax', 'Lotto649', 'DailyGrand', 'DailyGrand_GrandNumber'].map(lotto => (
                    <option key={lotto} value={lotto}>{lotto}</option>
                  ))}
                </select>
              </div>
            </li>
            <li className="nav-item">
              <div className="mt-1 margin-left margin-right fw-bold">
                <select value={selectedTypeOption} id="rpp" className="dropdown btn bg-color8 my-color-1 dropdown-toggle  fw-bold"
                  onChange={(e) => setPlayType(e.target.value)}>
                  {['number', 'distance', 'totalHits', 'lottoDraws', 'numberDraws', 'predictDraws', 'openai_saying'].map(sortType => (
                    <option key={sortType} value={sortType}> By {sortType}</option>
                  ))}
                </select>
              </div>
            </li>
            <li className="nav-item">
              {sortType !== 'predictDraws' ?
                (<div className="mt-1 margin-left margin-right fw-bold">
                  <select id="rpp" className="dropdown btn bg-color8 my-color-1 dropdown-toggle ps-4 fw-bold"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}>
                    {[5, 10, 20, 30, 40, 50, 100].map(pageSize => (
                      <option key={pageSize} value={pageSize}> {pageSize}</option>
                    ))}
                  </select>
                  <span className='bg-color8 my-color-1 ps-2'>draws per page</span>
                </div>) : ''}
            </li>
          </ul>
        </nav>
        <>
          {
            (() => {

              switch (sortType) {
                /* case 'lottoDraws':
                  return (
                    <LottoDraws lottoData={data} columns={lottoColumns} />
                  )*/
                case 'openai_saying':
                  return (
                    <ApiOpenAI endpoint={url} />
                  ) 
                case 'lottoDraws':
                  return (
                    <LottoDraws endpoint={url7} columns={lottoColumns} />
                  )
                case 'numberDraws':
                  return (
                    <NumberDrawsInDistance endpoint={url8} rows={pageSize} />
                  )
                case 'predictDraws':
                  return (
                    <PredictDraws endpoint={url5} endpoint2={url6} columns={lottoColumns} lotto_name={lottoName} />
                  )
                default: return (
                  <ApiNumbers endpoint={url4} sortType={sortType} />
                )
              }
              /* switch (selectedLotto) {
                case 'BC49':
                  return (<ApiBc49 endpoint={url1} />)
                case 'Lotto649':
                  return (<ApiLotto649 endpoint={url2} />)
                case 'LottoMax':
                  return (<ApiLottoMax endpoint={url3} />)
                case 'Predict Draws':
                  return (<PredictDraws endpoint={url5} sortType={sortType} />)

                case 'AllNumbers':
                  return (<ApiNumbers endpoint={url4} sortType={sortType} />)

                default: return (<ApiOpenAI endpoint={url} />)
              } */
            })()}
        </>
      </div>
    }</Styles>
  )
}

export default App;