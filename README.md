# codingatmyjob.github.io

A personal project portfolio and technical blog built with React and Vite.

## Purpose

Portfolio documents the learning process. Each article captures a project, tool, or exam, including what worked, what didn't, and the reasoning behind decisions. Topics span Python automation, JavaScript web apps, numerous certifications, security (CompTIA, HTB),AI-assisted tooling, and more. Interactive demos are embedded where relevant, allowing the user to work hands-on with content and not just read theory.

## Stack

| Layer | Technology |
|---|---|
| UI | React 18 + React Router 6 |
| Static generation | vite-react-ssg |
| Build tool | Vite |
| Styling | Plain CSS with CSS variables |
| Code highlighting | Prism.js |
| Deployment | GitHub Pages via `gh-pages` |

## Deployment

There are two environments, both hosted on GitHub Pages:

| Environment | URL | Branch | Trigger |
|---|---|---|---|
| Production | `codingatmyjob.github.io/` | `main` | `npm run deploy` |
| Preview | `codingatmyjob.github.io/preview/` | `preview` | push to `preview` branch |

**Production** - deploys manually via the `gh-pages` npm package:

```bash
npm run deploy
```

This builds with `vite-react-ssg build` (base `/`), generates static HTML for all routes, then publishes `dist/` to the `gh-pages` branch.

**Preview** - deploys automatically via GitHub Actions (`.github/workflows/deploy-preview.yml`) on any push to the `preview` branch. The build uses `--base /preview/` so all routes and assets resolve correctly under the subdirectory.