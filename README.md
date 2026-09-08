# Pavan Konam — AI engineering portfolio

Static portfolio hosted at https://pavankonam.github.io/portfolio/ using GitHub Pages, from `main` at the repository root.

## Local preview

Run `python3 -m http.server 8765`, then visit http://localhost:8765.

## Editing

- `index.html`: profile, industry case studies, project library, experience, education and contact details.
- `styles.css`: responsive cosmic theme, section entrances and hover motion.
- `universe.js`: original canvas particle nebula, pointer response and motion controls. Honors reduced motion, pauses offscreen/in background tabs, caps drawing at 30fps and lowers particle count on phones. No animation dependencies or external assets.
- `script.js`: accessible mobile navigation and current footer year.
- `AI_ML_Engineer.pdf`: downloadable résumé. Keep this filename or update both links.
- `gallery/` and `projects/`: existing photographs and project imagery.

All experience and project detail remains in static HTML and can be read without JavaScript. Industry case studies summarize proprietary systems; no invented performance metrics or inflated job titles were added. RUVAAH remains labeled as in development.

## Automation

The Portfolio quality workflow runs on pull requests and updates to `main`, checking HTML nesting, local assets, anchor targets, duplicate IDs, basic accessibility semantics, safe external links and JavaScript syntax. Run these locally with:

```
python3 scripts/check_site.py
node --check script.js
node --check universe.js
node scripts/test_motion.cjs
```

GitHub Pages continues to deploy updates to `main` through its existing branch-based publishing configuration. No deployment tokens, API keys or additional hosting accounts are required. Quality checks do not configure branch protection; review their result before merging.

## Content upkeep

Keep employment dates, current-role status and the résumé current. Add verified outcomes with measurement context when available. Avoid arbitrary skill percentages. Google Fonts are optional, with system-font fallbacks. External repositories and professional links should be reviewed periodically because their availability can change.
