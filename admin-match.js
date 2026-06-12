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

/* ── Dynamic, pairing-specific match narrative (meaning + coaching tip) ──────
   Generates per-dimension text from the two people's actual styles / types and
   the direction of any gap, rather than three fixed band paragraphs.
   A, B = score objects; nA, nB = display names; band = High/Med/Low.
   ─────────────────────────────────────────────────────────────────────────── */
function matchNarrative(code, A, B, band, nA, nB) {
  const lower = s => (s || '').toLowerCase();
  const gap = (x, y) => Math.abs((x == null ? 0 : x) - (y == null ? 0 : y));
  const art = w => (/^[aeiou]/i.test(w || '') ? 'an' : 'a'); // a / an

  switch (code) {
    case 'ATT': {
      const aS = A.attStyle, bS = B.attStyle;
      const secure = [aS, bS].filter(x => x === 'Secure').length;
      const hasAnx = [aS, bS].includes('Anxious'), hasAvo = [aS, bS].includes('Avoidant');
      if (secure === 2)
        return { meaning: 'Both of you read as secure — closeness and independence both feel safe, and conflict tends to resolve without losing warmth. This is the steadiest attachment foundation there is.',
                 tip: 'Keep naming what you each need when stressed — security grows when both of you feel free to either reach out or take space.' };
      if (secure === 1) {
        const secName = aS === 'Secure' ? nA : nB, othName = aS === 'Secure' ? nB : nA, othStyle = aS === 'Secure' ? bS : aS;
        return { meaning: `${secName} brings a secure base, which tends to steady ${othName}'s more ${lower(othStyle)} moments — a genuinely stabilising pairing.`,
                 tip: `${secName}: stay patient and consistent — that steadiness is exactly what helps ${othName} relax into the relationship.` };
      }
      if (hasAnx && hasAvo) {
        const anxName = aS === 'Anxious' ? nA : nB, avoName = aS === 'Avoidant' ? nA : nB;
        return { meaning: `A classic anxious–avoidant dynamic: ${anxName} reaches for closeness just as ${avoName} reaches for space. It can absolutely work, but it's the pattern most prone to push–pull.`,
                 tip: `Agree a 'pause and return' rule: ${avoName} can take space, but commit to a time to reconnect so ${anxName} never feels abandoned.` };
      }
      if (aS === bS)
        return { meaning: `You share an ${lower(aS)} leaning — you'll instinctively understand each other's wiring, though neither of you naturally plays the calm anchor when things heat up.`,
                 tip: 'Watch for moments where you amplify each other; one of you deliberately slowing down breaks the loop.' };
      if ([aS, bS].includes('Fearful'))
        return { meaning: 'At least one of you carries a fearful (mixed) pattern — wanting closeness and fearing it at once. Expect some push–pull; patience and consistency settle it over time.',
                 tip: 'Go slow and keep things predictable — reliability is what quiets the push–pull.' };
      return { meaning: 'Your attachment styles are a mixed pairing — workable with awareness around when one of you wants closeness and the other wants space.',
               tip: 'When one reaches and the other retreats, name the pattern out loud instead of reacting to it.' };
    }

    case 'COM': {
      const a = A.comStyle, b = B.comStyle;
      const pitfall = { Direct: 'being too blunt', Expressive: 'talking over the actual issue', Analytical: 'going quiet for too long', Harmonious: 'avoiding the hard topic' };
      if (a === b)
        return { meaning: `You both communicate in a ${lower(a)} style, so you'll recognise each other's instincts and rarely misread intent.`,
                 tip: `Shared style makes this easy — just guard against both of you ${pitfall[a] || 'falling into the same blind spot'}.` };
      const pair = [a, b];
      if (pair.includes('Analytical') && pair.includes('Expressive')) {
        const exp = a === 'Expressive' ? nA : nB, ana = a === 'Analytical' ? nA : nB;
        return { meaning: `${exp} processes out loud and in the moment, while ${ana} needs to go quiet and think first. Unspoken, ${exp} can read ${ana}'s silence as withdrawal.`,
                 tip: `${ana}: say "I need time, not distance." ${exp}: give that space without chasing.` };
      }
      if (pair.includes('Direct') && pair.includes('Harmonious')) {
        const dir = a === 'Direct' ? nA : nB, har = a === 'Harmonious' ? nA : nB;
        return { meaning: `${dir} raises things head-on; ${har} prefers to keep the peace. That can balance well — as long as ${har}'s calm isn't hiding unspoken issues.`,
                 tip: `${har}: voice one small thing early. ${dir}: lead with a little warmth so directness lands as care.` };
      }
      return { meaning: `Your communication styles differ — ${lower(a)} (${nA}) versus ${lower(b)} (${nB}) — workable with a little translation between your approaches.`,
               tip: 'Each say how you handle a tough conversation, so neither style gets misread in the moment.' };
    }

    case 'POL': {
      if (band === 'High')
        return { meaning: `What each of you wants in a partner closely matches who the other actually is — the attraction here is well-founded, not just chemistry.`,
                 tip: 'Name what drew you together, and keep choosing it as the novelty fades.' };
      if (band === 'Med')
        return { meaning: `Some of what you each look for lines up with who the other is, with a few real gaps — a fair fit with room to appreciate the differences.`,
                 tip: 'Treat the differences as range, not as something wrong.' };
      return { meaning: `There's a gap between what one of you wants and who the other is — attraction may spark, then cool as the differences surface.`,
               tip: 'Be honest early about whether those differences energise you or drain you.' };
    }

    case 'INT': {
      const g = gap(A.intLvl, B.intLvl);
      if (g <= 15)
        return { meaning: 'Your needs for physical chemistry and affection run at a similar intensity — you\'re unlikely to leave each other wanting.',
                 tip: 'Keep talking openly about desire; aligned now doesn\'t mean aligned forever.' };
      const hi = A.intLvl > B.intLvl ? nA : nB, lo = A.intLvl > B.intLvl ? nB : nA;
      return { meaning: `${hi} places more weight on physical closeness and affection than ${lo} does — a real but manageable difference if it's spoken about.`,
               tip: 'Have the explicit conversation early; a mismatch left unspoken quietly erodes connection.' };
    }

    case 'VAL': {
      if (A.valLvl == null || B.valLvl == null) return { meaning: '', tip: '' };
      const g = gap(A.valLvl, B.valLvl);
      if (g <= 20)
        return { meaning: 'You\'re closely aligned in outlook and core values — one of the strongest predictors of going the distance.',
                 tip: 'Lean on this shared ground when you disagree on the smaller things.' };
      const prog = A.valLvl > B.valLvl ? nA : nB, trad = A.valLvl > B.valLvl ? nB : nA;
      return { meaning: `${prog} leans more progressive while ${trad} leans more traditional — bridgeable, but worth being clear about which differences matter.`,
               tip: 'Test it on something concrete — family, money, faith — before getting deeply invested.' };
    }

    case 'DRV': {
      const a = A.drvType, b = B.drvType;
      if (a === b)
        return { meaning: `You both come to a relationship as ${a}s — at the core you want the same thing from it.`,
                 tip: 'Set shared goals that honour the mode you both came for.' };
      const note = band === 'High' ? 'your drives pull in much the same direction'
                 : band === 'Med' ? 'compatible drives, even if not identical'
                 : 'you want quite different things from the relationship at its core';
      return { meaning: `${nA} is ${art(a)} ${a} and ${nB} is ${art(b)} ${b} — ${note}.`,
               tip: band === 'Low' ? 'Surface it directly — "what is this relationship for?" — rather than assuming you\'ll converge.'
                                   : `Make room for both modes: ${art(a)} ${a} and ${art(b)} ${b} thrive when each values what the other brings.` };
    }

    case 'LIF': {
      const g = gap(A.lifLvl, B.lifLvl);
      if (g <= 15)
        return { meaning: 'Your day-to-day rhythms — pace, social energy, ambition — line up easily, so there\'s little routine friction.',
                 tip: 'Enjoy the ease, and revisit as life circumstances change.' };
      const bits = [];
      if (gap(A.ambTrait, B.ambTrait) >= 30) {
        const hi = A.ambTrait > B.ambTrait ? nA : nB; bits.push(`${hi} is the more career-driven of you`);
      }
      if (gap(A.bigE, B.bigE) >= 30) {
        const hi = A.bigE > B.bigE ? nA : nB; bits.push(`${hi} is the more socially energetic`);
      }
      const detail = bits.length ? ` (${bits.join(', ')})` : '';
      return { meaning: `Your everyday rhythms run at different speeds${detail} — fine with a few explicit agreements about time and energy.`,
               tip: 'Agree on rhythms — going out versus staying in, how much drive matters — before they become a recurring negotiation.' };
    }

    default: return { meaning: '', tip: '' };
  }
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

  // Per-dimension report band + dynamic, pairing-specific text
  const dims = DIMENSIONS.map(d => {
    const m = perDim[d.code];
    const band = m === null ? null : (m >= ENGINE.matchBands.High ? 'High' : m >= ENGINE.matchBands.Med ? 'Med' : 'Low');
    let txt = { meaning: '', tip: '' };
    if (m !== null) {
      txt = matchNarrative(d.code, A, B, band, personA.name || 'Partner A', personB.name || 'Partner B');
      // Safety net: fall back to the band library if a generator returns nothing.
      if (!txt.meaning && typeof MATCH_TEXT !== 'undefined') txt = MATCH_TEXT[`M|${d.code}|${band}`] || txt;
    }
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
  module.exports = { matchPair, rankMatches, polarityMatch, hardFilterGate, starsFor, matchNarrative, GATE };
}
