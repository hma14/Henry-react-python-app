import React, { useEffect, useState } from 'react';

import ApiOpenAI from './ApiOpenAI';
import ApiBc49 from './ApiBc49';
import ApiLotto649 from './ApiLotto649';
import ApiLottoMax from './ApiLottoMax';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

const url = 'http://localhost:5000/api/openai';
const url1 = 'http://localhost:5000/api/lotto/bc49';
const url2 = 'http://localhost:5000/api/lotto/lotto649';
const url3 = 'http://localhost:5000/api/lotto/lottomax';

const SelectLotto = () => {

    const [selectedLotto, setSelectedLotto] = useState('BC49')

    useEffect(() => {
        console.log(selectedLotto)
    }, [selectedLotto])



    /* const selLotto = (value) => {

        setSelectedLotto(value)
        console.log(selectedLotto)
        switch (value) {
            case 'BC49':

                return (<div><ApiBc49 endpoint={url1} /> </div>)
            case 'Lotto649':
                return (<div><ApiLotto649 endpoint={url2} /> </div>)
            case 'LottoMax':
                return (<div><ApiLottoMax endpoint={url3} /> </div>)

            default: return (<div><ApiOpenAI endpoint={url} /> </div>)
        }
    } */

    return (
        <div>

            <div className="mt-2 margin-left margin-right fw-bold">
                <select id="rpp" className="dropdown btn bg-color8 my-color-1 dropdown-toggle margin-right fw-bold"
                    onChange={(e) => setSelectedLotto(e.target.value)}>
                    {['BC49', 'Lotto649', 'LottoMax'].map(lotto => (
                        <option key={lotto} value={lotto}>{lotto}</option>
                    ))}
                </select>
            </div>

            {selectedLotto === '' ? (
                
            <>
                { 
                    (() => {
                        
                        switch (selectedLotto) {
                            
                            case 'BC49':
                                return (<ApiBc49 endpoint={url1} />)
                            case 'Lotto649':
                                return (<ApiLotto649 endpoint={url2} /> )
                            case 'LottoMax':
                                return (<ApiLottoMax endpoint={url3} /> )

                            default: return (<ApiOpenAI endpoint={url} /> )
                        }
                    })()}
            </>
            ) : ''}

        </div>
    )
}

export default SelectLotto