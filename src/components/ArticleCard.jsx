import React from 'react'

export default function ArticleCard({ item, onOpenArticle }){
  const { id, path, title, tags, html, readingTime } = item || {}

  const handleClick = (e)=>{
    // don't intercept clicks on links inside the card
    if(e.target && e.target.closest && e.target.closest('a')) return
    if(!path) return
    onOpenArticle && onOpenArticle(path)
  }

  const onKey = (e)=>{
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e) }
  }

  // Create a wrapper to inject reading time
  const cardContent = React.useMemo(() => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    // Only add reading time if it exists (not null for "Coming soon" articles)
    if(readingTime){
      const dateEl = tempDiv.querySelector('.article-date')
      if(dateEl){
        const readingTimeEl = document.createElement('div')
        readingTimeEl.className = 'reading-time'
        readingTimeEl.textContent = `${readingTime} read`
        dateEl.parentNode.insertBefore(readingTimeEl, dateEl.nextSibling)
      }
    }
    
    return tempDiv.innerHTML
  }, [html, readingTime])

  return (
    <div
      className="article-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onKey}
      // preserve original markup inside the card
      dangerouslySetInnerHTML={{ __html: cardContent }}
    />
  )
}
