import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' ? 'dark' : 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [hasUserTheme, setHasUserTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem('theme') !== null
  })

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined' || hasUserTheme) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystemTheme = () => setTheme(media.matches ? 'dark' : 'light')
    applySystemTheme()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', applySystemTheme)
      return () => media.removeEventListener('change', applySystemTheme)
    }

    media.addListener(applySystemTheme)
    return () => media.removeListener(applySystemTheme)
  }, [hasUserTheme])

  const toggleTheme = () => {
    setHasUserTheme(true)
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', next)
      return next
    })
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
