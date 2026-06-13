/* =============================================================================
   Alunn v9 — ADMIN UI glue
   Wires the admin page to the v9 engine (scorer.js + admin-match.js).
   Backend: GET ?action=getall&token=PIN  → { people: [ {Email, Name, ...fields} ] }
            GET ?action=lookup&token=PIN&emailA=&emailB= → { personA, personB }
   Each record holds raw answers keyed by field code plus filter fields.
   ============================================================================= */

let ALL_PEOPLE = null; // cache of {raw, person} after first load

function checkPin() {
  const val = document.getElementById('pin-input').value.trim();
  if (val === ADMIN_PIN) {
    document.getElementById('lock-screen').classList.remove('active');
    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'block';
    document.getElementById('admin-screen').classList.add('active');
  } else {
    document.getElementById('err-pin').style.display = 'block';
  }
}

function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

function escA(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// Turn a raw sheet record into a person object the engine understands.
const FILTER_FIELDS = ['Gender','Orientation','LookingFor','Intent','RelType','WantKids','Age','AgeMin','AgeMax','City','HasKids','OpenToKids','Religion','RelImportance'];
function toPerson(raw) {
  const filters = {};
  FILTER_FIELDS.forEach(f => { if (raw[f] !== undefined) filters[f] = raw[f]; });
  return { name: raw.Name || raw.name || raw.Email || raw.email, email: raw.Email || raw.email, filters, scores: scoreAnswers(raw), raw };
}

async function loadAllPeople() {
  if (ALL_PEOPLE) return ALL_PEOPLE;
  const url = `${APPS_SCRIPT_URL}?action=getall&token=${encodeURIComponent(ADMIN_PIN)}`;
  const res = await fetch(url);
  const data = await res.json();
  const list = data.people || data.records || data || [];
  ALL_PEOPLE = list.map(toPerson);
  return ALL_PEOPLE;
}

function findByEmail(people, email) {
  const e = (email || '').trim().toLowerCase();
  return people.find(p => (p.email || '').trim().toLowerCase() === e);
}

/* ── Tab 1: top matches (filterable list) ───────────────────────────────────*/
let TOP = null;            // { target, rows: [{person, result}] }
let topShown = 25;
const TOP_PAGE = 25;

async function findTopMatches() {
  const email = document.getElementById('top-email').value.trim();
  const err = document.getElementById('err-top');
  const spin = document.getElementById('top-spinner');
  err.classList.remove('visible'); err.textContent = '';
  if (!email) { err.textContent = 'Enter an email.'; err.classList.add('visible'); return; }
  spin.style.display = 'inline-block';
  try {
    const people = await loadAllPeople();
    const target = findByEmail(people, email);
    if (!target) { err.textContent = 'No submission found for that email.'; err.classList.add('visible'); return; }
    TOP = { target, rows: people.filter(p => p !== target).map(p => ({ person: p, result: matchPair(target, p) })) };
    topShown = TOP_PAGE;
    renderTopBar();
    applyTopFilters();
  } catch (e) {
    err.textContent = 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
  } finally { spin.style.display = 'none'; }
}

// star label → minimum overall score (read from the engine config)
function starMin(label) { const b = ENGINE.starBands.find(x => x.stars === label); return b ? b.min : 0; }

// submission time (ms) for a candidate, or null
function tsOf(person) {
  const t = person.raw && person.raw.timestamp;
  if (!t) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d.getTime();
}

function renderTopBar() {
  const el = document.getElementById('top-result');
  const cities = [...new Set(TOP.rows.map(r => (r.person.filters.City || '').trim()).filter(Boolean))].sort();
  const cityOpts = ['<option value="">Any city</option>'].concat(cities.map(c => `<option>${escA(c)}</option>`)).join('');
  el.innerHTML = `
    <div class="result-header">Matches for ${escA(TOP.target.name)}</div>
    <div class="top-filters">
      <div class="field"><label>Search</label><input type="text" id="tf-search" placeholder="name or email"></div>
      <div class="field"><label>Min stars</label><select id="tf-stars">
        <option value="0">Any</option>
        <option value="${starMin('★★★')}">★★★+</option>
        <option value="${starMin('★★★½')}">★★★½+</option>
        <option value="${starMin('★★★★')}">★★★★+</option>
        <option value="${starMin('★★★★★')}">★★★★★</option>
      </select></div>
      <div class="field"><label>City</label><select id="tf-city">${cityOpts}</select></div>
      <div class="field"><label>Joined</label><select id="tf-when">
        <option value="0">Any time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>
      </select></div>
      <div class="field"><label>Sort by</label><select id="tf-sort">
        <option value="best">Best match</option><option value="new">Newest</option><option value="age">Closest age</option>
      </select></div>
      <div class="field"><label>&nbsp;</label><label class="checkbox-option" style="margin:0;"><input type="checkbox" id="tf-gated"><label for="tf-gated">Show gated/low</label></label></div>
    </div>
    <div id="top-count" class="top-count"></div>
    <div id="top-list"></div>
    <div id="top-more" style="margin-top:12px;"></div>`;
  ['tf-search', 'tf-stars', 'tf-city', 'tf-when', 'tf-sort', 'tf-gated'].forEach(id => {
    const node = document.getElementById(id);
    node.addEventListener(id === 'tf-search' ? 'input' : 'change', () => { topShown = TOP_PAGE; applyTopFilters(); });
  });
}

function applyTopFilters() {
  const q = (document.getElementById('tf-search').value || '').trim().toLowerCase();
  const minScore = Number(document.getElementById('tf-stars').value) || 0;
  const city = document.getElementById('tf-city').value;
  const days = Number(document.getElementById('tf-when').value) || 0;
  const sort = document.getElementById('tf-sort').value;
  const gated = document.getElementById('tf-gated').checked;
  const cutoff = days ? Date.now() - days * 86400000 : 0;
  const tAge = Number(TOP.target.filters.Age);

  let rows = TOP.rows.filter(r => {
    const res = r.result, p = r.person;
    const eligible = !res.blocked && !res.hidden && res.overall !== null;
    if (!gated && !eligible) return false;
    if (minScore && (res.overall === null || res.overall < minScore)) return false;
    if (city && (p.filters.City || '').trim() !== city) return false;
    if (cutoff) { const ts = tsOf(p); if (ts === null || ts < cutoff) return false; }
    if (q && (((p.name || '') + ' ' + (p.email || '')).toLowerCase().indexOf(q) === -1)) return false;
    return true;
  });

  rows.sort((a, b) => {
    if (sort === 'new') return (tsOf(b.person) || 0) - (tsOf(a.person) || 0);
    if (sort === 'age') {
      const da = Math.abs((Number(a.person.filters.Age) || 999) - (tAge || 0));
      const db = Math.abs((Number(b.person.filters.Age) || 999) - (tAge || 0));
      return da - db;
    }
    return (b.result.overall == null ? -1 : b.result.overall) - (a.result.overall == null ? -1 : a.result.overall);
  });

  const total = rows.length;
  const shown = rows.slice(0, topShown);
  document.getElementById('top-count').textContent = total ? `Showing ${shown.length} of ${total}` : 'No matches with these filters.';
  document.getElementById('top-list').innerHTML = shown.map((r, i) => topCard(r, i)).join('');
  const more = document.getElementById('top-more');
  if (total > shown.length) {
    more.innerHTML = `<button class="btn btn-secondary" id="tf-more">Load more (${total - shown.length} more)</button>`;
    document.getElementById('tf-more').addEventListener('click', () => { topShown += TOP_PAGE; applyTopFilters(); });
  } else { more.innerHTML = ''; }
}

function topCard(r, i) {
  const res = r.result, p = r.person;
  const blocked = res.blocked || res.hidden;
  const right = blocked
    ? `<span class="hf-badge-fail" title="${escA(res.blocked || 'Below display threshold')}">${res.blocked ? 'Gated' : 'Low'}</span>`
    : `<span class="top-match-stars">${res.stars}</span><span class="top-match-rank" style="width:auto;color:var(--forest);font-size:1rem;">${res.overall}</span>`;
  const city = (p.filters.City || '').trim();
  const age = (p.filters.Age || '').toString().trim();
  const styles = [p.scores.attStyle, p.scores.comStyle, p.scores.drvType].filter(Boolean).join(' · ');
  const place = [city, age ? age + 'y' : ''].filter(Boolean).join(', ');
  const sub = [styles, place].filter(Boolean).join('  ·  ');
  return `
    <div class="top-match-card">
      <span class="top-match-rank">${blocked ? '–' : i + 1}</span>
      <div class="top-match-info">
        <div class="top-match-name">${escA(p.name)}</div>
        <div class="top-match-types">${escA(sub)}</div>
      </div>
      ${right}
      <button class="top-match-btn" onclick="loadMatchFromTop('${escA(TOP.target.email)}','${escA(p.email)}')">Report</button>
    </div>`;
}

function loadMatchFromTop(emailA, emailB) {
  switchTabDirect('tab-match');
  document.getElementById('email-a').value = emailA;
  document.getElementById('email-b').value = emailB;
  generateMatch();
}
function switchTabDirect(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach((t, i) => t.classList.toggle('active', t.getAttribute('onclick').includes(id)));
  document.getElementById(id).classList.add('active');
}

/* ── Tab 2: match report ────────────────────────────────────────────────────*/
async function generateMatch() {
  const emailA = document.getElementById('email-a').value.trim();
  const emailB = document.getElementById('email-b').value.trim();
  const err = document.getElementById('err-match');
  const spin = document.getElementById('match-spinner');
  err.classList.remove('visible'); err.textContent = '';
  if (!emailA || !emailB) { err.textContent = 'Enter both emails.'; err.classList.add('visible'); return; }
  spin.style.display = 'inline-block';
  try {
    const people = await loadAllPeople();
    const A = findByEmail(people, emailA), B = findByEmail(people, emailB);
    if (!A || !B) { err.textContent = 'One or both emails not found.'; err.classList.add('visible'); return; }
    renderMatchReport(matchPair(A, B));
  } catch (e) {
    err.textContent = 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
  } finally { spin.style.display = 'none'; }
}

function renderMatchReport(m) {
  const el = document.getElementById('match-result');
  el.style.display = 'block';

  if (m.blocked) {
    el.innerHTML = `
      <div class="report-chart-card" style="text-align:center;">
        <p class="report-name">${escA(m.nameA)} &amp; ${escA(m.nameB)}</p>
        <p class="stars-big">NOT A MATCH</p>
      </div>
      <div class="gate-banner">Hard-filter conflict: ${escA(m.blocked)}.</div>`;
    return;
  }

  const bars = m.dims.filter(d => d.match != null).map(d => `
    <div class="dim-bar-row">
      <div class="dim-bar-meta"><span class="dim-bar-label">${escA(d.name)}</span><span class="dim-bar-sub">${d.band}</span></div>
      <div class="dim-bar-track"><div class="dim-bar-fill" style="width:0%;background:#C1440E" data-pct="${d.match}"></div></div>
      <span class="dim-bar-pct">${d.match}</span>
    </div>`).join('');

  const sections = m.dims.filter(d => d.match != null).map(d => `
    <div class="report-section">
      <div class="report-section-label">${escA(d.name)} <span class="org">· ${d.match} (${d.band})</span></div>
      <p class="report-body">${escA(d.meaning)}</p>
      ${d.tip ? `<div class="match-tip-box"><span class="match-tip-label">Coaching tip</span><span class="match-tip-text">${escA(d.tip)}</span></div>` : ''}
    </div>`).join('');

  el.innerHTML = `
    <div class="report-chart-card" style="text-align:center;">
      <p class="report-name">${escA(m.nameA)} &amp; ${escA(m.nameB)}</p>
      <p class="stars-big">${m.stars || '–'}</p>
      <p class="chart-title">Overall compatibility · ${m.overall}/100</p>
    </div>
    <div class="report-chart-card"><p class="chart-title">By dimension</p><div class="dim-bars">${bars}</div></div>
    <div class="report-card">${sections}</div>
    <p class="report-disclaimer">For guidance and reflection only — not a clinical assessment or a prediction of any outcome.</p>
    <div style="display:flex;gap:10px;margin-top:24px;">
      <button class="btn btn-secondary btn-pdf" style="flex:1;" onclick="window.print()">Save as PDF</button>
    </div>`;
  animateProfileBars(el);
}

/* ── Tab 3: profile report ──────────────────────────────────────────────────*/
async function generateProfileReport() {
  const email = document.getElementById('profile-email').value.trim();
  const err = document.getElementById('err-profile');
  const spin = document.getElementById('profile-spinner');
  err.classList.remove('visible'); err.textContent = '';
  if (!email) { err.textContent = 'Enter an email.'; err.classList.add('visible'); return; }
  spin.style.display = 'inline-block';
  try {
    const people = await loadAllPeople();
    const target = findByEmail(people, email);
    if (!target) { err.textContent = 'No submission found.'; err.classList.add('visible'); return; }
    renderAdminProfile(buildProfileReport(target.scores, target.name));
  } catch (e) {
    err.textContent = 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
  } finally { spin.style.display = 'none'; }
}

function renderAdminProfile(report) {
  const el = document.getElementById('profile-result');
  // EXACT same profile as the user gets — one shared renderer (scorer.js).
  el.innerHTML = profileReportHTML(report);
  animateProfileBars(el);
}

// Allow Enter on the PIN field.
document.addEventListener('DOMContentLoaded', () => {
  const pin = document.getElementById('pin-input');
  if (pin) pin.addEventListener('keydown', e => { if (e.key === 'Enter') checkPin(); });
});
