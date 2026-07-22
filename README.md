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

Short version: static content files + React app shell + build-time metadata generation.

- Routes are defined in `src/routes.jsx` (`/`, `/articles/:slug`, `/sidebar/:page`).
- Article files are plain HTML in `public/articles/*.html`.
- Sidebar pages are plain HTML in `public/sidebar/*.html`.
- During static generation, loaders read those files from disk.
- In browser runtime, loaders fetch `articles/<slug>.html` or `sidebar/<page>.html`.

I keep content authoring simple (HTML files), while React handles navigation, metadata, and UI behavior.

## Build-Time Data Products

I generate two JSON artifacts at build time and ship both with the site:

- `scripts/generate-related-articles.cjs` -> `public/data/related-articles.json`
- `scripts/generate-read-times.cjs` -> `public/data/read-times.json`

At runtime, `src/pages/ArticlePage.jsx` reads related-article output, and read-time data is merged into article metadata for cards and article UI.

## Build and Deployment

`npm run build` runs both generators first, then `vite-react-ssg build`, and outputs deployable static assets to `dist/`.

GitHub Actions publishes `dist/` to GitHub Pages:

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
npm run deploy
```

Publish with `gh-pages` CLI.

## Stack (Minimal on Purpose)

I intentionally keep the stack close to static-web fundamentals:

- React + React Router for structure and navigation
- Vite + vite-react-ssg for fast static builds
- Plain CSS for styling control
- Prism.js for syntax highlighting

No always-on backend needed. Build-time generation + static hosting handles the core experience.