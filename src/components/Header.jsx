import React, { useState, useEffect } from 'react'

export default function Header({ onOpenArticle }){
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Close menu when clicking outside
  useEffect(()=>{
    if(!menuOpen) return
    const handleClick = (e)=>{
      if(!e.target.closest('.menu-dropdown') && !e.target.closest('.menu-toggle')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return ()=> document.removeEventListener('click', handleClick)
  },[menuOpen])

  const handleMenuClick = (action)=>{
    setMenuOpen(false)
    if(action === 'home'){
      window.dispatchEvent(new CustomEvent('returnHome'));
    } else if(action === 'about'){
      // Open About Me as an article
      if(onOpenArticle) onOpenArticle('About.html');
    }
  }

  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div className="menu-dropdown-wrap">
        <button 
          className={`menu-toggle ${menuOpen ? 'menu-open' : ''}`} 
          onClick={()=>setMenuOpen(v=>!v)}
          aria-expanded={menuOpen}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <button 
              className="menu-option"
              onClick={()=>handleMenuClick('home')}
            >
              Home
            </button>
            <button 
              className="menu-option"
              onClick={()=>handleMenuClick('about')}
            >
              About Me
            </button>
          </div>
        )}
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
  )
}
