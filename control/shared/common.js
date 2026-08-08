/* =====================================================================
   PFC CONTROL — shared logic
   =====================================================================
   Every screen loads this file. It holds:
     - the connection to the Apps Script backend
     - the five status values and the rollup rule
     - the demo project, used before the backend is connected
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
 * Set this back to an empty string at any time. The app then falls back to
 * the demo buildings, and every screen still works.
 */
var API_URL = 'https://script.google.com/macros/s/AKfycbzo9lCHMaxDqMEk6PPZouUWXG6dDeAMh3tHI0dtYExjCYE9DYDdT4vj8_YCrtnGjv5e/exec';

/** How long to wait for the server before giving up, in milliseconds. */
var API_TIMEOUT = 12000;


/* ── STATUS ───────────────────────────────────────────────────────── */

/** The five statuses. The keys match what the backend sends. */
var STATUS = {
  not_started: { label: 'Not Started' },
  in_progress: { label: 'In Progress' },
  complete:    { label: 'Complete' },
  deficiency:  { label: 'Deficiency' },
  on_hold:     { label: 'On Hold' }
};

/** Dropdown order. Every dropdown shows all five, always in this order. */
var CYCLE = ['not_started', 'in_progress', 'complete', 'deficiency', 'on_hold'];

/** Worst status wins. This list runs worst to best. */
var ROLLUP_ORDER = ['deficiency', 'on_hold', 'in_progress', 'not_started'];

/**
 * Returns the worst status in a list.
 * Complete shows only when every item is Complete.
 * This matches the rollup formula in each project's Sheet.
 */
function worst(list) {
  if (!list || list.length === 0) return 'not_started';
  for (var i = 0; i < ROLLUP_ORDER.length; i++) {
    if (list.indexOf(ROLLUP_ORDER[i]) !== -1) return ROLLUP_ORDER[i];
  }
  return 'complete';
}

/** Keeps an unknown value from breaking a screen. */
function safeStatus(key) {
  return STATUS[key] ? key : 'not_started';
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
 */
function apiCall(action, data, method) {
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


/* ── LOADERS ──────────────────────────────────────────────────────── */
/* Each loader answers with a source, so a screen can say where the data
   came from. source is 'live' for the backend, or 'demo'.                */

/** Loads the project list for the Tracking screen. */
function loadProjects() {
  return apiCall('list-projects', {}, 'GET').then(function (result) {
    if (result.ok) {
      return { source: 'live', projects: result.data.projects || [] };
    }
    // The backend is not connected, or it cannot be reached. Show the demo
    // projects so every screen still works.
    return { source: 'demo', reason: result.reason, detail: result.detail, projects: demoProjectList() };
  });
}


/** Loads one project's floors and units for the Building screen. */
function loadStructure(projectId) {
  if (isDemo(projectId)) {
    return Promise.resolve({ source: 'demo', reason: 'demo-project', data: demoStructure(projectId) });
  }
  return apiCall('get-structure', { id: projectId }, 'GET').then(function (result) {
    if (!result.ok) return { source: 'error', reason: result.reason, detail: result.detail };
    return { source: 'live', data: applyUnitOverrides(projectId, result.data) };
  });
}


/** Loads one unit's items for the Unit screen. */
function loadUnit(projectId, unitKey) {
  if (isDemo(projectId)) {
    return Promise.resolve({ source: 'demo', reason: 'demo-project', data: demoUnit(projectId, unitKey) });
  }
  return apiCall('get-unit', { id: projectId, unit: unitKey }, 'GET').then(function (result) {
    if (!result.ok) return { source: 'error', reason: result.reason, detail: result.detail };
    return { source: 'live', data: applyItemOverrides(projectId, result.data) };
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


/* ── LOCAL CHANGES (0.1 only) ──────────────────────────────────────── */
/*
   0.1 does not save a status or a details note to the Sheet. Any change you
   make stays on this phone, in this browser tab, and disappears when the
   tab closes. Every screen that allows a change says so on screen.

   The store below is the exact place 0.2 replaces. 0.2 sends each change to
   the backend, keeps it here until the server confirms it, and shows a
   pending mark while it waits.
*/

var Store = {
  key: 'pfc.control.v1.local',
  cache: null,

  read: function () {
    if (this.cache) return this.cache;
    try {
      this.cache = JSON.parse(sessionStorage.getItem(this.key) || '{}');
    } catch (e) {
      this.cache = {};   // private browsing can block storage
    }
    if (!this.cache.items) this.cache.items = {};
    if (!this.cache.units) this.cache.units = {};
    return this.cache;
  },

  save: function () {
    try {
      sessionStorage.setItem(this.key, JSON.stringify(this.cache));
    } catch (e) {
      // Storage is full or blocked. The change still works for this page.
    }
  },

  /** Reads one item's local change, or null. */
  item: function (projectId, unitKey, itemKey) {
    return this.read().items[projectId + '|' + unitKey + '|' + itemKey] || null;
  },

  /** Records a local change to one item. */
  setItem: function (projectId, unitKey, itemKey, patch) {
    var store = this.read();
    var id = projectId + '|' + unitKey + '|' + itemKey;
    store.items[id] = assign(store.items[id] || {}, patch);
    this.save();
  },

  /** The rolled-up status of a unit, after local changes. */
  unit: function (projectId, unitKey) {
    return this.read().units[projectId + '|' + unitKey] || null;
  },

  /** Records a unit's rolled-up status, so the Building screen agrees. */
  setUnit: function (projectId, unitKey, status) {
    this.read().units[projectId + '|' + unitKey] = status;
    this.save();
  },

  /** True when anything has been changed but not saved. */
  hasChanges: function () {
    var store = this.read();
    return Object.keys(store.items).length > 0;
  },

  clear: function () {
    this.cache = { items: {}, units: {} };
    this.save();
  }
};


/** Puts local unit changes on top of the structure the server sent. */
function applyUnitOverrides(projectId, structure) {
  (structure.groups || []).forEach(function (group) {
    group.units.forEach(function (unit) {
      var local = Store.unit(projectId, unit.key);
      if (local) unit.status = local;
    });
  });
  return structure;
}


/** Puts local item changes on top of the unit the server sent. */
function applyItemOverrides(projectId, unitData) {
  var all = [];
  (unitData.phases || []).forEach(function (phase) {
    phase.items.forEach(function (item) {
      var local = Store.item(projectId, unitData.unit.key, item.key);
      if (local) {
        if (local.status !== undefined)  item.status = local.status;
        if (local.details !== undefined) item.details = local.details;
      }
      all.push(item.status);
    });
  });
  unitData.overall = worst(all);
  return unitData;
}


/* ── DEMO DATA ────────────────────────────────────────────────────── */
/*
   Two made-up buildings, copied from the design prototype. They appear
   only when the backend is not connected or cannot be reached. Every
   screen marks them DEMO.

   The statuses are not random. They come from a hash of the project, unit
   and item names, so the same unit always shows the same thing.
*/

var DEMO_DEFS = [
  { id: 'demo_elsliger', name: 'Elsliger 36-B', floors: 3, perFloor: 12 },
  { id: 'demo_highland', name: 'Highland View', floors: 3, perFloor: 6 }
];

/* Ten picks per group. The first floor runs ahead, the top floor runs
   behind, and the floors between are part done. */
var DEMO_WEIGHTS = {
  ahead:  spread({ complete: 5, in_progress: 2, deficiency: 1, on_hold: 1, not_started: 1 }),
  mid:    spread({ complete: 2, in_progress: 4, deficiency: 1, on_hold: 1, not_started: 2 }),
  behind: spread({ complete: 0, in_progress: 2, deficiency: 1, on_hold: 1, not_started: 6 })
};

var DEMO_DETAILS = {
  not_started: ['Not started'],
  in_progress: ['Crew on site today', 'In progress, half done', 'Started, needs second pass'],
  complete:    ['No issues', 'Installed, inspected', 'Complete, signed off'],
  deficiency:  ['Scratched, needs replacement', 'Wrong size received',
                'Damaged in transit, reorder needed', 'Missing hardware'],
  on_hold:     ['Awaiting materials', 'Backordered, ETA unknown', 'Paused, waiting on supplier']
};

/** Builds a pick list from a count for each status. */
function spread(counts) {
  var list = [];
  CYCLE.forEach(function (key) {
    for (var i = 0; i < (counts[key] || 0); i++) list.push(key);
  });
  return list;
}

/** A small, steady hash. The same text always gives the same number. */
function hashStr(text) {
  var h = 0;
  for (var i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function isDemo(projectId) {
  return String(projectId || '').indexOf('demo_') === 0;
}

function demoDef(projectId) {
  for (var i = 0; i < DEMO_DEFS.length; i++) {
    if (DEMO_DEFS[i].id === projectId) return DEMO_DEFS[i];
  }
  return null;
}

/** Builds the floors and units of a demo building. */
function demoGroups(def) {
  var groups = [];
  for (var f = 1; f <= def.floors; f++) {
    var units = [];
    for (var u = 1; u <= def.perFloor; u++) {
      var number = String(f * 100 + u);
      units.push({ key: number, label: number, chip: number, floorIndex: f - 1 });
    }
    groups.push({ key: 'floor_' + f, label: 'Floor ' + f, units: units });
  }
  return groups;
}

/** The status of one demo item. Steady, not random. */
function demoItemStatus(def, unitKey, itemKey, floorIndex) {
  var tier = (floorIndex === 0) ? 'ahead'
           : (floorIndex === def.floors - 1) ? 'behind'
           : 'mid';
  var pool = DEMO_WEIGHTS[tier];
  return pool[hashStr(def.id + '|' + unitKey + '|' + itemKey) % pool.length];
}

function demoItemDetails(def, unitKey, itemKey, status) {
  var list = DEMO_DETAILS[status] || [''];
  return list[hashStr(def.id + '|' + unitKey + '|' + itemKey + '|d') % list.length];
}

/** Every item key of a demo building, in order. */
function demoItems() {
  var items = [];
  DEFAULT_PHASES.forEach(function (phase) {
    phase.items.forEach(function (label) {
      items.push({ phase: phase, key: slugify(label), label: label });
    });
  });
  return items;
}

/** The rolled-up status of one demo unit. */
function demoUnitStatus(def, unit) {
  var statuses = demoItems().map(function (item) {
    return demoItemStatus(def, unit.key, item.key, unit.floorIndex);
  });
  return worst(statuses);
}

function demoProjectList() {
  return DEMO_DEFS.map(function (def) {
    var groups = demoGroups(def);
    var all = [];
    groups.forEach(function (group) {
      group.units.forEach(function (unit) {
        all.push(Store.unit(def.id, unit.key) || demoUnitStatus(def, unit));
      });
    });
    return {
      id: def.id,
      name: def.name,
      mode: 'floors',
      demo: true,
      unitCount: all.length,
      groupCount: groups.length,
      overall: worst(all)
    };
  });
}

function demoStructure(projectId) {
  var def = demoDef(projectId);
  if (!def) return null;

  var groups = demoGroups(def).map(function (group) {
    return {
      key: group.key,
      label: group.label,
      units: group.units.map(function (unit) {
        return {
          key: unit.key,
          label: unit.label,
          chip: unit.chip,
          status: Store.unit(def.id, unit.key) || demoUnitStatus(def, unit)
        };
      })
    };
  });

  var all = [];
  groups.forEach(function (g) { g.units.forEach(function (u) { all.push(u.status); }); });

  return {
    id: def.id,
    name: def.name,
    mode: 'floors',
    demo: true,
    unitCount: all.length,
    groups: groups,
    overall: worst(all)
  };
}

function demoUnit(projectId, unitKey) {
  var def = demoDef(projectId);
  if (!def) return null;

  var floorIndex = Math.floor(parseInt(unitKey, 10) / 100) - 1;
  var all = [];

  var phases = DEFAULT_PHASES.map(function (phase) {
    return {
      key: phase.key,
      label: phase.label,
      items: phase.items.map(function (label) {
        var itemKey = slugify(label);
        var status  = demoItemStatus(def, unitKey, itemKey, floorIndex);
        var details = demoItemDetails(def, unitKey, itemKey, status);

        var local = Store.item(def.id, unitKey, itemKey);
        if (local) {
          if (local.status !== undefined)  status = local.status;
          if (local.details !== undefined) details = local.details;
        }

        all.push(status);
        return { key: itemKey, label: label, status: status, details: details };
      })
    };
  });

  return {
    id: def.id,
    demo: true,
    projectName: def.name,
    unit: { key: unitKey, label: unitKey, chip: unitKey },
    groupLabel: 'Floor ' + (floorIndex + 1),
    phases: phases,
    overall: worst(all)
  };
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

/** A status badge. size is '', 'md', 'sm' or 'xs'. */
function pillHtml(status, size) {
  var key = safeStatus(status);
  return '<span class="pill' + (size ? ' pill--' + size : '') + ' s-' + key + '">' +
           '<span class="dot"></span>' +
           '<span class="txt">' + STATUS[key].label + '</span>' +
         '</span>';
}

/** A status dot on its own. */
function dotHtml(status) {
  return '<span class="dot-only s-' + safeStatus(status) + '"></span>';
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
  close:   '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" stroke-linecap="round"/></svg>'
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

/** The bar that explains demo data. Returns an empty string for live data. */
function demoBannerHtml(result) {
  if (result.source !== 'demo') return '';
  var text = (result.reason === 'not-configured' || !API_URL)
    ? 'The backend is not connected yet. These are example buildings.'
    : 'Cannot reach the server. These are example buildings.';
  return '<div class="banner"><div><b>Demo data.</b> ' + escapeHtml(text) + '</div>' +
         (API_URL ? '<button class="press" onclick="window.location.reload()">Retry</button>' : '') +
         '</div>';
}

/** The note that says a change on this screen is not saved. */
function localOnlyNote() {
  return '<div class="banner"><div><b>Preview only.</b> ' +
         'A change here stays on this phone. It is not saved to the project Sheet yet. ' +
         'Saving arrives in the next version.</div></div>';
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
