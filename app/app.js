// GTA VI Trophy Case File — tracker logic.
// Vanilla JS, no libraries. Loads data/trophies.json from this app's own
// files, keeps earned trophies in localStorage, and never talks to the
// network: the only links out are the source links a reader chooses to open.

(function () {
  'use strict';

  var DATA_URL = 'data/trophies.json';
  var STORE_KEY = 'gta6-casefile-earned-v1';
  var SPOILER_KEY = 'gta6-casefile-spoilers-v1';

  var SOURCE_LINKS = {
    'PSNProfiles': 'https://www.planetgta6.com/en/gta-6-trophies/',
    'Exophase': 'https://www.planetgta6.com/en/gta-6-trophies/',
    'KeenGamer': 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/',
    'PowerPyx': 'https://www.powerpyx.com/',
    'GTABase': 'https://www.gtabase.com/'
  };

  var STAGES = [
    { n: 1, title: 'Stage 1 — Landfall, Chapters 1 & 2', note: 'Play the opening chapters and start the long counts now. Meditate at the balcony spot at Jason\u2019s house after Down to Earth, and at every spot after it — the one missable trophy is decided here.' },
    { n: 2, title: 'Stage 2 — Vice City opens, Chapters 3 & 4', note: 'Finish the story chapters, work the big heist missions, and take your partner along for the two partner trophies.' },
    { n: 3, title: 'Stage 3 — Strangers of Leonida', note: 'Answer every stranger icon on the map. The five named side characters plus three more strands finish Strangers & Freaks.' },
    { n: 4, title: 'Stage 4 — Robberies and the open road', note: 'Robberies in all their forms — vaults, trucks, shops, jewelry and gang operations — plus the wild exploration trophies.' },
    { n: 5, title: 'Stage 5 — The long grind', note: 'Activities and collectibles: stunts, the shooting range, races, challenges, cards, WAiNK It spots and the money trophies. A few at a time, between other jobs.' },
    { n: 6, title: 'Stage 6 — Endgame and the platinum', note: 'Finish the final mission, sweep the map clean, buy the last garages, and the 100% gold and the platinum pop together.' }
  ];

  var trophies = [];
  var earned = loadEarned();
  var spoilersHidden = loadSpoilers();

  var els = {};
  ['searchBox', 'gradeFilter', 'categoryFilter', 'statusFilter', 'missableOnly',
   'spoilerToggle', 'exportBtn', 'importBtn', 'importFile', 'resetBtn', 'saveNote',
   'viewChecklist', 'viewRoadmap', 'checklistView', 'roadmapView', 'trophyList',
   'roadmapList', 'listTitle', 'listCount', 'progressText', 'progressPct',
   'progressFill', 'drawer', 'drawerBody', 'drawerClose'].forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  function loadEarned() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var out = {};
      if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach(function (k) { if (parsed[k]) out[k] = true; });
      }
      return out;
    } catch (e) { return {}; }
  }

  function saveEarned() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(earned)); } catch (e) {}
  }

  function loadSpoilers() {
    try {
      var raw = window.localStorage.getItem(SPOILER_KEY);
      return raw === null ? true : raw === '1';
    } catch (e) { return true; }
  }

  function saveSpoilers() {
    try { window.localStorage.setItem(SPOILER_KEY, spoilersHidden ? '1' : '0'); } catch (e) {}
  }

  function isHidden(t) { return t.hidden && spoilersHidden && !earned[t.id]; }
  function earnedCount() { return trophies.filter(function (t) { return earned[t.id]; }).length; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function gradeClass(g) { return 'grade grade-' + g.toLowerCase(); }

  function trophyTags(t) {
    var html = '<span class="' + gradeClass(t.grade) + '">' + esc(t.grade) + '</span>';
    html += '<span class="tag">' + esc(t.category) + '</span>';
    if (t.missable) html += '<span class="tag tag-missable">Missable</span>';
    if (t.hidden) html += '<span class="tag tag-hidden">Hidden</span>';
    if (t.target) html += '<span class="tag">' + esc(t.target) + '</span>';
    return html;
  }

  function matchesFilters(t) {
    var q = els.searchBox.value.trim().toLowerCase();
    if (q) {
      var hay = (t.name + ' ' + t.description + ' ' + t.category).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (els.gradeFilter.value && t.grade !== els.gradeFilter.value) return false;
    if (els.categoryFilter.value && t.category !== els.categoryFilter.value) return false;
    if (els.statusFilter.value === 'earned' && !earned[t.id]) return false;
    if (els.statusFilter.value === 'unearned' && earned[t.id]) return false;
    if (els.missableOnly.checked && !t.missable) return false;
    return true;
  }

  function renderList() {
    var shown = trophies.filter(matchesFilters);
    els.listTitle.textContent = 'Checklist — ' + trophies.length + ' trophies';
    els.listCount.textContent = shown.length + ' shown, ' + earnedCount() + ' earned';
    if (shown.length === 0) {
      els.trophyList.innerHTML = '<li class="empty-note">No trophies match these filters. Clear the search or a filter to see the full list.</li>';
      return;
    }
    els.trophyList.innerHTML = shown.map(function (t) {
      var hidden = isHidden(t);
      var name = hidden ? 'Hidden trophy' : t.name;
      var desc = hidden ? 'Hidden on PSN — earn it to reveal the name and description.' : t.description;
      return '<li><button type="button" class="trophy-row' + (earned[t.id] ? ' earned' : '') + '" data-id="' + t.id + '">' +
        '<input type="checkbox" data-check="' + t.id + '"' + (earned[t.id] ? ' checked' : '') + ' aria-label="Mark ' + esc(name) + ' earned">' +
        '<span><span class="trophy-name">' + esc(name) + '</span>' +
        '<span class="trophy-desc">' + esc(desc) + '</span>' +
        '<span class="trophy-meta">' + trophyTags(t) + '</span></span>' +
        '<span aria-hidden="true">&#8250;</span>' +
        '</button></li>';
    }).join('');
  }

  function renderRoadmap() {
    els.roadmapList.innerHTML = STAGES.map(function (st) {
      var members = trophies.filter(function (t) { return t.stage === st.n; });
      var chips = members.map(function (t) {
        var label = isHidden(t) ? 'Hidden trophy' : t.name;
        return '<li data-id="' + t.id + '" class="' + (earned[t.id] ? 'done' : '') + '">' + esc(label) + '</li>';
      }).join('');
      return '<li class="stage-card"><h3>' + esc(st.title) + ' <span>' + members.length + ' trophies</span></h3>' +
        '<p>' + esc(st.note) + '</p><ul class="stage-trophies">' + chips + '</ul></li>';
    }).join('');
  }

  function renderProgress() {
    var n = earnedCount();
    var total = trophies.length || 55;
    var pct = Math.round((n / total) * 100);
    els.progressText.textContent = n + ' of ' + total + ' earned';
    els.progressPct.textContent = pct + '%';
    els.progressFill.style.width = pct + '%';
    els.saveNote.textContent = n === 0
      ? 'No trophies earned yet.'
      : n + ' earned, ' + (total - n) + ' to go. Last saved in this browser.';
  }

  function renderAll() {
    renderList();
    renderRoadmap();
    renderProgress();
  }

  function openDrawer(id) {
    var t = trophies.find(function (x) { return x.id === id; });
    if (!t) return;
    var hidden = isHidden(t);
    var html = '<h2>' + esc(hidden ? 'Hidden trophy' : t.name) + '</h2>' +
      '<div class="trophy-meta">' + trophyTags(t) + '</div>';
    if (t.missable) {
      html += '<div class="warn"><strong>Possibly missable.</strong> Meditate at all 18 spots. First spot: Lucia on the balcony at Jason\u2019s house after Down to Earth in Chapter 1 — before Chapter 1 ends. The 100% checklist needs only 15 of 18; this trophy needs all 18.</div>';
    }
    if (hidden) {
      html += '<p>This trophy is hidden on PSN until it is earned. Its name and description stay hidden here too, while spoilers are off. Earn it in the game, tick it here, and the full guide appears.</p>';
    } else {
      html += '<p class="trophy-desc">' + esc(t.description) + '</p>' +
        '<h3>Guide</h3><p>' + esc(t.guide) + '</p>' +
        '<h3>Sources</h3><p class="sources">' + t.sources.map(function (s) {
          var url = SOURCE_LINKS[s];
          return url ? '<a href="' + url + '" target="_blank" rel="noopener">' + esc(s) + '</a>' : esc(s);
        }).join(' &middot; ') + '</p>' +
        '<h3>Roadmap</h3><p>' + esc(STAGES[t.stage - 1].title) + '</p>';
    }
    html += '<button type="button" class="earn-btn" data-earn="' + t.id + '">' +
      (earned[t.id] ? 'Mark as not earned' : 'Mark as earned') + '</button>';
    els.drawerBody.innerHTML = html;
    els.drawer.hidden = false;
    document.querySelector('.layout').classList.add('with-drawer');
  }

  function closeDrawer() {
    els.drawer.hidden = true;
    document.querySelector('.layout').classList.remove('with-drawer');
  }

  function toggleEarned(id) {
    if (earned[id]) delete earned[id]; else earned[id] = true;
    saveEarned();
    renderAll();
  }

  function setView(which) {
    var showRoadmap = which === 'roadmap';
    els.roadmapView.hidden = !showRoadmap;
    els.checklistView.hidden = showRoadmap;
    els.viewRoadmap.classList.toggle('active', showRoadmap);
    els.viewChecklist.classList.toggle('active', !showRoadmap);
  }

  function exportSave() {
    var payload = { game: 'Grand Theft Auto VI', earned: Object.keys(earned).map(Number).sort(function (a, b) { return a - b; }) };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  function importSave(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var ids = parsed && Array.isArray(parsed.earned) ? parsed.earned : [];
        var next = {};
        ids.forEach(function (id) {
          var n = Number(id);
          if (trophies.some(function (t) { return t.id === n; })) next[n] = true;
        });
        earned = next;
        saveEarned();
        renderAll();
        els.saveNote.textContent = 'Imported ' + Object.keys(next).length + ' earned trophies.';
      } catch (e) {
        els.saveNote.textContent = 'That file could not be imported — it is not a save from this guide.';
      }
    };
    reader.readAsText(file);
  }

  // Wire up the controls.
  ['searchBox', 'gradeFilter', 'categoryFilter', 'statusFilter'].forEach(function (id) {
    els[id].addEventListener('input', renderList);
    els[id].addEventListener('change', renderList);
  });
  els.missableOnly.addEventListener('change', renderList);
  els.spoilerToggle.addEventListener('change', function () {
    spoilersHidden = els.spoilerToggle.checked;
    saveSpoilers();
    renderAll();
  });
  els.viewChecklist.addEventListener('click', function () { setView('checklist'); });
  els.viewRoadmap.addEventListener('click', function () { setView('roadmap'); });
  els.drawerClose.addEventListener('click', closeDrawer);
  els.exportBtn.addEventListener('click', exportSave);
  els.importBtn.addEventListener('click', function () { els.importFile.click(); });
  els.importFile.addEventListener('change', function () {
    if (els.importFile.files.length) importSave(els.importFile.files[0]);
    els.importFile.value = '';
  });
  els.resetBtn.addEventListener('click', function () {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = {};
      saveEarned();
      renderAll();
    }
  });

  els.trophyList.addEventListener('click', function (ev) {
    var check = ev.target.closest('[data-check]');
    if (check) {
      ev.preventDefault();
      toggleEarned(Number(check.getAttribute('data-check')));
      return;
    }
    var row = ev.target.closest('.trophy-row');
    if (row) openDrawer(Number(row.getAttribute('data-id')));
  });
  els.roadmapList.addEventListener('click', function (ev) {
    var chip = ev.target.closest('[data-id]');
    if (chip) { setView('checklist'); openDrawer(Number(chip.getAttribute('data-id'))); }
  });
  els.drawerBody.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-earn]');
    if (btn) {
      toggleEarned(Number(btn.getAttribute('data-earn')));
      openDrawer(Number(btn.getAttribute('data-earn')));
    }
  });

  // Load the data and paint the page.
  els.spoilerToggle.checked = spoilersHidden;
  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('trophies.json could not be loaded');
      return res.json();
    })
    .then(function (data) {
      trophies = (data.trophies || []).slice().sort(function (a, b) { return a.id - b.id; });
      renderAll();
    })
    .catch(function () {
      els.trophyList.innerHTML = '<li class="empty-note">The trophy data could not be loaded. Serve the app/ folder with a static server and reload.</li>';
    });
})();
