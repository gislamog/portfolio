# Portfolio requirements ù MCS Demos inventory

Inventory of Arizona State University MCS coursework against the Demos page. This file is the requirements source for what is live, in progress, a future candidate, or out of scope. Setup and deploy notes stay in [README.md](README.md).

Local Demos URL: `http://localhost:3002/demos`

## Visitor analytics

- **Chosen:** Cloudflare Web Analytics (free, privacy-first, no cookies, no names).
- **How:** JS beacon in production when `VITE_CF_ANALYTICS_TOKEN` is set at build time. See [README.md](README.md#analytics-cloudflare-free).
- **Not in scope here:** UTM resume links; identified visitors (contact form).

## Status legend

- **LIVE** ù already on the Demos page from before the MCS demo batch (present on the last GitHub Pages deploy).
- **IN PROGRESS** ù implemented locally; not pushed to `gislamog/mcs-projects` and not deployed.
- **CANDIDATE** ù coursework that could become a demo after an original rewrite (no instructor starter code, no private/course databases, no exploit PoCs).
- **SKIP** ù poor fit, academic-integrity risk, active-course solutions, or offensive security.

## Publish rules

- Rewrite for the browser in TypeScript. Do not dump Coursera/ASU starter files, autograder blobs, or copyrighted lab scaffolds.
- Do not publish exams, cheat sheets, `GITHUB PLAN.txt` secrets, patient CSVs, the Dino Fun World course DB, or exploit/fuzzer payloads.
- Any demo that has a GitHub folder must link to **the course** (`/education#course-cse-ù`) **and** GitHub.
- CSE 543 solutions stay private while the course is in progress (Summer 2026). Offensive labs from CSE 543 / CSE 545 stay off the site even after grades post.

## Current Demos page snapshot

Source: `site/src/pages/DemosPage.tsx`.

| Hash | Title | Course | Status |
| --- | --- | --- | --- |
| `#robot-ml` | Robot Collision Predictor | CSE 571 | LIVE |
| `#kmeans` | K-Means vs K-Means++ | CSE 575 | IN PROGRESS |
| `#crypto` | Cryptography Playground | CSE 539 | IN PROGRESS |
| `#adult-income` | Adult Income Explorer | CSE 578 | IN PROGRESS |
| `#mnist` | Draw-a-Digit | CSE 575 | IN PROGRESS |
| `#stable-matching` | Stable Matching | CSE 551 | IN PROGRESS |
| `#lexer` | Mini Lexer | CSE 340 | IN PROGRESS |
| `#glucose` | Synthetic CGM Series | CSE 572 | IN PROGRESS |
| `#sierpinski` | Sierpinski's Triangle | ù | LIVE (not MCS) |
| `#ants-sphere` | Ants on a Sphere | ù | LIVE (not MCS; thematically near CSE 568) |

## Per-course inventory

### CSE 340 ù Principles of Programming Languages (Fall 2024)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Project 1 lexer | Mini Lexer (original TypeScript; not course `lexer.cc`, which is marked do-not-share) | IN PROGRESS (`#lexer`) |
| Projects 2ù3 (syntax / types; Assignment 2, Assignment 3) | Parse-tree or FIRST/FOLLOW visualizer with an original grammar | CANDIDATE |
| Quizzes / exams | ù | SKIP |

### CSE 575 ù Statistical Machine Learning (Fall 2024)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| K-Means Strategy (MCS Portfolio Project #1) | Random vs max-average-distance K-Means++, SSE, elbow chart | IN PROGRESS (`#kmeans`) |
| Classification using neural networks / MNIST | Draw-a-Digit 8ù8 templates (browser stand-in) | IN PROGRESS (`#mnist`) |
| Real in-browser CNN on MNIST | TensorFlow.js / embedded weights | CANDIDATE (later upgrade of `#mnist`) |
| Density Estimation and Classification (gene data) | 2D Gaussians / decision regions on synthetic or public gene-style points; do not publish `geneNewData.py` scaffolds | CANDIDATE |

### CSE 571 ù Artificial Intelligence (Fall 2024)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Neural Network for Collision Prediction (MCS Portfolio Project #2, parts 1ù4) | Walled arena, sensors, on-page training | LIVE (`#robot-ml`) |
| Manual drive mode ("You drive") | Player steers with WASD/arrows while the trained model scores live collision risk; crash respawns at center | IN PROGRESS (`#robot-ml`) |
| Loss-curve / confusion overlay on the same robot demo | Small enhancement of `#robot-ml` | CANDIDATE |

### CSE 578 ù Data Visualization (Spring 2025)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Income-Driven Marketing (Adult schema) | Filterable education / occupation / hours vs >50K share | IN PROGRESS (`#adult-income`) |
| Dino Fun World (graphing, analysis, time series, geographic, hierarchical clustering) | Theme-park dashboards **only** with synthetic park data | CANDIDATE |
| Dino Fun World course DB (`/course/data/CSE-578/dinofunworld.db`) | ù | SKIP as-is |

### CSE 572 ù Data Mining (Spring 2025)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Extracting time-series properties of glucose (Artificial Pancreas) | Synthetic CGM, meals, time-in-range; no original patient files | IN PROGRESS (`#glucose`) |
| Machine Model Training (meal vs no-meal) | Classify synthetic meal windows | CANDIDATE |
| Cluster Validation (`MealData.csv`) | Regenerated synthetic clusters | CANDIDATE |
| Publishing original `MealData.csv` / CGM / insulin CSVs if patient-derived | ù | SKIP |

### CSE 548 ù Advanced Computer Network Security (Summer 2025)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Packet filter, SDN stateless firewall, DoS labs | Interactive attack/lab demos | SKIP |
| Architecture notes (stateless vs SDN flows) | GitHub `sdn-firewall-notes` only, not a Demo | SKIP for Demos |
| ML-based anomaly detection writeup | Toy traffic scores / ROC on synthetic flows, defensive framing | CANDIDATE |

### CSE 551 ù Foundations of Algorithms (Fall 2025)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Module 1 stable matching (GaleùShapley) | Residents / hospitals step-through | IN PROGRESS (`#stable-matching`) |
| Module 2 Union-Find clustering | Interactive union steps on a small graph | CANDIDATE |
| Modules 3ù4 brute force / divide-and-conquer / Kadane | Array highlight + running maximum | CANDIDATE |
| Module 6 edit distance DP | Alignment grid (`professor` / `confession` style) | CANDIDATE |
| Module 7 bipartite matching | Engineerùproject matching; optional merge with `#stable-matching` | CANDIDATE |
| Module 8 complexity writeup | Not interactive | SKIP |

### CSE 568 ù Biocomputing (Fall 2025)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Course folders (readings: GAs, AIS, ACO, swarm robotics) | No substantial coding assignments on disk | ù |
| Ants on a Sphere | Swarm visualization; not a graded assignment | LIVE (`#ants-sphere`) |
| Genetic-algorithm TSP or ACO on a small graph | Original implementation | CANDIDATE |

### CSE 545 ù Software Security (Spring 2026)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| PWN / web exploit labs | ù | SKIP (no PoCs on the site) |

### CSE 539 ù Applied Cryptography (Spring 2026)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Hash + birthday attack, RSA, LSB steganography | Small-prime RSA, truncated-hash collisions, LSB hide/reveal | IN PROGRESS (`#crypto`) |
| DiffieùHellman + 256-bit encryption | Small-prime DH key-agreement animation; no autograder blobs | CANDIDATE |
| RNG cryptanalysis (stego project part 2) | Weak-PRNG teaching toy only | CANDIDATE |

### CSE 543 ù Information Assurance and Security (Summer 2026, current)

| Assignment | Demo potential | Status |
| --- | --- | --- |
| Caesar / Esper ciphers | Classic crypto after the course ends | CANDIDATE after term |
| Fuzz Them All / PWN Them All / FindingCrashes | Public demos | SKIP now and later |

## Cluster Clock

Personal Expo/React Native project. Out of scope for this MCS Demos inventory until that app is complete.
