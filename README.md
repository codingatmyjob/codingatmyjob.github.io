# codingatmyjob.github.io

A personal project portfolio and technical blog built with React and Vite.

## Purpose

Portfolio documents the learning process. Each article captures a project, tool, or exam, including what worked, what didn't, and the reasoning behind decisions. Topics span Python automation, JavaScript web apps, numerous certifications, security (CompTIA, HTB), and AI-assisted tooling. Interactive demos are embedded directly in articles where relevant, making the content hands-on rather than purely descriptive.

## Stack

| Layer | Technology |
|---|---|
| UI | React 18 |
| Build tool | Vite |
| Styling | Plain CSS |
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

This runs `vite build` (base `/`) then publishes `dist/` to the `gh-pages` branch.

**Preview** - deploys automatically via GitHub Actions (`.github/workflows/deploy-preview.yml`) on any push to the `preview` branch. The build uses `--base /preview/` so all assets resolve correctly under the subdirectory. The sidebar includes a toggle to switch between environments at runtime.