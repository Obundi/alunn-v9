/* =============================================================================
   Alunn v9 — MATCHING ENGINE (bidirectional)
   Reproduces Alunn_Full_System_v9.xlsx (⑥ MATCH).
   Reads ENGINE from engine-config.js. Polarity is direction-specific;
   all other dimensions are symmetric.

   A "person" = { filters: {...hard filters...}, scores: <scoreAnswers output> }.
   ============================================================================= */

const clampR = x => Math.round(Math.max(0, Math.min(100, x)));

/* ── Polarity: per-axis directional fit (§6.1) ──────────────────────────────
   Each axis pairs a stated preference (similar=100 … different=0) with the
   partner's underlying trait. fit = pref/100*(100-diff) + (100-pref)/100*diff.
   An axis is included only when its preference is answered and both traits
   exist (partial-safe). Overarching uses the mean of the per-axis diffs.
   ─────────────────────────────────────────────────────────────────────────── */
const POL_AXES = [
  { name: 'Social',       trait: 'bigE',     prefA: 'prefSoc',  prefB: 'prefSoc'  },
  { name: 'Ambition',     trait: 'ambTrait', prefA: 'prefAmb',  prefB: 'prefAmb'  },
  { name: 'Organisation', trait: 'bigC',     prefA: 'prefOrg',  prefB: 'prefOrg'  },
  { name: 'Stability',    trait: 'bigS',     prefA: 'prefStab', prefB: 'prefStab' },
  { name: 'Openness',     trait: 'bigO',     prefA: 'prefOpen', prefB: 'prefOpen' },
  { name: 'Expression',   trait: 'comExp',   prefA: 'prefExpr', prefB: 'prefExpr' },
  { name: 'Conflict',     trait: 'comDir',   prefA: 'prefConf', prefB: 'prefConf' }
];

function fit(pref, diff) {
  return pref / 100 * (100 - diff) + (100 - pref) / 100 * diff;
}

function polarityMatch(A, B) {
  const rows = [];
  const diffs = [];
  for (const ax of POL_AXES) {
    const tA = A[ax.trait], tB = B[ax.trait];
    const pA = A[ax.prefA], pB = B[ax.prefB];
    if (tA === null || tB === null || pA === null || pB === null) continue;
    const diff = Math.abs(tA - tB);
    diffs.push(diff);
    rows.push({ name: ax.name, diff, aToB: fit(pA, diff), bToA: fit(pB, diff) });
  }
  if (!rows.length) return { match: null, rows: [] };

  // Overarching row uses prefOver against the mean of the per-axis diffs.
  if (A.prefOver !== null && B.prefOver !== null) {
    const overDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    rows.push({ name: 'Overarching', diff: overDiff, aToB: fit(A.prefOver, overDiff), bToA: fit(B.prefOver, overDiff) });
  }

  const aToB = rows.reduce((s, r) => s + r.aToB, 0) / rows.length;
  const bToA = rows.reduce((s, r) => s + r.bToA, 0) / rows.length;
  return { match: clampR((aToB + bToA) / 2), rows };
}

/* ── Other dimension matches (§6.2) ─────────────────────────────────────────*/
function attMatch(A, B) {
  if (A.attComp === null || B.attComp === null) return null;
  const base = 100 - 0.7 * Math.abs(A.attComp - B.attComp);
  const eitherSecure = A.attStyle === 'Secure' || B.attStyle === 'Secure';
  return clampR(eitherSecure ? Math.max(72, base) : Math.max(0, base));
}

function comMatch(A, B) {
  if (A.comMax === null || B.comMax === null || !A.comStyle || !B.comStyle) return null;
  const mtx = ENGINE.commMatrix[A.comStyle][B.comStyle];
  return clampR(0.5 * (100 - Math.abs(A.comMax - B.comMax)) + 0.5 * mtx);
}

function intMatch(A, B) {
  if (A.intLvl === null || B.intLvl === null) return null;
  return clampR(100 - 0.8 * Math.abs(A.intLvl - B.intLvl));
}

function valMatch(A, B) {
  if (A.valScore === null || B.valScore === null) return null;
  return clampR(100 - Math.abs(A.valScore - B.valScore));
}

function drvMatch(A, B) {
  if (!A.drvType || !B.drvType) return null;
  const mtx = ENGINE.driveMatrix[A.drvType][B.drvType];
  const pctDiff = (Math.abs(A.drvB - B.drvB) + Math.abs(A.drvC - B.drvC) +
                   Math.abs(A.drvE - B.drvE) + Math.abs(A.drvN - B.drvN)) / 4;
  return clampR(0.6 * mtx + 0.4 * (100 - pctDiff));
}

function lifMatch(A, B) {
  if (A.lifLvl === null || B.lifLvl === null) return null;
  return clampR(100 - 0.8 * Math.abs(A.lifLvl - B.lifLvl));
}

/* ── Hard-filter gate (§6.3, FULL set) ──────────────────────────────────────
   Returns a reason string if blocked, else null. fA/fB are the filter objects.
   The first two gates are exactly the engine's; the rest are the spec's
   "extend with" set, all toggleable here for easy recalibration.
   ─────────────────────────────────────────────────────────────────────────── */
const GATE = {
  wantKids: true, relType: true,     // engine-exact
  lookingFor: true, intent: true, ageRange: true, religionMustShare: true  // extended
};

// Does `lookingFor` (Men/Women/Everyone) accept a person of `gender`?
function lookingAccepts(lookingFor, gender) {
  if (!lookingFor || !gender) return true;            // missing data ⇒ don't block
  if (lookingFor === 'Everyone') return true;
  if (lookingFor === 'Men')   return gender === 'Man';
  if (lookingFor === 'Women') return gender === 'Woman';
  return true;
}

function intentClash(iA, iB) {
  if (!iA || !iB) return false;
  // Only a hard clash blocks: one strictly Long-term, the other strictly Casual.
  const pair = [iA, iB];
  return pair.includes('Long-term') && pair.includes('Casual');
}

function ageGate(fA, fB) {
  // Prefer each person's own age vs the other's preferred range; else range overlap.
  const aAge = num(fA.Age), bAge = num(fB.Age);
  const aMin = num(fA.AgeMin), aMax = num(fA.AgeMax);
  const bMin = num(fB.AgeMin), bMax = num(fB.AgeMax);
  if (bAge !== null && aMin !== null && aMax !== null && (bAge < aMin || bAge > aMax)) return true;
  if (aAge !== null && bMin !== null && bMax !== null && (aAge < bMin || aAge > bMax)) return true;
  // Fallback: preference ranges don't overlap at all.
  if (aAge === null && bAge === null && aMin !== null && aMax !== null && bMin !== null && bMax !== null) {
    if (aMax < bMin || bMax < aMin) return true;
  }
  return false;
}

function num(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v); return Number.isNaN(n) ? null : n;
}

function hardFilterGate(fA, fB) {
  fA = fA || {}; fB = fB || {};
  // Want children conflict (engine: No vs Yes either direction)
  if (GATE.wantKids &&
      ((fA.WantKids === 'No' && fB.WantKids === 'Yes') ||
       (fA.WantKids === 'Yes' && fB.WantKids === 'No'))) return 'Children: one wants kids, the other does not';
  // Relationship type mismatch unless one is "Open to both"
  if (GATE.relType && fA.RelType && fB.RelType &&
      fA.RelType !== fB.RelType && fA.RelType !== 'Open to both' && fB.RelType !== 'Open to both')
    return 'Relationship type mismatch';
  // Looking-for vs gender, both directions
  if (GATE.lookingFor && (!lookingAccepts(fA.LookingFor, fB.Gender) || !lookingAccepts(fB.LookingFor, fA.Gender)))
    return 'Gender / looking-for mismatch';
  // Relationship-intent hard clash
  if (GATE.intent && intentClash(fA.Intent, fB.Intent)) return 'Relationship-intent clash (long-term vs casual)';
  // Age range
  if (GATE.ageRange && ageGate(fA, fB)) return 'Outside preferred age range';
  // Religion "must share"
  if (GATE.religionMustShare &&
      ((fA.RelImportance === 'Must share' && fA.Religion !== fB.Religion) ||
       (fB.RelImportance === 'Must share' && fB.Religion !== fA.Religion)))
    return 'Religion: one requires a shared faith';
  return null;
}

/* ── Star mapping (§6.6) ─────────────────────────────────────────────────── */
function starsFor(overall) {
  if (overall === null) return null;
  for (const band of ENGINE.starBands) if (overall >= band.min) return band.stars;
  return null; // below lowest threshold ⇒ hidden
}

/* ── Full bidirectional match (§6) ──────────────────────────────────────────*/
function matchPair(personA, personB) {
  const A = personA.scores, B = personB.scores;
  const blocked = hardFilterGate(personA.filters, personB.filters);

  const pol = polarityMatch(A, B);
  const perDim = {
    ATT: attMatch(A, B),
    COM: comMatch(A, B),
    POL: pol.match,
    INT: intMatch(A, B),
    VAL: valMatch(A, B),
    DRV: drvMatch(A, B),
    LIF: lifMatch(A, B)
  };

  // Weighted overall over answered dimensions only (engine sums all 7).
  let wSum = 0, wxSum = 0;
  for (const d of DIMENSIONS) {
    const m = perDim[d.code];
    if (m === null) continue;
    const w = ENGINE.weights[d.code];
    wSum += w; wxSum += m * w;
  }
  const overall = blocked || !wSum ? null : Math.round(wxSum / wSum);

  // Per-dimension report band + text (High≥75 / Med≥55 / Low)
  const dims = DIMENSIONS.map(d => {
    const m = perDim[d.code];
    const band = m === null ? null : (m >= ENGINE.matchBands.High ? 'High' : m >= ENGINE.matchBands.Med ? 'Med' : 'Low');
    const key = m === null ? null : `M|${d.code}|${band}`;
    const txt = (key && typeof MATCH_TEXT !== 'undefined' && MATCH_TEXT[key]) || { meaning: '', tip: '' };
    return { code: d.code, name: d.name, match: m, band, meaning: txt.meaning, tip: txt.tip };
  });

  return {
    nameA: personA.name, nameB: personB.name,
    blocked,                       // null or reason string
    overall,                       // 0–100 or null
    stars: blocked ? null : starsFor(overall),
    hidden: !blocked && overall !== null && starsFor(overall) === null, // below lowest band
    perDim, dims,
    polarityRows: pol.rows
  };
}

/* ── Top matches (§8 admin tab 1): rank everyone against one person ─────────*/
function rankMatches(target, candidates) {
  return candidates
    .filter(c => c !== target)
    .map(c => ({ person: c, result: matchPair(target, c) }))
    .filter(r => !r.result.blocked && !r.result.hidden && r.result.overall !== null)
    .sort((a, b) => b.result.overall - a.result.overall);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { matchPair, rankMatches, polarityMatch, hardFilterGate, starsFor, GATE };
}
