import React, { useEffect, useState, useCallback } from 'react'
import Header from './components/Header'
import BinaryBg from './components/BinaryBg'
import ArticlesGrid from './components/ArticlesGrid'
import ArticleView from './components/ArticleView'
import ScrollTop from './components/ScrollTop'

export default function App(){
  const [tags, setTags] = useState([])
  const [selected, setSelected] = useState([])
  const [articlePath, setArticlePath] = useState(null)

  // Tags are provided by ArticlesGrid (lifted from DOM on mount)

  // ArticlesGrid will render the article cards (portal into existing `.articles-grid`).

  const applyFilter = useCallback((selTags)=>{
    const tagsLC = selTags.map(s=>s.toLowerCase())
    document.querySelectorAll('.articles-grid .article-card').forEach(card=>{
      const cardTags = Array.from(card.querySelectorAll('.tag')).map(t=>t.textContent.trim().toLowerCase())
      const match = tagsLC.every(s=>cardTags.includes(s))
      card.style.display = match ? '' : 'none'
    })
    setSelected(selTags)
  },[])

  const clearFilter = useCallback(()=>{
    document.querySelectorAll('.articles-grid .article-card').forEach(card=>card.style.display='')
    setSelected([])
  },[])

  // Article open/close functions now set the articlePath state; ArticleView handles the fetch/inject
  const openArticle = useCallback((path)=>{
    setArticlePath(path)
  },[])

  const closeArticle = useCallback(()=>{
    setArticlePath(null)
    // Remove hash entirely to return home
    history.pushState('', document.title, window.location.pathname)
  },[])

  // Handle navigation via hash
  useEffect(()=>{
    const parseRoute = ()=>{
      const hash = window.location.hash.slice(1)
      if(!hash || hash === '/'){
        setArticlePath(null)
        return
      }
      
      const match = hash.match(/^\/articles\/(.+)$/)
      if(match){
        const slug = match[1]
        const fullPath = slug.endsWith('.html') ? `articles/${slug}` : `articles/${slug}.html`
        setArticlePath(fullPath)
      }
    }

    parseRoute()
    window.addEventListener('hashchange', parseRoute)
    return ()=>window.removeEventListener('hashchange', parseRoute)
  },[])

  // allow external "Return Home" triggers (e.g., header title) to close the article
  useEffect(()=>{
    const onReturn = ()=> closeArticle()
    window.addEventListener('returnHome', onReturn)
    return ()=> window.removeEventListener('returnHome', onReturn)
  },[closeArticle])

  return (
    <>
      <Header tags={tags} selected={selected} onApply={applyFilter} onClear={clearFilter} onOpenArticle={openArticle} />
      <BinaryBg />
      <ArticlesGrid onOpenArticle={openArticle} onTags={setTags} />
      <ArticleView path={articlePath} onClose={closeArticle} />
      <ScrollTop />
    </>
  )
}
