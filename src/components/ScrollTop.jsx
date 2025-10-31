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

    const updateVisibility = ()=>{
      const scrolled = window.scrollY > 200
      if(scrolled){
        btn.style.opacity = '1'
        btn.style.pointerEvents = 'auto'
      } else {
        btn.style.opacity = '0'
        btn.style.pointerEvents = 'none'
      }
    }

    const position = ()=>{
      const articleContainer = document.querySelector('.article-container')
      const articleOpen = document.body.classList.contains('article-open')
      
      if(articleContainer && articleOpen){
        const rect = articleContainer.getBoundingClientRect()
        const desiredLeft = Math.round(rect.right + 30)
        const btnWidth = btn.offsetWidth || 44
        
        if(desiredLeft + btnWidth > window.innerWidth - 8){
          btn.style.removeProperty('--scroll-left')
          btn.style.setProperty('--scroll-right', '20px')
        } else {
          btn.style.setProperty('--scroll-left', desiredLeft + 'px')
          btn.style.removeProperty('--scroll-right')
        }
      } else {
        btn.style.removeProperty('--scroll-left')
        btn.style.setProperty('--scroll-right', '20px')
      }
      
      updateVisibility()
    }

    const onResize = ()=> position()
    const onScroll = ()=> updateVisibility()

    const obs = new MutationObserver(()=> position())
    const articleView = document.getElementById('article-view')
    if(articleView) obs.observe(articleView, { childList:true, subtree:true })

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)
    position()

    return ()=>{
      btn.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      obs.disconnect()
    }
  },[])

  return null
}
