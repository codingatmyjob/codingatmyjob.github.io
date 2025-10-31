import React from 'react'

export default function ArticleCard({ item, onOpenArticle }){
  const { id, path, title, tags, html } = item || {}

  const handleClick = (e)=>{
    // don't intercept clicks on links inside the card
    if(e.target && e.target.closest && e.target.closest('a')) return
    if(!path) return
    onOpenArticle && onOpenArticle(path)
  }

  const onKey = (e)=>{
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e) }
  }

  return (
    <div
      className="article-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onKey}
      // preserve original markup inside the card
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
