import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import BinaryBg from './BinaryBg'
import ScrollTop from './ScrollTop'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <BinaryBg />
      <div className="container">
        <header>
          <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
        </header>
        <aside className="sidebar" id="sidebar">
          <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </aside>
        <div className="main-content">
          <Outlet />
        </div>
        <footer className="site-footer">
          <div className="copyright">© 2026 Tangent.</div>
          <div className="social-links">
            <a href="https://github.com/codingatmyjob/" className="social-link" target="_blank" rel="noopener" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.94.57.1.78-.25.78-.56v-2.02c-3.2.7-3.87-1.55-3.87-1.55-.52-1.3-1.27-1.64-1.27-1.64-1.04-.7.08-.68.08-.68 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.56-.29-5.26-1.28-5.26-5.72 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18.91-.25 1.88-.38 2.85-.38s1.94.13 2.85.38c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.46-2.7 5.42-5.27 5.7.41.35.77 1.04.77 2.1v3.12c0 .31.21.67.79.56A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>
              </svg>
            </a>
            <a href="https://app.hackthebox.com/profile/2578864" className="social-link" target="_blank" rel="noopener" aria-label="Hack The Box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                <path d="M256 0L32 128v256l224 128 224-128V128L256 0zm0 48l176 96v224l-176 96-176-96V144l176-96z"/>
              </svg>
            </a>
            <a href="https://www.credly.com/users/connor-rasmussen.58b75ec0/badges#credly" className="social-link" target="_blank" rel="noopener" aria-label="Credly">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" fill="currentColor">
                <path fillRule="evenodd" d="M8,0 H40 A8,8 0 0 1 48,8 V40 A8,8 0 0 1 40,48 H8 A8,8 0 0 1 0,40 V8 A8,8 0 0 1 8,0 Z m25.77,27.04c-.71-.5-1.68-.32-2.18.39-2.14,2.96-5.22,5.57-9.58,5.57s-4.62-7.88-2-13c1.61-3.14,3.87-5.73,5.84-5.72,1.39,0,2.18,1.26,1.8,2.6-.46,1.63-.51,2.72-.51,2.81-.04.96.71,1.77,1.68,1.8.02,0,.04.01.07.01.93,0,1.7-.74,1.74-1.68,0-.03.18-3.31,2.78-6.77.63-.84.39-2.07-.57-2.59-.77-.42-1.75-.14-2.27.56-.15.2-.29.39-.42.59-.14.2-.4.27-.62.17-7.7-3.47-12.07,3.86-13.51,7.23-3,7-3,18,5.62,18,7.22,0,10.63-4.75,12.6-7.79.46-.71.27-1.66-.42-2.14-.01,0-.02-.02-.03-.02z"/>
              </svg>
            </a>
          </div>
        </footer>
      </div>
      <ScrollTop />
    </>
  )
}
