import React, { useEffect, useRef, useState } from 'react'

export default function ScrollTop(){
  const btnRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(()=>{
    const btn = btnRef.current
    if (!btn) return

    const updateVisibility = ()=>{
      const articleOpen = document.body.classList.contains('article-open')
      const scrollTop = articleOpen ? document.documentElement.scrollTop : window.scrollY
      setVisible(scrollTop > 200)
    }

    const position = ()=>{
      const articleOpen = document.body.classList.contains('article-open')
      const articleContainer = document.querySelector('.article-container')
      const homeContainer = document.querySelector('#articles-view')
      const anchor = articleOpen ? articleContainer : homeContainer

      if(anchor){
        const rect = anchor.getBoundingClientRect()
        const desiredLeft = Math.round(rect.right + 30)
        const btnWidth = btn.offsetWidth || 44
        if(desiredLeft + btnWidth > window.innerWidth - 8){
          btn.style.removeProperty('--scroll-left')
          btn.style.setProperty('--scroll-right', '20px')
        } else {
          btn.style.setProperty('--scroll-left', desiredLeft + 'px')
          btn.style.removeProperty('--scroll-right')
        }
      } else {
        btn.style.removeProperty('--scroll-left')
        btn.style.setProperty('--scroll-right', '20px')
      }
      updateVisibility()
    }

    const obs = new MutationObserver(()=> position())
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })

    window.addEventListener('resize', position)
    window.addEventListener('scroll', updateVisibility)
    document.body.addEventListener('scroll', updateVisibility)

    position()

    return ()=>{
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', updateVisibility)
      document.body.removeEventListener('scroll', updateVisibility)
      obs.disconnect()
    }
  },[])

  return (
    <button
      id="scroll-top"
      className="scroll-top"
      aria-label="Scroll to top"
      ref={btnRef}
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  )
}
