/**
 * PFC CONTROL — Apps Script backend (0.2)
 * =====================================================================
 * This script is SEPARATE from the camera app script (appscript/Code.js).
 * Do not merge the two. They use different Drive folders and different
 * deployments.
 *
 * What this script does:
 *   - Creates one Google Sheet per project (building).
 *   - Reads that Sheet back for the Tracker screens.
 *   - Changes a project's structure (items and units) on request.
 *
 *   - Writes status values and deficiency records, a whole outbox at a
 *     time, through 'save-batch'.
 *
 * What this script does NOT do yet:
 *   - 'cancel-item-records', which the Admin refusal panel needs. That
 *     arrives in 0.2 step 5. See the note at the end of this file.
 *
 * Config version 2 (0.2) against version 1 (0.1):
 *   - Three status values, not five. Deficiency and On Hold were never
 *     progress. They are flags now, and a flag is an open row in the
 *     Deficiencies tab.
 *   - Every item has one column, not two. The Details column is gone.
 *   - A new Deficiencies tab holds one row per problem.
 *   - The config carries the reason list, and each item's subtype list,
 *     reason trim and needed-box hint.
 *
 * There is no upgrade path from version 1. This script refuses a
 * version 1 Sheet rather than drawing it wrong.
 *
 * Deployment: see control/README.md.
 * =====================================================================
 */


// ── CONFIGURATION ─────────────────────────────────────────────────────
// Change these two lines if you move the Drive folders.

/**
 * Drive folder that everything PFC Control owns sits inside.
 * This is My Drive/PFC/Control, which holds Project Sheets and Master
 * Template. The camera app's Project Logs stays outside it, and the two
 * scripts share My Drive/PFC/Apps Scripts.
 *
 * Pinned by ID, not by name, on purpose. A name lookup would silently
 * build a second Control folder the day this one is renamed or moved, and
 * every project made after that would vanish from the app with no error.
 * An ID survives a rename and a move.
 *
 * Leave it empty to use the top level of My Drive instead.
 * To repoint it, open the folder in Drive and copy the ID from the address bar.
 */
var PFC_ROOT_FOLDER_ID = '1SwrhzsObgZpaLsjJtP5ErsEZtt53ton9';

/**
 * Name of the folder that holds every generated project Sheet.
 *
 * THIS ONE IS FOUND BY NAME, so it is the only Drive reference in either
 * script that a move can break. Drag this folder somewhere else and
 * getProjectsFolder will not find it — it will quietly create a new empty
 * one and every existing project will disappear from the app. Move it only
 * by moving the Control folder above, which is pinned by ID and carries it.
 */
var PROJECTS_FOLDER_NAME = 'Project Sheets';


// ── FIXED NAMES AND VALUES (do not change) ────────────────────────────

var TRACKER_SHEET_NAME   = 'Unit Tracker';
var DASHBOARD_SHEET_NAME = 'Dashboard';
var CONFIG_SHEET_NAME    = '_Config';   // hidden tab, holds the structure
var DEFICIENCIES_SHEET_NAME = 'Deficiencies';   // one row per problem

/** The config version this script builds and reads. */
var CONFIG_VERSION = 2;

/** The three status values, in the order they appear in the dropdown. */
var STATUS_VALUES = ['Not Started', 'In Progress', 'Complete'];

/** Sheet fill colour for each status. Copied from the master template. */
var STATUS_FILLS = {
  'Not Started': '#EFEFEF',
  'In Progress': '#FFEB9C',
  'Complete':    '#C6EFCE'
};

/** Sheet label -> short key used by the app. */
var STATUS_KEYS = {
  'Not Started': 'not_started',
  'In Progress': 'in_progress',
  'Complete':    'complete'
};

/**
 * Short key -> Sheet label. The phone works in short keys everywhere, and
 * save-batch turns one into the label the dropdown holds on the way in.
 * A key that is not in here is refused, so a typo can never write a value
 * the dropdown does not offer.
 */
var STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  complete:    'Complete'
};

/**
 * How many jobs one save-batch call writes. The rest wait for the next
 * drain. An Apps Script call has six minutes, and waiting for the lock
 * eats into that before a single cell is written.
 */
var MAX_JOBS_PER_BATCH = 100;

/** The three states a record can be in. Nothing else is accepted. */
var RECORD_STATES = ['Open', 'Fixed', 'Cancelled'];

/**
 * Fill for the Dashboard's open-flag count.
 * It is the old Deficiency fill. The colour stayed useful when the status
 * stopped existing.
 */
var C_FLAG_FILL = '#FFC7CE';

/**
 * The reason list a building starts with, if the create payload sends none.
 *
 * The real seed is DEFAULT_REASONS in control/shared/common.js, and the
 * Admin create form sends it up in the payload. This copy is only a floor,
 * so an old Admin build or a hand-made API call cannot create a building
 * with no reasons at all — Logger would have nothing to offer.
 * Keep the two in step.
 */
var FALLBACK_REASONS = ['Wrong Size', 'Wrong Type', 'Wrong Swing', 'Wrong Color',
                        'Missing', 'Damaged', 'Defective', 'Other'];

/** The Deficiencies tab header row. Keys, not labels. */
var DEFICIENCY_COLUMNS = ['record_id', 'unit', 'phase', 'item', 'type', 'reason',
                          'other_text', 'subtype', 'needed', 'quantity', 'state',
                          'created', 'closed'];

/** Column numbers inside the Deficiencies tab, worked out from the list above. */
var DEF_COL = {
  unit:  DEFICIENCY_COLUMNS.indexOf('unit')  + 1,   // B
  phase: DEFICIENCY_COLUMNS.indexOf('phase') + 1,   // C
  type:  DEFICIENCY_COLUMNS.indexOf('type')  + 1,   // E
  state: DEFICIENCY_COLUMNS.indexOf('state') + 1    // K
};

/** Theme colours, taken from the master template. */
var C_TITLE_BG    = '#1A1A1A';
var C_SUBTITLE_BG = '#242424';
var C_BAND_BG     = '#DE7452';   // phase band, PFC Control accent
var C_ITEM_BG     = '#404040';   // item name row
var C_SUBHEAD_BG  = '#555555';   // Status / Details row
var C_LABEL_BG    = '#F5F5F5';   // Dashboard row labels
var C_BORDER      = '#D0D0D0';
var C_TITLE_FG    = '#FFFFFF';
var C_SUBTITLE_FG = '#AAAAAA';
var C_DARK_FG     = '#1A1A1A';

/** Rows 1 to 6 are headers. Unit rows start at row 7. */
var FIRST_DATA_ROW = 7;

/** How long the project list stays cached, in seconds. */
var LIST_CACHE_SECONDS = 60;


// ── WEB APP ENTRY POINTS ──────────────────────────────────────────────

/**
 * GET handler.
 *
 * With no action it returns a plain-text health check, the same way the
 * camera app script does.
 *
 * Every action also works over GET. This looks unusual for the two write
 * actions, but it gives the app a fallback path. Some browsers block the
 * POST reply on a job site proxy. The app can then retry the same call as
 * a JSONP GET and still work. Pass the body as a JSON string in "payload".
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || '';

  if (!action) {
    return ContentService.createTextOutput('PFC Control — Active');
  }

  var result;
  try {
    var data = params.payload ? JSON.parse(params.payload) : params;
    result = route(action, data);
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return respond(result, params.callback);
}


/**
 * POST handler. The app sends Content-Type text/plain so the browser makes
 * a simple request and skips the CORS preflight. The camera app uses the
 * same trick.
 */
function doPost(e) {
  var result;
  try {
    var data = JSON.parse(e.postData.contents);
    result = route(data.action || '', data);
  } catch (err) {
    result = { success: false, error: err.toString() };
  }
  return respond(result, null);
}


/** Sends every action to its handler. */
function route(action, data) {
  switch (action) {
    case 'list-projects':    return handleListProjects(data.fresh === '1' || data.fresh === true);
    case 'get-project':      return handleGetProject(data.id);
    case 'get-structure':    return handleGetStructure(data.id);
    case 'get-unit':         return handleGetUnit(data.id, data.unit);
    case 'create-project':   return handleCreateProject(data);
    case 'update-structure': return handleUpdateStructure(data);
    case 'save-batch':       return handleSaveBatch(data.jobs);
    default:                 return { success: false, error: 'Unknown action: ' + action };
  }
}


/**
 * Builds the reply.
 * With a callback name it replies as JSONP, so a plain script tag can read it.
 */
function respond(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


// ── READ ACTIONS ──────────────────────────────────────────────────────

/**
 * Lists every project Sheet in the Project Sheets folder.
 * A file is a project only if it has a _Config tab.
 *
 * Every building is returned, finished or not. The server sends numbers
 * and no verdict. The phone decides what a building reads and what it
 * draws. Do not move that test in here as an optimisation — the 0.3
 * Archive window needs the finished buildings to keep arriving.
 *
 * Known ceiling, deliberately not fixed in 0.2: this opens every project
 * Sheet on a cold cache. Two test projects cost nothing. Around forty it
 * becomes a real wait on app open.
 */
function handleListProjects(fresh) {
  var cache = CacheService.getScriptCache();
  if (!fresh) {
    var hit = cache.get('list-projects');
    if (hit) return JSON.parse(hit);
  }

  var folder   = getProjectsFolder();
  var files    = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  var projects = [];

  while (files.hasNext()) {
    var file = files.next();
    try {
      var ss     = SpreadsheetApp.openById(file.getId());
      var config = readConfig(ss);
      if (!config) continue;   // not a PFC Control Sheet, skip it

      // A version 1 Sheet has a different column layout, so reading it
      // with this code gives wrong numbers rather than an error. Leave it
      // out of the list instead. There is no upgrade path: trash it.
      if (configVersionError(config)) continue;

      var units    = allUnits(config);
      var layout   = computeLayout(config);
      var statuses = readOverallColumn(ss, layout, units.length);
      var flags    = countOpenFlags(ss);

      projects.push({
        id:         file.getId(),
        name:       config.name,
        mode:       config.mode,
        url:        file.getUrl(),
        unitCount:  units.length,
        groupCount: config.groups.length,

        // Four numbers, no verdict. unitsDone counts units the Sheet's own
        // rollup column already calls Complete, so this is a free read of a
        // column that is open anyway. Counting items instead would mean
        // reading the whole Tracker grid for every building on the list.
        unitsDone:    statuses.filter(function (key) { return key === 'complete'; }).length,

        // The fifth number, added in step 2. The rollup rule needs to know
        // "every unit Not Started" apart from "some unit In Progress", and
        // four numbers cannot tell those two apart: both read unitsDone 0.
        // It costs one filter over an array that is already in memory, and
        // it is still a number, not a verdict. The phone applies the rule.
        unitsNotStarted: statuses.filter(function (key) { return key === 'not_started'; }).length,

        unitsTotal:   units.length,
        deficiencies: flags.deficiencies,
        waiting:      flags.waiting
      });
    } catch (err) {
      // One bad file must not break the whole list.
      // Skip it and keep going.
    }
  }

  projects.sort(function (a, b) { return a.name.localeCompare(b.name); });

  var result = { success: true, projects: projects };
  cache.put('list-projects', JSON.stringify(result), LIST_CACHE_SECONDS);
  return result;
}


/**
 * Returns ONE WHOLE BUILDING IN ONE ANSWER.
 *
 * This replaces get-structure plus one get-unit per unit. The phone stores
 * what comes back and draws the Building screen and every Unit screen out
 * of that one copy, so a unit opens with no signal and with no wait.
 *
 * It is cheap because the Unit Tracker tab is one grid. Reading all 48 rows
 * is the same single getValues call that handleGetUnit makes for one row.
 *
 * Three things go out that nothing in 0.2 draws yet, and none of them may
 * be trimmed later:
 *
 *   - every item's types, trim and hint, so Logger draws its dropdowns from
 *     the local copy with no second call;
 *   - the building's reason list, for the same reason;
 *   - THE WHOLE DEFICIENCIES TAB, EVERY STATE — Open, Fixed and Cancelled.
 *     Fixed records feed the suggestion chips, and the 0.3 Archive window is
 *     a filter over records. A state filter added here to shrink the payload
 *     takes away both. Size is not the constraint: about 300 records at
 *     ~120 bytes is ~36 KB against a building copy of ~100 KB.
 *
 * No rollup goes out. The phone owns that rule. See buildRollupFormula for
 * why exactly two copies of it exist and why a third must not.
 */
function handleGetProject(id) {
  if (!id) return { success: false, error: 'No project id was given.' };

  var ss     = SpreadsheetApp.openById(id);
  var config = readConfig(ss);
  if (!config) return { success: false, error: 'This Sheet is not a PFC Control project.' };

  var stale = configVersionError(config);
  if (stale) return { success: false, error: stale };

  var units  = allUnits(config);
  var layout = computeLayout(config);

  // One read of the whole grid. status[unitKey][itemKey] holds a short key.
  var status      = {};
  var lastUpdated = {};

  if (units.length > 0) {
    var sheet  = ss.getSheetByName(TRACKER_SHEET_NAME);
    var values = sheet.getRange(FIRST_DATA_ROW, 1, units.length, layout.lastCol).getValues();

    units.forEach(function (unit, index) {
      var row  = values[index];
      var byItem = {};
      layout.order.forEach(function (itemKey) {
        byItem[itemKey] = statusKey(row[layout.statusCol[itemKey] - 1]);
      });
      status[unit.key]      = byItem;
      lastUpdated[unit.key] = formatCell(row[layout.lastUpdatedCol - 1]);
    });
  }

  // The groups carry no status. A unit's status is worked out on the phone
  // from the items above, so there is only ever one answer on screen.
  var groups = config.groups.map(function (group) {
    return {
      key:   group.key,
      label: group.label,
      units: group.units.map(function (unit) {
        return { key: unit.key, label: unit.label, chip: unit.chip };
      })
    };
  });

  var phases = activePhases(config).map(function (phase) {
    return {
      key:   phase.key,
      label: phase.label,
      items: phase.items.map(function (item) {
        return {
          key:   item.key,
          label: item.label,
          types: item.types || [],
          trim:  item.trim  || [],
          hint:  item.hint  || ''
        };
      })
    };
  });

  return {
    success:     true,
    id:          id,
    name:        config.name,
    mode:        config.mode,
    url:         ss.getUrl(),
    version:     config.version,
    unitCount:   units.length,
    reasons:     config.reasons || FALLBACK_REASONS.slice(),
    groups:      groups,
    phases:      phases,
    status:      status,
    lastUpdated: lastUpdated,
    records:     readRecords(ss)
  };
}


/**
 * Returns one project's full structure, plus the rolled-up status of
 * every unit. The Building screen draws itself from this.
 *
 * The phone stopped calling this in 0.2 — get-project above answers with
 * the whole building instead. Admin still calls it, for the item list its
 * edit cards offer. Do not delete it.
 */
function handleGetStructure(id) {
  if (!id) return { success: false, error: 'No project id was given.' };

  var ss     = SpreadsheetApp.openById(id);
  var config = readConfig(ss);
  if (!config) return { success: false, error: 'This Sheet is not a PFC Control project.' };

  var stale = configVersionError(config);
  if (stale) return { success: false, error: stale };

  var units    = allUnits(config);
  var layout   = computeLayout(config);
  var statuses = readOverallColumn(ss, layout, units.length);

  // Attach each unit's status to its group.
  var groups = config.groups.map(function (group) {
    return {
      key:   group.key,
      label: group.label,
      units: group.units.map(function (unit) {
        var index = indexOfUnit(config, unit.key);
        return {
          key:    unit.key,
          label:  unit.label,
          chip:   unit.chip,
          status: statuses[index] || 'not_started'
        };
      })
    };
  });

  // The item list goes out too. The Admin edit screen needs it to offer
  // the right items to remove, and the Unit screen uses it to group items.
  var phases = config.phases.map(function (phase) {
    return {
      key:   phase.key,
      label: phase.label,
      items: phase.items.map(function (item) {
        return { key: item.key, label: item.label };
      })
    };
  });

  return {
    success:   true,
    id:        id,
    name:      config.name,
    mode:      config.mode,
    url:       ss.getUrl(),
    unitCount: units.length,
    groups:    groups,
    phases:    phases
  };
}


/**
 * Returns one unit's items, grouped by phase, with a status each.
 *
 * Nothing calls this after 0.2 step 2. get-project sends every unit in one
 * answer, so the Unit screen reads the local copy instead. It is left in
 * place because it costs nothing and it is the only way to read one unit
 * without pulling a whole building.
 */
function handleGetUnit(id, unitKey) {
  if (!id)      return { success: false, error: 'No project id was given.' };
  if (!unitKey) return { success: false, error: 'No unit was given.' };

  var ss     = SpreadsheetApp.openById(id);
  var config = readConfig(ss);
  if (!config) return { success: false, error: 'This Sheet is not a PFC Control project.' };

  var stale = configVersionError(config);
  if (stale) return { success: false, error: stale };

  var index = indexOfUnit(config, unitKey);
  if (index < 0) return { success: false, error: 'Unit not found: ' + unitKey };

  var unit   = allUnits(config)[index];
  var group  = groupOfUnit(config, unitKey);
  var layout = computeLayout(config);
  var row    = FIRST_DATA_ROW + index;

  var sheet  = ss.getSheetByName(TRACKER_SHEET_NAME);
  var values = sheet.getRange(row, 1, 1, layout.lastCol).getValues()[0];

  var phases = activePhases(config).map(function (phase) {
    var items = phase.items.map(function (item) {
      return {
        key:    item.key,
        label:  item.label,
        status: statusKey(values[layout.statusCol[item.key] - 1])
      };
    });
    return { key: phase.key, label: phase.label, items: items };
  });

  return {
    success:     true,
    id:          id,
    projectName: config.name,
    unit:        { key: unit.key, label: unit.label, chip: unit.chip },
    groupLabel:  group ? group.label : '',
    phases:      phases,

    // The unit rollup is read out of the Sheet's own Overall Status cell,
    // which the rollup formula already worked out. The server does not
    // compute a rollup of its own. Two copies of that rule exist on
    // purpose — the Sheet's and the phone's — and a third would drift.
    overall:     statusKey(values[layout.overallCol - 1]),
    lastUpdated: formatCell(values[layout.lastUpdatedCol - 1])
  };
}


// ── WRITE ACTIONS ─────────────────────────────────────────────────────

/**
 * SAVE THE WHOLE OUTBOX IN ONE CALL.
 *
 * The phone holds unsent edits on a keyed shelf and sends every one of
 * them here together. Two kinds of job arrive in the same list:
 *
 *   { key, kind:'item',   projectId, unitKey, itemKey, progress }
 *   { key, kind:'record', projectId, record:{ the thirteen columns } }
 *
 * THE ANSWER IS ONE RESULT PER JOB, NEVER ONE VERDICT FOR THE BATCH.
 *
 *   { success:true, results:[ { key, ok:true },
 *                             { key, ok:false, retry:true, error:'...' } ] }
 *
 * A bad job must not poison the good ones beside it. The phone deletes a
 * job from its shelf when, and only when, that job answers ok:true.
 *
 * EVERY FAILED RESULT CARRIES retry:true OR retry:false. Without it a busy
 * server and a permanently broken job look identical on the phone, so it
 * either gives up on work that would have landed, or retries forever
 * against a unit Admin deleted. retry:false means do not try this again —
 * hold it and show it to a person.
 *
 * Every job carries the FINAL VALUE, not a change to apply, so writing it
 * twice is the same as writing it once. That is what makes a retry after a
 * timeout safe: the write may already have landed, and doing it again
 * costs nothing.
 *
 * THE LOCK IS TAKEN ONCE for the whole batch, not once per job.
 */
function handleSaveBatch(jobs) {
  var list = jobs || [];
  if (!list.length) return { success: true, results: [] };

  // Oldest first is free: the phone sends them in order. The rest of the
  // shelf goes on the next drain.
  var batch   = list.slice(0, MAX_JOBS_PER_BATCH);
  var results = [];

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    // Another write is running. It will end, so every job retries.
    return {
      success: true,
      results: batch.map(function (job) {
        return jobFailed(job, true, 'The server is busy. Try again.');
      })
    };
  }

  try {
    // Jobs may span buildings. Group them so each Sheet opens once.
    var order  = [];
    var byId   = {};
    batch.forEach(function (job) {
      var id = job && job.projectId;
      if (!id) { results.push(jobFailed(job, false, 'This edit names no project.')); return; }
      if (!byId[id]) { byId[id] = []; order.push(id); }
      byId[id].push(job);
    });

    order.forEach(function (id) {
      writeProjectJobs(id, byId[id], results);
    });

    // ONE LINE, EASY TO LOSE, AND THE WHOLE BUILDINGS SCREEN DEPENDS ON
    // IT. Without it the list answer stays cached for up to a minute and
    // Tracking shows a pill that disagrees with the unit you just set.
    CacheService.getScriptCache().remove('list-projects');

  } catch (err) {
    // Nothing above should throw — writeProjectJobs catches its own. If
    // something does, every job that has no result yet retries.
    batch.forEach(function (job) {
      if (!resultFor(results, job)) results.push(jobFailed(job, true, err.toString()));
    });
  } finally {
    lock.releaseLock();
  }

  return { success: true, results: results };
}


/** Writes every job belonging to one building. Appends one result each. */
function writeProjectJobs(id, jobs, results) {
  var ss, config;

  try {
    ss     = SpreadsheetApp.openById(id);
    config = readConfig(ss);
  } catch (err) {
    // The Sheet would not open. That can be a permission or a network
    // fault at Google's end, so it is worth trying again.
    jobs.forEach(function (job) { results.push(jobFailed(job, true, err.toString())); });
    return;
  }

  // Both of these are permanent for this Sheet. Retrying cannot fix them.
  if (!config) {
    jobs.forEach(function (job) {
      results.push(jobFailed(job, false, 'This Sheet is not a PFC Control project.'));
    });
    return;
  }

  var stale = configVersionError(config);
  if (stale) {
    jobs.forEach(function (job) { results.push(jobFailed(job, false, stale)); });
    return;
  }

  var layout  = computeLayout(config);
  var tracker = ss.getSheetByName(TRACKER_SHEET_NAME);
  var touched = {};    // unit row -> true, for the Last Updated stamp

  jobs.forEach(function (job) {
    try {
      if (job.kind === 'record') {
        results.push(writeRecordJob(ss, job));
      } else if (job.kind === 'item') {
        results.push(writeItemJob(tracker, config, layout, job, touched));
      } else {
        results.push(jobFailed(job, false, 'This edit has an unknown kind: ' + job.kind));
      }
    } catch (err) {
      results.push(jobFailed(job, true, err.toString()));
    }
  });

  // One date stamp per unit that changed, not one per item.
  var today = new Date();
  Object.keys(touched).forEach(function (row) {
    tracker.getRange(parseInt(row, 10), layout.lastUpdatedCol).setValue(today);
  });
}


/**
 * Writes one item's Progress into its cell.
 *
 * ONE CELL AT A TIME, ON PURPOSE. Reading a whole row and writing it back
 * would be fewer calls, but it would also write back every OTHER item in
 * that row, and anything a person changed in the Sheet between the read
 * and the write would be silently undone. A batch is a handful of taps in
 * practice, and the cap of 100 keeps the worst case inside the six minute
 * budget.
 *
 * It never touches the rollup columns. Those are formulas and they answer
 * by themselves.
 */
function writeItemJob(tracker, config, layout, job, touched) {
  var label = STATUS_LABELS[job.progress];
  if (!label) {
    return jobFailed(job, false, 'Not a Progress value: ' + job.progress);
  }

  var index = indexOfUnit(config, job.unitKey);
  if (index < 0) {
    // Admin removed the unit. Retrying writes it back nowhere.
    return jobFailed(job, false, 'Unit ' + job.unitKey + ' is not in this building any more.');
  }

  var col = layout.statusCol[job.itemKey];
  if (!col) {
    return jobFailed(job, false, 'Item ' + job.itemKey + ' is not in this building any more.');
  }

  var row = FIRST_DATA_ROW + index;
  tracker.getRange(row, col).setValue(label);
  touched[row] = true;

  return { key: job.key, ok: true };
}


/**
 * Writes one deficiency record.
 *
 * THE RECORD ID IS MADE ON THE PHONE, before anything is sent. Id found,
 * overwrite that row. Id new, append to the bottom. That is what makes a
 * retry safe after a timeout: the write may already have landed, and the
 * second attempt lands on the same row instead of making a twin.
 *
 * A record is never deleted and never moved. Fixed and Cancelled both stay
 * in place with a closed date.
 *
 * Nothing calls this yet. Logger arrives in 0.2 step 4 and puts record
 * jobs on the same shelf, which this call already drains.
 */
function writeRecordJob(ss, job) {
  var record = job.record || {};
  var id     = String(record.record_id || '').trim();

  if (!id) return jobFailed(job, false, 'This record has no id.');

  if (RECORD_STATES.indexOf(record.state) < 0) {
    return jobFailed(job, false, 'Not a record state: ' + record.state);
  }

  var sheet = ss.getSheetByName(DEFICIENCIES_SHEET_NAME);
  if (!sheet) {
    // A version 2 project always has this tab. If it is missing the Sheet
    // was hand-edited, and no retry repairs that.
    return jobFailed(job, false, 'This project has no Deficiencies tab.');
  }

  var row = rowOfRecord(sheet, id);
  if (row < 0) row = Math.max(sheet.getLastRow(), 1) + 1;

  var cells = DEFICIENCY_COLUMNS.map(function (name) {
    var value = record[name];
    if (name === 'quantity') return parseInt(value, 10) || 1;
    // created and closed go in as real dates so the tab sorts by them.
    if ((name === 'created' || name === 'closed') && value) return new Date(value);
    return (value === undefined || value === null) ? '' : value;
  });

  // The tab is built 1000 rows deep and grows past that only here.
  if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);

  sheet.getRange(row, 1, 1, DEFICIENCY_COLUMNS.length).setValues([cells]);
  return { key: job.key, ok: true };
}


/** The row one record id sits on, or -1. Reads column A only. */
function rowOfRecord(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) return i + 2;
  }
  return -1;
}


/** One failed result. retry says whether trying again could ever work. */
function jobFailed(job, retry, message) {
  return {
    key:   job ? job.key : '',
    ok:    false,
    retry: !!retry,
    error: message
  };
}


/** Whether this job already has a result in the list. */
function resultFor(results, job) {
  for (var i = 0; i < results.length; i++) {
    if (results[i].key === job.key) return results[i];
  }
  return null;
}


/**
 * Creates a project Sheet.
 *
 * Note on the master template: this script builds the Sheet in code and
 * does not copy the .xlsx template. The template is fixed at 36 units and
 * 17 items. Every project has a different unit count and item list, so a
 * copy would need all of its columns and formulas rewritten anyway. The
 * template stays the visual specification. Every colour, merge, width and
 * formula below comes from it.
 *
 * Expects:
 *   { name, mode:'floors'|'flat', floorCount, unitsPerFloor, unitCount,
 *     reasons:[ 'Wrong Size', ... ],
 *     phases:[ { key, label, items:[ { label, types, trim, hint } ] } ] }
 *
 * reasons, types, trim and hint all come from the Admin create form, which
 * reads them from control/shared/common.js. They are seeded into the
 * config here and read back from the config afterwards. Nothing downstream
 * of this call reads a list out of code.
 */
function handleCreateProject(data) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { success: false, error: 'The server is busy. Try again.' };
  }

  try {
    var config = buildConfig(data);
    if (config.error) return { success: false, error: config.error };

    var ss = SpreadsheetApp.create(config.name);

    // A new Spreadsheet arrives with one sheet named "Sheet1". Reuse it.
    var first = ss.getSheets()[0];
    first.setName(DASHBOARD_SHEET_NAME);
    ss.insertSheet(TRACKER_SHEET_NAME);

    // The Deficiencies tab is built FIRST, and the order is not cosmetic.
    // Every rollup formula on the Tracker tab counts open records out of
    // this tab. A Sheets formula that names a tab which does not exist yet
    // is stored as a permanent #REF!, and creating the tab afterwards does
    // not repair it.
    buildDeficienciesTab(ss);

    rebuildTracker(ss, config, {});
    rebuildDashboard(ss, config);
    writeConfig(ss, config);

    ss.setActiveSheet(ss.getSheetByName(TRACKER_SHEET_NAME));

    // Move the new file into PFC/Control/Project Sheets/.
    var file = DriveApp.getFileById(ss.getId());
    file.moveTo(getProjectsFolder());

    CacheService.getScriptCache().remove('list-projects');

    return {
      success:   true,
      id:        ss.getId(),
      url:       ss.getUrl(),
      name:      config.name,
      mode:      config.mode,
      unitCount: allUnits(config).length
    };

  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}


/**
 * Changes a project's structure. Never touches a status value.
 *
 * Every operation follows the same three steps:
 *   1. Read every status value that already exists.
 *   2. Change the config.
 *   3. Rebuild the Sheet from the new config and write the old values back.
 *
 * This is safer than moving columns one at a time. The Sheet always ends up
 * exactly consistent with the config, and no formula can point at the wrong
 * column.
 *
 * Expects: { id, op, ... }
 *   op 'add-item'    : { phaseKey, label }
 *   op 'remove-item' : { phaseKey, itemKey }
 *   op 'add-unit'    : { groupKey, label }
 *   op 'rename-unit' : { unitKey, label }
 */
function handleUpdateStructure(data) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { success: false, error: 'The server is busy. Try again.' };
  }

  try {
    if (!data.id) return { success: false, error: 'No project id was given.' };

    var ss     = SpreadsheetApp.openById(data.id);
    var config = readConfig(ss);
    if (!config) return { success: false, error: 'This Sheet is not a PFC Control project.' };

    var stale = configVersionError(config);
    if (stale) return { success: false, error: stale };

    // Step 1 — keep the values that already exist.
    var preserved = readAllValues(ss, config);

    // Step 2 — change the structure.
    var message = applyStructureOp(config, data);
    if (message) return { success: false, error: message };

    // Step 3 — rebuild.
    rebuildTracker(ss, config, preserved);
    rebuildDashboard(ss, config);
    writeConfig(ss, config);

    CacheService.getScriptCache().remove('list-projects');

    return { success: true, id: data.id, op: data.op, name: config.name };

  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}


/** Changes the config in place. Returns an error message, or nothing on success. */
function applyStructureOp(config, data) {
  var i;

  if (data.op === 'add-item') {
    var phase = findByKey(config.phases, data.phaseKey);
    if (!phase) return 'Phase not found: ' + data.phaseKey;

    var label = String(data.label || '').trim();
    if (!label) return 'Enter an item name.';

    // A custom item defines no subtypes, trims no reasons and shows no
    // placeholder. It offers all eight reasons and no Subtype dropdown.
    // Admin fills these in later, through the Lists card.
    var taken = allItems(config).map(function (it) { return it.key; });
    phase.items.push({
      key:   uniqueKey(slug(label), taken),
      label: label,
      types: [],
      trim:  [],
      hint:  ''
    });
    return null;
  }

  if (data.op === 'remove-item') {
    var target = findByKey(config.phases, data.phaseKey);
    if (!target) return 'Phase not found: ' + data.phaseKey;

    if (allItems(config).length <= 1) return 'A project must keep at least one item.';

    for (i = 0; i < target.items.length; i++) {
      if (target.items[i].key === data.itemKey) {
        target.items.splice(i, 1);
        return null;
      }
    }
    return 'Item not found: ' + data.itemKey;
  }

  if (data.op === 'add-unit') {
    var group = findByKey(config.groups, data.groupKey);
    if (!group) return 'Group not found: ' + data.groupKey;

    var takenUnits = allUnits(config).map(function (u) { return u.key; });
    var name = String(data.label || '').trim();

    if (!name) {
      // No name given. Continue the group's own numbering.
      name = (config.mode === 'floors')
        ? String(floorNumber(group) * 100 + group.units.length + 1)
        : 'Unit ' + (takenUnits.length + 1);
    }

    group.units.push({
      key:   uniqueKey(slug(name), takenUnits),
      label: name,
      chip:  chipFor(name)
    });
    return null;
  }

  if (data.op === 'rename-unit') {
    var newLabel = String(data.label || '').trim();
    if (!newLabel) return 'Enter a unit name.';

    for (i = 0; i < config.groups.length; i++) {
      var units = config.groups[i].units;
      for (var j = 0; j < units.length; j++) {
        if (units[j].key === data.unitKey) {
          units[j].label = newLabel;
          units[j].chip  = chipFor(newLabel);
          return null;   // the key never changes, so the values stay attached
        }
      }
    }
    return 'Unit not found: ' + data.unitKey;
  }

  return 'Unknown operation: ' + data.op;
}


// ── CONFIG ────────────────────────────────────────────────────────────

/**
 * Turns the Admin form values into the config object.
 *
 * The config is the single source of truth for the Sheet's shape. Column
 * positions are never stored. They are worked out from the item order every
 * time, by computeLayout(). That way the two can never drift apart.
 */
function buildConfig(data) {
  var name = String(data.name || '').trim();
  if (!name) return { error: 'Enter a project name.' };

  var mode = (data.mode === 'flat') ? 'flat' : 'floors';

  // -- The reason list -------------------------------------------------
  // One list per building, not one per phase and not one per item. An item
  // narrows it with its own trim. Add-only afterwards: Admin can add a
  // reason, and there is never a Delete button, so no row in the
  // Deficiencies tab can ever point at a value that stopped existing.
  var reasons = stringList(data.reasons);
  if (reasons.length === 0) reasons = FALLBACK_REASONS.slice();

  // -- Items -----------------------------------------------------------
  var takenItemKeys = [];
  var phases = [];

  (data.phases || []).forEach(function (phase) {
    var items = (phase.items || []).map(function (item) {
      var label = String(item.label || '').trim();
      if (!label) return null;
      return {
        key:   uniqueKey(slug(label), takenItemKeys),
        label: label,

        // types — the Subtype dropdown. Empty means no dropdown at all.
        // trim  — the reasons this item does NOT offer. Empty offers all.
        // hint  — grey placeholder inside the empty needed box.
        types: stringList(item.types),
        trim:  stringList(item.trim),
        hint:  String(item.hint || '')
      };
    }).filter(function (item) { return item !== null; });

    // Every phase is kept, even an empty one. An empty phase takes no
    // columns, but Admin can still add an item to it later.
    phases.push({
      key:   String(phase.key || slug(phase.label)),
      label: String(phase.label || 'Phase'),
      items: items
    });
  });

  if (takenItemKeys.length === 0) return { error: 'Select at least one item to track.' };

  // -- Units -----------------------------------------------------------
  var takenUnitKeys = [];
  var groups = [];

  if (mode === 'floors') {
    var floorCount    = clampCount(data.floorCount, 1);
    var unitsPerFloor = clampCount(data.unitsPerFloor, 1);

    for (var f = 1; f <= floorCount; f++) {
      var units = [];
      for (var u = 1; u <= unitsPerFloor; u++) {
        // Existing site convention: floor 1 unit 3 is unit 103.
        var number = String(f * 100 + u);
        units.push({ key: uniqueKey(number, takenUnitKeys), label: number, chip: number });
      }
      groups.push({ key: 'floor_' + f, label: 'Floor ' + f, units: units });
    }

  } else {
    // Flat list. Exact addresses are often unknown when the job starts, so
    // units get placeholder names. Admin can rename them one at a time.
    var unitCount = clampCount(data.unitCount, 1);
    var flatUnits = [];
    for (var n = 1; n <= unitCount; n++) {
      var label = 'Unit ' + n;
      flatUnits.push({ key: uniqueKey('unit_' + n, takenUnitKeys), label: label, chip: String(n) });
    }
    groups.push({ key: 'units', label: 'Units', units: flatUnits });
  }

  return {
    version:   CONFIG_VERSION,
    name:      name,
    mode:      mode,
    createdAt: new Date().toISOString(),
    reasons:   reasons,
    groups:    groups,
    phases:    phases
  };
}


/**
 * Turns whatever the payload sent into a clean list of non-empty strings.
 * A missing key, a string, or a list with blanks in it all end up as a
 * list this script can store without checking it again.
 */
function stringList(value) {
  if (!value) return [];
  var list = Array.isArray(value) ? value : [value];
  return list.map(function (entry) { return String(entry || '').trim(); })
             .filter(function (entry) { return entry !== ''; });
}


/**
 * Refuses a Sheet this script cannot read correctly.
 *
 * Version 1 (0.1) gave every item two columns and held five status values.
 * Version 2 gives it one and holds three. Reading a version 1 Sheet with
 * this code returns wrong values rather than an error, which is worse than
 * refusing it. There is no upgrade path by design: make the building fresh.
 *
 * Returns an error message, or null when the Sheet is fine.
 */
function configVersionError(config) {
  var version = parseInt(config.version, 10) || 1;
  if (version === CONFIG_VERSION) return null;

  if (version < CONFIG_VERSION) {
    return 'This project Sheet was made by an older version of PFC Control ' +
           '(version ' + version + '). Make the building again.';
  }
  return 'This project Sheet was made by a newer version of PFC Control ' +
         '(version ' + version + '). Update the app.';
}


/** Writes the config into the hidden _Config tab, as one JSON string in A1. */
function writeConfig(ss, config) {
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG_SHEET_NAME);

  sheet.getRange('A1').setValue(JSON.stringify(config));
  sheet.getRange('A3').setValue(
    'This tab holds the project structure. Do not edit it by hand. ' +
    'Use the Admin screen in PFC Control.'
  );
  sheet.hideSheet();
}


/** Reads the config back. Returns null if this Sheet is not a project Sheet. */
function readConfig(ss) {
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) return null;
  try {
    var raw = sheet.getRange('A1').getValue();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}


// ── LAYOUT ────────────────────────────────────────────────────────────

/**
 * Works out where every column sits, from the config alone.
 *
 * Column 1  = Floor
 * Column 2  = Unit #
 * Then ONE Status column for each item, in order.
 * Then one rollup column for each phase.
 * Then Last Updated, then Overall Status.
 *
 * The width is  2 + items + phases + 2.
 *
 * 0.1 gave every item two columns, Status and Details. The Details column
 * is gone in 0.2 — the app never read it, so a note typed on a computer
 * was invisible on every phone. Removing it halves the per-item width and
 * moves everything to its right, which is why every formula address in
 * this file is worked out and never written down.
 *
 * With the 14 default items and 3 phases the layout is:
 *   status columns C to P, rollups Q to S, T Last Updated,
 *   U Overall Status. 21 columns. 0.1 used 41 for 17 items.
 */
function computeLayout(config) {
  var phases = activePhases(config);
  var layout = {
    statusCol:  {},
    rollupCol:  {},
    phases:     phases,
    order:      []      // item keys, in column order
  };

  var col = 3;
  phases.forEach(function (phase) {
    phase.items.forEach(function (item) {
      layout.statusCol[item.key] = col;
      layout.order.push(item.key);
      col += 1;
    });
  });

  phases.forEach(function (phase) {
    layout.rollupCol[phase.key] = col;
    col += 1;
  });

  layout.lastUpdatedCol = col;
  layout.overallCol     = col + 1;
  layout.lastCol        = col + 1;
  layout.itemCount      = layout.order.length;
  return layout;
}


// ── SHEET BUILD ───────────────────────────────────────────────────────

/**
 * Draws the whole Unit Tracker tab from the config.
 *
 * "preserved" is optional. It maps 'unitKey|itemKey' to { status }, and
 * 'unitKey|__updated' to the Last Updated value. Anything missing starts
 * at Not Started.
 *
 * This function must never touch the Deficiencies tab. It cannot today:
 * it takes one named sheet object and every call below is a method on that
 * object, and there is no spreadsheet-level clear anywhere in this file.
 * That stays true only while it is written this way. A future
 * ss.getSheets().forEach(...) would wipe every record silently.
 */
function rebuildTracker(ss, config, preserved) {
  var sheet   = ss.getSheetByName(TRACKER_SHEET_NAME);
  var layout  = computeLayout(config);
  var phases  = layout.phases;          // phases that hold at least one item
  var units   = allUnits(config);
  var lastCol = layout.lastCol;

  // Start from a clean sheet. clear() leaves merges, filters and rules
  // behind, so remove those first. This must happen before the resize,
  // because a merge or a filter that covers a deleted column throws.
  var before = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
  before.breakApart();
  before.clearDataValidations();
  sheet.clearConditionalFormatRules();
  var filter = sheet.getFilter();
  if (filter) filter.remove();
  before.clear();

  resizeSheet(sheet, Math.max(FIRST_DATA_ROW + units.length - 1, FIRST_DATA_ROW), lastCol);
  sheet.setHiddenGridlines(true);

  // -- Row heights, converted from the template's points to pixels -----
  sheet.setRowHeight(1, 40);
  sheet.setRowHeight(2, 24);
  sheet.setRowHeight(3, 8);    // thin spacer
  sheet.setRowHeight(4, 27);
  sheet.setRowHeight(5, 37);
  sheet.setRowHeight(6, 19);

  // -- Column widths ---------------------------------------------------
  sheet.setColumnWidth(1, 68);    // Floor
  sheet.setColumnWidth(2, 62);    // Unit #
  layout.order.forEach(function (itemKey) {
    sheet.setColumnWidth(layout.statusCol[itemKey], 89);
  });
  phases.forEach(function (phase) {
    sheet.setColumnWidth(layout.rollupCol[phase.key], 89);
  });
  sheet.setColumnWidth(layout.lastUpdatedCol, 138);
  sheet.setColumnWidth(layout.overallCol, 161);

  // -- Row 1, title ----------------------------------------------------
  sheet.getRange(1, 1, 1, 2).merge();
  sheet.getRange(1, 3, 1, lastCol - 2).merge()
       .setValue('PREMIER FINISH & CONSTRUCTION  ·  MASTER TRACKER');
  sheet.getRange(1, 1, 1, lastCol)
       .setBackground(C_TITLE_BG)
       .setFontFamily('Arial').setFontSize(14).setFontWeight('bold')
       .setFontColor(C_TITLE_FG)
       .setVerticalAlignment('middle');

  // -- Row 2, project name ---------------------------------------------
  sheet.getRange(2, 1, 1, 2).merge();
  sheet.getRange(2, 3, 1, lastCol - 2).merge()
       .setValue(config.name + '  ·  ' + units.length + ' Units');
  sheet.getRange(2, 1, 1, lastCol)
       .setBackground(C_SUBTITLE_BG)
       .setFontFamily('Arial').setFontSize(10)
       .setFontColor(C_SUBTITLE_FG)
       .setVerticalAlignment('middle');

  // -- Row 4 and 5, phase bands and item names -------------------------
  sheet.getRange(4, 1, 2, 2).merge().setValue('LOCATION');

  phases.forEach(function (phase) {
    var firstItem = phase.items[0];
    var lastItem  = phase.items[phase.items.length - 1];
    var from      = layout.statusCol[firstItem.key];
    var to        = layout.statusCol[lastItem.key];

    sheet.getRange(4, from, 1, to - from + 1).merge()
         .setValue(bandLabel(phase.label));

    // One column per item now, so the item name needs no merge. Row 5
    // wraps, so a long name such as BATHROOM ACCESSORIES takes two lines.
    phase.items.forEach(function (item) {
      sheet.getRange(5, layout.statusCol[item.key])
           .setValue(item.label.toUpperCase());
    });
  });

  // Rollup band, then the progress band.
  var firstRollup = layout.rollupCol[phases[0].key];
  sheet.getRange(4, firstRollup, 1, phases.length).merge().setValue('PHASE ROLLUP');
  sheet.getRange(4, layout.lastUpdatedCol, 1, 2).merge().setValue('PROGRESS');

  phases.forEach(function (phase, index) {
    sheet.getRange(5, layout.rollupCol[phase.key]).setValue(shortPhaseLabel(phase.label, index));
  });
  sheet.getRange(5, layout.lastUpdatedCol).setValue('DATE');
  sheet.getRange(5, layout.overallCol).setValue('COMPLETION');

  sheet.getRange(4, 1, 1, lastCol)
       .setBackground(C_BAND_BG)
       .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
       .setFontColor(C_TITLE_FG)
       .setHorizontalAlignment('center').setVerticalAlignment('middle');

  sheet.getRange(5, 1, 1, lastCol)
       .setBackground(C_ITEM_BG)
       .setFontFamily('Arial').setFontSize(8).setFontWeight('bold')
       .setFontColor(C_TITLE_FG)
       .setHorizontalAlignment('center').setVerticalAlignment('middle')
       .setWrap(true);

  // The LOCATION block spans rows 4 and 5, so give it the band colour back.
  sheet.getRange(4, 1, 2, 2)
       .setBackground(C_BAND_BG)
       .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
       .setFontColor(C_TITLE_FG)
       .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // -- Row 6, sub-headers ----------------------------------------------
  var head = ['Floor', 'Unit #'];
  layout.order.forEach(function () { head.push('Status'); });
  phases.forEach(function () { head.push('Status'); });
  head.push('LAST UPDATED', 'OVERALL STATUS');

  sheet.getRange(6, 1, 1, lastCol).setValues([head])
       .setBackground(C_SUBHEAD_BG)
       .setFontFamily('Arial').setFontSize(8).setFontWeight('bold')
       .setFontColor(C_TITLE_FG)
       .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // -- Unit rows -------------------------------------------------------
  var rows = units.map(function (unit, index) {
    var row       = FIRST_DATA_ROW + index;
    var group     = groupOfUnitByIndex(config, index);
    var cells     = new Array(lastCol);

    // Floor stays empty in flat mode. There are no floors to name.
    cells[0] = (config.mode === 'floors') ? floorNumber(group) : '';
    cells[1] = unit.label;

    layout.order.forEach(function (itemKey) {
      var saved = preserved[unit.key + '|' + itemKey];
      cells[layout.statusCol[itemKey] - 1] = saved ? saved.status : 'Not Started';
    });

    // A phase rollup counts its own item columns, and asks the
    // Deficiencies tab whether this unit holds an open flag in this phase.
    phases.forEach(function (phase) {
      var cols = phase.items.map(function (item) { return layout.statusCol[item.key]; });
      cells[layout.rollupCol[phase.key] - 1] =
        buildRollupFormula(cols, row, openFlagCount(unit.key, phase.key));
    });

    // The unit rollup counts the phase columns, and needs no flag test of
    // its own. A phase holding an open flag already reads In Progress, so
    // it cannot let the unit read Complete.
    var rollupCols = phases.map(function (phase) { return layout.rollupCol[phase.key]; });
    cells[layout.lastUpdatedCol - 1] = preserved[unit.key + '|__updated'] || '';
    cells[layout.overallCol - 1]     = buildRollupFormula(rollupCols, row, '');

    return cells;
  });

  if (rows.length > 0) {
    // setValues treats a string that starts with "=" as a formula.
    sheet.getRange(FIRST_DATA_ROW, 1, rows.length, lastCol).setValues(rows);
  }

  // -- Data cell formatting --------------------------------------------
  var dataRows = Math.max(rows.length, 1);

  sheet.getRange(FIRST_DATA_ROW, 1, dataRows, 2)
       .setFontFamily('Arial').setFontSize(9)
       .setHorizontalAlignment('center');

  var block = sheet.getRange(FIRST_DATA_ROW, 3, dataRows, lastCol - 2);
  block.setFontFamily('Arial').setFontSize(8)
       .setBorder(true, true, true, true, true, true, C_BORDER, SpreadsheetApp.BorderStyle.SOLID);

  // Status cells: grey base fill, centred. Conditional formatting paints
  // the other two colours on top.
  layout.order.forEach(function (itemKey) {
    sheet.getRange(FIRST_DATA_ROW, layout.statusCol[itemKey], dataRows, 1)
         .setBackground(STATUS_FILLS['Not Started'])
         .setHorizontalAlignment('center');
  });

  // Rollup and overall cells: bold, centred, no base fill.
  var rollupStart = layout.rollupCol[phases[0].key];
  sheet.getRange(FIRST_DATA_ROW, rollupStart, dataRows, phases.length + 2)
       .setFontWeight('bold')
       .setHorizontalAlignment('center');

  sheet.getRange(FIRST_DATA_ROW, layout.lastUpdatedCol, dataRows, 1)
       .setNumberFormat('yyyy-mm-dd')      // the template left this unset
       .setFontWeight('normal');

  // -- Dropdowns -------------------------------------------------------
  // allowInvalid stays true, the same as the template. A typed value that
  // is not in the list gets a warning, not a rejection.
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_VALUES, true)
    .setAllowInvalid(true)
    .build();

  layout.order.forEach(function (itemKey) {
    sheet.getRange(FIRST_DATA_ROW, layout.statusCol[itemKey], dataRows, 1)
         .setDataValidation(rule);
  });
  // The rollup columns hold formulas, so they get no dropdown. The template
  // put one on AM by mistake. That is not copied here.

  // -- Conditional formatting ------------------------------------------
  // One rule for each status, covering every status column and the whole
  // rollup block. Three rules in total, down from five.
  var cfRanges = layout.order.map(function (itemKey) {
    return sheet.getRange(FIRST_DATA_ROW, layout.statusCol[itemKey], dataRows, 1);
  });
  cfRanges.push(sheet.getRange(FIRST_DATA_ROW, rollupStart, dataRows, phases.length));
  cfRanges.push(sheet.getRange(FIRST_DATA_ROW, layout.overallCol, dataRows, 1));

  var cfRules = STATUS_VALUES.map(function (status) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(STATUS_FILLS[status])
      .setRanges(cfRanges)
      .build();
  });
  sheet.setConditionalFormatRules(cfRules);

  // -- Freeze and filter -----------------------------------------------
  sheet.setFrozenRows(6);
  sheet.setFrozenColumns(2);
  sheet.getRange(6, 1, dataRows + 1, lastCol).createFilter();
}


/**
 * Draws the Dashboard tab. Counts units, not items.
 *
 * 0.1 was six columns wide: one label and five statuses. It is now five:
 * one label, the three Progress values, and one more number for how many
 * units hold an open flag. The width follows STATUS_VALUES, so a change
 * to the status list never needs a number edited here again.
 */
function rebuildDashboard(ss, config) {
  var sheet   = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  var layout  = computeLayout(config);
  var phases  = layout.phases;
  var units   = allUnits(config);
  var lastRow = FIRST_DATA_ROW + units.length - 1;
  var phaseN  = phases.length;

  var flagCol = STATUS_VALUES.length + 2;   // the last column
  var lastCol = flagCol;

  // Row map. Two blocks, each with a spacer above it.
  var rowSummary  = 4;
  var rowHead1    = 5;
  var rowPhase1   = 6;
  var rowOverall  = rowPhase1 + phaseN + 1;   // one blank spacer row between
  var rowHead2    = rowOverall + 1;
  var rowCount    = rowOverall + 2;

  // Unmerge before the resize, the same as on the tracker tab.
  var before = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
  before.breakApart();
  sheet.clearConditionalFormatRules();
  before.clear();

  resizeSheet(sheet, rowCount, lastCol);
  sheet.setHiddenGridlines(true);

  sheet.setColumnWidth(1, 225);
  for (var c = 2; c <= lastCol; c++) sheet.setColumnWidth(c, 159);
  sheet.setRowHeight(1, 40);
  sheet.setRowHeight(2, 24);
  sheet.setRowHeight(rowCount, 25);

  // -- Titles ----------------------------------------------------------
  sheet.getRange(1, 1, 1, lastCol).merge()
       .setValue('PREMIER FINISH & CONSTRUCTION  ·  PROJECT MASTER TRACKER')
       .setBackground(C_TITLE_BG)
       .setFontFamily('Arial').setFontSize(14).setFontWeight('bold')
       .setFontColor(C_TITLE_FG).setVerticalAlignment('middle');

  sheet.getRange(2, 1, 1, lastCol).merge()
       .setValue(config.name)
       .setBackground(C_SUBTITLE_BG)
       .setFontFamily('Arial').setFontSize(10)
       .setFontColor(C_SUBTITLE_FG).setVerticalAlignment('middle');

  // -- Block 1, progress by phase --------------------------------------
  sheet.getRange(rowSummary, 1, 1, lastCol).merge()
       .setValue('  PROGRESS SUMMARY  (units, out of ' + units.length + ')');

  sheet.getRange(rowOverall, 1, 1, lastCol).merge()
       .setValue('  UNIT OVERALL STATUS  (whole-unit rollup)');

  [rowSummary, rowOverall].forEach(function (row) {
    sheet.getRange(row, 1, 1, lastCol)
         .setBackground(C_BAND_BG)
         .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
         .setFontColor(C_TITLE_FG)
         .setBorder(true, true, true, true, null, null, C_BORDER, SpreadsheetApp.BorderStyle.SOLID);
  });

  // Header rows carry the status colours as a fixed fill.
  [rowHead1, rowHead2].forEach(function (row, index) {
    sheet.getRange(row, 1).setValue(index === 0 ? 'Phase' : 'Status');
    STATUS_VALUES.forEach(function (status, i) {
      sheet.getRange(row, 2 + i).setValue(status).setBackground(STATUS_FILLS[status]);
    });
    sheet.getRange(row, flagCol).setValue('Open Flags').setBackground(C_FLAG_FILL);
    sheet.getRange(row, 1).setBackground(STATUS_FILLS['Not Started']);
    sheet.getRange(row, 1, 1, lastCol)
         .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
         .setFontColor(C_DARK_FG)
         .setHorizontalAlignment('center')
         .setBorder(true, true, true, true, true, true, C_BORDER, SpreadsheetApp.BorderStyle.SOLID);
  });

  // -- Count rows ------------------------------------------------------
  // The status counts read the Tracker tab's own rollup columns. The flag
  // count reads the Deficiencies tab, and counts UNITS holding a record,
  // not records — one unit with four bad doors is one flagged unit.
  var tracker = "'" + TRACKER_SHEET_NAME + "'!";

  phases.forEach(function (phase, index) {
    var row    = rowPhase1 + index;
    var letter = colLetter(layout.rollupCol[phase.key]);

    sheet.getRange(row, 1).setValue(phase.label)
         .setBackground(C_LABEL_BG)
         .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
         .setFontColor(C_DARK_FG);

    STATUS_VALUES.forEach(function (status, i) {
      sheet.getRange(row, 2 + i)
           .setFormula('=COUNTIF(' + tracker + letter + FIRST_DATA_ROW + ':' + letter + lastRow + ',"' + status + '")')
           .setBackground(STATUS_FILLS[status]);
    });

    sheet.getRange(row, flagCol)
         .setFormula(unitsWithOpenFlagFormula(phase.key))
         .setBackground(C_FLAG_FILL);

    sheet.getRange(row, 1, 1, lastCol)
         .setHorizontalAlignment('center')
         .setBorder(true, true, true, true, true, true, C_BORDER, SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange(row, 1).setHorizontalAlignment('left');
    sheet.getRange(row, 2, 1, lastCol - 1)
         .setFontFamily('Arial').setFontSize(12).setFontWeight('bold').setFontColor(C_DARK_FG);
    sheet.setRowHeight(row, 21);
  });

  var overallLetter = colLetter(layout.overallCol);
  sheet.getRange(rowCount, 1).setValue('Count')
       .setBackground(C_LABEL_BG)
       .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
       .setFontColor(C_DARK_FG);

  STATUS_VALUES.forEach(function (status, i) {
    sheet.getRange(rowCount, 2 + i)
         .setFormula('=COUNTIF(' + tracker + overallLetter + FIRST_DATA_ROW + ':' + overallLetter + lastRow + ',"' + status + '")')
         .setBackground(STATUS_FILLS[status])
         .setFontFamily('Arial').setFontSize(14).setFontWeight('bold').setFontColor(C_DARK_FG);
  });

  sheet.getRange(rowCount, flagCol)
       .setFormula(unitsWithOpenFlagFormula(null))
       .setBackground(C_FLAG_FILL)
       .setFontFamily('Arial').setFontSize(14).setFontWeight('bold').setFontColor(C_DARK_FG);

  sheet.getRange(rowCount, 1, 1, lastCol)
       .setHorizontalAlignment('center')
       .setBorder(true, true, true, true, true, true, C_BORDER, SpreadsheetApp.BorderStyle.SOLID);
}


/**
 * Draws the Deficiencies tab: one row per problem.
 *
 * A plain list, unlike the Unit Tracker tab and its six header rows. One
 * header row holding keys, data from row 2, frozen and filtered.
 *
 * Rules that belong to this tab and are enforced elsewhere:
 *   - New rows always go on the bottom. It is a chronological log.
 *   - A record is never deleted and never moved. Fixed and Cancelled both
 *     stay in place with a closed date. There is no Archive tab.
 *   - The record id in column A is made on the phone, before anything is
 *     sent. Id found, overwrite that row. Id new, append. That is what
 *     makes a retried save safe.
 */
function buildDeficienciesTab(ss) {
  var sheet = ss.getSheetByName(DEFICIENCIES_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(DEFICIENCIES_SHEET_NAME);

  var lastCol = DEFICIENCY_COLUMNS.length;

  // Trim the width to the thirteen columns, and leave the row count at the
  // Sheets default. Do not shrink the rows: save-batch appends records to
  // the bottom, and a range past the last row throws.
  resizeSheet(sheet, Math.max(sheet.getMaxRows(), 1000), lastCol);

  sheet.getRange(1, 1, 1, lastCol).setValues([DEFICIENCY_COLUMNS])
       .setBackground(C_SUBHEAD_BG)
       .setFontFamily('Arial').setFontSize(9).setFontWeight('bold')
       .setFontColor(C_TITLE_FG)
       .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 24);

  // Wide enough to read a record id, a needed line and a reason without
  // widening a column by hand. The rest stay narrow.
  var widths = {
    record_id: 175, unit: 70, phase: 80, item: 150, type: 95, reason: 120,
    other_text: 170, subtype: 110, needed: 150, quantity: 70, state: 85,
    created: 100, closed: 100
  };
  DEFICIENCY_COLUMNS.forEach(function (name, index) {
    sheet.setColumnWidth(index + 1, widths[name] || 110);
  });

  // Real date cells, not text, so the tab sorts and filters by date.
  ['created', 'closed'].forEach(function (name) {
    var col = DEFICIENCY_COLUMNS.indexOf(name) + 1;
    sheet.getRange(2, col, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd');
  });

  sheet.getRange(2, 1, sheet.getMaxRows() - 1, lastCol)
       .setFontFamily('Arial').setFontSize(9);

  sheet.setFrozenRows(1);
  if (!sheet.getFilter()) sheet.getRange(1, 1, sheet.getMaxRows(), lastCol).createFilter();
}


/**
 * Builds one rollup formula, for one row.
 *
 * WORST STATUS WINS IS DELETED. It made a unit with 17 items Complete and
 * 1 item Not Started read "Not Started", which hid a nearly finished unit.
 *
 * The rule is now unanimity or In Progress, counted rather than ordered.
 * Count n cells, c of them Complete, s of them Not Started, and f open
 * flags below the group. First test that matches wins:
 *
 *   c = n and f = 0   ->  Complete
 *   c = n and f > 0   ->  In Progress
 *   s = n             ->  Not Started
 *   anything else     ->  In Progress
 *
 * An open flag blocks Complete. It never raises Not Started: a unit with
 * nothing done and one Waiting record still reads Not Started.
 *
 * "flagCount" is a COUNTIFS fragment, or an empty string when the caller
 * has no flag test to make. See openFlagCount().
 *
 * Two things compute this rollup on purpose: this formula, so the Sheet
 * still reads by hand, and the phone, which is the one the app uses. The
 * app never reads this column. Any drift between them is cosmetic.
 */
function buildRollupFormula(cols, row, flagCount) {
  // Unreachable in practice. A phase with no items gets no rollup column,
  // and a project must keep at least one item.
  if (cols.length === 0) return '';

  var refs  = cols.map(function (col) { return colLetter(col) + row; });
  var count = refs.length;

  function countOf(status) {
    return refs.map(function (ref) {
      return 'COUNTIF(' + ref + ',"' + status + '")';
    }).join('+');
  }

  var everyComplete   = '(' + countOf('Complete')    + ')=' + count;
  var everyNotStarted = '(' + countOf('Not Started') + ')=' + count;

  var whenEveryComplete = flagCount
    ? 'IF((' + flagCount + ')>0,"In Progress","Complete")'
    : '"Complete"';

  return '=IF(' + everyComplete + ',' + whenEveryComplete + ',' +
             'IF(' + everyNotStarted + ',"Not Started","In Progress"))';
}


/**
 * One open-ended reference into the Deficiencies tab, such as
 * 'Deficiencies'!$K$2:$K. Row 1 is the header row, so every range starts
 * at row 2.
 */
function deficiencyRange(colNumber) {
  var letter = colLetter(colNumber);
  return "'" + DEFICIENCIES_SHEET_NAME + "'!$" + letter + '$2:$' + letter;
}


/**
 * A COUNTIFS fragment counting open records against one unit.
 *
 * With a phase key it counts that phase only. The phase column is always
 * filled, so one test catches both a record on an item inside that phase
 * and a record on the whole phase.
 *
 * Unit keys and phase keys come from slug() and uniqueKey(), so they hold
 * letters, digits and underscores only. Nothing here needs escaping.
 */
function openFlagCount(unitKey, phaseKey) {
  var parts = [
    deficiencyRange(DEF_COL.unit),  '"' + unitKey + '"',
    deficiencyRange(DEF_COL.state), '"Open"'
  ];
  if (phaseKey) {
    parts.push(deficiencyRange(DEF_COL.phase), '"' + phaseKey + '"');
  }
  return 'COUNTIFS(' + parts.join(',') + ')';
}


/**
 * A whole formula counting how many UNITS hold an open record, not how
 * many records there are. Pass a phase key to count one phase, or nothing
 * to count the building.
 *
 * COUNTUNIQUEIFS answers 0 by itself when nothing matches, so no error
 * wrapper is needed.
 *
 * DO NOT go back to IFERROR(COUNTA(UNIQUE(FILTER(...))),0). It reads 1 on
 * an empty Deficiencies tab. FILTER answers #N/A when nothing matches, but
 * COUNTA counts an error as one value, so it returns 1 and IFERROR never
 * fires. Found by the step 1 test round, 2026-08-08.
 */
function unitsWithOpenFlagFormula(phaseKey) {
  var parts = [
    deficiencyRange(DEF_COL.unit),
    deficiencyRange(DEF_COL.state), '"Open"'
  ];
  if (phaseKey) {
    parts.push(deficiencyRange(DEF_COL.phase), '"' + phaseKey + '"');
  }
  return '=COUNTUNIQUEIFS(' + parts.join(',') + ')';
}


// ── SHEET READ HELPERS ────────────────────────────────────────────────

/** Reads every status value, so a rebuild can put them back. */
function readAllValues(ss, config) {
  var sheet  = ss.getSheetByName(TRACKER_SHEET_NAME);
  var layout = computeLayout(config);
  var units  = allUnits(config);
  var saved  = {};

  if (units.length === 0) return saved;

  var values = sheet.getRange(FIRST_DATA_ROW, 1, units.length, layout.lastCol).getValues();

  units.forEach(function (unit, index) {
    var row = values[index];
    layout.order.forEach(function (itemKey) {
      saved[unit.key + '|' + itemKey] = {
        status: String(row[layout.statusCol[itemKey] - 1] || 'Not Started')
      };
    });
    saved[unit.key + '|__updated'] = row[layout.lastUpdatedCol - 1] || '';
  });

  return saved;
}


/** Reads the Overall Status column and returns short keys. */
function readOverallColumn(ss, layout, unitCount) {
  if (unitCount === 0) return [];
  var sheet  = ss.getSheetByName(TRACKER_SHEET_NAME);
  var values = sheet.getRange(FIRST_DATA_ROW, layout.overallCol, unitCount, 1).getValues();
  return values.map(function (row) { return statusKey(row[0]); });
}


/**
 * Counts open records in the Deficiencies tab, by type.
 *
 * These are raw row counts, not unit counts. The Buildings screen shows
 * "3 deficiencies" meaning three problems, not three units.
 *
 * One read of the type-to-state block, then the counting happens in
 * memory. Not one search per record.
 */
function countOpenFlags(ss) {
  var out   = { deficiencies: 0, waiting: 0 };
  var sheet = ss.getSheetByName(DEFICIENCIES_SHEET_NAME);
  if (!sheet) return out;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return out;    // header row only, no records yet

  var from  = DEF_COL.type;
  var width = DEF_COL.state - DEF_COL.type + 1;
  var rows  = sheet.getRange(2, from, lastRow - 1, width).getValues();

  rows.forEach(function (row) {
    if (String(row[DEF_COL.state - from]).trim() !== 'Open') return;
    var type = String(row[DEF_COL.type - from]).trim();
    if (type === 'Waiting') out.waiting += 1;
    else if (type === 'Deficiency') out.deficiencies += 1;
  });

  return out;
}


/**
 * Reads the whole Deficiencies tab, EVERY STATE, one row per record.
 *
 * Do not add a state filter here. Fixed records feed the suggestion chips
 * on the Logger screen, and the 0.3 Archive window is a filter over
 * records. Filtering at the server takes both away, and the payload it
 * saves is measured in kilobytes.
 *
 * One read of the whole block, then the mapping happens in memory.
 * created and closed come back as Date objects, so formatCell turns them
 * into yyyy-mm-dd strings the phone can compare and print.
 */
function readRecords(ss) {
  var sheet = ss.getSheetByName(DEFICIENCIES_SHEET_NAME);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];    // header row only, no records yet

  var width = DEFICIENCY_COLUMNS.length;
  var idAt  = DEFICIENCY_COLUMNS.indexOf('record_id');
  var rows  = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  var out   = [];

  rows.forEach(function (row) {
    // A blank record id is an empty row left by a hand edit. Skip it.
    if (String(row[idAt] || '').trim() === '') return;

    var record = {};
    DEFICIENCY_COLUMNS.forEach(function (name, index) {
      record[name] = (name === 'quantity')
        ? (parseInt(row[index], 10) || 0)
        : formatCell(row[index]);
    });
    out.push(record);
  });

  return out;
}


/** Grows or shrinks a sheet to the size it needs. */
function resizeSheet(sheet, rows, cols) {
  var maxRows = sheet.getMaxRows();
  var maxCols = sheet.getMaxColumns();

  if (maxRows < rows) sheet.insertRowsAfter(maxRows, rows - maxRows);
  if (maxRows > rows) sheet.deleteRows(rows + 1, maxRows - rows);
  if (maxCols < cols) sheet.insertColumnsAfter(maxCols, cols - maxCols);
  if (maxCols > cols) sheet.deleteColumns(cols + 1, maxCols - cols);
}


// ── SMALL HELPERS ─────────────────────────────────────────────────────

/** Finds or creates the PFC/Control/Project Sheets/ folder. */
function getProjectsFolder() {
  var root = PFC_ROOT_FOLDER_ID
    ? DriveApp.getFolderById(PFC_ROOT_FOLDER_ID)
    : DriveApp.getRootFolder();
  return getOrCreate(root, PROJECTS_FOLDER_NAME);
}

function getOrCreate(parent, name) {
  var found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}


/** Turns a column number into its letter. 1 is A, 27 is AA. */
function colLetter(n) {
  var out = '';
  while (n > 0) {
    var rest = (n - 1) % 26;
    out = String.fromCharCode(65 + rest) + out;
    n = (n - rest - 1) / 26;
  }
  return out;
}


/** Every unit in the project, in row order. */
function allUnits(config) {
  var units = [];
  config.groups.forEach(function (group) {
    group.units.forEach(function (unit) { units.push(unit); });
  });
  return units;
}


/**
 * The phases that hold at least one item.
 *
 * A phase can end up empty. Admin can uncheck every item in it, or remove
 * its last item later. An empty phase takes no columns and gets no rollup,
 * but it stays in the config so Admin can add an item back to it.
 */
function activePhases(config) {
  return config.phases.filter(function (phase) {
    return phase.items && phase.items.length > 0;
  });
}


/** Every item in the project, in column order. */
function allItems(config) {
  var items = [];
  config.phases.forEach(function (phase) {
    phase.items.forEach(function (item) { items.push(item); });
  });
  return items;
}


function indexOfUnit(config, unitKey) {
  var units = allUnits(config);
  for (var i = 0; i < units.length; i++) {
    if (units[i].key === unitKey) return i;
  }
  return -1;
}


function groupOfUnit(config, unitKey) {
  for (var i = 0; i < config.groups.length; i++) {
    var units = config.groups[i].units;
    for (var j = 0; j < units.length; j++) {
      if (units[j].key === unitKey) return config.groups[i];
    }
  }
  return null;
}


function groupOfUnitByIndex(config, index) {
  var seen = 0;
  for (var i = 0; i < config.groups.length; i++) {
    var count = config.groups[i].units.length;
    if (index < seen + count) return config.groups[i];
    seen += count;
  }
  return config.groups[config.groups.length - 1];
}


function findByKey(list, key) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].key === key) return list[i];
  }
  return null;
}


/** Reads the floor number out of a group label such as "Floor 2". */
function floorNumber(group) {
  var match = String(group.label).match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}


/** The short label shown on a unit chip. "Unit 7" becomes "7". */
function chipFor(label) {
  var match = String(label).match(/\d+/);
  return match ? match[0] : String(label);
}


/** "Phase 1 — Doors & Windows" becomes "PHASE 1 · DOORS & WINDOWS". */
function bandLabel(label) {
  return String(label).replace(/\s*[—–-]\s*/, '  ·  ').toUpperCase();
}


/** The short label above a rollup column. "Phase 1 — Doors" becomes "PHASE 1". */
function shortPhaseLabel(label, index) {
  var match = String(label).match(/^\s*(Phase\s*\d+)/i);
  return match ? match[1].toUpperCase() : ('GROUP ' + (index + 1));
}


/** Turns a Sheet status label into the app's short key. */
function statusKey(value) {
  var key = STATUS_KEYS[String(value || '').trim()];
  return key || 'not_started';
}


/** Turns a cell value into a plain string the app can show. */
function formatCell(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}


/** Turns a label into a safe key. "Exterior Door(s)" becomes "exterior_door_s". */
function slug(text) {
  var out = String(text).toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return out || 'item';
}


/** Adds a number to a key if that key is already used. */
function uniqueKey(base, taken) {
  var key = base;
  var n   = 2;
  while (taken.indexOf(key) !== -1) {
    key = base + '_' + n;
    n++;
  }
  taken.push(key);
  return key;
}


/** Keeps a count at 1 or above. */
function clampCount(value, min) {
  var n = parseInt(value, 10);
  if (isNaN(n) || n < min) return min;
  return n;
}


// ── STILL TO BUILD IN 0.2 ──────────────────────────────────────────────
//
// One action is not here yet.
//
//   'cancel-item-records' (step 5) — sets every Open record on one item to
//                 Cancelled and returns the count. It backs the Admin
//                 refusal panel on Remove an item. It writes the
//                 Deficiencies tab only: no config change and no rebuild.
//
// 'get-project' landed in step 2 and 'save-batch' in step 3.
//
// An earlier version of this note named an action called 'update-item',
// writing one item at a time. It was deleted during 0.2 planning, before
// it was ever built, because one job per field would leave the Sheet
// holding half a change.
//
// The three helpers that note pointed at are still correct and still what
// these actions need:
//   readConfig(ss)            -> the structure
//   computeLayout(config)     -> the exact column for any item
//   indexOfUnit(config, key)  -> the exact row for any unit
