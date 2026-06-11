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
    case 'LIF': return 'gen';
    default: return null;
  }
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

/* ── Individual profile report (§7.1: score, bar, about-you, growth tip) ────── */
function buildProfileReport(scores, displayName) {
  const dims = DIMENSIONS.map(d => {
    const label = resultLabel(d.code, scores);
    const score = dimScore(d.code, scores);
    const key = d.code === 'LIF' ? 'LIF|gen' : `${d.code}|${label}`;
    const txt = (typeof PROFILE_TEXT !== 'undefined' && PROFILE_TEXT[key]) || { about: '', tip: '' };
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scoreAnswers, resultLabel, dimScore, buildProfileReport, scoredFieldList, avg, subAvg20 };
}
