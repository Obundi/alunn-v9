/* =============================================================================
   Alunn v9 — REPORT TEXT LIBRARY
   Verbatim from Alunn_Full_System_v9.xlsx ⑨ TEXT.
   PROFILE_TEXT key = "DIM|result" (about-you + growth tip, §7.1).
   MATCH_TEXT   key = "M|DIM|band" (meaning + coaching tip, §7.2).
   ============================================================================= */

const PROFILE_TEXT = {
  "ATT|Secure": { about: "You carry a secure attachment style: comfortable with closeness and with independence, you trust easily and recover from conflict without losing warmth. This is the strongest foundation for a lasting relationship.", tip: "Your security is a real gift — use it to stay patient and steady when a less-secure partner needs reassurance." },
  "ATT|Anxious": { about: "Your attachment leans anxious: you value closeness deeply and can feel uneasy when a partner is distant. At your best this makes you devoted and attentive; your growth edge is self-soothing when reassurance isn't immediate.", tip: "When you feel the urge for reassurance, pause and self-soothe first, then ask for what you need directly rather than testing." },
  "ATT|Avoidant": { about: "Your attachment leans avoidant: you prize independence and can pull back when things get intense. You bring steadiness and self-sufficiency; your growth edge is letting a trusted partner closer.", tip: "Notice the pull to withdraw and try staying in the room a little longer — small steps toward closeness build trust over time." },
  "ATT|Fearful": { about: "Your attachment is mixed (fearful): you want closeness yet also fear it. Relationships can feel push-pull. With a secure, patient partner this can settle considerably.", tip: "Go slow with partners who feel safe; consistency settles the push-pull. A secure partner helps a lot here." },
  "ATT|Mixed": { about: "Your attachment signature is balanced with no single dominant pattern — you adapt to circumstances. Notice which mode shows up under stress.", tip: "Notice which mode shows up under stress and name it — that awareness is your first lever." },
  "COM|Direct": { about: "You communicate directly: you raise issues early and clearly. Partners always know where they stand with you. Pair this with warmth so directness lands as care, not criticism.", tip: "Lead with a little warmth before the point, so directness lands as care rather than criticism." },
  "COM|Expressive": { about: "You're an expressive communicator: you process out loud and share feelings openly. You create emotional closeness fast; your match is someone who can hold space for that.", tip: "Leave space for partners who process internally — their quiet isn't rejection." },
  "COM|Analytical": { about: "You're an analytical communicator: you need time and space to think before discussing something hard. Your considered responses prevent reactive conflict; signal to partners that quiet means processing, not withdrawal.", tip: "Tell partners 'I need time, not distance', so your processing doesn't read as withdrawal." },
  "COM|Harmonious": { about: "You're a harmonious communicator: you protect the peace and dislike conflict. You're easy to be around; your growth edge is voicing issues before they build up.", tip: "Practise raising one small thing early, before keeping the peace lets it build up." },
  "POL|Similar": { about: "You're drawn to partners who mirror you — shared temperament and rhythm feel like home. Similarity tends to make daily life smooth.", tip: "Stay curious about a partner's differences — they can stretch you in good ways." },
  "POL|Balanced": { about: "You like a balance of similarity and difference — enough common ground to connect, enough contrast to stay interested.", tip: "Trust your read of when difference energises you versus when it drains you." },
  "POL|Different": { about: "You're drawn to contrast — partners who challenge and complement you. This keeps things alive; the work is turning difference into teamwork rather than friction.", tip: "Channel contrast into teamwork — agree up front how you'll handle the friction it can bring." },
  "DRV|Builder": { about: "Your relationship drive is Builder: you're energised by creating a shared life and goals together. You thrive with a partner who wants to build something too.", tip: "Make sure simply being together counts too, not only what you build." },
  "DRV|Companion": { about: "Your relationship drive is Companion: simply being together, easy and present, is what fulfils you. You thrive with someone who treasures everyday closeness.", tip: "Let yourself want shared goals as well as easy, present time together." },
  "DRV|Explorer": { about: "Your relationship drive is Explorer: novelty, growth and adventure keep love alive for you. You thrive with a partner who keeps growing alongside you.", tip: "Balance novelty with the security that routine gives a partner." },
  "DRV|Nurturer": { about: "Your relationship drive is Nurturer: deep emotional understanding is the point of the relationship for you. You thrive with someone who goes deep and stays.", tip: "Ask for emotional depth without making a partner responsible for managing your feelings." },
  "INT|High": { about: "Physical chemistry and affection are central to how you connect. You'll feel most secure with a partner whose needs run at a similar intensity.", tip: "Talk openly about needs early — assume nothing about a partner's pace." },
  "INT|Moderate": { about: "Physical intimacy matters to you but isn't the whole story — you balance it with other forms of connection.", tip: "Name the affection you do want, so it isn't left to guesswork." },
  "INT|Reserved": { about: "Physical intimacy is a smaller part of how you bond; emotional and intellectual closeness matter more. A partner who respects that pace fits you best.", tip: "Let partners know your slower pace is about wiring, not lack of interest." },
  "VAL|Progressive": { about: "Your outlook leans open and progressive. You'll connect most easily with someone who shares that worldview, especially on the things you hold strongly.", tip: "Find out early where a partner stands on the things you hold most strongly." },
  "VAL|Mixed": { about: "Your values sit in a pragmatic middle — you can bridge differing worldviews, which widens your compatible field.", tip: "Decide which value differences are 'agree to differ' and which are genuinely non-negotiable." },
  "VAL|Traditional": { about: "Your outlook leans traditional and grounded. Shared values will matter to you; look for alignment on family and the things that anchor you.", tip: "Be clear about your anchors so a partner can meet them honestly." },
  "LIF|gen": { about: "Your day-to-day lifestyle (activity, social rhythm, ambition) shapes everyday fit. Smaller gaps here mean less friction over time.", tip: "Talk about rhythms (going out versus staying in) before they become a recurring negotiation." },
};

const MATCH_TEXT = {
  "M|ATT|High": { meaning: "You two have a secure, stabilising attachment fit — closeness and space are likely to feel safe for both of you.", tip: "Keep naming what you each need when stressed; security grows when both feel free to reach out or take space." },
  "M|ATT|Med": { meaning: "Your attachment styles partly align — workable, with some awareness needed around closeness and reassurance.", tip: "When one reaches and the other retreats, name the pattern out loud rather than reacting to it (Bowlby/EFT)." },
  "M|ATT|Low": { meaning: "Your attachment styles pull in different directions — one seeks closeness, the other space. This is the classic anxious–avoidant tension.", tip: "Agree a 'pause and return' rule: take space, but commit to a time you'll reconnect, so neither feels abandoned." },
  "M|COM|High": { meaning: "Your communication styles mesh well — you're likely to feel heard by each other.", tip: "Protect this: keep raising small things early, before they accumulate (Gottman)." },
  "M|COM|Med": { meaning: "Your communication styles differ but can work with awareness.", tip: "Translate: the direct partner softens the open, the reflective partner signals 'I need time, not distance.'" },
  "M|COM|Low": { meaning: "Your communication styles clash — e.g. one wants it out now, the other needs to withdraw and think.", tip: "Schedule hard talks with a warm-up and a time limit; let the slower processor prepare (Gottman)." },
  "M|POL|High": { meaning: "What each of you wants in a partner closely matches who the other actually is — the bidirectional fit is strong.", tip: "Name what drew you together; keep choosing it as novelty fades." },
  "M|POL|Med": { meaning: "Your preferences and each other's traits partly line up — a fair fit with room to appreciate the gaps.", tip: "Treat differences as range, not as wrongness." },
  "M|POL|Low": { meaning: "There's a mismatch between what one of you wants and who the other is — attraction may run hot then cool.", tip: "Be honest early about whether the difference energises or drains you (Winch/Byrne)." },
  "M|INT|High": { meaning: "Your intimacy needs are well aligned — similar intensity of physical and affectionate connection.", tip: "Keep talking openly about desire; aligned now doesn't mean aligned forever." },
  "M|INT|Med": { meaning: "Your intimacy needs are roughly compatible with some difference in intensity.", tip: "Name your needs without keeping score; rhythms can be negotiated (Gulledge)." },
  "M|INT|Low": { meaning: "Your intimacy needs differ noticeably — one wants more physical closeness than the other.", tip: "Have the explicit conversation early; mismatched needs left unspoken erode connection." },
  "M|VAL|High": { meaning: "You share core values and worldview — a strong predictor of long-term stability.", tip: "Lean on this shared ground when you disagree on smaller things." },
  "M|VAL|Med": { meaning: "Your values mostly align with a few real differences.", tip: "Find out early which differences are 'agree to differ' and which are non-negotiable." },
  "M|VAL|Low": { meaning: "Your core values diverge — this is one of the harder gaps to bridge long-term.", tip: "Test it on something concrete (family, money, faith) before getting deeply invested." },
  "M|DRV|High": { meaning: "You want the same kind of relationship — your underlying drives align.", tip: "Set shared goals that honour what you both came for." },
  "M|DRV|Med": { meaning: "Your relationship drives are compatible though not identical.", tip: "Make room for both: a Builder and a Companion can thrive if each values the other's mode." },
  "M|DRV|Low": { meaning: "You want different things from the relationship at a fundamental level.", tip: "Surface this directly — 'what is this relationship for?' — before assuming you'll converge (Sternberg/SDT)." },
  "M|LIF|High": { meaning: "Your day-to-day lifestyles fit easily — little routine friction.", tip: "Enjoy the ease; revisit as circumstances change." },
  "M|LIF|Med": { meaning: "Your lifestyles mostly fit with a few differences in pace or sociability.", tip: "Agree on rhythms (going out vs staying in) before they become a recurring negotiation." },
  "M|LIF|Low": { meaning: "Your lifestyles differ noticeably — activity, social energy or ambition run at different speeds.", tip: "Schedule a periodic check-in on time and energy; talk before friction, not after." },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROFILE_TEXT, MATCH_TEXT };
}
