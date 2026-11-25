# Tangent

[Tangent](https://codingatmyjob.github.io/) is my cybersecurity and data science portfolio, built with Astro and hosted on GitHub Pages.

## Local development

With Node.js 24:

```sh
npm ci
npm run dev
```

Open [localhost:4321](http://localhost:4321). Run `npm run lint` and `npm test` before pushing. `npm run build` writes the site to `dist/client/`.

## Editing content

- Publish in [public/articles](./public/articles/) and add an entry to [articles.js](./src/data/articles.js). Keep unpublished work in [drafts](./drafts/).
- Edit homepage highlights in [index.astro](./src/pages/index.astro), the intro in [PortfolioIntro.astro](./src/components/PortfolioIntro.astro), and sidebar pages in [public/sidebar](./public/sidebar/).

## Deploying

- Production: run [Deploy Production](./.github/workflows/deploy-production.yml) from `main`.
- [Preview](https://codingatmyjob.github.io/preview/): push to `preview` or run [Deploy Preview](./.github/workflows/deploy-preview.yml).

## Voting

Voting uses a [Cloudflare Worker](./workers/votes/) and D1. Production deploys the Worker before publishing the site when voting is enabled. New articles need no database setup. Preview builds disable voting.

**Production setup**

1. For a fresh install, run `npx wrangler@4 login` and `npx wrangler@4 d1 create tangent-votes` from `workers\votes`. Set `database_id` and `ALLOWED_ORIGIN` in [wrangler.toml](./workers/votes/wrangler.toml), then run `npx wrangler@4 d1 migrations apply tangent-votes --remote` and `npx wrangler@4 deploy`.
2. In GitHub's `production` environment, restrict deployments to `main`. Set `CLOUDFLARE_ACCOUNT_ID` as a variable and `CLOUDFLARE_API_TOKEN` as a secret scoped to the production account with Workers deploy permissions.
3. Set `PUBLIC_VOTES_API_URL` to the public HTTPS endpoint ending in `/votes`, then run **Deploy Production**. Leave it unset to disable voting.

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

Open `http://localhost:4321` to match the configured origin.
