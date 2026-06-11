/* =============================================================================
   Alunn v9 — ENGINE CONFIG
   Single source of truth for weights, bands, matrices and field maps.
   Mirrors Alunn_Full_System_v9.xlsx (② CONFIG, ③ EFF, ④ SCORES).
   Edit HERE to recalibrate after beta — scorer.js / admin-match.js read this.
   ============================================================================= */

const ENGINE = {

  /* ── Dimension weights (must sum to 100) — CONFIG B3:B9 ────────────────── */
  weights: {
    ATT: 26, // Attachment
    COM: 20, // Communication
    POL: 18, // Attraction Polarity
    INT: 12, // Intimacy
    VAL: 10, // Values
    DRV: 8,  // Drive
    LIF: 6   // Lifestyle
  },

  /* ── Star thresholds (overall score ≥) — CONFIG B13:B19 ────────────────── */
  // Evaluated top-down; first match wins. Below the lowest ⇒ hidden (gate out).
  starBands: [
    { stars: '★★★★★',  min: 85 },
    { stars: '★★★★½', min: 78 },
    { stars: '★★★★',   min: 70 },
    { stars: '★★★½',  min: 62 },
    { stars: '★★★',     min: 55 },
    { stars: '★★½',    min: 48 }
    // below 48 ⇒ hidden
  ],

  /* ── Communication style matrix — CONFIG B23:E26 ───────────────────────── */
  commMatrix: {
    Direct:     { Direct: 85, Expressive: 70, Analytical: 65, Harmonious: 80 },
    Expressive: { Direct: 70, Expressive: 85, Analytical: 55, Harmonious: 75 },
    Analytical: { Direct: 65, Expressive: 55, Analytical: 85, Harmonious: 70 },
    Harmonious: { Direct: 80, Expressive: 75, Analytical: 70, Harmonious: 80 }
  },

  /* ── Drive type matrix — CONFIG B30:E33 ────────────────────────────────── */
  driveMatrix: {
    Builder:   { Builder: 85, Companion: 65, Explorer: 80, Nurturer: 60 },
    Companion: { Builder: 65, Companion: 85, Explorer: 60, Nurturer: 85 },
    Explorer:  { Builder: 80, Companion: 60, Explorer: 80, Nurturer: 60 },
    Nurturer:  { Builder: 60, Companion: 85, Explorer: 60, Nurturer: 85 }
  },

  /* ── Subscale → field codes (from ③ EFF column ranges) ─────────────────── */
  subscales: {
    secure:   ['ATT_C01','ATT_C10','ATT_T101','ATT_T104','ATT_T201','ATT_T204','ATT_T301','ATT_T302','ATT_T303','ATT_T304'],
    anxious:  ['ATT_C05','ATT_C02','ATT_C08','ATT_T102','ATT_T202','ATT_T305'],
    avoidant: ['ATT_C06','ATT_C03','ATT_C09','ATT_T103','ATT_T105','ATT_T203','ATT_T205'],
    comDir:   ['COM_C01','COM_C05','COM_T101'],
    comExp:   ['COM_C02','COM_C06','COM_T102'],
    comAna:   ['COM_C03','COM_C07','COM_T103','COM_T204'],
    comHar:   ['COM_C04','COM_C08','COM_T105'],
    comQual:  ['COM_T201','COM_T203','COM_T303','COM_T202'], // T202 reverse-keyed
    intimacy: ['INT_T201','INT_T202','INT_N02'],
    values:   ['VAL_C01','VAL_N01','VAL_N04','VAL_T201'],
    lifestyle:['LIF_C01','LIF_T101','LIF_T102','LIF_T103','LIF_T104','LIF_T201','LIF_T301','LIF_T303'],
    bigO:     ['BIG_C01','BIG_T104'],
    bigC:     ['BIG_C02'],
    bigE:     ['BIG_C03','BIG_T105'], // T105 reverse-keyed
    bigS:     ['BIG_C04','BIG_T103'], // T103 reverse-keyed
    bigA:     ['BIG_T101','BIG_T102']
  },

  // Ambition trait = single field × 20 (④ SCORES AmbTrait = EFF!CJ = LIF_T103)
  ambTraitField: 'LIF_T103',

  /* ── Reverse-keyed scale items (use 6 − answer) — from ③ EFF formulas ──── */
  reverseKeyed: ['COM_T202', 'BIG_T105', 'BIG_T103'],

  /* ── Choice-field maps ─────────────────────────────────────────────────── */
  // Polarity preference single-choice: A/B/C → similar/mix/different
  polChoiceMap: { A: 100, B: 50, C: 0 },
  // Drive single-choice → type
  driveChoiceMap: { A: 'Builder', B: 'Companion', C: 'Explorer', D: 'Nurturer' },
  // Money value (④ SCORES ValMoney): A=0, B=50, C=100
  moneyChoiceMap: { A: 0, B: 50, C: 100 },

  // Polarity preference fields → axis (and their underlying trait, used in match)
  // overarching = avg(POL_C01, POL_C06)
  polPrefFields: {
    overarching: ['POL_C01', 'POL_C06'],
    social:       'POL_C03',
    ambition:     'POL_C04',
    organisation: 'POL_T102',
    stability:    'POL_T103',
    openness:     'POL_N01',
    expression:   'POL_C02',
    conflict:     'POL_C05'
  },

  // Drive count fields (④ SCORES counts letters across these) — DRV_C01..C05
  driveCountFields: ['DRV_C01','DRV_C02','DRV_C03','DRV_C04','DRV_C05'],

  // Money-attitude choice field (A/B/C) — ④ SCORES ValMoney = IF(VAL_N02=...).
  // Folded into ValScore = (ValLvl + ValMoney) / 2.
  moneyField: 'VAL_N02',

  // Total scored fields for clarity% (④ SCORES uses 86 = INPUT P..CW count)
  totalScoredFields: 86,

  // Canonical scored-field list = INPUT cols P:CW (the 86 fields clarity% counts).
  // Beta asks a 20-question subset; the rest stay reserved for forward-compat.
  scoredFields: [
    'ATT_C01', 'ATT_C10', 'ATT_T101', 'ATT_T104', 'ATT_T201', 'ATT_T204',
    'ATT_T301', 'ATT_T302', 'ATT_T303', 'ATT_T304', 'ATT_C05', 'ATT_C02',
    'ATT_C08', 'ATT_T102', 'ATT_T202', 'ATT_T305', 'ATT_C06', 'ATT_C03',
    'ATT_C09', 'ATT_T103', 'ATT_T105', 'ATT_T203', 'ATT_T205', 'COM_C01',
    'COM_C05', 'COM_T101', 'COM_C02', 'COM_C06', 'COM_T102', 'COM_C03',
    'COM_C07', 'COM_T103', 'COM_T204', 'COM_C04', 'COM_C08', 'COM_T105',
    'COM_T201', 'COM_T203', 'COM_T303', 'COM_T202', 'POL_C01', 'POL_C06',
    'POL_C03', 'POL_C04', 'POL_T102', 'POL_T103', 'POL_N01', 'POL_C02',
    'POL_C05', 'DRV_C01', 'DRV_C02', 'DRV_C03', 'DRV_C04', 'DRV_C05',
    'DRV_T101', 'DRV_T201', 'DRV_T102', 'DRV_T103', 'DRV_T105', 'DRV_T104',
    'INT_T201', 'INT_T202', 'INT_N02', 'INT_N01', 'VAL_C01', 'VAL_N01',
    'VAL_N04', 'VAL_T201', 'VAL_N02', 'LIF_C01', 'LIF_T101', 'LIF_T102',
    'LIF_T103', 'LIF_T104', 'LIF_T201', 'LIF_T301', 'LIF_T303', 'BIG_C01',
    'BIG_T104', 'BIG_C02', 'BIG_C03', 'BIG_T105', 'BIG_C04', 'BIG_T103',
    'BIG_T101', 'BIG_T102'
  ],

  /* ── Result-label band thresholds (§7.1 label rules) ───────────────────── */
  labelBands: {
    POL: { Similar: 67, Balanced: 34 },          // ≥67 Similar, 34–66 Balanced, <34 Different
    INT: { High: 70, Moderate: 45 },             // ≥70 High, 45–69 Moderate, <45 Reserved
    VAL: { Progressive: 67, Mixed: 34 }          // ≥67 Progressive, 34–66 Mixed, <34 Traditional
  },

  /* ── Match-report band thresholds (§7.2: High≥75 / Med≥55 / Low) ───────── */
  matchBands: { High: 75, Med: 55 }
};

/* The seven scored dimensions, in display/weight order. */
const DIMENSIONS = [
  { code: 'ATT', name: 'Attachment' },
  { code: 'COM', name: 'Communication' },
  { code: 'POL', name: 'Attraction Polarity' },
  { code: 'INT', name: 'Intimacy' },
  { code: 'VAL', name: 'Values' },
  { code: 'DRV', name: 'Drive' },
  { code: 'LIF', name: 'Lifestyle' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ENGINE, DIMENSIONS };
}
