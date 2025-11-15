import React, { useState, useEffect } from 'react'

export default function Sidebar({ isOpen, onClose, onOpenArticle, onHome }) {
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1278)

  // Check if window is small (<1278px)
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 1278)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Handle title click for "Return Home"
  useEffect(() => {
    if (!isOpen || !isSmall) return
    const el = document.querySelector('.sidebar-header-title .title a');
    if (!el) return;
    
    const handler = function(e){
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('returnHome'));
    }
    
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler)
  }, [isOpen, isSmall])
  const handleMenuClick = (action) => {
    if (action === 'home') {
      onClose()
      onHome()
    } else if (action === 'about') {
      onClose()
      window.location.hash = '#/About'
    } else {
      onClose()
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
              <a href="/" aria-label="Return Home">Portfolio</a>
            </h2>
          </div>
        )}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
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
          <a href="/#/About" className="sidebar-item" onClick={() => handleMenuClick('about')}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            About Me
          </a>
        </nav>
      </div>
    </>
  )
}