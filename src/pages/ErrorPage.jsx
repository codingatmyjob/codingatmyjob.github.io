import React from 'react'
import { getSiteUrl } from '../siteUrls'

export function meta() {
  return [
    { title: '404 | Tangent' },
    { name: 'robots', content: 'noindex,follow' },
    { tagName: 'link', rel: 'canonical', href: getSiteUrl() }
  ]
}

export default function ErrorPage() {
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
        </main>
      </div>
    </div>
  )
}
