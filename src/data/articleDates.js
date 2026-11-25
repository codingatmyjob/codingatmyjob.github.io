export const getUpdatedDate = ({ publishedAt, updatedAt }) => {
  const publishedTime = Date.parse(publishedAt || '')
  const updatedTime = Date.parse(updatedAt || '')
  if (!Number.isFinite(publishedTime) || !Number.isFinite(updatedTime) || updatedTime <= publishedTime) return null

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(updatedTime))
}
