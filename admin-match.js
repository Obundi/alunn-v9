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
  // Spread the otherwise near-constant polarity score around its centre (see matchScale).
  const MS = ENGINE.matchScale;
  const raw = (aToB + bToA) / 2;
  return { match: clampR(MS.polCenter + (raw - MS.polCenter) * MS.polGain), rows };
}

/* ── Other dimension matches (§6.2) ─────────────────────────────────────────*/
function attMatch(A, B) {
  if (A.attComp === null || B.attComp === null) return null;
  const MS = ENGINE.matchScale;
  const base = 100 - MS.attSlope * Math.abs(A.attComp - B.attComp);
  const eitherSecure = A.attStyle === 'Secure' || B.attStyle === 'Secure';
  return clampR(eitherSecure ? Math.max(MS.attSecureFloor, base) : Math.max(0, base));
}

function comMatch(A, B) {
  if (A.comMax === null || B.comMax === null || !A.comStyle || !B.comStyle) return null;
  const MS = ENGINE.matchScale;
  const mtx = ENGINE.commMatrix[A.comStyle][B.comStyle];
  const mtx2 = (mtx - 55) / 30 * (MS.comHi - MS.comLo) + MS.comLo; // remap 55..85 → comLo..comHi
  return clampR(0.5 * (100 - Math.abs(A.comMax - B.comMax)) + 0.5 * mtx2);
}

function intMatch(A, B) {
  if (A.intLvl === null || B.intLvl === null) return null;
  return clampR(100 - ENGINE.matchScale.intSlope * Math.abs(A.intLvl - B.intLvl));
}

function valMatch(A, B) {
  if (A.valScore === null || B.valScore === null) return null;
  return clampR(100 - Math.abs(A.valScore - B.valScore));
}

function drvMatch(A, B) {
  if (!A.drvType || !B.drvType) return null;
  const MS = ENGINE.matchScale;
  const mtx = ENGINE.driveMatrix[A.drvType][B.drvType];
  const mtx2 = (mtx - 60) / 25 * (MS.drvHi - MS.drvLo) + MS.drvLo; // remap 60..85 → drvLo..drvHi
  const pctDiff = (Math.abs(A.drvB - B.drvB) + Math.abs(A.drvC - B.drvC) +
                   Math.abs(A.drvE - B.drvE) + Math.abs(A.drvN - B.drvN)) / 4;
  return clampR(0.6 * mtx2 + 0.4 * (100 - pctDiff));
}

function lifMatch(A, B) {
  if (A.lifLvl === null || B.lifLvl === null) return null;
  return clampR(100 - ENGINE.matchScale.lifSlope * Math.abs(A.lifLvl - B.lifLvl));
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

// Returns null, or { code, reason } describing the first hard-filter conflict.
function hardFilterGate(fA, fB) {
  fA = fA || {}; fB = fB || {};
  // Want children conflict (engine: No vs Yes either direction)
  if (GATE.wantKids &&
      ((fA.WantKids === 'No' && fB.WantKids === 'Yes') ||
       (fA.WantKids === 'Yes' && fB.WantKids === 'No'))) return { code: 'kids', reason: 'Children: one wants kids, the other does not' };
  // Relationship type mismatch unless one is "Open to both"
  if (GATE.relType && fA.RelType && fB.RelType &&
      fA.RelType !== fB.RelType && fA.RelType !== 'Open to both' && fB.RelType !== 'Open to both')
    return { code: 'reltype', reason: 'Relationship type mismatch' };
  // Looking-for vs gender, both directions
  if (GATE.lookingFor && (!lookingAccepts(fA.LookingFor, fB.Gender) || !lookingAccepts(fB.LookingFor, fA.Gender)))
    return { code: 'gender', reason: 'Gender / looking-for mismatch' };
  // Relationship-intent hard clash
  if (GATE.intent && intentClash(fA.Intent, fB.Intent)) return { code: 'intent', reason: 'Relationship-intent clash (long-term vs casual)' };
  // Age range
  if (GATE.ageRange && ageGate(fA, fB)) return { code: 'age', reason: 'Outside preferred age range' };
  // Religion "must share"
  if (GATE.religionMustShare &&
      ((fA.RelImportance === 'Must share' && fA.Religion !== fB.Religion) ||
       (fB.RelImportance === 'Must share' && fB.Religion !== fA.Religion)))
    return { code: 'religion', reason: 'Religion: one requires a shared faith' };
  return null;
}

/* ── Star mapping (§6.6) ─────────────────────────────────────────────────── */
/* ── Personal priority weights (§ optional) ─────────────────────────────────
   Turns a person's ranked top dimensions (prefRank, e.g. ['VAL','LIF','COM'])
   into a weight vector blended with the science baseline. No ranking ⇒ the
   baseline is returned unchanged, so scoring is identical to before.
   ─────────────────────────────────────────────────────────────────────────── */
function blendedWeights(prefRank) {
  const base = ENGINE.weights;
  if (!prefRank || !prefRank.length) return base;
  const pts = {};
  DIMENSIONS.forEach(d => { pts[d.code] = ENGINE.prefBasePoint; });
  ENGINE.prefRankPoints.forEach((p, i) => {
    const code = prefRank[i];
    if (code && pts[code] !== undefined) pts[code] = p;
  });
  let sum = 0;
  DIMENSIONS.forEach(d => { sum += pts[d.code]; });
  const b = ENGINE.prefBlend, w = {};
  DIMENSIONS.forEach(d => {
    const personal = pts[d.code] / sum * 100;
    w[d.code] = b * personal + (1 - b) * base[d.code];
  });
  return w;
}

// Weighted mean of the per-dimension fits using a given weight vector (answered dims only).
function weightedFit(perDim, W) {
  let wSum = 0, wxSum = 0;
  for (const d of DIMENSIONS) {
    const m = perDim[d.code];
    if (m === null) continue;
    wSum += W[d.code]; wxSum += m * W[d.code];
  }
  return wSum ? wxSum / wSum : null;
}

function starsFor(overall) {
  if (overall === null) return null;
  for (const band of ENGINE.starBands) if (overall >= band.min) return band.stars;
  return null; // below lowest threshold ⇒ hidden
}

/* ── Dynamic, pairing-specific match narrative (meaning + coaching tip) ──────
   Generates per-dimension text from the two people's actual styles / types and
   the direction of any gap, rather than three fixed band paragraphs.
   A, B = score objects; nA, nB = display names; band = High/Med/Low.
   ctx = { polRows } extra context (e.g. the per-axis polarity breakdown).
   ─────────────────────────────────────────────────────────────────────────── */
function matchNarrative(code, A, B, band, nA, nB, ctx) {
  ctx = ctx || {};
  const lower = s => (s || '').toLowerCase();
  const gap = (x, y) => Math.abs((x == null ? 0 : x) - (y == null ? 0 : y));

  switch (code) {
    case 'ATT': {
      const aS = A.attStyle, bS = B.attStyle;
      const secure = [aS, bS].filter(x => x === 'Secure').length;
      const hasAnx = [aS, bS].includes('Anxious'), hasAvo = [aS, bS].includes('Avoidant');
      // Per-person action for a non-secure style.
      const act = (style, n) => ({
        Anxious:  `${n}: when you want reassurance, ask for it directly rather than waiting or testing.`,
        Avoidant: `${n}: notice the urge to withdraw and try staying in the room a little longer.`,
        Fearful:  `${n}: go slow with closeness — predictability is what settles the push–pull.`,
        Mixed:    `${n}: notice which mode shows up under stress and name it out loud.`
      }[style] || `${n}: keep naming what you need.`);

      if (secure === 2)
        return { meaning: 'You\'re both securely attached — closeness and independence feel safe to each of you, and conflict tends to resolve without losing warmth. The steadiest possible foundation.',
                 tip: 'Keep naming what you each need when stressed — security grows when you both feel free to reach out or take space.' };
      if (secure === 1) {
        const secN = aS === 'Secure' ? nA : nB, othN = aS === 'Secure' ? nB : nA, othS = aS === 'Secure' ? bS : aS;
        return { meaning: `${secN} brings a secure base, which steadies ${othN}'s more ${lower(othS)} moments — a genuinely stabilising pairing.`,
                 tip: `${secN}: stay steady and consistent — that reliability is what helps ${othN} settle. ${act(othS, othN)}` };
      }
      if (hasAnx && hasAvo) {
        const anxN = aS === 'Anxious' ? nA : nB, avoN = aS === 'Avoidant' ? nA : nB;
        return { meaning: `A classic anxious–avoidant pull: ${anxN} reaches for closeness just as ${avoN} reaches for space — the pattern most prone to push–pull.`,
                 tip: `${anxN}: self-soothe first, then ask for what you need directly. ${avoN}: offer a little reassurance before taking space, and say when you'll reconnect.` };
      }
      if (aS === bS) { // both the same non-secure style → shared voice
        const both = {
          Anxious:  { meaning: 'You both lean anxious — you each value reassurance deeply, so you\'ll understand one another, but neither of you naturally provides the calm when you\'re both activated.', tip: 'When you\'re both anxious at once, one of you deliberately slowing down and self-soothing breaks the spiral.' },
          Avoidant: { meaning: 'You both lean avoidant — you\'ll respect each other\'s need for space, but closeness can quietly fade if neither of you reaches in.', tip: 'Schedule deliberate closeness rather than waiting for the other to reach first.' },
          Fearful:  { meaning: 'You both carry a fearful (mixed) pattern — each craving closeness yet fearing it, so things can feel push–pull on both sides.', tip: 'Keep things slow and predictable, and name the push–pull when you feel it instead of reacting.' },
          Mixed:    { meaning: 'You both have a balanced, mixed attachment signature — adaptable, with no single dominant pattern.', tip: 'Notice which mode each of you slips into under stress, and name it.' }
        }[aS];
        if (both) return both;
      }
      if ([aS, bS].includes('Fearful')) { // fearful + a different style → name the fearful one
        const fearN = aS === 'Fearful' ? nA : nB, othN = aS === 'Fearful' ? nB : nA, othS = aS === 'Fearful' ? bS : aS;
        return { meaning: `${fearN}'s attachment is mixed (fearful) — craving closeness yet fearing it, which can feel push–pull. ${othN} (${lower(othS)}) can steady this by staying consistent.`,
                 tip: `${fearN}: go slow with someone who feels safe. ${act(othS, othN)}` };
      }
      // Any other differing non-secure pairing → name both sides + an action each.
      return { meaning: `${nA} leans ${lower(aS)} while ${nB} leans ${lower(bS)} — a mixed pairing that works with awareness of when one wants closeness and the other wants space.`,
               tip: `${act(aS, nA)} ${act(bS, nB)}` };
    }

    case 'COM': {
      const a = A.comStyle, b = B.comStyle;
      const pitfall = { Direct: 'being too blunt', Expressive: 'talking over the actual issue', Analytical: 'going quiet for too long', Harmonious: 'avoiding the hard topic' };
      if (a === b)
        return { meaning: `You both communicate in a ${lower(a)} style, so you'll recognise each other's instincts and rarely misread intent.`,
                 tip: `Shared style makes this easy — just guard against both of you ${pitfall[a] || 'falling into the same blind spot'}.` };
      // Any differing pair → describe who does what + a per-person tip.
      const desc = { Direct: 'raises issues head-on', Expressive: 'processes feelings out loud, in the moment', Analytical: 'needs to think things through quietly first', Harmonious: 'tends to keep the peace' };
      const tipFor = {
        Direct:     n => `${n}: lead with a little warmth so directness lands as care.`,
        Expressive: n => `${n}: don't read a quieter partner's silence as rejection — give them room.`,
        Analytical: n => `${n}: say "I need time, not distance" so going quiet doesn't read as withdrawal.`,
        Harmonious: n => `${n}: voice one small thing early, before keeping the peace lets it build up.`
      };
      return { meaning: `${nA} ${desc[a]}, while ${nB} ${desc[b]} — workable with a little translation between your styles.`,
               tip: `${tipFor[a](nA)} ${tipFor[b](nB)}` };
    }

    case 'POL': {
      const AX = {
        Social:       { label: 'social energy', trait: 'bigE',     hi: 'is more outgoing and socially energised', lo: 'is more low-key and reserved' },
        Ambition:     { label: 'ambition and drive', trait: 'ambTrait', hi: 'is more career-driven', lo: 'is more relaxed about ambition' },
        Organisation: { label: 'structure vs spontaneity', trait: 'bigC', hi: 'is more planned and structured', lo: 'is more spontaneous and go-with-the-flow' },
        Stability:    { label: 'emotional evenness', trait: 'bigS', hi: 'stays more even-keeled under stress', lo: 'rides the emotional ups and downs more' },
        Openness:     { label: 'openness to new experiences', trait: 'bigO', hi: 'is more drawn to novelty and new ideas', lo: 'prefers the familiar and tried-and-true' },
        Expression:   { label: 'showing feelings', trait: 'comExp', hi: 'shows feelings more openly', lo: 'holds feelings closer to the chest' },
        Conflict:     { label: 'handling conflict', trait: 'comDir', hi: 'tackles conflict head-on', lo: 'tends to avoid confrontation' }
      };
      const tipFor = {
        Social:       (hi, lo) => `${hi}: don't read ${lo}'s quieter pace as disinterest. ${lo}: say when you need a calmer night rather than pushing through.`,
        Ambition:     (hi, lo) => `${hi}: protect shared downtime so drive doesn't crowd the relationship. ${lo}: back ${hi}'s goals rather than feeling measured against them.`,
        Organisation: (hi, lo) => `${hi}: leave room for spontaneity. ${lo}: meet ${hi} on the plans that genuinely matter to them.`,
        Stability:    (hi, lo) => `${hi}: stay steady when ${lo} is stirred up. ${lo}: name what you feel early, before it peaks.`,
        Openness:     (hi, lo) => `${hi}: introduce new things gently. ${lo}: try saying yes to one of ${hi}'s ideas now and then.`,
        Expression:   (hi, lo) => `${hi}: give ${lo} time to find the words. ${lo}: share a little more than feels natural.`,
        Conflict:     (hi, lo) => `${hi}: soften the opener. ${lo}: don't let things slide — raise them while they're small.`
      };
      const rows = (ctx.polRows || []).filter(r => r.name !== 'Overarching');
      if (rows.length) {
        const fit = r => (r.aToB + r.bToA) / 2;
        const sorted = rows.slice().sort((a, b) => fit(a) - fit(b));
        const gapAx = sorted[0].name, strongAx = sorted[sorted.length - 1].name;
        const G = AX[gapAx], S = AX[strongAx];
        const strongLbl = (S && S.label) || lower(strongAx);
        if (band === 'High')
          return { meaning: `What you each look for and who the other actually is line up well — you're especially well matched on ${strongLbl}. Well-founded attraction, not just chemistry.`,
                   tip: `Name what drew you together — your fit on ${strongLbl} — and keep choosing it as the novelty fades.` };
        // Med / Low: name who's on each side of the biggest-gap axis.
        const aT = A[G.trait], bT = B[G.trait];
        const hiN = (aT == null ? 0 : aT) >= (bT == null ? 0 : bT) ? nA : nB;
        const loN = hiN === nA ? nB : nA;
        const sides = `${hiN} ${G.hi}, while ${loN} ${G.lo}`;
        if (band === 'Med')
          return { meaning: `You're well matched on ${strongLbl}, but ${G.label} is where you differ most — ${sides}. A workable gap, just worth naming.`,
                   tip: tipFor[gapAx](hiN, loN) };
        return { meaning: `There's a real gap in what you each want versus who the other is — most of all on ${G.label}: ${sides}. Attraction can run hot then cool as that surfaces (you align best on ${strongLbl}).`,
                 tip: `${tipFor[gapAx](hiN, loN)} Be honest about whether this difference energises or drains you.` };
      }
      if (band === 'High') return { meaning: 'What each of you wants closely matches who the other is — well-founded attraction.', tip: 'Name what drew you together and keep choosing it.' };
      if (band === 'Med') return { meaning: 'A fair fit between what you want and who the other is, with some real gaps.', tip: 'Treat the differences as range, not as something wrong.' };
      return { meaning: 'A gap between what one of you wants and who the other is — attraction may spark then cool.', tip: 'Be honest early about whether the differences energise or drain you.' };
    }

    case 'INT': {
      const g = gap(A.intLvl, B.intLvl);
      if (g <= 15)
        return { meaning: 'Your needs for physical chemistry and affection run at a similar intensity — you\'re unlikely to leave each other wanting.',
                 tip: 'Keep talking openly about desire; aligned now doesn\'t mean aligned forever.' };
      const hi = A.intLvl > B.intLvl ? nA : nB, lo = A.intLvl > B.intLvl ? nB : nA;
      return { meaning: `${hi} places more weight on physical closeness and affection than ${lo} does — a real but manageable difference if it's spoken about.`,
               tip: `${hi}: ask for the closeness you want without keeping score. ${lo}: name your own pace, so ${hi} doesn't read 'less' as rejection.` };
    }

    case 'VAL': {
      if (A.valLvl == null || B.valLvl == null) return { meaning: '', tip: '' };
      const g = gap(A.valLvl, B.valLvl);
      if (g <= 20)
        return { meaning: 'You share a similar outlook and core values — one of the strongest predictors of going the distance.',
                 tip: 'Lean on this shared ground when you disagree on the smaller things.' };
      const prog = A.valLvl > B.valLvl ? nA : nB, trad = A.valLvl > B.valLvl ? nB : nA;
      return { meaning: `${prog} leans more progressive while ${trad} leans more traditional — bridgeable, but worth being clear about which differences matter.`,
               tip: `${prog}: hold what you believe without expecting ${trad} to shift. ${trad}: be clear about your anchors so ${prog} can honour them. Test it on something concrete — family, money, faith — before getting deeply invested.` };
    }

    case 'DRV': {
      const a = A.drvType, b = B.drvType;
      const WANT = {
        Builder: 'building a shared life and reaching goals together',
        Companion: 'easy everyday companionship — simply being together',
        Explorer: 'novelty, growth and adventure together',
        Nurturer: 'deep emotional understanding and being truly known'
      };
      if (a === b)
        return { meaning: `You both come to a relationship as ${a}s — you're both most fulfilled by ${WANT[a]}.`,
                 tip: `Lean into it: build shared plans around ${WANT[a]}.` };
      const note = band === 'High' ? 'different engines, but they pull in much the same direction'
                 : band === 'Med' ? 'different engines that can complement each other'
                 : 'you\'re reaching for genuinely different things from the relationship';
      return { meaning: `${nA} (${a}) is most fulfilled by ${WANT[a]}, while ${nB} (${b}) wants ${WANT[b]} — ${note}.`,
               tip: band === 'Low'
                 ? `Ask each other directly: "what is this relationship for?" — ${nA} needs ${WANT[a]}, ${nB} needs ${WANT[b]}, so name how you'll honour both.`
                 : `Make room for both: give ${nA} the ${a.toLowerCase()} side (${WANT[a]}) and ${nB} the ${b.toLowerCase()} side (${WANT[b]}).` };
    }

    case 'LIF': {
      const g = gap(A.lifLvl, B.lifLvl);
      if (g <= 15)
        return { meaning: 'Your day-to-day rhythms — pace, social energy, ambition — line up easily, so there\'s little routine friction.',
                 tip: 'Enjoy the ease, and revisit as life circumstances change.' };
      const ambGap = gap(A.ambTrait, B.ambTrait), socGap = gap(A.bigE, B.bigE);
      const bits = [];
      if (ambGap >= 30) bits.push(`${A.ambTrait > B.ambTrait ? nA : nB} is the more career-driven`);
      if (socGap >= 30) bits.push(`${A.bigE > B.bigE ? nA : nB} is the more socially energetic`);
      const detail = bits.length ? ` — ${bits.join(', ')}` : '';
      let tip;
      if (socGap >= ambGap && socGap >= 30) {
        const hi = A.bigE > B.bigE ? nA : nB, lo = hi === nA ? nB : nA;
        tip = `${hi}: plan social time with ${lo}'s energy in mind. ${lo}: say when you need a quiet night rather than pushing through.`;
      } else if (ambGap >= 30) {
        const hi = A.ambTrait > B.ambTrait ? nA : nB, lo = hi === nA ? nB : nA;
        tip = `${hi}: protect shared downtime so drive doesn't crowd you out. ${lo}: back ${hi}'s goals rather than feeling measured against them.`;
      } else {
        tip = 'Agree on rhythms — going out vs staying in, how much ambition matters — before they become a recurring negotiation.';
      }
      return { meaning: `Your everyday rhythms run at different speeds${detail} — fine with a few explicit agreements about time and energy.`, tip };
    }

    default: return { meaning: '', tip: '' };
  }
}

/* ── Full bidirectional match (§6) ──────────────────────────────────────────*/
function matchPair(personA, personB) {
  const A = personA.scores, B = personB.scores;
  const gate = hardFilterGate(personA.filters, personB.filters);
  const blocked = gate ? gate.reason : null;
  const blockedCode = gate ? gate.code : null;

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
  // Bidirectional + personalised: each person scores the SAME per-dimension fits by
  // their OWN priority weights (blended with the baseline); the two perspectives are
  // averaged. If neither ranked anything, both weight vectors = baseline, so this is
  // identical to the plain baseline weighted mean (verified backward-compatible).
  const fitA = weightedFit(perDim, blendedWeights(A.prefRank));
  const fitB = weightedFit(perDim, blendedWeights(B.prefRank));
  const rawMean = (fitA === null || fitB === null) ? null : (fitA + fitB) / 2;
  // Always compute the underlying score (even when gated) so the admin can still
  // open a full report. `blocked` just flags it + carries the reason.
  // Final spread-curve stretches the compressed weighted mean so scores discriminate
  // (a mean of 7 capped dims clusters ~0.42× as wide as its parts — see engine-config).
  const SP = ENGINE.spread;
  const stretch = raw => clampR(SP.displayMid + (raw - SP.rawCenter) * SP.gain);
  const overall = rawMean === null ? null : stretch(rawMean);
  // Each person's own perspective score (their priorities applied). Equal to `overall`
  // when neither ranked; the report only breaks them out when they differ.
  const perspA = fitA === null ? null : stretch(fitA);
  const perspB = fitB === null ? null : stretch(fitB);
  const personalised = !!((A.prefRank && A.prefRank.length) || (B.prefRank && B.prefRank.length));

  // Per-dimension report band + dynamic, pairing-specific text
  const dims = DIMENSIONS.map(d => {
    const m = perDim[d.code];
    const band = m === null ? null : (m >= ENGINE.matchBands.High ? 'High' : m >= ENGINE.matchBands.Med ? 'Med' : 'Low');
    let txt = { meaning: '', tip: '' };
    if (m !== null) {
      txt = matchNarrative(d.code, A, B, band, personA.name || 'Partner A', personB.name || 'Partner B', { polRows: pol.rows });
      // Safety net: fall back to the band library if a generator returns nothing.
      if (!txt.meaning && typeof MATCH_TEXT !== 'undefined') txt = MATCH_TEXT[`M|${d.code}|${band}`] || txt;
    }
    return { code: d.code, name: d.name, match: m, band, meaning: txt.meaning, tip: txt.tip };
  });

  return {
    nameA: personA.name, nameB: personB.name,
    blocked,                       // null or reason string
    blockedCode,                   // null or category code (gender/kids/reltype/intent/age/religion)
    overall,                       // 0–100 or null (computed even when gated)
    perspA, perspB,                // each person's own-priorities score (= overall if nobody ranked)
    personalised,                  // true if either person ranked priorities
    stars: overall === null ? null : starsFor(overall),
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
