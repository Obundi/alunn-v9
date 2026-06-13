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
        "q": "Did any questions feel too personal or uncomfortable?",
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
        "q": "How many up-front questions feels acceptable to you?",
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
        "q": "Accuracy — Attachment style",
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
        "q": "Accuracy — Communication style",
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
        "q": "Accuracy — Attraction (what draws you to a partner)",
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
        "q": "Accuracy — Intimacy needs",
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
        "q": "Accuracy — Values",
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
        "q": "Accuracy — Relationship drive / goals",
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
        "q": "Accuracy — Lifestyle",
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
        "q": "My main result (e.g. your attachment style / drive type) felt…",
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
        "q": "The report length / readability was…",
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
        "q": "I'd trust this to give me better matches than a normal app.",
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
        "n": 2,
        "q": "Overall, the report described us accurately.",
        "t": "scale"
      },
      {
        "n": 3,
        "q": "Accuracy — Attachment section",
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
        "q": "Accuracy — Communication section",
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
        "q": "Accuracy — Attraction / polarity section",
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
        "q": "Accuracy — Intimacy section",
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
        "q": "Accuracy — Values section",
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
        "q": "Accuracy — Drive / goals section",
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
        "q": "Accuracy — Lifestyle section",
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
        "q": "The compatibility score was…",
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
        "q": "Report length / readability",
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
    const id = `${form.postType}_q${q.n}`;
    let ctrl='';
    if(q.t==='email'){
      ctrl=`<input type="email" name="${id}" id="fb-email" value="${fbEsc(presetEmail)}" placeholder="you@example.com">`;
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
    parts.push(`<div class="question-block" data-qid="${id}"><p class="question-text">${q.n}. ${fbEsc(q.q)}${optTag}</p>${ctrl}</div>`);
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
    const id=`${form.postType}_q${q.n}`;
    const answered = q.t==='multi'
      ? !!mountEl.querySelector(`[data-multi="${id}"] input:checked`)
      : !!mountEl.querySelector(`input[name="${id}"]:checked`);
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
  form.questions.forEach(q=>{
    if(q.section||q.t==='email') return;
    const id=`${form.postType}_q${q.n}`;
    if(q.t==='multi'){
      const box=mountEl.querySelector(`[data-multi="${id}"]`);
      payload[id]=box?[...box.querySelectorAll('input:checked')].map(i=>i.value).join('|'):'';
    } else if(q.t==='open'){
      const t=mountEl.querySelector(`[name="${id}"]`); payload[id]=t?t.value.trim():'';
    } else {
      const sel=mountEl.querySelector(`input[name="${id}"]:checked`); payload[id]=sel?sel.value:'';
    }
  });

  btn.disabled=true; btn.innerHTML='<span class="btn-spinner"></span> Sending…';
  try{
    await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),mode:'no-cors'});
  }catch(e){}

  if(typeof opts.onSubmitted === 'function'){ opts.onSubmitted(); return; }
  mountEl.innerHTML=`<div class="screen active"><div class="card" style="text-align:center;">
    <div class="logo-wrap logo-small"><img src="logo.png" alt="Alunn"></div>
    <div class="thankyou-icon">✓</div><h2>Thank you</h2>
    <p class="screen-intro-text">Your feedback is in — this genuinely shapes how Alunn develops.</p></div></div>`;
  window.scrollTo({top:0,behavior:'smooth'});
}

// Standalone page mode: fb-*.html sets window.FORM_ID and has a #fb-app container.
document.addEventListener('DOMContentLoaded', function(){
  if(window.FORM_ID && document.getElementById('fb-app')){
    fbRenderInto(window.FORM_ID, document.getElementById('fb-app'), {});
  }
});
