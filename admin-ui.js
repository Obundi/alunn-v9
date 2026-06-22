/* =============================================================================
   Alunn v9 — ADMIN UI glue
   Wires the admin page to the v9 engine (scorer.js + admin-match.js).
   Backend: GET ?action=getall&token=PIN  → { people: [ {Email, Name, ...fields} ] }
            GET ?action=lookup&token=PIN&emailA=&emailB= → { personA, personB }
   Each record holds raw answers keyed by field code plus filter fields.
   ============================================================================= */

let ALL_PEOPLE = null;   // cache of people after load
let ADMIN_TOKEN_SESSION = (typeof ADMIN_PIN !== 'undefined' ? ADMIN_PIN : ''); // set on unlock

// Unlock by verifying the code against the BACKEND (not just config.js), so a
// mismatched token stops you here instead of letting you in to a dead end.
async function checkPin() {
  const val = document.getElementById('pin-input').value.trim();
  const err = document.getElementById('err-pin');
  const btn = document.getElementById('btn-unlock');
  err.style.display = 'none';
  if (!val) { err.textContent = 'Enter your access code.'; err.style.display = 'block'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Checking…'; }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getall&token=${encodeURIComponent(val)}`);
    const data = await res.json();
    if (data && data.ok === false) {           // backend said unauthorized
      err.textContent = 'Wrong code — try again.'; err.style.display = 'block';
      return;
    }
    // Correct code: remember it for the session and pre-load the data.
    ADMIN_TOKEN_SESSION = val;
    const list = Array.isArray(data) ? data : (data.people || data.records || []);
    ALL_PEOPLE = list.map(toPerson);
    document.getElementById('lock-screen').classList.remove('active');
    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'block';
    document.getElementById('admin-screen').classList.add('active');
  } catch (e) {
    err.textContent = 'Could not reach the backend — check your connection and the URL in config.js.';
    err.style.display = 'block';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Unlock'; }
  }
}

function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

function escA(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// Anonymous, deterministic couple code from the two emails (order-independent).
// Same couple → same code; reveals nothing about who they are.
function pairToken(a, b) {
  const s = [a, b].map(e => String(e || '').trim().toLowerCase()).sort().join('|');
  let h1 = 0x811c9dc5, h2 = 0x1000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = (h1 ^ c) * 0x01000193 >>> 0;
    h2 = (h2 * 31 + c) >>> 0;
  }
  return 'p' + h1.toString(36) + h2.toString(36);
}

// Turn a raw sheet record into a person object the engine understands.
const FILTER_FIELDS = ['Gender','Orientation','LookingFor','Intent','RelType','WantKids','Age','AgeMin','AgeMax','City','HasKids','OpenToKids','Religion','RelImportance'];
function toPerson(raw) {
  const filters = {};
  FILTER_FIELDS.forEach(f => { if (raw[f] !== undefined) filters[f] = raw[f]; });
  return { name: raw.Name || raw.name || raw.Email || raw.email, email: raw.Email || raw.email, filters, scores: scoreAnswers(raw), raw };
}

async function loadAllPeople() {
  if (ALL_PEOPLE) return ALL_PEOPLE;
  const url = `${APPS_SCRIPT_URL}?action=getall&token=${encodeURIComponent(ADMIN_TOKEN_SESSION)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.ok === false) {
    throw new Error(data.error === 'unauthorized'
      ? 'Backend rejected the code. Reload and unlock again.'
      : ('Backend error: ' + data.error));
  }
  const list = Array.isArray(data) ? data : (data.people || data.records || []);
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
    err.textContent = (e && e.message) ? e.message : 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
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

const GATE_LABELS = { gender: 'Gender / orientation', kids: 'Children', reltype: 'Relationship type', intent: 'Relationship intent', age: 'Age range', religion: 'Religion' };

function renderTopBar() {
  const el = document.getElementById('top-result');
  const cities = [...new Set(TOP.rows.map(r => (r.person.filters.City || '').trim()).filter(Boolean))].sort();
  const cityOpts = ['<option value="">Any city</option>'].concat(cities.map(c => `<option>${escA(c)}</option>`)).join('');
  // Gate reasons actually present among the candidates (so we only show relevant toggles).
  const presentCodes = [...new Set(TOP.rows.map(r => r.result.blockedCode).filter(Boolean))];
  const anyLow = TOP.rows.some(r => r.result.hidden);
  const reasonChecks = presentCodes.map(c =>
    `<label class="gate-check"><input type="checkbox" class="tf-reason" value="${c}" checked> ${escA(GATE_LABELS[c] || c)}</label>`).join('')
    + (anyLow ? `<label class="gate-check"><input type="checkbox" id="tf-low" value="low" checked> Below threshold</label>` : '');

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
    <div class="top-gatefilters" id="tf-reasons" style="display:none;">
      <span class="tf-reasons-label">Show gated reasons:</span>${reasonChecks || '<span class="top-count" style="margin:0;">none in this set</span>'}
    </div>
    <div id="top-count" class="top-count"></div>
    <div id="top-list"></div>
    <div id="top-more" style="margin-top:12px;"></div>`;

  ['tf-search', 'tf-stars', 'tf-city', 'tf-when', 'tf-sort'].forEach(id => {
    document.getElementById(id).addEventListener(id === 'tf-search' ? 'input' : 'change', () => { topShown = TOP_PAGE; applyTopFilters(); });
  });
  const gatedBox = document.getElementById('tf-gated');
  gatedBox.addEventListener('change', () => {
    document.getElementById('tf-reasons').style.display = gatedBox.checked ? 'flex' : 'none';
    topShown = TOP_PAGE; applyTopFilters();
  });
  el.querySelectorAll('.tf-reason, #tf-low').forEach(n => n.addEventListener('change', () => { topShown = TOP_PAGE; applyTopFilters(); }));
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
  // Which gated reasons (and below-threshold) to include, from the reason row.
  const allowedReasons = new Set([...document.querySelectorAll('.tf-reason:checked')].map(n => n.value));
  const lowEl = document.getElementById('tf-low');
  const showLow = !lowEl || lowEl.checked;

  let rows = TOP.rows.filter(r => {
    const res = r.result, p = r.person;
    const eligible = !res.blocked && !res.hidden && res.overall !== null;
    if (!gated) {
      if (!eligible) return false;
    } else {
      if (res.blocked && !allowedReasons.has(res.blockedCode)) return false; // hide unwanted gate reasons
      if (res.hidden && !showLow) return false;
    }
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
  const flagged = !!(res.blocked || res.hidden);
  // Gated/low rows show the SAME stars + score as a match — just with a tag + reason.
  const right = (res.overall != null)
    ? `<span class="top-match-stars">${res.stars || ''}</span><span class="top-match-rank" style="width:auto;color:var(--forest);font-size:1rem;">${res.overall}</span>`
    : `<span class="hf-badge-fail">no score</span>`;
  const city = (p.filters.City || '').trim();
  const age = (p.filters.Age || '').toString().trim();
  const styles = [p.scores.attStyle, p.scores.comStyle, p.scores.drvType].filter(Boolean).join(' · ');
  const place = [city, age ? age + 'y' : ''].filter(Boolean).join(', ');
  const sub = [styles, place].filter(Boolean).join('  ·  ');
  const flagLine = res.blocked
    ? `<div class="top-match-gate"><span class="gate-pill">GATED</span>${escA(res.blocked)}</div>`
    : (res.hidden ? `<div class="top-match-gate"><span class="gate-pill gate-pill-low">LOW</span>below the display threshold</div>` : '');
  return `
    <div class="top-match-card${flagged ? ' top-match-flagged' : ''}">
      <span class="top-match-rank">${i + 1}</span>
      <div class="top-match-info">
        <div class="top-match-name">${escA(p.name)}</div>
        <div class="top-match-types">${escA(sub)}</div>
        ${flagLine}
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
    renderMatchReport(matchPair(A, B), A.email, B.email);
  } catch (e) {
    err.textContent = (e && e.message) ? e.message : 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
  } finally { spin.style.display = 'none'; }
}

function renderMatchReport(m, emailA, emailB) {
  const el = document.getElementById('match-result');
  el.style.display = 'block';

  // Shared pair code for couple feedback (sorted emails). Both partners' links
  // carry the same code, so their feedback rows line up for comparison.
  // Anonymous, deterministic pairing code — reveals no names/emails in the link.
  const pairKey = pairToken(emailA, emailB);
  const coupleLink = new URL(`fb-match.html?pair=${encodeURIComponent(pairKey)}`, location.href).href;
  const linksBlock = (emailA && emailB) ? `
    <div class="report-section match-fb-links">
      <div class="report-section-label">Couple feedback link</div>
      <p class="report-body">One link for this couple — send it to either partner; they can use it and forward it to the other. The link is an <strong>anonymous code</strong> (no names or emails in it), so a wrong or forwarded link never exposes anyone. Each person just enters their own email, and both answers auto-pair so you can compare their views on this report.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-secondary" style="flex:1;min-width:200px;" onclick="copyFbLink(this,'${escA(coupleLink)}')">Copy couple feedback link</button>
      </div>
    </div>` : '';

  const gateBanner = m.blocked
    ? `<div class="gate-banner">⚠ Hard-filter conflict: ${escA(m.blocked)}.<br>In normal matching this pair is hidden — shown here for your review only.</div>`
    : '';

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

  // Two-perspective line: only when someone ranked priorities AND the two sides differ.
  const perspLine = (m.personalised && m.perspA != null && m.perspB != null && m.perspA !== m.perspB)
    ? `<p class="persp-line">From ${escA(m.nameA)}'s priorities <strong>${m.perspA}</strong> &nbsp;·&nbsp; From ${escA(m.nameB)}'s priorities <strong>${m.perspB}</strong></p>
       <p class="persp-note">The overall blends both views. Each side weights the same compatibility by what that person said matters most.</p>`
    : '';

  el.innerHTML = `
    <div class="report-chart-card" style="text-align:center;">
      <p class="report-name">${escA(m.nameA)} &amp; ${escA(m.nameB)}</p>
      <p class="stars-big">${m.stars || '–'}</p>
      <p class="chart-title">Overall compatibility · ${m.overall}/100${m.blocked ? ' · gated' : ''}</p>
      ${perspLine}
    </div>
    ${gateBanner}
    <div class="report-chart-card"><p class="chart-title">By dimension</p><div class="dim-bars">${bars}</div></div>
    <div class="report-card">${sections}</div>
    <p class="report-disclaimer">For guidance and reflection only — not a clinical assessment or a prediction of any outcome.</p>
    ${linksBlock}
    <div style="display:flex;gap:10px;margin-top:24px;">
      <button class="btn btn-secondary btn-pdf" style="flex:1;" onclick="window.print()">Save as PDF</button>
    </div>`;
  animateProfileBars(el);
}

// Copy a couple-feedback link to the clipboard, with brief button feedback.
function copyFbLink(btn, url) {
  const done = () => { const t = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = t; }, 1500); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done, () => window.prompt('Copy this link:', url));
  } else {
    window.prompt('Copy this link:', url);
  }
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
    err.textContent = (e && e.message) ? e.message : 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
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

/* ── Tab 4: Insights (feedback analysis) ────────────────────────────────────
   Reads the three feedback tabs (getfeedback), joins each row to the person's
   questionnaire (by email) for demographics, and aggregates by question using
   the FORMS definitions in feedback.js. Filter + split-compare, no spreadsheet.
   ─────────────────────────────────────────────────────────────────────────── */
let ALL_FEEDBACK = null;
const FB_TYPES = [
  { id: 'assessment', label: 'Assessment', arr: 'fb_assessment' },
  { id: 'profile',    label: 'Profile',    arr: 'fb_profile' },
  { id: 'match',      label: 'Match',      arr: 'fb_match' }
];
let INS = { type: 'assessment', gender: '', ageband: '', city: '', days: 0, compare: 'none' };
// All feedback scale questions are agree/disagree statements → label 1–5 with words.
const AGREE5 = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
const agreeWord = avg => (avg == null ? '' : (AGREE5[Math.max(0, Math.min(4, Math.round(avg) - 1))] || ''));

async function loadInsights() {
  const spin = document.getElementById('insights-spinner');
  const res = document.getElementById('insights-result');
  spin.style.display = 'inline-block';
  try {
    if (typeof FORMS === 'undefined') throw new Error('feedback.js not loaded (FORMS missing).');
    await loadAllPeople();                       // for the demographic join
    if (!ALL_FEEDBACK) {
      const url = `${APPS_SCRIPT_URL}?action=getfeedback&token=${encodeURIComponent(ADMIN_TOKEN_SESSION)}`;
      const r = await fetch(url); const d = await r.json();
      if (d && d.ok === false) throw new Error(d.error === 'unauthorized' ? 'Backend rejected the code — did you redeploy Apps Script after adding getfeedback?' : ('Backend error: ' + d.error));
      ALL_FEEDBACK = d;
    }
    renderInsightsControls();
    applyInsights();
  } catch (e) {
    res.innerHTML = `<div class="error-msg visible">${escA(e.message || 'Could not load feedback.')}</div>`;
  } finally { spin.style.display = 'none'; }
}

function insDemoMap() {
  const m = {};
  (ALL_PEOPLE || []).forEach(p => {
    const e = (p.email || '').trim().toLowerCase();
    if (e) m[e] = { gender: (p.filters.Gender || '').trim(), age: Number(p.filters.Age) || null, city: (p.filters.City || '').trim() };
  });
  return m;
}
function insAgeBand(a) { if (a == null || isNaN(a)) return 'Unknown'; if (a <= 25) return '18–25'; if (a <= 32) return '26–32'; if (a <= 40) return '33–40'; return '41+'; }
function insCol(postType, q) { return q.field || (postType + '_q' + q.n); }
function insMean(nums) { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null; }

// Rows for the selected type, each annotated with its person's demographics.
function insRows() {
  const t = FB_TYPES.find(x => x.id === INS.type);
  const rows = (ALL_FEEDBACK && ALL_FEEDBACK[t.arr]) ? ALL_FEEDBACK[t.arr] : [];
  const demo = insDemoMap();
  return rows.map(r => {
    const d = demo[(r.email || '').trim().toLowerCase()] || {};
    return Object.assign({}, r, { _gender: d.gender || 'Unknown', _ageband: insAgeBand(d.age), _city: d.city || 'Unknown' });
  });
}

function renderInsightsControls() {
  const genders = [...new Set((ALL_PEOPLE || []).map(p => (p.filters.Gender || '').trim()).filter(Boolean))].sort();
  const cities = [...new Set((ALL_PEOPLE || []).map(p => (p.filters.City || '').trim()).filter(Boolean))].sort();
  const opt = (v, cur) => `<option value="${escA(v)}" ${cur === v ? 'selected' : ''}>${escA(v)}</option>`;
  const res = document.getElementById('insights-result');
  res.innerHTML = `
    <div class="top-filters" style="margin-top:14px;">
      <div class="field"><label>Feedback</label><select id="ins-type">${FB_TYPES.map(t => `<option value="${t.id}" ${INS.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
      <div class="field"><label>Gender</label><select id="ins-gender"><option value="">Any</option>${genders.map(g => opt(g, INS.gender)).join('')}</select></div>
      <div class="field"><label>Age</label><select id="ins-age"><option value="">Any</option>${['18–25','26–32','33–40','41+'].map(a => opt(a, INS.ageband)).join('')}</select></div>
      <div class="field"><label>City</label><select id="ins-city"><option value="">Any</option>${cities.map(c => opt(c, INS.city)).join('')}</select></div>
      <div class="field"><label>When</label><select id="ins-when"><option value="0">Any time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
      <div class="field"><label>Compare by</label><select id="ins-compare">
        <option value="none">— none —</option><option value="_gender">Gender</option><option value="_ageband">Age band</option><option value="_city">City</option>
      </select></div>
    </div>
    <div id="ins-output"></div>`;
  const bind = (id, key, num) => document.getElementById(id).addEventListener('change', e => { INS[key] = num ? Number(e.target.value) : e.target.value; applyInsights(); });
  bind('ins-type', 'type'); bind('ins-gender', 'gender'); bind('ins-age', 'ageband'); bind('ins-city', 'city'); bind('ins-when', 'days', true); bind('ins-compare', 'compare');
}

function insFilter(rows) {
  const cutoff = INS.days ? Date.now() - INS.days * 86400000 : 0;
  return rows.filter(r => {
    if (INS.gender && r._gender !== INS.gender) return false;
    if (INS.ageband && r._ageband !== INS.ageband) return false;
    if (INS.city && r._city !== INS.city) return false;
    if (cutoff) { const ts = r.timestamp ? new Date(r.timestamp).getTime() : NaN; if (isNaN(ts) || ts < cutoff) return false; }
    return true;
  });
}

// Aggregate one question over a set of rows.
function insAgg(rows, postType, q) {
  const col = insCol(postType, q);
  const vals = rows.map(r => r[col]).filter(v => v !== undefined && v !== null && String(v).trim() !== '');
  if (q.t === 'scale') {
    const nums = vals.map(Number).filter(n => !isNaN(n));
    const dist = [0, 0, 0, 0, 0]; nums.forEach(n => { if (n >= 1 && n <= 5) dist[n - 1]++; });
    return { kind: 'scale', n: nums.length, avg: insMean(nums), dist };
  }
  if (q.t === 'open' || q.t === 'text') return { kind: 'text', n: vals.length, items: vals.map(String) };
  const counts = {};
  vals.forEach(v => String(v).split('|').forEach(o => { o = o.trim(); if (o) counts[o] = (counts[o] || 0) + 1; }));
  return { kind: 'choice', n: vals.length, counts, options: q.o && q.o.length ? q.o : Object.keys(counts) };
}

function insBar(pct, color) { return `<div style="background:#eee;border-radius:6px;height:8px;overflow:hidden;flex:1;"><div style="width:${pct}%;height:100%;background:${color || 'var(--terracotta)'};"></div></div>`; }

function applyInsights() {
  const out = document.getElementById('ins-output');
  const form = FORMS[INS.type]; const postType = form.postType;
  const all = insFilter(insRows());
  const questions = form.questions.filter(q => q.t !== 'email' && q.t !== 'name');

  // groups (compare)
  let groups;
  if (INS.compare === 'none') groups = [{ key: 'All', rows: all }];
  else {
    const by = {}; all.forEach(r => { const k = r[INS.compare] || 'Unknown'; (by[k] = by[k] || []).push(r); });
    groups = Object.keys(by).sort().map(k => ({ key: k, rows: by[k] }));
  }

  // overview — count unique respondents; rate = finishers who gave feedback (≤100%)
  const uniq = [...new Set(all.map(r => (r.email || '').trim().toLowerCase()).filter(Boolean))];
  const finishers = (ALL_PEOPLE || []).length;
  const demoM = insDemoMap();
  const matched = uniq.filter(e => demoM[e]).length;
  const noFilters = !INS.gender && !INS.ageband && !INS.city && !INS.days;
  let head = `${all.length} response${all.length === 1 ? '' : 's'}`;
  if (uniq.length && uniq.length !== all.length) head += ` from ${uniq.length} ${uniq.length === 1 ? 'person' : 'people'}`;
  if ((INS.type === 'assessment' || INS.type === 'profile') && finishers && noFilters) {
    head += ` · ${Math.round(matched / finishers * 100)}% of ${finishers} finishers gave feedback`;
    if (uniq.length > matched) head += ` <span class="org">(+${uniq.length - matched} from email(s) not in the assessment list)</span>`;
  }
  let html = `<div class="result-header">${escA(FB_TYPES.find(t => t.id === INS.type).label)} feedback — ${head}</div>`;
  if (INS.compare !== 'none') html += `<div class="top-count">Comparing: ${groups.map(g => `${escA(g.key)} (${g.rows.length})`).join('  ·  ')}</div>`;
  if (!all.length) { out.innerHTML = html + '<div class="top-count">No responses match these filters.</div>'; return; }

  // needs attention (lowest-rated scale questions, overall filtered set)
  const scaleStats = questions.filter(q => q.t === 'scale').map(q => ({ q, a: insAgg(all, postType, q) })).filter(x => x.a.n > 0).sort((a, b) => a.a.avg - b.a.avg).slice(0, 3);
  if (scaleStats.length) {
    html += `<div class="top-gatefilters" style="display:block;"><span class="tf-reasons-label">Lowest-rated</span><div style="margin-top:6px;">` +
      scaleStats.map(x => `<div style="font-size:0.85rem;color:var(--dark);margin:2px 0;">${escA(x.q.q)} — <strong style="color:var(--terracotta);">${x.a.avg.toFixed(1)}/5</strong> (${agreeWord(x.a.avg)}) <span class="org">(n=${x.a.n})</span></div>`).join('') +
      `</div></div>`;
  }

  // per question
  html += questions.map(q => {
    let body = '';
    if (INS.compare === 'none') {
      const a = insAgg(all, postType, q);
      if (!a.n) return `<div class="report-section"><div class="report-section-label">${escA(q.q)}</div><p class="top-count">No answers.</p></div>`;
      if (a.kind === 'scale') {
        body = `<div style="font-size:0.9rem;margin-bottom:6px;">Average <strong style="color:var(--terracotta);">${a.avg.toFixed(1)}/5</strong> — ${agreeWord(a.avg)} <span class="org">(n=${a.n})</span></div>` +
          a.dist.map((c, i) => `<div style="display:flex;align-items:center;gap:8px;margin:3px 0;font-size:0.8rem;"><span style="flex:0 0 44%;">${i + 1} · ${AGREE5[i]}</span>${insBar(a.n ? c / a.n * 100 : 0)}<span style="width:60px;text-align:right;">${c} (${a.n ? Math.round(c / a.n * 100) : 0}%)</span></div>`).join('');
      } else if (a.kind === 'choice') {
        body = a.options.map(o => { const c = a.counts[o] || 0; const pct = a.n ? Math.round(c / a.n * 100) : 0; return `<div style="display:flex;align-items:center;gap:8px;margin:3px 0;font-size:0.82rem;"><span style="flex:0 0 42%;">${escA(o)}</span>${insBar(pct)}<span style="width:54px;text-align:right;">${pct}% (${c})</span></div>`; }).join('');
      } else {
        body = `<details><summary style="cursor:pointer;font-size:0.85rem;color:var(--forest);">${a.n} comment${a.n === 1 ? '' : 's'} — click to read</summary><div style="margin-top:8px;">` +
          a.items.map(t => `<p style="font-size:0.85rem;border-left:2px solid var(--terracotta);padding:2px 0 2px 10px;margin:6px 0;color:var(--dark);">${escA(t)}</p>`).join('') + `</div></details>`;
      }
    } else {
      // compare: compact table, columns = groups
      const aggs = groups.map(g => ({ key: g.key, a: insAgg(g.rows, postType, q) }));
      const head = `<tr><th style="text-align:left;font-weight:600;"></th>${aggs.map(x => `<th style="padding:2px 6px;font-size:0.78rem;color:var(--forest);">${escA(x.key)}<br><span class="org">n=${x.a.n}</span></th>`).join('')}</tr>`;
      let bodyRows = '';
      if (q.t === 'scale') {
        bodyRows = `<tr><td style="font-size:0.82rem;">Average /5</td>${aggs.map(x => `<td style="text-align:center;font-weight:700;color:var(--terracotta);">${x.a.avg != null ? x.a.avg.toFixed(1) + '<br><span class="org" style="font-weight:400;">' + agreeWord(x.a.avg) + '</span>' : '–'}</td>`).join('')}</tr>`;
      } else if (q.t === 'open' || q.t === 'text') {
        bodyRows = `<tr><td style="font-size:0.82rem;">Comments</td>${aggs.map(x => `<td style="text-align:center;">${x.a.n}</td>`).join('')}</tr>`;
      } else {
        const opts = (q.o && q.o.length) ? q.o : [...new Set(aggs.flatMap(x => Object.keys(x.a.counts)))];
        bodyRows = opts.map(o => `<tr><td style="font-size:0.8rem;">${escA(o)}</td>${aggs.map(x => { const c = x.a.counts[o] || 0; const pct = x.a.n ? Math.round(c / x.a.n * 100) : 0; return `<td style="text-align:center;font-size:0.8rem;">${pct}%</td>`; }).join('')}</tr>`).join('');
      }
      body = `<table style="width:100%;border-collapse:collapse;">${head}${bodyRows}</table>`;
    }
    return `<div class="report-section"><div class="report-section-label">${escA(q.q)}</div>${body}</div>`;
  }).join('');

  out.innerHTML = `<div class="report-card" style="margin-top:14px;">${html}</div>`;
}
