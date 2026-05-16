import React from 'react'

export default function ArticleCard({ item, onOpenArticle }){
  const {
    path,
    title,
    tags,
    date,
    description,
    imageSrc,
    imageAlt,
    imageClassName,
    imageLabel,
    readingTime
  } = item || {}

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
      data-path={path}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onKey}
    >
      <div className="article-image">
        {imageSrc ? (
          <img
            className={[ 'article-card-image', imageClassName ].filter(Boolean).join(' ')}
            src={imageSrc}
            alt={imageAlt || title || 'Article image'}
          />
        ) : (
          imageLabel || title
        )}
      </div>

      <div className="article-content">
        <div className="article-date">{date}</div>
        {readingTime ? <div className="reading-time">{readingTime} read</div> : null}
        <div className="article-title">{title}</div>
        <div className="article-description">{description}</div>
        <div className="article-tags">
          {(tags || []).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
