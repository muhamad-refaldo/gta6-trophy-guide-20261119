// GTA VI trophy guide and tracker: loads app/data/trophies.json, renders the
// checklist with filters and a spoiler setting, saves progress in localStorage,
// and shows a detail panel with each trophy's guide and cited sources.
const STORAGE_KEY = 'gta6-trophy-guide-v1';
const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const categoryEl = document.getElementById('category');
const statusEl = document.getElementById('status');
const missableOnlyEl = document.getElementById('missable-only');
const spoilersEl = document.getElementById('spoilers');
const resultCountEl = document.getElementById('result-count');

const stored = loadProgress();
let earned = new Set(stored.earned);
let spoilersHidden = stored.spoilersHidden;
let selectedId = null;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      earned: Array.isArray(raw.earned) ? raw.earned : [],
      spoilersHidden: raw.spoilersHidden !== false,
    };
  } catch {
    return { earned: [], spoilersHidden: true };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...earned],
    spoilersHidden,
  }));
}

function isSpoilerHidden(trophy) {
  return trophy.spoiler && spoilersHidden && !earned.has(trophy.id);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function trophyMatches(trophy) {
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.category}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (categoryEl.value !== 'all' && trophy.category !== categoryEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(trophy.id)) return false;
  if (statusEl.value === 'missing' && earned.has(trophy.id)) return false;
  if (missableOnlyEl.checked && !trophy.missable) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('earned-count').textContent = done;
  document.getElementById('total-count').textContent = total;
  document.getElementById('bar-fill').style.width = `${pct}%`;
  document.getElementById('progress-pct').textContent = `${pct}% to the platinum`;
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => {
      const have = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
      const all = trophies.filter((t) => t.grade === grade).length;
      return `${gradeLabel(grade)} ${have}/${all}`;
    })
    .join(' · ');
  document.getElementById('grade-counts').textContent = counts;
}

function renderCategories() {
  const categories = [...new Set(trophies.map((t) => t.category))].sort();
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryEl.append(option);
  }
}

function badge(text, className) {
  const span = document.createElement('span');
  span.className = `badge ${className}`;
  span.textContent = text;
  return span;
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  for (const trophy of shown) {
    const hidden = isSpoilerHidden(trophy);
    const item = document.createElement('li');
    item.className = `trophy grade-${trophy.grade}${earned.has(trophy.id) ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}`;
    item.dataset.id = trophy.id;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${hidden ? 'hidden trophy' : trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.id);
      else earned.delete(trophy.id);
      saveProgress();
      renderProgress();
      renderList();
      renderDetail();
    });
    item.append(box);

    const main = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden trophy' : trophy.name;
    if (earned.has(trophy.id)) {
      const mark = document.createElement('span');
      mark.className = 'earned-mark';
      mark.textContent = ' ✓';
      name.append(mark);
    }
    main.append(name);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = hidden
      ? 'Hidden until earned — tick it off to reveal its name and description.'
      : trophy.description;
    main.append(desc);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(badge(gradeLabel(trophy.grade), trophy.grade));
    meta.append(badge(trophy.category, 'cat'));
    if (trophy.missable) meta.append(badge('Possibly missable', 'miss'));
    if (hidden) meta.append(badge('Spoiler hidden', 'hidden'));
    main.append(meta);
    item.append(main);

    const count = document.createElement('span');
    count.className = 'trophy-meta';
    item.append(count);
    item.addEventListener('click', () => {
      selectedId = trophy.id;
      renderList();
      renderDetail();
    });
    listEl.append(item);
  }
  resultCountEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function renderDetail() {
  const trophy = trophies.find((t) => t.id === selectedId);
  if (!trophy) return;
  detailEl.replaceChildren();
  const hidden = isSpoilerHidden(trophy);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-close';
  close.textContent = 'Close ✕';
  close.addEventListener('click', () => {
    selectedId = null;
    detailEl.replaceChildren();
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Click a trophy to see its guide and sources here.';
    detailEl.append(empty);
    renderList();
  });
  detailEl.append(close);

  const grade = document.createElement('p');
  grade.append(badge(gradeLabel(trophy.grade), trophy.grade));
  if (trophy.missable) grade.append(document.createTextNode(' '), badge('Possibly missable', 'miss'));
  detailEl.append(grade);

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden trophy' : trophy.name;
  detailEl.append(title);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'official';
    note.textContent = 'This is a story trophy. Turn off “Hide story spoilers” above, or tick it as earned, to reveal its name, description and guide.';
    detailEl.append(note);
    return;
  }

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${trophy.description}”`;
  detailEl.append(official);

  if (trophy.missable) {
    const warning = document.createElement('p');
    warning.className = 'missable-warning';
    warning.textContent = 'Possibly missable — see the Missable Trophies tab. Do the Chapter 1 balcony meditation before Chapter 1 ends.';
    detailEl.append(warning);
  }

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'How to get it';
  detailEl.append(guideHeading);
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  detailEl.append(guide);

  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  detailEl.append(sourcesHeading);
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const source of trophy.sources) {
    const item = document.createElement('li');
    const name = document.createElement('b');
    name.textContent = source.name;
    item.append(name, document.createTextNode(` — ${source.url}`));
    sources.append(item);
  }
  detailEl.append(sources);
}

function showTab(name) {
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('active', button.dataset.tab === name);
  }
  for (const panel of document.querySelectorAll('.tab-panel')) {
    panel.classList.toggle('hidden', panel.id !== `tab-${name}`);
  }
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...earned], exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('not a progress file');
    const byName = new Map(trophies.map((t) => [t.name, t.id]));
    const next = new Set();
    for (const value of ids) {
      if (typeof value === 'number' && trophies.some((t) => t.id === value)) next.add(value);
      if (typeof value === 'string' && byName.has(value)) next.add(byName.get(value));
    }
    earned = next;
    saveProgress();
    renderProgress();
    renderList();
    renderDetail();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderProgress();
  renderList();
  renderDetail();
});
spoilersEl.checked = spoilersHidden;
spoilersEl.addEventListener('change', () => {
  spoilersHidden = spoilersEl.checked;
  saveProgress();
  renderList();
  renderDetail();
});
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
categoryEl.addEventListener('change', renderList);
statusEl.addEventListener('change', renderList);
missableOnlyEl.addEventListener('change', renderList);
for (const button of document.querySelectorAll('.tab')) {
  button.addEventListener('click', () => showTab(button.dataset.tab));
}

renderCategories();
renderProgress();
renderList();
