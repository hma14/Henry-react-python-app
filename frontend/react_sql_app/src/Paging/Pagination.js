import React, { useState, useEffect } from 'react';


function Pagination({ data, LottoComponent, page, pages, pageSize }) {
  //const [pages] = useState(Math.round(data.length / dataLimit));
  const [currentPage, setCurrentPage] = useState(page);

  //const pageLimit = 10

/*   
  console.log({pageSize})
  console.log({pages})
 */

  useEffect(() => {
    window.scrollTo({ behavior: 'smooth', top: '0px' });
  }, [currentPage]); 

  function goToNextPage() {
    setCurrentPage((page) => page + 1);
    
  }

  function goToPreviousPage() {
    setCurrentPage((page) => page - 1);
  }

  function changePage(event) {
    const pageNumber = Number(event.target.textContent);
    setCurrentPage(pageNumber);
    //console.log({currentPage})
  }

  
  const getPaginatedData = () => {
    const startIndex = currentPage * pageSize - pageSize;
    const endIndex = startIndex + pageSize;
    const da = data.slice(startIndex, endIndex)
    
    return da;
  };
 

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / pageSize) * pageSize;
    return new Array(pageSize).fill().map((_, idx) => start + idx + 1);
  };

  return (
    <div>
        <div className="dataContainer">
            {getPaginatedData().map((d) => (
                // <LottoComponent key={idx} lottoData={d} />
                <LottoComponent lottoData={data} />
            ))}          
        </div>
        <div className="pagination">
            {/* previous button */}
            <button
                onClick={goToPreviousPage}
                className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
            >
                prev
            </button>

            {/* show page numbers */}
            {getPaginationGroup().map((item, index) => (
                <button
                key={index}
                onClick={changePage}
                className={`paginationItem ${currentPage === item ? 'active' : null}`}
                >
                <span>{item}</span>
                </button>
            ))}

            {/* next button */}
            <button
                onClick={goToNextPage}
                className={`next ${currentPage === pages ? 'disabled' : ''}`}
            >
                next
            </button>
        </div>
    </div>
  )

}

export default Pagination