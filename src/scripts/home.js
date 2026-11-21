const config = document.getElementById('home-data')
const grid = document.getElementById('articles-grid')
const layoutControls = document.getElementById('article-layout-controls')

if (grid && layoutControls) {
  const buttons = layoutControls.querySelectorAll('button[data-layout]')
  const setLayout = (layout) => {
    grid.dataset.layout = layout
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.layout === layout))
    })
  }

  try {
    if (localStorage.getItem('tangentArticleLayout') === 'wide') setLayout('wide')
  } catch (error) {
    console.warn('Article layout preference could not be read:', error)
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const layout = button.dataset.layout
      setLayout(layout)
      try {
        localStorage.setItem('tangentArticleLayout', layout)
      } catch (error) {
        console.warn('Article layout preference could not be saved:', error)
      }
    })
  })
  layoutControls.hidden = false
}

if (config && grid) {
  const articles = JSON.parse(config.dataset.articles || '[]')
  const basePath = config.dataset.base || '/'
  const searchInput = document.getElementById('article-search')
  const searchSpinner = document.querySelector('.search-spinner')
  const searchClear = document.querySelector('.search-clear')
  const sortToggle = document.getElementById('sort-toggle')
  const sortDropdown = document.querySelector('.sort-dropdown')
  const filterToggle = document.getElementById('filter-toggle')
  const filterPanel = document.getElementById('tag-filter-panel')
  const filterList = document.getElementById('tag-filter-list')
  const filterCount = document.querySelector('.filter-count')
  const showcase = document.getElementById('portfolio-showcase')
  const archive = document.getElementById('archive')
  const archiveCount = document.getElementById('archive-count')
  const pagination = document.querySelector('.pagination-container')
  const pageCurrent = document.querySelector('.pagination-current')
  const pageTotal = document.querySelector('.pagination-total')
  const pageButtons = Array.from(document.querySelectorAll('.pagination-btn'))
  const contentCache = new Map()
  const params = new URLSearchParams(window.location.search)
  let query = params.get('q') || ''
  let selectedTags = (params.get('tags') || '').split(',').filter(Boolean)
  let sortOrder = ['newest', 'oldest', 'a-z', 'z-a'].includes(params.get('sort')) ? params.get('sort') : 'newest'
  let currentPage = 1
  let searchTimer = null
  let renderId = 0

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const routeFor = (path) => {
    const slug = String(path || '').replace(/^\/?articles\//, '').replace(/\.html$/, '')
    return `${basePath}articles/${slug}/`
  }

  const imageFor = (source) => {
    if (!source || source.startsWith('http')) return source || ''
    if (source.startsWith('/')) return `${basePath}${source.replace(/^\/+/, '')}`
    return `${basePath}${source}`
  }

  const createCard = (article, index) => {
    const image = imageFor(article.imageSrc)
    const imageMarkup = image
      ? `<img class="article-card-image ${escapeHtml(article.imageClassName || '')}" src="${escapeHtml(image)}" alt="${escapeHtml(article.imageAlt || article.title || 'Article image')}"${article.imageInset ? ` data-image-inset="${escapeHtml(article.imageInset)}"` : ''} loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">`
      : escapeHtml(article.imageLabel || article.title)

    return `<a class="article-card" href="${escapeHtml(routeFor(article.path))}" data-path="${escapeHtml(article.path)}">
      <div class="article-image">${imageMarkup}</div>
      <div class="article-content">
        <div class="article-date">${escapeHtml(article.date)}</div>
        ${article.readingTime ? `<div class="reading-time">${escapeHtml(article.readingTime)} read</div>` : ''}
        <div class="article-title">${escapeHtml(article.title)}</div>
        <div class="article-description">${escapeHtml(article.description)}</div>
        <div class="article-tags">${(article.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    </a>`
  }

  const setUrl = () => {
    const next = new URLSearchParams(window.location.search)
    if (query.trim()) next.set('q', query.trim())
    else next.delete('q')
    if (selectedTags.length) next.set('tags', selectedTags.join(','))
    else next.delete('tags')
    if (sortOrder !== 'newest') next.set('sort', sortOrder)
    else next.delete('sort')
    const search = next.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)
  }

  const getItemsPerPage = () => {
    if (window.innerWidth <= 768) return 8
    if (window.innerWidth <= 900) return 16
    return 24
  }

  const getSearchContent = async (article) => {
    if (contentCache.has(article.path)) return contentCache.get(article.path)

    const file = article.path.endsWith('.html') ? article.path : `${article.path}.html`
    try {
      const response = await fetch(`${basePath}${file.replace(/^\/+/, '')}`, { cache: 'force-cache' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html')
      const content = {
        title: normalize(doc.querySelector('h1')?.textContent || article.title),
        tags: Array.from(doc.querySelectorAll('.tag'), (tag) => normalize(tag.textContent.trim())),
        content: normalize(doc.querySelector('article')?.textContent || '')
      }
      contentCache.set(article.path, content)
      return content
    } catch (error) {
      console.warn(`Failed to load content for ${article.path}:`, error)
      contentCache.set(article.path, null)
      return null
    }
  }

  const updateSortLabel = () => {
    const labels = { newest: 'Newest', oldest: 'Oldest', 'a-z': 'A-Z', 'z-a': 'Z-A' }
    const label = labels[sortOrder] || labels.newest
    sortToggle.querySelector('.sort-label').textContent = label
    sortToggle.setAttribute('aria-label', `Sort: ${label}`)
    sortToggle.title = `Sort: ${label}`
    const arrow = sortToggle.querySelector('.dropdown-arrow')
    arrow.classList.toggle('arrow-up', ['oldest', 'z-a'].includes(sortOrder))
    arrow.classList.toggle('arrow-down', !['oldest', 'z-a'].includes(sortOrder))
    sortDropdown.querySelectorAll('[data-sort]').forEach((button) => {
      button.classList.toggle('active', button.dataset.sort === sortOrder)
    })
  }

  const updateFilterState = () => {
    filterToggle.classList.toggle('filters-active', selectedTags.length > 0)
    filterToggle.setAttribute('aria-expanded', String(!filterPanel.hidden))
    filterPanel.setAttribute('aria-hidden', String(filterPanel.hidden))
    filterCount.textContent = selectedTags.length ? String(selectedTags.length) : ''
    filterList.querySelectorAll('[data-tag]').forEach((button) => {
      const active = selectedTags.includes(button.dataset.tag)
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', String(active))
    })
  }

  const render = async () => {
    const requestId = ++renderId
    const term = normalize(query.trim())
    if (showcase) showcase.hidden = Boolean(term || selectedTags.length || sortOrder !== 'newest')
    searchSpinner.hidden = !term
    let filtered = articles.filter((article) =>
      selectedTags.every((tag) => (article.tags || []).some((articleTag) => articleTag.toLowerCase() === tag.toLowerCase()))
    )

    if (term) {
      const content = await Promise.all(filtered.map(getSearchContent))
      if (requestId !== renderId) return
      filtered = filtered.filter((article, index) => {
        const searchable = content[index]
        if (!searchable) return normalize(article.title).includes(term) || (article.tags || []).some((tag) => normalize(tag).includes(term))
        return searchable.title.includes(term) ||
          searchable.tags.some((tag) => tag.includes(term)) ||
          searchable.content.includes(term)
      })
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'a-z' || sortOrder === 'z-a') {
        const left = (a.title || '').toLowerCase()
        const right = (b.title || '').toLowerCase()
        return sortOrder === 'a-z' ? left.localeCompare(right) : right.localeCompare(left)
      }
      const left = a.publishedAt ? new Date(a.publishedAt) : new Date('2099-12-31')
      const right = b.publishedAt ? new Date(b.publishedAt) : new Date('2099-12-31')
      return sortOrder === 'newest' ? right - left : left - right
    })

    const visibleTags = [...new Set(filtered.flatMap((article) => article.tags || []))].sort()
    filterList.innerHTML = visibleTags.map((tag) =>
      `<button class="filter-item" type="button" data-tag="${escapeHtml(tag)}" aria-pressed="${selectedTags.includes(tag)}">${escapeHtml(tag)}</button>`
    ).join('')
    updateFilterState()

    const pageSize = getItemsPerPage()
    if (archiveCount) {
      const count = `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`
      if (archiveCount.textContent !== count) archiveCount.textContent = count
    }
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    currentPage = Math.min(currentPage, totalPages)
    const first = (currentPage - 1) * pageSize
    const cards = filtered.slice(first, first + pageSize)
    grid.innerHTML = cards.length
      ? cards.map((article, index) => createCard(article, index)).join('')
      : `<div class="no-results"><div class="no-results-content">
          <svg class="no-results-icon" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <h3 class="no-results-title">No articles found</h3>
          <p class="no-results-message">Try adjusting your search terms or filters to find what you're looking for.</p>
        </div></div>`

    pagination.hidden = totalPages <= 1
    pageCurrent.textContent = String(currentPage)
    pageTotal.textContent = String(totalPages)
    pageButtons.forEach((button) => {
      const label = button.getAttribute('aria-label')
      button.disabled =
        (label === 'First page' || label === 'Previous page') ? currentPage === 1 :
          (label === 'Next page' || label === 'Last page') ? currentPage === totalPages : false
    })
    searchSpinner.hidden = true
    searchClear.hidden = !query
  }

  searchInput.value = query
  updateSortLabel()
  updateFilterState()
  setUrl()
  render()

  searchInput.addEventListener('input', () => {
    query = searchInput.value
    currentPage = 1
    searchClear.hidden = !query
    searchSpinner.hidden = !query.trim()
    window.clearTimeout(searchTimer)
    if (!query.trim()) {
      render()
      setUrl()
      return
    }
    searchTimer = window.setTimeout(() => {
      setUrl()
      render().finally(() => { searchSpinner.hidden = true })
    }, 500)
  })

  searchClear.addEventListener('click', () => {
    searchInput.value = ''
    query = ''
    currentPage = 1
    searchSpinner.hidden = true
    searchClear.hidden = true
    setUrl()
    render()
    searchInput.focus()
  })

  sortToggle.addEventListener('click', () => {
    sortDropdown.hidden = !sortDropdown.hidden
    sortToggle.setAttribute('aria-expanded', String(!sortDropdown.hidden))
  })

  sortDropdown.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sort]')
    if (!button) return
    sortOrder = button.dataset.sort
    currentPage = 1
    sortDropdown.hidden = true
    sortToggle.setAttribute('aria-expanded', 'false')
    updateSortLabel()
    setUrl()
    render()
  })

  filterToggle.addEventListener('click', () => {
    filterPanel.hidden = !filterPanel.hidden
    updateFilterState()
  })

  filterList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tag]')
    if (!button) return
    const tag = button.dataset.tag
    selectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((value) => value !== tag)
      : [...selectedTags, tag]
    currentPage = 1
    updateFilterState()
    setUrl()
    render()
  })

  document.getElementById('filter-clear-btn').addEventListener('click', () => {
    selectedTags = []
    currentPage = 1
    filterPanel.hidden = true
    updateFilterState()
    setUrl()
    render()
  })

  document.addEventListener('click', (event) => {
    if (!sortToggle.contains(event.target) && !sortDropdown.contains(event.target)) {
      sortDropdown.hidden = true
      sortToggle.setAttribute('aria-expanded', 'false')
    }
    if (!filterToggle.contains(event.target) && !filterPanel.contains(event.target)) {
      filterPanel.hidden = true
      updateFilterState()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      sortDropdown.hidden = true
      filterPanel.hidden = true
      sortToggle.setAttribute('aria-expanded', 'false')
      updateFilterState()
    }
  })

  window.addEventListener('scroll', () => {
    sortDropdown.hidden = true
    filterPanel.hidden = true
    sortToggle.setAttribute('aria-expanded', 'false')
    updateFilterState()
  }, { passive: true })

  window.addEventListener('resize', () => {
    currentPage = 1
    render()
  })

  pageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = button.getAttribute('aria-label')
      const totalPages = Number(pageTotal.textContent) || 1
      if (label === 'First page') currentPage = 1
      else if (label === 'Previous page') currentPage = Math.max(1, currentPage - 1)
      else if (label === 'Next page') currentPage = Math.min(totalPages, currentPage + 1)
      else if (label === 'Last page') currentPage = totalPages
      render()
      archive?.focus({ preventScroll: true })
      archive?.scrollIntoView()
    })
  })
}
