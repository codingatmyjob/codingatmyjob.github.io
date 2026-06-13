import React from 'react'

export default function Pagination({ currentPage, totalPages, onPageChange }){
  const scrollTopInstant = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }

  const handleFirst = ()=>{
    if(currentPage !== 1){
      onPageChange(1)
      scrollTopInstant()
    }
  }

  const handlePrevious = ()=>{
    if(currentPage > 1){
      const nextPage = currentPage - 1
      onPageChange(nextPage)
      if(nextPage === 1) scrollTopInstant()
    }
  }

  const handleNext = ()=>{
    if(currentPage < totalPages){
      onPageChange(currentPage + 1)
      // scrollTopInstant()
    }
  }

  const handleLast = ()=>{
    if(currentPage !== totalPages){
      onPageChange(totalPages)
      // scrollTopInstant()
    }
  }

  return (
    <div className="pagination-container">
      <div className="pagination">
        <button 
          className="pagination-btn pagination-first" 
          onClick={handleFirst}
          disabled={currentPage === 1}
          aria-label="First page"
          title="Go to first page"
        >
          ⇤
        </button>
        
        <button 
          className="pagination-btn" 
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ←
        </button>
        
        <div className="pagination-info">
          <span className="pagination-current">{currentPage}</span>
          <span className="pagination-separator">/</span>
          <span className="pagination-total">{totalPages}</span>
        </div>
        
        <button 
          className="pagination-btn" 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          →
        </button>

        <button 
          className="pagination-btn pagination-last" 
          onClick={handleLast}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          title="Go to last page"
        >
          ⇥
        </button>
      </div>
    </div>
  )
}
