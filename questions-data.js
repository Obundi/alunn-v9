/* =============================================================================
   Alunn v9 — QUESTIONS & HARD FILTERS
   Questions: Build & Beta Pack tab ③ (the free 20). Field codes map to the
   engine's ① INPUT headers. Filters: Build & Beta Pack tab ②.
   Scale items 1–5; choice items A/B/C(/D). Reserved fields stay blank but
   are honoured by the scorer for forward-compatibility.
   ============================================================================= */

// 1–5 scale answers map straight to numbers; choice answers store the letter.
const SCALE_5 = ['1', '2', '3', '4', '5'];

/* ── The 20 assessment questions, grouped by dimension for display ─────────── */
const QUESTION_GROUPS = [
  {
    title: 'Attachment',
    intro: 'How you experience closeness and trust.',
    questions: [
      { n: 1,  field: 'ATT_C01', type: 'scale', text: 'I feel comfortable depending on others in close relationships.', anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 4,  field: 'ATT_C05', type: 'scale', text: 'I often worry about being abandoned by someone I love.', anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 7,  field: 'ATT_C06', type: 'scale', text: 'When someone gets too close, I feel the urge to pull back.', anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 11, field: 'ATT_C02', type: 'scale', text: "I worry that people I care about don't value me as much as I value them.", anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 14, field: 'ATT_C10', type: 'scale', text: 'I generally trust that my partners have good intentions toward me.', anchors: ['Strongly disagree', 'Strongly agree'] }
    ]
  },
  {
    title: 'Communication',
    intro: 'How you handle issues and express yourself.',
    questions: [
      { n: 2,  field: 'COM_C01', type: 'scale', text: 'When there is a problem I prefer to address it directly and immediately.', anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 8,  field: 'COM_C02', type: 'scale', text: 'I need to talk through my feelings out loud in order to properly process them.', anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 13, field: 'COM_C04', type: 'scale', text: 'I tend to prioritise keeping the peace over raising an issue that might cause conflict.', anchors: ['Strongly disagree', 'Strongly agree'] },
      { n: 16, field: 'COM_C03', type: 'scale', text: 'I need to fully think a problem through on my own before I can talk it through with a partner.', anchors: ['Strongly disagree', 'Strongly agree'] }
    ]
  },
  {
    title: 'What attracts you',
    intro: 'The kind of partner that draws you in.',
    questions: [
      { n: 3,  field: 'POL_C06', type: 'choice', text: 'Overall, the best long-term relationship for me would be with someone who:',
        options: [{ v: 'A', label: 'Reinforces who I already am' }, { v: 'B', label: 'Balances me' }, { v: 'C', label: 'Challenges me by being genuinely different' }] },
      { n: 6,  field: 'POL_C01', type: 'choice', text: 'Thinking about past relationships, you were most attracted to someone who was:',
        options: [{ v: 'A', label: 'Very similar to me' }, { v: 'B', label: 'A mix of both' }, { v: 'C', label: 'Quite different from me' }] },
      { n: 9,  field: 'POL_C04', type: 'choice', text: 'On ambition and drive, I am most attracted to someone who:',
        options: [{ v: 'A', label: 'Matches my pace' }, { v: 'B', label: 'Is somewhat more / less ambitious' }, { v: 'C', label: 'Is very different in drive' }] },
      { n: 12, field: 'POL_C03', type: 'choice', text: 'On social energy and lifestyle, I am most attracted to someone who is:',
        options: [{ v: 'A', label: 'About the same as me' }, { v: 'B', label: 'Somewhat different' }, { v: 'C', label: 'Very different (e.g. introvert / extrovert)' }] }
    ]
  },
  {
    title: 'Relationship drive',
    intro: 'What a relationship is fundamentally for, to you.',
    questions: [
      { n: 5,  field: 'DRV_C01', type: 'choice', text: 'The relationship scenario that excites you most is:',
        options: [{ v: 'A', label: 'Building a life together' }, { v: 'B', label: 'Deep friendship' }, { v: 'C', label: 'Growth and adventure' }, { v: 'D', label: 'Being truly known' }] },
      { n: 15, field: 'DRV_C03', type: 'choice', text: 'What would make you most fulfilled in a long-term relationship is:',
        options: [{ v: 'A', label: 'Achieving things together' }, { v: 'B', label: 'Simply being together' }, { v: 'C', label: 'Growing together' }, { v: 'D', label: 'Understanding each other deeply' }] }
    ]
  },
  {
    title: 'Intimacy & affection',
    intro: 'The role of physical closeness for you.',
    questions: [
      { n: 10, field: 'INT_T201', type: 'scale', text: 'How important is physical chemistry and sexual compatibility to you in a long-term partner?', anchors: ['Not important', 'Essential'] },
      { n: 17, field: 'INT_T202', type: 'scale', text: 'I need regular physical affection (touch, closeness) to feel connected in a relationship.', anchors: ['Strongly disagree', 'Strongly agree'] }
    ]
  },
  {
    title: 'You & your outlook',
    intro: 'A few things about you, used to calibrate attraction and values.',
    questions: [
      { n: 18, field: 'BIG_C03', type: 'scale', text: 'I feel genuinely energised by socialising and spending time with groups of people.', anchors: ['Never', 'Always'] },
      { n: 19, field: 'LIF_T103', type: 'scale', text: 'How career-ambitious are you yourself?', anchors: ['Not at all', 'Very ambitious'] },
      { n: 20, field: 'VAL_C01', type: 'scale', text: 'My overall outlook on life and core values lean:', anchors: ['Traditional', 'Progressive'] }
    ]
  }
];

// Flat list (in canonical 1–20 order) for convenience.
const QUESTIONS = QUESTION_GROUPS.flatMap(g => g.questions).sort((a, b) => a.n - b.n);

/* ── Hard filters (Build & Beta Pack ②) ─────────────────────────────────────
   field   → matches the engine ① INPUT header where one exists.
   mandate → 'M' (needed to match, enforced before submit) or 'O' (optional).
   isNew   → introduced in v9.
   type    → select | multi | number | slider | text
   ─────────────────────────────────────────────────────────────────────────── */
const HARD_FILTERS = [
  // ── Mandatory ──
  { id: 'Gender',        field: 'Gender',        label: 'Gender identity',                 mandate: 'M', type: 'select', options: ['Man', 'Woman', 'Non-binary', 'Other'] },
  { id: 'Orientation',   field: 'Orientation',   label: 'Sexual orientation',              mandate: 'M', type: 'select', options: ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Other'] },
  { id: 'LookingFor',    field: 'LookingFor',    label: 'Looking to match with',           mandate: 'M', type: 'select', options: ['Men', 'Women', 'Everyone'] },
  { id: 'Intent',        field: 'Intent',        label: 'Relationship intent',             mandate: 'M', type: 'select', isNew: true, options: ['Long-term', 'Open', 'Casual', 'Figuring out'] },
  { id: 'RelType',       field: 'RelType',       label: 'Relationship type',               mandate: 'M', type: 'select', options: ['Monogamous', 'ENM', 'Open to both'] },
  { id: 'WantKids',      field: 'WantKids',      label: 'Do you want children?',           mandate: 'M', type: 'select', options: ['Yes', 'Open', 'Unsure', 'No'] },
  { id: 'Age',           field: 'Age',           label: 'Your age',                        mandate: 'M', type: 'number', min: 18, max: 99 },
  { id: 'AgeMin',        field: 'AgeMin',        label: 'Partner age — minimum',           mandate: 'M', type: 'number', min: 18, max: 99 },
  { id: 'AgeMax',        field: 'AgeMax',        label: 'Partner age — maximum',           mandate: 'M', type: 'number', min: 18, max: 99 },
  { id: 'City',          field: 'City',          label: 'City',                            mandate: 'M', type: 'text' },
  { id: 'HasKids',       field: 'HasKids',       label: 'Do you have children now?',       mandate: 'M', type: 'select', options: ['No', 'Yes (lives with me)', 'Yes (not living with me)'] },
  { id: 'OpenToKids',    field: 'OpenToKids',    label: 'Open to a partner with children?', mandate: 'M', type: 'select', options: ['Yes', 'Depends', 'Prefer not', 'Dealbreaker'] },
  { id: 'Religion',      field: 'Religion',      label: 'Religion',                        mandate: 'M', type: 'select', options: ['None', 'Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Spiritual', 'Other'] },
  { id: 'RelImportance', field: 'RelImportance', label: 'Importance of shared religion',   mandate: 'M', type: 'select', options: ['Not', 'Somewhat', 'Very', 'Must share'] },

  // ── Optional ──
  { id: 'Height',        field: 'Height',        label: 'Height (cm)',                     mandate: 'O', type: 'number', isNew: true, min: 120, max: 220 },
  { id: 'Education',     field: 'Education',     label: 'Education',                       mandate: 'O', type: 'select', isNew: true, options: ['High school', 'Vocational', "Bachelor's", "Master's", 'PhD'] },
  { id: 'Smoking',       field: 'Smoking',       label: 'Smoking',                         mandate: 'O', type: 'select', options: ['Non-smoker', 'Smoker', 'Occasionally', 'No preference'] },
  { id: 'Drinking',      field: 'Drinking',      label: 'Drinking',                        mandate: 'O', type: 'select', options: ['Non-drinker', 'Social', 'Regularly', 'No preference'] },
  { id: 'Cannabis',      field: 'Cannabis',      label: 'Cannabis use',                    mandate: 'O', type: 'select', isNew: true, options: ['Never', 'Socially', 'Regularly', 'No preference'] },
  { id: 'OtherDrugs',    field: 'OtherDrugs',    label: 'Other drugs',                     mandate: 'O', type: 'select', isNew: true, options: ['Never', 'Sometimes', 'No preference'] },
  { id: 'Politics',      field: 'Politics',      label: 'Political leaning',               mandate: 'O', type: 'select', isNew: true, options: ['Left', 'Centre', 'Right', 'Apolitical', 'Prefer not to say'] },
  { id: 'Pets',          field: 'Pets',          label: 'Pets',                            mandate: 'O', type: 'select', isNew: true, options: ['Have pets', 'Want pets', 'Allergic', 'None'] },
  { id: 'Finances',      field: 'Finances',      label: 'Financial attitude',              mandate: 'O', type: 'select', options: ['Saver', 'Balanced', 'Spender', 'Prefer not to say'] },
  { id: 'Languages',     field: 'Languages',     label: 'Languages spoken',                mandate: 'O', type: 'multi', isNew: true, options: ['English', 'Dutch', 'German', 'French', 'Spanish', 'Italian', 'Portuguese', 'Turkish', 'Arabic', 'Other'] }
];

const MANDATORY_FILTERS = HARD_FILTERS.filter(f => f.mandate === 'M').map(f => f.id);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTION_GROUPS, QUESTIONS, HARD_FILTERS, MANDATORY_FILTERS, SCALE_5 };
}
