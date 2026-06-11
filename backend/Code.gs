/* =============================================================================
   Alunn v9 — Google Apps Script backend (NEW v9 deployment)
   Bind this to a NEW Google Sheet, then Deploy → New deployment → Web app
   (Execute as: Me; Who has access: Anyone). Paste the /exec URL into config.js.

   Storage model (matches the spec): one sheet per submission type. Each row is
   raw answers keyed by field code; columns are added automatically as new keys
   appear, so headers mirror the engine's ① INPUT field codes exactly and the
   client-side scorer reads them by name.

   IMPORTANT: set ADMIN_TOKEN below to the SAME value as ADMIN_PIN in config.js.
   ============================================================================= */

var ADMIN_TOKEN = 'CHANGE-ME-v9';   // must equal ADMIN_PIN in config.js

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
    appendObject(sheetName, body);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();
  var token = e.parameter.token || '';
  if (action === 'getall' || action === 'lookup') {
    if (token !== ADMIN_TOKEN) return json({ ok: false, error: 'unauthorized' });
  }
  if (action === 'getall') {
    return json({ people: readAll(SHEETS.questionnaire) });
  }
  if (action === 'lookup') {
    var all = readAll(SHEETS.questionnaire);
    var a = findEmail(all, e.parameter.emailA);
    var b = findEmail(all, e.parameter.emailB);
    return json({ personA: a, personB: b });
  }
  return json({ ok: true, info: 'Alunn v9 backend' });
}

/* ── helpers ──────────────────────────────────────────────────────────────── */

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
