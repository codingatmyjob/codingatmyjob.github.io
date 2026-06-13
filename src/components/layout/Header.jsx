import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
    if (typeof localStorage !== 'undefined') localStorage.setItem('theme', theme)
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

export default function Header({ menuOpen, onMenuToggle }){
  const navigate = useNavigate()

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
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }} aria-label="Return Home">Tangent</a>
      </h2>

      <div className="header-controls">
        <ThemeToggle />
      </div>
    </>
  )
}
