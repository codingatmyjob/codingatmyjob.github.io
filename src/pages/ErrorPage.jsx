import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div id="article-view">
      <div className="article-frame">
        <main className="article-container not-found-container">
          <div className="not-found-code">404</div>
          <div className="not-found-label">Page not found</div>
          <h1>Nothing here.</h1>
          <p>
            The page you're looking for doesn't exist or was moved.
          </p>
          <button type="button" className="home-btn" onClick={() => navigate('/')}>
            ← Return Home
          </button>
        </main>
      </div>
    </div>
  )
}
