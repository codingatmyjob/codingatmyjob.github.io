import React, { useEffect, useState, useCallback } from 'react'
import Header from './components/Header'
import BinaryBg from './components/BinaryBg'
import ArticlesGrid from './components/ArticlesGrid'
import ArticleView from './components/ArticleView'

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
    history.pushState({}, '', location.pathname)
  },[])

  // respond to back navigation (update articlePath)
  useEffect(()=>{
    const onpop = e=>{
      if(e.state && e.state.article) setArticlePath(e.state.article)
      else setArticlePath(null)
    }
    window.addEventListener('popstate', onpop)
    return ()=>window.removeEventListener('popstate', onpop)
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
  {/* ArticleView handles the article fetching and injection into the existing #article-view container */}
  <ArticleView path={articlePath} onClose={closeArticle} />
      {/* ScrollTop manages its own button element appended to document.body */}
      { /* lazy-load to avoid circular refs in some environments */ }
      <React.Suspense fallback={null}>
        {/* import dynamically to keep initial bundle small */}
        <ScrollTopLoader />
      </React.Suspense>
    </>
  )
}

// dynamic loader for ScrollTop to avoid import ordering issues
function ScrollTopLoader(){
  const ScrollTop = React.lazy(()=>import('./components/ScrollTop'))
  return <ScrollTop />
}
