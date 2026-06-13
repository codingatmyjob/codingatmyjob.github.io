import React, { useEffect, useRef } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'

function extractMainHtml(rawHtml) {
  const match = rawHtml.match(/(<main[^>]*>[\s\S]*<\/main>)/i)
  return match ? match[1] : rawHtml
}

function extractHeadStyles(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (!headMatch) return []
  const styleMatches = [...headMatch[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
  return styleMatches.map(m => m[1]).filter(Boolean)
}

export default function SidebarPage() {
  const { rawHtml } = useLoaderData()
  const navigate = useNavigate()
  const ref = useRef(null)

  const rawMain = rawHtml ? extractMainHtml(rawHtml) : ''
  const mainHtml = rawMain.replace(/(<main[^>]*>)/i, '$1<button class="back-link" id="ssg-back-btn">← Return Home</button>')
  const headStyles = rawHtml ? extractHeadStyles(rawHtml) : []

  useEffect(() => {
    const backBtn = ref.current?.querySelector('#ssg-back-btn')
    if (backBtn) backBtn.addEventListener('click', () => navigate('/'))

    document.body.classList.add('article-open')
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => {
      document.body.classList.remove('article-open')
    }
  }, [mainHtml])

  return (
    <div id="article-view">
      <div className="article-frame" ref={ref}>
        {headStyles.map((css, i) => (
          <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
        <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      </div>
    </div>
  )
}
