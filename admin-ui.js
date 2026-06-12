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

/* ── Tab 1: top matches ─────────────────────────────────────────────────────*/
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
    const showGated = document.getElementById('show-gated').checked;
    renderTopMatches(target, people, showGated);
  } catch (e) {
    err.textContent = 'Could not load data — check the backend URL / PIN.'; err.classList.add('visible');
  } finally { spin.style.display = 'none'; }
}

function renderTopMatches(target, people, showGated) {
  const el = document.getElementById('top-result');
  let rows;
  if (showGated) {
    rows = people.filter(p => p !== target)
      .map(p => ({ person: p, result: matchPair(target, p) }))
      .sort((a, b) => (b.result.overall || -1) - (a.result.overall || -1));
  } else {
    rows = rankMatches(target, people);
  }
  if (!rows.length) { el.innerHTML = `<p class="report-note">No eligible matches found.</p>`; return; }
  const cards = rows.map((r, i) => {
    const res = r.result, p = r.person;
    const blocked = res.blocked || res.hidden;
    const right = blocked
      ? `<span class="hf-badge-fail" title="${escA(res.blocked || 'Below display threshold')}">${res.blocked ? 'Gated' : 'Low'}</span>`
      : `<span class="top-match-stars">${res.stars}</span><span class="top-match-rank" style="width:auto;color:var(--forest);font-size:1rem;">${res.overall}</span>`;
    return `
      <div class="top-match-card">
        <span class="top-match-rank">${blocked ? '–' : i + 1}</span>
        <div class="top-match-info">
          <div class="top-match-name">${escA(p.name)}</div>
          <div class="top-match-types">${escA(p.scores.attStyle || '?')} · ${escA(p.scores.comStyle || '?')} · ${escA(p.scores.drvType || '?')}</div>
        </div>
        ${right}
        <button class="top-match-btn" onclick="loadMatchFromTop('${escA(target.email)}','${escA(p.email)}')">Report</button>
      </div>`;
  }).join('');
  el.innerHTML = `<div class="result-header">Matches for ${escA(target.name)}</div>${cards}`;
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
