import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ArticleCard from './ArticleCard'

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
    const parsed = els.map((el, i)=>{
      const path = el.dataset && el.dataset.path ? el.dataset.path : (el.querySelector && (el.querySelector('a')?.getAttribute('href'))) || null
      const title = (el.querySelector && (el.querySelector('.article-title')?.textContent || el.querySelector('h3')?.textContent || el.querySelector('h2')?.textContent)) || ''
      const tags = Array.from(el.querySelectorAll('.tag')).map(t=>t.textContent.trim())
      const html = el.innerHTML
      return { id: i, path, title, tags, html }
    })
    
    // compute unique tag list and lift to parent if requested
    try{
      const allTags = Array.from(new Set(parsed.flatMap(p=>p.tags).filter(Boolean))).sort((a,b)=>a.localeCompare(b))
      if(onTags) onTags(allTags)
    }catch(e){}
    
    // Pass all articles to parent for filtering
    if(onArticlesLoaded) onArticlesLoaded(parsed)
    
    // clear existing DOM so React can render into it
    container.innerHTML = ''
    setAllItems(parsed)
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
