import { hydrateGithubStats } from './status-hub.js'

const statusHub = document.querySelector('.status-hub')
if (statusHub) {
  statusHub.classList.add('is-loading')
  hydrateGithubStats(statusHub).finally(() => statusHub.classList.remove('is-loading'))
}
