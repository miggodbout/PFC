/* =====================================================================
   PFC CONTROL — shared logic
   =====================================================================
   Every screen loads this file. It holds:
     - the connection to the Apps Script backend
     - the three Progress values, the two flag kinds, and the rollup rule
     - the local copy on the phone, and the queue of unsent edits
     - the small drawing helpers the screens share

   Rule for this file: no screen-specific code. If only one screen needs
   it, it belongs in that screen's HTML file.
   ===================================================================== */


/* ── SETTINGS ─────────────────────────────────────────────────────── */

/**
 * The web app address of the PFC Control Apps Script project.
 *
 * Owner: miggodbout0728@gmail.com
 * Script: 11PF1yQ7qVu9xicCYG37p--dLEBGhP3-9iSxan2hxQKwbfAO3_YwcY2ZG
 *
 * If this address stops working, deploy again and paste the new one here.
 * See control/README.md.
 *
 * An empty address is not a working state any more. 0.2 deleted the demo
 * buildings, so every screen answers "The backend is not connected yet."
 * A made-up building beside a real one is worse than an error.
 */
var API_URL = 'https://script.google.com/macros/s/AKfycbzo9lCHMaxDqMEk6PPZouUWXG6dDeAMh3tHI0dtYExjCYE9DYDdT4vj8_YCrtnGjv5e/exec';

/** How long to wait for the server before giving up, in milliseconds. */
var API_TIMEOUT = 12000;


/* ── PROGRESS AND FLAGS ───────────────────────────────────────────── */

/**
 * Progress. Three values. Always set by hand, one value per item.
 *
 * Deficiency and On Hold left this object in 0.2. Neither one was ever
 * progress. "In Progress · Waiting on Painters" is two facts about one
 * item, and one field cannot hold both. They are FLAGS now, below.
 */
var STATUS = {
  not_started: { label: 'Not Started' },
  in_progress: { label: 'In Progress' },
  complete:    { label: 'Complete' }
};

/** Dropdown order. Every dropdown shows all three, always in this order. */
var CYCLE = ['not_started', 'in_progress', 'complete'];

/**
 * The two flag kinds. A flag is never set by hand: it appears while an
 * open record sits in the project's Deficiencies tab and clears when the
 * last one is fixed or cancelled.
 *
 * A flag is not a status, so it never takes the Progress dot. It gets its
 * own shape — a flag glyph — because shape survives bright sun and colour
 * blindness, and because a failed save is also red.
 *
 * on_hold was renamed waiting in 0.2, so "In Progress · Waiting on
 * Painters" reads without contradiction.
 */
var FLAGS = {
  deficiency: { label: 'Deficiency', cls: 'f-deficiency' },
  waiting:    { label: 'Waiting',    cls: 'f-waiting' }
};

/** Keeps an unknown value from breaking a screen. */
function safeStatus(key) {
  return STATUS[key] ? key : 'not_started';
}


/* ── THE ROLLUP RULE ──────────────────────────────────────────────── */

/**
 * THE ROLLUP RULE, WRITTEN ONCE. Every screen calls this. No screen works
 * out a rollup of its own.
 *
 * WORST STATUS WINS IS DELETED. It made a unit holding 17 Complete items
 * and 1 Not Started item read "Not Started", which hid a nearly finished
 * unit. The rule is unanimity or In Progress, counted rather than ordered.
 *
 * counts — what the group holds, ONE LEVEL DOWN:
 *            a phase counts its ITEMS
 *            a unit counts its ITEMS across every phase
 *            a floor counts its UNITS
 *            a building counts its UNITS
 *          { total, complete, notStarted }
 *
 * flags  — open flags below the group: { deficiency, waiting }
 *
 * First test that matches wins:
 *
 *   total is 0                    ->  none, drawn as a dash
 *   every one Complete, no flag   ->  Complete
 *   every one Complete, a flag    ->  In Progress
 *   every one Not Started         ->  Not Started
 *   anything else                 ->  In Progress
 *
 * An open flag BLOCKS Complete. It never RAISES Not Started: a unit with
 * nothing done and one Waiting record still reads Not Started, with a blue
 * flag beside it.
 *
 * A flag also blocks Complete on an item, through displayStatus() below.
 * So by the time a group is counted here, a flagged item has already
 * stopped reading Complete, and this f test only has to catch a Waiting
 * record attached to a whole phase.
 *
 * The project Sheet computes the same rule in its own formula, so it still
 * reads by hand. Two copies on purpose. The app never reads the Sheet's
 * rollup column, so any drift between them is cosmetic. Do not write a
 * third.
 */
function rollup(counts, flags) {
  var total      = (counts && counts.total)      || 0;
  var complete   = (counts && counts.complete)   || 0;
  var notStarted = (counts && counts.notStarted) || 0;

  var deficiency = (flags && flags.deficiency) || 0;
  var waiting    = (flags && flags.waiting)    || 0;

  var status;
  if (total === 0) {
    status = 'none';
  } else if (complete === total) {
    status = (deficiency + waiting > 0) ? 'in_progress' : 'complete';
  } else if (notStarted === total) {
    status = 'not_started';
  } else {
    status = 'in_progress';
  }

  /*
   * THE BAR FILLS BY ITEMS. THE COUNT STAYS IN UNITS.
   *
   * Above the Unit screen, done counts whole units finished, and a floor of
   * twelve half-built units has none of them. A bar filled from that number
   * draws nothing at all on a floor that is plainly half done — which is
   * what Miguel reported on the Buildings screen and on every floor header.
   *
   * So the bar carries a second pair of numbers, counted in items the whole
   * way up. The text beside it still reads in units, because "5/12 Units
   * done" is what a person walking the floor wants, not "148/216 Items".
   *
   * A caller with no item numbers to give falls back to the unit pair. At
   * the Unit level that is not a fallback but the truth: there, done and
   * total ALREADY count items.
   */
  var itemsTotal = (counts && counts.itemsTotal !== undefined) ? counts.itemsTotal : total;
  var itemsDone  = (counts && counts.itemsDone  !== undefined) ? counts.itemsDone  : complete;

  /*
   * THE PHASE BREAKDOWN, for the bar and for nothing else.
   *
   * [ { key, done, total } ], in phase order. It is optional the whole way
   * through: a caller with none gives none, and barHtml falls back to the
   * one-colour bar. That matters because a phone can be holding a list
   * answer from before the backend sent these.
   */
  var phases = (counts && counts.phases) ? counts.phases : null;

  return {
    status:     status,
    done:       complete,
    total:      total,
    itemsDone:  itemsDone,
    itemsTotal: itemsTotal,
    phases:     phases,
    deficiency: deficiency,
    waiting:    waiting
  };
}


/** The same rule, counted from a list of status keys. */
function rollupOf(statuses, flags) {
  var list       = statuses || [];
  var complete   = 0;
  var notStarted = 0;

  list.forEach(function (key) {
    if (key === 'complete') complete += 1;
    else if (safeStatus(key) === 'not_started') notStarted += 1;
  });

  return rollup({ total: list.length, complete: complete, notStarted: notStarted }, flags);
}


/**
 * STORE WHAT IS SET. DISPLAY WHAT IS TRUE.
 *
 * The Sheet holds whatever a person last set by hand, and it never changes
 * on its own. This applies the one downgrade the app makes on the way to
 * the screen: Complete DISPLAYS as In Progress while an open flag sits on
 * that item.
 *
 * Fix the last record and Complete comes back by itself, because the
 * stored value was never touched. No extra column, no stored state, and no
 * automatic write.
 */
function displayStatus(stored, openFlagCount) {
  var key = safeStatus(stored);
  if (key === 'complete' && openFlagCount > 0) return 'in_progress';
  return key;
}


/* ── DEFAULT ITEM TEMPLATE ────────────────────────────────────────── */

/**
 * THIS BLOCK IS THE SEED FOR A NEW BUILDING.
 *
 * Set Up Building loads it into the new building form, sends it up in the create
 * payload, and the server writes it into that building's _Config. After
 * that the building reads its own config and never looks here again. So
 * changing anything below changes what the NEXT building starts with, and
 * nothing about a building that already exists.
 *
 * reference/PFC_Master_Template.xlsx is the drawing of this. No code reads
 * it. Change one, change the other by hand.
 */

/**
 * The standard item list — fourteen items, down from seventeen in 0.1.
 *
 * Unit Door, Passage, Privacy, Dummy, Spring Stops and Hinge Stops stopped
 * being items and became subtypes. Handles, Stops and Bathtub are new.
 *
 * The trade: Passage and Privacy now share one status row, so you can no
 * longer read that the passage handles are done and the privacy ones are
 * not. Progress got coarser so that logging could get finer. That was the
 * choice, not an oversight.
 */
var DEFAULT_PHASES = [
  {
    key: 'phase1',
    label: 'Phase 1 — Doors & Windows',
    items: ['Interior Doors', 'Exterior Doors', 'Windows', 'Attic Hatch',
            'Handrail', 'Bathtub']
  },
  {
    key: 'phase2',
    label: 'Phase 2 — Baseboards',
    items: ['Cut', 'Nailed']
  },
  {
    key: 'phase3',
    label: 'Phase 3 — Hardware & Accessories',
    items: ['Handles', 'Ball Catch', 'Deadbolts', 'Stops', 'Mirrors',
            'Bathroom Accessories']
  }
];

/**
 * The reason list a building starts with. One list of eight per building,
 * not one per phase and not one per item. An item narrows it with its own
 * trim.
 *
 * Add-only once the building exists. Set Up Building can add a reason and there is
 * never a Delete button, so no record can ever point at a value that
 * stopped existing.
 *
 * Warped was renamed Defective: Defective means it arrived wrong from the
 * factory, Damaged means somebody hurt it after it arrived.
 */
var DEFAULT_REASONS = ['Wrong Size', 'Wrong Type', 'Wrong Swing', 'Wrong Color',
                       'Missing', 'Damaged', 'Defective', 'Other'];

/**
 * The Waiting reason list. It never varies, so it is NOT stored per
 * building and there is no trim against it. A Waiting record can attach to
 * a whole phase, where there is no item to narrow it with.
 */
var WAITING_REASONS = ['Waiting on Another Trade', 'Awaiting Delivery',
                       'Backordered', 'Site Not Ready', 'Other'];

/**
 * What each item starts with, keyed by its label.
 *
 *   types — the Type dropdown on Logging. Four items define one. Every other
 *           defines none and shows no dropdown at all.
 *   trim  — the reasons this item does NOT offer, matched exactly against
 *           DEFAULT_REASONS. Empty offers all eight.
 *   hint  — grey placeholder text inside the empty Needed box. Set Up
 *           Building calls this Example on screen; the key stays `hint`.
 *
 * Other is NOT in a types list. Logging adds it to the bottom of the Type
 * dropdown itself, where it opens a text box. The typed text goes in that
 * one record's subtype cell and never joins the list — a one-off stays a
 * one-off, and making it permanent is an Add on the setup screen.
 *
 * Every trim ships empty on purpose. An empty trim is never wrong, only
 * wider than it needs to be, and Miguel narrows them through the setup
 * Lists card without a release. The test is responsibility, not the item:
 * ask "does PFC own this", not "can this item have this". The framer hangs
 * the patio and entry doors, so Wrong Swing comes off Exterior Doors
 * even though the door plainly swings.
 *
 * Only the hint Miguel gave is filled in. A blank hint is never wrong,
 * only less helpful, and the setup screen fills one in without a release too.
 */
var DEFAULT_ITEM_LISTS = {
  'Interior Doors': {
    types: ['Regular', 'Bypass', 'Bi-fold', 'Double', 'Pocket',
            'Double Pocket', 'Dwarf', 'Unit Door'],
    trim:  [],
    hint:  'Size   Jamb   Swing'
  },
  'Exterior Doors':   { types: ['Patio', 'Entry'],                        trim: [], hint: '' },
  'Handles':          { types: ['Passage', 'Privacy', 'Dummy', 'Pocket'], trim: [], hint: '' },
  'Stops':            { types: ['Spring', 'Hinge'],                       trim: [], hint: '' }
};

/**
 * The three lists one item starts with. A custom item, or any item with no
 * entry above, gets empty lists: all eight reasons, no subtype dropdown,
 * no placeholder.
 */
function defaultItemLists(label) {
  var found = DEFAULT_ITEM_LISTS[label];
  return {
    types: found ? found.types.slice() : [],
    trim:  found ? found.trim.slice()  : [],
    hint:  found ? found.hint          : ''
  };
}


/* ── BACKEND ──────────────────────────────────────────────────────── */

/**
 * Calls the backend once.
 *
 * It always answers. It never throws. The answer is either
 *   { ok: true,  data: ... }
 * or
 *   { ok: false, reason: '...', detail: '...' }
 *
 * reason is one of:
 *   not-configured  API_URL is still empty
 *   offline         the phone has no connection
 *   timeout         the server took too long
 *   blocked         the browser refused the reply
 *   server          the server answered with an error
 *
 * A job site has poor signal, so no screen may crash on a failed call.
 *
 * options.noFallback stops the JSONP fallback below and answers 'blocked'
 * instead. Only the queue drain passes it. The fallback puts the whole
 * payload in the web address, and an address near 8,000 characters FAILS
 * SILENTLY — which is fine for a small read and is the one thing in this
 * app that could quietly lose a person's work. The drain takes the
 * fallback over itself and sends in measured slices. See sendJobsAsJsonp.
 */
function apiCall(action, data, method, options) {
  if (!API_URL) {
    return Promise.resolve({ ok: false, reason: 'not-configured' });
  }

  var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var timedOut = false;
  var timer = setTimeout(function () {
    timedOut = true;
    if (controller) controller.abort();
  }, API_TIMEOUT);

  var request;
  if (method === 'POST') {
    // Content-Type text/plain keeps this a simple request, so the browser
    // skips the CORS preflight. The camera app uses the same trick.
    request = fetch(API_URL, {
      method: 'POST',
      signal: controller ? controller.signal : undefined,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(assign({ action: action }, data))
    });
  } else {
    request = fetch(apiUrlFor(action, data), {
      signal: controller ? controller.signal : undefined
    });
  }

  return request
    .then(function (response) {
      clearTimeout(timer);
      if (!response.ok) {
        // 'blocked', not 'server'. A status code is not a message a person
        // can act on, and reason 'server' is reserved for a reply the
        // backend WROTE — those go on the screen as they are.
        return { ok: false, reason: 'blocked', detail: 'The server replied ' + response.status + '.' };
      }
      return response.json().then(function (body) {
        if (body && body.success === false) {
          // data carries the WHOLE refusal, not only its sentence. Set Up
          // Building reads blocked.records off it to write its own line and
          // size its own button. Every other caller reads reason and detail
          // and never looks at data unless ok is true.
          return { ok: false, reason: 'server',
                   detail: body.error || 'The server refused the request.',
                   data: body };
        }
        return { ok: true, data: body };
      });
    })
    .catch(function (err) {
      clearTimeout(timer);
      if (timedOut) return { ok: false, reason: 'timeout' };
      if (navigator.onLine === false) return { ok: false, reason: 'offline' };

      if (options && options.noFallback) {
        return { ok: false, reason: 'blocked',
                 detail: err && err.message ? err.message : '' };
      }

      // fetch failed but the phone says it is online. Some networks block
      // the reply to a cross-site request. Try the script-tag path, which
      // those networks allow.
      return jsonpCall(action, data).then(function (result) {
        if (result) return result;
        return { ok: false, reason: 'blocked',
                 detail: 'The browser could not read the reply. ' + (err && err.message ? err.message : '') };
      });
    });
}


/** Builds the GET address for an action. */
function apiUrlFor(action, data, callbackName) {
  var url = API_URL +
    '?action=' + encodeURIComponent(action) +
    '&payload=' + encodeURIComponent(JSON.stringify(data || {}));
  if (callbackName) url += '&callback=' + encodeURIComponent(callbackName);
  return url;
}


var jsonpCounter = 0;

/**
 * Fallback path. Loads the reply through a script tag instead of fetch.
 * Returns null if this path fails too.
 */
function jsonpCall(action, data) {
  return new Promise(function (resolve) {
    var name = '__pfcReply' + (jsonpCounter++);
    var script = document.createElement('script');
    var done = false;

    var timer = setTimeout(function () { finish(null); }, API_TIMEOUT);

    function finish(body) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { delete window[name]; } catch (e) { window[name] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);

      if (!body) return resolve(null);
      if (body.success === false) {
        // data carries the whole refusal here too. Both paths answer with
        // the same shape, or a screen would behave differently on the
        // networks that force this one.
        return resolve({ ok: false, reason: 'server',
                         detail: body.error || 'The server refused the request.',
                         data: body });
      }
      resolve({ ok: true, data: body });
    }

    window[name] = finish;
    script.onerror = function () { finish(null); };
    script.src = apiUrlFor(action, data, name);
    document.head.appendChild(script);
  });
}


/* ── THE LOCAL COPY ───────────────────────────────────────────────── */
/*
   FOUR KEYS, FOUR LIFETIMES. DO NOT MERGE THEM.

     pfc.control.v1.projects      the Buildings list answer, and which
                                  building was opened when
     pfc.control.v1.project.<id>  one whole building copy
     pfc.control.v1.outbox        edits that have not reached the Sheet
                                  (KEEPS THE OLD NAME. The window is called
                                  Queue now, but this string is an
                                  identifier, not a label. Rename it and
                                  every edit already waiting on a crew
                                  phone is orphaned.)
     pfc.control.v1.chips         needed lines from DROPPED buildings only
                                  (0.2 step 4 fills this one)

   localStorage, not sessionStorage. sessionStorage dies with the page
   session, and Apple publishes no timer for when iOS ends a backgrounded
   web app window. An edit typed on site has to still be there tomorrow.

   ONE KEY PER BUILDING, not one key holding everything. localStorage reads
   and writes a key WHOLE, so one big key would rewrite a megabyte every
   time one status changed.

   IndexedDB was considered and turned down for 0.2: every read there is
   asynchronous, so every screen would gain a wait, and every wait is a
   place a screen can go blank. One building is about 100 KB against a
   ~5 MB cap.

   A STORAGE KEY IS AN IDENTIFIER, NOT A LABEL. Name it once and never
   rename it. Renaming orphans what is already on a crew phone.

   There is no migration from 0.1, and nobody should write one. The 0.1
   store sat in sessionStorage, so it is already gone. That is lucky
   rather than planned.
*/

var STORE_PREFIX = 'pfc.control.v1.';

/*
   Goes up by one every time the queue shelf is written. Nothing reads it
   but the painted-record memo, which cannot tell a stale answer from a
   fresh one any other way.
*/
var jobsRev = 0;

/** How many building copies the phone keeps. The eleventh drops the oldest. */
var PROJECT_LIMIT = 10;

var Store = {

  /** Reads one key. Never throws — private browsing can block storage. */
  read: function (name, fallback) {
    try {
      var raw = localStorage.getItem(STORE_PREFIX + name);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      return (value === null || value === undefined) ? fallback : value;
    } catch (e) {
      return fallback;
    }
  },

  /** Writes one key. Returns false when storage is full or blocked. */
  write: function (name, value) {
    try {
      localStorage.setItem(STORE_PREFIX + name, JSON.stringify(value));
      // Every change to the shelf moves the counter the painted-record memo
      // in paintedRecords() watches. It sits here, and not in the four
      // callers, because one missed bump paints a stale flag on a screen.
      if (name === 'outbox') jobsRev += 1;
      return true;
    } catch (e) {
      return false;
    }
  },

  drop: function (name) {
    try { localStorage.removeItem(STORE_PREFIX + name); } catch (e) {}
  },


  /* -- the Buildings list ------------------------------------------- */

  /** The stored list answer, or null. */
  list: function () {
    return this.read('projects', null);
  },

  setList: function (projects) {
    var held = this.list() || {};
    this.write('projects', {
      projects:  projects,
      fetchedAt: Date.now(),
      seen:      held.seen || {}
    });
  },


  /* -- one building copy -------------------------------------------- */

  /** One whole building, as get-project sent it, or null. */
  project: function (id) {
    var held = this.read('project.' + id, null);
    return held ? held.data : null;
  },

  /** When that copy was last fetched, in milliseconds, or 0. */
  projectFetchedAt: function (id) {
    var held = this.read('project.' + id, null);
    return held ? (held.fetchedAt || 0) : 0;
  },

  setProject: function (id, data) {
    this.write('project.' + id, { data: data, fetchedAt: Date.now() });
    this.touch(id);
    this.enforceLimit();
  },

  /**
   * Writes values the server has just accepted into the building copy.
   *
   * WITHOUT THIS, A SAVE THAT WORKED LOOKS LIKE A SAVE THAT FAILED. The
   * screen paints a waiting edit out of the queue, not out of the copy,
   * and the job leaves the queue the moment the server answers ok. So the
   * paint disappears while the copy still holds the OLD value, and the row
   * snaps back to what it said before the tap. On site that reads as a lost
   * edit, and the crew taps it again.
   *
   * The server has already confirmed these values, so folding them in is
   * not a guess. fetchedAt is deliberately NOT moved: it records when the
   * server last spoke to us, and this is not a fetch.
   *
   * A refused write costs nothing here. The Sheet holds the value and the
   * next fetch brings it back, so this never deletes a copy to make room —
   * unlike the queue, which holds the only copy of an unsent edit.
   */
  foldLanded: function (id, jobs) {
    var held = this.read('project.' + id, null);
    if (!held || !held.data) return;

    var copy    = held.data;
    var touched = false;

    copy.status  = copy.status  || {};
    copy.records = copy.records || [];

    jobs.forEach(function (job) {
      if (job.kind === 'item') {
        copy.status[job.unitKey] = copy.status[job.unitKey] || {};
        copy.status[job.unitKey][job.itemKey] = job.progress;
        touched = true;
        return;
      }

      // A LANDED RECORD FOLDS THE SAME WAY, and for the same reason. The
      // screen paints a waiting record out of the queue; the moment the
      // server takes it the job leaves the shelf, so without this the
      // record — and its flag — would vanish until the next fetch.
      //
      // Id found, replace. Id new, append. That is the same rule the
      // server writes the Sheet with, so both sides agree after a retry.
      if (job.kind === 'record' && job.record && job.record.record_id) {
        var id    = job.record.record_id;
        var found = -1;
        copy.records.forEach(function (record, i) {
          if (record.record_id === id) found = i;
        });
        if (found >= 0) copy.records[found] = job.record;
        else            copy.records.push(job.record);
        touched = true;
      }
    });

    if (touched) {
      this.write('project.' + id, { data: copy, fetchedAt: held.fetchedAt || 0 });

      // THE MEMO HAS TO BE TOLD, and Store.write only moves the counter for
      // the queue shelf. Without this line paintedRecords() keeps serving
      // the list it built BEFORE the fold: the record comes off the shelf,
      // the memo still says it is not in the copy, and the issue the crew
      // logged one second ago disappears off the row.
      jobsRev += 1;
    }
  },

  /** Every building id the phone is holding a copy of. */
  projectIds: function () {
    var ids = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(STORE_PREFIX + 'project.') === 0) {
          ids.push(key.slice((STORE_PREFIX + 'project.').length));
        }
      }
    } catch (e) {}
    return ids;
  },

  /** Marks a building as opened now, for the ten-copy limit. */
  touch: function (id) {
    var held = this.list() || { projects: [], fetchedAt: 0, seen: {} };
    held.seen = held.seen || {};
    held.seen[id] = Date.now();
    this.write('projects', held);
  },

  /**
   * Deletes one building copy.
   *
   * A copy is only a copy. The Sheet is the record, and an unsent edit
   * lives in the queue under its own key, so nothing is lost here.
   */
  dropProject: function (id) {
    var copy = this.project(id);
    if (copy) foldNeededLinesIntoChips(copy);
    this.drop('project.' + id);
  },

  /**
   * Keeps the phone to PROJECT_LIMIT copies, dropping the least recently
   * opened first.
   *
   * A BUILDING HOLDING AN UNSENT EDIT IS NEVER DROPPED, whatever its age.
   * The edit itself is safe either way — it lives in the queue — but the
   * copy is what the screen paints it on.
   */
  enforceLimit: function () {
    var ids = this.projectIds();
    if (ids.length <= PROJECT_LIMIT) return;

    var seen = (this.list() || {}).seen || {};
    var self = this;

    var droppable = ids.filter(function (id) { return !self.hasJobsFor(id); });
    droppable.sort(function (a, b) { return (seen[a] || 0) - (seen[b] || 0); });

    var over = ids.length - PROJECT_LIMIT;
    droppable.slice(0, over).forEach(function (id) { self.dropProject(id); });
  },


  /* -- the queue ---------------------------------------------------- */
  /*
     A KEYED SHELF, NOT A LINE-UP.

     One item job, keyed projectId|unitKey|itemKey. One record job, keyed
     by the record id. One key holds one job, so changing the same thing
     twice before it sends REPLACES the first job and only the final value
     reaches the Sheet.

     That works because every job carries the FINAL VALUE, never a change
     to apply. Writing it twice is the same as writing it once, which is
     also what makes a retry safe.

     A job carries:
       key, kind, projectId, at, tries, held
       kind 'item'   — unitKey, itemKey, progress (the SHORT key)
       kind 'record' — record, the thirteen Deficiencies columns
       error         — why the last attempt failed, once one has

     A WAITING edit paints the screen. A HELD edit does not: it shows what
     the Sheet holds and lives only in the Queue window, because a floor
     must never read 18/18 Complete off an edit that will never land.

     Step 2 built the shelf. Step 3 added the drain below it.
  */

  /*
     The shelf is read once per page load and kept in memory. Painting a
     floor of 48 chips asks for it about 700 times, and every ask is a
     JSON.parse of the whole key. Every write below refreshes the memo.
  */
  _jobs: null,

  /** Every job on the shelf, keyed. */
  jobs: function () {
    if (!this._jobs) this._jobs = this.read('outbox', {});
    return this._jobs;
  },

  job: function (key) {
    return this.jobs()[key] || null;
  },

  /**
   * Puts one job on the shelf, replacing whatever held that key.
   *
   * ANSWERS FALSE WHEN THE PHONE COULD NOT STORE IT. The caller must say
   * so on the screen. It is the one failure in this app that no retry
   * fixes and no queue catches, because the edit never reached the phone.
   */
  putJob: function (job) {
    var all    = this.jobs();
    var before = all[job.key];

    all[job.key] = job;
    this._jobs   = all;      // set first, so writeJobs sees this building

    if (this.writeJobs(all)) { Queue.changed(); return true; }

    /*
       IT WAS NOT STORED, SO IT MUST NOT PAINT. A job held in memory and
       not on disk is the worst state this app can be in: the screen shows
       the value, the person walks away, and the next time the app opens it
       is gone with nothing to show it was ever there. Put the shelf back
       the way it was and let the caller report it.
    */
    if (before) all[job.key] = before; else delete all[job.key];
    this._jobs = all;
    Queue.changed();
    return false;
  },

  /**
   * THE OUTBOX OUTRANKS EVERY BUILDING COPY.
   *
   * Ten building copies are about a megabyte, and they are what fills the
   * phone. A copy is ONLY a copy — the Sheet holds it and opening the
   * building once brings it back. AN UNSENT EDIT EXISTS NOWHERE ELSE ON
   * EARTH. So when storage refuses the queue, copies are deleted to make
   * room for it, least recently opened first, and never one belonging to a
   * building that is itself holding an unsent edit.
   *
   * This is the offline path's last line. Everything else about being
   * offline is a retry, and a retry cannot help an edit that was never
   * written down.
   */
  writeJobs: function (all) {
    if (this.write('outbox', all)) return true;

    var self = this;
    var seen = (this.list() || {}).seen || {};

    var droppable = this.projectIds().filter(function (id) { return !self.hasJobsFor(id); });
    droppable.sort(function (a, b) { return (seen[a] || 0) - (seen[b] || 0); });

    for (var i = 0; i < droppable.length; i++) {
      this.dropProject(droppable[i]);
      if (this.write('outbox', all)) return true;
    }

    return false;
  },

  removeJob: function (key) {
    var all = this.jobs();
    delete all[key];
    this._jobs = all;
    this.write('outbox', all);
    Queue.changed();
  },

  /** True when this building holds any unsent edit, waiting or held. */
  hasJobsFor: function (id) {
    var all = this.jobs();
    return Object.keys(all).some(function (key) { return all[key].projectId === id; });
  },

  /** How many unsent edits this building holds, split by state. */
  jobCountFor: function (id) {
    var all = this.jobs();
    var out = { waiting: 0, held: 0 };
    Object.keys(all).forEach(function (key) {
      if (all[key].projectId !== id) return;
      if (all[key].held) out.held += 1;
      else out.waiting += 1;
    });
    return out;
  }
};


/** The shelf key for one item edit. */
function itemJobKey(projectId, unitKey, itemKey) {
  return projectId + '|' + unitKey + '|' + itemKey;
}

/** The shelf key for one record. The record id already is unique. */
function recordJobKey(recordId) {
  return 'rec|' + recordId;
}


/* ── RECORDS ──────────────────────────────────────────────────────── */
/*
   A record is one problem and one thing needed. It lives in the
   Deficiencies tab of the building's Sheet, thirteen columns wide, and it
   travels inside the building copy under copy.records.

   THE PHONE MAKES THE ID, before anything is sent. That is what makes a
   retried save safe: the server matches on the id, so the same record
   written twice overwrites one row instead of making two.
*/

/**
 * A new record id: d-YYYYMMDD-HHMM-xxxx, four random hex at the end.
 *
 * The minute stamp is for a person reading the Sheet. The four hex are
 * what make it unique — two people can log inside the same minute.
 */
function newRecordId() {
  var now = new Date();
  function two(n) { return (n < 10 ? '0' : '') + n; }

  var stamp = String(now.getFullYear()) + two(now.getMonth() + 1) + two(now.getDate()) +
              '-' + two(now.getHours()) + two(now.getMinutes());

  var tail = '';
  for (var i = 0; i < 4; i++) tail += '0123456789abcdef'[Math.floor(Math.random() * 16)];

  return 'd-' + stamp + '-' + tail;
}


/** Today, as the Sheet's date columns want it. */
function todayStamp() {
  var now = new Date();
  function two(n) { return (n < 10 ? '0' : '') + n; }
  return now.getFullYear() + '-' + two(now.getMonth() + 1) + '-' + two(now.getDate());
}


/**
 * Builds one record, all thirteen columns, with nothing left undefined.
 *
 * The server writes the columns in its own fixed order and reads each one
 * by name, so a missing key writes a blank cell rather than failing. Every
 * key is set here so that never has to be guessed at.
 */
function makeRecord(fields) {
  return {
    record_id:  fields.record_id || newRecordId(),
    unit:       fields.unit       || '',
    phase:      fields.phase      || '',
    item:       fields.item       || '',      // blank means the whole phase
    type:       fields.type       || 'Deficiency',
    reason:     fields.reason     || '',
    other_text: fields.other_text || '',
    subtype:    fields.subtype    || '',
    needed:     fields.needed     || '',
    quantity:   fields.quantity   || 1,
    state:      fields.state      || 'Open',
    created:    fields.created    || todayStamp(),
    closed:     fields.closed     || ''
  };
}


/**
 * Puts one record on the queue shelf. Answers false when the phone would
 * not store it — the caller must say so on the screen.
 *
 * EVERY CHANGE TO A RECORD GOES THROUGH HERE, not just a new one. Marking
 * one Fixed and cancelling one both send the whole record again with a new
 * state, because a job carries the final value and never a change to
 * apply. The server matches the id and overwrites the row.
 */
function queueRecord(projectId, record) {
  return Store.putJob({
    key:       recordJobKey(record.record_id),
    kind:      'record',
    projectId: projectId,
    record:    record,
    at:        Date.now(),
    tries:     0,
    held:      false,
    error:     ''
  });
}


/*
   THE PAINTED RECORD LIST.

   A record that has not sent yet still has to show. Log a deficiency in a
   basement and the flag must appear on the item at once, or the person
   logs it twice.

   A WAITING record paints. A HELD one does not — same rule as an item
   edit, and for the same reason: a screen must never count something that
   will never land.

   The memo matters. countFlags runs once per item per unit, which is about
   900 times on a floor draw, and each run would otherwise merge the whole
   record list again. It is thrown away whenever the shelf changes.
*/
var paintedMemo = { id: null, rev: -1, records: null };

function paintedRecords(copy) {
  if (!copy) return [];
  if (paintedMemo.id === copy.id && paintedMemo.rev === jobsRev && paintedMemo.records) {
    return paintedMemo.records;
  }

  var out   = (copy.records || []).slice();
  var index = {};
  out.forEach(function (record, i) { index[record.record_id] = i; });

  var jobs = Store.jobs();
  Object.keys(jobs).forEach(function (key) {
    var job = jobs[key];
    if (job.kind !== 'record' || job.held) return;
    if (job.projectId !== copy.id) return;
    if (!job.record || !job.record.record_id) return;

    var at = index[job.record.record_id];
    if (at === undefined) { index[job.record.record_id] = out.length; out.push(job.record); }
    else                  { out[at] = job.record; }
  });

  paintedMemo = { id: copy.id, rev: jobsRev, records: out };
  return out;
}


/**
 * The open records under one place, newest last.
 *
 * filter takes the same three keys countFlags does: unit, phase, item.
 * Pass item '' to reach the records that hang on a WHOLE PHASE.
 */
function openRecords(copy, filter) {
  var want = filter || {};

  return paintedRecords(copy).filter(function (record) {
    if (record.state !== 'Open') return false;
    if (want.unit  !== undefined && record.unit  !== want.unit)  return false;
    if (want.phase !== undefined && record.phase !== want.phase) return false;
    if (want.item  !== undefined && record.item  !== want.item)  return false;
    return true;
  });
}


/** One record out of a copy by its id, painted, or null. */
function recordById(copy, id) {
  var found = null;
  paintedRecords(copy).forEach(function (record) {
    if (record.record_id === id) found = record;
  });
  return found;
}


/* ── THE NEEDED-LINE CHIPS ────────────────────────────────────────── */
/*
   Three chips under the Needed box, so the common line is one tap instead
   of eleven characters typed with gloves on.

   NO SEED LIST SHIPS ANYWHERE. Chips are built from the records already on
   this phone, across every building it holds, so a new job inherits the
   vocabulary of the last one on day one.

   TWO SOURCES THAT NEVER OVERLAP:
     - a building STILL on the phone is counted live, from scratch, every
       time. That is what makes cancelling a record take its chip back out
       exactly, with no bookkeeping.
     - a building the phone has DROPPED is read from the history index,
       which Store.dropProject folds it into on the way out.

   On a re-download a building's lines sit in both places for a while. TAKE
   THE LARGER OF THE TWO COUNTS, never the sum. It affects chip order only,
   never chip content.
*/

/** Twenty lines per group, and no more. */
var CHIP_LIMIT = 20;

/** A line unused this long, AND used fewer than CHIP_MIN_USES times, goes. */
var CHIP_MAX_AGE  = 365 * 24 * 60 * 60 * 1000;
var CHIP_MIN_USES = 3;

/** How many chips the row shows. Four wrap the row, and the wrapped row is
    the row Save needs. */
var CHIP_SHOWN = 3;


/**
 * ONE NORMALISING FUNCTION, WRITTEN ONCE AND USED TWICE — by the chip
 * filter and by the near-match prompt.
 *
 * Strip every space, quote mark and slash, then lowercase. Nothing else.
 *
 *   typed   32 6 RH    ->  326rh
 *   stored  32" 6" RH  ->  326rh      MATCH
 *
 * IT IS NOT AN EDIT DISTANCE, and it must never become one. `32 6 LH` and
 * `32 6 RH` are one character apart and are two different doors.
 */
function normaliseNeeded(text) {
  return String(text || '').replace(/[\s"'`\/\\-]/g, '').toLowerCase();
}


/**
 * The group a record's needed line belongs to: Type · item · subtype.
 *
 * Type splits the pool because a Deficiency line is a door size and a
 * Waiting line is a trade. An item that defines no subtypes groups on Type
 * and item alone. A phase-level Waiting record has no item and groups on
 * Type and phase.
 *
 * A TYPED `Other` SUBTYPE FALLS INTO ONE Other BUCKET per item, whatever
 * was typed, so the group count stays bounded at about sixty.
 */
function chipGroupKey(type, scope, subtype) {
  return String(type || '') + '|' + String(scope || '') + '|' + String(subtype || '');
}


/** The scope half of a group key: the item, or the phase when there is no item. */
function chipScope(itemKey, phaseKey) {
  return itemKey ? itemKey : ('phase:' + (phaseKey || ''));
}


/** The subtype half, bucketed. Anything the item does not define is Other. */
function chipSubtype(subtype, types) {
  if (!subtype) return '';
  var known = types || [];
  return (known.indexOf(subtype) >= 0) ? subtype : 'Other';
}


/** The group key one record's line belongs to, using the copy for its types. */
function chipGroupOfRecord(copy, record) {
  var types = itemTypes(copy, record.item);
  return chipGroupKey(record.type,
                      chipScope(record.item, record.phase),
                      chipSubtype(record.subtype, types));
}


/** The subtype list one item defines, out of a building copy. */
function itemTypes(copy, itemKey) {
  var found = [];
  if (!copy || !itemKey) return found;
  (copy.phases || []).forEach(function (phase) {
    phase.items.forEach(function (item) {
      if (item.key === itemKey) found = item.types || [];
    });
  });
  return found;
}


/**
 * THE HIDDEN LINES — chips this phone has been told to stop offering.
 *
 * A chip is not a list somebody wrote. It is a line that got typed into a
 * record often enough to be worth offering again, so a typo that got saved
 * three times becomes a suggestion, and there was no way to take it back
 * short of finding and cancelling every record that fed it.
 *
 * SO HIDING IS ITS OWN LIST, AND IT NEVER TOUCHES A RECORD. `painters to
 * finish` stays exactly as it was written on the eleven records that hold
 * it — that is history, and history does not get edited to tidy a
 * dropdown. It just stops being suggested.
 *
 * It is stored NORMALISED, so `32 6 RH` and `32" 6" RH` hide together.
 * That is the same rule the chip row and the near-match prompt already
 * treat as one line, and hiding one while the other kept appearing would
 * read as the x button not working.
 *
 * PER PHONE, and per group. There is no server column for it, and 0.3 is
 * where a shared list would belong if one is ever wanted.
 */
function hiddenChips() {
  var held = Store.read('chips.hidden', null);
  return (held && held.groups) ? held : { groups: {} };
}

function hideChip(group, line) {
  var norm = normaliseNeeded(line);
  if (!norm) return;

  var held = hiddenChips();
  var rows = held.groups[group] || [];
  if (rows.indexOf(norm) < 0) rows.push(norm);
  held.groups[group] = rows;

  Store.write('chips.hidden', held);
}

/** The stored history index: { groups: { groupKey: [ {n, c, t} ] } }. */
function chipIndex() {
  var held = Store.read('chips', null);
  if (!held || !held.groups) return { groups: {} };
  return held;
}


/**
 * Folds a building's needed lines into the chip history, in the same step
 * that deletes its copy.
 *
 * It is called from Store.dropProject, which is the only place a copy is
 * deleted, so the fold can never be missed — whichever rule dropped it.
 *
 * A LIVE BUILDING IS NEVER WRITTEN IN HERE. Only a copy on its way out.
 * That is what keeps the two sources from double-counting, and it is why
 * cancelling a record on a live building takes its chip straight back out.
 */
function foldNeededLinesIntoChips(copy) {
  if (!copy) return copy;

  var index = chipIndex();
  var now   = Date.now();

  (copy.records || []).forEach(function (record) {
    // Cancelled never feeds a chip. A typo enters the pool through a
    // record, so cancelling that record is what takes it back out.
    if (record.state === 'Cancelled') return;
    if (!record.needed) return;

    var group = chipGroupOfRecord(copy, record);
    var rows  = index.groups[group] || [];
    var norm  = normaliseNeeded(record.needed);
    var found = null;

    rows.forEach(function (row) { if (normaliseNeeded(row.n) === norm) found = row; });

    if (found) {
      found.c += 1;                                  // one record is one use
      found.t = Math.max(found.t || 0, now);
    } else {
      rows.push({ n: record.needed, c: 1, t: now });
    }

    index.groups[group] = rows;
  });

  pruneChipIndex(index, now);
  Store.write('chips', index);
  return copy;
}


/**
 * Keeps every group inside CHIP_LIMIT, and drops lines that went stale.
 *
 * The expiry is BOTH tests, not either: unused for twelve months AND used
 * fewer than three times. A line used forty times never decays, however
 * long the job has been quiet.
 *
 * Over the cap, the least used go first, ties to the oldest last-used.
 */
function pruneChipIndex(index, now) {
  Object.keys(index.groups).forEach(function (group) {
    var rows = index.groups[group].filter(function (row) {
      var old  = (now - (row.t || 0)) > CHIP_MAX_AGE;
      var rare = (row.c || 0) < CHIP_MIN_USES;
      return !(old && rare);
    });

    rows.sort(function (a, b) {
      if (b.c !== a.c) return b.c - a.c;
      return (b.t || 0) - (a.t || 0);
    });

    if (rows.length > CHIP_LIMIT) rows = rows.slice(0, CHIP_LIMIT);

    if (rows.length) index.groups[group] = rows;
    else             delete index.groups[group];
  });
}


/**
 * Every needed line the phone knows for one group, most used first.
 *
 * Live buildings are counted from scratch here, every call. That is not
 * expensive — it is a filter over the records of the copies already in
 * memory — and it is what keeps a cancelled record's chip from surviving.
 */
function chipRows(group) {
  var rows = {};      // normalised line -> { n, c, t }
  var now  = Date.now();
  var hide = hiddenChips().groups[group] || [];

  function add(into, text, at) {
    var norm = normaliseNeeded(text);
    if (!norm) return;
    if (!into[norm]) into[norm] = { n: text, c: 0, t: 0 };
    into[norm].c += 1;
    into[norm].t = Math.max(into[norm].t, at || 0);
  }

  // 1 — every building still on the phone, counted live.
  Store.projectIds().forEach(function (id) {
    var copy = Store.project(id);
    if (!copy) return;

    paintedRecords(copy).forEach(function (record) {
      if (record.state === 'Cancelled') return;
      if (!record.needed) return;
      if (chipGroupOfRecord(copy, record) !== group) return;
      add(rows, record.needed, Date.parse(record.created) || now);
    });
  });

  // 2 — the history index, for buildings the phone has dropped. TAKE THE
  // LARGER COUNT, never the sum: a re-downloaded building sits in both.
  (chipIndex().groups[group] || []).forEach(function (row) {
    var norm = normaliseNeeded(row.n);
    if (!norm) return;
    if (!rows[norm]) {
      rows[norm] = { n: row.n, c: row.c || 0, t: row.t || 0 };
    } else {
      rows[norm].c = Math.max(rows[norm].c, row.c || 0);
      rows[norm].t = Math.max(rows[norm].t, row.t || 0);
    }
  });

  // 3 — the hidden ones come out LAST, after both sources have been read.
  // Filtering earlier would let the history index put a line back that the
  // live records had already had removed.
  return Object.keys(rows)
    .filter(function (key) { return hide.indexOf(key) < 0; })
    .map(function (key) { return rows[key]; })
    .sort(function (a, b) {
      if (b.c !== a.c) return b.c - a.c;      // most used first
      return (b.t || 0) - (a.t || 0);          // ties to the newest
    });
}


/** The three chips to show under the Needed box, filtered by what is typed. */
function chipsFor(group, typed) {
  var norm = normaliseNeeded(typed);

  return chipRows(group).filter(function (row) {
    if (!norm) return true;
    var line = normaliseNeeded(row.n);
    return line.indexOf(norm) >= 0 && line !== norm;   // an exact hit needs no chip
  }).slice(0, CHIP_SHOWN).map(function (row) { return row.n; });
}


/**
 * THE NEAR-MATCH PROMPT, which fires on Save and never while typing.
 *
 * It answers the stored line when the typed one normalises to the same
 * thing but is written differently — `32 6 RH` against `32" 6" RH`. It
 * compares inside the current group only, so it can never offer a line the
 * chip row would not have offered. Two matches, the most used wins.
 *
 * Answers null when there is nothing to ask about.
 */
function nearMatch(group, typed) {
  var norm = normaliseNeeded(typed);
  if (!norm) return null;

  var hit = null;
  chipRows(group).forEach(function (row) {
    if (hit) return;
    if (normaliseNeeded(row.n) === norm && row.n !== typed) hit = row.n;
  });

  return hit;
}


/* ── THE DRAIN ────────────────────────────────────────────────────── */
/*
   THE OUTBOX SENDS ITSELF. Nothing on a screen calls the backend to save.
   A tap puts a job on the shelf, and everything below gets it to the
   Sheet, or holds it where a person can see it.

   THE RETRY CLOCK RUNS ONLY WHILE JOBS WAIT, AND STOPS DEAD WHEN THE
   SHELF EMPTIES. This is the one timer in the whole app, and it exists
   because it finishes work already asked for. It is not a poll for news:
   nothing here ever fetches.

   A drain also runs on app open, on pull down, and when the phone says
   signal is back. The browser's online event is not trustworthy on iOS,
   so the timer is the safety net under it.
*/

/**
 * At once, then 5s, 15s, 1m, then every 5 minutes.
 *
 * A FLAT RETRY WAS REJECTED. Every phone on a job site would come back on
 * the same beat, which is the pattern most likely to keep losing the fight
 * for the script lock.
 */
var QUEUE_BACKOFF = [0, 5000, 15000, 60000, 300000];

/**
 * How many failed attempts hold a job. With the backoff above that is
 * about thirty minutes.
 *
 * A JOB IS NEVER DELETED BY THE APP. Held means it stops painting the
 * screen and waits in the Queue window, where only a person can delete it.
 */
var QUEUE_MAX_TRIES = 10;

/** The server writes at most this many jobs in one call. The rest wait. */
var QUEUE_BATCH = 100;

/** PLAN CALL 1 — the JSONP fallback sends five jobs at a time. */
var JSONP_SLICE = 5;

/**
 * The address length one JSONP slice may build.
 *
 * A browser and Apps Script both stop accepting a web address near 8,000
 * characters, and a long one FAILS SILENTLY. 6,000 leaves room for the
 * script address itself and for the escaping to grow.
 */
var JSONP_MAX_URL = 6000;


var Queue = {

  _timer:     null,
  _sending:   false,
  _pending:   null,   // the drain in flight, so two never overlap
  _misses:    0,      // failed drains in a row, for the backoff
  _listeners: [],

  /** Every job that still paints the screen and still wants sending. */
  waiting: function () {
    var all = Store.jobs();
    return Object.keys(all)
      .map(function (key) { return all[key]; })
      .filter(function (job) { return !job.held; })
      .sort(function (a, b) { return (a.at || 0) - (b.at || 0); });   // oldest first
  },

  /** Every job the app has given up on. Only a person clears these. */
  heldJobs: function () {
    var all = Store.jobs();
    return Object.keys(all)
      .map(function (key) { return all[key]; })
      .filter(function (job) { return job.held; })
      .sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
  },

  counts: function () {
    var all = Store.jobs();
    var out = { waiting: 0, held: 0 };
    Object.keys(all).forEach(function (key) {
      if (all[key].held) out.held += 1; else out.waiting += 1;
    });
    return out;
  },

  /** True while a call is in the air. The sync bar turns its ring on this. */
  sending: function () { return this._sending; },

  /* -- telling the screens ------------------------------------------- */

  onChange: function (fn) { this._listeners.push(fn); },

  changed: function () {
    this._listeners.forEach(function (fn) {
      try { fn(); } catch (e) {}      // one broken screen must not stop the rest
    });
  },

  /* -- running ------------------------------------------------------- */

  /**
   * Sends what is waiting. Answers when the call comes back.
   *
   * Two drains never overlap: the second one gets the first one's promise.
   * The keyed shelf already guarantees one job per target, so nothing can
   * race for the same cells even if a screen calls this twice.
   */
  drain: function () {
    var self = this;
    if (self._sending) return self._pending;

    var jobs = self.waiting();
    if (!jobs.length) { self.stop(); return Promise.resolve({ sent: 0 }); }

    /*
     * OFFLINE NEVER ENTERS THE SENDING STATE.
     *
     * sendJobs answers "offline" without touching the network, so the bar
     * flipped to the accent "Saving 3 edits…" and straight back to grey
     * inside one frame. That flash was the only thing a person saw while
     * standing in a basement, and it read as something going wrong. Stop
     * before the paint rather than after it.
     *
     * Nothing is lost by waiting. The online event, coming back to the app,
     * and a pull down all call wake(), and the backoff below keeps a slow
     * timer running for the phone where none of those fire. No try is
     * burnt, because nothing was attempted.
     */
    if (navigator.onLine === false) {
      self._misses += 1;
      self.schedule();
      return Promise.resolve({ sent: 0 });
    }

    var batch = jobs.slice(0, QUEUE_BATCH);

    self._sending = true;
    self.clearTimer();
    self.changed();

    self._pending = sendJobs(batch).then(function (outcome) {
      applyOutcome(outcome, batch);

      self._sending = false;
      self._pending = null;

      var left = self.waiting().length;
      if (left) {
        // Something did not land. Wait longer before asking again.
        self._misses += 1;
        self.schedule();
      } else {
        self.stop();
      }

      self.changed();
      return { sent: batch.length - left };
    });

    return self._pending;
  },

  /** Drains now and restarts the backoff from the top. */
  wake: function () {
    this._misses = 0;
    return this.drain();
  },

  schedule: function () {
    var self = this;
    var wait = QUEUE_BACKOFF[Math.min(self._misses, QUEUE_BACKOFF.length - 1)];
    self.clearTimer();
    self._timer = setTimeout(function () {
      self._timer = null;
      self.drain();
    }, wait);
  },

  clearTimer: function () {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  },

  /** Nothing waits. Stop the clock. */
  stop: function () {
    this.clearTimer();
    this._misses = 0;
  },

  /* -- what a person does in the Queue window ----------------------- */

  /** Puts a held job back in line, with its try count at zero. */
  retry: function (key) {
    var job = Store.job(key);
    if (!job) return;
    job.held  = false;
    job.tries = 0;
    job.error = '';
    Store.putJob(job);
    this.wake();
  },

  /** The only way a job leaves the shelf unsent. Miguel taps it. */
  drop: function (key) {
    Store.removeJob(key);
    this.changed();
  }
};


/**
 * Sends one batch, and answers what happened to it.
 *
 *   { results: { key: { ok, retry, error } }, fail: null or a whole-call
 *     failure that covers every job with no result }
 */
function sendJobs(list) {
  return apiCall('save-batch', { jobs: list }, 'POST', { noFallback: true })
    .then(function (result) {
      if (result.ok) return { results: indexResults(result.data) };

      // The POST reply never came back, and the phone says it is online.
      // Some job-site networks block a cross-site reply. Take the script
      // tag path, in measured slices.
      if (result.reason === 'blocked') return sendJobsAsJsonp(list);

      return { results: {}, fail: classifyCallFailure(result) };
    });
}


/** The server's results list, keyed by job key. */
function indexResults(data) {
  var out = {};
  ((data && data.results) || []).forEach(function (one) { out[one.key] = one; });
  return out;
}


/**
 * PLAN CALL 1 — SAVE DOWN THE FALLBACK PATH, IN MEASURED SLICES.
 *
 * The script tag path puts the whole payload in the web address, and an
 * address that runs too long is not refused: it fails silently. This is
 * the only place in the app that could lose a person's work without
 * saying so, and it is used on exactly the networks a job site has.
 *
 * So: five jobs at a time, the address MEASURED before each slice is sent,
 * and the slice halved until it fits. A single job that still will not fit
 * is held at once with a reason of its own, and it sends normally the next
 * time a POST works. It is never dropped.
 */
function sendJobsAsJsonp(list) {
  var results = {};
  var queue   = list.slice();
  var fail    = null;

  function next() {
    if (fail || !queue.length) return Promise.resolve();

    var size = Math.min(JSONP_SLICE, queue.length);
    while (size > 1 && jsonpUrlLength(queue.slice(0, size)) > JSONP_MAX_URL) {
      size = Math.floor(size / 2);
    }

    if (size === 1 && jsonpUrlLength(queue.slice(0, 1)) > JSONP_MAX_URL) {
      var big = queue.shift();
      results[big.key] = {
        key: big.key, ok: false, retry: false,
        error: 'This edit is too large to send on this network.'
      };
      return next();
    }

    var slice = queue.splice(0, size);
    return jsonpCall('save-batch', { jobs: slice }).then(function (answer) {
      if (!answer || !answer.ok) {
        // Everything still in the queue keeps waiting. The next drain
        // starts again from the front.
        fail = classifyCallFailure(answer || { reason: 'blocked' });
        return;
      }
      assign(results, indexResults(answer.data));
      return next();
    });
  }

  return next().then(function () { return { results: results, fail: fail }; });
}


/** How long the address for this slice would be. */
function jsonpUrlLength(slice) {
  // A real callback name is about this long. Close enough to measure with.
  return apiUrlFor('save-batch', { jobs: slice }, '__pfcReply000').length;
}


/**
 * Turns a whole-call failure into the two things a job needs: whether to
 * try again, and whether this attempt counts toward the hold limit.
 *
 * THE RULE FOR BURNING A TRY: the phone reached the server and the job
 * still did not land. Offline and timeout never burn one — nothing was
 * attempted, or the answer simply never came back — because driving
 * through a dead zone must not turn six taps of work into six taps of
 * housekeeping.
 */
function classifyCallFailure(result) {
  var reason = result.reason || 'blocked';
  var detail = result.detail || '';

  if (reason === 'not-configured') {
    return { retry: false, burn: false, error: reasonText(reason) };
  }

  if (reason === 'offline' || reason === 'timeout') {
    return { retry: true, burn: false, error: reasonText(reason) };
  }

  if (reason === 'server') {
    // The backend is older than this app. Retrying cannot fix that.
    if (/unknown action/i.test(detail)) {
      logTechnical('E3', 'The backend does not know this action. Deploy the Apps Script again. ' + detail);
      return { retry: false, burn: false,
               error: 'This app needs an update. Tell the Admin. (E3)' };
    }
    return { retry: true, burn: true, error: detail || reasonText(reason) };
  }

  return { retry: true, burn: true, error: reasonText(reason, detail) };
}


/**
 * Files every result against its job.
 *
 * A landed job comes off the shelf AND goes into its building copy, in this
 * one pass, before anything redraws. The two belong together: the copy is
 * what the screen falls back to the instant the paint goes, so leaving the
 * copy behind shows the value the tap replaced. Landed jobs are grouped by
 * building, so one copy is read and written once however many items landed
 * on it.
 */
function applyOutcome(outcome, sent) {
  var results = outcome.results || {};
  var landed  = {};

  sent.forEach(function (job) {
    var one = results[job.key];

    // A JOB LEAVES THE SHELF ON ok:true AND ON NOTHING ELSE.
    if (one && one.ok) {
      // The value the server took is now what the Sheet holds, so it goes
      // into the copy whatever has happened on the shelf since.
      (landed[job.projectId] = landed[job.projectId] || []).push(job);
      return;
    }

    if (one) { settleJob(job, one.retry, one.error, true); return; }

    // No result of its own. A whole-call failure covers it. With neither,
    // the server simply did not mention it — leave it waiting.
    if (outcome.fail) {
      settleJob(job, outcome.fail.retry, outcome.fail.error, outcome.fail.burn);
    }
  });

  // THE COPY IS WRITTEN BEFORE THE SHELF IS EMPTIED, not after.
  //
  // Store.removeJob below calls Queue.changed(), and every screen listening
  // redraws on the spot. Fold second and they all redraw from the copy as
  // it stood BEFORE the fold — the record is off the shelf and not yet in
  // the copy, so it paints as though it never existed. That is the whole
  // reason this pass is ordered the way it is.
  Object.keys(landed).forEach(function (projectId) {
    Store.foldLanded(projectId, landed[projectId]);
  });

  Object.keys(landed).forEach(function (projectId) {
    landed[projectId].forEach(function (job) {
      // A RETAP WHILE THE CALL WAS IN THE AIR WINS, HERE TOO. If the job
      // under this key is not the one that was sent, the person has set a
      // new value since, and removing by key alone would throw that tap
      // away with nothing to show for it. settleJob guards the failure
      // path the same way. It stays and goes out on the next drain.
      var fresh = Store.job(job.key);
      if (fresh && fresh.at === job.at) Store.removeJob(job.key);
    });
  });
}


/**
 * Writes one failure back onto the shelf.
 *
 * A RETAP WHILE THE CALL WAS IN THE AIR WINS. If the job under this key
 * is not the one that was sent, the person has since set a new value, and
 * that value must not inherit this failure.
 */
function settleJob(job, retry, error, burn) {
  var fresh = Store.job(job.key);
  if (!fresh || fresh.at !== job.at) return;

  fresh.error = error;

  if (!retry) {
    fresh.held = true;
  } else if (burn !== false) {
    fresh.tries = (fresh.tries || 0) + 1;
    if (fresh.tries >= QUEUE_MAX_TRIES) fresh.held = true;
  }

  Store.putJob(fresh);
}


/**
 * SEND FIRST, THEN ASK.
 *
 * This runs as the file loads, before any screen fetches, so an edit typed
 * yesterday with no signal is on its way before the screen asks the server
 * for anything.
 */
(function startQueue() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', function () { Queue.wake(); });

  // iOS wakes a backgrounded web app without firing online. Coming back to
  // the app is the moment worth trying again.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) Queue.wake();
  });

  Queue.wake();
})();


/* ── LOADERS ──────────────────────────────────────────────────────── */
/*
   Each loader answers with a source, so a screen can say where the data
   came from. source is 'live' for the backend, or 'error'.

   THE DEMO BUILDINGS ARE DELETED. An invented building beside a real one
   is a trap on a job site. A screen with no data now says so.
*/

/** Fetches the Buildings list and stores it. */
function fetchProjects() {
  startRefreshRing();
  return apiCall('list-projects', {}, 'GET').then(function (result) {
    stopRefreshRing();
    if (!result.ok) {
      return { source: 'error', reason: result.reason, detail: result.detail };
    }
    var projects = result.data.projects || [];
    Store.setList(projects);
    return { source: 'live', projects: projects };
  }, function (error) {
    stopRefreshRing();
    throw error;
  });
}


/**
 * Fetches ONE WHOLE BUILDING and stores it.
 *
 * One call carries the structure, every unit's item statuses, every
 * record, and the lists Logger draws its dropdowns from. The Building
 * screen and every Unit screen inside it are drawn from this one copy.
 */
function fetchProject(projectId) {
  startRefreshRing();
  return apiCall('get-project', { id: projectId }, 'GET').then(function (result) {
    stopRefreshRing();
    if (!result.ok) {
      return { source: 'error', reason: result.reason, detail: result.detail };
    }
    Store.setProject(projectId, result.data);
    return { source: 'live', data: result.data };
  }, function (error) {
    stopRefreshRing();
    throw error;
  });
}


/**
 * The building list, for the setup screen.
 *
 * The setup screen wants the server's answer and nothing else — it is used on a
 * computer with signal, to change structure, and a stale list there would
 * offer a building that no longer exists. The Tracking screen does not use
 * this: it draws its stored copy first and refreshes behind it.
 */
function loadProjects() {
  return fetchProjects();
}


/**
 * One building's floors, units and item list, for the setup screen.
 *
 * The phone stopped calling this in 0.2. get-project answers with the
 * whole building instead. The setup screen still needs the plain structure, and it
 * needs it fresh from the server rather than from a phone copy.
 */
function loadStructure(projectId) {
  startRefreshRing();
  return apiCall('get-structure', { id: projectId }, 'GET').then(function (result) {
    stopRefreshRing();
    if (!result.ok) return { source: 'error', reason: result.reason, detail: result.detail };
    return { source: 'live', data: result.data };
  }, function (error) {
    stopRefreshRing();
    throw error;
  });
}


/** Creates a building. The setup screen calls this. */
function createProject(config) {
  return apiCall('create-project', config, 'POST');
}


/** Changes a building's structure. The setup screen calls this. */
function updateStructure(payload) {
  return apiCall('update-structure', payload, 'POST');
}


/**
 * Sets every open issue on one item to Cancelled. Answers with the count.
 *
 * This is the second half of the removal refusal, and the setup screen is
 * the only caller. IT DOES NOT GO ON THE QUEUE. The queue exists for an
 * edit typed on site with no signal, and this is a bulk change made on a
 * computer, in front of a count the server just read. Queuing it would
 * fire it against a Sheet that has moved on since.
 */
function cancelItemRecords(projectId, itemKey) {
  return apiCall('cancel-item-records', { id: projectId, itemKey: itemKey }, 'POST');
}


/* ── READING A BUILDING COPY ──────────────────────────────────────── */
/*
   Everything below reads the answer get-project sent, which is what
   Store.project(id) hands back. The screens never dig into that shape
   themselves — they ask these functions, so the rollup rule and the
   painting rule each live in exactly one place.
*/

/**
 * Puts an unsent edit on top of what the Sheet last said, on the way to
 * the screen.
 *
 * The building copy and the queue are separate keys, so A FRESH FETCH CAN
 * NEVER OVERWRITE AN UNSENT EDIT. A fetch replaces the copy only, and the
 * paint happens after it, every time a screen draws.
 *
 * A WAITING edit paints. A HELD edit does not — a held edit shows what the
 * Sheet holds and lives only in the Queue window. Otherwise a floor could
 * read 18/18 Complete off an edit that will never land.
 *
 * A job's paint is removed when, and only when, the server answers ok.
 */
function paintedStatus(projectId, unitKey, itemKey, stored) {
  var job = Store.job(itemJobKey(projectId, unitKey, itemKey));
  if (job && job.kind === 'item' && !job.held) return job.progress;
  return stored;
}


/**
 * Counts OPEN records in a building copy.
 *
 * filter.unit  — one unit
 * filter.phase — one phase
 * filter.item  — one item. Pass '' to count records attached to a WHOLE
 *                PHASE, which is the only case where the item is blank.
 *
 * Fixed and Cancelled records never count. They still travel in the copy,
 * because they feed the suggestion chips and the 0.3 Archive window.
 *
 * IT COUNTS THE PAINTED LIST, not the stored one, so a record logged with
 * no signal flags its item at once. A held record is not painted and does
 * not count — the same rule an item edit follows.
 */
function countFlags(copy, filter) {
  var out  = { deficiency: 0, waiting: 0 };
  var want = filter || {};

  paintedRecords(copy).forEach(function (record) {
    if (record.state !== 'Open') return;
    if (want.unit  !== undefined && record.unit  !== want.unit)  return;
    if (want.phase !== undefined && record.phase !== want.phase) return;
    if (want.item  !== undefined && record.item  !== want.item)  return;

    if (record.type === 'Waiting') out.waiting += 1;
    else if (record.type === 'Deficiency') out.deficiency += 1;
  });

  return out;
}


/** What one item's Progress control must show. Painted, then downgraded. */
function itemStatus(copy, unitKey, itemKey) {
  var stored  = ((copy.status || {})[unitKey] || {})[itemKey] || 'not_started';
  var painted = paintedStatus(copy.id, unitKey, itemKey, stored);
  var flags   = countFlags(copy, { unit: unitKey, item: itemKey });
  return displayStatus(painted, flags.deficiency + flags.waiting);
}


/** Every item of one unit, as the screen must show them. */
function unitItemStatuses(copy, unitKey) {
  var out = [];
  (copy.phases || []).forEach(function (phase) {
    phase.items.forEach(function (item) {
      out.push(itemStatus(copy, unitKey, item.key));
    });
  });
  return out;
}


/** The same items, counted phase by phase, for the bar. */
function unitPhaseCounts(copy, unitKey) {
  return (copy.phases || []).map(function (phase) {
    var done = 0;
    phase.items.forEach(function (item) {
      if (itemStatus(copy, unitKey, item.key) === 'complete') done += 1;
    });
    return { key: phase.key, done: done, total: phase.items.length };
  });
}


/** One unit's rollup. It counts ITEMS. */
function unitRollup(copy, unitKey) {
  var roll = rollupOf(unitItemStatuses(copy, unitKey), countFlags(copy, { unit: unitKey }));
  roll.phases = unitPhaseCounts(copy, unitKey);
  return roll;
}


/**
 * Adds up phase breakdowns from a list of rollups, phase by phase.
 *
 * Used at every level above the unit. Order comes from the first rollup
 * that has one, so the bar reads left to right in phase order whatever the
 * units happen to hold.
 */
function sumPhaseCounts(rolls) {
  var order = [];
  var byKey = {};

  rolls.forEach(function (roll) {
    if (!roll || !roll.phases) return;
    roll.phases.forEach(function (phase) {
      if (!byKey[phase.key]) {
        byKey[phase.key] = { key: phase.key, done: 0, total: 0 };
        order.push(phase.key);
      }
      byKey[phase.key].done  += phase.done;
      byKey[phase.key].total += phase.total;
    });
  });

  return order.length ? order.map(function (key) { return byKey[key]; }) : null;
}


/**
 * Every unit's rollup in one pass, keyed by unit key.
 *
 * The Building screen needs each unit twice — once for its chip and once
 * inside its floor's total — so it works them out once and passes them
 * down.
 */
function unitRollups(copy) {
  var out = {};
  (copy.groups || []).forEach(function (group) {
    group.units.forEach(function (unit) {
      out[unit.key] = unitRollup(copy, unit.key);
    });
  });
  return out;
}


/**
 * One floor's rollup. ITS VERDICT AND ITS COUNT ARE IN UNITS.
 *
 * Every count above the Unit screen is units: a floor reads "5/12 Units
 * done", never "148/216 Items".
 *
 * The bar is the one exception, and it is why the item totals are added up
 * here as well. See rollup() for the reason.
 */
function groupRollup(group, rolls) {
  var complete   = 0;
  var notStarted = 0;
  var itemsDone  = 0;
  var itemsTotal = 0;
  var flags      = { deficiency: 0, waiting: 0 };

  group.units.forEach(function (unit) {
    var roll = rolls[unit.key];
    if (!roll) return;
    if (roll.status === 'complete') complete += 1;
    else if (roll.status === 'not_started') notStarted += 1;

    // A unit rollup counts items, so its done and total ARE the item pair.
    itemsDone  += roll.itemsDone;
    itemsTotal += roll.itemsTotal;

    flags.deficiency += roll.deficiency;
    flags.waiting    += roll.waiting;
  });

  return rollup({
    total:      group.units.length,
    complete:   complete,
    notStarted: notStarted,
    itemsDone:  itemsDone,
    itemsTotal: itemsTotal,
    phases:     sumPhaseCounts(group.units.map(function (unit) { return rolls[unit.key]; }))
  }, flags);
}


/**
 * A whole building's rollup, from the numbers list-projects sends.
 *
 * The server sends counts and no verdict, and this is where the phone
 * applies the rule to them. unitsNotStarted is the fifth number: without
 * it, "every unit Not Started" and "some unit In Progress" both arrive as
 * unitsDone 0 and cannot be told apart.
 *
 * itemsDone and itemsTotal are the sixth and seventh, and they only feed
 * the bar. They are passed straight through, undefined included: a phone
 * holding a stored list from before the backend sent them gets undefined
 * here, and rollup() falls back to the unit pair. So an old copy draws the
 * old bar rather than no bar, and the next successful fetch fixes it.
 */
function projectRollup(project) {
  return rollup({
    total:      project.unitsTotal || 0,
    complete:   project.unitsDone  || 0,
    notStarted: project.unitsNotStarted || 0,
    itemsDone:  project.itemsDone,
    itemsTotal: project.itemsTotal,

    // The eighth number, added for the phase-coloured bar. Passed straight
    // through, undefined included: a stored list from before the backend
    // sent it draws the plain one-colour bar rather than no bar at all.
    phases:     project.phaseCounts
  }, {
    deficiency: project.deficiencies || 0,
    waiting:    project.waiting || 0
  });
}


/** Finds one unit inside a building copy, with the floor it sits on. */
function findUnit(copy, unitKey) {
  var found = null;
  (copy.groups || []).forEach(function (group) {
    group.units.forEach(function (unit) {
      if (unit.key === unitKey) found = { unit: unit, group: group };
    });
  });
  return found;
}


/* ── DRAWING HELPERS ──────────────────────────────────────────────── */

/** Makes text safe to place inside HTML. */
function escapeHtml(text) {
  return String(text === null || text === undefined ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Turns a label into the same key the backend makes. */
function slugify(text) {
  var out = String(text).toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return out || 'item';
}

/** Copies the keys of one object onto another. */
function assign(target, source) {
  Object.keys(source || {}).forEach(function (key) { target[key] = source[key]; });
  return target;
}

/** Reads one value out of the page address. */
function param(name) {
  var found = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return found ? decodeURIComponent(found[1].replace(/\+/g, ' ')) : '';
}

/**
 * A status badge. It takes what rollup() returns, not a status string.
 * size is '', 'md', 'sm' or 'xs'.
 *
 * A group holding nothing reads as a dash. It is not Not Started — there
 * is nothing there to start.
 */
function pillHtml(roll, size) {
  var key   = (roll && roll.status) || 'none';
  var empty = (key === 'none');
  var cls   = empty ? 's-none' : 's-' + safeStatus(key);
  var label = empty ? '—' : STATUS[safeStatus(key)].label;

  return '<span class="pill' + (size ? ' pill--' + size : '') + ' ' + cls + '">' +
           '<span class="dot"></span>' +
           '<span class="txt">' + label + '</span>' +
         '</span>';
}

/**
 * The Progress dot on its own — a ROUND DOT, and only ever Progress.
 * A flag never takes this shape and never takes this place.
 */
function dotHtml(roll) {
  var key = (roll && roll.status) || 'none';
  return '<span class="dot-only ' + (key === 'none' ? 's-none' : 's-' + safeStatus(key)) + '"></span>';
}


/**
 * The hairline progress bar on the bottom edge of a unit chip, a floor
 * header, a Tracking row, or under the pill on the Unit screen.
 *
 * IT FILLS BY ITEMS AT EVERY LEVEL, never by whole units. A floor of
 * twelve units each half built has no unit finished, so filling by units
 * drew nothing there and nothing on the building above it. See rollup().
 *
 * A GROUP WITH NOTHING DONE DRAWS NO BAR AT ALL, not an empty track. An
 * empty track and a missing bar say the same thing, and the missing one
 * costs no ink.
 *
 * A 60px bar cannot tell 15/18 from 16/18. That is accepted: the chip is a
 * target, and the exact number is on the Unit screen.
 */
function barHtml(roll) {
  if (!roll || !roll.itemsTotal || !roll.itemsDone) return '';

  var runs = phaseRunsHtml(roll);
  if (runs) return '<span class="bar">' + runs + '</span>';

  // No breakdown to draw with — a stored list from before the backend sent
  // one. One fill, one colour, exactly as it was.
  var pct = Math.round((roll.itemsDone / roll.itemsTotal) * 100);
  return '<span class="bar"><span class="bar-fill s-' + safeStatus(roll.status) + '" ' +
         'style="width:' + pct + '%"></span></span>';
}


/**
 * THE FILL, CUT INTO ONE RUN PER PHASE, LAID END TO END.
 *
 * Miguel's report: a unit with Phase 1 entirely finished still drew one
 * amber bar part way along, which says "some work is done" and hides the
 * fact that a whole phase is closed. A bar cannot say which third is
 * finished when it only has one colour.
 *
 * SO EVERY PHASE CONTRIBUTES A RUN AS LONG AS THE ITEMS IT HAS FINISHED,
 * and the runs BUTT UP AGAINST EACH OTHER. There are no slots and no gaps:
 * a phase that is half done does not leave the other half as a hole for
 * the next phase to start after. Miguel set that rule himself — "if P3 has
 * data logged that third should stick at the tail end of P2" — and it is
 * what keeps the thing reading as one bar. Two amber phases in a row are
 * indistinguishable from one longer amber run, which is the point.
 *
 * A run is GREEN when its phase is wholly complete and AMBER while it is
 * part way. So the finished phases are a solid green block on the left,
 * and everything still moving is the amber that follows.
 *
 * The total filled width is unchanged: the runs add up to itemsDone, which
 * is what the single fill was. Only the colouring is new.
 *
 * EVERY JOIN CARRIES A SEAM, and that reverses the first rule this function
 * shipped with. It said two amber phases in a row must read as one bar. On
 * a whole building that hid the split completely: Elsliger 36-B stood at
 * 115/144, 8/72 and 48/252, so all three runs were amber and butted into
 * one amber block, identical to the old single fill. A phase only turns
 * green at 100%, and a building rarely closes one until the end, so the
 * split could not show at the level Miguel looks at most.
 *
 * THE SEAM IS DRAWN INSIDE THE RUN, as an inset shadow on its right edge,
 * not as a spacer between runs. A spacer would add its own pixels and make
 * the fill read longer than itemsDone. This way the arithmetic above stays
 * exactly true — the bar still ends where progress ends.
 *
 * The last drawn run gets no seam. It is the leading edge of progress, and
 * a cut there would read as a gap in front of the empty track.
 *
 * A phase with nothing done draws no run, so it contributes no seam either.
 * Phase 1 and Phase 3 with an empty Phase 2 between them show ONE seam,
 * which is correct: there is one boundary you can see.
 *
 * Answers '' when there is no breakdown, or when it is a single phase — at
 * one phase this is the old bar with extra markup.
 */
function phaseRunsHtml(roll) {
  var phases = roll.phases || [];
  if (phases.length < 2) return '';

  // Which phases actually draw. Worked out first, because a run needs to
  // know whether it is the last one before it can decide on its seam.
  var drawn = phases.filter(function (phase) { return phase.done > 0; });

  return drawn.map(function (phase, index) {
    var pct  = (phase.done / roll.itemsTotal) * 100;
    var full = (phase.total > 0 && phase.done === phase.total);
    var seam = (index < drawn.length - 1) ? ' bar-fill--seam' : '';

    return '<span class="bar-fill s-' + (full ? 'complete' : 'in_progress') + seam + '" ' +
                 'style="width:' + pct.toFixed(3) + '%"></span>';
  }).join('');
}


/**
 * "5/12 Units done". Above the Unit screen the noun is always units.
 *
 * The done number leads, because that is the one being read. "12 units ·
 * 5 done" made a person read the whole line to find it.
 */
function countText(roll, one, many) {
  if (!roll || !roll.total) return 'No ' + many;
  return roll.done + '/' + roll.total + ' ' + (roll.total === 1 ? one : many) + ' done';
}


/** One flag chip: the glyph, then its own count. */
function flagChipHtml(kind, count) {
  var flag = FLAGS[kind];
  if (!flag || !count) return '';
  return '<span class="flag ' + flag.cls + '" aria-hidden="true">' +
           ICON.flag + '<span class="flag-n">' + count + '</span>' +
         '</span>';
}


/**
 * The chip for edits this phone could not save.
 *
 * A CORNER BADGE WITH AN EXCLAMATION MARK, never a plain red dot. A failed
 * save and a Deficiency are both red, so they are kept apart by shape and
 * by place: the flag is a glyph inside the row, the badge hangs off the
 * top right corner, outside the chip.
 */
function notSavedChipHtml(count) {
  if (!count) return '';
  return '<span class="not-saved" aria-hidden="true">' +
           '<span class="not-saved-mark">!</span>' +
           '<span class="not-saved-txt">' + count + ' not saved</span>' +
         '</span>';
}


/**
 * The chip for edits still on their way — sending or waiting for signal.
 *
 * AN OFFLINE GLYPH, NEVER A PLAIN DOT, so it cannot be mistaken for the
 * not-saved badge at a glance. It is not red — red means a refusal, and a
 * queued edit has not been refused. It hangs off the opposite corner of a
 * chip from the not-saved badge, so both can show on the same chip at once
 * without landing on top of each other.
 */
function queuedChipHtml(count) {
  if (!count) return '';
  return '<span class="queued" aria-hidden="true">' +
           '<span class="queued-mark">' + ICON.offline + '</span>' +
           '<span class="queued-txt">' + count + ' queued</span>' +
         '</span>';
}


/**
 * The mark beside one queued edit, on a row.
 *
 * IT ONLY TURNS WHILE SOMETHING IS ACTUALLY GOING OUT. Standing in a
 * basement the ring used to spin for ever, two lines under a bar reading
 * `Offline`, and a spinner that never stops says "working" while nothing
 * is working. Waiting gets a still ring — the same rule the sync bar
 * already follows with its turning ring and its still slab.
 *
 * held  — the edit was refused and a person has to look. A still red dot.
 */
function queuedRingHtml(held) {
  if (held) return '<span class="ring ring--bad"></span>';
  return '<span class="ring' + (Queue.sending() ? '' : ' ring--wait') + '"></span>';
}


/**
 * The marks line — both flag counts, the not-saved chip and the queued chip.
 *
 * THE MARKS GET A LINE OF THEIR OWN. Left to trail the count they break in
 * a different place on every floor, which reads as a mistake.
 *
 * It returns an empty string when there is nothing wrong, so a clean floor
 * never draws a third line.
 */
function marksHtml(roll, notSaved, queued) {
  var out = flagChipHtml('deficiency', roll.deficiency) +
            flagChipHtml('waiting',    roll.waiting) +
            notSavedChipHtml(notSaved) +
            queuedChipHtml(queued);
  return out ? '<span class="marks">' + out + '</span>' : '';
}


/**
 * Everything the marks say, in words.
 *
 * The marks are shapes and colours, so a screen reader gets nothing from
 * them. Every place that draws marks must put this on the element, or the
 * marks are decoration.
 */
function marksLabel(name, roll, notSaved, queued) {
  var parts = [name];

  if (!roll.total) {
    parts.push('nothing to track');
  } else {
    parts.push((roll.status === 'none') ? 'no status' : STATUS[safeStatus(roll.status)].label);
    parts.push(roll.done + ' of ' + roll.total + ' done');
  }

  if (roll.deficiency) parts.push(roll.deficiency + ' ' + (roll.deficiency === 1 ? 'deficiency' : 'deficiencies'));
  if (roll.waiting)    parts.push(roll.waiting + ' waiting');
  if (notSaved)        parts.push(notSaved + ' ' + (notSaved === 1 ? 'edit' : 'edits') + ' not saved');
  if (queued)          parts.push(queued + ' ' + (queued === 1 ? 'edit' : 'edits') + ' queued');

  return parts.join(', ');
}


/** "Tue 2:14 PM", for the line that says how old a copy is. */
function whenText(ms) {
  if (!ms) return '';
  var when = new Date(ms);
  var day  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][when.getDay()];
  var hour = when.getHours();
  var half = hour < 12 ? 'AM' : 'PM';
  var show = hour % 12;
  if (show === 0) show = 12;
  return day + ' ' + show + ':' + ('0' + when.getMinutes()).slice(-2) + ' ' + half;
}


/* ── ICONS ────────────────────────────────────────────────────────── */
/* Inline SVG only. No icon font and no emoji, so nothing extra loads. */

var ICON = {
  back:    '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true"><path d="M10 2L2 10l8 8" stroke="#DE7452" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="M1 1l6 6-6 6" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  caret:   '<svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true"><path d="M1 1l6 6 6-6" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  caretSm: '<svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus:    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1v14M1 8h14" stroke="#0D0D0D" stroke-width="2.4" stroke-linecap="round"/></svg>',
  bars:    '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="2" width="14" height="3" rx="1" fill="#0D0D0D"/><rect x="1" y="7" width="14" height="3" rx="1" fill="#0D0D0D"/><rect x="1" y="12" width="9" height="3" rx="1" fill="#0D0D0D"/></svg>',
  tick:    '<svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1" stroke="#0D0D0D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  success: '<svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true"><path d="M1 9l7 7L23 1" stroke="#4CAF6D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close:   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" stroke-linecap="round"/></svg>',

  /* The flag. currentColor, so one glyph serves both flag kinds and the
     chip's own class picks the red or the blue. */
  flag:    '<svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true"><path d="M1 10.5V1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M1.9 1.2h5.6L6.1 3.4l1.4 2.2H1.9z" fill="currentColor"/></svg>',

  /* The same flag at Hub-card size, for the Logging card. */
  flagBig: '<svg width="15" height="17" viewBox="0 0 9 11" fill="none" aria-hidden="true"><path d="M1 10.5V1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M1.9 1.2h5.6L6.1 3.4l1.4 2.2H1.9z" fill="currentColor"/></svg>',

  /* A wifi symbol with a slash — the queued-edit mark. currentColor, so
     the badge's own background sets the colour.

     It was signal bars with a dash across them, and Miguel read it as
     "weird": three bars is a strength meter, so a full-height bar next to
     a slash says two things at once. Arcs and a dot is the shape a phone
     already uses for this, and the slash is the half that means none. */
  offline: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">' +
             '<path d="M0.9 3.7a6 6 0 0 1 8.2 0" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
             '<path d="M2.7 5.6a3.4 3.4 0 0 1 4.6 0" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
             '<circle cx="5" cy="8" r="1.05" fill="currentColor"/>' +
             '<path d="M1.2 1.2l7.6 7.6" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
           '</svg>'
};

/** The back button in a screen header. */
function backHtml(href, label) {
  return '<a class="hdr-back press" href="' + href + '" aria-label="' + escapeHtml(label || 'Go back') + '">' +
         ICON.back + '</a>';
}


/* ── MESSAGE STATES ───────────────────────────────────────────────── */

/** The block shown while data loads. */
function loadingHtml(text) {
  return '<div class="state"><div class="spinner"></div>' +
         '<div class="state-text">' + escapeHtml(text || 'Loading…') + '</div></div>';
}

/**
 * Writes the technical half of a failure to the browser console.
 *
 * THREE FAILURES CAN REACH A CREW PHONE THAT NO CREW MEMBER CAN ACT ON.
 * Each one gets one plain sentence and a short code, E1 to E3, so a worker
 * can read the code down the phone without opening anything. The reason
 * itself — a deployment setting, an empty address, a status code — belongs
 * to whoever set the app up, so it goes here instead. The console is the
 * hidden log every browser keeps. It costs nothing and no crew member will
 * ever open it.
 */
function logTechnical(code, text) {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('PFC Control ' + code + ' — ' + text);
  }
}

/**
 * Turns a failure reason into a sentence a person can act on.
 *
 * NOTHING ELSE GETS A CODE. Offline, a slow server and a message the
 * backend wrote itself all tell the crew what to do already, and a code on
 * those reads as though something is wrong when nothing is.
 */
function reasonText(reason, detail) {
  switch (reason) {
    case 'not-configured':
      logTechnical('E1', 'API_URL is empty. Paste the web app address into API_URL in control/shared/common.js.');
      return 'This app is not set up yet. Tell the Admin. (E1)';

    case 'offline':
      return 'This phone has no connection. The app opened from its saved copy. Move to a spot with signal, then try again.';

    case 'timeout':
      return 'The server did not answer in time. The signal here may be weak. Try again.';

    case 'blocked':
      logTechnical('E2', detail ||
        'The browser could not read the reply. Check that the web app is deployed with access set to Anyone.');
      return 'This app cannot reach the server. Tell the Admin. (E2)';

    // A reply the backend WROTE. It is a sentence aimed at a person, so it
    // goes on the screen as it is. Only the empty case falls back to E2.
    case 'server':
      if (detail) return detail;
      logTechnical('E2', 'The server refused the request and gave no reason.');
      return 'This app cannot reach the server. Tell the Admin. (E2)';

    default:
      if (detail) return detail;
      logTechnical('E2', 'Unknown failure. reason=' + reason);
      return 'This app cannot reach the server. Tell the Admin. (E2)';
  }
}

/** The block shown when a load fails. */
function errorHtml(reason, detail) {
  return '<div class="state">' +
           '<div class="state-title">Unable to load</div>' +
           '<div class="state-text">' + escapeHtml(reasonText(reason, detail)) + '</div>' +
           '<button class="btn btn-ghost press" style="max-width:200px" onclick="window.location.reload()">Try again</button>' +
         '</div>';
}

/*
   staleNoteHtml used to live here — a banner of its own saying "Offline.
   Last updated Sun 1:22 AM." It was the third stacked bar on the screen,
   and being an argument to render() it was painted over by the next
   redraw. Both are fixed by markStale() down in the sync bar section,
   which owns that line now.
*/

/**
 * The phone refused to store an edit.
 *
 * THIS IS THE ONLY FAILURE THE OUTBOX CANNOT CATCH. Everything else about
 * a bad connection is a retry, and a retry needs an edit that was written
 * down. This one was not, so the person has to be told at once, while they
 * still remember what they tapped.
 *
 * It happens when the phone's storage is full, or when the browser is in
 * private mode and refuses storage outright.
 */
function storageFullHtml() {
  return '<div class="banner banner--bad"><div><b>Not stored.</b> ' +
         'This phone has no room to save the change. ' +
         'Free space on the phone, then set the value again.' +
         '</div></div>';
}


/** No copy, no signal. The one thing the person can do is in the sentence. */
function noCopyHtml() {
  return '<div class="state">' +
           '<div class="state-title">No copy on this phone</div>' +
           '<div class="state-text">Connect and open it once. After that it opens with no signal.</div>' +
           '<button class="btn btn-ghost press" style="max-width:200px" ' +
                   'onclick="window.location.reload()">Try again</button>' +
         '</div>';
}


/* ── PULL TO REFRESH ──────────────────────────────────────────────── */

/**
 * Pull the screen down from the top to fetch again.
 *
 * There is no refresh timer anywhere in this app, so this and opening a
 * screen are the only two ways a fetch happens. It has to be here.
 *
 * onRefresh returns a Promise. The arrow turns while it runs.
 */
/* ── THE REFRESH RING ─────────────────────────────────────────────────
   ONE RING, AND TWO THINGS START IT: a pull, and a fetch the screen
   started by itself.

   The second one is the point. Every screen draws its stored copy at once
   and asks the server behind it, and until now nothing said the asking
   was happening. Old numbers sitting still, with no sign anything is
   working, reads as an app that has stopped — which is exactly what
   Miguel reported after the step 4 round.

   IT COUNTS, IT DOES NOT FLAG. Buildings can be fetching its list while a
   pull is draining the queue, and the first one to finish must not stop
   the ring the other one is still using.

   IT IS BUILT ON DEMAND. A screen that never fetches and never enables the
   pull never grows the element.
*/
var refreshRing  = null;
var refreshCount = 0;

function refreshIndicator() {
  if (!refreshRing) {
    refreshRing = document.createElement('div');
    refreshRing.className = 'ptr';
    refreshRing.innerHTML = '<span class="ptr-ring"></span>';
    document.body.appendChild(refreshRing);
  }
  return refreshRing;
}

function startRefreshRing() {
  refreshCount += 1;
  var ring = refreshIndicator();
  ring.style.transform = '';         // drop any leftover finger offset
  ring.classList.add('on', 'spin');
}

function stopRefreshRing() {
  refreshCount = Math.max(0, refreshCount - 1);
  if (refreshCount) return;
  refreshIndicator().classList.remove('on', 'spin');
}


function enablePullToRefresh(onRefresh) {
  var TRIGGER = 70;      // how far down to pull, in pixels
  var MAX     = 110;     // how far the screen follows the finger

  var indicator = refreshIndicator();

  var startY  = 0;
  var pulling = false;
  var running = false;
  var pulled  = 0;

  document.addEventListener('touchstart', function (event) {
    if (running || event.touches.length !== 1) return;
    // Only from the very top. Otherwise this fights normal scrolling.
    if (window.scrollY > 0) return;
    startY  = event.touches[0].clientY;
    pulling = true;
    pulled  = 0;
  }, { passive: true });

  document.addEventListener('touchmove', function (event) {
    if (!pulling) return;
    pulled = Math.min(event.touches[0].clientY - startY, MAX);
    if (pulled <= 0) { indicator.style.transform = ''; indicator.classList.remove('on'); return; }
    indicator.style.transform = 'translateY(' + pulled + 'px)';
    indicator.classList.toggle('on', pulled >= TRIGGER);
  }, { passive: true });

  document.addEventListener('touchend', function () {
    if (!pulling) return;
    pulling = false;
    indicator.style.transform = '';

    if (pulled < TRIGGER) { indicator.classList.remove('on'); return; }

    // The pull holds a count of its own on the shared ring, so a fetch
    // that finishes mid-pull cannot stop it early.
    running = true;
    startRefreshRing();

    function done() { running = false; stopRefreshRing(); }
    Promise.resolve(onRefresh()).then(done, done);
  });
}

/* ── THE SYNC BAR ─────────────────────────────────────────────────── */
/*
   ONE LINE UNDER THE HEADER, AND THE COUNT LIVES NOWHERE ELSE. No badge
   on the Hub, no waiting count in the tree.

   IT APPEARS ONLY WHEN THE OUTBOX HOLDS SOMETHING. A landed edit says
   nothing at all: the ring stops and the bar goes. There is no "Saved"
   flash and no permanent "All saved" strip, because a band of screen that
   says nothing is happening is a band of screen wasted.

   THE BAR RIDES ON EVERY TRACKER SCREEN, UNIT INCLUDED. On Unit a failure
   is therefore said twice, once here and once in the fix card under the
   item. That is the price of the thing it buys: standing in unit 204, an
   edit that failed in unit 201 has no other way to reach you.
*/

/*
   THE AGE OF THE COPY RIDES ON THIS BAR TOO. IT IS NOT A BAR OF ITS OWN.

   It used to be, and a screen ended up with three stacked bars: the page
   header, the sync bar, and "Offline. Last updated Sun 1:22 AM." under
   both. Merged, there are never more than two.

   IT IS STATE, NOT AN ARGUMENT TO A DRAW. The old line was passed into
   render(), so the next redraw — a queue change, a landed edit, anything —
   painted over it and it vanished after a few seconds. That is the whole
   "shows for 5 secs and then disappears" report. Held here instead, it
   survives every redraw and leaves only when a fetch succeeds.
*/
var syncStale = { on: false, fetchedAt: 0 };

/** Every mounted bar's own paint function. */
var syncBarPainters = [];

function repaintSyncBars() {
  syncBarPainters.forEach(function (fn) {
    try { fn(); } catch (e) {}    // one broken screen must not stop the rest
  });
}

/**
 * A fetch failed and a stored copy is on screen. Say how old it is.
 *
 * The app never warns that a copy MIGHT be old. It warns only when a fetch
 * FAILS, and then it says exactly how old, so the person on site can judge
 * it. There is no staleness clock and no refresh timer: a fetch that
 * succeeds makes the copy fresh by definition.
 */
function markStale(fetchedAt) {
  syncStale = { on: true, fetchedAt: fetchedAt || 0 };
  repaintSyncBars();
}

/** A fetch landed. The copy is fresh, so the line goes. */
function markFresh() {
  if (!syncStale.on) return;
  syncStale = { on: false, fetchedAt: 0 };
  repaintSyncBars();
}


/**
 * Puts the bar under the page header and keeps it in step with the shelf.
 *
 * href is the Queue window, relative to the calling screen. Pass '' on
 * the Queue screen itself, so it does not offer a door to where you are.
 */
function mountSyncBar(href) {
  var slot = document.createElement('div');
  slot.className = 'syncbar-slot';

  var header = document.querySelector('header.hdr');
  if (header && header.parentNode) header.parentNode.insertBefore(slot, header.nextSibling);
  else document.body.insertBefore(slot, document.body.firstChild);

  var to = (href === undefined) ? 'queue.html' : href;

  function paint() { slot.innerHTML = syncBarHtml(to); }

  Queue.onChange(paint);
  syncBarPainters.push(paint);
  paint();
  return slot;
}


/**
 * Everything the app has to say about saving and about signal, in one bar.
 *
 * Four facts share it: what is going out, what is waiting, what did not
 * make it, and how old the copy on screen is.
 *
 *   Saving 3 edits…            a call is in the air
 *   Offline · 3 edits queued   nothing can go out yet
 *   2 edits did not save       the app gave up and a person must look
 *   updated 1:22 AM            the last fetch failed; this is the copy's age
 *
 * The first three share the top line, joined by a dot. The fourth takes a
 * second line UNDER them, because it is a fact about the screen rather than
 * about the edits, and because three facts and a timestamp on one line
 * wrap on a phone.
 *
 * The three shapes Miguel settled on:
 *
 * The mark in front of the word Offline is the crossed-bars glyph, the same
 * one a queued chip carries. It was a plain grey slab until the step 4 fix
 * round: the slab means "waiting", which is right for `3 edits queued` on a
 * phone that has signal, and wrong for a phone that has none.
 *
 *   offline, nothing queued    ▨ Offline · updated 1:22 AM
 *   offline, three queued      ▨ Offline · 3 edits queued
 *                                updated 1:22 AM      Queue ›
 *   online, nothing queued     no bar at all
 *
 * With nothing queued the age joins the top line rather than starting a
 * second one, because a bar holding one short line and one shorter line is
 * two lines of screen buying one line of news.
 */
function syncBarHtml(href) {
  var counts = Queue.counts();
  var stale  = syncStale.on;

  if (!counts.waiting && !counts.held && !stale) return '';

  var parts = [];
  var kind  = 'quiet';

  if (counts.waiting) {
    if (Queue.sending()) {
      kind = 'accent';
      parts.push('<span class="sync-ring"></span>Saving ' + editsText(counts.waiting) + '…');
    } else if (navigator.onLine === false || stale) {
      parts.push('<span class="sync-off">' + ICON.offline + '</span>Offline · ' +
                 editsText(counts.waiting) + ' queued');
    } else {
      // Online, between retries. Saying "Offline" here would be a lie.
      parts.push('<span class="sync-slab"></span>' + editsText(counts.waiting) + ' queued');
    }
  }

  if (counts.held) {
    kind = 'bad';
    parts.push('<span class="sync-bad"></span>' +
               (counts.waiting ? counts.held + ' did not save'
                               : editsText(counts.held) + ' did not save'));
  }

  var when = stale ? whenText(syncStale.fetchedAt) : '';

  // Offline with an empty queue. One line, and the age sits on the end of
  // it. There is nothing on the shelf, so there is no door to the Queue.
  if (!parts.length) {
    return '<div class="syncbar syncbar--quiet">' +
             '<div class="sync-row">' +
               '<span class="sync-text"><span class="sync-off">' + ICON.offline + '</span>Offline' +
                 (when ? '<span class="sync-sep">·</span>updated ' + escapeHtml(when) : '') +
               '</span>' +
             '</div>' +
           '</div>';
  }

  var link = href ? '<a class="sync-link press" href="' + href + '">Queue ›</a>' : '';

  return '<div class="syncbar syncbar--' + kind + '">' +
           '<div class="sync-row">' +
             '<span class="sync-text">' + parts.join('<span class="sync-sep">·</span>') + '</span>' +
             (stale ? '' : link) +
           '</div>' +
           (stale
             ? '<div class="sync-row sync-row--sub">' +
                 '<span class="sync-when">' + (when ? 'updated ' + escapeHtml(when) : 'no signal') + '</span>' +
                 link +
               '</div>'
             : '') +
         '</div>';
}


function editsText(n) {
  return n + (n === 1 ? ' edit' : ' edits');
}


/* ── OFFLINE SHELL ────────────────────────────────────────────────── */

/**
 * Registers the Service Worker, which keeps a copy of the app's own files.
 * The app then opens on site with no signal. Data still needs a connection.
 *
 * A Service Worker needs https or localhost. Opening a file directly from
 * the disk does not work, and that is fine. The app still runs, without
 * the saved copy.
 */
(function registerWorker() {
  if (!('serviceWorker' in navigator)) return;

  // Works out the control/ folder from this script's own address.
  var here = document.currentScript ? document.currentScript.src : '';
  var base = here.replace(/shared\/common\.js.*$/, '');
  if (!base) return;

  // True when a Service Worker was already running this page. On the very
  // first visit it is false, and the reload below must not fire.
  var hadWorker = !!navigator.serviceWorker.controller;
  var reloading = false;

  /*
   * A new Service Worker takes over only after it has saved the new files.
   * The page on screen is still drawn from the old ones, so reload once.
   *
   * Safe with the offline queue that version 0.2 adds: a queued edit lives
   * in localStorage, which a reload does not touch.
   */
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadWorker || reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register(base + 'sw.js', { scope: base })
      .then(function (registration) {
        /*
         * Ask the server for a new sw.js on every open.
         *
         * Without this the phone decides for itself when to look, and iOS
         * can sit on an old worker for days. GitHub Pages sends sw.js with
         * max-age=600, which makes that worse. update() asks every time.
         */
        registration.update();
      })
      .catch(function () {
        // No offline copy. Everything else keeps working.
      });
  });
})();
