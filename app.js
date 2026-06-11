/* =============================================================================
   Alunn v9 — ASSESSMENT FLOW
   Intro → You (consent) → Setup (hard filters) → 20 questions → Profile report.
   Scoring is client-side (scorer.js); the Sheet only stores raw answers.
   ============================================================================= */

const state = loadProgress() || { name: '', email: '', consent: false, answers: {} };
function loadProgress() { try { return JSON.parse(localStorage.getItem('alunn_v9_progress')); } catch (e) { return null; } }
function saveProgress() { localStorage.setItem('alunn_v9_progress', JSON.stringify(state)); }

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const screens = [];
function showScreen(idx) {
  screens.forEach((s, i) => s.classList.toggle('active', i === idx));
  const pct = screens.length > 1 ? (idx / (screens.length - 1)) * 100 : 0;
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = pct + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function makeScreen(id) {
  const wrap = document.createElement('div');
  wrap.className = 'screen';
  wrap.id = id;
  return wrap;
}
function logoHtml(small) {
  return `<div class="logo-wrap${small ? ' logo-small' : ''}"><img src="logo.png" alt="Alunn"></div>`;
}

/* ── question renderers ─────────────────────────────────────────────────────*/
function renderScale(q) {
  const cur = state.answers[q.field] || '';
  const btns = SCALE_5.map(v => {
    const chk = String(cur) === v ? 'checked' : '';
    return `<label class="scale-option"><input type="radio" name="${q.field}" value="${v}" ${chk}><span class="scale-btn">${v}</span></label>`;
  }).join('');
  return `
    <div class="question-block" data-qid="${q.field}">
      <p class="question-text">${escHtml(q.text)}</p>
      <div class="scale-row">${btns}</div>
      <div class="scale-labels"><span class="scale-label">${escHtml(q.anchors[0])}</span><span class="scale-label">${escHtml(q.anchors[1])}</span></div>
    </div>`;
}
function renderChoice(q) {
  const cur = state.answers[q.field] || '';
  const opts = q.options.map(o => {
    const chk = cur === o.v ? 'checked' : '';
    return `<label class="choice-option"><input type="radio" name="${q.field}" value="${o.v}" ${chk}><span class="opt">${escHtml(o.label)}</span></label>`;
  }).join('');
  return `
    <div class="question-block" data-qid="${q.field}">
      <p class="question-text">${escHtml(q.text)}</p>
      <div class="choice-options">${opts}</div>
    </div>`;
}

/* ── hard-filter renderers ──────────────────────────────────────────────────*/
function renderFilter(f) {
  const cur = state.answers[f.field];
  const reqMark = f.mandate === 'M' ? '<span class="req">*</span>' : '<span class="org">(optional)</span>';
  const newMark = f.isNew ? ' <span class="org">· new</span>' : '';
  let control = '';
  if (f.type === 'select') {
    const opts = ['<option value="">Select…</option>']
      .concat(f.options.map(o => `<option value="${escHtml(o)}" ${cur === o ? 'selected' : ''}>${escHtml(o)}</option>`)).join('');
    control = `<select id="hf-${f.id}" data-field="${f.field}">${opts}</select>`;
  } else if (f.type === 'number') {
    control = `<input type="number" id="hf-${f.id}" data-field="${f.field}" min="${f.min}" max="${f.max}" value="${escHtml(cur || '')}">`;
  } else if (f.type === 'text') {
    control = `<input type="text" id="hf-${f.id}" data-field="${f.field}" value="${escHtml(cur || '')}">`;
  } else if (f.type === 'multi') {
    const arr = Array.isArray(cur) ? cur : (cur ? String(cur).split('|') : []);
    control = `<div class="choice-options" id="hf-${f.id}" data-field="${f.field}">` +
      f.options.map(o => `<label class="checkbox-option"><input type="checkbox" value="${escHtml(o)}" ${arr.includes(o) ? 'checked' : ''}><span class="opt">${escHtml(o)}</span></label>`).join('') +
      `</div>`;
  }
  return `<div class="field" data-filter="${f.id}"><label>${escHtml(f.label)} ${reqMark}${newMark}</label>${control}</div>`;
}

/* ── build all screens ──────────────────────────────────────────────────────*/
function init() {
  const app = document.getElementById('app');

  // 0 — Intro
  const intro = makeScreen('screen-intro');
  intro.innerHTML = `${logoHtml()}
    <h1>Meant to align</h1>
    <p class="screen-intro-text">A personality-first dating concept. Answer 20 questions and get a psychological compatibility profile — before you ever swipe. This is a free beta: your honest reactions shape what Alunn becomes.</p>
    <button class="btn" id="btn-start">Get started</button>`;
  app.appendChild(intro); screens.push(intro);

  // 1 — You + Article-9 consent (§9)
  const you = makeScreen('screen-you');
  you.innerHTML = `${logoHtml(true)}
    <h2>About you</h2>
    <div class="field"><label>First name <span class="org">(optional)</span></label>
      <input type="text" id="input-name" placeholder="Your first name" autocomplete="given-name" value="${escHtml(state.name)}"></div>
    <div class="field"><label>Email <span class="req">*</span></label>
      <input type="email" id="input-email" placeholder="you@example.com" autocomplete="email" value="${escHtml(state.email)}"></div>
    <div class="consent-wrap">
      <label class="checkbox-option">
        <input type="checkbox" id="input-consent" ${state.consent ? 'checked' : ''}>
        <span class="opt"><strong>Explicit consent to process special-category data.</strong>
        This assessment asks about your sexual orientation, religion, political leaning, intimacy and personality. I explicitly consent to Alunn collecting and processing these special categories of personal data (GDPR Article 9) for the sole purpose of generating my compatibility profile and matches. I can withdraw consent and request deletion at any time.</span>
      </label>
    </div>
    <div class="error-msg" id="err-you">Please enter a valid email and tick the consent box to continue.</div>
    <button class="btn" id="btn-you-next">Continue</button>`;
  app.appendChild(you); screens.push(you);

  // 2 — Setup (hard filters)
  const setup = makeScreen('screen-setup');
  const mand = HARD_FILTERS.filter(f => f.mandate === 'M');
  const opt = HARD_FILTERS.filter(f => f.mandate === 'O');
  setup.innerHTML = `${logoHtml(true)}
    <h2>Your details & preferences</h2>
    <p class="screen-intro-text">Required fields <span class="req">*</span> let us match you accurately. Optional ones refine your matches.</p>
    <div class="section-divider">Required</div>
    ${mand.map(renderFilter).join('')}
    <div class="section-divider">Optional</div>
    ${opt.map(renderFilter).join('')}
    <div class="error-msg" id="err-setup">Please complete all required fields (and make sure max age is ≥ min age).</div>
    <button class="btn" id="btn-setup-next">Continue</button>
    <button class="btn btn-secondary" id="btn-setup-back">Back</button>`;
  app.appendChild(setup); screens.push(setup);

  // 3..N — question groups
  QUESTION_GROUPS.forEach((g, i) => screens.push(buildQScreen(app, g, 3 + i)));

  // last-1 — report
  const report = makeScreen('screen-report');
  report.innerHTML = `${logoHtml(true)}
    <h2>Your profile</h2>
    <p class="screen-intro-text">Generated from your answers. A starting point for reflection, not a verdict.</p>
    <div class="error-msg" id="err-submit">Something went wrong — please try again.</div>
    <button class="btn" id="btn-submit">Submit &amp; reveal my profile</button>
    <button class="btn btn-secondary" id="btn-report-back">Back</button>
    <div id="report-content" style="display:none;"></div>`;
  app.appendChild(report); screens.push(report);

  wireEvents();
  showScreen(0);
}

function buildQScreen(app, group, stepNum) {
  const screen = makeScreen('screen-q-' + stepNum);
  const qsHtml = group.questions.map(q => q.type === 'scale' ? renderScale(q) : renderChoice(q)).join('');
  screen.innerHTML = `${logoHtml(true)}
    <p class="step-counter">${escHtml(group.title)}</p>
    <h2>${escHtml(group.title)}</h2>
    <p class="screen-intro-text">${escHtml(group.intro)}</p>
    ${qsHtml}
    <div class="error-msg" id="err-q-${stepNum}">Please answer every question to continue.</div>`;
  app.appendChild(screen);

  // wire radios + nav after the screen exists in the DOM (done in wireEvents via delegation)
  screen.dataset.step = stepNum;
  screen.dataset.fields = group.questions.map(q => q.field).join(',');
  return screen;
}

function wireEvents() {
  document.getElementById('btn-start').addEventListener('click', () => showScreen(1));

  // You → consent gate
  document.getElementById('btn-you-next').addEventListener('click', () => {
    const email = document.getElementById('input-email').value.trim();
    const consent = document.getElementById('input-consent').checked;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk || !consent) { document.getElementById('err-you').classList.add('visible'); return; }
    state.name = document.getElementById('input-name').value.trim();
    state.email = email;
    state.consent = true;
    state.consentAt = new Date().toISOString();
    saveProgress();
    showScreen(2);
  });

  // Setup → mandatory gate
  document.getElementById('btn-setup-back').addEventListener('click', () => showScreen(1));
  document.getElementById('btn-setup-next').addEventListener('click', collectAndValidateSetup);

  // Question screens: nav buttons appended dynamically
  screens.forEach((screen, idx) => {
    if (!screen.id.startsWith('screen-q-')) return;
    const step = screen.dataset.step;
    const navDiv = document.createElement('div');
    navDiv.innerHTML = `<button class="btn" data-qnext>Continue</button><button class="btn btn-secondary" data-qback>Back</button>`;
    screen.appendChild(navDiv);

    // store answers on change
    screen.addEventListener('change', e => {
      if (e.target.name) { state.answers[e.target.name] = e.target.value; saveProgress(); }
    });
    screen.querySelector('[data-qnext]').addEventListener('click', () => {
      const fields = screen.dataset.fields.split(',');
      const missing = fields.filter(f => !state.answers[f]);
      if (missing.length) {
        document.getElementById('err-q-' + step).classList.add('visible');
        screen.querySelector(`[data-qid="${missing[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      document.getElementById('err-q-' + step).classList.remove('visible');
      showScreen(idx + 1);
    });
    screen.querySelector('[data-qback]').addEventListener('click', () => showScreen(idx - 1));
  });

  document.getElementById('btn-report-back').addEventListener('click', () => showScreen(screens.length - 2));
  document.getElementById('btn-submit').addEventListener('click', submitAndScore);
}

function collectAndValidateSetup() {
  HARD_FILTERS.forEach(f => {
    const el = document.getElementById('hf-' + f.id);
    if (!el) return;
    if (f.type === 'multi') {
      const vals = [...el.querySelectorAll('input:checked')].map(i => i.value);
      state.answers[f.field] = vals.length ? vals.join('|') : '';
    } else {
      state.answers[f.field] = el.value.trim();
    }
  });
  saveProgress();

  const missing = MANDATORY_FILTERS.filter(id => {
    const f = HARD_FILTERS.find(x => x.id === id);
    return !state.answers[f.field];
  });
  const aMin = Number(state.answers.AgeMin), aMax = Number(state.answers.AgeMax);
  const ageBad = state.answers.AgeMin && state.answers.AgeMax && aMax < aMin;

  if (missing.length || ageBad) {
    document.getElementById('err-setup').classList.add('visible');
    if (missing.length) document.querySelector(`[data-filter="${missing[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  document.getElementById('err-setup').classList.remove('visible');
  showScreen(3);
}

/* ── submit + score ─────────────────────────────────────────────────────────*/
async function submitAndScore() {
  const btn = document.getElementById('btn-submit');
  const err = document.getElementById('err-submit');
  btn.disabled = true; btn.textContent = 'Sending…';
  err.classList.remove('visible');

  const payload = {
    type: 'questionnaire',
    name: state.name, email: state.email,
    consent: state.consent ? 'yes' : 'no', consentAt: state.consentAt || '',
    ...state.answers
  };
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload), mode: 'no-cors'
    });
  } catch (e) { /* no-cors may throw; treat as sent */ }

  const scores = scoreAnswers(state.answers);
  const report = buildProfileReport(scores, state.name);
  renderProfile(report);

  btn.style.display = 'none';
  document.getElementById('btn-report-back').style.display = 'none';
}

function renderProfile(report) {
  const el = document.getElementById('report-content');
  el.style.display = 'block';

  const bars = report.dimensions.filter(d => d.score != null).map(d => `
    <div class="dim-bar-row">
      <div class="dim-bar-meta">
        <span class="dim-bar-label">${escHtml(d.name)}</span>
        ${d.label && d.label !== 'gen' ? `<span class="dim-bar-sub">${escHtml(d.label)}</span>` : ''}
      </div>
      <div class="dim-bar-track"><div class="dim-bar-fill" style="width:0%;background:#C1440E" data-pct="${d.score}"></div></div>
      <span class="dim-bar-pct">${d.score}</span>
    </div>`).join('');

  const sections = report.dimensions.map(d => `
    <div class="report-section">
      <div class="report-section-label">${escHtml(d.name)}</div>
      ${d.label && d.label !== 'gen' ? `<div class="report-section-type">${escHtml(d.label)}</div>` : ''}
      <p class="report-body">${escHtml(d.about)}</p>
      ${d.tip ? `<div class="match-tip-box"><span class="match-tip-label">Growth tip</span><span class="match-tip-text">${escHtml(d.tip)}</span></div>` : ''}
    </div>`).join('');

  const who = report.name && report.name !== 'You' ? `${escHtml(report.name)}'s profile` : 'Your profile';
  el.innerHTML = `
    <div class="report-chart-card">
      <p class="report-name">${who}</p>
      <p class="chart-title">Your dimensions <span class="org">· profile clarity ${report.clarity}%</span></p>
      <div class="dim-bars">${bars}</div>
    </div>
    <div class="report-card">${sections}</div>
    <p class="report-disclaimer">Alunn profiles are for personal guidance only — not a clinical assessment, and they don't predict any specific outcome. Use this as a starting point for reflection, not a verdict.</p>
    <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
      <button class="btn btn-secondary btn-pdf" style="flex:1;" onclick="window.print()">Save as PDF</button>
    </div>
    <div class="feedback-nudge">
      <p>Your honest reaction is the most valuable thing you can give this beta. Two quick forms:</p>
      <a class="btn" href="fb-assessment.html?email=${encodeURIComponent(state.email)}">How was the assessment? →</a>
      <a class="btn" href="fb-profile.html?email=${encodeURIComponent(state.email)}">Is your profile accurate? →</a>
    </div>`;

  requestAnimationFrame(() => setTimeout(() => {
    el.querySelectorAll('.dim-bar-fill').forEach(bar => {
      bar.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
      bar.style.width = bar.dataset.pct + '%';
    });
  }, 100));
}

document.addEventListener('DOMContentLoaded', init);
