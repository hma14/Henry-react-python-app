import { useState, useEffect } from "react"
import axios from 'axios'

const useFetch = (url, page, pageSize, drawNumber) => {
    const [data, setData] = useState([])
    const [pagingInfo, setPagingInfo] = useState('')
    //const [error, setError] = useState('')

    
    let newUrl = url + '&currentDrawNumber=' + drawNumber + '&SortOrder=-drawNumber' + '&pageNumber=' + page + '&pageSize=' + pageSize 

    useEffect(() => {

        (async () => {
            const result = await axios(newUrl)
            setData(result.data)
            setPagingInfo(result.headers['x-pagination']) 
            //console.log(newUrl)
        })()

    /*     
        fetch(newUrl, {mode: 'cors'})
        .then((res) => { 
            if (res.ok) { setPagingInfo(res.headers.get('x-pagination')); return res.json() }; 
            throw new Error('Something went wrong while requesting data from Lottotry web api.') 
            })
        .then((data) => setData(data.data))
        .catch((error) => setError(error.message))
        
    */      

    }, [newUrl])

    // console.log(pagingInfo)

    const json = pagingInfo !== "" ? pagingInfo : '{"totalCount":664,"pageSize":10,"currentPageSize":10,"currentStartIndex":91,"currentEndIndex":100,"pageNumber":10,"totalPages":67,"hasPrevious":true,"hasNext":true}'

    //if ((error)) return <h1>{error}</h1>

    return [{data, json}]
};

export default useFetch