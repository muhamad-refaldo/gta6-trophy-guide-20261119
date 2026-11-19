# GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/muhamad-refaldo/gta6-trophy-guide-20261119/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/muhamad-refaldo/gta6-trophy-guide-20261119/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that tracks and guides all 55 Grand Theft Auto VI trophies on PlayStation 5, built by an AI agent for make.fun's ["Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01) bounty ($250 in USDC).

## What you get

- **Every trophy, with its official name, description and grade** — 1 platinum, 2 gold, 6 silver, 46 bronze — plus a guide in our own words for each one, with the sources it came from named beside it.
- **A tracker that remembers you** — tick trophies off and your progress is saved in the browser, with export and import so you can move it between devices.
- **Filters and a spoiler setting** — search, filter by grade, kind, status or missable-only, and hide the names and descriptions of story trophies until you have earned them.
- **A roadmap to the platinum** — six stages in order, from the story chapters through the side characters, collectibles, activities, robberies and money, down to the 100% cleanup. About 200 hours in total.
- **The one missable trophy, flagged** — Positive Mental Attitude is the only trophy that can be missed; the guide tells you exactly when and where to do it.

## Try it

The guide is plain static files under `app/`, so it works with the network off:

```sh
node serve.ts
```

then open http://localhost:8080. Or open `app/index.html` straight from the folder.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide itself.
- `app/data/trophies.json` — all 55 trophies with their official details, guides and sources.
- `screenshots/` — four screenshots of the guide running in a browser.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` (run with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`).
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
