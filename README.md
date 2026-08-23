# Gulsum Islamoglu — Portfolio (v2)

Modern portfolio site built with **Vite + React + TypeScript**.

## Quick start

```powershell
cd site
npm install
npm run dev
```

Open **http://localhost:3002/** (port 3002 avoids WSL conflicts on Windows).

## Deploy to GitHub Pages

```powershell
cd site
npm run deploy
```

This builds to `dist/` and publishes via `gh-pages`. The site lives at [gislamog.github.io/portfolio](https://gislamog.github.io/portfolio/).

## Analytics (Cloudflare, free)

The site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — a cookie-free JS beacon, no visitor names. SPA route changes are tracked.

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/) (free account).
2. **Analytics & logs → Web Analytics → Add a site**. Hostname: `gislamog.github.io`.
3. Copy the `token` from the snippet Cloudflare shows.
4. Token is already in `site/.env.production`. Local `npm run dev` still does **not** send beacons.
5. Deploy (`npm run deploy`) to start collecting production visits.

Dashboard data can take a short while after the first production visits.

## Structure

- `site/src/data/` — all content (experience, education, blog, projects)
- `site/public/docs/` — MCS portfolio PDF and Big Data certificate
- `site/src/demos/` — interactive mini apps

## Legacy

The old Create React App lives in `portfolio-react-app/` (deprecated).
