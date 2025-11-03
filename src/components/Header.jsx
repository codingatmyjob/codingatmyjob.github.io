import React, { useState, useEffect } from 'react'
import FilterPanel from './FilterPanel'

export default function Header({ tags=[], selected=[], onApply, onClear, onOpenArticle }){
  const [open, setOpen] = useState(false)

  // Handle header title click for "Return Home"
  useEffect(()=>{
    const el = document.querySelector('header .title a');
    if(!el) return;
    
    const handler = function(e){
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('returnHome'));
    }
    
    el.addEventListener('click', handler);
    return ()=> el.removeEventListener('click', handler)
  },[])

  return (
    <div className="react-header" style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="filter-dropdown-wrap">
          <button id="filter-toggle" className={`filter-toggle ${selected.length>0? 'filters-active': ''}`} aria-expanded={open} aria-controls="tag-filter-panel" aria-label="Filter by tag" title="Filter by tag" onClick={()=>setOpen(v=>!v)}>
            <svg className="filter-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 5h18v2l-7 7v5l-4 2v-7L3 7V5z"></path></svg>
            <span className="filter-count" aria-hidden="true">{selected.length>0? String(selected.length): ''}</span>
          </button>
          <FilterPanel id="tag-filter-panel" tags={tags} open={open} selectedTags={selected} onClose={()=>setOpen(false)} onApply={(sel)=>{onApply(sel)}} onClear={()=>{onClear()}} />
        </div>
        <button className="theme-toggle" onClick={()=>{
          const html = document.documentElement
          const current = html.getAttribute('data-theme')
          const next = current === 'light' ? 'dark' : 'light'
          html.setAttribute('data-theme', next)
          localStorage.setItem('theme', next)
          const icon = document.getElementById('theme-icon')
          if(icon) icon.textContent = next === 'dark' ? 'Dark Mode' : 'Light Mode'
        }}>
          <div className="switch"></div>
          <span id="theme-icon">Theme</span>
        </button>
      </div>
    </div>
  )
}
