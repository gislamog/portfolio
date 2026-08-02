# Gulsum Islamoglu — Portfolio (v2)

Modern portfolio site built with **Vite + React + TypeScript**.

## Quick start

```powershell
cd site
npm install
npm run dev
```

Open **http://localhost:3002/portfolio/** (port 3002 avoids WSL conflicts on Windows).

## Deploy to GitHub Pages

```powershell
cd site
npm run deploy
```

This builds to `dist/` and publishes via `gh-pages`. The site lives at [gislamog.github.io/portfolio](https://gislamog.github.io/portfolio/).

## Structure

- `site/src/data/` — all content (experience, education, blog, projects)
- `site/public/docs/` — MCS portfolio PDF and Big Data certificate
- `site/src/demos/` — interactive mini apps

## Legacy

The old Create React App lives in `portfolio-react-app/` (deprecated).
