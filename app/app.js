// GTA VI trophy guide, version 2: an offline checklist that saves progress,
// a six-stage roadmap to the platinum, and a missable-trophy warning. Every
// trophy row opens its guide and its cited sources right inside the list, and
// a detail panel shows the same for one trophy at a time. All data comes from
// data/trophies.json, fetched from this same folder; nothing else is loaded.

const SAVE_KEY = 'gta6-trophies-v2';
const DATA_URL = 'data/trophies.json';

const listEl = document.getElementById('trophyList');
const countEl = document.getElementById('countLine');
const searchEl = document.getElementById('searchBox');
const gradeEl = document.getElementById('gradePick');
const kindEl = document.getElementById('kindPick');
const stateEl = document.getElementById('statePick');
const missableEl = document.getElementById('missablePick');
const spoilerEl = document.getElementById('spoilerPick');
const panelEl = document.getElementById('detailPanel');
const panelBody = document.getElementById('detailBody');

let trophies = [];
let earned = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) ?? '[]'));
let openGuides = new Set();
let openDetail = null;

const ROADMAP = [
  {
    title: 'Stage 1 — Play the story first',
    body: 'Chapters 1 to 4 and then the final mission. This stage alone earns 13 trophies: the four chapter trophies, the gold for the final mission, and the named story missions — Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown and Operation Savage Glory. Do not rush past Chapter 1: the first meditation spot for Positive Mental Attitude appears there, and it is the only missable trophy in the game.',
    names: ['Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!', 'Top Of The World, Ma', 'You Gotta Know When to Get Off', 'Trust', 'Break the Bank', 'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Snow Storm'],
  },
  {
    title: 'Stage 2 — Side characters and strangers',
    body: 'Finish the mission strands for Andy, Kenton, Billy, Randy and Tyrone, hunt the unique animal for Bret, and complete 8 stranger mission strands across Leonida for the silver Strangers & Freaks. Strands unlock as you explore, so sweep each region as the story opens it up.',
    names: ['Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider', 'Supply & Demand', 'Spin On This!', 'Fair Game', 'Strangers & Freaks'],
  },
  {
    title: 'Stage 3 — Collectibles and the map',
    body: 'Collect 3 card sets (the 100% checklist wants 15 of the 18 sets), WAiNK It at 100 locations, meditate at all 18 spots (15 count for 100%, all 18 for the trophy), explore all 52 areas of Leonida, and discover 100 vehicles (100% wants 200 of the 277 base models). Do the meditation spots as you pass them — the first one is missable.',
    names: ['Don\u2019t Touch My Deck', 'You WAiNKer!', 'Positive Mental Attitude', 'The Goodtime State', 'Whip It Good', 'On the Spot'],
  },
  {
    title: 'Stage 4 — Activities and challenges',
    body: 'Gold all 42 Shooting Range challenges, win a Top Fun Drone Race at all 14 locations (plus the 42 drone time trials for 100%), win 20 different races (100% wants 30 of the 40), pull off 250 stunts (100% wants 300 of the 397), finish 50 challenges (100% wants 70 of the 80), try all 9 activity types once, finish an arcade game, take the three valuables from the Kolt & Associates bowling alley, and beat Cal at fishing.',
    names: ['The Shootist', 'Top Fun', 'Earn Cash, Not Kudos', 'Cunning Stunts', 'One Last Thing', 'Master of None', 'Stick Fiddler', 'Let\u2019s Go Bowling', 'Baited My Tackle'],
  },
  {
    title: 'Stage 5 — Robberies and money',
    body: 'Rob 5 bank vaults and escape — the large vaults open through the optional Chapter 4 mission That\u2019s Where The Money Is, and all 8 vaults count toward 100%. Also rob an armored truck, rob a jewelry store without being detected, rob one illegal operation for each of the 9 gangs (39 in total for 100%), rob 3 shops back-to-back with your partner, and lose a 4-star wanted level with your partner. For money: launder $250,000 of Marked Bills, spend $100,000 across all shops, buy all 8 garage properties, and register 10 vehicles in the Scooter Bros app.',
    names: ['Maximum Withdrawal', 'A Classic Blitz Play', 'Sneakthief', 'Pest Control', 'Retail Therapy', 'Hot Together', 'Dime on the Dollar', 'Treat Yo Self', 'Little Boxes'],
  },
  {
    title: 'Stage 6 — Cleanup and the platinum',
    body: 'Open the in-game Progress menu and check the 100% Completion checklist to see what is left, then finish it for the gold A Long Road. The platinum, Vice Got a Price!, pops the moment the other 54 trophies are yours. Expect around 200 hours from the first mission to the platinum.',
    names: ['A Long Road', 'Vice Got a Price!'],
  },
];

function storeProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...earned]));
}

function trophyIsHidden(t) {
  return spoilerEl.checked && t.spoiler && !earned.has(t.name);
}

function sourceLine(sources) {
  return sources.map((s) => `${s.name} — ${s.url}`).join(' · ');
}

function gradeChip(grade) {
  const span = document.createElement('span');
  span.className = `chip chip-${grade}`;
  span.textContent = grade;
  return span;
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy-card';
  if (earned.has(t.name)) card.classList.add('is-earned');
  if (t.missable) card.classList.add('is-missable');

  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.className = 'trophy-tick';
  tick.checked = earned.has(t.name);
  tick.setAttribute('aria-label', `Mark ${t.name} as earned`);
  tick.addEventListener('change', () => {
    if (tick.checked) earned.add(t.name);
    else earned.delete(t.name);
    storeProgress();
    paintList();
    paintProgress();
    if (openDetail === t.name) showDetail(t);
  });

  const main = document.createElement('div');
  main.className = 'trophy-main';

  const title = document.createElement('button');
  title.type = 'button';
  title.className = 'trophy-title';
  title.textContent = trophyIsHidden(t) ? 'Hidden trophy' : t.name;
  title.addEventListener('click', () => showDetail(t));

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = trophyIsHidden(t)
    ? 'Hidden until earned — tick it off to reveal its name and description.'
    : t.description;

  const chips = document.createElement('p');
  chips.className = 'chip-row';
  chips.append(gradeChip(t.grade));
  const kind = document.createElement('span');
  kind.className = 'chip';
  kind.textContent = t.category;
  chips.append(kind);
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'chip chip-missable';
    flag.textContent = 'Possibly missable';
    chips.append(flag);
  }
  if (earned.has(t.name)) {
    const done = document.createElement('span');
    done.className = 'chip chip-earned';
    done.textContent = 'Earned ✓';
    chips.append(done);
  }

  const guideBtn = document.createElement('button');
  guideBtn.type = 'button';
  guideBtn.className = 'guide-toggle';
  const expanded = openGuides.has(t.name);
  guideBtn.textContent = expanded ? 'Hide guide ▲' : 'Guide & sources ▼';
  guideBtn.setAttribute('aria-expanded', String(expanded));

  const guideBox = document.createElement('div');
  guideBox.className = 'guide-box';
  if (expanded) {
    const how = document.createElement('p');
    how.className = 'guide-how';
    how.textContent = t.guide;
    const src = document.createElement('p');
    src.className = 'guide-sources';
    src.textContent = `Sources: ${sourceLine(t.sources)}`;
    guideBox.append(how, src);
  }

  guideBtn.addEventListener('click', () => {
    if (openGuides.has(t.name)) openGuides.delete(t.name);
    else openGuides.add(t.name);
    paintList();
  });

  main.append(title, desc, chips, guideBtn, guideBox);
  card.append(tick, main);
  return card;
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.category}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.category !== kindEl.value) return false;
  if (stateEl.value === 'earned' && !earned.has(t.name)) return false;
  if (stateEl.value === 'missing' && earned.has(t.name)) return false;
  if (missableEl.checked && !t.missable) return false;
  return true;
}

function paintList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren(...shown.map(buildCard));
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function paintProgress() {
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = trophies.length ? Math.round((done / trophies.length) * 100) : 0;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressSub').textContent = `${pct}% to the platinum`;
  const byGrade = (g) => trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
  const totals = (g) => trophies.filter((t) => t.grade === g).length;
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade('platinum')}/${totals('platinum')} · Gold ${byGrade('gold')}/${totals('gold')} · Silver ${byGrade('silver')}/${totals('silver')} · Bronze ${byGrade('bronze')}/${totals('bronze')}`;
}

function showDetail(t) {
  openDetail = t.name;
  panelEl.hidden = false;
  panelBody.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = trophyIsHidden(t) ? 'Hidden trophy' : t.name;
  const quote = document.createElement('p');
  quote.className = 'official-quote';
  quote.textContent = trophyIsHidden(t)
    ? 'Hidden until earned — tick it off to reveal its name and description.'
    : `Official: “${t.description}”`;
  const chips = document.createElement('p');
  chips.className = 'chip-row';
  chips.append(gradeChip(t.grade));
  const kind = document.createElement('span');
  kind.className = 'chip';
  kind.textContent = t.category;
  chips.append(kind);
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'chip chip-missable';
    flag.textContent = 'Possibly missable';
    chips.append(flag);
  }
  const howTitle = document.createElement('h4');
  howTitle.textContent = 'How to get it';
  const how = document.createElement('p');
  how.textContent = t.guide;
  const srcTitle = document.createElement('h4');
  srcTitle.textContent = 'Sources';
  const src = document.createElement('p');
  src.className = 'guide-sources';
  src.textContent = sourceLine(t.sources);
  panelBody.append(heading, quote, chips, howTitle, how, srcTitle, src);
}

function paintRoadmap() {
  const stageList = document.getElementById('stageList');
  stageList.replaceChildren(...ROADMAP.map((stage, i) => {
    const item = document.createElement('li');
    item.className = 'stage';
    const head = document.createElement('h3');
    head.textContent = stage.title;
    const body = document.createElement('p');
    body.textContent = stage.body;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    names.textContent = `Trophies: ${stage.names.join(' · ')}`;
    item.append(head, body, names);
    return item;
  }));
}

function switchView(name) {
  for (const view of ['guide', 'roadmap', 'missable']) {
    document.getElementById(`${view}View`).hidden = view !== name;
    document.getElementById(`tab${view[0].toUpperCase()}${view.slice(1)}`).classList.toggle('is-active', view === name);
  }
}

document.getElementById('detailClose').addEventListener('click', () => {
  panelEl.hidden = true;
  openDetail = null;
});
for (const view of ['guide', 'roadmap', 'missable']) {
  document.getElementById(`tab${view[0].toUpperCase()}${view.slice(1)}`).addEventListener('click', () => switchView(view));
}
for (const el of [searchEl, gradeEl, kindEl, stateEl, missableEl, spoilerEl]) {
  el.addEventListener('input', paintList);
}
document.getElementById('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned])], { type: 'application/json' }));
  a.download = 'trophy-progress.json';
  a.click();
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  earned = new Set(JSON.parse(await file.text()));
  storeProgress();
  paintList();
  paintProgress();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  earned = new Set();
  storeProgress();
  paintList();
  paintProgress();
});

const doc = await (await fetch(DATA_URL)).json();
trophies = doc.trophies;
paintRoadmap();
paintList();
paintProgress();
