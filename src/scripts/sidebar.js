import { hydrateGithubStats } from './status-hub.js'

const statusHub = document.querySelector('.status-hub')
if (statusHub) {
  const message = statusHub.querySelector('.status-message')
  message.hidden = false
  message.textContent = 'Loading GitHub data…'
  hydrateGithubStats(statusHub).then((loaded) => {
    if (loaded) message.hidden = true
    else message.textContent = 'Could not load GitHub data.'
  })
}
