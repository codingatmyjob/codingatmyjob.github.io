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
      {itemsToShow.map(it=> (
        <ArticleCard key={it.id} item={it} onOpenArticle={onOpenArticle} />
      ))}
    </>
  )

  return createPortal(content, container)
}
