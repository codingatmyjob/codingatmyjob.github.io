import React, { useEffect } from 'react'
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

const SIDEBAR_HASH_ALIASES = {
  'sidebar/About.html': '/About',
  'sidebar/tag-guide.html': '/tag-guide'
}

const LANGUAGE_ALIASES = {
  html: 'markup',
  xml: 'markup',
  shell: 'bash',
  sh: 'bash',
  ps1: 'powershell',
  yml: 'yaml'
}

const COPY_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

function normalizeLanguage(raw){
  if(!raw) return ''
  const key = raw.toLowerCase()
  return LANGUAGE_ALIASES[key] || key
}

function detectLanguageFromClasses(codeEl, preEl){
  const match = `${codeEl.className} ${preEl.className}`.match(/(?:lang|language)-([a-z0-9-]+)/i)
  return normalizeLanguage(match ? match[1] : '')
}

function inferLanguageFromCode(source){
  const text = (source || '').trim()
  if(!text) return ''
  if(/<([a-z][\w-]*)[\s>]/i.test(text)) return 'markup'
  if(/(^|\n)\s*\$env:/.test(text) || /\bGet-[A-Z]/.test(text)) return 'powershell'
  if(/(^|\n)\s*(npm|pnpm|yarn|git|cd|ls|cat)\b/.test(text)) return 'bash'
  if(/^\s*[\[{][\s\S]*[\]}]\s*$/.test(text) && /"\s*:/.test(text)) return 'json'
  return ''
}

async function copyText(value){
  if(navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(value)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  textArea.style.pointerEvents = 'none'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

function mountCodeBlockToolbar(preEl, language, codeText){
  if(preEl.parentElement?.classList.contains('code-block')) return

  const shell = document.createElement('div')
  shell.className = 'code-block'

  const toolbar = document.createElement('div')
  toolbar.className = 'code-block-toolbar'

  const langLabel = document.createElement('span')
  langLabel.className = 'code-language'
  langLabel.textContent = language || 'text'

  const copyAction = document.createElement('button')
  copyAction.type = 'button'
  copyAction.className = 'code-copy-trigger'
  copyAction.setAttribute('aria-label', 'Copy code block')
  copyAction.setAttribute('title', 'Copy code')
  copyAction.innerHTML = COPY_ICON_SVG

  let resetCopyStateTimer = null
  copyAction.addEventListener('click', async () => {
    try{
      await copyText(codeText)
      copyAction.classList.add('copied')
      copyAction.setAttribute('aria-label', 'Copied')
      copyAction.setAttribute('title', 'Copied')
      if(resetCopyStateTimer) clearTimeout(resetCopyStateTimer)
      resetCopyStateTimer = window.setTimeout(() => {
        copyAction.classList.remove('copied')
        copyAction.setAttribute('aria-label', 'Copy code block')
        copyAction.setAttribute('title', 'Copy code')
      }, 1200)
    }catch(error){
      console.warn('Copy failed:', error)
    }
  })

  toolbar.appendChild(langLabel)
  toolbar.appendChild(copyAction)

  preEl.parentNode.insertBefore(shell, preEl)
  shell.appendChild(toolbar)
  shell.appendChild(preEl)
}

function enhanceCodeBlocks(root){
  const codeBlocks = Array.from(root.querySelectorAll('pre code'))
  codeBlocks.forEach(codeEl => {
    const preEl = codeEl.parentElement
    if(!preEl) return

    const cleanedCode = (codeEl.textContent || '').replace(/(?:\r?\n[ \t]*)+$/g, '')
    codeEl.textContent = cleanedCode

    const inferred = detectLanguageFromClasses(codeEl, preEl) || inferLanguageFromCode(cleanedCode)
    if(inferred){
      codeEl.classList.add(`language-${inferred}`)
      preEl.classList.add(`language-${inferred}`)
      if(Prism.languages[inferred]) Prism.highlightElement(codeEl)
    }

    mountCodeBlockToolbar(preEl, inferred, cleanedCode)
  })
}

export default function ArticleView({ path, onClose }){
  useEffect(()=>{
    const articlesView = document.getElementById('articles-view')
    const articleView = document.getElementById('article-view')
    if(!articlesView || !articleView) return

    // clear view when no path
    if(!path){
      articleView.style.display = 'none'
      articleView.innerHTML = ''
      articlesView.style.display = 'block'
      document.body.classList.remove('article-open')
      return
    }

    let cancelled = false

    async function load(){
      try{
        const isRemote = /^https?:\/\//i.test(path)
        const viteBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'
        const urlToFetch = isRemote ? path : path.startsWith('/') ? new URL(path, location.origin).href : new URL(path, location.origin + viteBase).href

        const res = await fetch(urlToFetch + '?v=' + Date.now(), { cache: 'no-store' })
        if(!res.ok) throw new Error(res.status)
        const text = await res.text()

        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const main = doc.querySelector('main.article-container') || doc.querySelector('main')

        const wrapper = document.createElement('div')
        wrapper.className = 'article-frame'

        const returnBtn = document.createElement('button')
        returnBtn.className = 'back-link'
        returnBtn.textContent = '← Return Home'
        returnBtn.onclick = onClose

        const content = main ? main.cloneNode(true) : document.createElement('div')
        if(!main) content.innerHTML = text

        // Collect inline scripts from the full document (they may live outside <main>)
        const inlineScripts = Array.from(doc.querySelectorAll('script:not([src])')).map(s => s.textContent)

        // Collect <style> blocks from <head> (main-only clone misses them)
        const headStyles = Array.from(doc.querySelectorAll('head style')).map(s => s.textContent)

        // Clean up unwanted elements and fix paths
        content.querySelectorAll('link, script, header, #binary-bg').forEach(n=>n.remove())
        Array.from(content.querySelectorAll('[src],[href]')).forEach(el=>{
          ['src','href'].forEach(attr=>{
            const val = el.getAttribute(attr)
            if(val && val.startsWith('../')) el.setAttribute(attr, val.replace(/^(.+?\/)+/, ''))
          })
        })

        content.insertBefore(returnBtn, content.firstChild)
        wrapper.appendChild(content)

        if(cancelled) return
        articleView.innerHTML = ''
        articleView.appendChild(wrapper)
        articlesView.style.display = 'none'
        articleView.style.display = 'block'
        document.body.classList.add('article-open')

        // Inject any <style> blocks that lived in the article's <head>
        headStyles.forEach(css => {
          if (!css.trim()) return
          const el = document.createElement('style')
          el.textContent = css
          articleView.appendChild(el)
        })

        // Re-execute any inline scripts from the article
        inlineScripts.forEach(src => {
          if (!src.trim()) return
          try {
            // eslint-disable-next-line no-new-func
            new Function(src)()
          } catch(e) {
            console.warn('Article script error:', e)
          }
        })

        // Add collapsible functionality
        const articleContainer = wrapper.querySelector('.article-container')
        if(articleContainer?.dataset.collapsible === 'true'){
          const getContentElements = (header) => {
            const elements = []
            let nextEl = header.nextElementSibling
            while(nextEl && nextEl.tagName !== 'H2') elements.push(nextEl), nextEl = nextEl.nextElementSibling
            return elements
          }

          articleContainer.querySelectorAll('article h2').forEach(header => {
            const contentElements = getContentElements(header)
            const hasContent = contentElements.some(el => el.tagName && el.textContent.trim())

            if(hasContent){
              header.style.cursor = 'pointer'
              header.classList.add('collapsible', 'collapsed')
              contentElements.forEach(el => el.style.display = 'none')

              header.addEventListener('click', () => {
                const isCollapsed = header.classList.toggle('collapsed')
                contentElements.forEach(el => el.style.display = isCollapsed ? 'none' : '')
              })
            }
          })
        }

        enhanceCodeBlocks(wrapper)

        const cleanSlug = (path || '').replace(/^articles\//,'').replace(/\.html$/,'')
        const hashPath = SIDEBAR_HASH_ALIASES[path]
          || (path.startsWith('articles/') ? `/articles/${cleanSlug}` : `/${cleanSlug}`)
        window.location.hash = `#${hashPath}`
        window.scrollTo({ top: 0, behavior: 'instant' })
      }catch(err){
        alert('Unable to load article. Serve site over HTTP for local dev.')
      }
    }

    load()

    return ()=>{ cancelled = true }
  },[path, onClose])

  return null
}