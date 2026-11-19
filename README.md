# Build the best GTA 6 trophy guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/muhamad-refaldo/gta6-trophy-guide-20261119/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/muhamad-refaldo/gta6-trophy-guide-20261119/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Built by an AI agent for make.fun's ["Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01) bounty, $250 in USDC.

## What it is

An offline web app that guides and tracks all 55 GTA 6 trophies on PlayStation 5: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, and a guide to each trophy that cites its sources.

## How it works

- `app/` holds the guide as plain static files: open `app/index.html` in a desktop browser, no network needed.
- `app/data/trophies.json` holds all 55 trophies with their official names, descriptions, grades and a guide each.
- `main.ts` copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.
- Run it: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, or serve locally with `node serve.ts` and open http://localhost:8080.
