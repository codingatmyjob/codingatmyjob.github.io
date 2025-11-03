import React, { useEffect, useState } from 'react'

export default function FilterPanel({ tags=[], open=false, selectedTags=[], onClose, onApply, onClear }){
  const [selected, setSelected] = useState(selectedTags || [])

  useEffect(()=>{
    if(!open) return
    const onKey = (e)=>{ if(e.key === 'Escape') onClose() }
    const onDocClick = (e)=>{
      const panel = document.getElementById('tag-filter-panel')
      const toggle = document.getElementById('filter-toggle')
      if(panel && !panel.contains(e.target) && toggle && !toggle.contains(e.target)) {
        onClose()
      }
    }
    const onScroll = () => onClose()
    
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onDocClick)
    window.addEventListener('scroll', onScroll, { passive: true })
    
    return ()=>{
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onDocClick)
      window.removeEventListener('scroll', onScroll)
    }
  },[open, onClose])

  // initialize selected chips from parent when opened (preserve multi-select)
  useEffect(()=>{
    if(open){
      setSelected(Array.isArray(selectedTags) ? selectedTags.slice() : [])
    }
  },[open, selectedTags])

  const toggle = (tag)=>{
    setSelected(prev => {
      const computed = prev.includes(tag) ? prev.filter(x=>x!==tag) : [...prev, tag]
      onApply && onApply(computed)
      return computed
    })
  }

  const clear = ()=>{ setSelected([]); onClear() }

  if(!open) return null
  return (
    <div id="tag-filter-panel" className="filter-panel" role="menu" aria-hidden={!open}>
      <div className="filter-panel-body">
        <div id="tag-filter-list" className="tag-filter-list" role="group" aria-label="Tag filters">
          {tags.map(t=> (
            <button key={t} type="button" className={`filter-item ${selected.includes(t)?'active':''}`} data-tag={t} onClick={()=>toggle(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="filter-panel-footer">
        <button id="filter-clear-btn" className="filter-clear-btn" onClick={clear}>Clear</button>
      </div>
    </div>
  )
}
