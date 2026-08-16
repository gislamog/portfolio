# Portfolio UI Polish Design

**Date:** 2026-08-15  
**Status:** Approved in conversation; pending implementation plan  
**Scope:** Targeted content, layout, demo UX, and light-theme contrast fixes in `site/`

## Goal

Polish the portfolio for recruiter review: clearer project presentation, accurate project imagery, cleaner demos and contact page, and readable light themes.

## Approach

Targeted edits to existing Vite + React components and CSS. No architecture rewrite. Reuse existing `Project.image` / `ProjectVisual`, demo CSS patterns, and theme CSS variables.

## Changes

### 1. Skills — Joomla

Add `Joomla` to `profile.skills` under **Languages & Frameworks** (and optionally `profile.tech` if it appears on the home surface).

### 2. Projects — full-width stacked cards + images

- Change `.projects-grid` to a single column so each project occupies a full row.
- Prefer a horizontal card layout on wide viewports (visual left / body right) so full-width cards do not feel sparse; stack visually on small screens.
- Copy the three user-supplied images into `site/public/images/projects/` and wire:
  - Analytics Visualizations ? `analytics-viz`
  - Neural Network Collision Prediction ? `mcs-collision`
  - K-Means Clustering Strategy ? `mcs-kmeans`
- Set `image` on those `projects.ts` entries so `ProjectVisual` renders photos instead of icon fallbacks.

### 3. Demos page — indent under headings

Indent each demo body (the interactive `Demo` component) relative to the heading block (e.g. left padding / margin aligned under the title text, past the heading icon).

### 4. Robot Collision Predictor

**Behavior (current):** Samples are stored in memory (`samplesRef`), capped at **800**. The UI shows only the last **12** rows. Training uses the full in-memory pool. Nothing is persisted across refresh.

**UI changes:**

- Keep storing up to 800 samples; continue showing a short recent slice only.
- When more samples exist than are shown, append an ellipsis row/indicator (e.g. `…`) so truncation is obvious.
- Remove the scrollbar from the samples table (no `overflow: auto` / fixed max-height scroll region).
- Make `.demo-test-result` full width of the robot lab layout.
- Remove the robot demo’s `.demo-note` paragraph.

### 5. Ants on a Sphere

- Expose input fields for **random step size** and **movement speed** (user-selected: step size + speed).
- Wire those values into the ant step logic (replace hard-coded random walk magnitude / boost).
- Rename **GOD** ? **SEED**; keep spawn-on-press / hold-to-boost behavior.
- Shrink the SEED button (smaller width, height, and font than the current large GOD control).
- Update Demos page copy that still says “GOD”.

### 6. Contact page

Remove the redundant `SocialLinks` icon row above the contact cards. Keep the larger contact cards (email, phone, LinkedIn, GitHub, Handshake, location).

### 7. Themes C and D contrast

For **Paper light** (`c`) and **Sky light** (`d`):

- Differentiate `--bg` from `--bg-card` / `--bg-elevated` (tint page background; keep cards lighter or slightly elevated with stronger borders/shadow).
- Increase border visibility so cards are not white-on-white.
- Preserve existing accent colors; do not redesign dark themes A/B/E.

## Out of scope

- Deploy / GitHub Pages publish (unless requested separately)
- Persisting robot samples to disk or localStorage
- Rewriting ML or Three.js demos beyond the controls/display changes above
- Changes to the legacy `portfolio-react-app/` tree

## Verification

- Visual check: Projects (stacked + images), Demos (indent, robot table/ellipsis/full-width result, ants controls + SEED), Contact (no duplicate icons), themes C and D (card vs page contrast)
- Confirm robot sample count still climbs past the visible row count and training still uses the full pool
- Confirm ants respond to step size and speed inputs
- Mobile: stacked projects and demos remain usable

## Files likely touched

- `site/src/data/profile.ts`
- `site/src/data/projects.ts`
- `site/src/pages/ProjectsPage.css` (+ possibly `ProjectsPage.tsx`)
- `site/src/pages/DemosPage.tsx` / `site/src/demos/Demos.css` / `site/src/index.css`
- `site/src/demos/RobotMLDemo.tsx`
- `site/src/demos/AntsOnSphereDemo.tsx`
- `site/src/pages/ContactPage.tsx`
- `site/public/images/projects/*` (new image assets)
