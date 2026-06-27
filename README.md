# codingatmyjob.github.io

Personal blog for project writeups, certification reviews, and interactive demos.

View live: https://codingatmyjob.github.io/

## Purpose

This site is a public facing project portfolio. Each post focuses on practical execution: what was built, why certain decisions were made, tradeoffs encountered, and what changed after testing in real usage. Instead of only documenting outcomes, articles capture process and iteration across:

- JavaScript web app experiments and UI patterns
- Python automation and bot workflows
- Security/CTF notes and lab writeups
- Certification prep breakdowns
- AI-assisted tooling and local model workflows

## Stack

| Layer | Technology |
|---|---|
| UI | React 18 + React Router 6 |
| Static generation | vite-react-ssg |
| Build tool | Vite |
| Styling | Plain CSS |
| Code highlighting | Prism.js |
| Deployment | GitHub Pages via `gh-pages` |

## Techniques Used

The repo utilizes static-first patterns, with build-time computation to keep runtime fast:

- Static route generation with `vite-react-ssg` for article pages.
- Build-time related article recommendations using tokenization + TF-IDF weighting.
- Cosine similarity with followon processing for recommendation scoring.
- K-means clustering to narrow candidate related-article pools.
- Compact JSON recommendation index consumed client-side for instant lookups.
- Saturating score transform for user-friendly `% match` display in the related carousel.
- Prism.js integration for code formatting in static HTML article content.

## Related Articles System

Related links are generated ahead of time and shipped as static JSON.

### Pipeline

1. Source HTML is read from `public/articles`.
2. Title, tags, and body text are extracted and normalized.
3. Weighted TF-IDF vectors are built per article (title/tag/body weights).
4. Vectors are clustered and ranked by similarity.
5. Results are written to `public/data/related-articles.json`.

### Runtime Behavior

- Article pages load recommendations from `public/data/related-articles.json`.
- The related carousel resolves recommendation slugs against article metadata.
- A bounded, scrollable card track displays the strongest matches.

### Commands

```bash
npm run generate:related
```

Regenerates the recommendation index only.

```bash
npm run build
```

Runs `prebuild` (including related generation), then builds the static site.

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Two environments are hosted on GitHub Pages:

| Environment | URL | Branch | Trigger |
|---|---|---|---|
| Production | `https://codingatmyjob.github.io/` | `main` | `npm run deploy` |
| Preview | `https://codingatmyjob.github.io/preview/` | `preview` | push to `preview` |

### Production

```bash
npm run deploy
```

Builds with base `/` and publishes `dist/` to `gh-pages`.

### Preview

Preview deploy runs from GitHub Actions on the `preview` branch with base `/preview/`.