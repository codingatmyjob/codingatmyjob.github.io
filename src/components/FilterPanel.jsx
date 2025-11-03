import React, { useEffect, useRef, useState } from 'react'

export default function FilterPanel({ tags=[], open=false, selectedTags=[], onClose, onApply, onClear }){
  const [selected, setSelected] = useState(selectedTags || [])
  const positionRef = useRef(null)

  useEffect(()=>{
    if(!open) return
    const onKey = (e)=>{ if(e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return ()=>document.removeEventListener('keydown', onKey)
  },[open, onClose])

  // initialize selected chips from parent when opened (preserve multi-select)
  useEffect(()=>{
    if(open){
      setSelected(Array.isArray(selectedTags) ? selectedTags.slice() : [])
    }
  },[open, selectedTags])

  // Position the panel anchored to the filter toggle when opened
  useEffect(()=>{
    if(!open) return
    const panel = document.getElementById('tag-filter-panel')
    const toggle = document.getElementById('filter-toggle')
    if(!panel || !toggle) return
    const position = ()=>{
        // allow layout to stabilize
        const pRect = panel.getBoundingClientRect()
        const tRect = toggle.getBoundingClientRect()
        const parent = panel.offsetParent || document.documentElement
        const parentRect = parent.getBoundingClientRect()

  // detect small-screen fixed layout (matches CSS breakpoint)
  const isFixed = window.matchMedia && window.matchMedia('(max-width:600px)').matches

      // if panel hasn't been measured yet, retry on next frame
      if(!pRect.width || pRect.width < 20) return requestAnimationFrame(position)

      // compute arrow X relative to the panel's left edge, then as a percent of panel width
      const arrowX = (tRect.left + tRect.width / 2) - pRect.left
      const pct = Math.max(5, Math.min(95, (arrowX / pRect.width) * 100))
      panel.style.setProperty('--filter-arrow-left', pct + '%')

      // gap from CSS variable
      let gap = 12
      try{ const val = getComputedStyle(document.documentElement).getPropertyValue('--filter-gap'); if(val) gap = parseFloat(val) || gap }catch(e){}

        // set top: if using fixed layout, set top relative to viewport; otherwise compute relative to offsetParent
        if (isFixed) {
          const topVp = tRect.bottom + gap
          // make the panel span most of the viewport width and sit fixed
          panel.style.position = 'fixed'
          panel.style.left = '50%'
          panel.style.transform = 'translateX(-50%)'
          panel.style.width = 'calc(100% - 32px)'
          panel.style.setProperty('top', topVp + 'px')
          panel.style.setProperty('z-index', '9999')
          panel.style.setProperty('--filter-arrow-left', pct + '%')
        } else {
          const topRel = (tRect.bottom - parentRect.top) + gap
          panel.style.position = 'absolute'
          panel.style.removeProperty('left')
          panel.style.removeProperty('transform')
          panel.style.removeProperty('width')
          panel.style.removeProperty('z-index')
          panel.style.setProperty('top', topRel + 'px')
        }
    }

  // expose the position function so other handlers can request a recalculation
  positionRef.current = position

  // run once after paint
  requestAnimationFrame(position)

    const onResize = ()=> requestAnimationFrame(position)
    const onDocClick = (e)=>{
      if(!panel.contains(e.target) && !toggle.contains(e.target)) onClose()
    }
    const onScroll = ()=> onClose()
    
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)
    document.addEventListener('click', onDocClick)

    return ()=>{
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('click', onDocClick)
      panel.style.removeProperty('--filter-arrow-left')
      panel.style.removeProperty('top')
      panel.style.removeProperty('position')
      panel.style.removeProperty('left')
      panel.style.removeProperty('transform')
      panel.style.removeProperty('width')
      panel.style.removeProperty('z-index')
    }
  },[open, onClose])

  // reposition when selection changes (chip toggles) or when parent selection updates
  useEffect(()=>{
    if(!open) return
    // schedule a reposition on next paint
    requestAnimationFrame(()=>{ if(positionRef.current) positionRef.current() })
  },[open, selected, selectedTags])

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
      <div className="filter-panel-inner"><div className="filter-panel-title">Filter by tag:</div></div>
      <div className="filter-panel-body">
        <div id="tag-filter-list" className="tag-filter-list" role="group" aria-label="Tag filters">
          {tags.map(t=> (
            <button key={t} type="button" className={`filter-item ${selected.includes(t)?'active':''}`} data-tag={t} onClick={()=>toggle(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="filter-panel-footer">
        <button id="filter-clear-btn" className="filter-clear-btn" onClick={clear}>Clear filter</button>
      </div>
    </div>
  )
}
