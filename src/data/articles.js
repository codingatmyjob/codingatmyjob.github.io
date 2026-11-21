import { readTimesByPath } from './readTimes'

const baseArticlesData = [
  // {
  //   id: 'studying-for-dp-800-part-1',
  //   path: 'articles/studying-for-dp-800-part-1',
  //   publishedAt: '2026-08-07',
  //   date: 'August 07, 2026',
  //   title: 'Microsoft DP-800: Part 1',
  //   description: 'Kicking off a DP-800 study series with the overarching plan, and mini-project ideas.',
  //   tags: ['Cert', 'AI', 'Databases', 'SQL'],
  //   imageSrc: 'images/cover/microsoft-certified-associate-badge.svg',
  //   imageAlt: 'Studying for Microsoft DP-800: Part 1'
  // },
  {
    id: 'how-fit-am-i',
    path: 'articles/how-fit-am-i',
    publishedAt: '2026-11-20',
    date: 'November 20, 2026',
    title: 'How Fit Am I?',
    description: 'Explore your relative fitness with an interactive demo built on 800K+ race results.',
    tags: ['Demo', 'Data Science', 'WebApp', 'Python'],
    imageSrc: 'images/cover/how-fit-am-i.svg',
    imageAlt: 'Waving black and white checkered flags on crossed gray poles above the 89th percentile text.'
  },
  {
    id: 'prompt-injection-demo',
    path: 'articles/prompt-injection-demo',
    publishedAt: '2026-07-24',
    date: 'July 24, 2026',
    title: 'Prompt Injection Demo',
    description: 'Demo using Hugging Face to demonstrate a type of Direct Prompt Injection; System Prompt Extraction.',
    tags: ['Demo', 'AI', 'Security'],
    imageSrc: 'images/cover/hf-logo.svg',
    imageAlt: 'Prompt Injection Demo'
  },
  {
    id: 'how-i-built-a-related-articles-recommender',
    path: 'articles/how-i-built-a-related-articles-recommender',
    publishedAt: '2026-07-17',
    date: 'July 17, 2026',
    title: 'How I built a Related Articles Recommender',
    description: 'Tangent\'s related articles recommender, algorithms, and implementation details.',
    tags: ['Notes', 'Data Science', 'JavaScript'],
    imageSrc: 'images/cover/tf_idf_cover.svg',
    imageAlt: 'Related Articles Recommender'
  },
  {
    id: 'new-http-query-method',
    path: 'articles/new-http-query-method',
    publishedAt: '2026-07-07',
    date: 'July 07, 2026',
    title: 'HTTP QUERY Method',
    description: 'Exploring the newly standardized HTTP QUERY request method (RFC 10008), why it was necessary, and how it differs from GET and POST.',
    tags: ['Notes', 'HTTP', 'API'],
    imageSrc: 'images/cover/HTTP_logo.svg',
    imageAlt: 'HTTP QUERY Method',
    imageInset: 'roomy'
  },
    {
    id: 'how-i-passed-azure-ai-fundamentals',
    path: 'articles/how-i-passed-azure-ai-fundamentals',
    publishedAt: '2026-06-26',
    date: 'June 26, 2026',
    title: 'How I passed Microsoft Azure AI Fundamentals',
    description: 'AI-900 review, study resources used, exam-day tips, and upcoming test changes.',
    tags: ['Cert', 'AI'],
    imageSrc: 'images/cover/ai-900.svg',
    imageAlt: 'How I passed Microsoft Azure AI Fundamentals'
  },
  {
    id: 'traffic-live-object-detection',
    path: 'articles/traffic-live-object-detection',
    publishedAt: '2026-06-26',
    date: 'June 26, 2026',
    title: 'Traffic Object Detection with TensorFlow.js',
    description: 'Live traffic feed with client-side COCO-SSD detection.',
    tags: ['Project', 'JavaScript', 'TensorFlow.js', 'Library'],
    imageSrc: 'images/cover/TensorFlow_cover.svg',
    imageAlt: 'Traffic Object Detection'
  },
  {
    id: 'using-prismjs-to-style-code',
    path: 'articles/using-prismjs-to-style-code',
    publishedAt: '2026-06-19',
    date: 'June 19, 2026',
    title: 'Using Prism.js to Style Code',
    description: 'Integrating Prism.js, language aliases, heuristic language detection, and toolbar.',
    tags: ['Notes', 'JavaScript', 'Prism.js', 'Library'],
    imageSrc: 'images/cover/prismjs-logo.svg',
    imageAlt: 'Using Prism.js',
    imageInset: 'roomy'
  },
  {
    id: 'use-claude-code-for-free',
    path: 'articles/use-claude-code-for-free',
    publishedAt: '2026-06-12',
    date: 'June 12, 2026',
    title: 'Use Claude Code for Free',
    description: 'Run Claude Code with free/local models. With tool-calling and context limits, is it doable?',
    tags: ['Reference', 'Claude', 'AI', 'Windows'],
    imageSrc: 'images/cover/claudecode.png',
    imageAlt: 'Use Claude Code for Free'
  },
  {
    id: 'discord-spotify-activity-tracker',
    path: 'articles/discord-spotify-activity-tracker',
    publishedAt: '2026-06-06',
    date: 'June 06, 2026',
    title: 'Discord Spotify Activity Tracker',
    description: 'Critique and rewrite of an old Discord bot command, writing it how I\'d do it today.',
    tags: ['Project', 'Python', 'Discord', 'Spotify'],
    imageSrc: 'images/cover/discord-spotify-activity-tracker.png',
    imageAlt: 'Discord Spotify Activity Tracker',
    imageInset: 'roomy'
  },
  {
    id: 'cruise-size-comparisons',
    path: 'articles/cruise-size-comparisons',
    publishedAt: '2026-06-02',
    date: 'June 02, 2026',
    title: 'Cruise Size Comparisons',
    description: 'An interactive ship size comparison project with a searchable dataset, and ship view with tooltips.',
    tags: ['Project', 'JavaScript', 'WebApp'],
    imageLabel: 'Cruise Size Comparisons'
  },
  {
    id: 'how-i-passed-oci-foundations-associate',
    path: 'articles/how-i-passed-oci-foundations-associate',
    publishedAt: '2026-05-15',
    date: 'May 15, 2026',
    title: 'How I Passed OCI Foundations Associate',
    description: 'An OCI Foundations Associate review, and opinions on the Oracle course.',
    tags: ['Cert', 'Cloud'],
    imageSrc: 'images/cover/OCI25FNDCFA.png',
    imageAlt: 'How I Passed OCI Foundations Associate'
  },
  {
    id: 'typeahead-demo',
    path: 'articles/typeahead-demo',
    publishedAt: '2026-05-05',
    date: 'May 05, 2026',
    title: 'Typeahead Demo',
    description: 'An interactive typeahead/search suggestion demo with real-time data filtering and visual highlights.',
    tags: ['Demo', 'JavaScript', 'WebApp'],
    imageSrc: 'images/cover/typeahead.png',
    imageAlt: 'Typeahead Demo',
    imageInset: 'roomy'
  },
  {
    id: 'playing-in-traffic-and-heatmaps',
    path: 'articles/playing-in-traffic-and-heatmaps',
    publishedAt: '2026-05-02',
    date: 'May 02, 2026',
    title: 'Playing in Traffic and Heatmaps',
    description: 'Building a hex heatmap with Maps, TomTom, OpenStreetMap, and H3.',
    tags: ['Project', 'JavaScript', 'WebApp', 'API', 'Maps'],
    imageSrc: 'images/cover/hero.png',
    imageAlt: 'Playing in Traffic and Heatmaps'
  },
  {
    id: 'creating-a-pokemon-stock-bot',
    path: 'articles/creating-a-pokemon-stock-bot',
    publishedAt: '2026-05-01',
    date: 'May 01, 2026',
    title: 'Creating a Pokemon Stock Bot',
    description: 'How much work does a scalper put into stock checks for Pokemon products?',
    tags: ['Project', 'Python', 'API', 'Discord', 'Automation'],
    imageSrc: 'images/cover/pokestock.png',
    imageAlt: 'Creating a Pokemon Stock Bot'
  },
  {
    id: 'virtualbox-home-lab-setup',
    path: 'articles/VirtualBox-Home-Lab-Setup',
    publishedAt: '2025-11-08',
    date: 'November 08, 2025',
    title: 'VirtualBox Home Lab Setup',
    description: 'Building a home lab with VMs for hands-on penetration testing, exploit analysis, and traffic monitoring.',
    tags: ['Project', 'VM', 'SIEM', 'Security', 'Networking'],
    imageSrc: 'images/cover/VirtualBox_logo.png',
    imageAlt: 'VirtualBox Home Lab Setup',
    imageInset: 'roomy'
  },
  {
    id: 'htb-command-cheatsheet',
    path: 'articles/HTB-Command-Cheatsheet',
    publishedAt: '2025-11-02',
    date: 'November 2, 2025',
    title: 'HTB Command Cheatsheet',
    description: 'A regularly updated cheatsheet of essential commands and tools for CTFs and penetration testing.',
    tags: ['Reference', 'HTB', 'Pentest'],
    imageLabel: 'HTB Command Cheatsheet'
  },
  {
    id: 'htb-artificial-writeup',
    path: 'articles/HTB-Artificial-Writeup',
    publishedAt: '2025-10-27',
    date: 'October 27, 2025',
    title: 'HTB Artificial Writeup',
    description: 'A technical write up detailing steps taken pwn the Artificial HTB Machine.',
    tags: ['Writeup', 'HTB', 'Machine'],
    imageLabel: 'HTB Artificial Writeup'
  },
  {
    id: 'how-i-passed-security-plus',
    path: 'articles/how-i-passed-security-plus',
    publishedAt: '2025-10-26',
    date: 'October 26, 2025',
    title: 'How I passed CompTIA Security+ SY0-701',
    description: 'A Security+ review, glimpse into my study plan, resources used, and testing skills that helped me pass.',
    tags: ['Cert', 'Security'],
    imageSrc: 'images/cover/secplus.png',
    imageAlt: 'How I passed CompTIA Security+',
    imageClassName: 'article-card-image--default'
  },
  {
    id: 'how-i-passed-network-plus',
    path: 'articles/how-i-passed-network-plus',
    publishedAt: '2025-10-26',
    date: 'October 26, 2025',
    title: 'How I passed CompTIA Network+ N10-009',
    description: 'A Network+ review, including study resources used, and exam-day tips that helped me pass.',
    tags: ['Cert', 'Networking'],
    imageSrc: 'images/cover/netplus.png',
    imageAlt: 'How I passed CompTIA Network+',
    imageClassName: 'article-card-image--default'
  }
]

export const articlesData = baseArticlesData.map(article => ({
  ...article,
  readingTime: article.path ? (readTimesByPath[article.path] ?? null) : null
}))