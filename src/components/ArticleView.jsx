import React, { useEffect } from 'react'

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

        const res = await fetch(urlToFetch)
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

        const cleanSlug = (path || '').replace(/^articles\//,'').replace(/\.html$/,'')
        const hashPath = path.startsWith('articles/') ? `/articles/${cleanSlug}` : `/${cleanSlug}`
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