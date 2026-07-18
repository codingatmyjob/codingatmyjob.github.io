import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { articlesData } from '../data/articles'
import { RelatedArticlesCarousel } from '../components/articles/RelatedArticlesCarousel'
import { getSiteUrl } from '../siteUrls'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-powershell'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'

const LANGUAGE_ALIASES = {
  html: 'markup',
  xml: 'markup',
  shell: 'bash',
  sh: 'bash',
  ps1: 'powershell',
  yml: 'yaml'
}

const COPY_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

function normalizeLanguage(raw) {
  if (!raw) return ''
  const key = raw.toLowerCase()
  return LANGUAGE_ALIASES[key] || key
}

function getLanguageLabel(language) {
  if (!language) return 'text'
  const key = language.toLowerCase()
  if (key === 'javascript' || key === 'js') return 'JavaScript'
  if (key === 'typescript' || key === 'ts') return 'TypeScript'
  if (key === 'powershell' || key === 'ps1') return 'PowerShell'
  if (key === 'markup') return 'Markup'
  if (['css', 'json', 'sql', 'jsx', 'tsx', 'yaml', 'yml'].includes(key)) return key.toUpperCase()
  return `${key.charAt(0).toUpperCase()}${key.slice(1)}`
}

function detectLanguageFromClasses(codeEl, preEl) {
  const match = `${codeEl.className} ${preEl.className}`.match(/(?:lang|language)-([a-z0-9-]+)/i)
  return normalizeLanguage(match ? match[1] : '')
}

function inferLanguageFromCode(source) { //ATTEMPT TO INFER LANGUAGE IF NOT EXPLICITLY PROVIDED
  const text = (source || '').trim()
  if (!text) return ''
  if (/<([a-z][\w-]*)[\s>]/i.test(text)) return 'markup'
  if (/(^|\n)\s*\$env:/.test(text) || /\bGet-[A-Z]/.test(text)) return 'powershell'
  if (/(^|\n)\s*(npm|pnpm|yarn|git|cd|ls|cat)\b/.test(text)) return 'bash'
  if (/^\s*[\[{][\s\S]*[\]}]\s*$/.test(text) && /"\s*:/.test(text)) return 'json'
  return ''
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

function mountCodeBlockToolbar(preEl, language, codeText) {
  if (preEl.parentElement?.classList.contains('code-block')) return
  const shell = document.createElement('div')
  shell.className = 'code-block'
  const toolbar = document.createElement('div')
  toolbar.className = 'code-block-toolbar'
  const langLabel = document.createElement('span')
  langLabel.className = 'code-language'
  langLabel.textContent = getLanguageLabel(language)
  const copyAction = document.createElement('button')
  copyAction.type = 'button'
  copyAction.className = 'code-copy-trigger'
  copyAction.setAttribute('aria-label', 'Copy code block')
  copyAction.setAttribute('title', 'Copy code')
  copyAction.innerHTML = COPY_ICON_SVG
  let resetTimer = null
  copyAction.addEventListener('click', async () => {
    try {
      await copyText(codeText)
      copyAction.classList.add('copied')
      copyAction.setAttribute('aria-label', 'Copied')
      copyAction.setAttribute('title', 'Copied')
      if (resetTimer) clearTimeout(resetTimer)
      resetTimer = window.setTimeout(() => {
        copyAction.classList.remove('copied')
        copyAction.setAttribute('aria-label', 'Copy code block')
        copyAction.setAttribute('title', 'Copy code')
      }, 1200)
    } catch (error) {
      console.warn('Copy failed:', error)
    }
  })
  toolbar.appendChild(langLabel)
  toolbar.appendChild(copyAction)
  preEl.parentNode.insertBefore(shell, preEl)
  shell.appendChild(toolbar)
  shell.appendChild(preEl)
}

function enhanceCodeBlocks(root) {
  Array.from(root.querySelectorAll('pre code')).forEach(codeEl => {
    const preEl = codeEl.parentElement
    if (!preEl) return
    const cleanedCode = (codeEl.textContent || '').replace(/(?:\r?\n[ \t]*)+$/g, '')
    codeEl.textContent = cleanedCode
    const inferred = detectLanguageFromClasses(codeEl, preEl) || inferLanguageFromCode(cleanedCode)
    if (inferred) {
      codeEl.classList.add(`language-${inferred}`)
      preEl.classList.add(`language-${inferred}`)
      if (Prism.languages[inferred]) Prism.highlightElement(codeEl)
    }
    mountCodeBlockToolbar(preEl, inferred, cleanedCode)
  })
}

// Extract the full <main> element (including its tag + classes) — works in both Node.js (SSG) and browser
function extractMainHtml(rawHtml) {
  const match = rawHtml.match(/(<main[^>]*>[\s\S]*<\/main>)/i)
  return match ? match[1] : rawHtml
}

// Extract <style> blocks from <head>
function extractHeadStyles(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (!headMatch) return []
  const styleMatches = [...headMatch[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
  return styleMatches.map(m => m[1]).filter(Boolean)
}

// Extract inline <script> tags (no src attr) and preserve type (module/classic)
function extractInlineScripts(rawHtml) {
  if (typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')
  const scripts = Array.from(doc.querySelectorAll('script:not([src])'))
  return scripts.map((script) => ({
    code: script.textContent || '',
    type: (script.getAttribute('type') || '').trim().toLowerCase()
  })).filter(({ code }) => code.trim())
}

export default function ArticlePage() {
  const { rawHtml } = useLoaderData()
  const navigate = useNavigate()
  const { slug = '' } = useParams()
  const ref = useRef(null)
  const [relatedSlugs, setRelatedSlugs] = useState(/** @type {{slug:string,score:number,maxScore:number}[]} */ ([]))

  const articleMeta = useMemo(() => {
    const article = articlesData.find((item) => item.id === slug || item.path === `articles/${slug}` || item.path === `articles/${slug}.html`)
    const fallbackTitle = slug
      ? slug
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : 'Article'
    return {
      title: article?.title || fallbackTitle,
      description: article?.description || 'Technical notes, project builds, experiments, reviews, and practical writeups from Tangent.',
      canonical: getSiteUrl(`articles/${slug}.html`),
      image: article?.imageSrc ? getSiteUrl(article.imageSrc) : getSiteUrl('images/cover/og-image.png')
    }
  }, [slug])

  const rawMain = rawHtml ? extractMainHtml(rawHtml) : ''
  const mainHtml = rawMain.replace(
    /(<main[^>]*>)/i,
    '$1<div class="article-home-nav"><a class="article-home-btn" href="/" aria-label="Return home"><span class="article-home-btn-icon" aria-hidden="true">&larr;</span><span>Return Home</span></a></div>'
  )
  const headStyles = rawHtml ? extractHeadStyles(rawHtml) : []

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const injectedScripts = []
    const homeBtn = el.querySelector('.article-home-btn')
    const onHomeClick = (event) => {
      event.preventDefault()
      navigate('/')
    }
    if (homeBtn) homeBtn.addEventListener('click', onHomeClick)

    // Re-execute inline scripts (cruise comparisons interactive demo, etc.)
    if (rawHtml) {
      extractInlineScripts(rawHtml).forEach(({ code, type }) => {
        try {
          const scriptEl = document.createElement('script')
          if (type && type !== 'text/javascript' && type !== 'application/javascript') {
            scriptEl.type = type
          }
          scriptEl.textContent = code
          scriptEl.setAttribute('data-article-inline-script', 'true')
          el.appendChild(scriptEl)
          injectedScripts.push(scriptEl)
        } catch (e) {
          console.warn('Article script error:', e)
        }
      })
    }

    // Collapsible sections
    const articleContainer = el.querySelector('.article-container')
    if (articleContainer?.dataset.collapsible === 'true') {
      const getContentElements = (header) => {
        const elements = []
        let nextEl = header.nextElementSibling
        while (nextEl && nextEl.tagName !== 'H2') {
          elements.push(nextEl)
          nextEl = nextEl.nextElementSibling
        }
        return elements
      }
      articleContainer.querySelectorAll('article h2').forEach(header => {
        const contentElements = getContentElements(header)
        const hasContent = contentElements.some(el => el.tagName && el.textContent.trim())
        if (hasContent) {
          header.style.cursor = 'pointer'
          header.classList.add('collapsible', 'collapsed')
          contentElements.forEach(el => { el.style.display = 'none' })
          header.addEventListener('click', () => {
            const isCollapsed = header.classList.toggle('collapsed')
            contentElements.forEach(el => { el.style.display = isCollapsed ? 'none' : '' })
          })
        }
      })
    }

    enhanceCodeBlocks(el)

    document.body.classList.add('article-open')
    window.scrollTo({ top: 0, behavior: 'instant' })

    return () => {
      if (homeBtn) homeBtn.removeEventListener('click', onHomeClick)
      injectedScripts.forEach((scriptEl) => scriptEl.remove())
      document.body.classList.remove('article-open')
    }
  }, [mainHtml, rawHtml, navigate])

  // Force a hard reload when leaving the TF article so WASM workers and model
  // weights don't stay resident in memory for the rest of the session.
  useEffect(() => {
    if (slug !== 'traffic-live-object-detection') return
    console.log('[TF article] mounted — TensorFlow.js/COCO-SSD will initialize')
    return () => {
      console.log('[TF article] unmounted — forcing hard reload to clear WASM workers and model weights')
      window.location.assign(import.meta.env.BASE_URL || '/')
    }
  }, [slug])

  useEffect(() => {
    let cancelled = false

    const loadRelated = async () => {
      try {
        const viteBase = import.meta.env.BASE_URL || '/'
        const response = await fetch(`${viteBase}data/related-articles.json`)
        if (!response.ok) return
        const payload = await response.json()
        const related = payload?.items?.[slug]?.related || []
        const maxScore = payload?.maxObservedScore || 1
        if (!cancelled) setRelatedSlugs(related.map(item => ({ slug: item.slug, score: item.score || 0, maxScore })).filter(item => item.slug))
      } catch (error) {
        if (!cancelled) setRelatedSlugs([])
      }
    }

    loadRelated()

    return () => {
      cancelled = true
    }
  }, [slug])

  const openArticle = useMemo(() => (path) => {
    if (!path) return
    if (path.startsWith('articles/') || path.startsWith('/articles/')) {
      const pathSlug = path.replace(/^\/?(articles\/)/, '').replace(/\.html$/, '')
      navigate(`/articles/${pathSlug}`)
      return
    }
    navigate(path)
  }, [navigate])

  return (
    <div id="article-view">
      <Head>
        <title>{`${articleMeta.title} | Tangent`}</title>
        <meta name="description" content={articleMeta.description} />
        <link rel="canonical" href={articleMeta.canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${articleMeta.title} | Tangent`} />
        <meta property="og:description" content={articleMeta.description} />
        <meta property="og:url" content={articleMeta.canonical} />
        <meta property="og:image" content={articleMeta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${articleMeta.title} | Tangent`} />
        <meta name="twitter:description" content={articleMeta.description} />
        <meta name="twitter:image" content={articleMeta.image} />
      </Head>
      <div className="article-frame" ref={ref}>
        {headStyles.map((css, i) => (
          <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
        <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
        <RelatedArticlesCarousel
          key={slug}
          currentSlug={slug}
          relatedData={relatedSlugs}
          allArticles={articlesData}
          onOpenArticle={openArticle}
        />
      </div>
    </div>
  )
}
