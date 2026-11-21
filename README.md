# Tangent

[Tangent](https://codingatmyjob.github.io/) is my blog about cybersecurity, data science, and AI experiments. It’s built with Astro and hosted on GitHub Pages.

## Local development

Use Node.js 24.

```sh
npm ci
npm run dev
```

Open [localhost:4321](http://localhost:4321). Run `npm run lint` and `npm test` before pushing. `npm run build` regenerates reading times and related articles, then writes the static site to `dist/client/`.

## Editing content

- Articles: [HTML](./public/articles/) and [archive metadata](./src/data/articles.js)
- Sidebar pages: [HTML](./public/sidebar/)
- Highlighted Work: the `featured` list in [index.astro](./src/pages/index.astro)

## Deploying

- [Production](https://codingatmyjob.github.io/): run [Deploy Production](./.github/workflows/deploy-production.yml) from GitHub Actions.
- [Preview](https://codingatmyjob.github.io/preview/): push to the `preview` branch or run [Deploy Preview](./.github/workflows/deploy-preview.yml). Voting is disabled in preview builds.

## Voting

Voting is optional. The static site calls a [Cloudflare Worker](./workers/votes/) that stores votes in D1. Votes are deduplicated by browser ID per article, not by person.
When vote totals are available, **Sort > Votes** ranks archive articles by vote count, newest first on ties.

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
