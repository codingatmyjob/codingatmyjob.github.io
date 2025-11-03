import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Header from './components/Header'
import BinaryBg from './components/BinaryBg'
import ArticlesGrid from './components/ArticlesGrid'
import ArticlesControls from './components/ArticlesControls'
import ArticleView from './components/ArticleView'
import ScrollTop from './components/ScrollTop'
import Pagination from './components/Pagination'

const ROWS_PER_PAGE = 8

// Calculate items per page based on grid columns (responsive)
const getItemsPerPage = ()=>{
  const width = window.innerWidth
  let columns = 4 // desktop default
  if(width <= 768) columns = 1
  else if(width <= 900) columns = 2
  else if(width <= 1278) columns = 3
  return columns * ROWS_PER_PAGE
}

export default function App(){
  const [allTags, setAllTags] = useState([])
  const [allArticles, setAllArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [sortedArticles, setSortedArticles] = useState([])
  const [selected, setSelected] = useState([])
  const [sortOrder, setSortOrder] = useState('newest')
  const [articlePath, setArticlePath] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage())

  // Update items per page on window resize
  useEffect(()=>{
    const handleResize = ()=>{
      setItemsPerPage(getItemsPerPage())
    }
    window.addEventListener('resize', handleResize)
    return ()=> window.removeEventListener('resize', handleResize)
  },[])

  // Filter articles based on selected tags
  useEffect(()=>{
    let filtered = allArticles

    if(selected.length > 0){
      const tagsLC = selected.map(s=>s.toLowerCase())
      filtered = allArticles.filter(article => {
        const articleTagsLC = article.tags.map(t=>t.toLowerCase())
        return tagsLC.every(tag => articleTagsLC.includes(tag))
      })
    }

    setFilteredArticles(filtered)
  },[selected, allArticles])

  // Sort filtered articles
  useEffect(()=>{
    const sorted = [...filteredArticles].sort((a, b)=>{
      // Extract dates from article HTML or use a default
      const getDate = (article)=>{
        const dateMatch = article.html.match(/<div class="article-date">([^<]+)<\/div>/)
        if(!dateMatch || dateMatch[1].includes('Coming soon')) return new Date('2099-12-31') // Put "Coming soon" at beginning for newest
        return new Date(dateMatch[1])
      }
      
      const dateA = getDate(a)
      const dateB = getDate(b)
      
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
    setSortedArticles(sorted)
  },[filteredArticles, sortOrder])

  const applyFilter = useCallback((selTags)=>{
    setSelected(selTags)
    setCurrentPage(1) // Reset to page 1 when filter changes
  },[])

  const clearFilter = useCallback(()=>{
    setSelected([])
    setCurrentPage(1) // Reset to page 1 when clearing filter
  },[])

  const handleSortChange = useCallback((order)=>{
    setSortOrder(order)
    setCurrentPage(1) // Reset to page 1 when sort changes
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
      
      const articlesMatch = hash.match(/^\/articles\/(.+)$/)
      if(articlesMatch){
        const slug = articlesMatch[1]
        const fullPath = slug.endsWith('.html') ? `articles/${slug}` : `articles/${slug}.html`
        setArticlePath(fullPath)
        return
      }
      
      // Handle root-level files like About-Me
      const rootMatch = hash.match(/^\/([^\/]+)$/)
      if(rootMatch){
        const filename = rootMatch[1]
        const fullPath = filename.endsWith('.html') ? filename : `${filename}.html`
        setArticlePath(fullPath)
        return
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

  // Calculate pagination
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArticles = sortedArticles.slice(startIndex, endIndex)
  
  // Debug logging
  console.log('Debug:', { 
    allArticlesCount: allArticles.length, 
    filteredCount: filteredArticles.length, 
    sortedCount: sortedArticles.length,
    currentArticlesCount: currentArticles.length,
    itemsPerPage,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentArticles: currentArticles.map(a => a.title)
  })

  const paginationRoot = typeof document !== 'undefined' ? document.getElementById('pagination-root') : null
  const controlsRoot = typeof document !== 'undefined' ? document.getElementById('articles-controls-root') : null

  return (
    <>
      <Header onOpenArticle={openArticle} />
      <BinaryBg />
      {controlsRoot && createPortal(
        <ArticlesControls 
          tags={allTags}
          selected={selected}
          onApply={applyFilter}
          onClear={clearFilter}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />,
        controlsRoot
      )}
      <ArticlesGrid 
        articles={currentArticles}
        onOpenArticle={openArticle} 
        onTags={setAllTags}
        onArticlesLoaded={setAllArticles}
      />
      {totalPages > 1 && paginationRoot && createPortal(
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />,
        paginationRoot
      )}
      <ArticleView path={articlePath} onClose={closeArticle} />
      <ScrollTop />
    </>
  )
}
