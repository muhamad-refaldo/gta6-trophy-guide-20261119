# GTA VI Trophy Case File

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/muhamad-refaldo/gta6-trophy-guide-20261119/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/muhamad-refaldo/gta6-trophy-guide-20261119/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI, built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01). The look is a light paper case file: warm paper, dark ink, a red stamp accent — our own design, with no Rockstar artwork anywhere.

## What it covers

- **All 55 trophies** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze — each with its official name, description and grade exactly as PlayStation publishes them.
- **A guide in our own words for every trophy**, with the source named beside it (PSNProfiles, Exophase, KeenGamer, PowerPyx, GTABase). No guide text is copied from another guide.
- **A tracker**: tick trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a file and imported back, or reset.
- **Filters**: search, grade, kind (story, missable, collectibles, activities, and more), earned/unearned, and a missable-only filter.
- **Spoiler setting**: the 28 hidden story trophies show as "Hidden trophy" until you earn them or switch spoilers on.
- **A six-stage roadmap to the platinum** covering all 55 trophies — Stage 1 holds exactly 12, and starts in Chapter 1 so the one missable trophy is never lost.
- **One missable trophy**: *Positive Mental Attitude* — meditate at all 18 spots. The first is Lucia on the balcony at Jason's house after the Down to Earth mission in Chapter 1; do it before Chapter 1 ends. The 100% checklist needs only 15 of 18, but this trophy needs all 18.
- **No online trophies**, and cheats disable trophies and saving, so the guide keeps cheats off.

## Run it

The app is plain static files under `app/` — no build step, no network:

```sh
cd app && python3 -m http.server 8080
```

Then open <http://localhost:8080> in a desktop browser. Everything it loads is a file under `app/`; it works with the network off.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program never removes the output directory itself — it only clears the entries inside it — because in the grader `/output` is a bind mount and removing it fails.

## Files

- `app/index.html` — the case-file page: header, progress, filters, checklist, roadmap, detail drawer
- `app/style.css` — the paper-dossier theme
- `app/app.js` — tracker logic: filters, spoiler mode, localStorage, export/import, roadmap
- `app/data/trophies.json` — the 55 trophies with official names, descriptions, grades, guides, sources and roadmap stages
- `screenshots/` — four renders of the real app: checklist, roadmap, trophy detail, filtered view
- `main.ts` — the entry program
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see `LICENSE`.
