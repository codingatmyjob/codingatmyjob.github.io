import React, { useState, useEffect } from 'react'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <div className="switch"></div>
      <span id="theme-icon">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  )
}

export default function Header({ onOpenArticle, menuOpen, onMenuToggle }){
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
      if(!e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
        onMenuToggle(false)
      }
    }
    document.addEventListener('click', handleClick)
    return ()=> document.removeEventListener('click', handleClick)
  },[menuOpen, onMenuToggle])

  const handleMenuClick = (action)=>{
    onMenuToggle(false)
    if(action === 'home'){
      window.dispatchEvent(new CustomEvent('returnHome'));
    } else if(action === 'about'){
      // Open About Me as an article
      if(onOpenArticle) onOpenArticle('About.html');
    }
  }

  return (
    <>
      <button 
        className={`menu-toggle ${menuOpen ? 'sidebar-open' : ''}`} 
        onClick={() => onMenuToggle(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>

      <h2 className="title">
        <a href="/" aria-label="Return Home">Portfolio</a>
      </h2>

      <div className="header-controls">
        <ThemeToggle />
      </div>
    </>
  )
}
