/* =============================================================================
   Alunn v9 — SCORING ENGINE (client-side)
   Reproduces Alunn_Full_System_v9.xlsx (③ EFF, ④ SCORES, ⑤ PROFILE).
   Reads weights/maps from engine-config.js (ENGINE).
   ============================================================================= */

/* ── helpers ──────────────────────────────────────────────────────────────── */

// Mean of answered numeric items, ignoring blanks (partial-safe). null if none.
function avg(vals) {
  const valid = vals
    .filter(v => v !== undefined && v !== null && v !== '')
    .map(Number)
    .filter(v => !Number.isNaN(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

// Average a subscale's items × 20 → 0–100, applying reverse-keying. null if blank.
function subAvg20(answers, fields) {
  const vals = fields.map(f => {
    let v = answers[f];
    if (v === undefined || v === null || v === '') return null;
    v = Number(v);
    if (Number.isNaN(v)) return null;
    return ENGINE.reverseKeyed.includes(f) ? (6 - v) : v;
  });
  const m = avg(vals);
  return m === null ? null : m * 20;
}

const clamp100 = x => Math.max(0, Math.min(100, x));
const round = x => Math.round(x);

// Map a single polarity-pref choice (A/B/C) to 100/50/0; null if unanswered.
function polPref(answers, field) {
  const v = answers[field];
  if (v === undefined || v === null || v === '') return null;
  return ENGINE.polChoiceMap[String(v).trim().toUpperCase()] ?? null;
}

/* ── main scorer ────────────────────────────────────────────────────────────
   Input: flat answers object keyed by field code (e.g. {ATT_C01: 5, ...}).
   Output: per-dimension scores, labels, traits, prefs, clarity%.
   ─────────────────────────────────────────────────────────────────────────── */
function scoreAnswers(a) {
  const S = ENGINE.subscales;

  /* ── Attachment ── */
  const secure   = subAvg20(a, S.secure);
  const anxious  = subAvg20(a, S.anxious);
  const avoidant = subAvg20(a, S.avoidant);
  let attComp = null, attStyle = null;
  if (secure !== null && anxious !== null && avoidant !== null) {
    attComp = clamp100(secure - 0.4 * anxious - 0.4 * avoidant + 40);
    if (anxious >= 60 && avoidant >= 60 && secure < 60)      attStyle = 'Fearful';
    else if (secure >= 70)                                    attStyle = 'Secure';
    else if (anxious > avoidant)                              attStyle = 'Anxious';
    else if (avoidant > anxious)                              attStyle = 'Avoidant';
    else                                                      attStyle = 'Mixed';
  }

  /* ── Communication (4 styles, each avg×20; style = highest) ── */
  const comDir = subAvg20(a, S.comDir);
  const comExp = subAvg20(a, S.comExp);
  const comAna = subAvg20(a, S.comAna);
  const comHar = subAvg20(a, S.comHar);
  const comQual = subAvg20(a, S.comQual); // repair/quality (T202 reverse-keyed)
  const comVals = [comDir, comExp, comAna, comHar];
  const comMax = comVals.some(v => v !== null) ? Math.max(...comVals.filter(v => v !== null)) : null;
  let comStyle = null;
  // Tie-break order matches ④ SCORES ComStyle: Direct→Expressive→Analytical→Harmonious
  if (comMax !== null) {
    if (comDir === comMax)      comStyle = 'Direct';
    else if (comExp === comMax) comStyle = 'Expressive';
    else if (comAna === comMax) comStyle = 'Analytical';
    else                        comStyle = 'Harmonious';
  }

  /* ── Drive (count letters across DRV_C01..C05) ── */
  const driveLetters = ENGINE.driveCountFields
    .map(f => a[f]).filter(v => v !== undefined && v !== null && v !== '')
    .map(v => String(v).trim().toUpperCase());
  let drvB = null, drvC = null, drvE = null, drvN = null, drvType = null;
  if (driveLetters.length) {
    const n = driveLetters.length;
    const cnt = ch => driveLetters.filter(v => v === ch).length / n * 100;
    drvB = cnt('A'); drvC = cnt('B'); drvE = cnt('C'); drvN = cnt('D');
    // ④ SCORES DrvType tie-break: Builder→Companion→Explorer→Nurturer
    if (drvB >= drvC && drvB >= drvE && drvB >= drvN)      drvType = 'Builder';
    else if (drvC >= drvE && drvC >= drvN)                 drvType = 'Companion';
    else if (drvE >= drvN)                                 drvType = 'Explorer';
    else                                                   drvType = 'Nurturer';
  }

  /* ── Intimacy / Values / Lifestyle ── */
  const intLvl = subAvg20(a, S.intimacy);
  const valLvl = subAvg20(a, S.values);
  const moneyRaw = a[ENGINE.moneyField];
  const valMoney = (moneyRaw === undefined || moneyRaw === null || moneyRaw === '')
    ? null : (ENGINE.moneyChoiceMap[String(moneyRaw).trim().toUpperCase()] ?? null);
  // ValScore = (ValLvl + ValMoney)/2. Engine treats blank money as 100 via IF-else;
  // we mirror that only when valLvl exists, else partial-safe.
  let valScore = null;
  if (valLvl !== null) {
    const m = (valMoney === null) ? 100 : valMoney; // matches ④ SCORES else-branch
    valScore = (valLvl + m) / 2;
  }
  const lifLvl = subAvg20(a, S.lifestyle);

  /* ── Big Five traits ── */
  const bigO = subAvg20(a, S.bigO);
  const bigC = subAvg20(a, S.bigC);
  const bigE = subAvg20(a, S.bigE);
  const bigS = subAvg20(a, S.bigS);
  const bigA = subAvg20(a, S.bigA);
  const ambTrait = subAvg20(a, [ENGINE.ambTraitField]);

  /* ── Polarity preferences (per axis) ── */
  const pf = ENGINE.polPrefFields;
  const prefOverParts = pf.overarching.map(f => polPref(a, f)).filter(v => v !== null);
  const prefOver = prefOverParts.length ? avg(prefOverParts) : null;
  const prefSoc  = polPref(a, pf.social);
  const prefAmb  = polPref(a, pf.ambition);
  const prefOrg  = polPref(a, pf.organisation);
  const prefStab = polPref(a, pf.stability);
  const prefOpen = polPref(a, pf.openness);
  const prefExpr = polPref(a, pf.expression);
  const prefConf = polPref(a, pf.conflict);

  /* ── Personal dimension priorities (optional) ──
     PREF_W1..W3 store dimension codes the person ranked most important.
     Kept valid, de-duplicated and in order; null if none provided. */
  const validDims = DIMENSIONS.map(d => d.code);
  const prefSeen = {}, prefRank = [];
  ['PREF_W1', 'PREF_W2', 'PREF_W3'].forEach(f => {
    const v = a[f];
    if (v === undefined || v === null || v === '') return;
    const code = String(v).trim().toUpperCase();
    if (validDims.indexOf(code) !== -1 && !prefSeen[code]) { prefSeen[code] = 1; prefRank.push(code); }
  });

  /* ── Clarity% (answered scored fields / 86) ── */
  const scoredFields = scoredFieldList();
  const answeredCount = scoredFields.filter(f => {
    const v = a[f];
    return v !== undefined && v !== null && v !== '';
  }).length;
  const clarity = round(answeredCount / ENGINE.totalScoredFields * 100);

  return {
    // attachment
    secure, anxious, avoidant, attComp, attStyle,
    // communication
    comDir, comExp, comAna, comHar, comQual, comMax, comStyle,
    // drive
    drvB, drvC, drvE, drvN, drvType,
    // int / val / lif
    intLvl, valLvl, valMoney, valScore, lifLvl,
    // big five + ambition trait
    bigO, bigC, bigE, bigS, bigA, ambTrait,
    // polarity prefs
    prefOver, prefSoc, prefAmb, prefOrg, prefStab, prefOpen, prefExpr, prefConf,
    // personal dimension priorities (rank 1→3 of dimension codes), or null
    prefRank: prefRank.length ? prefRank : null,
    // meta
    clarity
  };
}

// Canonical scored-field list = the 86 INPUT fields clarity% is measured against.
function scoredFieldList() {
  return ENGINE.scoredFields;
}

/* ── Result labels (§7.1 label rules) ──────────────────────────────────────── */
function resultLabel(dim, scores) {
  const L = ENGINE.labelBands;
  switch (dim) {
    case 'ATT': return scores.attStyle;
    case 'COM': return scores.comStyle;
    case 'DRV': return scores.drvType;
    case 'POL': {
      const p = scores.prefOver;
      if (p === null) return null;
      return p >= L.POL.Similar ? 'Similar' : p >= L.POL.Balanced ? 'Balanced' : 'Different';
    }
    case 'INT': {
      const i = scores.intLvl;
      if (i === null) return null;
      return i >= L.INT.High ? 'High' : i >= L.INT.Moderate ? 'Moderate' : 'Reserved';
    }
    case 'VAL': {
      const v = scores.valLvl;
      if (v === null) return null;
      return v >= L.VAL.Progressive ? 'Progressive' : v >= L.VAL.Mixed ? 'Mixed' : 'Traditional';
    }
    case 'LIF': return lifestyleLabel(scores);
    default: return null;
  }
}

// A one-word Lifestyle outcome name, from social energy (bigE) + ambition (ambTrait).
function lifestyleLabel(scores) {
  const soc = scores.bigE, amb = scores.ambTrait;
  if (soc === null && amb === null) return null;
  const socHigh = soc !== null && soc >= 70;
  const socLow  = soc !== null && soc <= 40;
  const ambHigh = amb !== null && amb >= 80;
  const ambLow  = amb !== null && amb <= 40;
  if (socHigh && ambHigh) return 'Dynamic';
  if (socHigh)            return 'Social';
  if (socLow && ambHigh)  return 'Focused';
  if (socLow)             return 'Homebody';
  if (ambHigh)            return 'Driven';
  if (ambLow)             return 'Easygoing';
  return 'Balanced';
}

// Per-dimension headline score shown on the solo profile bar (0–100).
function dimScore(dim, scores) {
  switch (dim) {
    case 'ATT': return scores.attComp;
    case 'COM': return scores.comQual;   // communication quality/repair
    case 'POL': return scores.prefOver;
    case 'INT': return scores.intLvl;
    case 'VAL': return scores.valScore;
    case 'DRV': {                         // drive "clarity" = dominant type share
      const vals = [scores.drvB, scores.drvC, scores.drvE, scores.drvN].filter(v => v !== null);
      return vals.length ? Math.max(...vals) : null;
    }
    case 'LIF': return scores.lifLvl;
    default: return null;
  }
}

/* ── Lifestyle "about you" + tip, generated from the actual answers ──────────
   Beta lifestyle signal = ambition (ambTrait ← LIF_T103) + social energy
   (bigE ← BIG_C03). Falls back to the generic LIF|gen text if neither answered.
   ─────────────────────────────────────────────────────────────────────────── */
function lifestyleText(scores) {
  const amb = scores.ambTrait;  // 0–100 (1–5 item ×20)
  const soc = scores.bigE;      // 0–100 (extraversion / social energy)
  if (amb === null && soc === null) {
    return (typeof PROFILE_TEXT !== 'undefined' && PROFILE_TEXT['LIF|gen']) || { about: '', tip: '' };
  }

  const socPhrase = soc === null ? null
    : soc >= 70 ? 'socially energetic — you recharge around people and an active social life suits you'
    : soc <= 40 ? 'more low-key and home-centred — quiet time and smaller circles are how you recharge'
    : 'socially balanced — you enjoy people but value your quieter time too';

  const ambPhrase = amb === null ? null
    : amb >= 70 ? 'strongly driven about your career and goals'
    : amb <= 40 ? 'relaxed about career ambition, putting other parts of life first'
    : 'moderately ambitious — you care about progress without letting it run the show';

  let about;
  if (socPhrase && ambPhrase) {
    about = `Day to day, you're ${socPhrase}, and you're ${ambPhrase}. Lifestyle fit is really about matching rhythms — a partner whose social pace and ambition run at a similar speed to yours will mean less friction over time.`;
  } else if (socPhrase) {
    about = `Day to day, you're ${socPhrase}. Lifestyle fit is about matching rhythms — a partner with a similar social pace means less friction over time.`;
  } else {
    about = `On ambition, you're ${ambPhrase}. Lifestyle fit is about matching rhythms — a partner whose drive runs at a similar speed will feel easier over time.`;
  }

  // Tip keyed to the stronger signal.
  let tip;
  if (soc !== null && soc >= 70) tip = 'Look for a partner who enjoys an active social life too — or who is genuinely happy to let you have yours.';
  else if (soc !== null && soc <= 40) tip = "Say early that quiet nights in are how you recharge, so a more social partner doesn't read it as distance.";
  else if (amb !== null && amb >= 70) tip = 'Be clear that your drive matters to you, so you find someone who admires it rather than competes with it.';
  else tip = 'Talk about going-out-versus-staying-in and how much ambition matters early, before they become a recurring negotiation.';

  return { about, tip };
}

/* ── Values "about you" + tip, generated from the actual answer ──────────────
   Beta values signal = VAL_C01 (Traditional 1 ↔ 5 Progressive). Text stays
   consistent with the Progressive / Mixed / Traditional chip, with finer
   wording inside each band. Falls back to the library if unanswered.
   ─────────────────────────────────────────────────────────────────────────── */
function valuesText(scores) {
  const v = scores.valLvl; // 0–100 (1–5 item ×20)
  if (v === null) {
    return (typeof PROFILE_TEXT !== 'undefined' && PROFILE_TEXT['VAL|Mixed']) || { about: '', tip: '' };
  }
  const B = ENGINE.labelBands.VAL; // Progressive ≥67, Mixed ≥34, else Traditional
  if (v >= B.Progressive) {
    return {
      about: `Your outlook leans ${v >= 90 ? 'strongly progressive and open' : 'open and progressive'}. You'll connect most easily with someone who shares that worldview, especially on the things you hold strongly.`,
      tip: 'Find out early where a partner stands on the things you hold most strongly.'
    };
  }
  if (v >= B.Mixed) {
    const lean = v >= 55 ? 'a pragmatic middle, with a mild progressive lean'
              : v <= 45 ? 'a pragmatic middle, with a mild traditional lean'
              : 'a pragmatic middle';
    return {
      about: `Your values sit in ${lean} — you can bridge differing worldviews, which widens your compatible field.`,
      tip: "Decide which value differences are 'agree to differ' and which are genuinely non-negotiable."
    };
  }
  return {
    about: `Your outlook leans ${v <= 20 ? 'strongly traditional and grounded' : 'traditional and grounded'}. Shared values will matter to you; look for alignment on family and the things that anchor you.`,
    tip: 'Be clear about your anchors so a partner can meet them honestly.'
  };
}

/* ── Individual profile report (§7.1: score, bar, about-you, growth tip) ────── */
function buildProfileReport(scores, displayName) {
  const dims = DIMENSIONS.map(d => {
    const label = resultLabel(d.code, scores);
    const score = dimScore(d.code, scores);
    let txt;
    if (d.code === 'LIF') {
      txt = lifestyleText(scores);
    } else if (d.code === 'VAL') {
      txt = valuesText(scores);
    } else {
      const key = `${d.code}|${label}`;
      txt = (typeof PROFILE_TEXT !== 'undefined' && PROFILE_TEXT[key]) || { about: '', tip: '' };
    }
    return {
      code: d.code,
      name: d.name,
      label,
      score: score === null ? null : round(score),
      about: txt.about,
      tip: txt.tip
    };
  });
  return { name: displayName || 'You', clarity: scores.clarity, dimensions: dims };
}

/* ── Shared profile view ────────────────────────────────────────────────────
   ONE renderer for the individual profile, used by BOTH the assessment flow
   (app.js) and the admin tool (admin-ui.js) so they are byte-for-byte identical.
   Returns the inner HTML; call animateProfileBars(container) after injecting.
   ─────────────────────────────────────────────────────────────────────────── */
function profileEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function profileReportHTML(report) {
  const e = profileEsc;
  const bars = report.dimensions.filter(d => d.score != null).map(d => `
    <div class="dim-bar-row">
      <div class="dim-bar-meta">
        <span class="dim-bar-label">${e(d.name)}</span>
        ${d.label && d.label !== 'gen' ? `<span class="dim-bar-sub">${e(d.label)}</span>` : ''}
      </div>
      <div class="dim-bar-track"><div class="dim-bar-fill" style="width:0%;background:#C1440E" data-pct="${d.score}"></div></div>
      <span class="dim-bar-pct">${d.score}</span>
    </div>`).join('');

  const sections = report.dimensions.map(d => `
    <div class="report-section">
      <div class="report-section-label">${e(d.name)}</div>
      ${d.label && d.label !== 'gen' ? `<div class="report-section-type">${e(d.label)}</div>` : ''}
      <p class="report-body">${e(d.about)}</p>
      ${d.tip ? `<div class="match-tip-box"><span class="match-tip-label">Growth tip</span><span class="match-tip-text">${e(d.tip)}</span></div>` : ''}
    </div>`).join('');

  const who = report.name && report.name !== 'You' ? `${e(report.name)}'s profile` : 'Your profile';
  return `
    <div class="logo-wrap logo-small"><img src="logo.png" alt="Alunn"></div>
    <h2>Your profile</h2>
    <p class="screen-intro-text">Here's what your answers say about how you connect ✨ A starting point for reflection — not a verdict.</p>
    <div class="report-chart-card">
      <p class="report-name">${who}</p>
      <p class="chart-title">Your dimensions</p>
      <div class="dim-bars">${bars}</div>
      <p class="chart-legend">Each bar shows where you sit on that dimension (0–100) — how strongly that trait shows up in your answers, not a grade. Higher isn't "better"; it simply describes you.</p>
    </div>
    <div class="dim-callout" style="margin-top:16px;"><span class="dim-callout-icon">i</span><div>This beta uses Alunn's <strong>starter question set</strong>. The full version adds further question sets that deepen every dimension even more.</div></div>
    <div class="report-card">${sections}</div>
    <p class="report-disclaimer">Alunn profiles are for personal guidance only — not a clinical assessment, and they don't predict any specific outcome. Use this as a starting point for reflection, not a verdict.</p>
    <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
      <button class="btn btn-secondary btn-pdf" style="flex:1;" onclick="window.print()">Save as PDF</button>
    </div>`;
}

function animateProfileBars(container) {
  requestAnimationFrame(() => setTimeout(() => {
    container.querySelectorAll('.dim-bar-fill').forEach(bar => {
      bar.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
      bar.style.width = bar.dataset.pct + '%';
    });
  }, 100));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scoreAnswers, resultLabel, dimScore, buildProfileReport, lifestyleText, lifestyleLabel, valuesText, profileReportHTML, animateProfileBars, scoredFieldList, avg, subAvg20 };
}
