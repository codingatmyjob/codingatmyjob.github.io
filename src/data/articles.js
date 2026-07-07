// .js over .json because we're using imageStyle objects and plain JSON would prevent this
export const articlesData = [
  // // DRAFT -- NEED TO CREATE SMALL DEMO OR MAKE A REPO FOR VISUAL AID
  // {
  //   id: 'efficient-html-maps-with-pydeck',
  //   path: 'articles/efficient-html-maps-with-pydeck',
  //   publishedAt: 'DRAFT',
  //   date: 'DRAFT',
  //   title: 'Efficient HTML Maps with Pydeck',
  //   description: 'Diving into efficient HTML map rendering with Pydeck over Folium (Leaflet) style HTML rendering.',
  //   tags: ['Notes', 'Python', 'Maps', 'Pydeck'],
  //   imageLabel: 'Efficient HTML Maps with Pydeck'
  // },
  //   // DRAFT -- NEED TO WIRE SERVER COMPONENT TO SERVE THIS STILL
  // {
  //   id: 'noaa-tides-llm-chatbot-demo',
  //   path: 'articles/noaa-tides-llm-chatbot-demo',
  //   publishedAt: 'DRAFT',
  //   date: 'DRAFT',
  //   title: 'NOAA Tides LLM Chatbot Demo',
  //   description: 'A Groq-powered chatbot demo that queries NOAA data using tool calling and a Node.js backend on Fly.io.',
  //   tags: ['Demo', 'LLM', 'Node.js', 'API'],
  //   imageLabel: 'NOAA Tides LLM Chatbot Demo'
  // },
  {
    id: 'new-http-query-method',
    path: 'articles/new-http-query-method',
    publishedAt: '2026-07-10',
    date: 'July 10, 2026',
    title: 'HTTP QUERY Method',
    description: 'Exploring the newly standardized HTTP QUERY request method (RFC 10008), why it was necessary, and how it differs from GET and POST.',
    tags: ['Notes', 'HTTP', 'API'],
    imageSrc: 'images/cover/HTTP_logo.svg',
    imageAlt: 'HTTP QUERY Method',
    imageStyle: { height: '95%', width: '95%' }
  },
    {
    id: 'how-i-passed-azure-ai-fundamentals',
    path: 'articles/how-i-passed-azure-ai-fundamentals',
    publishedAt: '2026-06-26',
    date: 'June 26, 2026',
    title: 'How I passed Microsoft Azure AI Fundamentals',
    description: 'Azure AI Fundamentals AI-900 review, study resources used, exam-day tips, and upcoming test changes.',
    tags: ['Cert', 'AI'],
    imageSrc: 'images/cover/ai-900.svg',
    imageAlt: 'How I passed Microsoft Azure AI Fundamentals',
    imageStyle: { height: '95%', width: '95%' }
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
    imageAlt: 'Traffic Object Detection',
    imageStyle: { height: '95%', width: '95%' }
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
    imageStyle: { height: '85%', width: '85%' }
  },
  {
    id: 'use-claude-code-for-free',
    path: 'articles/use-claude-code-for-free',
    publishedAt: '2026-06-12',
    date: 'June 12, 2026',
    title: 'Use Claude Code for Free',
    description: 'Run Claude Code with free/local models. With tool-calling and context limits, is it doable?',
    tags: ['Reference', 'Claude Code', 'OpenRouter', 'Windows'],
    imageSrc: 'images/cover/claudecode.png',
    imageAlt: 'Use Claude Code for Free',
    imageStyle: {height: '85%', width: '85%'}
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
    imageStyle: {height: '85%', width: '85%'}
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
    id: 'passing-oci-foundations-associate',
    path: 'articles/passing-oci-foundations-associate',
    publishedAt: '2026-05-15',
    date: 'May 15, 2026',
    title: 'Passing OCI Foundations Associate',
    description: 'An OCI Foundations Associate review, and opinions on the Oracle course.',
    tags: ['Cert', 'Cloud'],
    imageSrc: 'images/cover/OCI25FNDCFA.png',
    imageAlt: 'Passing OCI Foundations Associate'
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
    imageStyle: { height: '85%', width: '85%' }
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
    imageAlt: 'Playing in Traffic and Heatmaps',
    imageStyle: { height: '85%', width: '100%' }
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
    imageAlt: 'Creating a Pokemon Stock Bot',
    imageStyle: { height: '90%', width: '90%' }
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
    imageStyle: { height: '85%', width: '85%' }
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