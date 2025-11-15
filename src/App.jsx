import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import BinaryBg from './components/BinaryBg'
import ArticlesGrid from './components/ArticlesGrid'
import ArticlesControls from './components/ArticlesControls'
import ArticleView from './components/ArticleView'
import ScrollTop from './components/ScrollTop'
import Pagination from './components/Pagination'
import SearchBar from './components/SearchBar'

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
  const [availableTags, setAvailableTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [articleContents, setArticleContents] = useState(new Map())
  const [menuOpen, setMenuOpen] = useState(false)

  // Update items per page on window resize
  useEffect(()=>{
    const handleResize = ()=>{
      setItemsPerPage(getItemsPerPage())
    }
    window.addEventListener('resize', handleResize)
    return ()=> window.removeEventListener('resize', handleResize)
  },[])

  // Filter out About Me from articles (helper function)
  const filterOutAbout = (articles) => articles.filter(article => article.path !== 'About.html')

  // Load and cache article content for searching
  const loadArticleContent = useCallback(async (article) => {
    if (!article.path || articleContents.has(article.path)) return

    try {
      const response = await fetch(article.path)
      const htmlText = await response.text()
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlText

      // Extract title, tags, and article content
      const title = tempDiv.querySelector('h1')?.textContent || ''
      const tags = Array.from(tempDiv.querySelectorAll('.tag')).map(t => t.textContent.trim())
      const articleEl = tempDiv.querySelector('article')
      const content = articleEl ? articleEl.textContent : ''

      const searchableContent = {
        title: title.toLowerCase(),
        tags: tags.map(t => t.toLowerCase()),
        content: content.toLowerCase()
      }

      setArticleContents(prev => new Map(prev).set(article.path, searchableContent))
    } catch (error) {
      console.warn(`Failed to load content for ${article.path}:`, error)
    }
  }, [articleContents])

  // Search function that searches through title, tags, and content
  const searchArticles = useCallback(async (query, articles) => {
    if (!query.trim()) return articles

    const searchTerm = query.toLowerCase().trim()

    // Load content for all articles if not already loaded
    await Promise.all(articles.map(loadArticleContent))

    return articles.filter(article => {
      const content = articleContents.get(article.path)
      if (!content) return false

      // Search in title
      if (content.title.includes(searchTerm)) return true

      // Search in tags
      if (content.tags.some(tag => tag.includes(searchTerm))) return true

      // Search in content
      if (content.content.includes(searchTerm)) return true

      return false
    })
  }, [articleContents, loadArticleContent])

  // Filter articles based on selected tags and search query
  useEffect(()=>{
    const applyFilters = async () => {
      let filtered = allArticles

      // Apply tag filter
      if(selected.length > 0){
        const tagsLC = selected.map(s=>s.toLowerCase())
        filtered = allArticles.filter(article => {
          const articleTagsLC = article.tags.map(t=>t.toLowerCase())
          return tagsLC.every(tag => articleTagsLC.includes(tag))
        })
      }

      // Apply search filter
      if(searchQuery.trim()){
        filtered = await searchArticles(searchQuery, filtered)
      }

      setFilteredArticles(filterOutAbout(filtered))
    }

    applyFilters()
  },[selected, allArticles, searchQuery, searchArticles])

  // Calculate available tags from currently filtered articles
  useEffect(()=>{
    const tagsFromFiltered = new Set()
    filteredArticles.forEach(article => {
      article.tags.forEach(tag => tagsFromFiltered.add(tag))
    })
    setAvailableTags(Array.from(tagsFromFiltered).sort())
  },[filteredArticles])

  // Sort filtered articles
  useEffect(()=>{
    const sorted = [...filteredArticles].sort((a, b)=>{
      if (sortOrder === 'a-z' || sortOrder === 'z-a') {
        const titleA = (a.title || '').toLowerCase()
        const titleB = (b.title || '').toLowerCase()
        
        if (sortOrder === 'a-z') {
          return titleA.localeCompare(titleB)
        } else { // z-a
          return titleB.localeCompare(titleA)
        }
      } else {
        // Date-based sorting for newest/oldest
        const getDate = (article)=>{
          const dateMatch = article.html.match(/<div class="article-date">([^<]+)<\/div>/)
          if(!dateMatch || dateMatch[1].includes('Coming soon')) return new Date('2099-12-31') // Put "Coming soon" at beginning for newest
          return new Date(dateMatch[1])
        }
        
        const dateA = getDate(a)
        const dateB = getDate(b)
        
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      }
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

  const handleSearch = useCallback((query)=>{
    setSearchQuery(query)
    setCurrentPage(1) // Reset to page 1 when search changes
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

  const paginationRoot = typeof document !== 'undefined' ? document.getElementById('pagination-root') : null
  const controlsRoot = typeof document !== 'undefined' ? document.getElementById('articles-controls-root') : null
  const sidebarRoot = typeof document !== 'undefined' ? document.getElementById('sidebar-content') : null

  return (
    <>
      <Header onOpenArticle={openArticle} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      {sidebarRoot && createPortal(
        <Sidebar 
          isOpen={menuOpen} 
          onClose={() => setMenuOpen(false)} 
          onOpenArticle={openArticle}
          onHome={closeArticle}
        />,
        sidebarRoot
      )}
      <BinaryBg />
      {controlsRoot && createPortal(
        <ArticlesControls 
          tags={availableTags}
          selected={selected}
          onApply={applyFilter}
          onClear={clearFilter}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          searchBar={<SearchBar onSearch={handleSearch} />}
        />,
        controlsRoot
      )}
      <ArticlesGrid 
        articles={allArticles.length > 0 ? currentArticles : undefined}
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
