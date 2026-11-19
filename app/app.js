// GTA VI trophy guide, version 3: an offline checklist that keeps your
// progress, a six-stage roadmap to the platinum that covers all 55 trophies,
// and a warning for the one trophy that can be missed. Every trophy row can
// open its guide and its cited sources right inside the list, and a detail
// panel shows the same for one trophy at a time. All trophy data comes from
// data/trophies.json, fetched from this same folder; nothing else is loaded.

const SAVE_KEY = 'gta6-trophies-v3';
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

// Six stages, in story order, naming every one of the 55 trophies:
// 12 story, 7 side characters, 14 collectibles and exploration,
// 11 activities, 9 robberies and money, and the last 2 for 100% and platinum.
const ROADMAP = [
  {
    title: 'Stage 1 — Play the story first (12 trophies)',
    body: 'Chapters 1 to 4 and then the final mission. This stage alone earns 12 trophies: the four chapter trophies, the gold for the final mission, and the named story missions — Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown and Operation Savage Glory. Do not rush past Chapter 1: the first meditation spot for Positive Mental Attitude appears there, and it is the only trophy in the game that can be missed.',
    names: ['Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!', 'Top Of The World, Ma', 'You Gotta Know When to Get Off', 'Trust', 'Break the Bank', 'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Snow Storm'],
  },
  {
    title: 'Stage 2 — Side characters and strangers (7 trophies)',
    body: 'Play the mission strands for Andy, Kenton, Billy, Randy and Tyrone through to each one\u2019s final mission, hunt the unique animal for Bret, and finish 8 stranger mission strands across Leonida for the silver Strangers & Freaks. The five named side-character strands count toward those eight. Strands open up as you explore, so sweep each region as the story reaches it.',
    names: ['Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider', 'Supply & Demand', 'Spin On This!', 'Fair Game', 'Strangers & Freaks'],
  },
  {
    title: 'Stage 3 — Collectibles, exploration and the map (14 trophies)',
    body: 'Complete 3 card sets (the 100% checklist asks for 15 of the 18 sets), WAiNK It at 100 locations, meditate at all 18 spots (15 count for 100%, all 18 for the trophy), explore all 52 areas of Leonida, discover 100 vehicles (100% asks for 200 of the 277 base models), register 10 vehicles with Scooter Bros, and chase the hidden exploration trophies: an unscheduled departure from VCIA, a Rhino tank in combat, a cocktail on Ocean Beach, smashing out of a vehicle showroom, maxing Strength for both Jason and Lucia, reaching 500 on your Criminal Profile, and the two strange ones nobody has pinned down yet — Bad Luck, I Guess and The Truth Is Out There. Meditate as you pass each spot; the first one can be missed.',
    names: ['Don\u2019t Touch My Deck', 'You WAiNKer!', 'Positive Mental Attitude', 'The Goodtime State', 'Whip It Good', 'On the Spot', 'Catch Me If You Can', 'Challenging Tank', 'In The Beginning…', 'Capital Offense', 'Personal Best', 'Actions Speak Louder', 'Bad Luck, I Guess', 'The Truth Is Out There'],
  },
  {
    title: 'Stage 4 — Activities and challenges (11 trophies)',
    body: 'Gold all 42 Shooting Range challenges, win a Top Fun Drone Race at all 14 locations (plus the 42 drone time trials for 100%), win 20 different races (100% asks for 30 of the 40), pull off 250 stunts (100% asks for 300 of the 397), finish 50 challenges (100% asks for 70 of the 80), try all 9 activity types once, finish an arcade game, take the three valuables from the Kolt & Associates bowling alley, beat Cal at fishing, take down 5 enemies in one use of Combat Focus, and bowl someone over with a melee drive-by.',
    names: ['The Shootist', 'Top Fun', 'Earn Cash, Not Kudos', 'Cunning Stunts', 'One Last Thing', 'Master of None', 'Stick Fiddler', 'Let\u2019s Go Bowling', 'Baited My Tackle', 'Gunslinger', 'Ten Pin'],
  },
  {
    title: 'Stage 5 — Robberies, partner and money (9 trophies)',
    body: 'Rob 5 bank vaults and escape — the large vaults open through the optional Chapter 4 mission That\u2019s Where The Money Is, and all 8 vaults count toward 100%. Also rob an armored truck, rob a jewelry store without being detected, rob one illegal operation for each of the 9 gangs (39 in total for 100%), rob 3 shops back-to-back with your partner, and lose a 4-star wanted level with your partner. For money: launder $250,000 of Marked Bills, spend $100,000 across all shops, and buy all 8 garage properties.',
    names: ['Maximum Withdrawal', 'A Classic Blitz Play', 'Sneakthief', 'Pest Control', 'Retail Therapy', 'Hot Together', 'Dime on the Dollar', 'Treat Yo Self', 'Little Boxes'],
  },
  {
    title: 'Stage 6 — Cleanup and the platinum (2 trophies)',
    body: 'Open the in-game Progress menu and check the 100% Completion checklist to see what is left, then finish it for the gold A Long Road. The platinum, Vice Got a Price!, pops the moment the other 54 trophies are yours. Expect around 200 hours from the first mission to the platinum.',
    names: ['A Long Road', 'Vice Got a Price!'],
  },
];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

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
  return el('span', `chip chip-${grade}`, grade);
}

function buildCard(t) {
  const card = el('article', 'trophy-card');
  if (earned.has(t.name)) card.classList.add('is-earned');
  if (t.missable) card.classList.add('is-missable');

  const tick = el('input', 'trophy-tick');
  tick.type = 'checkbox';
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

  const main = el('div', 'trophy-main');

  const title = el('button', 'trophy-title', trophyIsHidden(t) ? 'Hidden trophy' : t.name);
  title.type = 'button';
  title.addEventListener('click', () => showDetail(t));

  const desc = el('p', 'trophy-desc', trophyIsHidden(t)
    ? 'Hidden until earned — tick it off to reveal its name and description.'
    : t.description);

  const chips = el('p', 'chip-row');
  chips.append(gradeChip(t.grade));
  chips.append(el('span', 'chip', t.category));
  if (t.missable) chips.append(el('span', 'chip chip-missable', 'Possibly missable'));
  if (earned.has(t.name)) chips.append(el('span', 'chip chip-earned', 'Earned ✓'));

  const expanded = openGuides.has(t.name);
  const guideBtn = el('button', 'guide-toggle', expanded ? 'Hide guide ▲' : 'Guide & sources ▼');
  guideBtn.type = 'button';
  guideBtn.setAttribute('aria-expanded', String(expanded));
  guideBtn.addEventListener('click', () => {
    if (openGuides.has(t.name)) openGuides.delete(t.name);
    else openGuides.add(t.name);
    paintList();
  });

  const guideBox = el('div', 'guide-box');
  if (expanded) {
    guideBox.append(el('p', 'guide-how', t.guide));
    guideBox.append(el('p', 'guide-sources', `Sources: ${sourceLine(t.sources)}`));
  }

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
  panelBody.append(
    el('h3', '', trophyIsHidden(t) ? 'Hidden trophy' : t.name),
    el('p', 'official-quote', trophyIsHidden(t)
      ? 'Hidden until earned — tick it off to reveal its name and description.'
      : `Official: “${t.description}”`),
  );
  const chips = el('p', 'chip-row');
  chips.append(gradeChip(t.grade));
  chips.append(el('span', 'chip', t.category));
  if (t.missable) chips.append(el('span', 'chip chip-missable', 'Possibly missable'));
  panelBody.append(
    chips,
    el('h4', '', 'How to get it'),
    el('p', '', t.guide),
    el('h4', '', 'Sources'),
    el('p', 'guide-sources', sourceLine(t.sources)),
  );
}

function paintRoadmap() {
  const stageList = document.getElementById('stageList');
  stageList.replaceChildren(...ROADMAP.map((stage) => {
    const item = el('li', 'stage');
    item.append(
      el('h3', '', stage.title),
      el('p', '', stage.body),
      el('p', 'stage-trophies', `Trophies: ${stage.names.join(' · ')}`),
    );
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
for (const control of [searchEl, gradeEl, kindEl, stateEl, missableEl, spoilerEl]) {
  control.addEventListener('input', paintList);
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
