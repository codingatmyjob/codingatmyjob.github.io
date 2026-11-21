const widget = document.querySelector('[data-article-vote]')

if (widget) {
  const button = widget.querySelector('button')
  const tally = widget.querySelector('.article-vote-count')
  const message = widget.querySelector('.article-vote-message')
  const endpoint = new URL(widget.dataset.apiUrl)
  endpoint.searchParams.set('slug', widget.dataset.slug)
  const storageKey = `tangent:helpful:${widget.dataset.slug}`
  const votedKey = `${storageKey}:voted`
  let submitted = false

  const showCount = (count) => {
    tally.textContent = `${count.toLocaleString()} ${count === 1 ? 'vote' : 'votes'}`
  }
  const showVoted = () => {
    button.setAttribute('aria-pressed', 'true')
    button.setAttribute('aria-disabled', 'true')
  }
  const requestCount = async (options) => {
    const response = await fetch(endpoint, {
      credentials: 'omit',
      signal: AbortSignal.timeout(8000),
      ...options
    })
    if (response.status === 429) throw new Error('Too many requests. Try again in a minute.')
    if (!response.ok) throw new Error('Voting is unavailable right now.')
    const { count } = await response.json()
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid vote count.')
    return count
  }

  try {
    if (localStorage.getItem(votedKey)) showVoted()
  } catch (error) {
    console.warn('Could not read the local vote:', error)
  }
  widget.hidden = false
  requestCount().then((count) => {
    if (!submitted) showCount(count)
  }).catch((error) => {
    console.warn('Could not load helpful votes:', error)
    if (!message.textContent && button.getAttribute('aria-disabled') !== 'true') {
      message.textContent = 'Vote count unavailable.'
    }
  })

  button.addEventListener('click', async () => {
    if (button.getAttribute('aria-disabled') === 'true') return
    let voterId
    try {
      voterId = localStorage.getItem(storageKey) || crypto.randomUUID()
      localStorage.setItem(storageKey, voterId)
    } catch (error) {
      console.warn('Could not save the local voter ID:', error)
      message.textContent = 'Voting needs browser storage.'
      return
    }

    button.setAttribute('aria-disabled', 'true')
    message.textContent = 'Saving vote...'
    try {
      const count = await requestCount({ method: 'POST', headers: { 'X-Voter-Id': voterId } })
      submitted = true
      showCount(count)
      showVoted()
      message.textContent = 'Thanks for your feedback.'
      try {
        localStorage.setItem(votedKey, '1')
      } catch (error) {
        console.warn('Could not remember the submitted vote:', error)
      }
    } catch (error) {
      console.warn('Could not save the helpful vote:', error)
      message.textContent = error instanceof Error ? error.message : 'Voting is unavailable right now.'
      button.removeAttribute('aria-disabled')
    }
  })
}
