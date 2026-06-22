/* =============================================================================
   Alunn v9 - Google Apps Script backend (NEW v9 deployment)
   Bind this to a NEW Google Sheet, then Deploy -> New deployment -> Web app
   (Execute as: Me; Who has access: Anyone). Paste the /exec URL into config.js.

   Storage model (matches the spec): one sheet per submission type. Each row is
   raw answers keyed by field code; columns are added automatically as new keys
   appear, so headers mirror the engine's 1 INPUT field codes exactly and the
   client-side scorer reads them by name.

   IMPORTANT: set ADMIN_TOKEN below to the SAME value as ADMIN_PIN in config.js.
   ============================================================================= */

var ADMIN_TOKEN = 'alunnobundi';   // must equal ADMIN_PIN in config.js

// Get an email every time someone submits. Leave '' to switch notifications off.
var OWNER_EMAIL = 'obiberg@hotmail.com';

var SHEETS = {
  questionnaire: 'Responses',
  fb_assessment: 'FB_Assessment',
  fb_profile:    'FB_Profile',
  fb_match:      'FB_Match'
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var type = body.type || 'questionnaire';
    var sheetName = SHEETS[type] || 'Misc';
    var added = appendObject(sheetName, body);
    if (added) notify(type, body);   // only email on a genuinely new row, not retries
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Email the owner when a submission arrives. Never lets an email error break the save.
function notify(type, body) {
  if (!OWNER_EMAIL || OWNER_EMAIL.indexOf('YOUR_EMAIL_HERE') === 0) return;
  try {
    var labels = {
      questionnaire: 'assessment completed',
      fb_assessment: 'feedback - assessment experience',
      fb_profile:    'feedback - profile accuracy',
      fb_match:      'feedback - couple match report'
    };
    var what = labels[type] || type;
    var who = (body.name ? body.name + ' - ' : '') + (body.email || 'no email');
    var subject = 'Alunn - ' + what + ' (' + who + ')';
    var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    var lines = [
      'New submission on Alunn.',
      '',
      'Type: ' + what,
      'From: ' + who,
      'Time: ' + new Date().toString(),
      '',
      'Open the sheet: ' + sheetUrl
    ];
    MailApp.sendEmail(OWNER_EMAIL, subject, lines.join('\n'));
  } catch (err) { /* notification failure must never block the save */ }
}

function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();
  var token = e.parameter.token || '';
  if (action === 'getall' || action === 'lookup' || action === 'getfeedback') {
    if (token !== ADMIN_TOKEN) return json({ ok: false, error: 'unauthorized' });
  }
  if (action === 'getall') {
    return json({ people: readAll(SHEETS.questionnaire) });
  }
  if (action === 'getfeedback') {
    return json({
      fb_assessment: readAll(SHEETS.fb_assessment),
      fb_profile:    readAll(SHEETS.fb_profile),
      fb_match:      readAll(SHEETS.fb_match)
    });
  }
  if (action === 'lookup') {
    var all = readAll(SHEETS.questionnaire);
    var a = findEmail(all, e.parameter.emailA);
    var b = findEmail(all, e.parameter.emailB);
    return json({ personA: a, personB: b });
  }
  return json({ ok: true, info: 'Alunn v9 backend' });
}

/* helpers */

// Returns true if a new row was added, false if it was a duplicate (already saved).
function appendObject(sheetName, obj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var lastCol = sheet.getLastColumn();
    var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    if (!headers.length || (headers.length === 1 && headers[0] === '')) {
      headers = ['timestamp'];
      sheet.getRange(1, 1, 1, 1).setValues([headers]);
    }
    // Idempotency: if this submissionId is already stored, skip (safe retries).
    if (obj.submissionId) {
      var idCol = headers.indexOf('submissionId');
      if (idCol !== -1 && sheet.getLastRow() > 1) {
        var ids = sheet.getRange(2, idCol + 1, sheet.getLastRow() - 1, 1).getValues();
        for (var r = 0; r < ids.length; r++) {
          if (String(ids[r][0]) === String(obj.submissionId)) return false; // already saved
        }
      }
    }
    // Add any new keys as columns.
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      if (headers.indexOf(keys[i]) === -1) {
        headers.push(keys[i]);
        sheet.getRange(1, headers.length, 1, 1).setValue(keys[i]);
      }
    }
    var row = headers.map(function (h) {
      if (h === 'timestamp') return new Date();
      return obj[h] !== undefined ? obj[h] : '';
    });
    sheet.appendRow(row);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function readAll(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var o = {};
    for (var c = 0; c < headers.length; c++) o[headers[c]] = values[r][c];
    out.push(o);
  }
  return out;
}

function findEmail(list, email) {
  if (!email) return null;
  email = String(email).trim().toLowerCase();
  // Latest submission wins if duplicates exist.
  for (var i = list.length - 1; i >= 0; i--) {
    if (String(list[i].email || list[i].Email || '').trim().toLowerCase() === email) return list[i];
  }
  return null;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this ONCE from the editor (select testNotify -> Run) to grant email
// permission and confirm a test message arrives in your inbox.
function testNotify() {
  notify('questionnaire', { name: 'Test', email: 'test@example.com' });
}
