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

## Build-Time Data Products

I generate two JSON artifacts at build time and ship both with the site:

- `scripts/generate-related-articles.cjs` -> `public/data/related-articles.json`
- `scripts/generate-read-times.cjs` -> `public/data/read-times.json`

Astro reads the related-article data when rendering article pages, and read-time data is merged into article metadata for cards.

## Build and Deployment

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