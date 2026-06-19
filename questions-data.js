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
    intro: 'First, how you connect. These are about closeness and trust — the stuff that quietly shapes how a relationship <em>feels</em>. No right answers, and honestly most people are a mix. Just go with your gut. 💛',
    questions: [
      { n: 1,  field: 'ATT_C01', type: 'scale', text: "I'm comfortable leaning on the people I'm close to.", anchors: ['Not me at all', 'Totally me'] },
      { n: 4,  field: 'ATT_C05', type: 'scale', text: "If someone I'm close to needs space, part of me worries they're pulling away.", anchors: ['Not me at all', 'Totally me'] },
      { n: 7,  field: 'ATT_C06', type: 'scale', text: 'When things get really close, a bit of me wants some breathing room.', anchors: ['Not me at all', 'Totally me'] },
      { n: 11, field: 'ATT_C02', type: 'scale', text: 'I sometimes wonder if I care about people more than they care about me.', anchors: ['Not me at all', 'Totally me'] },
      { n: 14, field: 'ATT_C10', type: 'scale', text: 'I tend to trust that a partner means well.', anchors: ['Not me at all', 'Totally me'] }
    ]
  },
  {
    title: 'Communication',
    intro: "Now, how you talk things through. Couples rarely come unstuck because they disagree — it's <em>how</em> they handle it. There's no best style here, just yours. 💬",
    questions: [
      { n: 2,  field: 'COM_C01', type: 'scale', text: "When something's bugging me, I'd rather bring it up than sit on it.", anchors: ['Not me at all', 'Totally me'] },
      { n: 8,  field: 'COM_C02', type: 'scale', text: 'I figure out how I feel by talking it out, not by going quiet.', anchors: ['Not me at all', 'Totally me'] },
      { n: 13, field: 'COM_C04', type: 'scale', text: "I'll often keep the peace rather than start a disagreement.", anchors: ['Not me at all', 'Totally me'] },
      { n: 16, field: 'COM_C03', type: 'scale', text: "I need to think things over on my own before I'm ready to talk about them.", anchors: ['Not me at all', 'Totally me'] }
    ]
  },
  {
    title: 'What draws you in',
    intro: 'Opposites attract — or do they? Some of us click with someone <em>similar</em>, others with a bit of <em>contrast</em>. Both work. Pick what feels true for you. ✨',
    questions: [
      { n: 3,  field: 'POL_C06', type: 'choice', text: 'The best relationship for me would be with someone who:',
        options: [{ v: 'A', label: 'Feels a lot like me' }, { v: 'B', label: 'Balances me out — a bit of both' }, { v: 'C', label: 'Is refreshingly different' }] },
      { n: 6,  field: 'POL_C01', type: 'choice', text: "Looking back, I've usually been drawn to someone who was:",
        options: [{ v: 'A', label: 'A lot like me' }, { v: 'B', label: 'A bit of both' }, { v: 'C', label: 'Pretty different from me' }] },
      { n: 9,  field: 'POL_C04', type: 'choice', text: 'When it comes to drive and ambition, I click with someone who:',
        options: [{ v: 'A', label: 'Has about the same drive as me' }, { v: 'B', label: 'Is a bit more or less driven' }, { v: 'C', label: 'Runs at a totally different speed' }] },
      { n: 12, field: 'POL_C03', type: 'choice', text: "On social energy, I'm drawn to someone who's:",
        options: [{ v: 'A', label: 'About as social as me' }, { v: 'B', label: 'A bit more or less social' }, { v: 'C', label: 'My opposite (introvert vs extrovert)' }] }
    ]
  },
  {
    title: 'Closeness & affection',
    intro: "How much do touch and chemistry matter to <em>you</em>? There's no high or low to aim for — we just want to match you with someone on your wavelength. 💞",
    questions: [
      { n: 10, field: 'INT_T201', type: 'scale', text: 'How much does physical chemistry matter to you in a relationship?', anchors: ['Not important', 'Essential'] },
      { n: 17, field: 'INT_T202', type: 'scale', text: 'I need regular affection — touch, closeness — to feel connected.', anchors: ['Not me at all', 'Totally me'] }
    ]
  },
  {
    title: 'What you want it for',
    intro: "Deep down, what's a relationship <em>for</em>, to you? Building something, easy companionship, growing together, being truly known — they're all good answers. 🌱",
    questions: [
      { n: 5,  field: 'DRV_C01', type: 'choice', text: 'The kind of relationship that excites me most is:',
        options: [{ v: 'A', label: 'Building a future together — a home, goals, maybe family' }, { v: 'B', label: 'Easy companionship — my favourite person to just be with' }, { v: 'C', label: 'Adventure and new experiences together' }, { v: 'D', label: 'A deep bond where we really get each other' }] },
      { n: 15, field: 'DRV_C03', type: 'choice', text: 'What would make me happiest long-term is:',
        options: [{ v: 'A', label: 'Achieving big things as a team' }, { v: 'B', label: 'Comfortable, drama-free togetherness' }, { v: 'C', label: 'Always having something new to explore together' }, { v: 'D', label: 'Feeling completely seen and understood' }] }
    ]
  },
  {
    title: 'A little about you',
    intro: 'Last stretch! 🎉 A few about <em>you</em> — your energy, drive and outlook. We line these up with what you find attractive (and with potential matches).',
    questions: [
      { n: 18, field: 'BIG_C03', type: 'scale', text: 'Being around people and groups genuinely energises me.', anchors: ['Not me at all', 'Totally me'] },
      { n: 19, field: 'LIF_T103', type: 'scale', text: 'How driven are you about your career and goals?', anchors: ['Not at all', 'Very driven'] },
      { n: 20, field: 'VAL_C01', type: 'scale', text: 'When it comes to life and values, I lean:', anchors: ['More traditional', 'More progressive'] }
    ]
  }
];

// Flat list (in canonical 1–20 order) for convenience.
const QUESTIONS = QUESTION_GROUPS.flatMap(g => g.questions).sort((a, b) => a.n - b.n);

/* ── Personal priorities (optional weighting) ────────────────────────────────
   The person ranks their top three dimensions; codes are stored in PREF_W1..W3
   and feed scores.prefRank, which tilts their match weights toward what they
   value (blended with the science baseline — see engine-config prefBlend).
   Codes MUST match DIMENSIONS in engine-config.js.
   ─────────────────────────────────────────────────────────────────────────── */
const PRIORITY_DIMS = [
  { code: 'ATT', label: 'Attachment & security', def: 'How you experience trust, closeness and security with a partner.' },
  { code: 'COM', label: 'Communication',          def: 'How you raise issues, express feelings and handle conflict.' },
  { code: 'POL', label: 'Attraction & polarity',  def: "Whether you're drawn to someone similar to you, or someone who contrasts and complements you." },
  { code: 'INT', label: 'Intimacy & affection',   def: 'How central physical chemistry and affection are to how you bond.' },
  { code: 'VAL', label: 'Values & outlook',       def: 'How much sharing core values and a life outlook matters to you.' },
  { code: 'DRV', label: 'Relationship drive',     def: 'What a relationship is fundamentally for you — building a life, companionship, growth, being truly known.' },
  { code: 'LIF', label: 'Lifestyle & rhythm',     def: 'Day-to-day fit — social energy, ambition and how you like to spend your time.' }
];
const PRIORITY_FIELDS = ['PREF_W1', 'PREF_W2', 'PREF_W3']; // store dimension codes, rank 1→3

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
  { id: 'Languages',     field: 'Languages',     label: 'Languages spoken',                mandate: 'O', type: 'multi', isNew: true, options: ['English', 'Dutch', 'German', 'French', 'Spanish', 'Italian', 'Portuguese', 'Turkish', 'Arabic', 'Other'] },
  { id: 'Interests',     field: 'Interests',     label: 'Hobbies & interests',             mandate: 'O', type: 'multi', isNew: true, options: ['Sports & fitness', 'Arts & culture', 'Music', 'Travel', 'Food & cooking', 'Gaming', 'Reading & writing', 'Outdoors & nature', 'Film & TV', 'Technology', 'Going out & nightlife', 'Wellness & mindfulness'] }
];

const MANDATORY_FILTERS = HARD_FILTERS.filter(f => f.mandate === 'M').map(f => f.id);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTION_GROUPS, QUESTIONS, HARD_FILTERS, MANDATORY_FILTERS, SCALE_5, PRIORITY_DIMS, PRIORITY_FIELDS };
}
