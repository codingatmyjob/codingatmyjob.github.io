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
    <button
      className={`theme-toggle theme-toggle-${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
    >
      <span className="theme-toggle-glyph" aria-hidden="true">
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07 7.07-1.41-1.41M6.34 6.34 4.93 4.93m14.14 0-1.41 1.41M6.34 17.66l-1.41 1.41"/>
          </svg>
        )}
      </span>
      <span className="theme-toggle-text">{theme === 'dark' ? 'Dark' : 'Light'}</span>
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
