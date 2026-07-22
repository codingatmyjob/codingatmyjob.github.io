import React from 'react'
import ArticleCard from './ArticleCard'

export default function ArticlesGrid({ articles = [] }){
  const itemsToShow = articles

  return (
    <>
      {itemsToShow.length > 0 ? (
        itemsToShow.map(it=> (
          <ArticleCard key={it.id || it.path || it.title} item={it} />
        ))
      ) : (
        <div className="no-results">
          <div className="no-results-content">
            <svg className="no-results-icon" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <h3 className="no-results-title">No articles found</h3>
            <p className="no-results-message">Try adjusting your search terms or filters to find what you're looking for.</p>
          </div>
        </div>
      )}
    </>
  )
}
