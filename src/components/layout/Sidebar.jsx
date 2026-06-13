import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [isSmall, setIsSmall] = useState(typeof window !== 'undefined' ? window.innerWidth < 1278 : false)

  // Check if window is small (<1278px)
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 1278)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleMenuClick = (action) => {
    onClose()
    if (action === 'home') {
      navigate('/')
    } else if (action === 'about') {
      navigate('/sidebar/About')
    } else if (action === 'tag-guide') {
      navigate('/sidebar/tag-guide')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-open' : ''}`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar-content ${isOpen ? 'sidebar-open' : ''}`}>
        {isOpen && isSmall && (
          <div className="sidebar-header-title">
            <h2 className="title">
              <a href="/" onClick={(e) => { e.preventDefault(); handleMenuClick('home') }} aria-label="Return Home">Tangent</a>
            </h2>
          </div>
        )}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <div className="sidebar-top">
            <button
              className={`sidebar-close-toggle ${isOpen ? 'sidebar-open' : ''}`}
              onClick={onClose}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            <div className="sidebar-divider"></div>
            <a href="/" className="sidebar-item" onClick={(e) => { e.preventDefault(); handleMenuClick('home'); }}>
              <svg className="sidebar-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Home
            </a>
            <a href="/sidebar/About" className="sidebar-item" onClick={(e) => { e.preventDefault(); handleMenuClick('about'); }}>
              <svg className="sidebar-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              About Me
            </a>
            <a href="/sidebar/tag-guide" className="sidebar-item" onClick={(e) => { e.preventDefault(); handleMenuClick('tag-guide'); }}>
              <svg className="sidebar-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.41l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.83zM6.5 8A1.5 1.5 0 118 6.5 1.5 1.5 0 016.5 8z"/>
              </svg>
              Tag Guide
            </a>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-divider"></div>
            {(() => {
              const path = typeof window !== 'undefined' ? window.location.pathname : ''
              const isPreview = import.meta.env.BASE_URL === '/preview/' || path.startsWith('/preview')
              return <>
                <a href={isPreview ? '/' : '/preview/'} className="sidebar-section-label sidebar-env-label">You're On: {isPreview ? 'Preview' : 'Production'} ↗</a>
                <span className="sidebar-section-label">Modified: {import.meta.env.VITE_BUILD_TIME ? (() => { const d = new Date(import.meta.env.VITE_BUILD_TIME); const day = String(d.getUTCDate()).padStart(2, '0'); const month = String(d.getUTCMonth() + 1).padStart(2, '0'); const hours = String(d.getUTCHours()).padStart(2, '0'); const minutes = String(d.getUTCMinutes()).padStart(2, '0'); return `${day}/${month} ${hours}:${minutes} UTC`; })() : 'dev'}</span>
              </>
            })()}
          </div>
        </nav>
      </div>
    </>
  )
}