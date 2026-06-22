const FORMS = {
  "assessment": {
    "title": "How was the assessment?",
    "intro": "A few quick questions about how taking the assessment felt. Honest reactions — even critical ones — are the most useful thing you can give this beta.",
    "postType": "fb_assessment",
    "questions": [
      {
        "n": 1,
        "q": "How long did the assessment feel?",
        "t": "single",
        "o": [
          "Too short",
          "Just right",
          "A bit long",
          "Too long"
        ]
      },
      {
        "n": 2,
        "q": "Did you think about giving up before finishing?",
        "t": "single",
        "o": [
          "No",
          "Once",
          "A few times",
          "I nearly did"
        ]
      },
      {
        "n": 3,
        "q": "If it felt long, which parts dragged?",
        "t": "multi",
        "o": [
          "Attachment",
          "Communication",
          "Drive/goals",
          "Intimacy",
          "Values",
          "Lifestyle"
        ],
        "opt": true
      },
      {
        "n": 4,
        "q": "The questions were clear and easy to understand.",
        "t": "scale"
      },
      {
        "n": 5,
        "q": "Did anything feel too personal?",
        "t": "single",
        "o": [
          "Not at all",
          "A little",
          "Quite",
          "Very"
        ]
      },
      {
        "n": 6,
        "q": "If so, which topics?",
        "t": "multi",
        "o": [
          "Intimacy/sex",
          "Religion/values",
          "Attachment/past",
          "Politics",
          "Money",
          "Other"
        ],
        "opt": true
      },
      {
        "n": 7,
        "q": "The questions felt relevant to finding a compatible partner.",
        "t": "scale"
      },
      {
        "n": 8,
        "q": "Compared to signing up for other dating apps, this felt…",
        "t": "single",
        "o": [
          "Much worse",
          "Worse",
          "About the same",
          "Better",
          "Much better"
        ]
      },
      {
        "n": 9,
        "q": "How many questions up front feels okay to you?",
        "t": "single",
        "o": [
          "Under 10",
          "About 10",
          "About 20",
          "About 30",
          "As many as it takes"
        ]
      },
      {
        "n": 10,
        "q": "Overall the assessment made me feel…",
        "t": "multi",
        "o": [
          "Curious",
          "Excited",
          "Seen/understood",
          "Neutral",
          "Tired",
          "Skeptical"
        ]
      },
      {
        "n": 11,
        "q": "Anything you'd change about the questions or the flow?",
        "t": "open",
        "opt": true
      }
    ]
  },
  "profile": {
    "title": "Is your profile accurate?",
    "intro": "Does the result feel like you? Rate each part. This is how we measure whether the model actually works.",
    "postType": "fb_profile",
    "questions": [
      {
        "n": 1,
        "q": "Overall, my profile describes me accurately.",
        "t": "scale"
      },
      {
        "n": 2,
        "q": "How well did the Attachment part fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 3,
        "q": "How well did the Communication part fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 4,
        "q": "How well did the Attraction part — what draws you to a partner — fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 5,
        "q": "How well did the Intimacy part fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 6,
        "q": "How well did the Values part fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 7,
        "q": "How well did the Relationship drive part fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 8,
        "q": "How well did the Lifestyle part fit you?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 9,
        "q": "Your main result — your attachment style, drive type, and so on — felt…",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly right",
          "Not really",
          "Wrong"
        ]
      },
      {
        "n": 10,
        "q": "Did the profile tell you anything insightful about yourself?",
        "t": "single",
        "o": [
          "Yes, genuinely",
          "A little",
          "Not really"
        ]
      },
      {
        "n": 11,
        "q": "Was anything clearly wrong?",
        "t": "single",
        "o": [
          "No",
          "Minor details",
          "Yes, something important"
        ]
      },
      {
        "n": 12,
        "q": "If something was wrong, which part?",
        "t": "multi",
        "o": [
          "Attachment",
          "Communication",
          "Attraction",
          "Intimacy",
          "Values",
          "Drive",
          "Lifestyle"
        ],
        "opt": true
      },
      {
        "n": 13,
        "q": "How was the length and readability?",
        "t": "single",
        "o": [
          "Too short",
          "Just right",
          "A bit long",
          "Too much text"
        ]
      },
      {
        "n": 14,
        "q": "I'd trust this to find me better matches than a typical app.",
        "t": "scale"
      },
      {
        "section": "Premium & pricing"
      },
      {
        "n": 15,
        "q": "This beta uses a starter question set. Would you answer more questions to unlock a deeper, more accurate profile?",
        "t": "single",
        "o": [
          "Yes, gladly",
          "Maybe",
          "No"
        ]
      },
      {
        "n": 16,
        "q": "Would you pay a one-off fee for a personal report like this?",
        "t": "single",
        "o": [
          "No",
          "Maybe",
          "Yes"
        ]
      },
      {
        "n": 17,
        "q": "If yes, what one-off price feels fair?",
        "t": "single",
        "o": [
          "€4.99",
          "€9.99",
          "€14.99",
          "€19.99+"
        ],
        "opt": true
      },
      {
        "n": 18,
        "q": "Would you subscribe to a premium Alunn account — unlock more assessments to deepen your profile and improve your match quality?",
        "t": "single",
        "o": [
          "No",
          "Maybe",
          "Yes"
        ]
      },
      {
        "n": 19,
        "q": "If yes, what monthly price feels fair?",
        "t": "single",
        "o": [
          "€4.99/mo",
          "€9.99/mo",
          "€14.99/mo",
          "€19.99+/mo"
        ],
        "opt": true
      },
      {
        "n": 20,
        "q": "Which premium features would make it worth paying for?",
        "t": "multi",
        "o": [
          "A deeper, more accurate profile (more questions)",
          "See who's compatible with you before matching",
          "See who already likes you",
          "Advanced match filters (values, lifestyle, etc.)",
          "Unlimited matches & messaging",
          "Full compatibility breakdown for every match",
          "Relationship coaching & tips",
          "Profile boost / more visibility",
          "Undo / rewind a pass",
          "Browse privately (incognito)",
          "Match in other cities (travel mode)",
          "Ad-free experience"
        ],
        "opt": true
      },
      {
        "section": "Last bit"
      },
      {
        "n": 21,
        "q": "Anything you wish your profile had covered?",
        "t": "multi",
        "o": [
          "Sex/intimacy",
          "Conflict style",
          "Future goals",
          "Family",
          "Finances",
          "Humour/fun",
          "Other"
        ],
        "opt": true
      },
      {
        "n": 22,
        "q": "Anything else about your profile?",
        "t": "open",
        "opt": true
      }
    ]
  },
  "match": {
    "title": "Couple match-report feedback",
    "intro": "For couples — each partner fills this in privately. It's only about whether the compatibility report described the two of you accurately. No questions about your relationship itself.",
    "postType": "fb_match",
    "questions": [
      {
        "n": 1,
        "q": "Your email (to link with your assessment — kept private)",
        "t": "email"
      },
      {
        "q": "Your partner's first name",
        "t": "text",
        "field": "partnerName"
      },
      {
        "n": 2,
        "q": "Overall, the report described us accurately.",
        "t": "scale"
      },
      {
        "n": 3,
        "q": "How well did the Attachment section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 4,
        "q": "How well did the Communication section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 5,
        "q": "How well did the Attraction section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 6,
        "q": "How well did the Intimacy section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 7,
        "q": "How well did the Values section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 8,
        "q": "How well did the Drive section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 9,
        "q": "How well did the Lifestyle section fit you two?",
        "t": "single",
        "o": [
          "Spot on",
          "Mostly",
          "Mixed",
          "Off",
          "Way off"
        ]
      },
      {
        "n": 10,
        "q": "The compatibility score felt…",
        "t": "single",
        "o": [
          "Higher than expected",
          "About what we expected",
          "Lower than expected"
        ]
      },
      {
        "n": 11,
        "q": "Did the report change how you see your dynamic?",
        "t": "single",
        "o": [
          "Yes, new insight",
          "A little",
          "No"
        ]
      },
      {
        "n": 12,
        "q": "How was the length and readability?",
        "t": "single",
        "o": [
          "Too little",
          "Just right",
          "A bit long",
          "Too much text"
        ]
      },
      {
        "n": 13,
        "q": "It would be useful (e.g. as a conversation starter).",
        "t": "scale"
      },
      {
        "n": 14,
        "q": "Would you recommend Alunn to a friend?",
        "t": "single",
        "o": [
          "No",
          "Maybe",
          "Yes, definitely"
        ]
      },
      {
        "n": 15,
        "q": "Anything to add to or remove from the report?",
        "t": "open",
        "opt": true
      }
    ]
  }
};

/* =============================================================================
   Alunn v9 — FEEDBACK renderer (shared by the three forms)
   The page sets `window.FORM_ID` ('assessment' | 'profile' | 'match'),
   then this renders the form and posts to the backend.
   ============================================================================= */

function fbEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fbParam(name){return new URLSearchParams(location.search).get(name)||'';}

// Build the form's inner HTML (everything except the submit button).
function fbFormInner(form, presetEmail, embedded){
  const parts = [];
  if(!embedded){
    parts.push(`<div class="logo-wrap logo-small"><img src="logo.png" alt="Alunn"></div>`);
    parts.push(`<h2>${fbEsc(form.title)}</h2>`);
    parts.push(`<div class="dim-callout"><span class="dim-callout-icon">i</span><div>${fbEsc(form.intro)}</div></div>`);
  }

  // Email field (linking key). The match form has it as question 1; others prepend it.
  const hasEmailQ = form.questions.some(q=>q.t==='email');
  if(!hasEmailQ){
    if(embedded && presetEmail){
      parts.push(`<input type="hidden" id="fb-email" value="${fbEsc(presetEmail)}">`);
    } else {
      parts.push(`<div class="field"><label>Your email <span class="req">*</span></label>
        <input type="email" id="fb-email" value="${fbEsc(presetEmail)}" placeholder="you@example.com"></div>`);
    }
  }

  form.questions.forEach(q=>{
    if(q.section){ parts.push(`<div class="section-divider">${fbEsc(q.section)}</div>`); return; }
    const id = q.field || `${form.postType}_q${q.n}`;
    let ctrl='';
    if(q.t==='email'){
      ctrl=`<input type="email" name="${id}" id="fb-email" value="${fbEsc(presetEmail)}" placeholder="you@example.com">`;
    } else if(q.t==='text'){
      ctrl=`<input type="text" name="${id}" placeholder="Their first name">`;
    } else if(q.t==='open'){
      ctrl=`<textarea name="${id}" rows="3" placeholder="Optional"></textarea>`;
    } else if(q.t==='scale'){
      ctrl=`<div class="scale-row">`+[1,2,3,4,5].map(v=>`<label class="scale-option"><input type="radio" name="${id}" value="${v}"><span class="scale-btn">${v}</span></label>`).join('')+`</div>`+
        `<div class="scale-labels"><span class="scale-label">Strongly disagree</span><span class="scale-label">Strongly agree</span></div>`;
    } else if(q.t==='single'){
      ctrl=`<div class="choice-options">`+(q.o||[]).map(function(o,i){var oid=id+'-o'+i;return `<div class="choice-option"><input type="radio" id="${oid}" name="${id}" value="${fbEsc(o)}"><label for="${oid}">${fbEsc(o)}</label></div>`;}).join('')+`</div>`;
    } else if(q.t==='multi'){
      ctrl=`<div data-multi="${id}">`+(q.o||[]).map(function(o,i){var oid=id+'-m'+i;return `<div class="checkbox-option"><input type="checkbox" id="${oid}" value="${fbEsc(o)}"><label for="${oid}">${fbEsc(o)}</label></div>`;}).join('')+`</div>`;
    }
    const optTag = (q.opt || q.t === 'open') ? ' <span class="org">(optional)</span>' : '';
    const numPrefix = (q.n != null) ? `${q.n}. ` : '';
    parts.push(`<div class="question-block" data-qid="${id}"><p class="question-text">${numPrefix}${fbEsc(q.q)}${optTag}</p>${ctrl}</div>`);
  });

  parts.push(`<div class="error-msg" id="fb-err">Please add your email so we can link your feedback.</div>`);
  return parts.join('');
}

/* Render a form into a mount element.
   opts: { embedded, presetEmail, submitLabel, onSubmitted, skip:{label,onSkip} } */
function fbRenderInto(formId, mountEl, opts){
  opts = opts || {};
  const form = FORMS[formId];
  const presetEmail = opts.presetEmail != null ? opts.presetEmail : fbParam('email');
  const inner = fbFormInner(form, presetEmail, opts.embedded);
  const submitLabel = opts.submitLabel || 'Submit feedback';
  const skipBtn = opts.skip ? `<button class="btn btn-secondary" id="fb-skip">${fbEsc(opts.skip.label)}</button>` : '';
  const body = inner + `<button class="btn" id="fb-submit">${submitLabel}</button>` + skipBtn;
  mountEl.innerHTML = opts.embedded ? body : `<div class="screen active"><div class="card">${body}</div></div>`;
  mountEl.querySelector('#fb-submit').addEventListener('click', () => fbSubmit(form, mountEl, opts));
  if(opts.skip) mountEl.querySelector('#fb-skip').addEventListener('click', opts.skip.onSkip);
}

async function fbSubmit(form, mountEl, opts){
  const btn=mountEl.querySelector('#fb-submit'); const err=mountEl.querySelector('#fb-err');
  const emailEl=mountEl.querySelector('#fb-email');
  const email=(emailEl?emailEl.value:'').trim();

  // Clear previous highlights.
  mountEl.querySelectorAll('.question-block.error').forEach(b => b.classList.remove('error'));

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    err.textContent='Please add a valid email so we can link your feedback.';
    err.classList.add('visible'); emailEl&&emailEl.scrollIntoView({behavior:'smooth',block:'center'}); return;
  }

  // Require every non-optional, non-open question to be answered.
  const missing=[];
  form.questions.forEach(q=>{
    if(q.section||q.t==='email'||q.t==='open'||q.opt) return;
    const id=q.field || `${form.postType}_q${q.n}`;
    let answered;
    if(q.t==='multi') answered = !!mountEl.querySelector(`[data-multi="${id}"] input:checked`);
    else if(q.t==='text'){ const el=mountEl.querySelector(`[name="${id}"]`); answered = !!(el && el.value.trim()); }
    else answered = !!mountEl.querySelector(`input[name="${id}"]:checked`);
    if(!answered) missing.push(id);
  });
  if(missing.length){
    err.textContent='Please answer every question (only the ones marked “optional” can be skipped).';
    err.classList.add('visible');
    const first=mountEl.querySelector(`[data-qid="${missing[0]}"]`);
    if(first){ first.classList.add('error'); first.scrollIntoView({behavior:'smooth',block:'center'}); }
    return;
  }
  err.classList.remove('visible');

  const payload={type:form.postType, email};
  // Couple pairing (match form only): a shared code passed via ?pair= in the link.
  // It's purely additive — if it's missing or wrong, the response still saves
  // fully; it just won't link to a partner. Never blocks or dedupes anything.
  if(form.postType==='fb_match'){ payload.pairKey = fbParam('pair') || ''; }
  form.questions.forEach(q=>{
    if(q.section||q.t==='email') return;
    const id=q.field || `${form.postType}_q${q.n}`;
    if(q.t==='multi'){
      const box=mountEl.querySelector(`[data-multi="${id}"]`);
      payload[id]=box?[...box.querySelectorAll('input:checked')].map(i=>i.value).join('|'):'';
    } else if(q.t==='open'||q.t==='text'){
      const t=mountEl.querySelector(`[name="${id}"]`); payload[id]=t?t.value.trim():'';
    } else {
      const sel=mountEl.querySelector(`input[name="${id}"]:checked`); payload[id]=sel?sel.value:'';
    }
  });

  btn.disabled=true; btn.innerHTML='<span class="btn-spinner"></span> Sending…';
  payload.submissionId = 'fb_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  fbQueueAdd(payload);                          // persist on-device BEFORE sending — survives a network drop
  const ok = await fbPostConfirmed(payload);
  if(ok) fbQueueRemove(payload.submissionId);   // confirmed → clear from the queue
  // If it didn't confirm, it stays queued and auto-retries on the next visit
  // (idempotent via submissionId), so feedback is never lost to a network hiccup.

  // Embedded in the assessment flow: never block the profile reveal (it's queued either way).
  if(typeof opts.onSubmitted === 'function'){ opts.onSubmitted(); return; }

  mountEl.innerHTML=`<div class="screen active"><div class="card" style="text-align:center;">
    <div class="logo-wrap logo-small"><img src="logo.png" alt="Alunn"></div>
    <div class="thankyou-icon">✓</div><h2>Thank you</h2>
    <p class="screen-intro-text">Your feedback is saved — this genuinely shapes how Alunn develops.</p></div></div>`;
  window.scrollTo({top:0,behavior:'smooth'});
}

// Confirmed, retrying feedback POST. Reads the server's {ok:true}; idempotent
// (submissionId) so retries never duplicate. Returns true only when confirmed.
async function fbPostConfirmed(payload){
  for(let i=1;i<=4;i++){
    try{
      const res=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
      const data=await res.json();
      if(data && data.ok) return true;
    }catch(e){}
    await new Promise(r=>setTimeout(r,700*i));
  }
  return false;
}

/* ── Durable feedback queue ──────────────────────────────────────────────────
   Mirrors the questionnaire's reliability: each feedback payload is stored in
   localStorage BEFORE sending and only removed once the server confirms it.
   Anything left over (a failed/offline submit) is retried on the next visit.
   Idempotent via submissionId, so retries never create duplicate rows. ───────*/
const FB_PENDING_KEY = 'alunn_v9_fb_pending';
function fbQueueGet(){ try { return JSON.parse(localStorage.getItem(FB_PENDING_KEY)) || []; } catch(e){ return []; } }
function fbQueueSet(arr){ try { localStorage.setItem(FB_PENDING_KEY, JSON.stringify(arr)); } catch(e){} }
function fbQueueAdd(p){ const a = fbQueueGet(); a.push(p); fbQueueSet(a); }
function fbQueueRemove(id){ fbQueueSet(fbQueueGet().filter(p => p.submissionId !== id)); }
async function fbFlushPending(){
  const a = fbQueueGet();
  if(!a.length) return;
  for(const p of a){
    try {
      const res = await fetch(APPS_SCRIPT_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(p) });
      const d = await res.json();
      if(d && d.ok) fbQueueRemove(p.submissionId);   // confirmed (idempotent) → drop it
    } catch(e){ /* still offline — leave it queued for next time */ }
  }
}

// Standalone page mode: fb-*.html sets window.FORM_ID and has a #fb-app container.
document.addEventListener('DOMContentLoaded', function(){
  fbFlushPending();   // retry any feedback queued on a previous visit with no/poor connection
  if(window.FORM_ID && document.getElementById('fb-app')){
    fbRenderInto(window.FORM_ID, document.getElementById('fb-app'), {});
  }
});
