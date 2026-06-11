# Alunn v9 — beta website

Personality-first dating concept, beta-validation site. Upgrade of the original beta to the
**v9 engine** (`Alunn_Full_System_v9.xlsx`). Vanilla HTML/CSS/JS, no build step, hosted on
GitHub Pages; backend is Google Apps Script + Sheets.

## Flow
1. **`index.html`** — assessment: Intro → You (email + **Article-9 explicit consent**) →
   Setup (hard filters, mandatory enforced) → 20 questions (grouped) → inline **profile report**
   (per-dimension score, bar, about-you + growth tip). No stars on the solo profile.
2. **`admin-match.html`** — PIN-gated. *Top Matches* (rank everyone vs one email, as **stars**),
   *Match Report* (two emails → bidirectional report, per-dimension meaning + coaching tip,
   stars, hard-filter gate), *Profile Report* (regenerate an individual profile).
3. **`fb-assessment.html` / `fb-profile.html` / `fb-match.html`** — the three feedback forms.

## Files
| File | Role |
|---|---|
| `engine-config.js` | **Single source of truth** — weights, star bands, matrices, field maps. Recalibrate here. |
| `scorer.js` | v9 individual scoring + profile report. |
| `admin-match.js` | v9 bidirectional matching engine (+ stars, hard-filter gate). |
| `admin-ui.js` | Admin page glue (fetch + render). |
| `questions-data.js` | The 20 questions + hard-filter definitions. |
| `text-library.js` | Report text (profile about-you/tip + match meaning/tip). |
| `app.js` | Assessment flow UI. |
| `feedback.js` | Shared feedback form renderer + the three form specs. |
| `config.js` | `APPS_SCRIPT_URL` + `ADMIN_PIN` — **edit before going live**. |
| `backend/Code.gs` | Apps Script for the new v9 Sheet. |
| `DPIA.md` | GDPR data-protection note. |

## Setup
1. **Backend:** create a new Google Sheet → Extensions → Apps Script → paste `backend/Code.gs`.
   Set `ADMIN_TOKEN` to your chosen admin PIN. Deploy → New deployment → Web app
   (Execute as *Me*, Access *Anyone*). Copy the `/exec` URL.
2. **Config:** in `config.js`, set `APPS_SCRIPT_URL` to that URL and change `ADMIN_PIN`
   (must equal `ADMIN_TOKEN`).
3. **Host:** push this folder to a new GitHub repo, enable Pages on `main`, point DNS.

## Engine verification
The scoring + matching engines are verified to reproduce `Alunn_Full_System_v9.xlsx` exactly
(the four example people; Alex × Sam = 78 / ★★★★½). No Node on the build machine — tests run
under JavaScriptCore:
```
cat engine-config.js scorer.js admin-match.js test/data.js test/run.js > /tmp/v.js
osascript -l JavaScript /tmp/v.js
```

## Not in this build
Payments, accounts, photos, chat, swiping — those are the full consumer app (spec §12),
a separate larger build on a real stack. The v9 engine logic ports straight over.
