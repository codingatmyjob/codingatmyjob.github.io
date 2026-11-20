const html = document.documentElement
const menuToggle = document.querySelector('.menu-toggle')
const sidebar = document.querySelector('.sidebar')
const sidebarContent = document.querySelector('.sidebar-content')
const sidebarOverlay = document.querySelector('.sidebar-overlay')
const sidebarClose = document.querySelector('.sidebar-close-toggle')
const sidebarTitle = document.querySelector('.sidebar-header-title')
const themeToggle = document.querySelector('.theme-toggle')
const background = document.getElementById('binary-bg')
const scrollTopButton = document.getElementById('scroll-top')

const setMenuOpen = (open) => {
  if (!menuToggle || !sidebarContent || !sidebarOverlay) return
  menuToggle.classList.toggle('sidebar-open', open)
  menuToggle.setAttribute('aria-expanded', String(open))
  sidebarClose?.classList.toggle('sidebar-open', open)
  sidebarContent.classList.toggle('sidebar-open', open)
  sidebarOverlay.classList.toggle('sidebar-open', open)
  sidebar.style.pointerEvents = open ? 'auto' : 'none'
  if (sidebarTitle) sidebarTitle.hidden = !open || window.innerWidth >= 1278
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true')
  })
}
sidebarClose?.addEventListener('click', () => setMenuOpen(false))
sidebarOverlay?.addEventListener('click', () => setMenuOpen(false))
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
  themeToggle.classList.toggle('theme-toggle-dark', next === 'dark')
  themeToggle.classList.toggle('theme-toggle-light', next === 'light')
  themeToggle.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`)
  themeToggle.setAttribute('aria-pressed', String(next === 'dark'))
  themeToggle.querySelector('.theme-toggle-text').textContent = next === 'dark' ? 'Dark' : 'Light'
  themeToggle.querySelector('.theme-toggle-glyph').innerHTML = next === 'dark'
    ? '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
    : '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07 7.07-1.41-1.41M6.34 6.34 4.93 4.93m14.14 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>'
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

if (background) {
  let resizeTimer
  const buildBackground = () => {
    background.replaceChildren()
    const count = Math.min(180, Math.floor(window.innerWidth / 8)) || 100
    const fragment = document.createDocumentFragment()
    for (let index = 0; index < count; index += 1) {
      const bit = document.createElement('div')
      bit.className = 'bit'
      bit.textContent = Math.random() < 0.5 ? '0' : '1'
      bit.style.left = `${Math.random() * 100}vw`
      const duration = 6 + Math.random() * 12
      bit.style.fontSize = `${10 + Math.random() * 26}px`
      bit.style.animationDuration = `${duration}s, ${duration}s`
      bit.style.animationDelay = `${-Math.random() * duration}s, ${-Math.random() * duration}s`
      bit.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`
      fragment.appendChild(bit)
    }
    background.appendChild(fragment)
  }
  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(buildBackground, 200)
  }
  buildBackground()
  window.addEventListener('resize', onResize)
}

if (scrollTopButton) {
  const safeRight = 'max(20px, env(safe-area-inset-right, 0px))'
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
    scrollTopButton.hidden = !isVisible
    scrollTopButton.classList.toggle('is-visible', isVisible)
  }
  window.addEventListener('resize', updateScrollTop)
  window.addEventListener('scroll', updateScrollTop)
  document.body.addEventListener('scroll', updateScrollTop)
  scrollTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
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
  if (!track) return

  const update = () => {
    const max = track.scrollWidth - track.clientWidth
    const canLeft = track.scrollLeft > 2
    const canRight = max - track.scrollLeft > 2
    carousel.classList.toggle('has-overflow', canLeft || canRight)
    if (left) left.hidden = !canLeft
    if (right) right.hidden = !canRight
  }

  const scrollByCard = (direction) => {
    const cards = Array.from(track.querySelectorAll('.related-carousel-card'))
    const offsets = cards.map((card) => Math.round(card.offsetLeft - track.offsetLeft))
    const current = track.scrollLeft
    const target = direction > 0
      ? offsets.find((offset) => offset > current + 4) ?? track.scrollWidth - track.clientWidth
      : offsets.filter((offset) => offset < current - 4).pop() ?? 0
    track.scrollTo({ left: target, behavior: 'smooth' })
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
