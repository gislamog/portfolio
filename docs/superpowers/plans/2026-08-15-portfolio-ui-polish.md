# Portfolio UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the portfolio’s project, demo, contact, skill, and light-theme presentation while preserving the existing Vite + React architecture.

**Architecture:** Keep content in the existing typed data modules, presentation in page/demo components, and responsive styling in existing CSS files. Extract only two pure demo helpers—recent-row selection and random-walk delta—so the new behavior can be tested without mounting Canvas/WebGL.

**Tech Stack:** React 18, TypeScript, Vite 5, Three.js, CSS custom properties, Vitest

## Global Constraints

- Modify only `site/`; do not touch the legacy `portfolio-react-app/`.
- Keep robot samples in memory, capped at 800, and do not add persistence.
- Preserve dark themes A, B, and E.
- Preserve mobile usability.
- Do not deploy or commit implementation changes unless the user explicitly requests it.

---

### Task 1: Add focused test support and demo helpers

**Files:**
- Modify: `site/package.json`
- Modify: `site/package-lock.json`
- Create: `site/src/demos/demoUtils.ts`
- Create: `site/src/demos/demoUtils.test.ts`

**Interfaces:**
- Produces: `recentRows<T>(rows: T[], limit: number): { rows: T[]; truncated: boolean }`
- Produces: `randomWalkDelta(randomValue: number, stepSize: number, speed: number): number`

- [ ] **Step 1: Install Vitest**

Run from `site/`:

```bash
npm install --save-dev vitest
```

Add:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write failing helper tests**

Create `src/demos/demoUtils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { randomWalkDelta, recentRows } from './demoUtils';

describe('recentRows', () => {
  it('returns newest rows first and reports truncation', () => {
    expect(recentRows([1, 2, 3, 4], 2)).toEqual({
      rows: [4, 3],
      truncated: true,
    });
  });

  it('does not report truncation when all rows fit', () => {
    expect(recentRows([1, 2], 12)).toEqual({
      rows: [2, 1],
      truncated: false,
    });
  });
});

describe('randomWalkDelta', () => {
  it('scales the random step by step size and speed', () => {
    expect(randomWalkDelta(0.5, 0.03, 2)).toBeCloseTo(0.03);
  });
});
```

- [ ] **Step 3: Run tests and verify RED**

Run:

```bash
npm test
```

Expected: FAIL because `demoUtils` does not exist.

- [ ] **Step 4: Implement the pure helpers**

Create `src/demos/demoUtils.ts`:

```ts
export function recentRows<T>(rows: T[], limit: number) {
  return {
    rows: rows.slice(-limit).reverse(),
    truncated: rows.length > limit,
  };
}

export function randomWalkDelta(
  randomValue: number,
  stepSize: number,
  speed: number,
) {
  return randomValue * stepSize * speed;
}
```

- [ ] **Step 5: Run tests and verify GREEN**

Run:

```bash
npm test
```

Expected: all helper tests pass.

---

### Task 2: Add Joomla, project images, and stacked project layout

**Files:**
- Modify: `site/src/data/profile.ts`
- Modify: `site/src/data/projects.ts`
- Modify: `site/src/pages/ProjectsPage.css`
- Copy: Cursor analytics image ? `site/public/images/projects/analytics-visualizations.png`
- Copy: Cursor robot image ? `site/public/images/projects/neural-network-collision.png`
- Copy: Cursor K-Means image ? `site/public/images/projects/kmeans-clustering.png`

**Interfaces:**
- Consumes: existing `img(path)` and `Project.image`
- Produces: three project image URLs rendered by `ProjectVisual`

- [ ] **Step 1: Copy the supplied image assets**

Copy the three exact user attachments into the names above. Verify all three files exist under `site/public/images/projects/`.

- [ ] **Step 2: Add Joomla and image mappings**

In `profile.skills`, change the first group to include Joomla:

```ts
['Languages & Frameworks', ['JavaScript', 'Python', 'React', 'Nuxt / Vue', 'Joomla', 'Playwright']]
```

In `projects.ts`, add:

```ts
image: img('projects/analytics-visualizations.png'),
```

to `analytics-viz`; add:

```ts
image: img('projects/neural-network-collision.png'),
```

to `mcs-collision`; and add:

```ts
image: img('projects/kmeans-clustering.png'),
```

to `mcs-kmeans`.

- [ ] **Step 3: Make project cards full-row**

Replace the multi-column grid with one column and make cards horizontal on desktop:

```css
.projects-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1fr);
}

.project-card {
  display: grid;
  grid-template-columns: minmax(280px, 40%) minmax(0, 1fr);
}

.project-card .project-visual {
  height: 100%;
  min-height: 260px;
}

@media (max-width: 760px) {
  .project-card { grid-template-columns: 1fr; }
  .project-card .project-visual { min-height: 190px; }
}
```

Retain existing body padding, heading, list, and action styles.

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

---

### Task 3: Clarify robot sample truncation and result layout

**Files:**
- Modify: `site/src/demos/RobotMLDemo.tsx`
- Modify: `site/src/demos/Demos.css`
- Test: `site/src/demos/demoUtils.test.ts`

**Interfaces:**
- Consumes: `recentRows(samplesRef.current, 12)`
- Preserves: maximum 800 in-memory samples and full-pool training

- [ ] **Step 1: Extend the failing recent-row test for empty data**

Add:

```ts
it('returns an empty non-truncated view for no samples', () => {
  expect(recentRows([], 12)).toEqual({ rows: [], truncated: false });
});
```

Run `npm test`; expected PASS because the helper already satisfies the boundary behavior.

- [ ] **Step 2: Use the helper and track truncation**

In `RobotMLDemo.tsx`, import `recentRows`, add:

```ts
const [rowsTruncated, setRowsTruncated] = useState(false);
```

Replace both recent-row updates with:

```ts
const visible = recentRows(samplesRef.current, 12);
setRows(visible.rows);
setRowsTruncated(visible.truncated);
```

Reset `rowsTruncated` to `false` in Reset.

- [ ] **Step 3: Add an ellipsis row**

After mapped data rows, render:

```tsx
{rowsTruncated && (
  <tr className="csv-ellipsis">
    <td colSpan={7} aria-label="Earlier samples omitted">…</td>
  </tr>
)}
```

Delete the bottom robot `<p className="demo-note">`.

- [ ] **Step 4: Remove scrolling and span results**

Update CSS:

```css
.csv-table-wrap { overflow: visible; }
.csv-ellipsis td { text-align: center; letter-spacing: 0.25em; }
.demo-test-result { width: 100%; }

@media (min-width: 900px) {
  .robot-lab .demo-test-result { grid-column: 1 / -1; }
}
```

Move the result paragraph outside `.robot-lab-main` if required for it to become a direct grid child spanning both columns.

- [ ] **Step 5: Verify**

Run:

```bash
npm test
npm run build
```

Expected: tests and build pass.

---

### Task 4: Add ant random-walk controls and rename SEED

**Files:**
- Modify: `site/src/demos/AntsOnSphereDemo.tsx`
- Modify: `site/src/demos/Demos.css`
- Modify: `site/src/pages/DemosPage.tsx`
- Test: `site/src/demos/demoUtils.test.ts`

**Interfaces:**
- Consumes: `randomWalkDelta(randomValue, stepSize, speed)`
- Adds UI state: `stepSize` and `speed`

- [ ] **Step 1: Add bounds tests**

Add tests that establish representative control values:

```ts
it('allows a paused speed of zero', () => {
  expect(randomWalkDelta(0.75, 0.03, 0)).toBe(0);
});

it('preserves the current default magnitude at step 0.03 and speed 1', () => {
  expect(randomWalkDelta(1, 0.03, 1)).toBeCloseTo(0.03);
});
```

Run `npm test`; expected PASS for the pure formula.

- [ ] **Step 2: Add controlled input state**

In `AntsOnSphereDemo`, add numeric state with defaults:

```ts
const [stepSize, setStepSize] = useState(0.03);
const [speed, setSpeed] = useState(1);
const stepSizeRef = useRef(stepSize);
const speedRef = useRef(speed);
```

Synchronize refs during render/effects so the animation loop uses current values without rebuilding Three.js.

- [ ] **Step 3: Wire movement to the controls**

Change `stepAnt` to accept step size and speed, using:

```ts
ant.u += randomWalkDelta(Math.random(), stepSize, speed) * boost;
ant.v += randomWalkDelta(Math.random(), stepSize, speed) * boost;
```

Call it with current refs in the animation loop. Preserve the initial placement call with a zero multiplier.

- [ ] **Step 4: Render inputs and SEED control**

Above or below the stage, render:

```tsx
<div className="demo-controls demo-fields ants-controls">
  <label>
    Random step size
    <input type="number" min="0" max="0.12" step="0.005" value={stepSize}
      onChange={(event) => setStepSize(Number(event.target.value))} />
  </label>
  <label>
    Movement speed
    <input type="number" min="0" max="4" step="0.25" value={speed}
      onChange={(event) => setSpeed(Number(event.target.value))} />
  </label>
</div>
```

Rename the button text and accessible label from `GOD` to `SEED`; rename `.god-butt` to `.seed-button`.

- [ ] **Step 5: Shrink the button and update copy**

Use approximately:

```css
.seed-button {
  width: 112px;
  height: 44px;
  font-size: 1rem;
}
```

Update both the demo description and note to say “SEED”.

- [ ] **Step 6: Verify**

Run:

```bash
npm test
npm run build
```

Expected: tests and build pass.

---

### Task 5: Clean contact page, indent demos, and improve light-theme contrast

**Files:**
- Modify: `site/src/pages/ContactPage.tsx`
- Modify: `site/src/demos/Demos.css`
- Modify: `site/src/index.css`

- [ ] **Step 1: Remove duplicate small contact links**

Delete the `SocialLinks` import and the wrapper that renders `<SocialLinks />` from `ContactPage.tsx`. Keep all contact cards unchanged.

- [ ] **Step 2: Indent demo content**

Add a stable hook to each rendered demo body:

```tsx
<div className="demo-body">
  <Demo />
</div>
```

Then style:

```css
.demo-body { margin-left: 3.7rem; }
@media (max-width: 640px) {
  .demo-body { margin-left: 0; }
}
```

Ensure nested `.demo-wrap` does not add conflicting horizontal margins.

- [ ] **Step 3: Strengthen themes C and D**

Update theme C to a more visible warm page tint and border:

```css
--bg: #e7e3d9;
--bg-elevated: #f8f6f0;
--bg-card: #ffffff;
--border: rgba(29, 39, 51, 0.22);
```

Update theme D similarly:

```css
--bg: #dcebf7;
--bg-elevated: #f4f9fd;
--bg-card: #ffffff;
--border: rgba(21, 55, 95, 0.22);
```

Add subtle theme-specific card shadows:

```css
[data-theme='c'] .card,
[data-theme='d'] .card {
  box-shadow: 0 6px 18px rgba(30, 55, 80, 0.09);
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: build passes without TypeScript errors.

---

### Task 6: Browser verification and cleanup

**Files:**
- Inspect all modified `site/` files

- [ ] **Step 1: Run all automated checks**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 2: Start the local server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:3002/portfolio/`.

- [ ] **Step 3: Verify Projects**

Confirm every project is one full row; the three supplied images map to Analytics, Collision, and K-Means; cards stack on mobile.

- [ ] **Step 4: Verify Demos**

Confirm demo bodies are indented on desktop. Collect more than 12 robot samples; verify only recent rows plus `…` are shown, there is no table scrollbar, and model training uses the full sample count. Verify results span full width and the note is absent.

- [ ] **Step 5: Verify Ants**

Confirm step-size and speed fields alter movement, zero speed pauses walkers, SEED adds walkers, and the smaller button is usable on desktop/mobile.

- [ ] **Step 6: Verify Contact and themes**

Confirm Contact has only the larger cards. Switch to Paper Light and Sky Light and verify page/card separation and readable borders throughout.

- [ ] **Step 7: Check diagnostics**

Run IDE lint diagnostics on all modified files and resolve any new errors. Review `git diff -- site docs/superpowers/plans/2026-08-15-portfolio-ui-polish.md` to ensure no legacy-app or unrelated changes were introduced.
