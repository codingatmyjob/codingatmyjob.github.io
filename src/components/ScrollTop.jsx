import { useEffect } from 'react'

export default function ScrollTop(){
  useEffect(()=>{
    const id = 'scroll-top'
    let btn = document.getElementById(id)
    if(!btn){
      btn = document.createElement('button')
      btn.id = id
      btn.className = 'scroll-top'
      btn.setAttribute('aria-label','Scroll to top')
      btn.textContent = '▲'
      document.body.appendChild(btn)
    }

    // click handler
    const onClick = ()=> window.scrollTo({ top: 0, behavior: 'smooth' })
    btn.addEventListener('click', onClick)

    const position = ()=>{
      const article = document.querySelector('#article-view > div > main > article') || document.querySelector('#article-view .article-container > article')
      const fallbackRight = 20

      // If an article is open, position the button to the right of the article
      if(article){
        btn.style.display = 'flex'
        const rect = article.getBoundingClientRect()
        const desiredLeft = Math.round(rect.right + 50)
        const btnWidth = btn.offsetWidth || 44
        if(desiredLeft + btnWidth > window.innerWidth - 8){
          btn.style.removeProperty('--scroll-left')
          btn.style.setProperty('--scroll-right', fallbackRight + 'px')
        } else {
          btn.style.setProperty('--scroll-left', desiredLeft + 'px')
          btn.style.removeProperty('--scroll-right')
        }
        return
      }

      // No article open: try to position next to the articles grid on the main page
      const grid = document.querySelector('.articles-grid') || document.querySelector('.content-area')
      if(grid){
        btn.style.display = 'flex'
        const rect = grid.getBoundingClientRect()
        // Position the button just to the right of the grid, similar spacing as for articles
        const desiredLeft = Math.round(rect.right + 24)
        const btnWidth = btn.offsetWidth || 44
        if(desiredLeft + btnWidth > window.innerWidth - 8){
          btn.style.removeProperty('--scroll-left')
          btn.style.setProperty('--scroll-right', fallbackRight + 'px')
        } else {
          btn.style.setProperty('--scroll-left', desiredLeft + 'px')
          btn.style.removeProperty('--scroll-right')
        }
        return
      }

      // Fallback: hide the button if we can't find a sensible anchor
      btn.style.removeProperty('--scroll-left')
      btn.style.setProperty('--scroll-right', fallbackRight + 'px')
      btn.style.display = 'none'
    }

    let resizeTimer
    const onResize = ()=>{
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(position, 150)
    }

    // observe mutations to detect when article is injected
    const obs = new MutationObserver((mut)=>{
      position()
    })
    const articleView = document.getElementById('article-view')
    if(articleView) obs.observe(articleView, { childList:true, subtree:true })

    window.addEventListener('resize', onResize)
    // initial position
    position()

    return ()=>{
      btn.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      if(articleView) obs.disconnect()
      // don't remove the button element on unmount so other code doesn't break if expected
    }
  },[])

  return null
}
