import React, { useEffect, useMemo, useRef, useState } from 'react'

function slugFromPath(path) {
  if (!path) return ''
  return path.replace(/^\/?articles\//, '').replace(/\.html$/, '')
}

function scoreToMatchPercent(score) {
  // Saturating transform: approaches 100 without actually reaching it.
  const tau = 0.35
  const scaled = 100 * (1 - Math.exp(-score / tau))
  return Math.min(99, Math.max(0, Math.round(scaled)))
}

export function RelatedArticlesCarousel({ currentSlug, relatedData = [], allArticles = [], onOpenArticle }) {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const relatedItems = useMemo(() => {
    if (!relatedData.length || !allArticles.length) return []

    const bySlug = new Map(
      allArticles.map(item => [slugFromPath(item.path), item])
    )

    return relatedData
      .filter(entry => entry.slug && entry.slug !== currentSlug)
      .map(entry => {
        const article = bySlug.get(entry.slug)
        if (!article) return null
        return { ...article, matchScore: entry.score || 0 }
      })
      .filter(Boolean)
      .slice(0, 8)
  }, [allArticles, currentSlug, relatedData])

  const scrollByAmount = (direction) => {
    const node = trackRef.current
    if (!node) return

    const cards = Array.from(node.querySelectorAll('.related-carousel-card'))
    if (!cards.length) return

    const currentLeft = node.scrollLeft
    const epsilon = 4
    const offsets = cards.map(card => Math.round(card.offsetLeft))

    let targetLeft = currentLeft
    if (direction > 0) {
      const nextOffset = offsets.find(offset => offset > currentLeft + epsilon)
      targetLeft = typeof nextOffset === 'number' ? nextOffset : node.scrollWidth - node.clientWidth
    } else {
      const previousOffsets = offsets.filter(offset => offset < currentLeft - epsilon)
      targetLeft = previousOffsets.length ? previousOffsets[previousOffsets.length - 1] : 0
    }

    // Fallback in case layout reports duplicate offsets during transitions.
    if (targetLeft === currentLeft && offsets.length > 1) {
      const stride = Math.max(1, offsets[1] - offsets[0])
      targetLeft = Math.max(0, Math.min(node.scrollWidth - node.clientWidth, currentLeft + (direction * stride)))
    }

    node.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }

  useEffect(() => {
    const node = trackRef.current
    if (!node) return

    node.scrollLeft = 0
  }, [currentSlug])

  useEffect(() => {
    const node = trackRef.current
    if (!node) return

    const updateArrowState = () => {
      const maxScrollLeft = node.scrollWidth - node.clientWidth
      setCanScrollLeft(node.scrollLeft > 2)
      setCanScrollRight(maxScrollLeft - node.scrollLeft > 2)
    }

    updateArrowState()
    const raf = window.requestAnimationFrame(updateArrowState)
    node.addEventListener('scroll', updateArrowState, { passive: true })
    window.addEventListener('resize', updateArrowState)

    let observer = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateArrowState)
      observer.observe(node)
    }

    return () => {
      window.cancelAnimationFrame(raf)
      node.removeEventListener('scroll', updateArrowState)
      window.removeEventListener('resize', updateArrowState)
      if (observer) observer.disconnect()
    }
  }, [relatedItems.length])

  if (!relatedItems.length) return null

  const hasOverflow = canScrollLeft || canScrollRight
  const carouselClassName = [
    'related-carousel',
    hasOverflow ? 'has-overflow' : '',
    `count-${Math.min(relatedItems.length, 9)}`
  ].filter(Boolean).join(' ')

  return (
    <section className={carouselClassName} aria-labelledby="related-carousel-title">
      <div className="related-carousel-header">
        <h2 id="related-carousel-title">Related Articles</h2>
      </div>

      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          className="related-carousel-arrow related-carousel-arrow-left"
          aria-label="Scroll related articles left"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      ) : null}

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          className="related-carousel-arrow related-carousel-arrow-right"
          aria-label="Scroll related articles right"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      ) : null}

      <div className="related-carousel-track" ref={trackRef}>
        {relatedItems.map(item => (
          <article
            key={item.id || item.path || item.title}
            className="related-carousel-card"
            onClick={() => onOpenArticle && onOpenArticle(item.path)}
          >
            <div className="related-carousel-image-shell">
              {item.imageSrc ? (
                <img
                  className={[ 'related-carousel-image', item.imageClassName ].filter(Boolean).join(' ')}
                  src={item.imageSrc.startsWith('/') || item.imageSrc.startsWith('http') ? item.imageSrc : `${import.meta.env.BASE_URL}${item.imageSrc}`}
                  alt={item.imageAlt || item.title || 'Related article image'}
                  style={item.imageStyle ? item.imageStyle : undefined}
                  loading="lazy"
                />
              ) : (
                <span className="related-carousel-fallback">{item.imageLabel || item.title}</span>
              )}
            </div>

            <div className="related-carousel-content">
              <div className="related-carousel-meta">
                <p className="related-carousel-date">{item.date}</p>
              </div>
              <h3 className="related-carousel-title">{item.title}</h3>
              <p className="related-carousel-description">{item.description}</p>
              {item.matchScore ? (
                <span className="related-carousel-match-pill">{scoreToMatchPercent(item.matchScore)}% match</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
