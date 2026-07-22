import React from 'react'
import { Link } from 'react-router-dom'

function pathToRoute(path) {
  if (!path) return '/'
  if (path.startsWith('articles/') || path.startsWith('/articles/')) {
    const slug = path.replace(/^\/?(articles\/)/, '').replace(/\.html$/, '')
    return `/articles/${slug}`
  }
  if (path.startsWith('sidebar/') || path.startsWith('/sidebar/')) {
    const page = path.replace(/^\/?(sidebar\/)/, '').replace(/\.html$/, '')
    return `/sidebar/${page}`
  }
  const clean = path.replace(/\.html$/, '')
  return `/${clean}`
}

export default function ArticleCard({ item }){
  const {
    path,
    title,
    tags,
    date,
    description,
    imageSrc,
    imageAlt,
    imageClassName,
    imageStyle,
    imageLabel,
    readingTime
  } = item || {}

  const resolvedSrc = imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')
    ? import.meta.env.BASE_URL + imageSrc
    : imageSrc

  const to = pathToRoute(path)

  return (
    <Link
      to={to}
      className="article-card"
      data-path={path}
    >
      <div className="article-image">
        {imageSrc ? (
          <img
            className={[ 'article-card-image', imageClassName ].filter(Boolean).join(' ')}
            src={resolvedSrc}
            alt={imageAlt || title || 'Article image'}
            style={imageStyle ? imageStyle : undefined}
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
    </Link>
  )
}
