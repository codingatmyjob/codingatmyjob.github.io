const html = document.documentElement
const menuToggle = document.querySelector('.menu-toggle')
const sidebar = document.querySelector('.sidebar')
const sidebarContent = document.querySelector('.sidebar-content')
const sidebarOverlay = document.querySelector('.sidebar-overlay')
const sidebarClose = document.querySelector('.sidebar-close-toggle')
const sidebarTitle = document.querySelector('.sidebar-header-title')
const themeToggle = document.querySelector('.theme-toggle')
const scrollTopButton = document.getElementById('scroll-top')

const setMenuOpen = (open) => {
  if (!menuToggle || !sidebarContent || !sidebarOverlay) return
  menuToggle.classList.toggle('sidebar-open', open)
  menuToggle.setAttribute('aria-expanded', String(open))
  sidebarClose?.classList.toggle('sidebar-open', open)
  sidebarContent.classList.toggle('sidebar-open', open)
  sidebarOverlay.classList.toggle('sidebar-open', open)
  sidebar.style.pointerEvents = open ? 'auto' : 'none'
  if (sidebarTitle) sidebarTitle.hidden = !open
  if (open) sidebarClose?.focus()
  else menuToggle.focus()
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true')
  })
}
sidebarClose?.addEventListener('click', () => setMenuOpen(false))
sidebarOverlay?.addEventListener('click', () => setMenuOpen(false))
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') setMenuOpen(false)
})
document.addEventListener('click', (event) => {
  if (
    menuToggle?.getAttribute('aria-expanded') === 'true' &&
    !sidebar?.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) setMenuOpen(false)
})

const setTheme = (theme, save = false) => {
  const next = theme === 'dark' ? 'dark' : 'light'
  html.dataset.theme = next
  if (!themeToggle) return
  themeToggle.setAttribute('aria-pressed', String(next === 'dark'))
  themeToggle.title = next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  if (save) {
    try {
      localStorage.setItem('theme', next)
    } catch (error) {
      console.warn('Theme preference could not be saved:', error)
    }
  }
}

let storedTheme = null
try {
  storedTheme = localStorage.getItem('theme')
} catch (error) {
  console.warn('Theme preference could not be read:', error)
}
setTheme(storedTheme || html.dataset.theme)

themeToggle?.addEventListener('click', () => {
  setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark', true)
})

if (themeToggle && !storedTheme && window.matchMedia) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const applySystemTheme = () => setTheme(media.matches ? 'dark' : 'light')
  if (typeof media.addEventListener === 'function') media.addEventListener('change', applySystemTheme)
  else media.addListener(applySystemTheme)
}

if (scrollTopButton) {
  const safeRight = 'max(20px, env(safe-area-inset-right, 0px))'
  const footer = document.querySelector('.site-footer')
  const updateScrollTop = () => {
    const articleContainer = document.querySelector('.article-container')
    const homeContainer = document.querySelector('#articles-view')
    const anchor = document.body.classList.contains('article-open') ? articleContainer : homeContainer
    if (anchor) {
      const rect = anchor.getBoundingClientRect()
      const desiredLeft = Math.round(rect.right + 30)
      if (desiredLeft + (scrollTopButton.offsetWidth || 44) > window.innerWidth - 8) {
        scrollTopButton.style.removeProperty('--scroll-left')
        scrollTopButton.style.setProperty('--scroll-right', safeRight)
      } else {
        scrollTopButton.style.setProperty('--scroll-left', `${desiredLeft}px`)
        scrollTopButton.style.removeProperty('--scroll-right')
      }
    } else {
      scrollTopButton.style.removeProperty('--scroll-left')
      scrollTopButton.style.setProperty('--scroll-right', safeRight)
    }
    const scrollPosition = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop)
    const isVisible = scrollPosition > 200
    if (isVisible && footer) {
      const footerClearance = window.innerHeight - footer.getBoundingClientRect().top + 12
      scrollTopButton.style.setProperty('--scroll-footer-clearance', `${footerClearance}px`)
    }
    scrollTopButton.hidden = !isVisible
    scrollTopButton.classList.toggle('is-visible', isVisible)
  }
  window.addEventListener('resize', updateScrollTop)
  window.addEventListener('scroll', updateScrollTop)
  document.body.addEventListener('scroll', updateScrollTop)
  const motion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  scrollTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motion() }))
  const observer = new MutationObserver(updateScrollTop)
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  updateScrollTop()
}

document.querySelectorAll('.article-share-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    const title = button.dataset.shareTitle || document.title
    const description = button.dataset.shareDescription || ''
    const url = button.dataset.shareUrl || window.location.href
    try {
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && navigator.share) {
        await navigator.share({ title, text: description, url })
        return
      }
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url)
      else {
        const field = document.createElement('textarea')
        field.value = url
        field.setAttribute('readonly', '')
        field.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
        document.body.appendChild(field)
        field.select()
        document.execCommand('copy')
        field.remove()
      }
      const text = button.querySelector('.article-share-btn-text')
      button.classList.add('copied')
      if (text) text.textContent = 'Copied!'
      window.setTimeout(() => {
        button.classList.remove('copied')
        if (text) text.textContent = 'Share'
      }, 1500)
    } catch (error) {
      if (error?.name !== 'AbortError') console.warn('Share failed:', error)
    }
  })
})

document.querySelectorAll('.related-carousel').forEach((carousel) => {
  const track = carousel.querySelector('.related-carousel-track')
  const left = carousel.querySelector('.related-carousel-arrow-left')
  const right = carousel.querySelector('.related-carousel-arrow-right')
  const firstCard = track?.querySelector('.related-carousel-card')
  if (!track) return

  const update = () => {
    const max = track.scrollWidth - track.clientWidth
    const canLeft = track.scrollLeft > 2
    const canRight = max - track.scrollLeft > 2
    carousel.classList.toggle('has-overflow', canLeft || canRight)
    if ((canLeft || canRight) && firstCard) {
      const card = firstCard.getBoundingClientRect()
      const carouselTop = carousel.getBoundingClientRect().top + carousel.clientTop
      carousel.style.setProperty('--related-arrow-center', `${card.top + card.height / 2 - carouselTop}px`)
    }
    if (left) left.hidden = !canLeft
    if (right) right.hidden = !canRight
  }

  const scrollByCard = (direction) => {
    const cards = Array.from(track.querySelectorAll('.related-carousel-card'))
    const trackEdge = track.getBoundingClientRect().left
    const offsets = cards.map((card) => Math.round(card.getBoundingClientRect().left - trackEdge + track.scrollLeft))
    const current = track.scrollLeft
    const target = direction > 0
      ? offsets.find((offset) => offset > current + 4) ?? track.scrollWidth - track.clientWidth
      : offsets.filter((offset) => offset < current - 4).pop() ?? 0
    track.scrollTo({ left: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  left?.addEventListener('click', () => scrollByCard(-1))
  right?.addEventListener('click', () => scrollByCard(1))
  track.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(update)
    observer.observe(track)
  }
  window.requestAnimationFrame(update)
})
