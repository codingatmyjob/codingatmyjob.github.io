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
        const base = new URL('.', location.origin + location.pathname).href
        const url = new URL(path, base).href
        const res = await fetch(url)
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
