# codingatmyjob.github.io

This is my Cybersecurity + Data Science blog, and I occasionally go deep on AI experiments.

Most posts are project writeups, cert retrospectives, security notes, and interactive demos.

Live site: https://codingatmyjob.github.io/

## What I Write About

- Cybersecurity writeups, labs, and practical command references
- Data science and data-heavy project breakdowns
- AI notes, model/tooling experiments, and security implications
- Certification retrospectives and study strategy

## How The Site Is Served

Short version: Astro-generated static pages + build-time metadata generation.

- Routes are defined by Astro files in `src/pages` (`/`, `/articles/:slug/`, `/sidebar/:page/`).
- Article files are plain HTML in `public/articles/*.html`.
- Sidebar pages are plain HTML in `public/sidebar/*.html`.
- Astro reads those files at build time and emits a static page for each one.
- Browser interactions are small progressive-enhancement scripts; the site shell stays static and does not hydrate as a client-side application.

I keep content authoring simple (HTML files), while Astro handles page generation and metadata.

Use the theme button in the header to switch themes. The icon shows the theme you'll switch to, and the browser remembers your choice.
The header and footer use a transparent Tangent mark whose T matches the wordmark color in both themes. The favicon keeps its rounded background.

The homepage opens with Highlighted Work, a curated set of projects from the archive. To change the selection, edit `featured` in [index.astro](./src/pages/index.astro). Search, Sort, and Filter work on the full archive. Use the **Grid view** or **Wide view** icon above the archive cards to switch layouts; the browser remembers the selection.

Highlighted Work has one illustrated lead (the first entry in `featured`) and two text-only picks. The archive shows covers in Grid view. In Wide view, all tags sit together below the description, and the date and read time sit across from the headline on desktop and below it on phones.

Cover images fit without cropping and get a 12px inset on every side. Set `imageInset: 'roomy'` in [articles.js](./src/data/articles.js) for an 18px inset on a cover that needs more breathing room.

The Status Hub spans the available page width. Below the summary tiles, panels keep their natural heights and flow into balanced columns: three on desktop, two on narrower screens, and one on phones. Issue sections use GitHub labels such as `idea`, `on-hold`, `orphan`, and `completed`.

## Build-Time Data Products

I generate two JSON artifacts at build time and ship both with the site:

- `scripts/generate-related-articles.cjs` -> `public/data/related-articles.json`
- `scripts/generate-read-times.cjs` -> `public/data/read-times.json`

Astro reads the related-article data when rendering article pages, and read-time data is merged into article metadata for cards.

## Build and Deployment

### Enable Helpful votes

Voting is off by default. When enabled, articles show a Helpful button below the article and above related articles, and the homepage shows totals on Highlighted Work and archive tiles. GitHub Pages remains static; a separate Cloudflare Worker stores votes in D1. To set it up, run these commands from `workers\votes` with Node.js 24:

1. Run `npx wrangler@4 login`, then `npx wrangler@4 d1 create tangent-votes`.
2. Copy the returned database ID into `database_id` in [wrangler.toml](./workers/votes/wrangler.toml), replacing the all-zero placeholder. Leave `ALLOWED_ORIGIN` set to `https://codingatmyjob.github.io` unless the site moves.
3. Run `npx wrangler@4 d1 migrations apply tangent-votes --remote`, then `npx wrangler@4 deploy`.
4. Check `https://YOUR-WORKER-URL/votes?slug=using-prismjs-to-style-code` in a browser. A new database should return `{"count":0}`.
5. In GitHub, go to **Settings → Secrets and variables → Actions → Variables** and add `PUBLIC_VOTES_API_URL` with the full deployed HTTPS URL ending in `/votes`. Commit and push the site changes, then run **Deploy Production** from that branch. This URL is public; don't put an API key or a Cloudflare token in it. Preview builds don't enable voting.

If the Worker was deployed before tile counts were added, run `npx wrangler@4 deploy` again from `workers\votes` before deploying the site. No new database migration is needed. The Worker URL ending in `/votes` should now return `{"counts":{...}}` without a `slug` query parameter.

For a local test, run `npx wrangler@4 d1 migrations apply tangent-votes --local` from `workers\votes`, then `npx wrangler@4 dev --ip 127.0.0.1 --port 8787 --var ALLOWED_ORIGIN:http://localhost:4321`. In another PowerShell terminal at the repo root, run `$env:PUBLIC_VOTES_API_URL = 'http://127.0.0.1:8787/votes'` followed by `npm run dev`, then open `http://localhost:4321`.

Votes use a random, per-article browser ID stored only after clicking **Helpful**. D1 stores the slug and that ID, not IP addresses. Cloudflare uses the request IP for approximate rate limiting. This prevents duplicate retries and discourages spam, but it isn't one vote per person. Unset `PUBLIC_VOTES_API_URL` and rebuild production to remove the button.

### Site builds

`npm run build` runs both generators first, then builds the Astro site into `dist/client/`.

GitHub Actions publishes `dist/client/` to GitHub Pages:

- Production: `https://codingatmyjob.github.io`
- Preview: `https://codingatmyjob.github.io/preview/`

## Commands

```bash
npm install
npm run dev
```

Run local dev server.

```bash
npm run generate:related
```

Rebuild related-articles output only.

```bash
npm run generate:read-times
```

Rebuild read-time metadata only.

```bash
npm run build
```

Generate JSON data products + static deploy output.

```bash
npm run lint
```

Run baseline lint checks for build scripts, test files, and core config.

```bash
npm run test
```

Run unit tests for build-time metadata generators.

```bash
npm run deploy
```

Publish with `gh-pages` CLI.

## CI and Monitoring

- `.github/workflows/ci.yml` runs lint, tests, and `build:ci` on pushes and pull requests.
- `.github/workflows/deploy-production.yml` and `.github/workflows/deploy-preview.yml` now gate deploys on lint + tests.
- `.github/workflows/monitoring-basics.yml` runs scheduled uptime checks for production and preview every 6 hours.

## Stack (Minimal on Purpose)

I intentionally keep the stack close to static-web fundamentals:

- Astro + Vite for static builds and routing
- Plain CSS for styling control
- Prism.js for syntax highlighting
- Small browser scripts for interactive features

No always-on backend needed. Build-time generation + static hosting handles the core experience.