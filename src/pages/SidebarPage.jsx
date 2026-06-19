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

function formatNumber(value) {
  if (typeof value !== 'number') return '0'
  return new Intl.NumberFormat().format(value)
}

function formatShortDate(value) {
  if (!value) return 'n/a'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'n/a'
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit'
  })
}

function formatWeekdayDate(value) {
  if (!value) return 'n/a'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'n/a'
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit'
  })
}

function formatDurationDays(value) {
  if (!Number.isFinite(value)) return '--'
  if (value < 1) return `${Math.round(value * 24)}h`
  return `${value.toFixed(1)}d`
}

function hasLabel(issue, pattern) {
  const labels = Array.isArray(issue?.labels) ? issue.labels : []
  return labels.some((label) => {
    const name = (typeof label === 'string' ? label : label?.name || '').toLowerCase()
    return pattern.test(name)
  })
}

function extractTypeTags(issue) {
  const labels = Array.isArray(issue?.labels) ? issue.labels : []
  const typeValues = labels
    .map((label) => (typeof label === 'string' ? label : label?.name || '').trim())
    .filter((name) => /^type\s*:/i.test(name))
    .flatMap((name) => name.replace(/^type\s*:/i, '').split(','))
    .map((value) => value.trim().replace(/-/g, ' '))
    .filter(Boolean)

  return [...new Set(typeValues)]
}

function normalizeGithubLabelColor(value) {
  if (typeof value !== 'string') return ''
  const raw = value.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return ''
  return `#${raw.toLowerCase()}`
}

function getIssueLabelColor(issue, pattern) {
  const labels = Array.isArray(issue?.labels) ? issue.labels : []
  for (const label of labels) {
    const name = (typeof label === 'string' ? label : label?.name || '').toLowerCase()
    if (!pattern.test(name)) continue
    const color = normalizeGithubLabelColor(typeof label === 'string' ? '' : label?.color)
    if (color) return color
  }
  return ''
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeGithubUrl(url) {
  if (typeof url !== 'string' || !url) return ''
  try {
    const parsed = new URL(url)
    const isGithubHost = /(^|\.)github\.com$/i.test(parsed.hostname)
    if (parsed.protocol !== 'https:' || !isGithubHost) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

function readCachedGithubData(cacheKey, maxAgeMs = 15 * 60 * 1000) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const raw = window.localStorage.getItem(`statusHub:${cacheKey}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const age = Date.now() - Number(parsed.savedAt || 0)
    if (Number.isNaN(age) || age > maxAgeMs) return null
    return parsed.data ?? null
  } catch {
    return null
  }
}

function writeCachedGithubData(cacheKey, data) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(`statusHub:${cacheKey}`, JSON.stringify({
      savedAt: Date.now(),
      data
    }))
  } catch {
    // Ignore cache write errors.
  }
}

async function fetchGithubJsonCached(url, cacheKey, maxAgeMs = 15 * 60 * 1000) {
  const cached = readCachedGithubData(cacheKey, maxAgeMs)
  try {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) return cached
    const data = await res.json()
    writeCachedGithubData(cacheKey, data)
    return data
  } catch {
    return cached
  }
}

function renderFeedItems(root, selector, items, fallbackText, dotClass = '') {
  const node = root.querySelector(selector)
  if (!node) return

  if (!items.length) {
    node.innerHTML = `<li class="status-item"><span class="status-dot ${dotClass}" aria-hidden="true"></span><p>${escapeHtml(fallbackText)}</p></li>`
    return
  }

  node.innerHTML = items.map(({ title, meta, commitSha, commitUrl, dotColor }) => {
    const safeCommitUrl = sanitizeGithubUrl(commitUrl)
    const safeDotColor = normalizeGithubLabelColor(dotColor)
    const dotStyle = safeDotColor ? ` style="background:${escapeHtml(safeDotColor)}"` : ''
    const commitLink = (safeCommitUrl && commitSha)
      ? `<a class="status-item-meta-link" href="${escapeHtml(safeCommitUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(commitSha)}</a>`
      : ''
    const metaLine = (commitLink || meta)
      ? `<span class="status-item-meta">${commitLink}${commitLink && meta ? ' • ' : ''}${meta ? escapeHtml(meta) : ''}</span>`
      : ''

    return `<li class="status-item"><span class="status-dot ${dotClass}"${dotStyle} aria-hidden="true"></span><p>${escapeHtml(title)}${metaLine}</p></li>`
  }).join('')
}

function buildWeeklyCommitBuckets(commits, weeks = 12) {
  const buckets = Array(weeks).fill(0)
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  commits.forEach((commit) => {
    const stamp = commit?.commit?.author?.date
    if (!stamp) return
    const ts = Date.parse(stamp)
    if (Number.isNaN(ts) || ts > now) return

    const index = weeks - 1 - Math.floor((now - ts) / weekMs)
    if (index >= 0 && index < weeks) buckets[index] += 1
  })

  return buckets
}

async function fetchGithubCommits(owner, repo, since) {
  const perPage = 100
  const maxPages = 10
  const cacheKey = `${owner}/${repo}:commits:${since}:paginated`
  const cached = readCachedGithubData(cacheKey)
  if (Array.isArray(cached)) return cached

  const all = []

  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${encodeURIComponent(since)}&per_page=${perPage}&page=${page}`,
        { headers: { Accept: 'application/vnd.github+json' } }
      )

      if (!res.ok) break

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) break

      all.push(...data)

      const link = res.headers.get('link') || ''
      const hasNext = /rel="next"/i.test(link)
      if (!hasNext || data.length < perPage) break
    } catch {
      break
    }
  }

  writeCachedGithubData(cacheKey, all)
  return all
}

async function fetchRecentGithubCommits(owner, repo, perPage = 6) {
  const data = await fetchGithubJsonCached(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}`,
    `${owner}/${repo}:recent-commits:${perPage}`
  )
  return Array.isArray(data) ? data : []
}

async function fetchWorkflowRuns(owner, repo, workflowFile) {
  const payload = await fetchGithubJsonCached(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflowFile)}/runs?per_page=100&page=1`,
    `${owner}/${repo}:workflow:${workflowFile}`
  )
  const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : []
  return runs
}

async function fetchClosedPullRequests(owner, repo) {
  const data = await fetchGithubJsonCached(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=50`,
    `${owner}/${repo}:pulls:closed`
  )
  return Array.isArray(data) ? data : []
}

async function fetchGithubIssues(owner, repo, state = 'open') {
  const perPage = 100
  const maxPages = 10
  const cacheKey = `${owner}/${repo}:issues:${state}:paginated`
  const cached = readCachedGithubData(cacheKey)

  const all = []

  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=${encodeURIComponent(state)}&per_page=${perPage}&page=${page}`,
        { headers: { Accept: 'application/vnd.github+json' } }
      )

      if (!res.ok) break

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) break

      all.push(...data)

      const link = res.headers.get('link') || ''
      const hasNext = /rel="next"/i.test(link)
      if (!hasNext || data.length < perPage) break
    } catch {
      break
    }
  }

  if (all.length) {
    writeCachedGithubData(cacheKey, all)
    return all
  }

  return Array.isArray(cached) ? cached : []
}

async function fetchOpenIssues(owner, repo) {
  return fetchGithubIssues(owner, repo, 'open')
}

async function fetchClosedIssues(owner, repo) {
  return fetchGithubIssues(owner, repo, 'closed')
}

async function fetchRepoDetails(owner, repo) {
  const data = await fetchGithubJsonCached(
    `https://api.github.com/repos/${owner}/${repo}`,
    `${owner}/${repo}:repo`
  )
  return data && typeof data === 'object' ? data : {}
}

async function hydrateGithubStats(root) {
  if (!root) return
  const statNodes = root.querySelectorAll('[data-gh-stat]')
  if (!statNodes.length) return

  const host = root.querySelector('[data-gh-owner][data-gh-repo]')
  const owner = host?.getAttribute('data-gh-owner') || 'codingatmyjob'
  const repo = host?.getAttribute('data-gh-repo') || 'codingatmyjob.github.io'
  const productionWorkflow = host?.getAttribute('data-gh-production-workflow') || 'deploy-production.yml'
  const weeks = 12
  const since = new Date(Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000)).toISOString()

  try {
    const [repoDataResult, commitsResult, recentCommitsResult, workflowRunsResult, closedPullRequestsResult, openIssuesResult, closedIssuesResult] = await Promise.allSettled([
      fetchRepoDetails(owner, repo),
      fetchGithubCommits(owner, repo, since),
      fetchRecentGithubCommits(owner, repo, 12),
      fetchWorkflowRuns(owner, repo, productionWorkflow),
      fetchClosedPullRequests(owner, repo),
      fetchOpenIssues(owner, repo),
      fetchClosedIssues(owner, repo)
    ])

    const repoData = repoDataResult.status === 'fulfilled' ? repoDataResult.value : {}
    const commits = commitsResult.status === 'fulfilled' ? commitsResult.value : []
    const recentCommits = recentCommitsResult.status === 'fulfilled' ? recentCommitsResult.value : []
    const workflowRuns = workflowRunsResult.status === 'fulfilled' ? workflowRunsResult.value : []
    const closedPullRequests = closedPullRequestsResult.status === 'fulfilled' ? closedPullRequestsResult.value : []
    const openIssuesRaw = openIssuesResult.status === 'fulfilled' ? openIssuesResult.value : []
    const closedIssuesRaw = closedIssuesResult.status === 'fulfilled' ? closedIssuesResult.value : []

    const data = repoData && typeof repoData === 'object' ? repoData : {}
    const weeklyBuckets = Array.isArray(commits) ? buildWeeklyCommitBuckets(commits, weeks) : Array(weeks).fill(0)
    const total12w = weeklyBuckets.reduce((sum, n) => sum + n, 0)
    const avgPerWeek = total12w / weeks
    const lastWeek = weeklyBuckets[weeks - 1] ?? 0
    const prevWeek = weeklyBuckets[weeks - 2] ?? 0
    const delta = lastWeek - prevWeek
    const trend = `${delta >= 0 ? '+' : ''}${delta} vs last wk`

    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const last30Cutoff = now - (30 * dayMs)
    const prev30Cutoff = now - (60 * dayMs)
    const relevantRuns = Array.isArray(workflowRuns)
      ? workflowRuns.filter((run) => {
        const ts = Date.parse(run?.created_at || '')
        return !Number.isNaN(ts) && ts >= prev30Cutoff && (run?.status === 'completed')
      })
      : []

    const productionCommitsSet = new Set()
    const prev30CommitsSet = new Set()
    relevantRuns.forEach((run) => {
      const ts = Date.parse(run?.created_at || '')
      const sha = run?.head_sha
      if (!sha) return
      if (ts >= last30Cutoff) {
        productionCommitsSet.add(sha)
      } else if (ts >= prev30Cutoff) {
        prev30CommitsSet.add(sha)
      }
    })

    const productionCommits = productionCommitsSet.size
    const prev30Commits = prev30CommitsSet.size
    const productionDelta = productionCommits - prev30Commits
    const productionTrend = `${productionDelta >= 0 ? '+' : ''}${formatNumber(productionDelta)} vs prev 30d`

    const last30Runs = relevantRuns.filter((run) => Date.parse(run?.created_at || '') >= last30Cutoff)
    const completedRuns = last30Runs.filter((run) => run?.status === 'completed')
    const successfulRuns = completedRuns.filter((run) => run?.conclusion === 'success')
    const buildPassRate30d = completedRuns.length
      ? `${Math.round((successfulRuns.length / completedRuns.length) * 100)}%`
      : '--%'
    const deploysMonth = formatNumber(last30Runs.length)

    const mergedPulls = Array.isArray(closedPullRequests)
      ? closedPullRequests.filter((pr) => {
        const merged = Date.parse(pr?.merged_at || '')
        return !Number.isNaN(merged) && merged >= last30Cutoff
      })
      : []

    const mergeLags = mergedPulls
      .map((pr) => {
        const created = Date.parse(pr?.created_at || '')
        const merged = Date.parse(pr?.merged_at || '')
        if (Number.isNaN(created) || Number.isNaN(merged) || merged < created) return null
        return (merged - created) / dayMs
      })
      .filter((v) => v !== null)
      .sort((a, b) => a - b)

    const medianMergeLag = mergeLags.length
      ? mergeLags[Math.floor(mergeLags.length / 2)]
      : NaN

    const openIssues = Array.isArray(openIssuesRaw)
      ? openIssuesRaw.filter((issue) => !issue.pull_request)
      : []
    const ideaLabel = /(^|\s|-)idea(s)?($|\s|-)/
    const orphanLabel = /(^|\s|-)orphan(s)?($|\s|-)/
    const blockedLabel = /blocked|on-hold|on hold|needs-decision/
    const completedLabel = /(^|\s|-)complet(ed|e)($|\s|-)|shipped/
    
    const ideasOpen = openIssues.filter((issue) => hasLabel(issue, ideaLabel))
    const orphansOpen = openIssues.filter((issue) => hasLabel(issue, orphanLabel))
    const blockedOpen = openIssues.filter((issue) => hasLabel(issue, blockedLabel))
    
    const closedIssues = Array.isArray(closedIssuesRaw)
      ? closedIssuesRaw.filter((issue) => !issue.pull_request)
      : []
    const completedIssues = closedIssues
      .filter((issue) => hasLabel(issue, completedLabel))
      .sort((a, b) => Date.parse(b?.closed_at || '') - Date.parse(a?.closed_at || ''))

    const values = {
      stars: formatNumber(data.stargazers_count ?? 0),
      closedIssues: formatNumber(closedIssues.length),
      openIssues: formatNumber(data.open_issues_count ?? 0),
      watchers: formatNumber(data.subscribers_count ?? data.watchers_count ?? 0),
      productionCommits: formatNumber(productionCommits),
      productionTrend,
      buildPassRate30d,
      deploysMonth,
      prMergeLag: formatDurationDays(medianMergeLag),
      orphansOpen: formatNumber(orphansOpen.length),
      ideasOpen: formatNumber(ideasOpen.length),
      onHoldCount: formatNumber(blockedOpen.length),
      commitVelocity: `${avgPerWeek.toFixed(1)}/wk`,
      velocityTrend: trend,
      velocitySummary: `12-week total: ${formatNumber(total12w)} commits.`
    }

    statNodes.forEach((node) => {
      const key = node.getAttribute('data-gh-stat')
      if (key && values[key] !== undefined) {
        node.textContent = values[key]
      }
    })

    const barsNode = root.querySelector('[data-gh-weekly-bars]')
    if (barsNode) {
      const max = Math.max(...weeklyBuckets, 1)
      barsNode.innerHTML = weeklyBuckets.map((count, index) => {
        const height = Math.max(8, Math.round((count / max) * 42))
        const active = index === weeks - 1 ? 'active' : ''
        return `<div class="status-spark-item"><span class="status-spark-count">${count}</span><span class="status-spark-bar ${active}" style="height:${height}px" title="${count} commits"></span></div>`
      }).join('')
    }

    const labelsNode = root.querySelector('[data-gh-week-labels]')
    if (labelsNode) {
      labelsNode.innerHTML = weeklyBuckets.map((_, index) => {
        const weeksAgo = (weeks - 1) - index
        return `<span>${weeksAgo === 0 ? 'now' : `-${weeksAgo}w`}</span>`
      }).join('')
    }

    const commitFeedSource = Array.isArray(commits) && commits.length
      ? commits
      : (Array.isArray(recentCommits) ? recentCommits : [])

    const commitsFeed = commitFeedSource
      .slice(0, 5)
      .map((commit) => {
        const lines = (commit?.commit?.message || 'Untitled commit')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
        const title = lines[0] || 'Untitled commit'
        const note = lines.slice(1).join(' ')
        return {
          title,
          meta: `${formatShortDate(commit?.commit?.author?.date)}${note ? ` • Note: ${note}` : ''}`,
          commitSha: commit?.sha?.slice(0, 7) || 'unknown',
          commitUrl: commit?.html_url || ''
        }
      })

    const githubIdeas = ideasOpen
      .slice(0, 5)
      .map((issue) => {
        const typeTags = extractTypeTags(issue)
        const typeSuffix = typeTags.length ? ` • ${typeTags.join(', ')}` : ''
        const dotColor = getIssueLabelColor(issue, ideaLabel)
        return {
          title: issue.title || 'Untitled idea',
          meta: `opened ${formatShortDate(issue.created_at)}${typeSuffix}`,
          dotColor
        }
      })

    const ideasFeed = githubIdeas.slice(0, 5)

    const orphansFeed = orphansOpen
      .slice(0, 5)
      .map((issue) => {
        const typeTags = extractTypeTags(issue)
        const typeSuffix = typeTags.length ? ` • ${typeTags.join(', ')}` : ''
        const dotColor = getIssueLabelColor(issue, orphanLabel)
        return {
          title: issue.title || 'Untitled orphan',
          meta: `updated ${formatShortDate(issue.updated_at)}${typeSuffix}`,
          dotColor
        }
      })

    const blockedFeed = blockedOpen
      .slice(0, 5)
      .map((issue) => {
        const typeTags = extractTypeTags(issue)
        const typeSuffix = typeTags.length ? ` • ${typeTags.join(', ')}` : ''
        const dotColor = getIssueLabelColor(issue, blockedLabel)
        return {
          title: issue.title || 'Blocked issue',
          meta: `marked on hold ${formatShortDate(issue.updated_at)}${typeSuffix}`,
          dotColor
        }
      })

    const completedFeed = completedIssues
      .slice(0, 5)
      .map((issue) => {
        const typeTags = extractTypeTags(issue)
        const typeText = typeTags.length ? typeTags.join(', ') : 'shipped'
        const dotColor = getIssueLabelColor(issue, completedLabel)
        return {
          title: issue.title || 'Completed',
          meta: `closed ${formatShortDate(issue.closed_at)} • ${typeText}`,
          dotColor
        }
      })

    const deploymentFeed = Array.isArray(workflowRuns)
      ? workflowRuns.slice(0, 5).map((run) => {
        const fullSha = run?.head_sha || ''
        return {
          title: `${(run?.conclusion || run?.status || 'unknown').toUpperCase()} • ${run?.display_title || run?.name || 'Deploy run'}`,
          meta: `${formatWeekdayDate(run?.created_at)}`,
          commitSha: fullSha ? fullSha.slice(0, 7) : '',
          commitUrl: fullSha ? `https://github.com/${owner}/${repo}/commit/${fullSha}` : ''
        }
      })
      : []

    renderFeedItems(root, '[data-gh-feed-commits]', commitsFeed, 'No recent commits found.')
    renderFeedItems(root, '[data-gh-feed-ideas]', ideasFeed, 'No open ideas found. Add label: idea.')
    renderFeedItems(root, '[data-gh-feed-orphans]', orphansFeed, 'No open orphans found.', 'warn')
    renderFeedItems(root, '[data-gh-feed-blocked]', blockedFeed, 'No GitHub on-hold issues are currently open.', 'pause')
    renderFeedItems(root, '[data-gh-feed-completed]', completedFeed, 'No completed items found.')
    renderFeedItems(root, '[data-gh-feed-deployments]', deploymentFeed, 'No deployment activity found.')
  } catch (error) {
    console.error('Status Hub hydration failed:', error)
    // Keep static fallback values if GitHub API is unavailable.
  }
}

export default function SidebarPage() {
  const loaderData = useLoaderData() || {}
  const rawHtml = typeof loaderData.rawHtml === 'string' ? loaderData.rawHtml : ''
  const navigate = useNavigate()
  const ref = useRef(null)

  const rawMain = rawHtml ? extractMainHtml(rawHtml) : ''
  const isStatusHub = /status-hub/.test(rawMain)
  const mainHtml = isStatusHub
    ? rawMain
    : rawMain.replace(/(<main[^>]*>)/i, '$1<button class="back-link" id="ssg-back-btn">← Return Home</button>')
  const headStyles = rawHtml ? extractHeadStyles(rawHtml) : []

  useEffect(() => {
    const backBtn = ref.current?.querySelector('#ssg-back-btn')
    const statusHubNode = isStatusHub ? ref.current?.querySelector('.status-hub') : null
    const onBack = () => navigate('/')
    if (backBtn) backBtn.addEventListener('click', onBack)

    let cancelled = false
    if (statusHubNode) statusHubNode.classList.add('is-loading')

    ;(async () => {
      try {
        await hydrateGithubStats(ref.current)
      } finally {
        if (!cancelled && statusHubNode) statusHubNode.classList.remove('is-loading')
      }
    })()

    document.body.classList.add('article-open')
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => {
      cancelled = true
      if (statusHubNode) statusHubNode.classList.remove('is-loading')
      if (backBtn) backBtn.removeEventListener('click', onBack)
      document.body.classList.remove('article-open')
    }
  }, [isStatusHub, mainHtml, navigate])

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
