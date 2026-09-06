# Homepage Section Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the homepage into a one-viewport island hero, a continuous-sky intro block (credentials → bio → technical focus), then featured projects on moving clouds, with Explore and tech-chips removed.

**Architecture:** Split the homepage into two stages: a `sky-stage` that owns one continuous sky backdrop behind the hero + intro, and a `clouds-stage` for featured projects. Keep content in existing `profile` / `projects` data; change only `HomePage.tsx`, `HomePage.css`, and a thin `WorldStage` refactor so the sky is not trapped inside the hero section.

**Tech Stack:** React 18, TypeScript, Vite 5, existing CSS custom properties, Vitest (structure helper only; layout verified visually)

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-05-homepage-section-reorder-design.md`
- Modify only `portfolio-directions/site/` (and this plan/spec under `docs/`); do not touch `portfolio-react-app/`.
- Credential panels stay non-clickable.
- ASU logo appears exactly once, on the credentials row.
- Viewport 2 may grow taller than one screen.
- Do not deploy. Do not commit unless the user explicitly asks.
- Preserve dusk theme sky behavior on the sky stage.

## File map

| File | Responsibility |
| --- | --- |
| `site/src/pages/homeStructure.ts` | Pure section-order constant for a cheap regression test |
| `site/src/pages/homeStructure.test.ts` | Asserts homepage section order |
| `site/src/components/WorldStage.tsx` | Sky backdrop + fireflies/stars/aurora; no longer owns hero height alone |
| `site/src/pages/HomePage.tsx` | Section markup and order |
| `site/src/pages/HomePage.css` | Stage heights, continuous sky, intro rows, clouds featured, removals |

---

### Task 1: Lock section order with a pure helper + test

**Files:**
- Create: `site/src/pages/homeStructure.ts`
- Create: `site/src/pages/homeStructure.test.ts`

**Interfaces:**
- Produces: `export const HOME_SECTIONS = ['island', 'credentials', 'intro', 'technical-focus', 'featured'] as const`
- Produces: `export type HomeSectionId = (typeof HOME_SECTIONS)[number]`

- [ ] **Step 1: Write the failing test**

Create `site/src/pages/homeStructure.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { HOME_SECTIONS } from './homeStructure';

describe('HOME_SECTIONS', () => {
  it('lists homepage sections in scroll order', () => {
    expect([...HOME_SECTIONS]).toEqual([
      'island',
      'credentials',
      'intro',
      'technical-focus',
      'featured',
    ]);
  });

  it('does not include explore or tech-chips', () => {
    expect(HOME_SECTIONS).not.toContain('explore');
    expect(HOME_SECTIONS).not.toContain('tech-chips');
  });
});
```

- [ ] **Step 2: Run test and verify RED**

Run from `site/`:

```bash
npm test -- src/pages/homeStructure.test.ts
```

Expected: FAIL — `Cannot find module './homeStructure'` (or similar).

- [ ] **Step 3: Implement the helper**

Create `site/src/pages/homeStructure.ts`:

```ts
export const HOME_SECTIONS = [
  'island',
  'credentials',
  'intro',
  'technical-focus',
  'featured',
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];
```

- [ ] **Step 4: Run test and verify GREEN**

```bash
npm test -- src/pages/homeStructure.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit (only if user asked)**

Skip unless the user explicitly requested a commit.

---

### Task 2: Refactor WorldStage so sky can span hero + intro

**Files:**
- Modify: `site/src/components/WorldStage.tsx`
- Modify: `site/src/pages/HomePage.css` (sky-stage / world height only in this task)

**Interfaces:**
- Consumes: existing `WorldFlock`, sky image paths
- Produces: `WorldStage({ children }: { children: ReactNode })` renders a `.sky-stage` wrapper with absolute sky layers + flock, and `{children}` for hero + intro siblings

- [ ] **Step 1: Update WorldStage markup**

Replace `site/src/components/WorldStage.tsx` contents with:

```tsx
import type { ReactNode } from 'react';
import { WorldFlock } from './WorldFlock';

export function WorldStage({ children }: { children: ReactNode }) {
  return (
    <div className="sky-stage">
      <img
        className="world-sky world-sky-day"
        src={`${import.meta.env.BASE_URL}images/world-sky.jpg`}
        alt=""
      />
      <img
        className="world-sky world-sky-dusk"
        src={`${import.meta.env.BASE_URL}images/world-sky-dusk.jpg`}
        alt=""
      />
      <div className="world-stars" aria-hidden />
      <div className="world-aurora" aria-hidden />
      <div className="world-glow" aria-hidden />
      <div className="world-fireflies" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="world-firefly" />
        ))}
      </div>
      <WorldFlock />
      {children}
    </div>
  );
}
```

Notes:
- Remove the inner `<section className="world">` and `.world-fade` from this component — HomePage will own the hero `<section className="world">`.
- Sky layers stay `position: absolute; inset: 0` relative to `.sky-stage`.

- [ ] **Step 2: Add `.sky-stage` and fix `.world` height in CSS**

In `site/src/pages/HomePage.css`, at the top (replace the current `.home-world` / `.world` block):

```css
.home-world {
  position: relative;
}

.sky-stage {
  position: relative;
  overflow: hidden;
  background: #c9dbe8;
}

.world {
  position: relative;
  z-index: 1;
  height: 100vh;
  height: 100dvh;
  min-height: 100svh;
  overflow: hidden;
  /* no solid fill — sky-stage supplies the background */
  background: transparent;
}
```

Delete `--lands-overlap` from `.home-world` and any `height: calc(100vh + var(--lands-overlap))` / `100dvh` / `100svh` variants on `.world`.

Keep existing `.world-sky { position: absolute; inset: 0; ... }` rules — they now paint relative to `.sky-stage`.

Ensure dusk theme selectors that target `.world` background (if any) still work; `html[data-theme='c'] .world` rules that hide day sky / show dusk sky continue to use `.world-sky-*` class names on the images inside `.sky-stage`.

- [ ] **Step 3: Temporarily keep HomePage compiling**

In `HomePage.tsx`, wrap the current hero-only children so structure is:

```tsx
<WorldStage>
  <section className="world" aria-label="Title scene">
    {/* existing kicker, title, island, menu */}
  </section>
</WorldStage>
```

Do not move intro yet (that is Task 3). Dev server should still render.

- [ ] **Step 4: Visual verify hero height**

With Vite on `http://127.0.0.1:5173/`:

- First fold shows island + name + three buttons fully (no clipping).
- No intro content peeking into the first viewport.

- [ ] **Step 5: Commit (only if user asked)**

Skip unless requested.

---

### Task 3: Rebuild HomePage section order (sky intro + clouds featured)

**Files:**
- Modify: `site/src/pages/HomePage.tsx`
- Modify: `site/src/pages/homeStructure.ts` (import into page for documentation only — optional `void HOME_SECTIONS` not required; prefer importing and mapping `data-section` attributes)

**Interfaces:**
- Consumes: `HOME_SECTIONS`, `profile`, `projects`, `BioSummary`, `SocialLinks`, `AsuLogo`, `WorldStage`, `ProjectVisual`, `projectIcon`, `projectHref`
- Produces: DOM order matching `HOME_SECTIONS`

- [ ] **Step 1: Rewrite HomePage.tsx**

Replace `site/src/pages/HomePage.tsx` with:

```tsx
import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FiCode,
  FiCpu,
  FiDatabase,
  FiShield,
} from 'react-icons/fi';
import { profile } from '../data/profile';
import { projectHref, projects } from '../data/projects';
import { BioSummary } from '../components/BioSummary';
import { SocialLinks } from '../components/SocialLinks';
import { AsuLogo } from '../components/AsuLogo';
import { ProjectVisual, projectIcon } from '../components/ProjectVisual';
import { WorldStage } from '../components/WorldStage';
import { HOME_SECTIONS } from './homeStructure';
import './HomePage.css';

const skillIcons: Record<string, IconType> = {
  'Languages & Frameworks': FiCode,
  'AI & Development': FiCpu,
  'Data & ML': FiDatabase,
  'Security & CS': FiShield,
};

export function HomePage() {
  const featured = projects.slice(0, 3);
  const [firstName, ...restName] = profile.name.split(' ');
  const lastName = restName.join(' ');

  return (
    <div className="home-world">
      <WorldStage>
        <section
          className="world"
          aria-label="Title scene"
          data-section={HOME_SECTIONS[0]}
        >
          <p className="world-kicker">{profile.title}</p>
          <h1 className="world-title">
            <span className="world-first">{firstName}</span>
            <span className="world-last">{lastName}</span>
          </h1>
          <img
            className="world-island"
            src={`${import.meta.env.BASE_URL}images/world-island.webp`}
            alt=""
          />
          <nav className="world-menu" aria-label="Start">
            <Link to="/projects" className="btn btn-primary">View Projects</Link>
            <Link to="/experience" className="btn btn-ghost">Work</Link>
            <Link to="/demos" className="btn btn-ghost">Demos</Link>
          </nav>
        </section>

        <div className="sky-intro" data-section-group="intro">
          <section
            className="section intro-band"
            aria-label="Credentials and introduction"
          >
            <div className="container intro-stack">
              <div
                className="cred-row"
                data-section={HOME_SECTIONS[1]}
              >
                <div className="cred-asu">
                  <AsuLogo size="sm" />
                  <span>Arizona State University</span>
                </div>
                <div className="cred-panels" role="list">
                  {profile.credentials.map((cred) => (
                    <div key={cred.label} className="stat lands-plaque" role="listitem">
                      <strong>{cred.label}</strong>
                      <span>{cred.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="intro-bio lands-plaque"
                data-section={HOME_SECTIONS[2]}
              >
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="profile-photo"
                />
                <div>
                  <p className="hero-summary"><BioSummary /></p>
                  <SocialLinks />
                </div>
              </div>

              <section
                className="tech-focus"
                aria-labelledby="tech-focus-heading"
                data-section={HOME_SECTIONS[3]}
              >
                <p className="section-label">Skills</p>
                <h2 id="tech-focus-heading">Technical focus</h2>
                <div className="lands-skill-grid" aria-label="Technical focus">
                  {profile.skills.map(([category, items]) => {
                    const Icon = skillIcons[category];
                    return (
                      <article key={category} className="lands-skill">
                        <div className="skill-card-head">
                          {Icon && <span className="skill-icon"><Icon /></span>}
                          <h3>{category}</h3>
                        </div>
                        <ul>{items.map((s) => <li key={s}>{s}</li>)}</ul>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </div>
      </WorldStage>

      <div className="clouds-stage">
        <img
          className="lands-sky"
          src={`${import.meta.env.BASE_URL}images/world-cloudsea.jpg`}
          alt=""
        />
        <div className="lands-drift" aria-hidden />
        <div className="lands-motes" aria-hidden />

        <section
          className="section featured-band"
          aria-labelledby="featured-heading"
          data-section={HOME_SECTIONS[4]}
        >
          <div className="container lands-features-head">
            <p className="section-label">Selected work</p>
            <h2 id="featured-heading">Featured projects</h2>
          </div>
          <div className="lands-features">
            {featured.map((p, i) => {
              const Icon = projectIcon(p.id);
              return (
                <Link
                  key={p.id}
                  to={projectHref(p.id)}
                  className={`lands-feature${i % 2 ? ' is-flip' : ''}`}
                >
                  <div className="lands-feature-art">
                    <ProjectVisual project={p} Icon={Icon} />
                  </div>
                  <div className="lands-feature-copy">
                    <div>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
```

Explicit removals in this file:
- `explore` array and Explore section
- `techIcons` / tech-chips row
- `lands-islets` images
- `lands-vista` / `world-vista.jpg`
- duplicate ASU logo in the bio row

- [ ] **Step 2: Confirm TypeScript build**

```bash
npx tsc -b --pretty false
```

Expected: no errors related to HomePage / WorldStage.

- [ ] **Step 3: Commit (only if user asked)**

Skip unless requested.

---

### Task 4: CSS for sky intro rows + clouds featured + dead-rule cleanup

**Files:**
- Modify: `site/src/pages/HomePage.css`

**Interfaces:**
- Consumes: class names from Task 3 (`.sky-intro`, `.intro-stack`, `.cred-row`, `.cred-panels`, `.intro-bio`, `.tech-focus`, `.lands-skill-grid`, `.clouds-stage`, `.featured-band`)
- Produces: layout matching the spec

- [ ] **Step 1: Style continuous sky intro**

Add/replace rules (keep existing plaque / photo / skill / feature visual tokens where possible):

```css
.sky-intro {
  position: relative;
  z-index: 1;
  padding: 2rem 0 3rem;
}

.intro-stack {
  display: grid;
  gap: 1.75rem;
}

.cred-asu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 0 0.9rem;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.cred-panels {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 800px) {
  .cred-panels {
    grid-template-columns: repeat(3, 1fr);
  }
}

.cred-panels .stat {
  border-left: none;
  padding: 1.1rem 1.2rem;
  gap: 0.35rem;
}

.intro-bio {
  display: grid;
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 720px) {
  .intro-bio {
    grid-template-columns: auto 1fr;
  }
}

.lands-skill-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 800px) {
  .lands-skill-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .lands-skill-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.lands-skill {
  /* keep existing foam / blur / radius styles; remove flex: 0 0 river sizing if present */
  flex: initial;
  min-width: 0;
}
```

Remove `.intro-band { padding-top: var(--lands-overlap); }` (variable no longer exists).

- [ ] **Step 2: Style clouds stage (no vista, no islets)**

```css
.clouds-stage {
  position: relative;
  overflow: hidden;
  padding-bottom: 2rem;
}

.clouds-stage > :not(.lands-sky):not(.lands-drift):not(.lands-motes) {
  position: relative;
  z-index: 2;
}

.featured-band {
  padding-top: 2.5rem;
}

.lands-features-head {
  margin-bottom: 1.25rem;
}
```

Keep existing `.lands-sky`, `.lands-drift`, `.lands-motes`, `.lands-feature*` rules.

Delete unused rules for:
- `.lands` negative `margin-top` / `--lands-overlap` references
- `.lands-vista`, `.lands-vista-img`, `.lands-vista-copy`
- `.lands-islets` / `@keyframes islets-drift` (if unused)
- `.lands-explore`, `.lands-explore-card`
- `.tech-row`, `.tech-chip`, `.tech-chip-icon`
- `.intro-layout` three-column grid that included stats
- `.world-fade` (removed from markup)
- `.hero-asu` if unused (credentials use `.cred-asu`)

- [ ] **Step 3: Flock scoping check**

Open `site/src/components/WorldFlock.tsx`. Confirm it still finds `.world` via `canvas?.closest('.world')` (or update to `.sky-stage` if the flock canvas is a sibling of `.world`). Flock canvas is rendered inside `.sky-stage` as a sibling of `.world` — if `closest('.world')` fails, change the lookup to `closest('.sky-stage')` and size against that box (or against `.world` via `document.querySelector('.world')` inside the stage). Prefer:

```ts
const stage = canvas?.closest('.sky-stage');
const world = stage?.querySelector('.world') ?? canvas?.closest('.world');
```

Use `world` for hero-bounded flock math if that was the previous behavior.

- [ ] **Step 4: Dusk theme selectors**

Keep `html[data-theme='c'] .world-sky-day`, `.world-island`, fireflies, etc. Ensure they still match (classes unchanged). If any rule targeted `.world` for background color that now fights transparency, remove that solid background under theme `c`.

- [ ] **Step 5: Visual verification checklist**

At `http://127.0.0.1:5173/`:

1. V1: full-viewport island; menu buttons fully visible; no intro peek.
2. Scroll: same sky behind credentials (ASU once) → photo/bio/socials → four technical panels.
3. Further scroll: cloudsea + drift behind Featured heading (no vista photo) + project cards.
4. No Explore section; no tech-chips.
5. Toggle dusk theme: sky stage still correct; island hidden per existing dusk rules.
6. Narrow viewport: credentials stack; bio stacks; skills stack; buttons still fully visible in V1.

- [ ] **Step 6: Run unit tests**

```bash
npm test
```

Expected: existing demos tests + `homeStructure` tests PASS.

- [ ] **Step 7: Commit (only if user asked)**

Skip unless requested.

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Island = exact one viewport; menu visible | Task 2 |
| Continuous sky V1+V2 | Tasks 2–3 |
| Credentials row, non-clickable, ASU once | Task 3–4 |
| Photo + bio + socials | Task 3 |
| Technical focus 4 panels | Task 3–4 |
| Featured on clouds; keep heading; drop vista | Task 3–4 |
| Remove Explore + tech-chips | Task 3–4 |
| Footer unchanged | Layout (no change) |
| V2 may grow | Task 4 (content-sized `.sky-intro`) |
| No `--lands-overlap` peek | Task 2 |

No TBD/placeholder steps remain. Class names are consistent across Tasks 3–4.
