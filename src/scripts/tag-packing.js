export const packTagOrder = (widths, available, gap) => {
  let best = widths.map((_, index) => index)
  const lineCount = (order) => {
    let rows = 1
    let used = widths[order[0]]
    for (const index of order.slice(1)) {
      const next = used + gap + widths[index]
      if (next > available) {
        rows++
        used = widths[index]
      } else {
        used = next
      }
    }
    return rows
  }
  let bestRows = lineCount(best)
  if (widths.length <= 2 || bestRows === 1) return best

  // Cards have only a handful of tags; try each order after the fixed first tag.
  const visit = (prefix, remaining) => {
    if (remaining.length === 0) {
      const rows = lineCount(prefix)
      if (rows < bestRows) {
        bestRows = rows
        best = prefix
      }
      return
    }
    for (const index of remaining) {
      visit([...prefix, index], remaining.filter((other) => other !== index))
    }
  }
  visit([0], best.slice(1))
  return best
}

export const observeCardTags = (root) => {
  const selector = ':is(#articles-grid[data-layout="wide"], .feature-picks) .article-tags'
  const originalTags = new WeakMap()
  const pack = (container) => {
    if (!container.matches(selector)) return
    const available = container.getBoundingClientRect().width
    if (!available) return
    if (!originalTags.has(container)) originalTags.set(container, Array.from(container.children))
    const tags = originalTags.get(container)
    const widths = tags.map((tag) => tag.getBoundingClientRect().width)
    const gap = parseFloat(getComputedStyle(container).columnGap)
    const order = packTagOrder(widths, available, gap).map((index) => tags[index])
    applyOrder(container, order)
  }
  const applyOrder = (container, tags) => {
    tags.forEach((tag, index) => {
      if (container.children[index] !== tag) container.insertBefore(tag, container.children[index])
    })
  }
  const observer = new ResizeObserver((entries) => {
    requestAnimationFrame(() => entries.forEach(({ target }) => pack(target)))
  })
  let observed = []
  document.fonts.ready.then(() => observed.forEach(pack))

  return () => {
    observer.disconnect()
    observed.forEach((container) => {
      if (container.isConnected && !container.matches(selector) && originalTags.has(container)) {
        applyOrder(container, originalTags.get(container))
      }
    })
    observed = Array.from(root.querySelectorAll(selector))
    observed.forEach((container) => observer.observe(container))
  }
}
