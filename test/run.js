/* Run with:
   cat ../engine-config.js ../scorer.js ../admin-match.js data.js run.js > /tmp/v.js && osascript -l JavaScript /tmp/v.js
   (or from repo root, adjust paths). Verifies scoring + matching vs the v9 xlsx. */
var checks = [
  ['Secure','secure'],['Anxious','anxious'],['Avoidant','avoidant'],['AttComp','attComp'],['AttStyle','attStyle'],
  ['ComDir','comDir'],['ComExp','comExp'],['ComAna','comAna'],['ComHar','comHar'],['ComQual','comQual'],['ComMax','comMax'],['ComStyle','comStyle'],
  ['DrvB%','drvB'],['DrvC%','drvC'],['DrvE%','drvE'],['DrvN%','drvN'],['DrvType','drvType'],
  ['IntLvl','intLvl'],['ValLvl','valLvl'],['ValMoney','valMoney'],['ValScore','valScore'],['LifLvl','lifLvl'],
  ['BigO','bigO'],['BigC','bigC'],['BigE','bigE'],['BigA','bigA'],['BigS','bigS'],['AmbTrait','ambTrait'],
  ['PrefOver','prefOver'],['PrefSoc','prefSoc'],['PrefAmb','prefAmb'],['PrefOrg','prefOrg'],['PrefStab','prefStab'],
  ['PrefOpen','prefOpen'],['PrefExpr','prefExpr'],['PrefConf','prefConf'],['Clarity%','clarity']
];
var out = [];
var fails = 0;
Object.keys(people).forEach(function (pid) {
  var got = scoreAnswers(people[pid]);
  var exp = expected[pid];
  var bad = [];
  checks.forEach(function (c) {
    var e = exp[c[0]];
    var g = got[c[1]];
    if (typeof e === 'number' && typeof g === 'number') {
      if (Math.abs(e - g) > 0.5) bad.push(c[0] + ': exp ' + e + ' got ' + g.toFixed(2));
    } else if (String(e) !== String(g)) {
      bad.push(c[0] + ': exp [' + e + '] got [' + g + ']');
    }
  });
  if (bad.length) {
    fails += bad.length;
    out.push('FAIL ' + pid + ' ' + exp.Name + ':');
    bad.forEach(function (b) { out.push('    ' + b); });
  } else {
    out.push('OK   ' + pid + ' ' + exp.Name + ': ' + got.attStyle + ' / ' + got.comStyle + ' / ' + got.drvType +
             '  Int=' + got.intLvl + ' Val=' + got.valScore + ' Clarity=' + got.clarity + '%');
  }
});
out.push(fails ? ('\n' + fails + ' MISMATCHES') : '\nALL MATCH');
out.join('\n');

/* ── matching check (Alex × Sam) ── */
function mkPerson(pid){var raw=people[pid];var f={};['Gender','Orientation','LookingFor','Intent','RelType','WantKids','AgeMin','AgeMax','City','HasKids','OpenToKids','Religion','RelImportance'].forEach(function(k){f[k]=raw[k];});return {name:raw.Name,filters:f,scores:scoreAnswers(raw)};}
// Post-recalibration expectations (decompressed dims + polarity spread + final spread-curve).
var mr=matchPair(mkPerson('P01'),mkPerson('P02'));
var mfails=0;var exp={ATT:55,COM:83,POL:85,INT:100,VAL:85,DRV:44,LIF:80};
['ATT','COM','POL','INT','VAL','DRV','LIF'].forEach(function(c){if(mr.perDim[c]!==exp[c]){mfails++;}});
if(mr.overall!==68)mfails++; if(mr.stars!=='★★★½')mfails++;
var tail = '\nMATCH Alex×Sam: overall='+mr.overall+' stars='+mr.stars+(mfails?' ('+mfails+' MATCH MISMATCHES)':' OK');

/* ── personal-weight check: no prefs == baseline; with prefs it shifts ── */
var alexPref=mkPerson('P01'); alexPref.scores.prefRank=['VAL','LIF','COM'];
var prefMr=matchPair(alexPref, mkPerson('P02'));
var pcheck=(mr.overall===68 && prefMr.overall!==null && prefMr.overall!==68)?' OK':' CHECK';
var prefTail='\nPREF  Alex×Sam: no-prefs='+mr.overall+' (baseline) -> Alex prioritises VAL,LIF,COM='+prefMr.overall+pcheck;
out.join('\n')+tail+prefTail;
