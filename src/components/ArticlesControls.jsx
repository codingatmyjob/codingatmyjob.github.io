import React, { useState } from 'react'
import FilterPanel from './FilterPanel'

export default function ArticlesControls({ tags=[], selected=[], onApply, onClear, sortOrder='newest', onSortChange, searchBar }){
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Close sort dropdown when clicking outside or scrolling
  React.useEffect(()=>{
    if(!sortOpen) return
    const handleClick = (e)=>{
      const sortToggle = document.getElementById('sort-toggle')
      const sortDropdown = document.querySelector('.sort-dropdown')
      if(!sortToggle?.contains(e.target) && !sortDropdown?.contains(e.target)){
        setSortOpen(false)
      }
    }
    const handleScroll = () => setSortOpen(false)
    
    document.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return ()=>{
      document.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  },[sortOpen])

  const handleSortSelect = (order)=>{
    onSortChange(order)
    setSortOpen(false)
  }

  return (
    <div className="articles-controls-wrapper">
      {searchBar && (
        <div className="search-bar-container">
          {searchBar}
        </div>
      )}
      <div className="controls-row">
        <div className="sort-dropdown-wrap">
          <button 
            id="sort-toggle" 
            className="sort-toggle" 
            onClick={()=>setSortOpen(v=>!v)}
            aria-expanded={sortOpen}
            aria-label={`Sort: ${sortOrder === 'newest' ? 'Newest' : 'Oldest'}`}
            title={`Sort: ${sortOrder === 'newest' ? 'Newest' : 'Oldest'}`}
          >
            <svg className="sort-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
            </svg>
            <span className="sort-label">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            <svg className={`dropdown-arrow ${sortOpen ? 'arrow-up' : 'arrow-down'}`} width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 9L1 4h10z"/>
            </svg>
          </button>
          {sortOpen && (
            <div className="sort-dropdown">
              <button 
                className={`sort-option ${sortOrder === 'newest' ? 'active' : ''}`}
                onClick={()=>handleSortSelect('newest')}
              >
                Newest
              </button>
              <button 
                className={`sort-option ${sortOrder === 'oldest' ? 'active' : ''}`}
                onClick={()=>handleSortSelect('oldest')}
              >
                Oldest
              </button>
            </div>
          )}
        </div>

        <div className="filter-dropdown-wrap">
          <button 
            id="filter-toggle" 
            className={`filter-toggle ${selected.length>0? 'filters-active': ''}`} 
            aria-expanded={filterOpen} 
            aria-controls="tag-filter-panel" 
            aria-label="Filter by tag" 
            title="Filter by tag" 
            onClick={()=>setFilterOpen(v=>!v)}
          >
            <svg className="filter-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M3 5h18v2l-7 7v5l-4 2v-7L3 7V5z"></path>
            </svg>
            <span className="filter-label">Filter</span>
            {selected.length > 0 && (
              <span className="filter-count" aria-hidden="true">{selected.length}</span>
            )}
          </button>
          <FilterPanel 
            id="tag-filter-panel" 
            tags={tags} 
            open={filterOpen} 
            selectedTags={selected} 
            onClose={()=>setFilterOpen(false)} 
            onApply={(sel)=>{onApply(sel)}} 
            onClear={()=>{onClear()}} 
          />
        </div>
      </div>
    </div>
  )
}
