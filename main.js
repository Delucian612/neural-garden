"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NeuralGardenPlugin
});
module.exports = __toCommonJS(main_exports);

// src/plugin.ts
var import_obsidian6 = require("obsidian");

// src/homeView.ts
var import_obsidian = require("obsidian");

// src/constants.ts
var VIEW_TYPE_NEURAL_GARDEN_HOME = "neural-garden-home";
var VIEW_TYPE_NEURAL_GARDEN_JOURNALING = "neural-garden-journaling";
var VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY = "neural-garden-journal-entry";
var TASK_MANAGER_FILE_PATH = "Maintenance/TaskManager/TaskManager.md";
var JOURNAL_DAILY_FOLDER = "Journal/Daily";
var JOURNAL_WEEKLY_FOLDER = "Journal/Weekly";
var JOURNAL_MONTHLY_FOLDER = "Journal/Monthly";
var TRACKER_FOLDER = "Maintenance/Tracker";
var NOTES_FOLDER = "Notes";
var WEEKLY_RECAP_MIN_ENTRIES = 7;
var EFFORTS = [
  { key: "easy-peasy", label: "Easy Peasy", energy: 5, color: "#3FD6FF" },
  { key: "easy", label: "Easy", energy: 15, color: "#39E05A" },
  { key: "medium", label: "Medium", energy: 30, color: "#F0A04C" },
  { key: "hard", label: "Hard", energy: 50, color: "#E06E2C" },
  { key: "heavy", label: "Heavy", energy: 70, color: "#FF6565" }
];
var EFFORT_MAP = new Map(
  EFFORTS.map((effort) => [effort.key, effort])
);
var ENERGY_STOPS = [
  { percent: 0, color: [63, 214, 255] },
  { percent: 60, color: [49, 201, 80] },
  { percent: 90, color: [208, 135, 46] },
  { percent: 100, color: [251, 44, 54] },
  { percent: 115, color: [255, 0, 0] }
];
var BREAK_MESSAGES = [
  "Have a break, have a kitkat.",
  "Breathe and reset.",
  "Do something just for you.",
  "Your energy matters, so preserve it now.",
  "Take a deep breath.",
  "Take a couple of steps away from the screen.",
  "Relax your jaw, lower your shoulders, and soften your focus.",
  "Let the next three breaths be your full attention.",
  "Be kind to your mind.",
  "Go on with the day with a smile on your mind."
];
var DEFAULT_STATE = {
  maxEnergy: 100,
  totalEnergy: 0,
  spentEnergy: 0,
  tasks: [],
  overdriveAvailability: true,
  overdriveMode: false,
  overdriveAftereffects: false,
  resting: false,
  forcedBreak: false,
  forcedBreakThreshold: 70,
  forcedBreakEnergy: 0,
  forcedBreakEnergyEx: 0,
  forcedBreakAdd: 0,
  forcedBreakLength: 20,
  forcedBreakTime: 20,
  forcedBreakEnd: void 0
};

// src/taskState.ts
function normalizeState(raw) {
  const parsedTasks = Array.isArray(raw.tasks) ? raw.tasks.map((task) => {
    var _a, _b;
    const mapped = task;
    if (!mapped || typeof mapped !== "object") {
      return void 0;
    }
    const effort = EFFORT_MAP.get(mapped.effort);
    return {
      id: typeof mapped.id === "string" ? mapped.id : createId(),
      taskName: typeof mapped.taskName === "string" ? mapped.taskName : "Untitled Task",
      effort: (_a = effort == null ? void 0 : effort.key) != null ? _a : "easy",
      energy: typeof mapped.energy === "number" ? mapped.energy : (_b = effort == null ? void 0 : effort.energy) != null ? _b : 15,
      completed: Boolean(mapped.completed),
      completedAt: typeof mapped.completedAt === "number" ? mapped.completedAt : void 0
    };
  }).filter((task) => task !== void 0) : [];
  const state = {
    maxEnergy: numberOr(raw.maxEnergy, DEFAULT_STATE.maxEnergy),
    totalEnergy: numberOr(raw.totalEnergy, DEFAULT_STATE.totalEnergy),
    spentEnergy: numberOr(raw.spentEnergy, DEFAULT_STATE.spentEnergy),
    tasks: parsedTasks,
    overdriveAvailability: boolOr(raw.overdriveAvailability, DEFAULT_STATE.overdriveAvailability),
    overdriveMode: boolOr(raw.overdriveMode, DEFAULT_STATE.overdriveMode),
    overdriveAftereffects: boolOr(raw.overdriveAftereffects, DEFAULT_STATE.overdriveAftereffects),
    resting: boolOr(raw.resting, DEFAULT_STATE.resting),
    forcedBreak: boolOr(raw.forcedBreak, DEFAULT_STATE.forcedBreak),
    forcedBreakThreshold: numberOr(raw.forcedBreakThreshold, DEFAULT_STATE.forcedBreakThreshold),
    forcedBreakEnergy: numberOr(raw.forcedBreakEnergy, DEFAULT_STATE.forcedBreakEnergy),
    forcedBreakEnergyEx: numberOr(raw.forcedBreakEnergyEx, DEFAULT_STATE.forcedBreakEnergyEx),
    forcedBreakAdd: numberOr(raw.forcedBreakAdd, DEFAULT_STATE.forcedBreakAdd),
    forcedBreakLength: numberOr(raw.forcedBreakLength, DEFAULT_STATE.forcedBreakLength),
    forcedBreakTime: numberOr(raw.forcedBreakTime, DEFAULT_STATE.forcedBreakTime),
    forcedBreakEnd: numberOrUndefined(raw.forcedBreakEnd)
  };
  recalculateTotals(state);
  return state;
}
function recalculateTotals(state) {
  state.totalEnergy = state.tasks.reduce((sum, task) => sum + task.energy, 0);
  state.spentEnergy = state.tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.energy, 0);
}
function effortLabel(effort) {
  var _a, _b;
  return (_b = (_a = EFFORT_MAP.get(effort)) == null ? void 0 : _a.label) != null ? _b : "Easy";
}
function effortColor(effort) {
  var _a, _b;
  return (_b = (_a = EFFORT_MAP.get(effort)) == null ? void 0 : _a.color) != null ? _b : "#39E05A";
}
function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function getEffectiveMaxEnergy(state) {
  return state.overdriveMode ? state.maxEnergy * 2 : state.maxEnergy;
}
function getEffectiveForcedBreakThreshold(state) {
  return state.overdriveMode ? state.forcedBreakThreshold * 2 : state.forcedBreakThreshold;
}
function normalizeFrontmatterTags(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).toLowerCase());
  }
  if (typeof value === "string") {
    return value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}
function numberOr(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function boolOr(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function numberOrUndefined(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}

// src/search.ts
async function searchNotesInFolder(app, query, maxResults = 20) {
  var _a, _b, _c;
  if (query.trim().length < 2) {
    return [];
  }
  const files = app.vault.getFiles().filter((file) => file.path.startsWith(`${NOTES_FOLDER}/`));
  if (files.length === 0) {
    return [];
  }
  const q = query.toLowerCase();
  const matches = [];
  for (const file of files) {
    const fromName = file.basename.toLowerCase().includes(q) || file.path.toLowerCase().includes(q);
    const cache = app.metadataCache.getFileCache(file);
    const tags = [
      ...(_b = (_a = cache == null ? void 0 : cache.tags) == null ? void 0 : _a.map((tag) => tag.tag.toLowerCase())) != null ? _b : [],
      ...normalizeFrontmatterTags((_c = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _c.tags)
    ];
    const fromTags = tags.some((tag) => tag.includes(q));
    let fromContent = false;
    if (!fromName && !fromTags) {
      const content = await app.vault.cachedRead(file);
      fromContent = content.toLowerCase().includes(q);
    }
    if (fromName || fromTags || fromContent) {
      matches.push(file);
    }
    if (matches.length >= maxResults) {
      break;
    }
  }
  return matches;
}

// src/styles.ts
function injectNeuralGardenStyles() {
  const styleId = "neural-garden-style";
  if (document.getElementById(styleId)) {
    return;
  }
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .neural-garden-home {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .neural-garden-home > h2 {
      text-align: center;
      margin: 0;
    }
    .ng-categories {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ng-category-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .ng-weekly-recap-row {
      width: min(420px, 100%);
      align-self: center;
    }
    .ng-search,
    .ng-task-manager {
      background: transparent;
    }
    .ng-search {
      margin-top: 7px;
    }
    .ng-search h3 {
      margin: 0 0 4px;
      color: var(--text-normal);
    }
    .ng-search-results {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 24px;
    }
    .ng-search-row {
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--background-modifier-border);
      cursor: pointer;
    }
    .ng-search-row:hover {
      border-color: #ec9a63;
    }
    .ng-search-title {
      font-weight: 600;
    }
    .ng-search-path {
      font-size: 12px;
      color: var(--text-muted);
    }
    .ng-task-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .ng-task-heading h3 {
      margin: 0;
      color: var(--text-normal);
      font-size: 1.1rem;
      font-weight: 600;
    }
    .ng-overdrive-button {
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid;
      background: transparent;
      cursor: pointer;
    }
    .ng-overdrive-button.is-active {
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.3);
      background: rgba(0, 240, 255, 0.1);
    }
    .ng-overdrive-button.is-inactive {
      filter: saturate(0.6) brightness(0.8);
    }
    .ng-task-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      border-radius: 10px;
      border: 2px solid rgba(236, 154, 99, 0.6);
      background-color: rgba(0, 0, 0, 0.02);
    }
    .ng-task-input {
      border: 1px solid var(--background-modifier-border);
      background-color: var(--background-primary);
      color: var(--text-normal);
      border-radius: 8px;
      padding: 8px;
      width: 100%;
    }
    .ng-inline-input {
      padding: 4px 6px;
    }
    .ng-effort-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ng-effort-label {
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1;
    }
    .ng-progress-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      width: clamp(132px, 30%, 204px);
      margin-left: auto;
    }
    .ng-progress {
      position: relative;
      height: 12px;
      border-radius: 999px;
      width: 100%;
      background: var(--background-modifier-border);
      overflow: hidden;
    }
    .ng-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 250ms ease;
      animation: ng-energy-flow 2.2s linear infinite;
    }
    .ng-warning {
      color: #f8b719;
      font-size: 16px;
      line-height: 1;
    }
    .ng-effort-buttons {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
    }
    .ng-effort-button {
      border: 1px solid;
      border-radius: 999px;
      background: transparent;
      padding: 6px 10px;
      cursor: pointer;
      transition: background-color 200ms ease, transform 120ms ease;
      width: 100%;
      color: var(--text-normal);
    }
    .ng-effort-button:hover {
      border-color: var(--ng-btn-active);
      background: var(--ng-btn-hover-bg);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-btn-active) 40%, transparent);
    }
    .ng-effort-button.is-pulsing {
      animation: ng-pulse 450ms ease;
    }
    .ng-effort-button.is-shaking {
      animation: ng-shake 250ms ease;
    }
    .ng-task-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .ng-task-row {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto auto;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      transition: background-color 250ms ease, opacity 300ms ease, transform 300ms ease;
    }
    .ng-task-row:hover {
      background: color-mix(in srgb, var(--background-modifier-hover) 85%, transparent);
    }
    .ng-task-row.ng-row-disappearing {
      animation: ng-fade-out 720ms ease forwards;
    }
    .ng-task-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ng-badge-wrap {
      position: relative;
    }
    .ng-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 70px;
      padding: 2px 6px;
      border: 1px solid;
      background: transparent;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
      flex-shrink: 0;
      opacity: 0.95;
    }
    .ng-row-button {
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 4px 8px;
      background: transparent;
      cursor: pointer;
    }
    .ng-edit {
      border: none !important;
      background: transparent !important;
      color: color-mix(in srgb, var(--text-normal) 64%, black);
      font-size: 0.8em;
      padding: 2px 4px;
      box-shadow: none !important;
      appearance: none;
    }
    .ng-edit:hover,
    .ng-edit:focus,
    .ng-edit:active {
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-delete {
      color: color-mix(in srgb, #ff6565 64%, black);
      border: none !important;
      background: transparent !important;
      padding: 4px 2px;
      cursor: pointer;
      font-weight: 700;
      line-height: 1;
      font-size: 0.8em;
      box-shadow: none !important;
      appearance: none;
    }
    .ng-delete:hover,
    .ng-delete:focus,
    .ng-delete:active {
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-break-panel {
      padding: 16px;
      border-radius: 10px;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .ng-break-panel h4 {
      margin: 0;
      color: var(--text-normal);
      font-size: 1.43rem;
      font-weight: 600;
    }
    .ng-break-button {
      border: 1px solid #ec9a63;
      border-radius: 10px;
      padding: 17px 29px;
      background: transparent;
      cursor: pointer;
    }
    .ng-break-intro-title,
    .ng-break-intro-copy,
    .ng-break-intro-button {
      opacity: 0;
      animation-fill-mode: forwards;
    }
    .ng-break-intro-title {
      animation: ng-break-intro-fade 1s ease-out forwards;
    }
    .ng-break-intro-copy {
      animation: ng-break-intro-fade 2s ease-out 1s forwards;
    }
    .ng-break-intro-button {
      animation: ng-break-intro-fade 1s ease-out 2.1s forwards;
    }
    .ng-break-timer {
      font-size: 38px;
      line-height: 1;
      font-weight: 700;
    }
    .ng-break-copy {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.97em;
    }
    .ng-break-copy-animated {
      animation: ng-break-message 12s ease-out;
      font-size: 0.97em;
      color: color-mix(in srgb, var(--text-normal) 88%, white);
      font-weight: 600;
    }
    .ng-resting {
      filter: saturate(0.1);
    }
    .ng-overdrive {
      --ng-accent: #00F0FF;
    }
    .ng-overdrive .ng-task-form,
    .ng-overdrive .ng-task-row,
    .ng-overdrive .ng-search-row,
    .ng-overdrive .ng-break-panel {
      border-color: rgba(0, 240, 255, 0.6);
    }
    .ng-break-locked .ng-task-form {
      opacity: 0.9;
    }
    .ng-empty {
      color: var(--text-muted);
      font-size: 1rem;
      text-align: center;
      font-style: italic;
      padding: 8px 0;
    }
    .ng-home-category-button,
    .ng-journal-nav-button,
    .ng-journal-mode-button,
    .ng-journal-create-button,
    .ng-journal-tracker-add {
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #ec9a63;
      background: transparent;
      font-size: 14px;
      width: 100%;
      cursor: pointer;
      color: var(--text-normal);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    .ng-journal-nav-button,
    .ng-journal-mode-button,
    .ng-journal-create-button,
    .ng-journal-tracker-add {
      width: auto;
    }
    .ng-home-category-button:hover,
    .ng-journal-nav-button:hover,
    .ng-journal-mode-button:hover,
    .ng-journal-create-button:hover,
    .ng-journal-tracker-add:hover {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.25);
    }
    .ng-journal-create-button {
      width: auto;
    }
    .ng-journal-mode-button {
      width: auto;
    }
    .ng-journaling {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
      max-width: 720px;
      margin: 0 auto;
    }
    .ng-journal-topbar,
    .ng-journal-daily-header {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    .ng-journal-month-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .ng-journal-topbar {
      align-items: flex-start;
    }
    .ng-journal-title-wrap {
      flex: 1;
      text-align: center;
    }
    .ng-journaling .ng-journal-title-wrap {
      flex-basis: 100%;
      order: 2;
      width: 100%;
      text-align: center;
      margin-top: -2px;
    }
    .ng-journaling .ng-journal-topbar {
      flex-wrap: wrap;
    }
    .ng-journal-entry-page .ng-journal-title-wrap {
      flex-basis: 100%;
      order: 2;
      width: 100%;
      text-align: center;
      margin-top: -2px;
    }
    .ng-journal-entry-page .ng-journal-topbar {
      flex-wrap: wrap;
    }
    .ng-journal-title-wrap h2,
    .ng-journal-title-wrap h3,
    .ng-journal-placeholder h3,
    .ng-journal-entry-card h3,
    .ng-journal-trackers h3,
    .ng-journal-daily-header h3 {
      margin: 0;
    }
    .ng-journal-entry-page .ng-journal-title-wrap h3 {
      color: var(--text-normal);
      text-align: center;
      font-weight: 500;
      font-size: 1.5rem;
      margin-top: 12px;
    }
    .ng-journal-entry-page .ng-journal-title-wrap h2 {
      margin-bottom: 0;
    }
    .ng-journal-entry-card h3 {
      color: var(--text-normal);
    }
    .ng-journal-readonly-note,
    .ng-journal-metric-feedback,
    .ng-journal-metric-explain,
    .ng-journal-body-copy {
      color: var(--text-muted);
    }
    .ng-journal-tracker-cell {
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
      border-radius: 10px;
    }
    .ng-journal-modebar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .ng-journal-mode-button.is-active {
      border-color: #ec9a63;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
    }
    .ng-journal-create-button.is-highlighted {
      border-color: #00f0ff;
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18);
    }
    .ng-journal-create-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .ng-journal-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      align-items: start;
    }
    .ng-journal-calendar-panel,
    .ng-journal-detail-panel,
    .ng-journal-trackers,
    .ng-journal-placeholder,
    .ng-journal-entry-card {
      border: 1px solid var(--background-modifier-border);
      border-radius: 14px;
      padding: 14px;
      background: color-mix(in srgb, var(--background-primary) 84%, transparent);
    }
    .ng-journal-calendar-panel,
    .ng-journal-detail-panel,
    .ng-journal-trackers,
    .ng-journal-entry-card {
      background: color-mix(in srgb, var(--background-primary) 36%, transparent);
    }
    .ng-journal-calendar-panel {
      width: 100%;
      padding-top: 8px;
      margin-top: 10px;
    }
    .ng-journal-calendar-panel h3 {
      color: var(--text-normal);
      text-align: center;
    }
    .ng-journal-month-label {
      font-size: 1.2rem;
      font-weight: 600;
      line-height: 1;
    }
    .ng-journal-trackers h3 {
      color: var(--text-normal);
    }
    .ng-journal-detail-panel {
      margin-top: 18px;
    }
    .ng-journal-calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 4px;
      margin-top: 10px;
    }
    .ng-journal-calendar-weekday {
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .ng-journal-day-cell {
      position: relative;
      min-height: 34px;
      padding: 8px 6px;
      border-radius: 10px;
      border: 1px solid #ec9a63;
      background: transparent;
      color: var(--text-normal);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .ng-journal-day-cell:hover {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
    }
    .ng-journal-day-cell.is-outside-month {
      opacity: 0.35;
    }
    .ng-journal-day-cell.has-entry {
      border-color: #ec9a63;
      background: rgba(236, 154, 99, 0.08);
    }
    .ng-journal-day-cell.is-today {
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18);
    }
    .ng-journal-day-cell.is-selected {
      border-color: #00f0ff;
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.22);
    }
    .ng-journal-day-number {
      font-size: 0.86rem;
      font-weight: 600;
    }
    .ng-journal-day-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #ec9a63;
      position: absolute;
      bottom: 8px;
      right: 8px;
    }
    .ng-journal-metrics {
      display: grid;
      gap: 14px;
      margin-top: 14px;
    }
    .ng-journal-entry-page .ng-journal-metrics {
      margin-top: 0;
    }
    .ng-journal-metric {
      display: grid;
      gap: 8px;
    }
    .ng-journal-metric-meta {
      display: grid;
      gap: 2px;
    }
    .ng-journal-metric-label,
    .ng-journal-task-heading {
      font-weight: 600;
      font-size: 1.1rem;
    }
    .ng-journal-metric-explain {
      font-size: 0.9rem;
    }
    .ng-journal-progress {
      position: relative;
      height: 24px;
      border-radius: 999px;
      width: 100%;
      background: var(--background-modifier-border);
      overflow: hidden;
      cursor: ew-resize;
    }
    .ng-journal-progress-readonly {
      cursor: default;
    }
    .ng-journal-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 200ms ease, background-color 220ms ease;
      width: 0;
    }
    .ng-journal-progress-thumb {
      display: none;
    }
    .ng-journal-emotions,
    .ng-journal-note-section,
    .ng-journal-tasks,
    .ng-journal-body,
    .ng-journal-meta-grid {
      margin-top: 14px;
      display: grid;
      gap: 8px;
    }
    .ng-journal-emotions,
    .ng-journal-tasks {
      margin-top: 18px;
    }
    .ng-journal-emotions h4,
    .ng-journal-tasks > h4,
    .ng-journal-task-group h5 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-emotions h4,
    .ng-journal-tasks > h4 {
      font-size: 1.2rem;
      margin: 0;
    }
    .ng-journal-entry-page .ng-journal-emotions h4 {
      font-size: 1.56rem;
    }
    .ng-journal-entry-page .ng-journal-tasks > h4 {
      font-size: 1.56rem;
    }
    .ng-journal-entry-page .ng-journal-task-group h5 {
      font-size: 1.2rem;
    }
    .ng-journal-entry-page .ng-journal-task-group + .ng-journal-task-group {
      margin-top: 20px;
    }
    .ng-journal-entry-page .ng-journal-task-badge {
      min-width: 70px;
      padding: 2px 6px;
      font-size: 0.62rem;
    }
    .ng-journal-emotion-note {
      color: var(--text-muted);
      margin-top: -4px;
      font-size: 0.92rem;
      text-align: center;
    }
    .ng-journal-emotion-group {
      display: grid;
      justify-items: center;
    }
    .ng-journal-emotion-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .ng-journal-emotion-button,
    .ng-journal-tracker-cell {
      padding: 8px 10px;
    }
    .ng-journal-emotion-button {
      background: transparent;
      border: 1px solid;
      color: var(--text-normal);
    }
    .ng-journal-emotion-button:not(.is-active) {
      filter: brightness(40%) saturate(40%);
    }
    .ng-journal-emotion-button.pleasant {
      border-color: #39e05a;
    }
    .ng-journal-emotion-button.unpleasant {
      border-color: #ff6565;
    }
    .ng-journal-emotion-button.is-active.pleasant {
      background: rgba(57, 224, 90, 0.16);
      color: var(--text-normal);
    }
    .ng-journal-emotion-button.is-active.unpleasant {
      background: rgba(255, 101, 101, 0.16);
      color: var(--text-normal);
    }
    .ng-journal-emotion-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .ng-journal-emotion-chip {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--background-modifier-border);
      border-radius: 999px;
      padding: 5px 10px;
      margin: 0;
    }
    .ng-journal-emotion-chip.pleasant {
      border-color: #39e05a;
      color: #39e05a;
    }
    .ng-journal-emotion-chip.unpleasant {
      border-color: #ff6565;
      color: #ff6565;
    }
    .ng-journal-note-input {
      min-height: 90px;
      width: 100%;
      resize: vertical;
      border-radius: 10px;
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      padding: 30px 10px 10px;
    }
    .ng-journal-note-section {
      position: relative;
    }
    .ng-journal-character-count {
      position: absolute;
      top: 6px;
      left: 12px;
      font-size: 0.72rem;
      color: var(--text-muted);
      pointer-events: none;
    }
    .ng-journal-tracker-create-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }
    .ng-journal-tracker-name {
      border: 1px solid var(--background-modifier-border);
      background: var(--background-primary);
      color: var(--text-normal);
      border-radius: 10px;
      padding: 8px 10px;
      width: 100%;
    }
    .ng-journal-tracker-list {
      display: grid;
      gap: 10px;
    }
    .ng-journal-tracker-row {
      display: grid;
      grid-template-columns: minmax(140px, 170px) minmax(0, 1fr);
      gap: 10px;
      align-items: center;
    }
    .ng-journal-tracker-label {
      border: 1px solid;
      border-radius: 10px;
      padding: 8px 10px;
      font-weight: 600;
      position: sticky;
      left: 0;
      z-index: 1;
      background: color-mix(in srgb, var(--background-primary) 92%, transparent);
    }
    .ng-journal-tracker-label-empty {
      border-color: transparent;
      background: transparent;
      box-shadow: none;
    }
    .ng-journal-tracker-cells {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 6px;
    }
    .ng-journal-tracker-header {
      position: sticky;
      top: 0;
      z-index: 2;
      padding-bottom: 4px;
      background: color-mix(in srgb, var(--background-primary) 92%, transparent);
      backdrop-filter: blur(6px);
    }
    .ng-journal-tracker-header-cell {
      min-height: 54px;
      display: grid;
      place-items: center;
      border: 1px solid var(--background-modifier-border);
      border-radius: 10px;
      background: transparent;
      color: var(--text-normal);
    }
    .ng-journal-tracker-cell {
      position: relative;
      min-height: 54px;
      display: grid;
      place-items: center;
      transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease;
    }
    .ng-journal-tracker-cell.is-active {
      border-style: solid;
    }
    .ng-journal-tracker-cell.is-streak-start {
      border-top-left-radius: 999px;
      border-bottom-left-radius: 999px;
    }
    .ng-journal-tracker-cell.is-streak-mid {
      border-radius: 0;
    }
    .ng-journal-tracker-cell.is-streak-end {
      border-top-right-radius: 999px;
      border-bottom-right-radius: 999px;
    }
    .ng-journal-tracker-cell:hover {
      transform: translateY(-1px);
    }
    .ng-journal-tracker-day {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .ng-journal-tracker-streak {
      position: absolute;
      bottom: 6px;
      right: 6px;
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .ng-task-empty {
      font-size: 0.96rem;
    }
    .ng-journal-entry-page,
    .ng-journal-entry-card {
      max-width: 720px;
      margin: 0 auto;
    }
    .ng-journal-entry-page {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .ng-journal-task-group {
      display: grid;
      gap: 4px;
      margin-top: 2px;
    }
    .ng-journal-task-group h5 {
      margin: 0;
    }
    .ng-journal-task-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
    }
    .ng-journal-task-name {
      flex: 0 1 auto;
    }
    .ng-journal-task-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 88px;
      padding: 3px 8px;
      border: 1px solid;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .ng-journal-entry-page .ng-journal-task-badge {
      filter: saturate(60%);
    }
    .ng-journal-entry-page .ng-journal-task-row {
      justify-content: center;
    }
    .ng-journal-entry-card .ng-journal-task-badge {
      filter: saturate(70%);
    }
    .ng-journal-task-badge {
      margin-left: 2px;
    }
    .ng-journal-entry-card .ng-journal-task-row {
      justify-content: center;
    }
    .ng-journal-entry-card .ng-journal-body h4 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-body-markdown {
      margin-top: 18px;
    }
    .ng-journal-body-markdown h4 {
      text-align: center;
      color: var(--text-normal);
      font-size: 1.8rem;
      margin: 0;
    }
    .ng-journal-entry-subtitle {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .ng-tracker-section {
      margin-top: 22px;
    }
    .ng-journal-body-content {
      min-height: 120px;
      border: none;
      background: transparent;
      color: var(--text-normal);
      padding: 0;
      white-space: pre-wrap;
      outline: none;
      line-height: 1.6;
    }
    .ng-journal-body-content:focus {
      outline: none;
      box-shadow: none;
    }
    @media (max-width: 900px) {
      .ng-journal-layout {
        grid-template-columns: 1fr;
      }
      .ng-journal-tracker-row {
        grid-template-columns: 1fr;
      }
      .ng-journal-tracker-label {
        position: static;
      }
      .ng-journal-title-wrap {
        text-align: left;
      }
      .ng-journal-entry-page .ng-journal-title-wrap,
      .ng-journaling .ng-journal-title-wrap {
        text-align: center;
      }
    }
    @keyframes ng-energy-flow {
      from { background-position: 0% 50%; }
      to { background-position: 200% 50%; }
    }
    @keyframes ng-pulse {
      0% { background-color: transparent; }
      25% { background-color: rgba(255, 255, 255, 0.24); }
      100% { background-color: transparent; }
    }
    @keyframes ng-shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
      100% { transform: translateX(0); }
    }
    @keyframes ng-fade-out {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-6px); }
    }
    @keyframes ng-break-intro-fade {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes ng-break-message {
      0% { opacity: 0; }
      25% { opacity: 1; }
      75% { opacity: 1; }
      100% { opacity: 0; }
    }
    @media (max-width: 680px) {
      .ng-category-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ng-task-row {
        grid-template-columns: minmax(0, 1fr) auto auto auto;
      }
      .ng-effort-buttons {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `;
  document.head.appendChild(style);
}

// src/homeView.ts
var NeuralGardenHomeView = class extends import_obsidian.ItemView {
  constructor(leaf, storage, openJournalingView) {
    super(leaf);
    this.storage = storage;
    this.openJournalingView = openJournalingView;
    this.state = { ...DEFAULT_STATE };
    this.searchDebounceTimer = null;
    this.breakTickTimer = null;
    this.breakMessageTimer = null;
    this.breakTimerEl = null;
    this.breakMessageEl = null;
    this.lastBreakMessageIndex = null;
    this.refocusTaskInputAfterRender = false;
  }
  getViewType() {
    return VIEW_TYPE_NEURAL_GARDEN_HOME;
  }
  getDisplayText() {
    return "Home";
  }
  getIcon() {
    return "home";
  }
  async onOpen() {
    this.state = await this.storage.loadTaskManagerState();
    if (this.state.forcedBreakThreshold === 50) {
      this.state.forcedBreakThreshold = 70;
    }
    this.applyBreakRecovery();
    await this.storage.saveTaskManagerState(this.state);
    this.render();
    this.startBreakTicker();
  }
  async onClose() {
    if (this.searchDebounceTimer) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    if (this.breakTickTimer) {
      window.clearInterval(this.breakTickTimer);
      this.breakTickTimer = null;
    }
    if (this.breakMessageTimer) {
      window.clearInterval(this.breakMessageTimer);
      this.breakMessageTimer = null;
    }
    this.lastBreakMessageIndex = null;
  }
  startBreakTicker() {
    this.syncBreakLiveUpdates();
  }
  async persistAndRender() {
    recalculateTotals(this.state);
    this.applyBreakRecovery();
    await this.storage.saveTaskManagerState(this.state);
    this.render();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrapper = contentEl.createDiv({ cls: "neural-garden-home" });
    wrapper.createEl("h2", { text: "Home" });
    const categories = wrapper.createDiv({ cls: "ng-categories" });
    const categoryGrid = categories.createDiv({ cls: "ng-category-grid" });
    const journalButton = this.makeCategoryButton("Journaling", "book-open", () => {
      void this.openJournalingView(true, this.leaf);
    });
    categoryGrid.appendChild(journalButton);
    const notesButton = this.makeCategoryButton("My Notes", "folder", () => {
      new import_obsidian.Notice("My Notes interface placeholder");
    });
    categoryGrid.appendChild(notesButton);
    const settingsButton = this.makeCategoryButton("Settings", "settings", () => {
      new import_obsidian.Notice("Settings interface placeholder");
    });
    categoryGrid.appendChild(settingsButton);
    const quickNoteButton = this.makeCategoryButton("+ QuickNote", "pencil", () => {
      new import_obsidian.Notice("QuickNote interface placeholder");
    });
    categoryGrid.appendChild(quickNoteButton);
    if (this.shouldShowWeeklyRecapButton()) {
      const recapContainer = categories.createDiv({ cls: "ng-weekly-recap-row" });
      const weeklyRecapButton = this.makeCategoryButton(
        "Weekly Recap",
        "sparkles",
        () => {
          new import_obsidian.Notice("Weekly recap will be implemented in a later step");
        },
        "#00F0FF"
      );
      recapContainer.appendChild(weeklyRecapButton);
    }
    this.renderSearchSection(wrapper);
    this.renderTaskManager(wrapper);
    injectNeuralGardenStyles();
    this.syncBreakLiveUpdates();
  }
  renderSearchSection(parent) {
    const searchSection = parent.createDiv({ cls: "ng-search" });
    searchSection.createEl("h3", { text: "Search Notes" });
    const input = searchSection.createEl("input", {
      type: "text",
      placeholder: "Search Notes..."
    });
    input.addClass("ng-task-input");
    const results = searchSection.createDiv({ cls: "ng-search-results" });
    input.addEventListener("input", () => {
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = window.setTimeout(async () => {
        const query = input.value.trim();
        await this.updateSearchResults(query, results);
      }, 250);
    });
  }
  async updateSearchResults(query, container) {
    container.empty();
    if (query.length < 2) {
      return;
    }
    const files = this.app.vault.getFiles().filter((file) => file.path.startsWith(`${NOTES_FOLDER}/`));
    if (files.length === 0) {
      const noNotes = container.createDiv({ cls: "ng-empty" });
      noNotes.textContent = "No notes found in Notes folder yet.";
      return;
    }
    const matches = await searchNotesInFolder(this.app, query, 20);
    if (matches.length === 0) {
      const empty = container.createDiv({ cls: "ng-empty" });
      empty.textContent = "No matching notes in Notes folder.";
      return;
    }
    for (const file of matches) {
      const row = container.createDiv({ cls: "ng-search-row" });
      row.createDiv({ cls: "ng-search-title", text: file.basename });
      row.createDiv({ cls: "ng-search-path", text: file.path });
      row.addEventListener("click", async () => {
        await this.app.workspace.getLeaf(true).openFile(file);
      });
    }
  }
  renderTaskManager(parent) {
    const section = parent.createDiv({ cls: "ng-task-manager" });
    if (this.state.resting) {
      section.addClass("ng-resting");
    }
    if (this.state.overdriveMode) {
      section.addClass("ng-overdrive");
    }
    const isBreakActive = this.state.forcedBreak || this.state.resting;
    if (isBreakActive) {
      section.addClass("ng-break-locked");
    }
    const form = section.createDiv({ cls: "ng-task-form" });
    const heading = form.createDiv({ cls: "ng-task-heading" });
    heading.createEl("h3", { text: "Add New Task" });
    const overdriveButton = heading.createEl("button", { text: "Overdrive Mode" });
    overdriveButton.addClass("ng-overdrive-button");
    overdriveButton.style.borderColor = this.state.overdriveAvailability ? "#00F0FF" : "#DDDDFF";
    overdriveButton.style.color = this.state.overdriveAvailability ? "#00F0FF" : "var(--text-normal)";
    if (this.state.overdriveMode) {
      overdriveButton.addClass("is-active");
    } else if (this.state.overdriveAvailability) {
      overdriveButton.addClass("is-inactive");
    }
    overdriveButton.addEventListener("click", async () => {
      if (isBreakActive) {
        new import_obsidian.Notice("Task manager is in break mode");
        return;
      }
      if (!this.state.overdriveAvailability) {
        new import_obsidian.Notice("Overdrive currently not available");
        return;
      }
      this.state.overdriveMode = !this.state.overdriveMode;
      await this.persistAndRender();
    });
    const taskInput = form.createEl("input", { type: "text", placeholder: "Task" });
    taskInput.addClass("ng-task-input");
    taskInput.readOnly = isBreakActive;
    if (this.refocusTaskInputAfterRender) {
      this.refocusTaskInputAfterRender = false;
      window.requestAnimationFrame(() => {
        taskInput.focus();
      });
    }
    const effortRow = form.createDiv({ cls: "ng-effort-row" });
    effortRow.createDiv({ cls: "ng-effort-label", text: "Effort" });
    const progressWrap = effortRow.createDiv({ cls: "ng-progress-wrap" });
    const effectiveMaxEnergy = getEffectiveMaxEnergy(this.state);
    const currentPercent = effectiveMaxEnergy > 0 ? this.state.totalEnergy / effectiveMaxEnergy * 100 : 0;
    if (currentPercent >= 115) {
      const warning = progressWrap.createSpan({ cls: "ng-warning" });
      warning.textContent = "\u26A0";
      warning.ariaLabel = "Warning";
    }
    const barOuter = progressWrap.createDiv({ cls: "ng-progress" });
    const barInner = barOuter.createDiv({ cls: "ng-progress-fill" });
    barInner.style.width = `${Math.max(0, Math.min(currentPercent, 130))}%`;
    const pair = this.state.overdriveMode ? { primary: "#32fbff", secondary: "#87fdff" } : getEnergyStopGradientPair(currentPercent);
    const secondaryColor = this.state.overdriveMode ? pair.secondary : darkenColor(pair.secondary, 0.7);
    barInner.style.background = `linear-gradient(120deg, ${pair.primary}, ${secondaryColor}, ${pair.primary})`;
    barInner.style.backgroundSize = "200% 100%";
    const effortButtons = form.createDiv({ cls: "ng-effort-buttons" });
    for (const effort of EFFORTS) {
      const button = effortButtons.createEl("button", { text: effort.label });
      button.addClass("ng-effort-button");
      const inactiveColor = toMutedButtonColor(effort.color);
      const hoverColor = toMutedButtonColor(effort.color, 0.45, 0.42, 0.8);
      button.style.setProperty("--ng-btn-active", effort.color);
      button.style.setProperty("--ng-btn-inactive", inactiveColor);
      button.style.setProperty("--ng-btn-hover-bg", hoverColor);
      button.style.borderColor = inactiveColor;
      button.addEventListener("click", async () => {
        if (this.state.forcedBreak || this.state.resting) {
          button.addClass("is-shaking");
          window.setTimeout(() => button.removeClass("is-shaking"), 300);
          new import_obsidian.Notice("Task manager is in break mode");
          return;
        }
        const taskName = taskInput.value.trim();
        if (!taskName) {
          new import_obsidian.Notice("Please type a task first");
          return;
        }
        button.addClass("is-pulsing");
        window.setTimeout(() => button.removeClass("is-pulsing"), 500);
        this.state.tasks.unshift({
          id: createId(),
          taskName,
          effort: effort.key,
          energy: effort.energy,
          completed: false
        });
        taskInput.value = "";
        this.refocusTaskInputAfterRender = true;
        await this.persistAndRender();
      });
    }
    const listWrapper = section.createDiv({ cls: "ng-task-list" });
    if (isBreakActive) {
      this.renderForcedBreakPanel(listWrapper);
      return;
    }
    const pendingTasks = this.state.tasks.filter((task) => !task.completed);
    if (pendingTasks.length === 0) {
      const emptyTaskList = listWrapper.createDiv({ cls: "ng-empty ng-task-empty" });
      emptyTaskList.textContent = "No tasks yet. Create one above";
      return;
    }
    for (const task of pendingTasks) {
      this.renderTaskRow(listWrapper, task);
    }
  }
  renderTaskRow(container, task) {
    const row = container.createDiv({ cls: "ng-task-row" });
    row.dataset.taskId = task.id;
    const textContainer = row.createDiv({ cls: "ng-task-text" });
    const title = textContainer.createDiv({ cls: "ng-task-title", text: task.taskName });
    const badgeWrap = row.createDiv({ cls: "ng-badge-wrap" });
    const badge = badgeWrap.createEl("span", { text: effortLabel(task.effort) });
    badge.addClass("ng-badge");
    const mutedBadgeColor = toMutedButtonColor(effortColor(task.effort), 0.35, 0.35);
    badge.style.borderColor = mutedBadgeColor;
    badge.style.color = mutedBadgeColor;
    const editButton = row.createEl("button", { text: "Edit" });
    editButton.addClass("ng-row-button", "ng-edit");
    const deleteButton = row.createEl("button", { text: "X" });
    deleteButton.addClass("ng-delete");
    let editing = false;
    let titleInput = null;
    editButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!editing) {
        editing = true;
        row.addClass("ng-editing");
        editButton.textContent = "Save";
        titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = task.taskName;
        titleInput.className = "ng-task-input ng-inline-input";
        title.empty();
        title.appendChild(titleInput);
        titleInput.focus();
        return;
      }
      if (titleInput) {
        const value = titleInput.value.trim();
        if (value) {
          task.taskName = value;
        }
      }
      editing = false;
      row.removeClass("ng-editing");
      editButton.textContent = "Edit";
      await this.persistAndRender();
    });
    deleteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      this.state.tasks = this.state.tasks.filter((candidate) => candidate.id !== task.id);
      await this.persistAndRender();
    });
    row.addEventListener("click", async (event) => {
      if (editing) {
        return;
      }
      row.addClass("ng-row-disappearing");
      window.setTimeout(async () => {
        task.completed = true;
        task.completedAt = Date.now();
        this.state.spentEnergy += task.energy;
        this.state.forcedBreakEnergy += task.energy;
        this.updateForcedBreakValues();
        await this.persistAndRender();
      }, 720);
    });
  }
  renderForcedBreakPanel(container) {
    var _a;
    const panel = container.createDiv({ cls: "ng-break-panel" });
    const title = panel.createEl("h4", { text: "Forced Break" });
    if (!this.state.resting) {
      this.breakTimerEl = null;
      this.breakMessageEl = null;
      this.lastBreakMessageIndex = null;
      title.addClass("ng-break-intro-title");
      const minutes = this.getCalculatedBreakTimeMinutes();
      const windDown = panel.createDiv({ cls: "ng-break-copy", text: `Wind-down needed: ${minutes} min` });
      windDown.addClass("ng-break-intro-copy");
      const breakButton = panel.createEl("button", { text: "Break Mode" });
      breakButton.addClass("ng-break-button", "ng-break-intro-button");
      breakButton.addEventListener("click", async () => {
        const durationMinutes = this.getCalculatedBreakTimeMinutes();
        this.state.resting = true;
        this.state.forcedBreakTime = durationMinutes;
        this.state.forcedBreakEnd = Date.now() + durationMinutes * 6e4;
        await this.persistAndRender();
      });
      return;
    }
    const now = Date.now();
    const end = (_a = this.state.forcedBreakEnd) != null ? _a : now;
    const remainingMs = Math.max(0, end - now);
    const remainingMinutes = Math.floor(remainingMs / 6e4);
    const remainingSeconds = Math.floor(remainingMs % 6e4 / 1e3);
    const timer = panel.createDiv({ cls: "ng-break-timer" });
    timer.textContent = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    this.breakTimerEl = timer;
    const message = panel.createDiv({ cls: "ng-break-copy ng-break-copy-animated" });
    message.textContent = this.getNextBreakMessage();
    this.breakMessageEl = message;
  }
  syncBreakLiveUpdates() {
    if (!this.state.resting || !this.state.forcedBreakEnd || !this.breakTimerEl || !this.breakMessageEl) {
      if (this.breakTickTimer) {
        window.clearInterval(this.breakTickTimer);
        this.breakTickTimer = null;
      }
      if (this.breakMessageTimer) {
        window.clearInterval(this.breakMessageTimer);
        this.breakMessageTimer = null;
      }
      return;
    }
    const updateTimer = async () => {
      if (!this.state.resting || !this.state.forcedBreakEnd || !this.breakTimerEl) {
        return;
      }
      const now = Date.now();
      if (now >= this.state.forcedBreakEnd) {
        if (this.breakTickTimer) {
          window.clearInterval(this.breakTickTimer);
          this.breakTickTimer = null;
        }
        if (this.breakMessageTimer) {
          window.clearInterval(this.breakMessageTimer);
          this.breakMessageTimer = null;
        }
        this.resetForcedBreakState();
        await this.persistAndRender();
        return;
      }
      const remainingMs = Math.max(0, this.state.forcedBreakEnd - now);
      const remainingMinutes = Math.floor(remainingMs / 6e4);
      const remainingSeconds = Math.floor(remainingMs % 6e4 / 1e3);
      this.breakTimerEl.textContent = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };
    if (!this.breakTickTimer) {
      void updateTimer();
      this.breakTickTimer = window.setInterval(() => {
        void updateTimer();
      }, 1e3);
    }
    if (!this.breakMessageTimer && this.breakMessageEl) {
      this.breakMessageTimer = window.setInterval(() => {
        if (!this.breakMessageEl) {
          return;
        }
        this.breakMessageEl.textContent = this.getNextBreakMessage();
        this.breakMessageEl.classList.remove("ng-break-copy-animated");
        void this.breakMessageEl.offsetWidth;
        this.breakMessageEl.classList.add("ng-break-copy-animated");
      }, 12e3);
    }
  }
  getNextBreakMessage() {
    if (BREAK_MESSAGES.length === 0) {
      return "Take a short break.";
    }
    if (BREAK_MESSAGES.length === 1) {
      this.lastBreakMessageIndex = 0;
      return BREAK_MESSAGES[0];
    }
    let nextIndex = Math.floor(Math.random() * BREAK_MESSAGES.length);
    if (this.lastBreakMessageIndex !== null && nextIndex === this.lastBreakMessageIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (BREAK_MESSAGES.length - 1))) % BREAK_MESSAGES.length;
    }
    this.lastBreakMessageIndex = nextIndex;
    return BREAK_MESSAGES[nextIndex];
  }
  updateForcedBreakValues() {
    const effectiveThreshold = getEffectiveForcedBreakThreshold(this.state);
    this.state.forcedBreakEnergyEx = Math.max(0, this.state.forcedBreakEnergy - effectiveThreshold);
    this.state.forcedBreakAdd = effectiveThreshold > 0 ? this.state.forcedBreakEnergyEx / effectiveThreshold : 0;
    this.state.forcedBreakTime = this.state.forcedBreakLength + this.state.forcedBreakLength * this.state.forcedBreakAdd;
    if (this.state.forcedBreakEnergy >= effectiveThreshold) {
      this.state.forcedBreak = true;
    }
  }
  applyBreakRecovery() {
    if (!this.state.resting || !this.state.forcedBreakEnd) {
      return;
    }
    if (Date.now() >= this.state.forcedBreakEnd) {
      this.resetForcedBreakState();
    }
  }
  resetForcedBreakState() {
    this.state.forcedBreak = false;
    this.state.resting = false;
    this.state.forcedBreakEnd = void 0;
    this.state.forcedBreakEnergy = 0;
    this.state.forcedBreakEnergyEx = 0;
    this.state.forcedBreakAdd = 0;
    this.state.forcedBreakTime = this.state.forcedBreakLength;
  }
  getCalculatedBreakTimeMinutes() {
    this.updateForcedBreakValues();
    return Math.max(1, Math.round(this.state.forcedBreakTime));
  }
  shouldShowWeeklyRecapButton() {
    const dailyCandidates = this.app.vault.getFiles().filter((file) => file.path.toLowerCase().includes("daily") || file.path.toLowerCase().includes("journal"));
    return dailyCandidates.length >= WEEKLY_RECAP_MIN_ENTRIES;
  }
  makeCategoryButton(label, iconName, onClick, color = "#EC9A63") {
    var _a, _b;
    const btn = document.createElement("button");
    btn.style.padding = "16px";
    btn.style.borderRadius = "10px";
    btn.style.border = `1px solid ${color}`;
    btn.style.background = "transparent";
    btn.style.fontSize = "14px";
    btn.style.width = "100%";
    btn.style.cursor = "pointer";
    btn.style.color = "var(--text-normal)";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.gap = "8px";
    btn.style.transition = "all 0.15s ease";
    const icon = document.createElement("span");
    icon.className = "ng-category-icon";
    (_b = (_a = this.app.iconManager) == null ? void 0 : _a.setIcon) == null ? void 0 : _b.call(_a, icon, iconName);
    const text = document.createElement("span");
    text.textContent = label;
    btn.appendChild(icon);
    btn.appendChild(text);
    btn.addEventListener("mouseenter", () => {
      btn.style.borderColor = "#FFD2B0";
      btn.style.boxShadow = "0 0 0 2px rgba(236, 154, 99, 0.25)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.borderColor = color;
      btn.style.boxShadow = "none";
    });
    btn.addEventListener("touchstart", () => {
      btn.style.borderColor = "#FFD2B0";
      btn.style.boxShadow = "0 0 0 2px rgba(236, 154, 99, 0.25)";
    });
    btn.addEventListener("touchend", () => {
      window.setTimeout(() => {
        btn.style.borderColor = color;
        btn.style.boxShadow = "none";
      }, 150);
    });
    btn.onclick = onClick;
    return btn;
  }
};
function toMutedButtonColor(hex, saturationFactor = 0.7, lightnessFactor = 0.6, alpha = 1) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return hex;
  }
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = (g - b) / d % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }
  const mutedS = Math.max(0, s * saturationFactor);
  const mutedL = Math.max(0, Math.min(1, l * lightnessFactor));
  const c = (1 - Math.abs(2 * mutedL - 1)) * mutedS;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = mutedL - c / 2;
  let rr = 0;
  let gg = 0;
  let bb = 0;
  if (h < 60) {
    rr = c;
    gg = x;
  } else if (h < 120) {
    rr = x;
    gg = c;
  } else if (h < 180) {
    gg = c;
    bb = x;
  } else if (h < 240) {
    gg = x;
    bb = c;
  } else if (h < 300) {
    rr = x;
    bb = c;
  } else {
    rr = c;
    bb = x;
  }
  const outR = Math.round((rr + m) * 255);
  const outG = Math.round((gg + m) * 255);
  const outB = Math.round((bb + m) * 255);
  if (alpha < 1) {
    return `rgba(${outR}, ${outG}, ${outB}, ${alpha})`;
  }
  return `rgb(${outR}, ${outG}, ${outB})`;
}
function darkenColor(color, lightnessFactor) {
  const rgb = parseCssColor(color);
  if (!rgb) {
    return color;
  }
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const nextL = Math.max(0, Math.min(1, l * lightnessFactor));
  const nextRgb = hslToRgb(h, s, nextL);
  return `rgb(${nextRgb.r}, ${nextRgb.g}, ${nextRgb.b})`;
}
function getEnergyStopGradientPair(percent) {
  var _a, _b;
  const stops = ENERGY_STOPS.filter((stop) => stop.percent <= 100);
  if (stops.length === 0) {
    return { primary: "rgb(63, 214, 255)", secondary: "rgb(49, 201, 80)" };
  }
  if (percent <= stops[0].percent) {
    const next = (_a = stops[1]) != null ? _a : stops[0];
    return { primary: stopToCss(stops[0].color), secondary: stopToCss(next.color) };
  }
  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i];
    const next = stops[i + 1];
    if (percent >= current.percent && percent < next.percent) {
      return { primary: stopToCss(current.color), secondary: stopToCss(next.color) };
    }
    if (percent === next.percent) {
      const following = (_b = stops[i + 2]) != null ? _b : next;
      return { primary: stopToCss(next.color), secondary: stopToCss(following.color) };
    }
  }
  const last = stops[stops.length - 1];
  return { primary: stopToCss(last.color), secondary: "#FFFFFF" };
}
function stopToCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
function parseCssColor(color) {
  const hex = color.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (hex) {
    return {
      r: parseInt(hex[1].slice(0, 2), 16),
      g: parseInt(hex[1].slice(2, 4), 16),
      b: parseInt(hex[1].slice(4, 6), 16)
    };
  }
  const rgb = color.trim().match(/^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/i);
  if (rgb) {
    return {
      r: Math.max(0, Math.min(255, Number(rgb[1]))),
      g: Math.max(0, Math.min(255, Number(rgb[2]))),
      b: Math.max(0, Math.min(255, Number(rgb[3])))
    };
  }
  return null;
}
function rgbToHsl(r, g, b) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rr:
      h = (gg - bb) / d + (gg < bb ? 6 : 0);
      break;
    case gg:
      h = (bb - rr) / d + 2;
      break;
    default:
      h = (rr - gg) / d + 4;
      break;
  }
  h /= 6;
  return { h, s, l };
}
function hslToRgb(h, s, l) {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }
  const hueToRgb = (p2, q2, t) => {
    let tt = t;
    if (tt < 0) {
      tt += 1;
    }
    if (tt > 1) {
      tt -= 1;
    }
    if (tt < 1 / 6) {
      return p2 + (q2 - p2) * 6 * tt;
    }
    if (tt < 1 / 2) {
      return q2;
    }
    if (tt < 2 / 3) {
      return p2 + (q2 - p2) * (2 / 3 - tt) * 6;
    }
    return p2;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255)
  };
}

// src/journalingEntryView.ts
var import_obsidian2 = require("obsidian");
var METRICS = [
  { key: "mood", label: "Mood", explanation: "How have you been feeling today?" },
  { key: "sleep", label: "Sleep", explanation: "How rested did you feel after tonight's sleep?" },
  { key: "stress", label: "Stress", explanation: "How stressed were you today?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious today? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel today?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself today?" },
  { key: "sensoryLoad", label: "Sensory Load", explanation: "Have you had any sensory issues? How intense were they?" },
  { key: "socialLoad", label: "Social Load", explanation: "How demanding were social interactions today?" }
];
var PLEASANT_EMOTIONS = [
  "Happy",
  "Relaxed",
  "Excited",
  "Grateful",
  "Proud",
  "Settled",
  "Inspired",
  "Serene",
  "Confident",
  "Hopeful",
  "Relieved",
  "Curious"
];
var UNPLEASANT_EMOTIONS = [
  "Frustrated",
  "Anxious",
  "Overwhelmed",
  "Sad",
  "Angry",
  "Lonely",
  "Irritated",
  "Restless",
  "Drained",
  "Numb",
  "Discouraged",
  "Tense"
];
var MAX_EMOTIONS = 7;
var NeuralGardenJournalEntryView = class extends import_obsidian2.ItemView {
  constructor(leaf, taskStorage, journalingStorage, openHomeView, openJournalingView) {
    super(leaf);
    this.taskStorage = taskStorage;
    this.journalingStorage = journalingStorage;
    this.openHomeView = openHomeView;
    this.openJournalingView = openJournalingView;
    this.entry = null;
    this.editable = false;
    this.liveTaskSnapshots = null;
    this.saveChain = Promise.resolve();
  }
  getViewType() {
    return VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY;
  }
  getDisplayText() {
    return "Journal Entry";
  }
  getIcon() {
    return "book-marked";
  }
  async onOpen() {
    injectNeuralGardenStyles();
    this.renderEmpty();
  }
  async onClose() {
    this.entry = null;
    this.liveTaskSnapshots = null;
    this.saveChain = Promise.resolve();
  }
  async openForDate(dateKey, editable) {
    var _a;
    const today = currentDateKey();
    this.editable = editable && dateKey === today;
    this.entry = (_a = await this.journalingStorage.readDailyEntryByDate(dateKey)) != null ? _a : await this.createDraftEntry(dateKey);
    if (this.editable) {
      const taskState = await this.taskStorage.loadTaskManagerState();
      this.liveTaskSnapshots = {
        completed: taskState.tasks.filter((task) => task.completed).map(snapshotTask),
        uncompleted: taskState.tasks.filter((task) => !task.completed).map(snapshotTask)
      };
    } else {
      this.liveTaskSnapshots = null;
    }
    this.render();
  }
  async createDraftEntry(dateKey) {
    const taskState = await this.taskStorage.loadTaskManagerState();
    const completedSnapshots = taskState.tasks.filter((task) => task.completed).map(snapshotTask);
    const uncompletedSnapshots = taskState.tasks.filter((task) => !task.completed).map(snapshotTask);
    const entry = {
      date: dateKey,
      mood: null,
      sleep: null,
      stress: null,
      anxiety: null,
      exhaustion: null,
      regulation: null,
      sensoryLoad: null,
      socialLoad: null,
      spentEnergy: taskState.spentEnergy,
      completedTasks: completedSnapshots,
      uncompletedTasks: uncompletedSnapshots,
      processed: false,
      todaysNote: "",
      emotions: []
    };
    const created = await this.journalingStorage.createDailyEntry(entry, "");
    const persisted = await this.journalingStorage.readDailyEntryByDate(dateKey);
    const tasksWritten = persisted !== null && persisted.frontmatter.completedTasks.length === completedSnapshots.length && persisted.frontmatter.uncompletedTasks.length === uncompletedSnapshots.length;
    if (!tasksWritten) {
      await this.journalingStorage.saveDailyEntry(created.file, entry, "");
      const secondRead = await this.journalingStorage.readDailyEntryByDate(dateKey);
      const secondWriteOk = secondRead !== null && secondRead.frontmatter.completedTasks.length === completedSnapshots.length && secondRead.frontmatter.uncompletedTasks.length === uncompletedSnapshots.length;
      if (!secondWriteOk) {
        throw new Error("Failed to persist Task Manager tasks into daily note before reset.");
      }
    }
    if (dateKey === currentDateKey()) {
      taskState.maxEnergy = 100;
      taskState.totalEnergy = 0;
      taskState.spentEnergy = 0;
      taskState.tasks = [];
      taskState.forcedBreak = false;
      taskState.resting = false;
      taskState.forcedBreakEnd = void 0;
      taskState.forcedBreakEnergy = 0;
      taskState.forcedBreakEnergyEx = 0;
      taskState.forcedBreakAdd = 0;
      taskState.forcedBreakTime = taskState.forcedBreakLength;
      if (taskState.overdriveMode) {
        taskState.overdriveMode = false;
        taskState.overdriveAftereffects = true;
      } else if (taskState.overdriveAftereffects) {
        taskState.overdriveAftereffects = false;
      }
      await this.taskStorage.saveTaskManagerState(taskState);
    }
    return await this.journalingStorage.readDailyEntryByDate(dateKey);
  }
  renderEmpty() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const empty = contentEl.createDiv({ cls: "ng-journal-entry-page" });
    empty.createDiv({ cls: "ng-empty", text: "Open a journal date to start editing or reviewing it." });
  }
  render() {
    if (!this.entry) {
      this.renderEmpty();
      return;
    }
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrapper = contentEl.createDiv({ cls: "ng-journal-entry-page" });
    const topBar = wrapper.createDiv({ cls: "ng-journal-topbar" });
    topBar.appendChild(this.makeNavButton("Home", async () => this.openHomeView(true, this.leaf)));
    topBar.appendChild(this.makeNavButton("Back to Journaling", async () => this.openJournalingView(true, this.leaf)));
    const titleWrap = topBar.createDiv({ cls: "ng-journal-title-wrap" });
    titleWrap.createEl("h2", { text: `Journal Entry - ${formatReadableDate(this.entry.frontmatter.date)}` });
    titleWrap.createEl("h3", { text: "Daily Check In" });
    this.renderMetrics(wrapper);
    this.renderEmotions(wrapper);
    this.renderTasks(wrapper);
    this.renderEntryBody(wrapper);
  }
  makeNavButton(label, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = "ng-home-category-button ng-journal-nav-button";
    button.addEventListener("click", () => {
      void onClick();
    });
    return button;
  }
  renderMetrics(parent) {
    if (!this.entry) {
      return;
    }
    const block = parent.createDiv({ cls: "ng-journal-metrics" });
    for (const metric of METRICS) {
      const value = this.entry.frontmatter[metric.key];
      const row = block.createDiv({ cls: "ng-journal-metric" });
      const meta = row.createDiv({ cls: "ng-journal-metric-meta" });
      meta.createDiv({ cls: "ng-journal-metric-label", text: metric.label });
      const feedback = meta.createDiv({ cls: "ng-journal-metric-feedback", text: value === null ? metric.explanation : getMetricFeedback(metric.key, value) });
      const bar = row.createDiv({ cls: "ng-journal-progress" });
      const fill = bar.createDiv({ cls: "ng-journal-progress-fill" });
      const update = (currentValue) => {
        const next = currentValue != null ? currentValue : 0;
        fill.style.width = `${next}%`;
        fill.style.backgroundColor = metricColor(metric.key, next);
      };
      update(value);
      if (this.editable) {
        bar.style.touchAction = "none";
        const updateFromClientX = (clientX) => this.updateMetricFromPointer(clientX, metric.key, fill, bar);
        const finalizeFeedback = () => {
          if (!this.entry) {
            return;
          }
          const finalValue = this.entry.frontmatter[metric.key];
          feedback.textContent = finalValue === null ? metric.explanation : getMetricFeedback(metric.key, finalValue);
          void this.persist();
        };
        bar.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          bar.setPointerCapture(event.pointerId);
          updateFromClientX(event.clientX);
          const moveHandler = (moveEvent) => {
            if (moveEvent.pointerId !== event.pointerId) {
              return;
            }
            updateFromClientX(moveEvent.clientX);
          };
          const upHandler = () => {
            window.removeEventListener("pointermove", moveHandler);
            window.removeEventListener("pointerup", upHandler);
            window.removeEventListener("pointercancel", upHandler);
            finalizeFeedback();
          };
          window.addEventListener("pointermove", moveHandler);
          window.addEventListener("pointerup", upHandler);
          window.addEventListener("pointercancel", upHandler);
        });
        bar.addEventListener("click", (event) => {
          updateFromClientX(event.clientX);
          finalizeFeedback();
        });
      }
    }
  }
  updateMetricFromPointer(clientX, key, fill, bar) {
    if (!this.entry || !this.editable) {
      return;
    }
    const rect = bar.getBoundingClientRect();
    const nextValue = Math.max(0, Math.min(100, Math.round((clientX - rect.left) / rect.width * 100)));
    this.entry.frontmatter[key] = nextValue;
    fill.style.width = `${nextValue}%`;
    fill.style.backgroundColor = metricColor(key, nextValue);
  }
  renderEmotions(parent) {
    if (!this.entry) {
      return;
    }
    const block = parent.createDiv({ cls: "ng-journal-emotions" });
    block.createEl("h4", { text: "Emotions" });
    block.createDiv({ cls: "ng-journal-emotion-note", text: "Today's Emotions - choose up to 7 emotions that reflect your current mental state" });
    if (!this.editable) {
      this.renderEmotionList(block, this.entry.frontmatter.emotions, true);
      return;
    }
    const selected = new Set(this.entry.frontmatter.emotions);
    const renderGroup = (emotions, className) => {
      const group = block.createDiv({ cls: "ng-journal-emotion-group" });
      const buttons = group.createDiv({ cls: "ng-journal-emotion-buttons" });
      for (const emotion of emotions) {
        const button = buttons.createEl("button", { text: emotion });
        button.addClass("ng-journal-emotion-button", className);
        if (selected.has(emotion)) {
          button.addClass("is-active");
        }
        button.addEventListener("click", () => {
          if (selected.has(emotion)) {
            selected.delete(emotion);
          } else {
            if (selected.size >= MAX_EMOTIONS) {
              new import_obsidian2.Notice(`You can choose up to ${MAX_EMOTIONS} emotions.`);
              return;
            }
            selected.add(emotion);
          }
          this.entry.frontmatter.emotions = [...selected];
          this.render();
          void this.persist();
        });
      }
    };
    renderGroup(PLEASANT_EMOTIONS, "pleasant");
    renderGroup(UNPLEASANT_EMOTIONS, "unpleasant");
  }
  renderEmotionList(container, emotions, readOnly = false) {
    const wrap = container.createDiv({ cls: "ng-journal-emotion-list" });
    if (emotions.length === 0) {
      wrap.createDiv({ cls: "ng-empty", text: "No emotions were selected." });
      return;
    }
    for (const emotion of emotions) {
      const chip = wrap.createSpan({ cls: "ng-journal-emotion-chip", text: emotion });
      if (readOnly) {
        chip.addClass(getEmotionToneClass(emotion));
      }
    }
  }
  renderNote(parent) {
    if (!this.entry) {
      return;
    }
    const block = parent.createDiv({ cls: "ng-journal-note-section" });
    block.createEl("h4", { text: "A Few Words About Today" });
    const counter = block.createDiv({ cls: "ng-journal-character-count" });
    const textarea = block.createEl("textarea", { cls: "ng-journal-note-input" });
    textarea.maxLength = 150;
    textarea.value = this.entry.frontmatter.todaysNote;
    textarea.readOnly = !this.editable;
    textarea.placeholder = "Describe your day in a few words";
    counter.textContent = `${textarea.value.length}/150`;
    if (this.editable) {
      textarea.addEventListener("input", () => {
        if (!this.entry) return;
        this.entry.frontmatter.todaysNote = textarea.value.slice(0, 150);
        counter.textContent = `${this.entry.frontmatter.todaysNote.length}/150`;
        void this.persist();
      });
    }
  }
  renderTasks(parent) {
    if (!this.entry) {
      return;
    }
    const liveCompleted = this.editable && this.liveTaskSnapshots ? this.liveTaskSnapshots.completed : [];
    const liveUncompleted = this.editable && this.liveTaskSnapshots ? this.liveTaskSnapshots.uncompleted : [];
    const hasLiveTasks = liveCompleted.length > 0 || liveUncompleted.length > 0;
    const completedTasks = hasLiveTasks ? liveCompleted : this.entry.frontmatter.completedTasks;
    const uncompletedTasks = hasLiveTasks ? liveUncompleted : this.entry.frontmatter.uncompletedTasks;
    const block = parent.createDiv({ cls: "ng-journal-tasks" });
    block.createEl("h4", { text: "Tasks" });
    if (completedTasks.length > 0) {
      this.renderTaskGroup(block, "Completed Tasks", completedTasks);
    }
    if (uncompletedTasks.length > 0) {
      this.renderTaskGroup(block, "Uncompleted Tasks", uncompletedTasks);
    }
    if (completedTasks.length === 0 && uncompletedTasks.length === 0) {
      block.createDiv({ cls: "ng-empty", text: "No tasks captured." });
    }
  }
  renderTaskGroup(parent, title, tasks) {
    const group = parent.createDiv({ cls: "ng-journal-task-group" });
    group.createEl("h5", { text: title });
    for (const task of tasks) {
      const row = group.createDiv({ cls: "ng-journal-task-row" });
      row.createDiv({ cls: "ng-journal-task-name", text: task.taskName });
      const badge = row.createSpan({ cls: "ng-journal-task-badge", text: effortLabel(task.effort) });
      badge.style.borderColor = effortColor(task.effort);
      badge.style.color = effortColor(task.effort);
    }
  }
  renderEntryBody(parent) {
    if (!this.entry) {
      return;
    }
    const block = parent.createDiv({ cls: "ng-journal-body ng-journal-body-markdown" });
    block.createEl("h4", { text: "Entry" });
    block.createDiv({ cls: "ng-journal-entry-subtitle", text: "Write your journal entry below when you are ready." });
    const body = block.createDiv({ cls: "ng-journal-body-content" });
    body.textContent = this.entry.body;
    body.contentEditable = String(this.editable);
    body.spellcheck = true;
    body.addEventListener("input", () => {
      var _a;
      if (!this.entry || !this.editable) {
        return;
      }
      this.entry.body = (_a = body.textContent) != null ? _a : "";
    });
    body.addEventListener("blur", () => {
      var _a;
      if (!this.entry || !this.editable) {
        return;
      }
      this.entry.body = (_a = body.textContent) != null ? _a : "";
      void this.persist();
    });
  }
  async persist() {
    if (!this.entry || !this.editable) {
      return;
    }
    const file = this.entry.file;
    const next = async () => {
      await this.journalingStorage.saveDailyEntry(file, this.entry.frontmatter, this.entry.body);
    };
    this.saveChain = this.saveChain.then(next).catch(() => void 0);
    await this.saveChain;
  }
};
function snapshotTask(task) {
  return { taskName: task.taskName, effort: task.effort, energy: task.energy };
}
function currentDateKey() {
  const date = /* @__PURE__ */ new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function formatReadableDate(dateKey) {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateKey;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString(void 0, { day: "numeric", month: "long", year: "numeric" });
}
function metricColor(metric, value) {
  if (metric === "regulation") {
    if (value >= 70) return "#39E05A";
    if (value >= 50) return "#F4D35E";
    return "#FF6565";
  }
  if (metric === "mood") {
    if (value > 90) return "#EC9A63";
    if (value >= 51) return "#39E05A";
    if (value >= 21) return "#F0A04C";
    return "#FF6565";
  }
  if (metric === "sleep") {
    if (value >= 51) return "#39E05A";
    if (value >= 21) return "#F0A04C";
    return "#FF6565";
  }
  if (value >= 81) return "#FF6565";
  if (value >= 61) return "#E06E2C";
  if (value >= 41) return "#F0A04C";
  if (value >= 21) return "#F4D35E";
  return "#39E05A";
}
function getMetricFeedback(metric, value) {
  if (metric === "mood") {
    if (value > 80) return "I've been doing great.";
    if (value > 65) return "I've been doing fine.";
    if (value > 50) return "I've been alright.";
    if (value > 35) return "I've felt a bit off, but I'm still getting through the day.";
    return "I've been having a hard time today.";
  }
  if (metric === "sleep") {
    if (value > 80) return "My sleep was great, I feel well rested.";
    if (value > 65) return "My sleep was good, I feel rested.";
    if (value > 50) return "My sleep was alright.";
    if (value > 35) return "I've been struggling, my sleep wasn't very restful.";
    return "I've had a terrible night.";
  }
  if (metric === "stress") {
    if (value > 80) return "I've been constantly stressed today.";
    if (value > 65) return "I was really stressed today.";
    if (value > 35) return "Stress has been noticeable, but I am still managing it.";
    return "Stress has been fairly low today.";
  }
  if (metric === "anxiety") {
    if (value > 80) return "I've been constantly and severely anxious today.";
    if (value > 65) return "I was really anxious today.";
    if (value > 35) return "I've been dealing with some anxiety, but it is not overwhelming right now.";
    if (value > 20) return "I've been a little anxious today.";
    return "I had low or no anxiety.";
  }
  if (metric === "exhaustion") {
    if (value > 80) return "I've felt extremely exhausted all day.";
    if (value > 65) return "I felt heavily exhausted today.";
    if (value > 35) return "I was noticeably tired, but still functioning.";
    if (value > 20) return "I felt a little tired today.";
    return "My energy felt steady today.";
  }
  if (metric === "sensoryLoad") {
    if (value > 80) return "I was in sensory overload today.";
    if (value > 65) return "I've had demanding sensory issues today.";
    if (value > 35) return "I've had medium sensory issues.";
    if (value > 20) return "I've had some sensory issues today.";
    return "I've had no or low sensory issues.";
  }
  if (metric === "socialLoad") {
    if (value > 80) return "Social interactions were highly demanding, wearing me out.";
    if (value > 65) return "Social interactions were exhausting.";
    if (value > 35) return "Social interactions were tiring today.";
    if (value > 20) return "Social interactions were alright, but still a little tiring.";
    return "Social interactions felt good, easy, and natural.";
  }
  if (value > 80) return "Regulation felt strong and steady today.";
  if (value > 60) return "I was mostly able to regulate myself today.";
  if (value > 40) return "Regulation was mixed, with some difficult moments.";
  if (value > 20) return "I struggled with regulation today.";
  return "I felt overwhelmed and dysregulated today.";
}
function getEmotionToneClass(emotion) {
  return PLEASANT_EMOTIONS.includes(emotion) ? "pleasant" : "unpleasant";
}

// src/journalingView.ts
var import_obsidian3 = require("obsidian");
var METRICS2 = [
  { key: "mood", label: "Mood", explanation: "How have you been feeling today?" },
  { key: "sleep", label: "Sleep", explanation: "How rested did you feel after tonight's sleep?" },
  { key: "stress", label: "Stress", explanation: "How stressed were you today?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious today? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel today?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself today?" },
  { key: "sensoryLoad", label: "Sensory Load", explanation: "Have you had any sensory issues? How intense were they?" },
  { key: "socialLoad", label: "Social Load", explanation: "How demanding were social interactions today?" }
];
var PLEASANT_EMOTIONS2 = [
  "Happy",
  "Relaxed",
  "Excited",
  "Grateful",
  "Proud",
  "Settled",
  "Inspired",
  "Serene",
  "Confident",
  "Hopeful",
  "Relieved",
  "Curious"
];
var TRACKER_DAYS = 21;
var NeuralGardenJournalingView = class extends import_obsidian3.ItemView {
  constructor(leaf, taskStorage, journalingStorage, openHomeView, openJournalEntryView) {
    super(leaf);
    this.taskStorage = taskStorage;
    this.journalingStorage = journalingStorage;
    this.openHomeView = openHomeView;
    this.openJournalEntryView = openJournalEntryView;
    this.section = "daily";
    this.calendarMonth = startOfMonth(/* @__PURE__ */ new Date());
    this.selectedDateKey = todayKey();
    this.dailyEntries = [];
    this.trackers = [];
    this.selectedEntry = null;
  }
  getViewType() {
    return VIEW_TYPE_NEURAL_GARDEN_JOURNALING;
  }
  getDisplayText() {
    return "Journaling";
  }
  getIcon() {
    return "book-open";
  }
  async onOpen() {
    injectNeuralGardenStyles();
    await this.reloadState();
    this.render();
  }
  async onClose() {
    this.selectedEntry = null;
  }
  async reloadState() {
    var _a, _b;
    await this.journalingStorage.ensureJournalFolders();
    this.dailyEntries = await this.journalingStorage.listDailyEntries();
    this.trackers = (await this.journalingStorage.listTrackers()).slice(0, 18);
    if (!this.dailyEntries.some((entry) => entry.frontmatter.date === this.selectedDateKey)) {
      const latest = this.dailyEntries[this.dailyEntries.length - 1];
      if (latest) {
        this.selectedDateKey = latest.frontmatter.date;
      }
    }
    this.calendarMonth = startOfMonth((_a = parseDateKey(this.selectedDateKey)) != null ? _a : /* @__PURE__ */ new Date());
    this.selectedEntry = (_b = this.dailyEntries.find((entry) => entry.frontmatter.date === this.selectedDateKey)) != null ? _b : null;
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrapper = contentEl.createDiv({ cls: "ng-journaling" });
    const topBar = wrapper.createDiv({ cls: "ng-journal-topbar" });
    const homeButton = topBar.createEl("button", { text: "Home" });
    homeButton.addClass("ng-journal-nav-button");
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });
    const titleWrap = topBar.createDiv({ cls: "ng-journal-title-wrap" });
    titleWrap.createEl("h2", { text: "Journal Hub" });
    const modeBar = wrapper.createDiv({ cls: "ng-journal-modebar" });
    this.makeModeButton(modeBar, "daily", "Daily Journal");
    this.makeModeButton(modeBar, "weekly", "Weekly Recap");
    this.makeModeButton(modeBar, "monthly", "Monthly Reflection");
    if (this.section === "daily") {
      this.renderDailySection(wrapper);
      return;
    }
    this.renderPlaceholder(wrapper, this.section);
  }
  makeModeButton(container, section, label) {
    const button = container.createEl("button", { text: label });
    button.addClass("ng-journal-mode-button");
    if (this.section === section) {
      button.addClass("is-active");
    }
    button.addEventListener("click", () => {
      this.section = section;
      this.render();
    });
  }
  renderPlaceholder(parent, section) {
    const placeholder = parent.createDiv({ cls: "ng-journal-placeholder" });
    placeholder.createEl("h3", { text: section === "weekly" ? "Weekly Recap" : "Monthly Reflection" });
    placeholder.createDiv({
      cls: "ng-empty",
      text: section === "weekly" ? "Weekly recap is intentionally left as a placeholder for now." : "Monthly reflection is intentionally left as a placeholder for now."
    });
  }
  renderDailySection(parent) {
    const section = parent.createDiv({ cls: "ng-journal-daily" });
    const header = section.createDiv({ cls: "ng-journal-daily-header" });
    const today = todayKey();
    const hasTodayEntry = this.dailyEntries.some((entry) => entry.frontmatter.date === today);
    const createButton = header.createEl("button", { text: "Create Todays Entry" });
    createButton.addClass("ng-journal-create-button");
    createButton.disabled = hasTodayEntry;
    if (!createButton.disabled) {
      createButton.addClass("is-highlighted");
      createButton.addEventListener("click", async () => {
        await this.openJournalEntryView(today, true, this.leaf);
      });
    }
    const monthRow = section.createDiv({ cls: "ng-journal-month-row" });
    const prevButton = monthRow.createEl("button", { text: "Previous" });
    prevButton.addClass("ng-journal-mode-button");
    monthRow.createDiv({ cls: "ng-journal-month-label", text: formatMonthLabel(this.calendarMonth) });
    const nextButton = monthRow.createEl("button", { text: "Next" });
    nextButton.addClass("ng-journal-mode-button");
    prevButton.addEventListener("click", () => {
      this.calendarMonth = addMonths(this.calendarMonth, -1);
      this.render();
    });
    nextButton.addEventListener("click", () => {
      this.calendarMonth = addMonths(this.calendarMonth, 1);
      this.render();
    });
    const calendar = section.createDiv({ cls: "ng-journal-calendar-panel" });
    calendar.createEl("h3", { text: "Journal Calendar" });
    this.renderCalendar(calendar);
    const details = section.createDiv({ cls: "ng-journal-detail-panel" });
    this.renderSelectedEntry(details);
    const trackerSection = section.createDiv({ cls: "ng-tracker-section" });
    this.renderTrackers(trackerSection);
  }
  renderCalendar(container) {
    const grid = container.createDiv({ cls: "ng-journal-calendar-grid" });
    for (const label of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
      grid.createDiv({ cls: "ng-journal-calendar-weekday", text: label });
    }
    const cells = buildCalendarCells(this.calendarMonth);
    for (const cell of cells) {
      const wasSelected = cell.dateKey === this.selectedDateKey;
      const button = grid.createEl("button");
      button.addClass("ng-journal-day-cell");
      if (cell.outsideMonth) {
        button.addClass("is-outside-month");
      }
      if (cell.dateKey === todayKey()) {
        button.addClass("is-today");
      }
      if (cell.dateKey === this.selectedDateKey) {
        button.addClass("is-selected");
      }
      const hasEntry = this.dailyEntries.some((entry) => entry.frontmatter.date === cell.dateKey);
      if (hasEntry) {
        button.addClass("has-entry");
      }
      button.createDiv({ cls: "ng-journal-day-number", text: String(cell.day) });
      if (hasEntry) {
        button.createDiv({ cls: "ng-journal-day-dot" });
      }
      button.addEventListener("click", async (event) => {
        var _a, _b;
        this.selectedDateKey = cell.dateKey;
        this.calendarMonth = startOfMonth((_a = parseDateKey(cell.dateKey)) != null ? _a : /* @__PURE__ */ new Date());
        this.selectedEntry = (_b = this.dailyEntries.find((entry) => entry.frontmatter.date === cell.dateKey)) != null ? _b : null;
        const isToday = cell.dateKey === todayKey();
        if ((hasEntry || isToday) && wasSelected) {
          const inNewSplit = event.metaKey || event.ctrlKey;
          const targetLeaf = inNewSplit ? this.app.workspace.getLeaf(true) : this.leaf;
          await this.openJournalEntryView(cell.dateKey, isToday, targetLeaf);
          return;
        }
        this.render();
      });
    }
  }
  renderSelectedEntry(container) {
    const entry = this.selectedEntry;
    const card = container.createDiv({ cls: "ng-journal-entry-card" });
    if (!entry) {
      card.createEl("h3", { text: "No Entry" });
      card.createDiv({ cls: "ng-empty", text: "Select a day with an entry to view its stats." });
      return;
    }
    card.createEl("h3", { text: `Journal Entry - ${formatReadableDate2(entry.frontmatter.date)}` });
    this.renderMetrics(card, entry.frontmatter);
    this.renderEmotionList(card, entry.frontmatter.emotions, true);
    this.renderTaskSnapshots(card, entry.frontmatter);
    this.renderBody(card, entry.body);
  }
  renderMetrics(container, frontmatter) {
    const grid = container.createDiv({ cls: "ng-journal-metrics" });
    for (const metric of METRICS2) {
      const value = frontmatter[metric.key];
      const row = grid.createDiv({ cls: "ng-journal-metric" });
      const meta = row.createDiv({ cls: "ng-journal-metric-meta" });
      meta.createDiv({ cls: "ng-journal-metric-label", text: metric.label });
      const bar = row.createDiv({ cls: "ng-journal-progress ng-journal-progress-readonly" });
      const fill = bar.createDiv({ cls: "ng-journal-progress-fill" });
      const nextValue = value != null ? value : 0;
      fill.style.width = `${nextValue}%`;
      fill.style.backgroundColor = metricColor2(metric.key, nextValue);
    }
  }
  renderEmotionList(container, emotions, readOnly = false) {
    const block = container.createDiv({ cls: "ng-journal-emotions" });
    block.createEl("h4", { text: "Emotions" });
    const list = block.createDiv({ cls: "ng-journal-emotion-list" });
    if (emotions.length === 0) {
      list.createDiv({ cls: "ng-empty", text: "No emotions were selected." });
      return;
    }
    for (const emotion of emotions) {
      const chip = list.createSpan({ cls: "ng-journal-emotion-chip", text: emotion });
      if (readOnly) {
        chip.addClass(getEmotionToneClass2(emotion));
      }
    }
  }
  renderTaskSnapshots(container, frontmatter) {
    const hasTasks = frontmatter.completedTasks.length > 0 || frontmatter.uncompletedTasks.length > 0;
    if (!hasTasks) {
      return;
    }
    const tasks = container.createDiv({ cls: "ng-journal-tasks" });
    tasks.createEl("h4", { text: "Tasks" });
    this.renderTaskSnapshotGroup(tasks, "Completed Tasks", frontmatter.completedTasks);
    this.renderTaskSnapshotGroup(tasks, "Uncompleted Tasks", frontmatter.uncompletedTasks);
  }
  renderTaskSnapshotGroup(container, title, tasks) {
    if (tasks.length === 0) {
      return;
    }
    const group = container.createDiv({ cls: "ng-journal-task-group" });
    group.createEl("h5", { text: title });
    for (const task of tasks) {
      const row = group.createDiv({ cls: "ng-journal-task-row" });
      row.createDiv({ cls: "ng-journal-task-name", text: task.taskName });
      const badge = row.createSpan({ cls: "ng-journal-task-badge", text: effortLabel(task.effort) });
      badge.style.borderColor = effortColor(task.effort);
      badge.style.color = effortColor(task.effort);
    }
  }
  renderEntryMeta(container, frontmatter) {
    const meta = container.createDiv({ cls: "ng-journal-meta-grid" });
    meta.createDiv({ text: `Processed: ${frontmatter.processed ? "Yes" : "No"}` });
    meta.createDiv({ text: `Mood value: ${valueOrDash(frontmatter.mood)}` });
    meta.createDiv({ text: `Sleep value: ${valueOrDash(frontmatter.sleep)}` });
    meta.createDiv({ text: `Stress value: ${valueOrDash(frontmatter.stress)}` });
    meta.createDiv({ text: `Anxiety value: ${valueOrDash(frontmatter.anxiety)}` });
    meta.createDiv({ text: `Regulation value: ${valueOrDash(frontmatter.regulation)}` });
    meta.createDiv({ text: `Sensory load value: ${valueOrDash(frontmatter.sensoryLoad)}` });
    meta.createDiv({ text: `Social load value: ${valueOrDash(frontmatter.socialLoad)}` });
  }
  renderBody(container, body) {
    const section = container.createDiv({ cls: "ng-journal-body" });
    section.createEl("h4", { text: "Entry" });
    section.createDiv({ cls: "ng-journal-body-copy", text: body.length > 0 ? body : "No entry text yet." });
  }
  renderTrackers(container) {
    const section = container.createDiv({ cls: "ng-journal-trackers" });
    section.createEl("h3", { text: "Trackers" });
    const createRow = section.createDiv({ cls: "ng-journal-tracker-create-row" });
    const nameInput = createRow.createEl("input", { type: "text", placeholder: "Tracker name" });
    nameInput.classList.add("ng-journal-tracker-name");
    const colorInput = createRow.createEl("input", { type: "color" });
    colorInput.value = "#EC9A63";
    const addButton = createRow.createEl("button", { text: "+" });
    addButton.classList.add("ng-journal-tracker-add");
    addButton.addEventListener("click", async () => {
      const trackerName = nameInput.value.trim();
      if (!trackerName) {
        new import_obsidian3.Notice("Please enter a tracker name first.");
        return;
      }
      await this.journalingStorage.upsertTracker(trackerName, colorInput.value);
      nameInput.value = "";
      await this.reloadState();
      this.render();
    });
    const list = section.createDiv({ cls: "ng-journal-tracker-list" });
    if (this.trackers.length === 0) {
      list.createDiv({ cls: "ng-empty", text: `No trackers yet. Add one above in ${TRACKER_FOLDER}.` });
      return;
    }
    const visibleDates = buildTrackerWindow(TRACKER_DAYS);
    const header = list.createDiv({ cls: "ng-journal-tracker-header ng-journal-tracker-row" });
    header.createDiv({ cls: "ng-journal-tracker-label ng-journal-tracker-label-empty" });
    const headerCells = header.createDiv({ cls: "ng-journal-tracker-cells" });
    for (const date of visibleDates) {
      const cell = headerCells.createDiv({ cls: "ng-journal-tracker-header-cell" });
      cell.createDiv({ cls: "ng-journal-tracker-day", text: String(date.day) });
      if (date.dateKey === todayKey()) {
        cell.addClass("is-today");
      }
    }
    for (const tracker of this.trackers) {
      const row = list.createDiv({ cls: "ng-journal-tracker-row" });
      const label = row.createDiv({ cls: "ng-journal-tracker-label", text: tracker.name });
      label.style.borderColor = tracker.color;
      label.title = tracker.file.path;
      const cells = row.createDiv({ cls: "ng-journal-tracker-cells" });
      for (let index = 0; index < visibleDates.length; index += 1) {
        const cellDate = visibleDates[index];
        const isTracked = tracker.dates.includes(cellDate.dateKey);
        const hasPrev = index > 0 && tracker.dates.includes(visibleDates[index - 1].dateKey);
        const hasNext = index < visibleDates.length - 1 && tracker.dates.includes(visibleDates[index + 1].dateKey);
        const cell = cells.createEl("button");
        cell.addClass("ng-journal-tracker-cell");
        if (isTracked) {
          cell.addClass("is-active");
          cell.style.borderColor = tracker.color;
          cell.style.backgroundColor = `${tracker.color}22`;
          if (!hasPrev) {
            cell.addClass("is-streak-start");
          }
          if (!hasNext) {
            cell.addClass("is-streak-end");
          }
          if (hasPrev && hasNext) {
            cell.addClass("is-streak-mid");
          }
        }
        cell.createDiv({ cls: "ng-journal-tracker-day", text: String(cellDate.day) });
        const streak = streakEndingAt(tracker.dates, cellDate.dateKey);
        if (streak > 1) {
          cell.createDiv({ cls: "ng-journal-tracker-streak", text: String(streak) });
        }
        cell.addEventListener("click", async () => {
          const next = await this.journalingStorage.toggleTrackerDate(tracker, cellDate.dateKey);
          this.trackers = this.trackers.map((candidate) => candidate.file.path === next.file.path ? next : candidate);
          this.render();
        });
      }
    }
  }
};
function valueOrDash(value) {
  return value === null ? "-" : String(value);
}
function todayKey() {
  return formatDateKey(/* @__PURE__ */ new Date());
}
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function parseDateKey(dateKey) {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
function formatMonthLabel(date) {
  return date.toLocaleDateString(void 0, { month: "long", year: "numeric" });
}
function formatReadableDate2(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  const day = date.getDate();
  return `${day}${ordinalSuffix(day)} of ${date.toLocaleDateString(void 0, { month: "long", year: "numeric" })}`;
}
function ordinalSuffix(day) {
  if (day % 100 >= 11 && day % 100 <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
function buildCalendarCells(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    cells.push({
      dateKey: formatDateKey(date),
      day: date.getDate(),
      outsideMonth: date.getMonth() !== month.getMonth()
    });
  }
  return cells;
}
function buildTrackerWindow(days) {
  const today = /* @__PURE__ */ new Date();
  const cells = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    cells.push({ dateKey: formatDateKey(date), day: date.getDate() });
  }
  return cells;
}
function streakEndingAt(dates, dateKey) {
  if (!dates.includes(dateKey)) {
    return 0;
  }
  let streak = 1;
  let cursor = parseDateKey(dateKey);
  if (!cursor) {
    return 0;
  }
  while (true) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
    const previous = formatDateKey(cursor);
    if (!dates.includes(previous)) {
      break;
    }
    streak += 1;
  }
  return streak;
}
function metricColor2(metric, value) {
  const clamped = Math.max(0, Math.min(100, value));
  if (metric === "regulation") {
    if (clamped >= 70) return "#39E05A";
    if (clamped >= 50) return "#F4D35E";
    return "#FF6565";
  }
  if (metric === "mood") {
    if (clamped > 90) return "#EC9A63";
    if (clamped >= 51) return "#39E05A";
    if (clamped >= 21) return "#F0A04C";
    return "#FF6565";
  }
  if (metric === "sleep") {
    if (clamped >= 51) return "#39E05A";
    if (clamped >= 21) return "#F0A04C";
    return "#FF6565";
  }
  if (metric === "stress" || metric === "anxiety" || metric === "exhaustion" || metric === "sensoryLoad" || metric === "socialLoad") {
    if (clamped >= 81) return "#FF6565";
    if (clamped >= 61) return "#E06E2C";
    if (clamped >= 41) return "#F0A04C";
    if (clamped >= 21) return "#F4D35E";
    return "#39E05A";
  }
  if (clamped >= 81) return "#9BE7FF";
  if (clamped >= 61) return "#6FD8FF";
  if (clamped >= 41) return "#39E05A";
  if (clamped >= 21) return "#F0A04C";
  return "#3FD6FF";
}
function getEmotionToneClass2(emotion) {
  return PLEASANT_EMOTIONS2.includes(emotion) ? "pleasant" : "unpleasant";
}

// src/journalingStorage.ts
var import_obsidian4 = require("obsidian");
var FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n?/;
var ENTRY_HEADING_REGEX = /^# Entry\s*(?:\n|\r\n)+/i;
var JournalingStorage = class {
  constructor(app) {
    this.app = app;
  }
  async ensureJournalFolders() {
    await this.ensureFolderExists(JOURNAL_DAILY_FOLDER);
    await this.ensureFolderExists(JOURNAL_WEEKLY_FOLDER);
    await this.ensureFolderExists(JOURNAL_MONTHLY_FOLDER);
    await this.ensureFolderExists(TRACKER_FOLDER);
  }
  async listDailyEntries() {
    const files = this.app.vault.getFiles().filter((file) => file.path.startsWith(`${JOURNAL_DAILY_FOLDER}/`) && file.extension === "md");
    const entries = await Promise.all(files.map(async (file) => this.readDailyEntry(file)));
    return entries.sort((left, right) => left.frontmatter.date.localeCompare(right.frontmatter.date));
  }
  async readDailyEntryByDate(dateKey) {
    const file = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
    if (!(file instanceof import_obsidian4.TFile)) {
      return null;
    }
    return this.readDailyEntry(file);
  }
  async createDailyEntry(frontmatter, bodyText) {
    const file = await this.ensureDailyFile(frontmatter.date);
    await this.app.vault.modify(file, this.buildDailyContent(frontmatter, bodyText));
    return { file, frontmatter, body: bodyText };
  }
  async saveDailyEntry(file, frontmatter, bodyText) {
    await this.app.vault.modify(file, this.buildDailyContent(frontmatter, bodyText));
  }
  async listTrackers() {
    const files = this.app.vault.getFiles().filter((file) => file.path.startsWith(`${TRACKER_FOLDER}/`) && file.extension === "md");
    const trackers = await Promise.all(files.map(async (file) => this.readTracker(file)));
    return trackers.sort((left, right) => left.name.localeCompare(right.name));
  }
  async upsertTracker(name, color) {
    const fileName = sanitizeFileName(name);
    const path = `${TRACKER_FOLDER}/${fileName}.md`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    const dates = existing instanceof import_obsidian4.TFile ? (await this.readTracker(existing)).dates : [];
    const file = existing instanceof import_obsidian4.TFile ? existing : await this.createTrackerFile(path, name, color, dates);
    const frontmatter = { Date: dates, color };
    await this.writeTrackerFile(file, name, frontmatter, dates);
    return { file, name, frontmatter, dates, color };
  }
  async toggleTrackerDate(tracker, dateKey) {
    const nextDates = tracker.dates.includes(dateKey) ? tracker.dates.filter((candidate) => candidate !== dateKey) : [...tracker.dates, dateKey];
    nextDates.sort();
    const frontmatter = { Date: nextDates, color: tracker.color };
    await this.writeTrackerFile(tracker.file, tracker.name, frontmatter, nextDates);
    return { ...tracker, frontmatter, dates: nextDates };
  }
  async ensureDailyFile(dateKey) {
    const existing = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
    if (existing instanceof import_obsidian4.TFile) {
      return existing;
    }
    await this.ensureFolderExists(JOURNAL_DAILY_FOLDER);
    try {
      return await this.app.vault.create(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`, this.buildDailyContent(defaultDailyFrontmatter(dateKey), ""));
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
      if (createdByOtherCall instanceof import_obsidian4.TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create daily journal file for ${dateKey}`);
    }
  }
  async readDailyEntry(file) {
    const content = await this.app.vault.read(file);
    const frontmatter = this.normalizeDailyFrontmatter(this.extractFrontmatter(content), file.basename);
    const body = this.extractEntryBody(content);
    return { file, frontmatter, body };
  }
  async readTracker(file) {
    const content = await this.app.vault.read(file);
    const frontmatter = this.normalizeTrackerFrontmatter(this.extractFrontmatter(content));
    return {
      file,
      name: file.basename,
      frontmatter,
      dates: frontmatter.Date,
      color: frontmatter.color
    };
  }
  async createTrackerFile(path, name, color, dates) {
    await this.ensureFolderExists(TRACKER_FOLDER);
    const frontmatter = { Date: dates, color };
    const content = this.buildTrackerContent(name, frontmatter, dates);
    try {
      return await this.app.vault.create(path, content);
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(path);
      if (createdByOtherCall instanceof import_obsidian4.TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create tracker note at ${path}`);
    }
  }
  async writeTrackerFile(file, name, frontmatter, dates) {
    await this.app.vault.modify(file, this.buildTrackerContent(name, frontmatter, dates));
  }
  buildDailyContent(frontmatter, bodyText) {
    const body = bodyText.replace(/\s+$/, "");
    const entryBody = body.length > 0 ? `# Entry

${body}
` : `# Entry
`;
    return `${this.serializeFrontmatter(frontmatter)}
${entryBody}`;
  }
  buildTrackerContent(name, frontmatter, dates = frontmatter.Date) {
    const safeDates = [...dates].sort();
    const content = `# ${name}
`;
    return `${this.serializeFrontmatter({ Date: safeDates, color: frontmatter.color })}
${content}`;
  }
  extractFrontmatter(content) {
    const match = content.match(FRONTMATTER_REGEX);
    if (!match) {
      return {};
    }
    const parsed = (0, import_obsidian4.parseYaml)(match[0].replace(/^---\n|\n---\n?$/g, ""));
    return parsed != null ? parsed : {};
  }
  extractEntryBody(content) {
    const withoutFrontmatter = content.replace(FRONTMATTER_REGEX, "");
    return withoutFrontmatter.replace(ENTRY_HEADING_REGEX, "").replace(/\s+$/, "");
  }
  serializeFrontmatter(frontmatter) {
    return `---
${(0, import_obsidian4.stringifyYaml)(frontmatter).replace(/\s+$/, "")}
---`;
  }
  normalizeDailyFrontmatter(raw, fallbackDate) {
    return {
      date: stringOr(raw.date, fallbackDate),
      mood: numberOrNullable(raw.mood),
      sleep: numberOrNullable(raw.sleep),
      stress: numberOrNullable(raw.stress),
      anxiety: numberOrNullable(raw.anxiety),
      exhaustion: numberOrNullable(raw.exhaustion),
      regulation: numberOrNullable(raw.regulation),
      sensoryLoad: numberOrNullable(raw.sensoryLoad),
      socialLoad: numberOrNullable(raw.socialLoad),
      spentEnergy: numberOr2(raw.spentEnergy, 0),
      completedTasks: snapshotArray(raw.completedTasks),
      uncompletedTasks: snapshotArray(raw.uncompletedTasks),
      processed: booleanOr(raw.processed, false),
      todaysNote: stringOr(raw.todaysNote, ""),
      emotions: stringArrayOr(raw.emotions)
    };
  }
  normalizeTrackerFrontmatter(raw) {
    return {
      Date: stringArrayOr(raw.Date),
      color: stringOr(raw.color, "#EC9A63")
    };
  }
  async ensureFolderExists(path) {
    const segments = path.split("/").filter(Boolean);
    let currentPath = "";
    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (this.app.vault.getAbstractFileByPath(currentPath)) {
        continue;
      }
      try {
        await this.app.vault.createFolder(currentPath);
      } catch (e) {
        if (this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
      }
    }
  }
};
function defaultDailyFrontmatter(dateKey) {
  return {
    date: dateKey,
    mood: null,
    sleep: null,
    stress: null,
    anxiety: null,
    exhaustion: null,
    regulation: null,
    sensoryLoad: null,
    socialLoad: null,
    spentEnergy: 0,
    completedTasks: [],
    uncompletedTasks: [],
    processed: false,
    todaysNote: "",
    emotions: []
  };
}
function sanitizeFileName(name) {
  const cleaned = name.trim().replace(/[\\/:*?"<>|#^]/g, "-").replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : "Untitled Tracker";
}
function stringOr(value, fallback) {
  return typeof value === "string" ? value : fallback;
}
function booleanOr(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function numberOr2(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function numberOrNullable(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function stringArrayOr(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item)).filter((item) => item.length > 0);
}
function snapshotArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return void 0;
    }
    const record = item;
    return {
      taskName: typeof record.taskName === "string" ? record.taskName : "Untitled Task",
      effort: typeof record.effort === "string" ? record.effort : "easy",
      energy: typeof record.energy === "number" && Number.isFinite(record.energy) ? record.energy : 15
    };
  }).filter((item) => item !== void 0);
}

// src/storage.ts
var import_obsidian5 = require("obsidian");
var TaskManagerStorage = class {
  constructor(app) {
    this.app = app;
  }
  async ensureTaskManagerFile() {
    const existing = this.app.vault.getAbstractFileByPath(TASK_MANAGER_FILE_PATH);
    if (existing instanceof import_obsidian5.TFile) {
      return existing;
    }
    const folderPath = TASK_MANAGER_FILE_PATH.split("/").slice(0, -1).join("/");
    if (folderPath) {
      await this.ensureFolderExists(folderPath);
    }
    const fileContent = `${this.serializeFrontmatter(DEFAULT_STATE)}
# Task Manager
`;
    try {
      return await this.app.vault.create(TASK_MANAGER_FILE_PATH, fileContent);
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(TASK_MANAGER_FILE_PATH);
      if (createdByOtherCall instanceof import_obsidian5.TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create task manager file at ${TASK_MANAGER_FILE_PATH}`);
    }
  }
  async loadTaskManagerState() {
    const file = await this.ensureTaskManagerFile();
    const content = await this.app.vault.read(file);
    const frontmatter = this.extractFrontmatter(content);
    return normalizeState({ ...DEFAULT_STATE, ...frontmatter });
  }
  async saveTaskManagerState(state) {
    const file = await this.ensureTaskManagerFile();
    const content = await this.app.vault.read(file);
    const normalized = normalizeState(state);
    const frontmatterText = this.serializeFrontmatter(normalized);
    const next = content.match(/^---\n[\s\S]*?\n---\n?/) ? content.replace(/^---\n[\s\S]*?\n---\n?/, `${frontmatterText}
`) : `${frontmatterText}
${content}`;
    await this.app.vault.modify(file, next);
  }
  async ensureNotesFolder() {
    await this.ensureFolderExists(NOTES_FOLDER);
  }
  async ensureFolderExists(path) {
    const segments = path.split("/").filter(Boolean);
    let currentPath = "";
    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (this.app.vault.getAbstractFileByPath(currentPath)) {
        continue;
      }
      try {
        await this.app.vault.createFolder(currentPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const lower = message.toLowerCase();
        if (lower.includes("already exists")) {
          continue;
        }
        if (this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
        const existsOnDisk = await this.app.vault.adapter.exists(currentPath);
        if (existsOnDisk) {
          continue;
        }
        throw new Error(`Failed to create folder at ${currentPath}: ${message}`);
      }
    }
  }
  extractFrontmatter(content) {
    var _a;
    const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!match) {
      return {};
    }
    return (_a = (0, import_obsidian5.parseYaml)(match[1])) != null ? _a : {};
  }
  serializeFrontmatter(state) {
    const yaml = (0, import_obsidian5.stringifyYaml)(state).replace(/\s+$/, "");
    return `---
${yaml}
---`;
  }
};

// src/plugin.ts
var NeuralGardenPlugin = class extends import_obsidian6.Plugin {
  async onload() {
    this.storage = new TaskManagerStorage(this.app);
    this.journalingStorage = new JournalingStorage(this.app);
    await this.storage.ensureNotesFolder();
    await this.journalingStorage.ensureJournalFolders();
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_HOME,
      (leaf) => new NeuralGardenHomeView(leaf, this.storage, this.openJournalingView)
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_JOURNALING,
      (leaf) => new NeuralGardenJournalingView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalEntryView)
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY,
      (leaf) => new NeuralGardenJournalEntryView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalingView)
    );
    this.addCommand({
      id: "open-neural-garden-home",
      name: "Open Neural Garden Home",
      callback: async () => {
        await this.openHomeView(true);
      }
    });
    this.addCommand({
      id: "open-neural-garden-journaling",
      name: "Open Neural Garden Journaling",
      callback: async () => {
        await this.openJournalingView(true);
      }
    });
    this.addRibbonIcon("sparkles", "Open Neural Garden Home", async () => {
      await this.openHomeView(true);
    });
    this.app.workspace.onLayoutReady(async () => {
      await this.openHomeOnStartup();
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async (leaf) => {
        if (!leaf) {
          return;
        }
        if (leaf.getViewState().type === "empty") {
          await this.openHomeView(false, leaf);
        }
      })
    );
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
  }
  async openHomeOnStartup() {
    var _a;
    const targetLeaf = (_a = this.app.workspace.getMostRecentLeaf()) != null ? _a : this.app.workspace.getLeaf(true);
    await this.openHomeView(true, targetLeaf);
  }
  async openHomeView(makeActive, targetLeaf) {
    const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_HOME, active: makeActive });
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }
  async openJournalingView(makeActive, targetLeaf) {
    const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_JOURNALING, active: makeActive });
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }
  async openJournalEntryView(dateKey, editable, targetLeaf) {
    const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY, active: true });
    const view = leaf.view;
    if (view instanceof NeuralGardenJournalEntryView) {
      await view.openForDate(dateKey, editable);
    }
    this.app.workspace.revealLeaf(leaf);
  }
};
//# sourceMappingURL=main.js.map
