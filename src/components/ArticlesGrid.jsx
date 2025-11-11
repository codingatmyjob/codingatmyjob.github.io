import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ArticleCard from './ArticleCard'

// Calculate reading time based on full article content
const calculateReadingTime = async (path, cardHtml) => {
  if(!path) return null
  
  // Check if this is a "Coming soon" article from the card preview
  if(cardHtml && cardHtml.includes('Coming soon')) return null
  
  try {
    const response = await fetch(`${path}`)
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

export default function ArticlesGrid({ articles, onOpenArticle, onTags, onArticlesLoaded }){
  const [allItems, setAllItems] = useState([])
  const [initialized, setInitialized] = useState(false)

  // Initial load: parse HTML cards once
  useEffect(()=>{
    if(initialized) return
    
    const container = document.querySelector('.articles-grid')
    if(!container) return

    // read existing cards and extract minimal data
    const els = Array.from(container.querySelectorAll('.article-card'))
    
    // Parse all cards first
    const parsed = els.map((el, i)=>{
      const path = el.dataset && el.dataset.path ? el.dataset.path : (el.querySelector && (el.querySelector('a')?.getAttribute('href'))) || null
      const title = (el.querySelector && (el.querySelector('.article-title')?.textContent || el.querySelector('h3')?.textContent || el.querySelector('h2')?.textContent)) || ''
      const tags = Array.from(el.querySelectorAll('.tag')).map(t=>t.textContent.trim())
      const html = el.innerHTML
      return { id: i, path, title, tags, html, readingTime: null }
    })
    
    // Calculate reading times asynchronously
    Promise.all(parsed.map(async (item) => {
      const readingTime = await calculateReadingTime(item.path, item.html)
      return { ...item, readingTime }
    })).then(itemsWithReadingTime => {
      setAllItems(itemsWithReadingTime)
      if(onArticlesLoaded) onArticlesLoaded(itemsWithReadingTime)
    })
    
    // compute unique tag list and lift to parent if requested
    try{
      // Filter out About Me article from tag collection since it's not displayed in the grid
      const filteredForTags = parsed.filter(p => p.path !== 'About.html')
      const allTags = Array.from(new Set(filteredForTags.flatMap(p=>p.tags).filter(Boolean))).sort((a,b)=>a.localeCompare(b))
      if(onTags) onTags(allTags)
    }catch(e){}
    
    // clear existing DOM so React can render into it
    container.innerHTML = ''
    setInitialized(true)
  },[initialized, onTags, onArticlesLoaded])

  const container = typeof document !== 'undefined' ? document.querySelector('.articles-grid') : null
  if(!container) return null

  // Use articles from props (paginated and filtered) or all items during init
  const itemsToShow = articles !== undefined ? articles : allItems

  const content = (
    <>
      {itemsToShow.length > 0 ? (
        itemsToShow.map(it=> (
          <ArticleCard key={it.id} item={it} onOpenArticle={onOpenArticle} />
        ))
      ) : articles !== undefined ? (
        <div className="no-results">
          <div className="no-results-content">
            <svg className="no-results-icon" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <h3 className="no-results-title">No articles found</h3>
            <p className="no-results-message">Try adjusting your search terms or filters to find what you're looking for.</p>
          </div>
        </div>
      ) : null}
    </>
  )

  return createPortal(content, container)
}
