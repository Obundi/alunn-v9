# Alunn v9 — Data Protection Impact Assessment (short-form)

*Beta-validation site. Last updated 2026-06-11.*

## 1. What & why
Alunn is a beta dating-compatibility concept. It collects a 20-question assessment plus
profile/preference details to generate a psychological compatibility profile and (for
consenting couples) a match report. Purpose: validate the matching concept with a small
beta cohort. **No payments, accounts, chat or swiping** in this build.

## 2. Special-category data (GDPR Article 9)
The assessment collects special categories of personal data:
- **Sexual orientation** and "looking for" (Art. 9)
- **Religion** and its importance (Art. 9)
- **Political leaning** (Art. 9, optional)
- **Sex / intimacy** preferences and **personality** traits (sensitive by nature)

**Lawful basis:** Article 6(1)(a) consent + **Article 9(2)(a) explicit consent.**
A separate, unbundled explicit-consent checkbox is presented **before any data is
collected** (assessment step "About you"), naming the sensitive categories and the
purpose. Consent and a timestamp are stored with the record. It is **not** bundled into
general terms.

## 3. Data minimisation
- Only fields used by the engine or for beta analysis are collected.
- Mandatory hard filters are limited to what matching needs; everything else is optional.
- No photos, no precise location (city + radius only), no government IDs.

## 4. Storage & access
- Raw answers stored in a private Google Sheet (EU/again region as configured), via an
  Apps Script web app. Scoring happens **client-side**; the Sheet holds raw answers only.
- Admin match tool is PIN-gated; the same token guards the `getall`/`lookup` endpoints.
- Access limited to the project owner.

## 5. Rights & retention
- **Withdrawal / deletion:** users may withdraw consent and request deletion at any time
  (contact email on the site / in the consent text). Deletion = remove the row(s) keyed
  by their email from all sheets.
- **Retention:** beta data kept only for the duration of the beta analysis, then deleted
  or anonymised.
- **Access/portability:** owner can export a user's row on request.

## 6. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Sensitive data exposure | Private Sheet; PIN-gated admin + token-gated endpoints; HTTPS (GitHub Pages + Google). |
| Consent not truly explicit | Separate unbundled checkbox, specific wording, blocks progress until ticked. |
| Re-identification | Small cohort — treat all data as identifiable; restrict access to owner. |
| Secret leakage | ADMIN_PIN/token kept out of the public repo where possible; rotate if exposed. |

## 7. Outstanding before real users (full app, see spec §12)
A full consumer app (accounts, photos, chat, scale) needs a proper security review,
a real DPIA, encryption-at-rest controls, and a hosted backend — out of scope for this beta.
