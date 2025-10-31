import React, { useEffect } from 'react'

export default function BinaryBg(){
  useEffect(()=>{
    const container = document.getElementById('binary-bg')
    if(!container) return

    let resizeTimer
    const build = ()=>{
      container.innerHTML = ''
      const count = Math.min(180, Math.floor(window.innerWidth/8)) || 100
      for(let i=0;i<count;i++){
        const bit = document.createElement('div')
        bit.className = 'bit'
        bit.textContent = Math.random() < 0.5 ? '0' : '1'
        const left = Math.random() * 100
        bit.style.left = left + 'vw'
        const size = 10 + Math.random() * 26
        bit.style.fontSize = size + 'px'
        const duration = 6 + Math.random() * 12
        const delay = -Math.random() * duration
        bit.style.animationDuration = `${duration}s, ${duration}s`
        bit.style.animationDelay = `${delay}s, ${delay}s`
        const rot = (Math.random() - 0.5) * 20
        bit.style.transform = `rotate(${rot}deg)`
        container.appendChild(bit)
      }
    }

    const onResize = ()=>{
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(build, 200)
    }

    build()
    window.addEventListener('resize', onResize)
    return ()=> window.removeEventListener('resize', onResize)
  },[])

  return null
}
