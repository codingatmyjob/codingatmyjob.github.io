export async function fetchVoteTotals(endpoint) {
  const response = await fetch(endpoint, {
    credentials: 'omit',
    signal: AbortSignal.timeout(8000)
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const { counts } = await response.json()
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) throw new Error('Invalid vote totals.')
  return new Map(Object.entries(counts).filter(([, count]) => Number.isSafeInteger(count) && count >= 0))
}

export function tileVoteLabel(count) {
  return `+${count.toLocaleString()} ${count === 1 ? 'vote' : 'votes'}`
}
