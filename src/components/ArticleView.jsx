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
      const st = document.getElementById('scroll-top')
      if(st) st.style.display = 'none'
      return
    }

    let cancelled = false

    async function load(){
      try{
        // Resolve the fetch URL to always target the server-side `articles/`
        // folder (respecting Vite's BASE_URL).   
        // Prefer absolute URLs when provided, and build an absolute URL for
        // relative paths so the request goes to HTTP(S) rather than a local
        // file:// path.
        let urlToFetch
        const isRemote = /^https?:\/\//i.test(path)
        const viteBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'

        if(isRemote){
          urlToFetch = path
        } else if(path.startsWith('/')){
          // Leading slash — resolve against origin
          urlToFetch = new URL(path, location.origin).href
        } else {
          // No leading slash — resolve against Vite base (handles repo subpaths)
          // e.g. base might be '/' or '/repo-name/'
          urlToFetch = new URL(path, location.origin + viteBase).href
        }

        const res = await fetch(urlToFetch)
        if(!res.ok) throw new Error(res.status)
        const text = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const main = doc.querySelector('main.article-container') || doc.querySelector('main') || null

        const wrapper = document.createElement('div')
        wrapper.className = 'article-frame'

        const returnBtn = document.createElement('button')
        returnBtn.className = 'back-link'
        returnBtn.textContent = '← Return Home'
        returnBtn.onclick = onClose

        if(main){
          const contentClone = main.cloneNode(true)
          contentClone.querySelectorAll('link, script, header, #binary-bg').forEach(n=>n.remove())
          Array.from(contentClone.querySelectorAll('[src],[href]')).forEach(el=>{
            if(el.hasAttribute('src')){
              const v = el.getAttribute('src')
              if(v && v.startsWith('../')) el.setAttribute('src', v.replace(/^(.+?\/)+/, ''))
            }
            if(el.hasAttribute('href')){
              const v = el.getAttribute('href')
              if(v && v.startsWith('../')) el.setAttribute('href', v.replace(/^(.+?\/)+/, ''))
            }
          })
          contentClone.insertBefore(returnBtn, contentClone.firstChild)
          wrapper.appendChild(contentClone)
        } else {
          const temp = document.createElement('div')
          temp.innerHTML = text
          temp.querySelectorAll('script, link, header, #binary-bg').forEach(n=>n.remove())
          wrapper.appendChild(temp)
        }

        if(cancelled) return
        articleView.innerHTML = ''
        articleView.appendChild(wrapper)
        articlesView.style.display = 'none'
        articleView.style.display = 'block'
        document.body.classList.add('article-open')
        const st = document.getElementById('scroll-top')
        if(st) st.style.display = 'flex'
        history.pushState({article:path}, '', '?article='+encodeURIComponent(path))
        window.scrollTo({ top: 0, behavior: 'instant' })
      }catch(err){
        console.error('ArticleView load failed', err)
        alert('Unable to load article. Serve site over HTTP for local dev.')
      }
    }

    load()

    return ()=>{ cancelled = true }
  },[path, onClose])

  return null
}
