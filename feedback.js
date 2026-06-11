const FORMS = {
  "assessment": {
    "title": "How was the assessment?",
    "intro": "A few quick questions about the experience of taking it. Honest reactions — even critical ones — are the most useful thing you can give this beta.",
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
        ]
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
        ]
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
        "t": "open"
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
        "n": 8,
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
        "n": 9,
        "q": "Did the profile tell you anything insightful about yourself?",
        "t": "single",
        "o": [
          "Yes, genuinely",
          "A little",
          "Not really"
        ]
      },
      {
        "n": 10,
        "q": "Was anything clearly wrong?",
        "t": "single",
        "o": [
          "No",
          "Minor details",
          "Yes, something important"
        ]
      },
      {
        "n": 11,
        "q": "If something was wrong, which part?",
        "t": "multi",
        "o": [
          "Attachment",
          "Communication",
          "Drive/goals",
          "Intimacy",
          "Values",
          "Lifestyle"
        ]
      },
      {
        "n": 12,
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
        "n": 13,
        "q": "I'd trust this to give me better matches than a normal app.",
        "t": "scale"
      },
      {
        "n": 14,
        "q": "Would you pay for a deeper personal report?",
        "t": "single",
        "o": [
          "No",
          "Maybe",
          "Yes"
        ]
      },
      {
        "n": 15,
        "q": "If yes, what one-off price feels fair?",
        "t": "single",
        "o": [
          "€4.99",
          "€9.99",
          "€14.99",
          "€19.99+"
        ]
      },
      {
        "n": 16,
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
        ]
      },
      {
        "n": 17,
        "q": "Anything else about your profile?",
        "t": "open"
      }
    ]
  },
  "match": {
    "title": "Couple match-report feedback",
    "intro": "For couples — each partner fills this in privately. Part 1 is about your relationship (kept private); Part 2 is about the report.",
    "postType": "fb_match",
    "questions": [
      {
        "n": 1,
        "q": "Your email (to link with your assessment — kept private)",
        "t": "email"
      },
      {
        "n": 2,
        "q": "Your relationship status right now",
        "t": "single",
        "o": [
          "Together",
          "Recently separated",
          "Broken up"
        ]
      },
      {
        "n": 3,
        "q": "How long together (or how long were you)?",
        "t": "single",
        "o": [
          "<6 mo",
          "6–12 mo",
          "1–3 yr",
          "3–7 yr",
          "7+ yr"
        ]
      },
      {
        "n": 4,
        "q": "My partner meets my needs well.",
        "t": "scale"
      },
      {
        "n": 5,
        "q": "Overall, I am satisfied with our relationship.",
        "t": "scale"
      },
      {
        "n": 6,
        "q": "Our relationship is better than most.",
        "t": "scale"
      },
      {
        "n": 7,
        "q": "I often wish I hadn't gotten into this relationship. (reverse)",
        "t": "scale",
        "rev": true
      },
      {
        "n": 8,
        "q": "Overall, the report described us accurately.",
        "t": "scale"
      },
      {
        "n": 9,
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
        "n": 10,
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
        "n": 11,
        "q": "Accuracy — Polarity / attraction section",
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
        "n": 12,
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
        "n": 13,
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
        "n": 14,
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
        "n": 15,
        "q": "The compatibility score was…",
        "t": "single",
        "o": [
          "Higher than expected",
          "About what we expected",
          "Lower than expected"
        ]
      },
      {
        "n": 16,
        "q": "Did the report change how you see your dynamic?",
        "t": "single",
        "o": [
          "Yes, new insight",
          "A little",
          "No"
        ]
      },
      {
        "n": 17,
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
        "n": 18,
        "q": "It would be useful (e.g. as a conversation starter).",
        "t": "scale"
      },
      {
        "n": 19,
        "q": "Would you recommend Alunn to a friend?",
        "t": "single",
        "o": [
          "No",
          "Maybe",
          "Yes, definitely"
        ]
      },
      {
        "n": 20,
        "q": "Anything to add to or remove from the report?",
        "t": "open"
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

function fbRender(){
  const form = FORMS[window.FORM_ID];
  const app = document.getElementById('fb-app');
  const presetEmail = fbParam('email');
  const parts = [`<div class="logo-wrap logo-small"><img src="logo.png" alt="Alunn"></div>`,
    `<h2>${fbEsc(form.title)}</h2>`,
    `<p class="screen-intro-text">${fbEsc(form.intro)}</p>`];

  // Email field (linking key). For the match form it's question 1; otherwise prepend one.
  const hasEmailQ = form.questions.some(q=>q.t==='email');
  if(!hasEmailQ){
    parts.push(`<div class="field"><label>Your email <span class="req">*</span></label>
      <input type="email" id="fb-email" value="${fbEsc(presetEmail)}" placeholder="you@example.com"></div>`);
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
    parts.push(`<div class="question-block" data-qid="${id}"><p class="question-text">${q.n}. ${fbEsc(q.q)}</p>${ctrl}</div>`);
  });

  parts.push(`<div class="error-msg" id="fb-err">Please add your email so we can link your feedback.</div>`);
  parts.push(`<button class="btn" id="fb-submit" onclick="fbSubmit()">Submit feedback</button>`);
  app.innerHTML = `<div class="screen active"><div class="card">${parts.join('')}</div></div>`;
}

async function fbSubmit(){
  const form = FORMS[window.FORM_ID];
  const btn=document.getElementById('fb-submit'); const err=document.getElementById('fb-err');
  const emailEl=document.getElementById('fb-email');
  const email=(emailEl?emailEl.value:'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err.classList.add('visible'); emailEl&&emailEl.scrollIntoView({behavior:'smooth',block:'center'}); return; }
  err.classList.remove('visible');

  const payload={type:form.postType, email};
  form.questions.forEach(q=>{
    if(q.section||q.t==='email') return;
    const id=`${form.postType}_q${q.n}`;
    if(q.t==='multi'){
      const box=document.querySelector(`[data-multi="${id}"]`);
      payload[id]=box?[...box.querySelectorAll('input:checked')].map(i=>i.value).join('|'):'';
    } else if(q.t==='open'){
      const t=document.querySelector(`[name="${id}"]`); payload[id]=t?t.value.trim():'';
    } else {
      const sel=document.querySelector(`input[name="${id}"]:checked`); payload[id]=sel?sel.value:'';
    }
  });

  btn.disabled=true; btn.textContent='Sending…';
  try{
    await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),mode:'no-cors'});
  }catch(e){}
  document.getElementById('fb-app').innerHTML=`<div class="screen active"><div class="card" style="text-align:center;">
    <div class="logo-wrap logo-small"><img src="logo.png" alt="Alunn"></div>
    <div class="thankyou-icon">✓</div><h2>Thank you</h2>
    <p class="screen-intro-text">Your feedback is in — this genuinely shapes how Alunn develops.</p></div></div>`;
  window.scrollTo({top:0,behavior:'smooth'});
}

document.addEventListener('DOMContentLoaded', fbRender);
