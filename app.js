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
    const id = `opt-${q.field}-${o.v}`;
    const chk = cur === o.v ? 'checked' : '';
    return `<div class="choice-option"><input type="radio" id="${id}" name="${q.field}" value="${o.v}" ${chk}><label for="${id}">${escHtml(o.label)}</label></div>`;
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
  const reqMark = f.mandate === 'M' ? ' <span class="req">*</span>' : ' <span class="org">(optional)</span>';
  let control = '';
  if (f.type === 'select') {
    const opts = ['<option value="">Select…</option>']
      .concat(f.options.map(o => `<option value="${escHtml(o)}" ${cur === o ? 'selected' : ''}>${escHtml(o)}</option>`)).join('');
    control = `<select id="hf-${f.id}" data-field="${f.field}">${opts}</select>`;
  } else if (f.type === 'number') {
    control = `<input type="number" id="hf-${f.id}" data-field="${f.field}" min="${f.min}" max="${f.max}" placeholder="${f.min}–${f.max}" value="${escHtml(cur || '')}">`;
  } else if (f.type === 'text') {
    control = `<input type="text" id="hf-${f.id}" data-field="${f.field}" placeholder="e.g. Amsterdam" value="${escHtml(cur || '')}">`;
  } else if (f.type === 'multi') {
    const arr = Array.isArray(cur) ? cur : (cur ? String(cur).split('|') : []);
    control = `<div id="hf-${f.id}" data-field="${f.field}">` +
      f.options.map((o, i) => {
        const id = `chk-${f.id}-${i}`;
        return `<div class="checkbox-option"><input type="checkbox" id="${id}" value="${escHtml(o)}" ${arr.includes(o) ? 'checked' : ''}><label for="${id}">${escHtml(o)}</label></div>`;
      }).join('') + `</div>`;
  }
  return `<div class="field" data-filter="${f.id}"><label>${escHtml(f.label)}${reqMark}</label>${control}</div>`;
}

// Render the two age-range fields side by side as one premium row.
function renderAgeRow() {
  const min = HARD_FILTERS.find(f => f.id === 'AgeMin');
  const max = HARD_FILTERS.find(f => f.id === 'AgeMax');
  const box = (f, lbl) => `<div class="field" data-filter="${f.id}"><label>${lbl}</label>
    <input type="number" id="hf-${f.id}" data-field="${f.field}" min="${f.min}" max="${f.max}" placeholder="${f.min}–${f.max}" value="${escHtml(state.answers[f.field] || '')}"></div>`;
  return `<div class="field"><label class="field-group-label">Partner age range <span class="req">*</span></label>
    <div class="field-row">${box(min, 'Minimum')}${box(max, 'Maximum')}</div></div>`;
}

/* ── build all screens ──────────────────────────────────────────────────────*/
function init() {
  const app = document.getElementById('app');

  // 0 — Welcome + about you + Article-9 consent (§9), all on one page
  const intro = makeScreen('screen-intro');
  intro.innerHTML = `${logoHtml(true)}
    <h1>Meant to align</h1>
    <div class="dim-callout"><span class="dim-callout-icon">i</span><div><strong>Welcome 👋 — and thank you for being one of the first to try Alunn.</strong><br><br>Alunn is a personality-first dating concept: instead of judging on photos, it matches people on what actually keeps relationships together — how you attach, communicate, handle closeness, and what you want from love.<br><br>What you're filling in now is the <strong>core foundation set</strong> — about 20 questions (~5 minutes) that sketch your compatibility profile. The full Alunn goes further: extra question sets that deepen and sharpen your profile's accuracy, plus the complete app — a personal profile, browsing and matching, messaging, and seeing how compatible you are with someone <em>before</em> you connect. For this beta we're starting with just the core set — enough to give you a real profile and test the concept.<br><br>There are no right or wrong answers. Your honest responses — and your reactions afterwards — are what shape what Alunn becomes.</div></div>
    <div class="section-divider">Let's start with you</div>
    <div class="field"><label>First name <span class="req">*</span></label>
      <input type="text" id="input-name" placeholder="Your first name" autocomplete="given-name" value="${escHtml(state.name)}"></div>
    <div class="field"><label>Email <span class="req">*</span></label>
      <input type="email" id="input-email" placeholder="you@example.com" autocomplete="email" value="${escHtml(state.email)}">
      <p class="field-hint">We use this to save your profile and (with your permission) tell you about matches. No spam.</p></div>
    <div class="consent-wrap">
      <input type="checkbox" id="input-consent" ${state.consent ? 'checked' : ''}>
      <label for="input-consent"><strong>I give my explicit consent.</strong>
        This assessment asks about sensitive things — your sexual orientation, religion, political leaning, intimacy and personality. I explicitly consent to Alunn processing these special categories of personal data (GDPR Article&nbsp;9) solely to generate my compatibility profile and matches. I can withdraw consent and ask for my data to be deleted at any time.</label>
    </div>
    <div class="error-msg" id="err-you">Please enter your first name, a valid email, and tick the consent box to continue.</div>
    <button class="btn" id="btn-you-next">Start the assessment</button>`;
  app.appendChild(intro); screens.push(intro);

  // 1 — Setup (hard filters)
  const setup = makeScreen('screen-setup');
  const mand = HARD_FILTERS.filter(f => f.mandate === 'M' && f.id !== 'AgeMin' && f.id !== 'AgeMax');
  const opt = HARD_FILTERS.filter(f => f.mandate === 'O');
  // Insert the side-by-side age row right after the "Age" field.
  const mandHtml = mand.map(f => f.id === 'Age' ? renderFilter(f) + renderAgeRow() : renderFilter(f)).join('');
  setup.innerHTML = `${logoHtml(true)}
    <h2>Your details &amp; preferences</h2>
    <div class="dim-callout"><span class="dim-callout-icon">i</span><div>These help us match you with the right people. Fields marked <span class="req">*</span> are needed to match; the optional ones simply sharpen your matches. Nothing here is shared publicly.</div></div>
    <div class="section-divider">Required</div>
    ${mandHtml}
    <div class="section-divider">Optional — refine your matches</div>
    ${opt.map(renderFilter).join('')}
    <div class="error-msg" id="err-setup">Please complete all required fields (and make sure the maximum age is at least the minimum).</div>
    <button class="btn" id="btn-setup-next">Continue to the questions</button>
    <button class="btn btn-secondary" id="btn-setup-back">Back</button>`;
  app.appendChild(setup); screens.push(setup);

  // 2..N — question groups
  QUESTION_GROUPS.forEach((g, i) => screens.push(buildQScreen(app, g, 2 + i)));

  // Priorities — rank your top 3 dimensions (feeds personal match weighting)
  const priority = makeScreen('screen-priority');
  const dimList = PRIORITY_DIMS.map(d => `<li><strong>${escHtml(d.label)}</strong> — ${escHtml(d.def)}</li>`).join('');
  const prefSelect = (n, lbl) => {
    const cur = state.answers['PREF_W' + n] || '';
    const opts = ['<option value="">Select…</option>']
      .concat(PRIORITY_DIMS.map(d => `<option value="${d.code}" ${cur === d.code ? 'selected' : ''}>${escHtml(d.label)}</option>`)).join('');
    return `<div class="field"><label>${lbl} <span class="req">*</span></label><select id="pref-${n}" data-field="PREF_W${n}">${opts}</select></div>`;
  };
  priority.innerHTML = `${logoHtml(true)}
    <p class="step-counter">Last step — your priorities</p>
    <h2>What matters most to you?</h2>
    <div class="dim-callout"><span class="dim-callout-icon">i</span><div>Everyone weighs compatibility differently. Tell us which dimensions matter <strong>most to you</strong> and we'll tilt your matches toward them — on top of the science, never instead of it. Pick your <strong>top three, in order</strong>.</div></div>
    <ul class="priority-defs">${dimList}</ul>
    ${prefSelect(1, '1 — Most important')}
    ${prefSelect(2, '2 — Second')}
    ${prefSelect(3, '3 — Third')}
    <div class="error-msg" id="err-priority">Please choose three <em>different</em> dimensions for your top three.</div>
    <button class="btn" id="btn-priority-next">Continue</button>
    <button class="btn btn-secondary" id="btn-priority-back">Back</button>`;
  app.appendChild(priority); screens.push(priority);

  // last-1 — report
  // N-1 — assessment-experience feedback (shown BEFORE the profile)
  const assessFb = makeScreen('screen-assess-fb');
  assessFb.innerHTML = `${logoHtml(true)}
    <p class="step-counter">Before your results</p>
    <h2>Quick reactions first</h2>
    <div class="dim-callout"><span class="dim-callout-icon">i</span><div>You're done — your profile is ready. Before we show it, a few quick questions about how the assessment <strong>felt</strong>. Honest reactions, even critical ones, are the most valuable thing you can give this beta.</div></div>
    <div id="assess-fb-mount"></div>`;
  app.appendChild(assessFb); screens.push(assessFb);

  // N — profile reveal
  const report = makeScreen('screen-report');
  report.innerHTML = `<div id="report-content"></div>`;
  app.appendChild(report); screens.push(report);

  wireEvents();
  showScreen(0);
  flushPending(); // retry a previous visit's save if it never confirmed
}

function buildQScreen(app, group, stepNum) {
  const screen = makeScreen('screen-q-' + stepNum);
  const part = stepNum - 1; // question groups start at screen index 2 → Part 1
  const total = QUESTION_GROUPS.length;
  const qsHtml = group.questions.map(q => q.type === 'scale' ? renderScale(q) : renderChoice(q)).join('');
  screen.innerHTML = `${logoHtml(true)}
    <p class="step-counter">Part ${part} of ${total}</p>
    <h2>${escHtml(group.title)}</h2>
    <div class="dim-callout"><span class="dim-callout-icon">i</span><div>${group.intro}</div></div>
    ${qsHtml}
    <div class="error-msg" id="err-q-${stepNum}">Please answer every question to continue.</div>`;
  app.appendChild(screen);

  // wire radios + nav after the screen exists in the DOM (done in wireEvents via delegation)
  screen.dataset.step = stepNum;
  screen.dataset.fields = group.questions.map(q => q.field).join(',');
  return screen;
}

function wireEvents() {
  // Welcome page → consent gate
  document.getElementById('btn-you-next').addEventListener('click', () => {
    const name = document.getElementById('input-name').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const consent = document.getElementById('input-consent').checked;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk || !consent) {
      document.getElementById('err-you').classList.add('visible');
      const focusId = !name ? 'input-name' : (!emailOk ? 'input-email' : 'input-consent');
      document.getElementById(focusId).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    document.getElementById('err-you').classList.remove('visible');
    state.name = name;
    state.email = email;
    state.consent = true;
    state.consentAt = new Date().toISOString();
    saveProgress();
    showScreen(1);
  });

  // Setup → mandatory gate
  document.getElementById('btn-setup-back').addEventListener('click', () => showScreen(0));
  document.getElementById('btn-setup-next').addEventListener('click', collectAndValidateSetup);

  // Priorities → persist on change, require three distinct, then feedback + reveal
  const priorityScreen = document.getElementById('screen-priority');
  priorityScreen.addEventListener('change', e => {
    if (e.target.dataset && e.target.dataset.field) { state.answers[e.target.dataset.field] = e.target.value; saveProgress(); }
  });
  document.getElementById('btn-priority-back').addEventListener('click', () => {
    showScreen(screens.findIndex(s => s.id === 'screen-priority') - 1);
  });
  document.getElementById('btn-priority-next').addEventListener('click', () => {
    const picks = [1, 2, 3].map(n => document.getElementById('pref-' + n).value);
    const distinct = new Set(picks.filter(Boolean));
    if (picks.some(p => !p) || distinct.size !== 3) {
      document.getElementById('err-priority').classList.add('visible');
      return;
    }
    document.getElementById('err-priority').classList.remove('visible');
    picks.forEach((code, i) => { state.answers['PREF_W' + (i + 1)] = code; });
    saveProgress();
    enterAssessFeedback();
  });

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
      // If the next screen is the assessment-feedback step, save answers and open it.
      if (screens[idx + 1] && screens[idx + 1].id === 'screen-assess-fb') {
        enterAssessFeedback();
      } else {
        showScreen(idx + 1);
      }
    });
    screen.querySelector('[data-qback]').addEventListener('click', () => showScreen(idx - 1));
  });
}

// Save the questionnaire (once), then show the embedded assessment-feedback form.
function enterAssessFeedback() {
  ensureSubmitted();
  const assessIdx = screens.findIndex(s => s.id === 'screen-assess-fb');
  const mount = document.getElementById('assess-fb-mount');
  if (mount && !mount.dataset.rendered) {
    mount.dataset.rendered = '1';
    fbRenderInto('assessment', mount, {
      embedded: true,
      presetEmail: state.email,
      submitLabel: 'Send & reveal my profile',
      onSubmitted: () => { ensureSubmitted(); revealProfile(); } // re-save as a safety net
    });
  }
  showScreen(assessIdx);
}

function revealProfile() {
  const scores = scoreAnswers(state.answers);
  renderProfile(buildProfileReport(scores, state.name));
  showScreen(screens.findIndex(s => s.id === 'screen-report'));
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
  showScreen(2);
}

/* ── Reliable questionnaire save ─────────────────────────────────────────────
   • Confirmed: reads the server's {ok:true} reply, so we KNOW it saved.
   • Idempotent: each submission carries a submissionId; the backend skips
     duplicates, so retries never create double rows.
   • Durable: the pending submission is held in localStorage until confirmed,
     and retried automatically on the next visit if it didn't go through.
   ─────────────────────────────────────────────────────────────────────────── */
const PENDING_KEY = 'alunn_v9_pending';
let submitted = false;
let currentSid = null;

function newSubmissionId() { return 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// POST and read the server's confirmation. true only if the server said ok.
async function postConfirmed(payload) {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return !!(data && data.ok);
  } catch (e) { return false; } // network error or unreadable reply → retry (safe, idempotent)
}

// Try to send whatever is queued in localStorage; clears it once confirmed.
async function flushPending() {
  let raw; try { raw = localStorage.getItem(PENDING_KEY); } catch (e) { return false; }
  if (!raw) return false;
  let payload; try { payload = JSON.parse(raw); } catch (e) { try { localStorage.removeItem(PENDING_KEY); } catch (_) {} return false; }
  for (let attempt = 1; attempt <= 4; attempt++) {
    if (await postConfirmed(payload)) { try { localStorage.removeItem(PENDING_KEY); } catch (e) {} return true; }
    await sleep(800 * attempt);
  }
  return false; // leave it queued for the next visit
}

async function ensureSubmitted() {
  if (submitted) return;
  if (!currentSid) currentSid = newSubmissionId();
  const payload = {
    type: 'questionnaire',
    name: state.name, email: state.email,
    consent: state.consent ? 'yes' : 'no', consentAt: state.consentAt || '',
    submissionId: currentSid,
    ...state.answers
  };
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(payload)); } catch (e) {}
  if (await flushPending()) submitted = true;
}

function renderProfile(report) {
  const el = document.getElementById('report-content');
  el.style.display = 'block';
  // Identical profile body for everyone (shared with the admin tool), plus the
  // assessment-only nudge to the accuracy feedback form.
  el.innerHTML = profileReportHTML(report) + `
    <div class="feedback-nudge">
      <p>One last thing — does this profile actually feel like you? Tell us where it's right and where it's off:</p>
      <a class="btn" href="fb-profile.html?email=${encodeURIComponent(state.email)}">Rate my profile's accuracy →</a>
    </div>`;
  animateProfileBars(el);
}

document.addEventListener('DOMContentLoaded', init);
