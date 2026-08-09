/* =====================================================================
   PFC CONTROL — shared logic
   =====================================================================
   Every screen loads this file. It holds:
     - the connection to the Apps Script backend
     - the three Progress values, the two flag kinds, and the rollup rule
     - the local copy on the phone, and the outbox of unsent edits
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

  return {
    status:     status,
    done:       complete,
    total:      total,
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
 * Admin loads it into the new project form, sends it up in the create
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
    items: ['Interior Doors', 'Exterior Door(s)', 'Windows', 'Attic Hatch',
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
 * Add-only once the building exists. Admin can add a reason and there is
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
 *   types — the Subtype dropdown. Four items define one. Every other item
 *           defines none and shows no dropdown at all.
 *   trim  — the reasons this item does NOT offer, matched exactly against
 *           DEFAULT_REASONS. Empty offers all eight.
 *   hint  — grey placeholder text inside the empty needed box.
 *
 * Other is NOT in a types list. Logger adds it to the bottom of the
 * dropdown itself, where it opens a text box. The typed text goes in that
 * one record's subtype cell and never joins the list — a one-off stays a
 * one-off, and making it permanent is an Admin Add.
 *
 * Every trim ships empty on purpose. An empty trim is never wrong, only
 * wider than it needs to be, and Miguel narrows them through the Admin
 * Lists card without a release. The test is responsibility, not the item:
 * ask "does PFC own this", not "can this item have this". The framer hangs
 * the patio and entry doors, so Wrong Swing comes off Exterior Door(s)
 * even though the door plainly swings.
 *
 * Only the hint Miguel gave is filled in. A blank hint is never wrong,
 * only less helpful, and Admin fills one in without a release too.
 */
var DEFAULT_ITEM_LISTS = {
  'Interior Doors': {
    types: ['Regular', 'Bypass', 'Bi-fold', 'Double', 'Pocket',
            'Double Pocket', 'Dwarf', 'Unit Door'],
    trim:  [],
    hint:  'Size   Jamb   Swing'
  },
  'Exterior Door(s)': { types: ['Patio', 'Entry'],                        trim: [], hint: '' },
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
 * instead. Only the outbox drain passes it. The fallback puts the whole
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
        return { ok: false, reason: 'server', detail: 'The server replied ' + response.status + '.' };
      }
      return response.json().then(function (body) {
        if (body && body.success === false) {
          return { ok: false, reason: 'server', detail: body.error || 'The server refused the request.' };
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
        return resolve({ ok: false, reason: 'server', detail: body.error || 'The server refused the request.' });
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
   * screen paints a waiting edit out of the outbox, not out of the copy,
   * and the job leaves the outbox the moment the server answers ok. So the
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
   * unlike the outbox, which holds the only copy of an unsent edit.
   */
  foldLanded: function (id, jobs) {
    var held = this.read('project.' + id, null);
    if (!held || !held.data) return;

    var copy    = held.data;
    var touched = false;

    copy.status = copy.status || {};
    jobs.forEach(function (job) {
      // BUILD NOTE, step 4: a landed RECORD needs the same fold, into
      // copy.records by record_id. Nothing creates one until Logger ships,
      // so it is not written here — but the bug is identical. A saved
      // record would vanish off the screen until the next fetch.
      if (job.kind !== 'item') return;
      copy.status[job.unitKey] = copy.status[job.unitKey] || {};
      copy.status[job.unitKey][job.itemKey] = job.progress;
      touched = true;
    });

    if (touched) this.write('project.' + id, { data: copy, fetchedAt: held.fetchedAt || 0 });
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
   * lives in the outbox under its own key, so nothing is lost here.
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
   * The edit itself is safe either way — it lives in the outbox — but the
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


  /* -- the outbox ---------------------------------------------------- */
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
     the Sheet holds and lives only in the Outbox window, because a floor
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

    if (this.writeJobs(all)) { Outbox.changed(); return true; }

    /*
       IT WAS NOT STORED, SO IT MUST NOT PAINT. A job held in memory and
       not on disk is the worst state this app can be in: the screen shows
       the value, the person walks away, and the next time the app opens it
       is gone with nothing to show it was ever there. Put the shelf back
       the way it was and let the caller report it.
    */
    if (before) all[job.key] = before; else delete all[job.key];
    this._jobs = all;
    Outbox.changed();
    return false;
  },

  /**
   * THE OUTBOX OUTRANKS EVERY BUILDING COPY.
   *
   * Ten building copies are about a megabyte, and they are what fills the
   * phone. A copy is ONLY a copy — the Sheet holds it and opening the
   * building once brings it back. AN UNSENT EDIT EXISTS NOWHERE ELSE ON
   * EARTH. So when storage refuses the outbox, copies are deleted to make
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
    Outbox.changed();
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


/**
 * Folds a building's needed lines into the chip history, in the same step
 * that deletes its copy.
 *
 * 0.2 STEP 4 FILLS THIS IN. It is called from Store.dropProject, which is
 * the only place a copy is deleted, so the fold can never be missed. Until
 * step 4 lands, a dropped building's needed lines are simply gone, and
 * they come back the next time the building is opened.
 *
 * The rule step 4 implements: a building STILL on the phone is counted
 * live from scratch every time, and only a DROPPED building is read from
 * this index. A live building is never written into it — that is what
 * makes cancelling a record take its chip back out exactly.
 */
function foldNeededLinesIntoChips(copy) {
  return copy;
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
var OUTBOX_BACKOFF = [0, 5000, 15000, 60000, 300000];

/**
 * How many failed attempts hold a job. With the backoff above that is
 * about thirty minutes.
 *
 * A JOB IS NEVER DROPPED BY THE APP. Held means it stops painting the
 * screen and waits in the Outbox window, where only a person can Drop it.
 */
var OUTBOX_MAX_TRIES = 10;

/** The server writes at most this many jobs in one call. The rest wait. */
var OUTBOX_BATCH = 100;

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


var Outbox = {

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

    var batch = jobs.slice(0, OUTBOX_BATCH);

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
    var wait = OUTBOX_BACKOFF[Math.min(self._misses, OUTBOX_BACKOFF.length - 1)];
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

  /* -- what a person does in the Outbox window ----------------------- */

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
      return { retry: false, burn: false,
               error: 'This app is newer than the backend. Deploy the script again.' };
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

      // A RETAP WHILE THE CALL WAS IN THE AIR WINS, HERE TOO. If the job
      // under this key is not the one that was sent, the person has set a
      // new value since, and removing by key alone would throw that tap
      // away with nothing to show for it. settleJob guards the failure
      // path the same way. It stays and goes out on the next drain.
      var fresh = Store.job(job.key);
      if (fresh && fresh.at === job.at) Store.removeJob(job.key);
      return;
    }

    if (one) { settleJob(job, one.retry, one.error, true); return; }

    // No result of its own. A whole-call failure covers it. With neither,
    // the server simply did not mention it — leave it waiting.
    if (outcome.fail) {
      settleJob(job, outcome.fail.retry, outcome.fail.error, outcome.fail.burn);
    }
  });

  Object.keys(landed).forEach(function (projectId) {
    Store.foldLanded(projectId, landed[projectId]);
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
    if (fresh.tries >= OUTBOX_MAX_TRIES) fresh.held = true;
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
(function startOutbox() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', function () { Outbox.wake(); });

  // iOS wakes a backgrounded web app without firing online. Coming back to
  // the app is the moment worth trying again.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) Outbox.wake();
  });

  Outbox.wake();
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
  return apiCall('list-projects', {}, 'GET').then(function (result) {
    if (!result.ok) {
      return { source: 'error', reason: result.reason, detail: result.detail };
    }
    var projects = result.data.projects || [];
    Store.setList(projects);
    return { source: 'live', projects: projects };
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
  return apiCall('get-project', { id: projectId }, 'GET').then(function (result) {
    if (!result.ok) {
      return { source: 'error', reason: result.reason, detail: result.detail };
    }
    Store.setProject(projectId, result.data);
    return { source: 'live', data: result.data };
  });
}


/**
 * The project list, for Admin.
 *
 * Admin wants the server's answer and nothing else — it is used on a
 * computer with signal, to change structure, and a stale list there would
 * offer a building that no longer exists. The Tracking screen does not use
 * this: it draws its stored copy first and refreshes behind it.
 */
function loadProjects() {
  return fetchProjects();
}


/**
 * One project's floors, units and item list, for Admin.
 *
 * The phone stopped calling this in 0.2. get-project answers with the
 * whole building instead. Admin still needs the plain structure, and it
 * needs it fresh from the server rather than from a phone copy.
 */
function loadStructure(projectId) {
  return apiCall('get-structure', { id: projectId }, 'GET').then(function (result) {
    if (!result.ok) return { source: 'error', reason: result.reason, detail: result.detail };
    return { source: 'live', data: result.data };
  });
}


/** Creates a project. Admin calls this. */
function createProject(config) {
  return apiCall('create-project', config, 'POST');
}


/** Changes a project's structure. Admin calls this. */
function updateStructure(payload) {
  return apiCall('update-structure', payload, 'POST');
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
 * The building copy and the outbox are separate keys, so A FRESH FETCH CAN
 * NEVER OVERWRITE AN UNSENT EDIT. A fetch replaces the copy only, and the
 * paint happens after it, every time a screen draws.
 *
 * A WAITING edit paints. A HELD edit does not — a held edit shows what the
 * Sheet holds and lives only in the Outbox window. Otherwise a floor could
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
 */
function countFlags(copy, filter) {
  var out  = { deficiency: 0, waiting: 0 };
  var want = filter || {};

  (copy.records || []).forEach(function (record) {
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


/** One unit's rollup. It counts ITEMS. */
function unitRollup(copy, unitKey) {
  return rollupOf(unitItemStatuses(copy, unitKey), countFlags(copy, { unit: unitKey }));
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
 * One floor's rollup. IT COUNTS UNITS, NOT ITEMS.
 *
 * Every count above the Unit screen is units: a floor reads
 * "12 units · 5 done", never "148/216 items".
 */
function groupRollup(group, rolls) {
  var complete   = 0;
  var notStarted = 0;
  var flags      = { deficiency: 0, waiting: 0 };

  group.units.forEach(function (unit) {
    var roll = rolls[unit.key];
    if (!roll) return;
    if (roll.status === 'complete') complete += 1;
    else if (roll.status === 'not_started') notStarted += 1;
    flags.deficiency += roll.deficiency;
    flags.waiting    += roll.waiting;
  });

  return rollup({ total: group.units.length, complete: complete, notStarted: notStarted }, flags);
}


/**
 * A whole building's rollup, from the numbers list-projects sends.
 *
 * The server sends counts and no verdict, and this is where the phone
 * applies the rule to them. unitsNotStarted is the fifth number: without
 * it, "every unit Not Started" and "some unit In Progress" both arrive as
 * unitsDone 0 and cannot be told apart.
 */
function projectRollup(project) {
  return rollup({
    total:      project.unitsTotal || 0,
    complete:   project.unitsDone  || 0,
    notStarted: project.unitsNotStarted || 0
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
 * header or a Tracking row.
 *
 * A GROUP WITH NOTHING DONE DRAWS NO BAR AT ALL, not an empty track. An
 * empty track and a missing bar say the same thing, and the missing one
 * costs no ink.
 *
 * A 60px bar cannot tell 15/18 from 16/18. That is accepted: the chip is a
 * target, and the exact number is on the Unit screen.
 */
function barHtml(roll) {
  if (!roll || !roll.total || roll.done === 0) return '';
  var pct = Math.round((roll.done / roll.total) * 100);
  return '<span class="bar"><span class="bar-fill s-' + safeStatus(roll.status) + '" ' +
         'style="width:' + pct + '%"></span></span>';
}


/** "12 units · 5 done". Above the Unit screen the noun is always units. */
function countText(roll, one, many) {
  if (!roll || !roll.total) return 'no ' + many;
  return roll.total + ' ' + (roll.total === 1 ? one : many) + ' · ' + roll.done + ' done';
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
 * The marks line — both flag counts and the not-saved chip.
 *
 * THE MARKS GET A LINE OF THEIR OWN. Left to trail the count they break in
 * a different place on every floor, which reads as a mistake.
 *
 * It returns an empty string when there is nothing wrong, so a clean floor
 * never draws a third line.
 */
function marksHtml(roll, notSaved) {
  var out = flagChipHtml('deficiency', roll.deficiency) +
            flagChipHtml('waiting',    roll.waiting) +
            notSavedChipHtml(notSaved);
  return out ? '<span class="marks">' + out + '</span>' : '';
}


/**
 * Everything the marks say, in words.
 *
 * The marks are shapes and colours, so a screen reader gets nothing from
 * them. Every place that draws marks must put this on the element, or the
 * marks are decoration.
 */
function marksLabel(name, roll, notSaved) {
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
  flag:    '<svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true"><path d="M1 10.5V1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M1.9 1.2h5.6L6.1 3.4l1.4 2.2H1.9z" fill="currentColor"/></svg>'
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

/** Turns a failure reason into a sentence a person can act on. */
function reasonText(reason, detail) {
  switch (reason) {
    case 'not-configured':
      return 'The backend is not connected yet. Open control/shared/common.js and paste the web app address into API_URL.';
    case 'offline':
      return 'This phone has no connection. The app opened from its saved copy. Move to a spot with signal, then try again.';
    case 'timeout':
      return 'The server did not answer in time. The signal here may be weak. Try again.';
    case 'blocked':
      return 'The browser could not read the reply. Check that the web app is deployed with access set to Anyone.';
    case 'server':
      return detail || 'The server refused the request.';
    default:
      return detail || 'Something went wrong.';
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

/**
 * The line a screen shows when a refresh failed but a stored copy drew.
 *
 * The app never warns that a copy might be old. IT WARNS ONLY WHEN A FETCH
 * FAILS, and then it says exactly how old the copy is, so the person on
 * site can judge it themselves. There is no staleness clock and no refresh
 * timer: a fetch that succeeds makes the copy fresh by definition.
 */
function staleNoteHtml(fetchedAt) {
  var when = whenText(fetchedAt);
  return '<div class="banner banner--quiet"><div>Offline.' +
         (when ? ' Last updated ' + escapeHtml(when) + '.' : '') +
         '</div></div>';
}


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
function enablePullToRefresh(onRefresh) {
  var TRIGGER = 70;      // how far down to pull, in pixels
  var MAX     = 110;     // how far the screen follows the finger

  var indicator = document.createElement('div');
  indicator.className = 'ptr';
  indicator.innerHTML = '<span class="ptr-ring"></span>';
  document.body.appendChild(indicator);

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

    running = true;
    indicator.classList.add('on', 'spin');

    Promise.resolve(onRefresh()).then(function () {
      running = false;
      indicator.classList.remove('on', 'spin');
    }, function () {
      running = false;
      indicator.classList.remove('on', 'spin');
    });
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

/**
 * Puts the bar under the page header and keeps it in step with the shelf.
 *
 * href is the Outbox window, relative to the calling screen. Pass '' on
 * the Outbox screen itself, so it does not offer a door to where you are.
 */
function mountSyncBar(href) {
  var slot = document.createElement('div');
  slot.className = 'syncbar-slot';

  var header = document.querySelector('header.hdr');
  if (header && header.parentNode) header.parentNode.insertBefore(slot, header.nextSibling);
  else document.body.insertBefore(slot, document.body.firstChild);

  var to = (href === undefined) ? 'outbox.html' : href;

  function paint() { slot.innerHTML = syncBarHtml(to); }

  Outbox.onChange(paint);
  paint();
  return slot;
}


/**
 * Three facts, in one line, in this order: what is going out, what is
 * waiting, and what did not make it.
 *
 *   Saving 3 edits…            a call is in the air
 *   Offline · 3 edits wait     nothing can go out yet
 *   2 edits did not save       the app gave up and a person must look
 *
 * Two of them together read "Saving 3 edits… · 2 failed".
 */
function syncBarHtml(href) {
  var counts = Outbox.counts();
  if (!counts.waiting && !counts.held) return '';

  var parts = [];
  var kind  = 'quiet';

  if (counts.waiting) {
    if (Outbox.sending()) {
      kind = 'accent';
      parts.push('<span class="sync-ring"></span>Saving ' + editsText(counts.waiting) + '…');
    } else if (navigator.onLine === false) {
      parts.push('<span class="sync-slab"></span>Offline · ' + editsText(counts.waiting) + ' wait');
    } else {
      // Online, between retries. Saying "Offline" here would be a lie.
      parts.push('<span class="sync-slab"></span>' + editsText(counts.waiting) + ' wait');
    }
  }

  if (counts.held) {
    kind = 'bad';
    parts.push('<span class="sync-bad"></span>' +
               (counts.waiting ? counts.held + ' failed'
                               : editsText(counts.held) + ' did not save'));
  }

  return '<div class="syncbar syncbar--' + kind + '">' +
           '<span class="sync-text">' + parts.join('<span class="sync-sep">·</span>') + '</span>' +
           (href ? '<a class="sync-link press" href="' + href + '">Outbox ›</a>' : '') +
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
