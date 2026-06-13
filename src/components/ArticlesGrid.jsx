import React, { useEffect, useState } from 'react'
import ArticleCard from './ArticleCard'

// Calculate reading time based on full article content
const calculateReadingTime = async (path) => {
  if(!path) return null

  try {
    const isRemote = /^https?:\/\//i.test(path)
    const viteBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'
    const urlToFetch = isRemote
      ? path
      : path.startsWith('/')
        ? new URL(path, location.origin).href
        : new URL(path, location.origin + viteBase).href

    const response = await fetch(urlToFetch, { cache: 'no-store' })
    if(!response.ok) return null
    const htmlText = await response.text()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlText
    
    // Get the article content
    const articleEl = tempDiv.querySelector('article')
    if(!articleEl) return null
    
    // Count words in text content
    const textContent = articleEl.textContent || ''
    const words = textContent.trim().split(/\s+/).filter(Boolean).length
    
    // If there's barely any content, it's probably a placeholder
    if(words < 10) return null
    
    // Count code blocks for additional time
    const codeBlocks = articleEl.querySelectorAll('code, pre').length
    
    // Average reading speed: 200 words per minute
    // Add 15 seconds per code block for comprehension
    const minutes = Math.ceil((words / 200) + (codeBlocks * 0.25))
    
    return minutes < 1 ? '< 1 min' : `${minutes} min`
  } catch(err) {
    return null
  }
}

export default function ArticlesGrid({ articles = [], onOpenArticle }){
  const [readingTimes, setReadingTimes] = useState({})

  useEffect(()=>{
    if(articles.length === 0) return

    let cancelled = false

    const uncached = articles.filter(item => item.path && readingTimes[item.path] === undefined)
    if(uncached.length === 0) return

    Promise.all(
      uncached.map(async (item) => ({
        path: item.path,
        readingTime: await calculateReadingTime(item.path)
      }))
    ).then(results => {
      if(cancelled) return
      setReadingTimes(prev => {
        const next = { ...prev }
        results.forEach(({ path, readingTime }) => {
          next[path] = readingTime
        })
        return next
      })
    })

    return ()=> {
      cancelled = true
    }
  },[articles, readingTimes])

  const itemsToShow = articles.map(item => ({
    ...item,
    readingTime: item.path ? readingTimes[item.path] ?? null : null
  }))

  return (
    <>
      {itemsToShow.length > 0 ? (
        itemsToShow.map(it=> (
          <ArticleCard key={it.id || it.path || it.title} item={it} onOpenArticle={onOpenArticle} />
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
