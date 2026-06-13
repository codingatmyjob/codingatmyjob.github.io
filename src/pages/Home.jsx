import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ArticlesGrid from '../components/ArticlesGrid'
import ArticlesControls from '../components/ArticlesControls'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { articlesData } from '../data/articles'

const ROWS_PER_PAGE = 8

const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 4 * ROWS_PER_PAGE
  const width = window.innerWidth
  let columns = 4
  if (width <= 768) columns = 1
  else if (width <= 900) columns = 2
  else if (width <= 1278) columns = 3
  return columns * ROWS_PER_PAGE
}

export default function Home() {
  const navigate = useNavigate()
  const allArticles = articlesData
  const [filteredArticles, setFilteredArticles] = useState(articlesData)
  const [sortedArticles, setSortedArticles] = useState([])
  const [selected, setSelected] = useState([])
  const [sortOrder, setSortOrder] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage())
  const [availableTags, setAvailableTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [articleContents, setArticleContents] = useState(new Map())

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadArticleContent = useCallback(async (article) => {
    if (!article.path) return null
    const cached = articleContents.get(article.path)
    if (cached) return cached

    try {
      const viteBase = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ? import.meta.env.BASE_URL : '/'
      const urlToFetch = article.path.startsWith('/')
        ? new URL(article.path, location.origin).href
        : new URL(article.path, location.origin + viteBase).href

      const response = await fetch(urlToFetch, { cache: 'no-store' })
      if (!response.ok) throw new Error(response.status)
      const htmlText = await response.text()
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlText

      const title = tempDiv.querySelector('h1')?.textContent || ''
      const tags = Array.from(tempDiv.querySelectorAll('.tag')).map(t => t.textContent.trim())
      const articleEl = tempDiv.querySelector('article')
      const content = articleEl ? articleEl.textContent : ''

      const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      const searchableContent = {
        title: normalize(title),
        tags: tags.map(t => normalize(t)),
        content: normalize(content)
      }

      setArticleContents(prev => new Map(prev).set(article.path, searchableContent))
      return searchableContent
    } catch (error) {
      console.warn(`Failed to load content for ${article.path}:`, error)
      return null
    }
  }, [articleContents])

  const searchArticles = useCallback(async (query, articles) => {
    if (!query.trim()) return articles
    const searchTerm = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    const contents = await Promise.all(articles.map(loadArticleContent))
    return articles.filter((article, index) => {
      const content = contents[index] || articleContents.get(article.path)
      if (!content) return false
      if (content.title.includes(searchTerm)) return true
      if (content.tags.some(tag => tag.includes(searchTerm))) return true
      if (content.content.includes(searchTerm)) return true
      return false
    })
  }, [articleContents, loadArticleContent])

  useEffect(() => {
    const applyFilters = async () => {
      let filtered = allArticles
      if (selected.length > 0) {
        const tagsLC = selected.map(s => s.toLowerCase())
        filtered = allArticles.filter(article => {
          const articleTagsLC = article.tags.map(t => t.toLowerCase())
          return tagsLC.every(tag => articleTagsLC.includes(tag))
        })
      }
      if (searchQuery.trim()) {
        filtered = await searchArticles(searchQuery, filtered)
      }
      setFilteredArticles(filtered)
    }
    applyFilters()
  }, [selected, allArticles, searchQuery, searchArticles])

  useEffect(() => {
    const tagsFromFiltered = new Set()
    filteredArticles.forEach(article => article.tags.forEach(tag => tagsFromFiltered.add(tag)))
    setAvailableTags(Array.from(tagsFromFiltered).sort())
  }, [filteredArticles])

  useEffect(() => {
    const sorted = [...filteredArticles].sort((a, b) => {
      if (sortOrder === 'a-z' || sortOrder === 'z-a') {
        const titleA = (a.title || '').toLowerCase()
        const titleB = (b.title || '').toLowerCase()
        return sortOrder === 'a-z' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA)
      }
      const getDate = (article) => article.publishedAt ? new Date(article.publishedAt) : new Date('2099-12-31')
      return sortOrder === 'newest' ? getDate(b) - getDate(a) : getDate(a) - getDate(b)
    })
    setSortedArticles(sorted)
  }, [filteredArticles, sortOrder])

  const applyFilter = useCallback((selTags) => { setSelected(selTags); setCurrentPage(1) }, [])
  const clearFilter = useCallback(() => { setSelected([]); setCurrentPage(1) }, [])
  const handleSortChange = useCallback((order) => { setSortOrder(order); setCurrentPage(1) }, [])
  const handleSearch = useCallback((query) => { setSearchQuery(query); setCurrentPage(1) }, [])

  const openArticle = useCallback((path) => {
    if (!path) return
    // Convert file paths to routes: articles/slug.html → /articles/slug, sidebar/page.html → /sidebar/page
    if (path.startsWith('articles/') || path.startsWith('/articles/')) {
      const slug = path.replace(/^\/?(articles\/)/, '').replace(/\.html$/, '')
      navigate(`/articles/${slug}`)
    } else if (path.startsWith('sidebar/') || path.startsWith('/sidebar/')) {
      const page = path.replace(/^\/?(sidebar\/)/, '').replace(/\.html$/, '')
      navigate(`/sidebar/${page}`)
    } else {
      const clean = path.replace(/\.html$/, '')
      navigate(`/${clean}`)
    }
  }, [navigate])

  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentArticles = sortedArticles.slice(startIndex, startIndex + itemsPerPage)

  return (
    <section className="content-area">
      <section className="site-intro" aria-labelledby="site-intro-title">
        <h1 id="site-intro-title">Tangent</h1>
        <p>
          Tangent is a cybersecurity and data analyst blog that encapsulates random thoughts, experiments, and side projects that grew beyond the first idea.
          Over time, these tangents build a real project portfolio with technical notes, project builds, experiments, reviews, and practical writeups.
        </p>
      </section>

      <div id="articles-view">
        <div className="articles-controls">
          <div id="articles-controls-root">
          <ArticlesControls
            tags={availableTags}
            selected={selected}
            onApply={applyFilter}
            onClear={clearFilter}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            searchBar={<SearchBar onSearch={handleSearch} />}
          />
          </div>
        </div>
        <div className="articles-grid">
          <ArticlesGrid articles={currentArticles} onOpenArticle={openArticle} />
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </section>
  )
}
