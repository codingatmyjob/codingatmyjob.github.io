import { fetchVoteTotals, tileVoteLabel } from './vote-totals.js'

const related = document.querySelector('.related-carousel[data-votes-api]')
if (related) {
  fetchVoteTotals(related.dataset.votesApi).then((counts) => {
    related.querySelectorAll('[data-related-vote-slug]').forEach((tally) => {
      const count = counts.get(tally.dataset.relatedVoteSlug)
      if (!count) return
      tally.textContent = tileVoteLabel(count)
      tally.hidden = false
    })
  }).catch((error) => {
    console.warn('Could not load related article vote totals:', error)
  })
}

const button = document.querySelector('[data-article-vote]')
const tally = button?.querySelector('.article-vote-count')
const message = document.querySelector('.article-vote-message')

if (button && tally && message) {
  const slug = decodeURIComponent(button.dataset.slug)
  const endpoint = new URL(button.dataset.apiUrl)
  endpoint.searchParams.set('slug', slug)
  // Keep the original browser voter ID and submitted flag when the article moves.
  const legacySlug = button.closest('[data-legacy-vote-slug]')?.dataset.legacyVoteSlug
  const storageKey = `tangent:helpful:${legacySlug || slug}`
  const votedKey = `${storageKey}:voted`
  let submitted = false

  const showCount = (count) => {
    const formatted = count.toLocaleString()
    tally.textContent = formatted
    button.setAttribute('aria-description', `${formatted} ${count === 1 ? 'vote' : 'votes'}`)
    tally.hidden = false
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
  button.hidden = false
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
    message.textContent = ''
    try {
      const count = await requestCount({ method: 'POST', headers: { 'X-Voter-Id': voterId } })
      submitted = true
      showCount(count)
      showVoted()
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
