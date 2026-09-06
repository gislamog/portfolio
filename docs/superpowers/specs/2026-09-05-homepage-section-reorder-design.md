# Homepage Section Reorder Design

**Date:** 2026-09-05  
**Status:** Approved approach in conversation; awaiting user review of this spec  
**Scope:** Homepage layout and section order in `portfolio-directions/site/` (island hero + lands content)

## Goal

Make the island hero exactly one viewport tall (menu fully visible, no overlap into intro), then present a clearer homepage stack: continuous sky intro block, then featured projects on moving clouds, then footer. Remove Explore and tech-chips.

## Approach

Two stacked stages on the existing homepage (Approach A). Reuse existing data (`profile.credentials`, `profile.skills`, featured projects) and visual language (plaques, skill panels, feature cards). No new routes or data model.

## Page structure

### Viewport 1 — Island hero (exact one screen)

- Background: day/dusk sky (`world-sky` / theme variants), unchanged island art, name, kicker, flock/effects as today.
- Height: exactly `100dvh` / `100svh` (remove `--lands-overlap` extra height so intro no longer peeks into the first fold).
- Content: floating island, **GULSUM ISLAMOGLU**, three buttons — View Projects, Work, Demos.
- `.world-menu` stays fully inside the viewport (fixes cut-off buttons).

### Viewport 2+ — Intro band (same continuous sky; may grow taller than one screen)

Sky background from Viewport 1 **extends** behind this block (one shared sky layer / continuous stage — not a second lands sky image).

Three rows, top to bottom:

1. **Credentials** — three non-clickable horizontal panels from `profile.credentials` (M.S., B.S., Graduate Certificate). Place the **single ASU logo** once here (above or integrated with this row), not again in the bio row.
2. **Intro** — profile photo + bio (`BioSummary`) + `SocialLinks`. No tech-chips. No duplicate ASU logo.
3. **Technical focus** — existing four skill panels (`profile.skills`).

### Featured projects (after intro; new background)

- Background: current moving-clouds treatment used under today’s Technical Focus / lands content (`lands-sky` cloudsea + drift/motes as appropriate). **Drop** the vista photo behind “Selected work / Featured projects”.
- Keep text heading: “Selected work” / “Featured projects”.
- Keep existing featured project cards (first three projects).

### Footer

- Unchanged site footer from `Layout`.

## Removals

- Entire **Explore / On this site** section.
- **Tech-chips** row (`profile.tech` chips on homepage only; data may remain for elsewhere).
- `--lands-overlap` height hack on `.world` (and related pull-up that caused intro peek / menu clip).
- `lands-vista` background image behind the Featured heading.

## Layout / CSS notes

- Prefer one continuous sky stage wrapping hero + intro; switch to clouds stage for Featured (+ remainder until footer).
- Sky stage: no lands cloudsea, no floating islets, no motes — only the world sky continuing behind intro content.
- Clouds stage: reuse the moving cloudsea + drift (and optional motes) from today’s lands / Technical Focus area; no vista still image.
- Preserve dusk theme behavior on the sky stage where it already applies.
- Mobile: credential panels and skill panels stack; intro photo/bio stacks; featured cards keep current responsive behavior.
- Do not introduce card chrome beyond what already exists for plaques/skills/features unless needed for the credential row layout.

## Out of scope

- Education / MCS / Big Data page changes
- Making credential panels links
- Footer redesign
- Deploy / GitHub Pages publish
- Legacy `portfolio-react-app/` tree
- Changing featured project selection logic beyond current `projects.slice(0, 3)`

## Verification

- First fold: island + name + three buttons fully visible; no intro content peeking; no menu clipping.
- Scroll: continuous sky behind credentials → photo/bio/socials → Technical Focus.
- After intro: clouds background; Featured heading (no vista image) + project cards; then footer.
- Explore section and tech-chips absent.
- ASU logo appears exactly once (with credentials).
- Day and dusk themes still render the sky stage correctly.
- Mobile: rows stack without overflow or cut-off CTAs.

## Decisions locked

| Topic | Decision |
| --- | --- |
| Viewport 2 height | May grow taller than one screen |
| V1/V2 background | Same continuous sky image |
| Credential panels | Non-clickable |
| Featured vista image | Dropped |
| Featured text heading | Kept |
| ASU logo | Once only; with credentials row |
| Explore / tech-chips | Removed |
| Architecture | Two stacked stages (Approach A) |
