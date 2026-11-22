# Tangent

[Tangent](https://codingatmyjob.github.io/) is my blog about cybersecurity, data science, and AI experiments. It’s built with Astro and hosted on GitHub Pages.

The shared layout uses the falling binary background. The homepage's note graph has a separate [tsParticles](https://particles.js.org/) layer behind it. Both animations respect reduced motion.

## Local development

Use Node.js 24.

```sh
npm ci
npm run dev
```

Open [localhost:4321](http://localhost:4321). Run `npm run lint` and `npm test` before pushing. `npm run build` regenerates reading times and related articles, then writes the static site to `dist/client/`.

## Editing content

- Articles: [HTML](./public/articles/) and [Gallery metadata](./src/data/articles.js)
- Sidebar pages: [HTML](./public/sidebar/)
- Highlights: the `featured` list in [index.astro](./src/pages/index.astro)
- Landing intro and tech badges: [PortfolioIntro.astro](./src/components/PortfolioIntro.astro). [ArticleGraph.astro](./src/components/ArticleGraph.astro) arranges the Gallery articles in one ring around How Fit Am I?. It uses the same data as Related Articles and draws a line if either article recommends the other. Dot size and color show the number of direct links: white for 0–1, the theme’s slate accent for 2–4, and orange for 5+. Hover or focus a node to show its title, publication date, and summary and highlight only its direct connections; tap a node on touch to see the preview first. Reduced motion keeps the highlights but skips the animation. The intro label shares the browser tab title set in [index.astro](./src/pages/index.astro). About copy: [About.html](./public/sidebar/About.html).
- Repo tags: set `repoUrl` in [article metadata](./src/data/articles.js) to add a `Repo` tag to the article.
- Unpublished articles: keep drafts in [drafts](./drafts/) and outside the Gallery metadata until ready to publish.

The Highlights lead, Gallery Grid, and Related Articles share a radial gradient behind their cover images. Only the Highlights lead adds grid lines. Gallery Wide stays text-only. Set `previewGif` in article metadata to add an animated card cover while keeping the static cover for reduced-motion users. For Gallery Grid previews, use the cover box's 16:8.5 aspect ratio. Encode the GIF with looping enabled if it should replay automatically.

## Deploying

### Optional site analytics

To add [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/get-started/) without moving off GitHub Pages, add the production hostname in its dashboard and choose manual JavaScript snippet installation. Put the provided beacon in [SiteLayout.astro](./src/layouts/SiteLayout.astro) just before `</body>`, gate it to production deployments so previews are excluded, and verify data in the dashboard after visiting the deployed site. No analytics beacon is enabled by default.

- [Production](https://codingatmyjob.github.io/): run [Deploy Production](./.github/workflows/deploy-production.yml) from GitHub Actions.
- [Preview](https://codingatmyjob.github.io/preview/): push to the `preview` branch or run [Deploy Preview](./.github/workflows/deploy-preview.yml). Voting is disabled in preview builds.

## Voting

Voting is optional. The static site calls a [Cloudflare Worker](./workers/votes/) that stores votes in D1. Votes are deduplicated by browser ID per article, not by person.
Highlights, Gallery, and Related Articles tiles show nonzero vote totals across from the date and read time as `+1 vote` or `+2 votes`. **Sort > Votes** ranks Gallery articles by vote count, newest first on ties.

**Production setup**

1. From `workers\votes`, run `npx wrangler@4 login` and `npx wrangler@4 d1 create tangent-votes`.
2. Set `database_id` and `ALLOWED_ORIGIN` in [wrangler.toml](./workers/votes/wrangler.toml). Run `npx wrangler@4 d1 migrations apply tangent-votes --remote`, then `npx wrangler@4 deploy`.
3. In GitHub, set `PUBLIC_VOTES_API_URL` under **Settings > Secrets and variables > Actions > Variables** to the full HTTPS endpoint ending in `/votes`, then run **Deploy Production**. Use the public URL only, not credentials.

**Local testing**

Start the Worker in PowerShell from the repo root:

```powershell
Set-Location workers\votes
npx wrangler@4 d1 migrations apply tangent-votes --local
npx wrangler@4 dev --ip 127.0.0.1 --port 8787 --var ALLOWED_ORIGIN:http://localhost:4321
```

In another terminal at the repo root, start or restart Astro with the local endpoint:

```powershell
$env:PUBLIC_VOTES_API_URL = 'http://127.0.0.1:8787/votes'
npm run dev
```

Use `http://localhost:4321` so the browser origin matches the Worker configuration. Local votes stay in local D1.
