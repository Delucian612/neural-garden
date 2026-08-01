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
var import_obsidian13 = require("obsidian");

// src/homeView.ts
var import_obsidian = require("obsidian");

// src/constants.ts
var VIEW_TYPE_NEURAL_GARDEN_HOME = "neural-garden-home";
var VIEW_TYPE_NEURAL_GARDEN_JOURNALING = "neural-garden-journaling";
var VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY = "neural-garden-journal-entry";
var VIEW_TYPE_NEURAL_GARDEN_MY_NOTES = "neural-garden-my-notes";
var VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING = "neural-garden-my-learning";
var VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP = "neural-garden-weekly-recap";
var TASK_MANAGER_FILE_PATH = "Maintenance/TaskManager/TaskManager.md";
var JOURNAL_DAILY_FOLDER = "Journal/Daily";
var JOURNAL_WEEKLY_FOLDER = "Journal/Weekly";
var JOURNAL_MONTHLY_FOLDER = "Journal/Monthly";
var TRACKER_FOLDER = "Maintenance/Tracker";
var NOTES_FOLDER = "Notes";
var MY_NOTES_MAINTENANCE_FOLDER = "Maintenance/MyNotes";
var MY_NOTES_CATEGORIES_FILE_PATH = "Maintenance/MyNotes/Categories.md";
var MY_LEARNING_MAINTENANCE_FOLDER = "Maintenance/MyLearning";
var MY_LEARNING_CONFIG_FILE_PATH = "Maintenance/MyLearning/MyLearning.md";
var LEARNING_FOLDER = "Learning";
var NOTES_CATEGORIES_FOLDER = "Learning/Categories";
var WEEKLY_RECAP_MIN_ENTRIES = 4;
var WEEKLY_RECAP_HOME_HINT_MIN_ENTRIES = 5;
var SUPPORT_CATEGORIES = [
  { name: "Mood", color: "#39E05A" },
  { name: "Sleep", color: "#3FD6FF" },
  { name: "Regulation", color: "#A66BFF" },
  { name: "Stress", color: "#F0A04C" },
  { name: "Anxiety", color: "#FF6565" },
  { name: "Exhaustion", color: "#3B82F6" },
  { name: "Sensory Load", color: "#F5D742" },
  { name: "Social Load", color: "#EC407A" }
];
var EFFORTS = [
  { key: "easy-peasy", label: "Light", energy: 5, color: "#3FD6FF" },
  { key: "easy", label: "Easy", energy: 15, color: "#39E05A" },
  { key: "medium", label: "Fair", energy: 30, color: "#F0A04C" },
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
  forcedBreakEnd: void 0,
  baseTaskEnergy: 120,
  lastWeeklyRecap: void 0
};

// src/taskState.ts
function normalizeState(raw) {
  var _a;
  const parsedTasks = Array.isArray(raw.tasks) ? raw.tasks.map((task) => {
    var _a2, _b;
    const mapped = task;
    if (!mapped || typeof mapped !== "object") {
      return void 0;
    }
    const effort = EFFORT_MAP.get(mapped.effort);
    return {
      id: typeof mapped.id === "string" ? mapped.id : createId(),
      taskName: typeof mapped.taskName === "string" ? mapped.taskName : "Untitled Task",
      effort: (_a2 = effort == null ? void 0 : effort.key) != null ? _a2 : "easy",
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
    forcedBreakEnd: numberOrUndefined(raw.forcedBreakEnd),
    baseTaskEnergy: numberOr(raw.baseTaskEnergy, (_a = DEFAULT_STATE.baseTaskEnergy) != null ? _a : 120),
    lastWeeklyRecap: stringOrUndefined(raw.lastWeeklyRecap)
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
function stringOrUndefined(value) {
  return typeof value === "string" && value.trim().length > 0 ? value : void 0;
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
    .ng-weekly-available-hint {
      text-align: center;
      color: #00f0ff;
      font-size: 0.92rem;
      letter-spacing: 0.02em;
      margin-bottom: 2px;
    }
    .ng-weekly-recap-row {
      width: min(420px, 100%);
      align-self: center;
    }
    .ng-search,
    .ng-task-manager {
      background: transparent;
    }
    .ng-home-support {
      border-top: 1px solid color-mix(in srgb, var(--background-modifier-border) 78%, transparent);
      margin-top: 10px;
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ng-home-hints-strip {
      margin-top: 4px;
      margin-bottom: -8px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 46px;
    }
    .ng-home-support h3 {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
    }
    .ng-home-support-heading {
      text-align: center !important;
      color: var(--text-normal) !important;
      font-size: 1.3em;
    }
    .ng-home-support-copy {
      font-size: 0.86rem;
      color: var(--text-muted);
      text-align: center;
      font-style: italic;
    }
    .ng-home-support-notes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .ng-home-support-note {
      border: none;
      border-radius: 9px;
      padding: 8px 10px;
      cursor: pointer;
      transition: color 180ms ease;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: fit-content;
      min-width: 220px;
      max-width: min(100%, 560px);
      font-size: 1.3em;
      line-height: 1.32;
      color: color-mix(in srgb, #39e05a 56%, var(--text-normal));
    }
    .ng-home-support-note:hover {
      background: transparent;
      color: color-mix(in srgb, #39e05a 88%, var(--text-normal));
    }
    .ng-home-support-hint {
      opacity: 0;
      min-height: 42px;
      padding: 8px 10px;
      font-style: italic;
      transition: opacity 2200ms ease;
      color: var(--text-normal);
      text-align: center;
      font-size: 1.3em;
    }
    .ng-home-support-hint.is-visible {
      opacity: 1;
    }
    .ng-weekly-overlay {
      margin: 12px auto;
      width: min(660px, 100%);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }
    .ng-weekly-overlay-card {
      width: 100%;
      border: 1px solid color-mix(in srgb, #00f0ff 48%, var(--background-modifier-border));
      border-radius: 12px;
      padding: 18px 18px 16px;
      background: color-mix(in srgb, var(--background-primary) 90%, transparent);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }
    .ng-weekly-overlay-title {
      margin: 0;
      opacity: 0;
      animation: ng-fade-in-slow 600ms ease forwards;
    }
    .ng-weekly-overlay-generate {
      border: none !important;
      background: transparent !important;
      color: var(--text-normal);
      box-shadow: none !important;
      cursor: pointer;
      font-size: 0.98rem;
      transition: color 140ms ease;
    }
    .ng-weekly-overlay-generate:hover {
      color: #00f0ff;
    }
    .ng-weekly-breath-label,
    .ng-weekly-breath-count {
      opacity: 1;
      transition: opacity 1200ms ease;
    }
    .ng-weekly-breath-label {
      font-size: 1.1rem;
    }
    .ng-weekly-breath-count {
      font-size: 1.6rem;
      line-height: 1;
    }
    .ng-weekly-breath-label.is-fading,
    .ng-weekly-breath-count.is-fading {
      opacity: 0;
    }
    .ng-weekly-seed-form {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 6px;
      align-items: center;
    }
    .ng-weekly-seed-submit {
      border: 1px solid #ec9a63;
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      padding: 7px 11px;
      color: var(--text-normal);
    }
    .ng-weekly-seed-form.is-locked {
      opacity: 0.45;
    }
    .ng-weekly-view {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0 24px;
    }
    .ng-weekly-intro h3 {
      margin: 0;
      text-align: center;
      font-size: 1.46rem;
      color: var(--text-normal);
    }
    .ng-weekly-intro-subtitle {
      margin-top: 2px;
      text-align: center;
      font-size: 1.02rem;
      font-style: italic;
      color: var(--text-muted);
    }
    .ng-weekly-section {
      border: 1px solid var(--background-modifier-border);
      border-radius: 12px;
      padding: 12px;
      background: color-mix(in srgb, var(--background-primary) 15%, transparent);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: opacity 840ms ease, transform 840ms ease;
    }
    .ng-weekly-section.ng-weekly-scroll-hidden {
      opacity: 0;
      transform: translateY(10px);
    }
    .ng-weekly-section.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .ng-weekly-section h4 {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      font-size: 1.3rem;
    }
    .ng-weekly-section-heading {
      letter-spacing: 0.01em;
    }
    .ng-weekly-section.is-hidden,
    .ng-weekly-symptom.is-hidden,
    .ng-weekly-fragment-hidden {
      opacity: 0;
      transform: translateY(6px);
    }
    .ng-weekly-symptom {
      display: grid;
      gap: 4px;
      transition: opacity 840ms ease, transform 840ms ease;
    }
    .ng-weekly-symptom .ng-journal-progress {
      transition: opacity 1200ms ease, transform 1200ms ease;
    }
    .ng-weekly-symptom .ng-journal-metric-label {
      transition: opacity 1100ms ease, transform 1100ms ease;
    }
    .ng-weekly-view .ng-journal-progress-fill {
      transition: width 1200ms ease, background-color 700ms ease;
    }
    .ng-weekly-symptom-copy,
    .ng-weekly-inline-copy {
      font-size: 0.92rem;
      color: var(--text-muted);
      text-align: center;
      transition: opacity 850ms ease, transform 850ms ease;
    }
    .ng-weekly-symptom-copy {
      transition: opacity 1200ms ease, transform 1200ms ease;
    }
    .ng-weekly-fragment-hidden {
      pointer-events: none;
    }
    .ng-weekly-emotion-counters {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ng-weekly-emotion-counters-sep {
      opacity: 0.7;
      margin: 0 3px;
    }
    .ng-weekly-emotion-cloud {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      min-height: 88px;
    }
    .ng-weekly-emotion-balance {
      position: relative;
      height: 12px;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, #ff6565 70%, transparent) 0%,
        color-mix(in srgb, #ff6565 24%, transparent) 50%,
        color-mix(in srgb, #39e05a 24%, transparent) 50%,
        color-mix(in srgb, #39e05a 70%, transparent) 100%
      );
      overflow: hidden;
      margin-bottom: 4px;
    }
    .ng-weekly-emotion-pointer {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--text-normal);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--background-primary) 72%, transparent);
    }
    .ng-weekly-emotion-token {
      display: inline-flex;
      align-items: center;
      line-height: 1;
      white-space: nowrap;
      border-radius: 999px;
      padding: 6px 10px;
      transition: opacity 900ms ease, transform 900ms cubic-bezier(0.15, 1.35, 0.25, 1);
      animation-name: ng-weekly-float;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
      transform-origin: center;
    }
    .ng-weekly-emotion-token.is-negative {
      color: color-mix(in srgb, #ff6565 80%, var(--text-normal));
      background: color-mix(in srgb, #ff6565 14%, transparent);
      border: 1px solid color-mix(in srgb, #ff6565 28%, transparent);
    }
    .ng-weekly-emotion-token.is-positive {
      color: color-mix(in srgb, #39e05a 82%, var(--text-normal));
      background: color-mix(in srgb, #39e05a 14%, transparent);
      border: 1px solid color-mix(in srgb, #39e05a 28%, transparent);
    }
    .ng-weekly-tracker-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      border-radius: 8px;
      padding: 6px 8px;
      background: color-mix(in srgb, var(--background-primary) 25%, transparent);
    }
    .ng-weekly-tracker-cloud {
      min-height: 58px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      align-items: center;
    }
    .ng-weekly-tracker-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 5px 7px;
      border: 1px solid color-mix(in srgb, #ec9a63 40%, var(--background-modifier-border));
      background: color-mix(in srgb, #ec9a63 11%, transparent);
      color: var(--text-normal);
      animation-name: ng-weekly-float;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
      transition: opacity 900ms ease, transform 900ms cubic-bezier(0.15, 1.35, 0.25, 1);
      transform-origin: center;
    }
    .ng-weekly-tracker-pill.ng-weekly-fragment-hidden,
    .ng-weekly-emotion-token.ng-weekly-fragment-hidden {
      transform: scale(0.62) translateY(10px);
    }
    .ng-weekly-tracker-pill.is-winner {
      box-shadow: 0 0 0 1px color-mix(in srgb, #f5d742 60%, transparent), 0 0 18px color-mix(in srgb, #f5d742 25%, transparent);
      background: color-mix(in srgb, #f5d742 12%, transparent);
    }
    .ng-weekly-tracker-row.is-winner {
      box-shadow: 0 0 0 1px color-mix(in srgb, #f5d742 60%, transparent), 0 0 18px color-mix(in srgb, #f5d742 25%, transparent);
    }
    .ng-weekly-tracker-count {
      color: #ec9a63;
      font-weight: 700;
    }
    .ng-weekly-support-chip {
      border: 1px solid color-mix(in srgb, #39e05a 45%, var(--background-modifier-border));
      border-radius: 999px;
      padding: 6px 10px;
      text-align: center;
      color: color-mix(in srgb, #39e05a 65%, var(--text-normal));
    }
    .ng-weekly-support-link {
      all: unset;
      appearance: none;
      -webkit-appearance: none;
      color: #8fcf9d;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1.3;
      text-decoration: none;
      padding: 0;
      margin: 0;
      font-weight: 500;
      display: inline;
    }
    .ng-weekly-support-link:hover {
      color: #47fc82;
    }
    .ng-weekly-support-link:focus,
    .ng-weekly-support-link:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .ng-weekly-support-intro {
      transition: opacity 1700ms ease, transform 1700ms ease;
    }
    .ng-weekly-support-reason {
      color: #FF6565;
    }
    .ng-weekly-critical-title,
    .ng-weekly-critical-line {
      color: #FF6565;
    }
    .ng-weekly-task-status {
      display: flex;
      justify-content: center;
      gap: 3px;
    }
    .ng-weekly-task-status-value {
      font-weight: 700;
      text-transform: capitalize;
    }
    .ng-weekly-task-status-value.is-increased {
      color: color-mix(in srgb, #ec9a63 60%, var(--text-normal));
    }
    .ng-weekly-task-status-value.is-decreased {
      color: color-mix(in srgb, #ec9a63 60%, var(--text-normal));
    }
    .ng-weekly-task-status-value.is-unchanged {
      color: inherit;
      font-weight: 600;
    }
    .ng-weekly-task-status-value.is-at-max {
      color: #00F0FF;
      font-weight: 700;
    }
    .ng-weekly-support-row {
      display: grid;
      gap: 4px;
      justify-items: center;
      padding: 4px 0;
      transition: opacity 640ms ease, transform 640ms ease;
    }
    .ng-weekly-preview-card {
      margin-top: 4px;
    }
    .ng-weekly-preview-emotions {
      margin-top: 8px;
    }
    .ng-weekly-preview-tracker-cloud {
      margin-top: 14px;
      margin-bottom: 6px;
      gap: 6px;
    }
    .ng-weekly-preview-pill {
      padding: 5px 9px;
      font-size: 0.82rem;
      min-height: 24px;
    }
    @keyframes ng-weekly-float {
      from { transform: translateY(0px); }
      to { transform: translateY(-8px); }
    }
    @keyframes ng-fade-in-slow {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ng-search {
      margin-top: 0;
    }
    .ng-search h3 {
      margin: 0 0 4px;
      color: var(--text-normal);
      text-align: center;
    }
    .neural-garden-home .ng-search .ng-search-heading {
      font-size: 1rem;
    }
    .ng-search-heading {
      text-align: center !important;
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
    .ng-mylearning-search {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin: 0;
    }
    .ng-mylearning-search > .ng-task-input,
    .ng-mylearning-search > .ng-search-results {
      width: 60%;
      box-sizing: border-box;
    }
    .ng-mylearning-search > .ng-search-results {
      min-height: 0;
      margin-top: 0;
      gap: 0;
    }
    .ng-search-title {
      font-weight: 600;
      font-size: 0.95rem;
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
    .ng-journal-create-button {
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
    .ng-journal-create-button {
      width: auto;
    }
    .ng-home-category-button:hover,
    .ng-journal-nav-button:hover,
    .ng-journal-mode-button:hover,
    .ng-journal-create-button:hover {
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
      padding: 8px 14px 24px;
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
    .ng-journal-topbar-left,
    .ng-journal-topbar-right {
      display: inline-flex;
      align-items: center;
    }
    .ng-journal-topbar-right {
      margin-left: auto;
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
      font-size: 156%;
    }
    .ng-journal-entry-card h3 {
      color: var(--text-normal);
      margin-bottom: 12px;
    }
    .ng-journal-preview-summary {
      margin: 0 0 16px;
      text-align: center;
      color: var(--text-normal);
      font-size: 1.2rem;
      font-weight: 600;
    }
    .ng-journal-readonly-note,
    .ng-journal-metric-feedback,
    .ng-journal-metric-explain,
    .ng-journal-body-copy {
      color: var(--text-muted);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .ng-journal-body-preview {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 10;
      line-clamp: 10;
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
      background: color-mix(in srgb, var(--background-primary) 18%, transparent);
    }
    .ng-journal-calendar-panel,
    .ng-journal-detail-panel,
    .ng-journal-trackers,
    .ng-journal-entry-card {
      background: color-mix(in srgb, var(--background-primary) 12%, transparent);
    }
    .ng-journal-calendar-panel {
      width: 100%;
      padding-top: 8px;
      margin-top: 10px;
    }
    .ng-journal-calendar-header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 10px;
    }
    .ng-journal-calendar-header h3 {
      color: var(--text-normal);
      margin: 0;
      justify-self: start;
    }
    .ng-journal-month-controls {
      justify-self: center;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }
    .ng-journal-month-stepper {
      all: unset;
      width: auto;
      height: auto;
      padding: 0;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0;
      background: transparent !important;
      color: var(--text-normal);
      font-size: 0.95rem;
      line-height: 1;
      display: inline;
      cursor: pointer;
      transform: translateY(-2px);
      appearance: none;
      -webkit-appearance: none;
      outline: none !important;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-month-stepper:hover,
    .ng-journal-month-stepper:focus-visible {
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent !important;
    }
    .ng-journal-month-selector {
      justify-self: center;
      min-width: 180px;
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid rgba(236, 154, 99, 0.5);
      background: color-mix(in srgb, var(--background-primary) 20%, transparent);
      color: var(--text-normal);
      font-size: 0.92rem;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
    }
    .ng-journal-month-selector:hover,
    .ng-journal-month-selector:focus-visible {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
      outline: none;
    }
    .ng-journal-create-button {
      justify-self: end;
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
      border: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
    }
    .ng-journal-calendar-grid {
      display: grid;
      grid-template-columns: minmax(54px, 62px) repeat(7, minmax(0, 1fr));
      gap: 4px 6px;
    }
    .ng-journal-calendar-weekday {
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .ng-journal-calendar-weekday {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      padding: 2px 0 4px;
    }
    .ng-journal-calendar-week-header {
      color: var(--text-normal);
      opacity: 0.8;
      margin-right: 10px;
    }
    .ng-journal-week-cell {
      position: relative;
      min-height: 30px;
      padding: 4px 6px;
      border-radius: 9px;
      border: 1px solid rgba(236, 154, 99, 0.45);
      background: color-mix(in srgb, var(--background-primary) 16%, transparent);
      color: var(--text-normal);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 600;
      transition: all 0.15s ease;
      margin-right: 10px;
    }
    .ng-journal-week-cell.is-available {
      border-color: #00f0ff;
      background: color-mix(in srgb, var(--background-primary) 16%, transparent);
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.18);
    }
    .ng-journal-week-cell.is-generated {
      border-color: #39e05a;
      background: color-mix(in srgb, #39e05a 10%, var(--background-primary));
      box-shadow: 0 0 0 2px rgba(57, 224, 90, 0.18);
    }
    .ng-journal-week-cell.is-available::after {
      content: "+";
      position: absolute;
      top: 1px;
      right: 3px;
      font-size: 0.94rem;
      line-height: 1;
      font-weight: 700;
      color: #00f0ff;
      opacity: 0.95;
      pointer-events: none;
    }
    .ng-journal-week-cell:hover:not(:disabled) {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.18);
    }
    .ng-journal-week-cell:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .ng-journal-day-cell {
      position: relative;
      min-height: 30px;
      padding: 5px 3px;
      border-radius: 8px;
      border: 1px solid rgba(236, 154, 99, 0.38);
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
      border-color: rgba(236, 154, 99, 0.5);
      background: rgba(236, 154, 99, 0.07);
    }
    .ng-journal-day-cell.is-today {
      border-color: #0e8f9f;
      box-shadow: 0 0 0 1.4px rgba(14, 143, 159, 0.16);
    }
    .ng-journal-day-cell.is-selected {
      border-color: #00f0ff;
      box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.22);
    }
    .ng-journal-day-number {
      font-size: 0.76rem;
      font-weight: 600;
    }
    .ng-journal-day-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: #ec9a63;
      position: absolute;
      bottom: 4px;
      right: 4px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.14);
    }
    .ng-journal-entry-page .ng-journal-metrics {
      margin-top: 0;
    }
    .ng-journal-metric {
      display: grid;
      gap: 2px;
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
      margin-bottom: 10px;
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
    .ng-journal-tasks-header h4,
    .ng-journal-task-group h5 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-emotions h4,
    .ng-journal-tasks-header h4 {
      font-size: 1.2rem;
      margin: 0;
    }
    .ng-journal-entry-page .ng-journal-emotions h4 {
      font-size: 1.56rem;
    }
    .ng-journal-entry-page .ng-journal-tasks-header h4 {
      font-size: 1.56rem;
    }
    .ng-journal-tasks-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
    }
    .ng-journal-task-edit-button {
      position: absolute;
      right: 0;
      display: grid;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--text-muted);
      place-items: center;
    }
    .ng-journal-task-edit-button:hover {
      color: var(--text-normal);
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-journal-task-edit-button svg {
      width: 15px;
      height: 15px;
    }
    .ng-journal-task-editor {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      align-items: center;
      padding: 7px 0;
      border: 0;
      background: transparent;
    }
    .ng-journal-task-editor > .ng-task-input,
    .ng-journal-good-thing-input {
      padding: 5px 7px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      background: transparent !important;
      box-shadow: none !important;
      font-size: 0.82rem;
    }
    .ng-journal-task-editor > .ng-task-input {
      width: min(100%, 234px);
    }
    .ng-journal-task-editor > .ng-task-input:focus,
    .ng-journal-task-editor > .ng-task-input:focus-visible,
    .ng-journal-good-thing-input:focus,
    .ng-journal-good-thing-input:focus-visible {
      border-color: color-mix(in srgb, var(--background-modifier-border) 65%, var(--text-normal) 35%) !important;
      background: transparent !important;
      box-shadow: none !important;
      outline: none;
    }
    .ng-journal-task-efforts {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
    }
    .ng-journal-task-effort {
      padding: 3px 7px;
      border: 1px solid color-mix(in srgb, var(--ng-task-effort-color) 45%, var(--background-modifier-border));
      border-radius: 999px;
      background: transparent;
      box-shadow: none;
      color: color-mix(in srgb, var(--ng-task-effort-color) 72%, var(--text-normal));
      font-size: 0.68rem;
    }
    .ng-journal-task-effort:hover {
      border-color: var(--ng-task-effort-color);
      background: color-mix(in srgb, var(--ng-task-effort-color) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-task-effort-color) 24%, transparent);
      color: var(--ng-task-effort-color);
    }
    .ng-journal-task-delete {
      display: grid;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--text-error) !important;
      place-items: center;
    }
    .ng-journal-task-delete:hover {
      background: transparent !important;
      box-shadow: none !important;
      color: var(--text-error) !important;
    }
    .ng-journal-task-delete svg {
      width: 13px;
      height: 13px;
    }
    .ng-journal-good-thing {
      display: grid;
      justify-items: center;
      gap: 7px;
      margin-top: 18px;
    }
    .ng-journal-good-thing h4 {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      font-size: 1.56rem;
    }
    .ng-journal-good-thing-input {
      width: min(49%, 294px);
      text-align: center;
    }
    .ng-journal-good-thing-value {
      text-align: center;
      color: var(--text-muted);
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
    .ng-journal-emotion-button {
      padding: 8px 10px;
    }
    .ng-journal-emotion-button {
      background: transparent;
      border: 1px solid;
      color: var(--text-normal);
    }
    .ng-journal-emotion-button:not(.is-active) {
      color: color-mix(in srgb, var(--text-normal) 70%, black 30%);
      filter: none;
    }
    .ng-journal-emotion-button.pleasant {
      border-color: #39e05a;
    }
    .ng-journal-emotion-button.unpleasant {
      border-color: #ff6565;
    }
    .ng-journal-emotion-button.pleasant:not(.is-active) {
      border-color: color-mix(in srgb, #39e05a 48%, black 52%);
    }
    .ng-journal-emotion-button.unpleasant:not(.is-active) {
      border-color: color-mix(in srgb, #ff6565 48%, black 52%);
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
    .ng-journal-entry-card .ng-journal-emotion-chip {
      filter: saturate(80%);
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
    .ng-journal-tracker-head {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 12px;
    }
    .ng-journal-tracker-head h3 {
      margin: 0;
      grid-column: 2;
      text-align: center;
    }
    .ng-journal-tracker-add-toggle {
      all: unset;
      grid-column: 3;
      justify-self: end;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      color: color-mix(in srgb, #ec9a63 55%, white);
      transition: color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-add-toggle:hover,
    .ng-journal-tracker-add-toggle:focus-visible {
      color: #ec9a63;
    }
    .ng-journal-tracker-add-row {
      margin-bottom: 14px;
    }
    .ng-journal-tracker-color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }
    .ng-journal-tracker-color-option {
      width: 22px;
      height: 22px;
      flex: 0 0 auto;
      border-radius: 50%;
      cursor: pointer;
      border: 1px solid transparent;
      box-sizing: border-box;
      transition: transform 140ms ease, box-shadow 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-color-option:hover {
      transform: scale(1.15);
    }
    .ng-journal-tracker-color-option:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.45);
    }
    .ng-journal-tracker-list {
      display: grid;
      gap: 3px;
    }
    .ng-journal-tracker-row {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      border-radius: 8px;
      padding: 1px 4px;
      transition: background-color 140ms ease;
    }
    .ng-journal-tracker-row:not(.ng-journal-tracker-header):hover {
      background: color-mix(in srgb, var(--background-modifier-hover) 55%, transparent);
    }
    .ng-journal-tracker-label {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 4px 0;
    }
    .ng-journal-tracker-title {
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ng-journal-tracker-label .ng-journal-tracker-color-chip {
      width: 14px;
      height: 14px;
    }
    .ng-journal-tracker-color-chip {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      border-radius: 50%;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-color-chip:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.45);
    }
    .ng-journal-tracker-color-hidden {
      position: absolute;
      width: 0;
      height: 0;
      padding: 0;
      border: none;
      opacity: 0;
      pointer-events: none;
    }
    .ng-journal-tracker-block {
      display: grid;
      gap: 8px;
      justify-items: center;
      margin-top: 18px;
    }
    .ng-journal-tracker-block h4 {
      margin: 0;
      color: var(--text-normal);
      text-align: center;
      font-size: 1.2rem;
    }
    .ng-journal-entry-page .ng-journal-tracker-block h4 {
      font-size: 1.56rem;
    }
    .ng-journal-tracker-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .ng-journal-tracker-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 999px;
      font-size: 0.85rem;
      color: var(--text-normal);
      transition: border-color 140ms ease, background-color 140ms ease;
    }
    .ng-journal-tracker-chip-dot {
      width: 10px;
      height: 10px;
      flex: 0 0 auto;
      border-radius: 50%;
    }
    .ng-journal-tracker-chip.is-active {
      border-color: var(--ng-tracker-color, #ec9a63);
      background: color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 14%, transparent);
    }
    .ng-journal-tracker-chip.ng-journal-tracker-chip-preview {
      border-color: var(--ng-tracker-color, #ec9a63);
      background: transparent;
    }
    .ng-journal-tracker-chip.is-clickable {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-chip.is-clickable:hover {
      border-color: var(--ng-tracker-color, #ec9a63);
    }
    .ng-journal-tracker-chip.is-clickable:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 45%, transparent);
    }
    .ng-journal-tracker-label-empty {
      border: none;
      background: transparent;
      box-shadow: none;
    }
    .ng-journal-tracker-cells {
      display: grid;
      gap: 0;
    }
    .ng-journal-tracker-header {
      position: sticky;
      top: 0;
      z-index: 2;
      padding-bottom: 2px;
      margin-bottom: 4px;
      border-bottom: 1px solid var(--background-modifier-border);
      background: color-mix(in srgb, var(--background-primary) 16%, transparent);
      backdrop-filter: blur(6px);
    }
    .ng-journal-tracker-header-cell {
      display: grid;
      place-items: center;
      padding: 2px 0 6px;
      color: var(--text-faint);
    }
    .ng-journal-tracker-header-cell .ng-journal-tracker-day {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transform: translateY(1px);
    }
    .ng-journal-tracker-header-cell.is-today .ng-journal-tracker-day {
      color: #ec9a63;
    }
    .ng-journal-tracker-cell {
      all: unset;
      position: relative;
      cursor: pointer;
      display: grid;
      place-items: center;
      min-height: 30px;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-journal-tracker-dot {
      position: relative;
      z-index: 1;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      border: 1.5px solid var(--background-modifier-border);
      background: transparent;
      box-sizing: border-box;
      transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
    }
    .ng-journal-tracker-cell:hover .ng-journal-tracker-dot {
      border-color: var(--ng-tracker-color, #ec9a63);
      transform: scale(1.12);
    }
    .ng-journal-tracker-cell:focus-visible .ng-journal-tracker-dot {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 45%, transparent);
    }
    .ng-journal-tracker-cell.is-today .ng-journal-tracker-dot {
      border-color: color-mix(in srgb, #ec9a63 55%, var(--background-modifier-border));
    }
    .ng-journal-tracker-cell.is-active .ng-journal-tracker-dot {
      background: var(--ng-tracker-color, #ec9a63);
      border-color: var(--ng-tracker-color, #ec9a63);
    }
    .ng-journal-tracker-cell.has-prev::before,
    .ng-journal-tracker-cell.has-next::after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 6px;
      background: color-mix(in srgb, var(--ng-tracker-color, #ec9a63) 55%, var(--background-primary));
      z-index: 0;
    }
    .ng-journal-tracker-cell.has-prev::before {
      left: 0;
      right: 50%;
    }
    .ng-journal-tracker-cell.has-next::after {
      left: 50%;
      right: 0;
    }
    .ng-journal-tracker-streak {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      font-size: 0.64rem;
      font-weight: 700;
      color: var(--ng-tracker-streak-color, #ffffff);
      pointer-events: none;
      line-height: 1;
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
      gap: 4px;
    }
    .ng-journal-task-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px 22px;
    }
    .ng-journal-task-list .ng-journal-task-row {
      flex: 0 1 auto;
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
    .ng-journal-entry-card .ng-journal-task-row {
      justify-content: center;
    }
    .ng-journal-entry-card .ng-journal-body h4 {
      text-align: center;
      color: var(--text-normal);
    }
    .ng-journal-body-markdown {
      margin-top: 18px;
      border: 1px solid color-mix(in srgb, var(--interactive-accent) 44%, var(--background-modifier-border));
      border-radius: 14px;
      background: color-mix(in srgb, var(--background-primary) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--interactive-accent) 16%, transparent), 0 0 16px color-mix(in srgb, var(--interactive-accent) 20%, transparent);
      padding: 14px 14px 18px;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    .ng-journal-body-markdown:focus-within {
      border-color: color-mix(in srgb, var(--interactive-accent) 68%, var(--background-modifier-border));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--interactive-accent) 31%, transparent), 0 0 29px color-mix(in srgb, var(--interactive-accent) 36%, transparent);
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
      margin-top: 2px;
      margin-bottom: 5px;
    }
    .ng-tracker-section {
      margin-top: 22px;
    }
    .ng-journal-body-content {
      min-height: 120px;
      max-width: 100%;
      border: none;
      background: transparent;
      color: var(--text-normal);
      font-size: 1.02em;
      padding: 0;
      margin-top: 1px;
      white-space: pre-wrap;
      overflow-wrap: normal;
      word-break: normal;
      overflow-x: hidden;
      outline: none;
      line-height: 1.6;
      box-sizing: border-box;
    }
    .ng-journal-body-content:focus {
      outline: none;
      box-shadow: none;
    }
    .ng-journal-entry-sticky-header {
      position: relative;
      z-index: 8;
      background: transparent;
    }
    .ng-journal-entry-page.is-compact .ng-journal-entry-sticky-header {
      padding-bottom: 6px;
      border-bottom: 1px solid color-mix(in srgb, var(--background-modifier-border) 72%, transparent);
      box-shadow: none;
    }
    .ng-journal-entry-page.is-compact .ng-journal-title-wrap {
      display: none;
    }
    .ng-journal-full-check-in {
      max-height: var(--ng-journal-full-height, 5000px);
      overflow: hidden;
      opacity: 1;
      transform: translateY(0);
      transition: max-height 620ms ease, opacity 360ms ease;
    }
    .ng-journal-entry-page.is-collapsing .ng-journal-full-check-in {
      opacity: 0;
      pointer-events: none;
    }
    .ng-journal-entry-page.is-compact .ng-journal-full-check-in {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }
    .ng-journal-compact-summary {
      position: relative;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 620ms ease, opacity 620ms ease;
    }
    .ng-journal-entry-page.is-compact .ng-journal-compact-summary {
      max-height: var(--ng-journal-compact-height, 420px);
      opacity: 1;
    }
    .ng-journal-compact-heading {
      position: relative;
      display: block;
      margin-bottom: 5px;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
    }
    .ng-journal-compact-expand {
      position: static;
      flex: 0 0 auto;
      align-self: center;
      margin-left: auto;
      padding: 3px 8px;
      border-color: color-mix(in srgb, #ec9a63 24%, var(--background-modifier-border));
      color: color-mix(in srgb, var(--text-normal) 88%, var(--text-muted));
      font-size: 0.68rem;
      text-transform: none;
    }
    .ng-journal-compact-expand:hover {
      border-color: color-mix(in srgb, #ec9a63 36%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, #ec9a63 12%, transparent);
    }
    .ng-journal-compact-metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px 8px;
    }
    .ng-journal-compact-task-list {
      display: flex;
      flex: 1 1 0;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0;
      min-width: 0;
    }
    .ng-journal-compact-task {
      position: relative;
      display: grid;
      justify-items: center;
      gap: 2px;
      min-width: 68px;
      padding: 1px 5px;
    }
    .ng-journal-compact-task + .ng-journal-compact-task::before {
      position: absolute;
      top: 15%;
      bottom: 15%;
      left: 0;
      width: 1px;
      background: color-mix(in srgb, var(--background-modifier-border) 55%, transparent);
      content: "";
    }
    .ng-journal-compact-task-name {
      color: var(--text-normal);
      text-align: center;
    }
    .ng-journal-compact-task-badge {
      padding: 1px 5px;
      border: 1px solid color-mix(in srgb, var(--ng-compact-task-color) 54%, transparent);
      border-radius: 999px;
      color: var(--ng-compact-task-color);
      font-size: 0.58rem;
      line-height: 1.15;
      text-align: center;
    }
    .ng-journal-compact-tasks-label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.15;
    }
    .ng-journal-compact-metric {
      display: grid;
      grid-template-columns: auto minmax(18px, 1fr);
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
      font-size: 0.62rem;
    }
    .ng-journal-compact-track {
      height: 4px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--background-modifier-border);
    }
    .ng-journal-compact-fill {
      display: block;
      height: 100%;
      border-radius: inherit;
    }
    .ng-journal-compact-details {
      display: grid;
      gap: 2px;
      margin-top: 5px;
    }
    .ng-journal-compact-detail-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      min-width: 0;
      font-size: 0.62rem;
    }
    .ng-journal-compact-detail-label {
      flex: 0 0 58px;
      color: var(--text-muted);
      font-weight: 600;
    }
    .ng-journal-compact-chip {
      padding: 1px 5px;
      border: 1px solid transparent;
      border-radius: 999px;
      color: var(--text-normal);
    }
    .ng-journal-compact-chip.pleasant {
      border-color: color-mix(in srgb, #39e05a 58%, transparent);
      color: #39e05a;
    }
    .ng-journal-compact-chip.unpleasant {
      border-color: color-mix(in srgb, #ff6565 58%, transparent);
      color: #ff6565;
    }
    .ng-journal-compact-chip.is-tracker {
      border-color: color-mix(in srgb, var(--ng-compact-chip-color) 58%, transparent);
      color: var(--ng-compact-chip-color);
    }
    .ng-journal-compact-empty {
      color: var(--text-faint);
    }
    @media (max-width: 900px) {
      .ng-journal-layout {
        grid-template-columns: 1fr;
      }
      .ng-journal-tracker-row {
        grid-template-columns: 100px minmax(0, 1fr);
        gap: 6px;
      }
      .ng-journal-tracker-title {
        font-size: 0.82rem;
      }
      .ng-journal-task-editor .ng-task-input {
        width: min(100%, 234px);
      }
      .ng-journal-tracker-dot {
        width: 16px;
        height: 16px;
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
    .ng-mynotes {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .ng-mynotes-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ng-mynotes-learning {
      opacity: 0.5;
      cursor: default;
    }
    .ng-mylearning {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 8px 0 24px;
    }
    .ng-mylearning-topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .ng-mylearning-heading-row {
      display: block;
    }
    .ng-mylearning-heading-row .ng-mynotes-heading {
      margin: 0;
      text-align: center;
    }
    .ng-mylearning-daily-calendar {
      position: relative;
      border-top: 1px solid color-mix(in srgb, var(--background-modifier-border) 72%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--background-modifier-border) 72%, transparent);
      padding: 4px 27px;
      overflow: hidden;
    }
    .ng-mylearning-daily-viewport {
      overflow-x: auto;
      scrollbar-width: none;
      cursor: grab;
      touch-action: pan-x;
      user-select: none;
    }
    .ng-mylearning-daily-viewport::-webkit-scrollbar {
      display: none;
    }
    .ng-mylearning-daily-viewport.is-dragging {
      cursor: grabbing;
    }
    .ng-mylearning-daily-row {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 3px;
      width: max-content;
      min-width: 100%;
    }
    .ng-mylearning-daily-arrow {
      position: absolute;
      top: 50%;
      z-index: 3;
      display: grid;
      width: 18px;
      min-width: 18px;
      height: 30px;
      padding: 0;
      border: 0;
      background: var(--background-primary);
      box-shadow: none;
      color: var(--text-muted);
      place-items: center;
      transform: translateY(-50%);
    }
    .ng-mylearning-daily-arrow.is-left {
      left: 0;
    }
    .ng-mylearning-daily-arrow.is-right {
      right: 0;
    }
    .ng-mylearning-daily-arrow:disabled {
      opacity: 0.18;
      cursor: default;
    }
    .ng-mylearning-daily-arrow svg {
      width: 13px;
      height: 13px;
    }
    .ng-mylearning-daily-day {
      position: relative;
      display: flex;
      flex: 0 0 34px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      min-width: 34px;
      height: 35px;
      padding: 3px 3px 6px;
      border: 1px solid rgba(236, 154, 99, 0.3);
      border-radius: 5px;
      background: transparent;
      box-shadow: none;
      color: var(--text-muted);
      cursor: default;
    }
    .ng-mylearning-daily-day.has-note,
    .ng-mylearning-daily-day.is-today {
      cursor: pointer;
    }
    .ng-mylearning-daily-day:hover {
      border-color: #ffd2b0;
      box-shadow: 0 0 0 1px rgba(236, 154, 99, 0.16);
    }
    .ng-mylearning-daily-day.is-today {
      border-color: #0e8f9f;
      box-shadow: 0 0 0 1px rgba(14, 143, 159, 0.16);
      color: var(--text-normal);
      font-weight: 700;
    }
    .ng-mylearning-daily-weekday {
      font-size: 0.48rem;
      line-height: 1;
      text-transform: uppercase;
    }
    .ng-mylearning-daily-number-wrap {
      position: relative;
      display: grid;
      width: 17px;
      height: 17px;
      place-items: center;
    }
    .ng-mylearning-daily-number {
      font-size: 0.77rem;
      font-weight: 600;
      line-height: 1;
    }
    .ng-mylearning-daily-day.is-processed .ng-mylearning-daily-number {
      opacity: 0.24;
    }
    .ng-mylearning-daily-check {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #45c978;
    }
    .ng-mylearning-daily-check svg {
      width: 17px;
      height: 17px;
      stroke-width: 3;
    }
    .ng-mylearning-daily-marker {
      position: absolute;
      right: 3px;
      bottom: 3px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ec9a63 !important;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.14), 0 0 5px rgba(236, 154, 99, 0.34);
    }
    .ng-mylearning-daily-done {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-normal);
      cursor: pointer;
    }
    .ng-mylearning-label {
      margin: 0;
      color: var(--text-normal);
      font-size: 1.46rem;
      font-weight: 500;
    }
    .ng-mylearning-inline-create {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .ng-mylearning-header-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-left: 0;
    }
    .ng-mylearning-heading-group {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }
    .ng-mylearning-heading-add-note {
      margin-left: auto;
    }
    .ng-mylearning-header-actions .ng-note-header-add-category-icon {
      min-width: 18px;
      width: 18px;
      height: 20px;
      padding: 0;
    }
    .ng-mylearning-inline-plus {
      min-width: 18px;
      width: 18px;
      height: 20px;
      padding: 0;
      font-size: 1.25em;
      color: color-mix(in srgb, #ec9a63 60%, white);
    }
    .ng-mylearning-inline-edit {
      min-width: 18px;
      width: 18px;
      height: 20px;
      padding: 0;
      color: color-mix(in srgb, var(--text-muted) 72%, white);
    }
    .ng-mylearning-inline-edit.is-active {
      color: #ec9a63;
      text-shadow: 0 0 8px color-mix(in srgb, #ec9a63 36%, transparent);
    }
    .ng-mylearning-inline-edit svg {
      width: 13px;
      height: 13px;
    }
    .ng-mylearning-divider {
      margin-top: 8px;
      border-top: 1px solid color-mix(in srgb, var(--background-modifier-border) 82%, transparent);
    }
    .ng-mylearning-topic-pill {
      font-size: 1.02rem;
      padding: 8px 15px;
    }
    .ng-mylearning-topics .ng-mynotes-pill-row,
    .ng-mylearning-categories .ng-mynotes-pill-row {
      margin-top: 8px;
    }
    .ng-mylearning-notes {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mylearning-notes-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      min-height: 22px;
    }
    .ng-mylearning-notes-title-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ng-mylearning-notes-title {
      color: var(--text-normal);
      font-size: 1.46rem;
      font-weight: 500;
    }
    .ng-mylearning-quick-create {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #ec9a63;
      cursor: pointer;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0;
      line-height: 1;
      appearance: none;
      -webkit-appearance: none;
      overflow: visible;
      flex: 0 0 auto;
    }
    .ng-mylearning-quick-create:hover {
      color: color-mix(in srgb, #ec9a63 75%, white);
      background: transparent !important;
      box-shadow: none !important;
    }
    .ng-mylearning-quick-create svg {
      width: 47px;
      height: 47px;
      display: block;
      fill: currentColor;
      stroke: currentColor;
    }
    .ng-mylearning-quick-create .ng-mynotes-button-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
    }
    .ng-mylearning-quick-create .ng-mynotes-button-icon svg,
    .ng-mylearning-quick-create .ng-mynotes-button-icon svg * {
      opacity: 1;
      fill: currentColor !important;
      stroke: currentColor !important;
    }
    .ng-mylearning-quick-create .ng-mynotes-button-icon svg {
      width: 20px !important;
      height: 20px !important;
    }
    .ng-mylearning .ng-mylearning-category-pill {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 40%, transparent);
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 4%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ng-mylearning-category-color) 9%, transparent);
      color: var(--text-normal);
    }
    .ng-mylearning .ng-mylearning-category-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 78%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 22%, transparent), 0 0 10px color-mix(in srgb, var(--ng-mylearning-category-color) 14%, transparent);
    }
    .ng-mylearning .ng-mylearning-category-pill.is-active {
      border-color: var(--ng-mylearning-category-color);
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 8%, var(--background-primary));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-mylearning-category-color) 30%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-category-color) 20%, transparent);
    }
    .ng-mylearning .ng-mynotes-pill.is-edit-target {
      border-style: dashed;
      cursor: pointer;
    }
    .ng-mylearning-progress-summary {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-left: 4px;
    }
    .ng-mylearning-progress-count {
      font-size: 0.78em;
      font-weight: 700;
    }
    .ng-mylearning-progress-count.is-green { color: #45c978; }
    .ng-mylearning-progress-count.is-yellow { color: #e4bd4d; }
    .ng-mylearning-progress-count.is-orange { color: #ec9a63; }
    .ng-mylearning-average-track {
      display: inline-block;
      width: 38px;
      height: 5px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--background-modifier-border);
    }
    .ng-mylearning-average-fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #00f0ff;
    }
    .ng-mylearning-entry-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .ng-mylearning-entry-list .ng-mynotes-note-row {
      width: 100%;
      padding: 2px 8px;
      box-sizing: border-box;
    }
    .ng-mynotes-note-row.is-low-comprehension {
      background: color-mix(in srgb, #fb2c36 7%, transparent);
    }
    .ng-mylearning-entry-progress {
      width: 55px;
      height: 6px;
      flex: 0 0 55px;
      overflow: hidden;
      border-radius: 999px;
    }
    .ng-mylearning-entry-progress.is-green { background: color-mix(in srgb, #45c978 28%, transparent); }
    .ng-mylearning-entry-progress.is-yellow { background: color-mix(in srgb, #e4bd4d 28%, transparent); }
    .ng-mylearning-entry-progress.is-orange { background: color-mix(in srgb, #ec9a63 28%, transparent); }
    .ng-mylearning-entry-progress-fill {
      height: 100%;
      border-radius: inherit;
    }
    .ng-mylearning-entry-progress-fill.is-green { background: #45c978; }
    .ng-mylearning-entry-progress-fill.is-yellow { background: #e4bd4d; }
    .ng-mylearning-entry-progress-fill.is-orange { background: #ec9a63; }
    .ng-mylearning-entry-type {
      color: var(--text-muted);
      font-size: 0.78em;
    }
    .ng-mylearning-type-control {
      display: inline-flex;
      align-self: center;
      padding: 2px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
    }
    .ng-mylearning-type-control button {
      border: none;
      border-radius: 4px;
      background: transparent;
      box-shadow: none;
    }
    .ng-mylearning-type-control button.is-active {
      background: var(--background-modifier-hover);
      color: #ec9a63;
    }
    .ng-note-header-input-error {
      width: 100%;
      margin-top: 4px;
    }
    .ng-learning-canvas-controls {
      position: absolute;
      top: 44px;
      left: 12px;
      z-index: 30;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 5px 8px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-primary);
      color: var(--text-normal);
      box-shadow: var(--shadow-s);
    }
    .ng-learning-canvas-back {
      border: 0;
      padding: 3px 5px;
      background: transparent;
      color: inherit;
      box-shadow: none;
    }
    .ng-learning-canvas-back:hover {
      color: #ec9a63;
    }
    .ng-learning-canvas-progress {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: 0.78rem;
    }
    .ng-learning-canvas-progress .ng-learning-progress-track {
      width: 134px;
      height: 12px;
    }
    .ng-mylearning-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 8px;
      row-gap: 3px;
      position: relative;
      padding: 0 10px;
    }
    .ng-mylearning-grid-divider {
      position: absolute;
      left: calc(50% - 11px);
      top: 0;
      bottom: 0;
      width: 1px;
      background: color-mix(in srgb, var(--background-modifier-border) 82%, transparent);
      pointer-events: none;
      transform: translateX(-0.5px);
    }
    .ng-mylearning-grid .ng-mynotes-note-row {
      margin: 0;
      padding: 1px 7px;
      gap: 8px;
      width: calc(100% - 8px);
      margin-right: 8px;
      box-sizing: border-box;
    }
    .ng-mylearning-row-actions {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      margin-left: auto;
    }
    .ng-mylearning-comprehension {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ng-mylearning-comprehension > .ng-mynotes-subheading-toggle {
      margin-top: 2px;
    }
    .ng-mylearning-comprehension-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ng-mylearning-comprehension-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
      align-items: center;
      gap: 10px;
      padding: 3px 8px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .ng-mylearning-comprehension-row:hover {
      background: color-mix(in srgb, var(--text-normal) 6%, transparent);
    }
    .ng-mylearning-comprehension-text {
      display: flex;
      flex-direction: column;
      gap: 0;
      min-width: 0;
    }
    .ng-mylearning-comprehension-title-line {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      min-width: 0;
    }
    .ng-mylearning-topic-badge-row {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
    .ng-mylearning-topic-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 0.76rem;
      line-height: 1.1;
      color: color-mix(in srgb, var(--text-muted) 92%, var(--background-primary));
      border: 1px solid color-mix(in srgb, var(--background-modifier-border) 82%, transparent);
      background: color-mix(in srgb, var(--background-primary) 96%, transparent);
      width: fit-content;
    }
    .ng-mylearning-category-badge {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 34%, var(--background-modifier-border));
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 7%, var(--background-primary));
      color: color-mix(in srgb, var(--text-muted) 80%, var(--ng-mylearning-category-color));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 14%, transparent), 0 0 10px color-mix(in srgb, var(--ng-mylearning-category-color) 8%, transparent);
    }
    .ng-mylearning-category-badge:hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 52%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 18%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-category-color) 12%, transparent);
    }
    .ng-mylearning-category-color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: -2px 0 2px;
    }
    .ng-mylearning-category-color-row.is-centered {
      justify-content: center;
      width: 100%;
      margin-top: 2px;
    }
    .ng-mylearning-category-color-row .ng-task-input {
      flex: 1 1 auto;
      min-width: 0;
    }
    .ng-mylearning-category-color-wrap {
      position: relative;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .ng-mylearning-color-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
    .ng-mylearning-color-swatch {
      width: 24px;
      height: 24px;
      display: inline-block;
      flex: 0 0 auto;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--ng-mylearning-picked-color) 54%, var(--background-modifier-border));
      background: var(--ng-mylearning-picked-color);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-picked-color) 18%, transparent), 0 0 10px color-mix(in srgb, var(--ng-mylearning-picked-color) 12%, transparent);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    .ng-mylearning-color-swatch:hover {
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-picked-color) 26%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-picked-color) 16%, transparent);
    }
    .ng-mylearning-color-swatch:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-mylearning-picked-color) 45%, transparent);
    }
    .ng-mylearning-mini-progress {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--background-modifier-border) 85%, transparent);
      overflow: hidden;
    }
    .ng-mylearning-mini-progress-fill {
      height: 100%;
      border-radius: inherit;
      background: #00f0ff;
      width: 0;
      transition: width 180ms ease;
    }
    .ng-mylearning-uncategorized {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mylearning-uncategorized .ng-mynotes-note-row {
      padding: 1px 7px;
      gap: 8px;
    }
    .ng-learning-note-header {
      gap: 0;
    }
    .ng-learning-note-header .ng-note-header-note-name {
      opacity: 1;
      transition: none;
    }
    .ng-note-header-collapsed-summary.ng-learning-collapsed-summary {
      min-height: 0;
      gap: 2px;
      padding: 3px 0 3px;
    }
    .ng-learning-note-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ng-learning-note-header-top-left,
    .ng-learning-note-header-top-right {
      display: inline-flex;
      align-items: center;
    }
    .ng-learning-note-header-top-right {
      margin-left: auto;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .ng-learning-topic-heading {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      cursor: pointer;
      font-weight: 550;
    }
    .ng-learning-collapsed-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .ng-learning-collapsed-row .ng-learning-collapsed-category {
      flex: 0 0 auto;
    }
    .ng-learning-collapsed-row .ng-note-header-collapsed-categories {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
    }
    .ng-learning-collapsed-row .ng-note-header-mini-pill {
      border-color: var(--ng-mylearning-category-color);
    }
    .ng-learning-collapsed-row .ng-learning-progress-wrap-compact {
      margin-left: auto;
      width: min(180px, 30%);
      flex: 0 1 180px;
    }
    .ng-learning-collapsed-row .ng-note-header-collapsed-controls {
      position: static;
      flex: 0 0 auto;
      width: auto;
      margin: 0;
      padding: 0;
    }
    .ng-learning-collapsed-row .ng-note-header-to-top {
      width: 36px;
      min-width: 36px;
      justify-content: center;
    }
    .ng-learning-collapsed-category {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-normal);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ng-learning-collapsed-category.is-placeholder {
      color: var(--text-muted);
      font-style: italic;
      font-weight: 500;
    }
    .ng-learning-topic-heading.is-placeholder {
      color: var(--text-muted);
      font-style: italic;
      font-weight: 500;
    }
    .ng-learning-topic-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .ng-learning-topic-edit,
    .ng-learning-category-edit {
      color: color-mix(in srgb, var(--text-muted) 72%, white);
    }
    .ng-learning-topic-edit.is-active,
    .ng-learning-category-edit.is-active {
      color: #ec9a63;
      text-shadow: 0 0 8px color-mix(in srgb, #ec9a63 35%, transparent);
    }
    .ng-learning-topic-edit svg,
    .ng-learning-category-edit svg {
      width: 15px;
      height: 15px;
    }
    .ng-learning-note-box {
      gap: 10px;
    }
    .ng-learning-categories-left {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ng-learning-progress-wrap {
      width: 50%;
      margin: 2px auto 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .ng-learning-progress-wrap-compact {
      margin: 0;
      align-items: stretch;
    }
    .ng-learning-progress-wrap-compact .ng-learning-progress-track {
      height: 8px;
      cursor: pointer;
    }
    .ng-learning-progress-heading {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-normal);
      font-weight: 600;
    }
    .ng-learning-progress-track {
      width: 100%;
      height: 12px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--background-modifier-border) 88%, transparent);
      cursor: pointer;
      overflow: hidden;
      touch-action: none;
    }
    .ng-learning-progress-fill {
      height: 100%;
      width: 0;
      border-radius: inherit;
      background: #00f0ff;
      transition: width 120ms ease;
    }
    @media (max-width: 680px) {
      .ng-mylearning-grid {
        grid-template-columns: 1fr;
      }
      .ng-mylearning-comprehension-row {
        grid-template-columns: 1fr;
      }
      .ng-learning-note-header-top {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      .ng-learning-note-header-top-left,
      .ng-learning-note-header-top-right {
        width: 100%;
      }
      .ng-learning-note-header-top-right {
        justify-content: flex-end;
      }
    }
    .ng-note-header-top,
    .ng-note-header-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ng-note-header-top-left,
    .ng-note-header-top-right {
      display: inline-flex;
      align-items: center;
    }
    .ng-note-header-top-right {
      margin-left: auto;
    }
    .ng-mynotes-heading {
      text-align: center;
      margin: 0;
    }
    .ng-mynotes-heading-hint {
      text-align: center;
      font-style: italic;
      font-size: 0.92em;
      color: var(--text-muted);
      margin-top: 0;
    }
    .ng-mynotes-categories {
      border: none;
      border-radius: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: transparent;
    }
    .ng-mynotes-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ng-mynotes-title-actions {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .ng-mynotes-header-actions {
      margin-left: 0;
    }
    .ng-mynotes-create-target {
      margin-top: -4px;
      font-size: 0.85em;
      color: var(--text-muted);
      font-style: italic;
    }
    .ng-mynotes-section-title {
      margin: 0;
      font-size: 1.3em;
      font-weight: 600;
      color: var(--text-normal);
    }
    .ng-mynotes-new-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid #ec9a63;
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
    }
    .ng-mylearning-topbar .ng-mynotes-new-button {
      border-color: color-mix(in srgb, #ec9a63 32%, var(--background-modifier-border));
      color: color-mix(in srgb, var(--text-normal) 92%, var(--text-muted));
    }
    .ng-mynotes-new-button:hover {
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.25);
    }
    .ng-mylearning-topbar .ng-mynotes-new-button:hover {
      border-color: color-mix(in srgb, #ec9a63 46%, var(--background-modifier-border));
      box-shadow: 0 0 0 1px color-mix(in srgb, #ec9a63 18%, transparent);
    }
    .ng-mynotes-button-icon {
      display: inline-flex;
      align-items: center;
    }
    .ng-mynotes-button-icon svg {
      width: 15px;
      height: 15px;
    }
    .ng-mynotes-pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .ng-mynotes-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }
    .ng-mynotes-pill:hover {
      border-color: #ec9a63;
    }
    .ng-mynotes-pill:not(.is-active) {
      border-color: color-mix(in srgb, var(--background-modifier-border) 54%, transparent);
      background: transparent;
      box-shadow: none;
    }
    .ng-mynotes-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--background-modifier-border) 66%, transparent);
      box-shadow: none;
    }
    .ng-mynotes-pill.is-active {
      border-color: #ec9a63;
      background: transparent;
      box-shadow: 0 0 0 2px rgba(236, 154, 99, 0.2);
    }
    .ng-mynotes-pill.is-edit-target {
      border-style: dashed;
      cursor: pointer;
    }
    .ng-mynotes-pill-favourite .ng-mynotes-button-icon svg {
      color: #ff6565;
    }
    .ng-mynotes-pill-favourite.is-active .ng-mynotes-button-icon svg,
    .ng-mynotes-pill-favourite.is-active .ng-mynotes-button-icon svg * {
      fill: #ff6565 !important;
    }
    .ng-mynotes-support-pill {
      border-color: color-mix(in srgb, var(--ng-support-color) 65%, transparent);
    }
    .ng-mynotes-support-pill:not(.is-active) {
      border-color: color-mix(in srgb, var(--background-modifier-border) 54%, transparent);
    }
    .ng-mynotes-support-pill:hover {
      border-color: var(--ng-support-color);
    }
    .ng-mynotes-support-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--background-modifier-border) 66%, transparent);
    }
    .ng-mynotes-support-pill.is-active {
      border-color: var(--ng-support-color);
      background: transparent;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-support-color) 25%, transparent);
    }
    .ng-mynotes-support {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ng-mynotes-support .ng-mynotes-pill-row {
      gap: 7px;
    }
    .ng-mynotes-support .ng-mynotes-pill {
      padding: 5.5px 11px;
    }
    .ng-mynotes-search {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mynotes-search input {
      width: 100%;
    }
    .ng-mynotes-search-hint {
      font-size: 0.9em;
      color: var(--text-muted);
    }
    .ng-mynotes-search-hint.is-hidden {
      display: none;
    }
    .ng-mynotes-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ng-mynotes-subheading {
      margin: 24px 0 6px;
      font-size: 1.3em;
      font-weight: 600;
      color: var(--text-muted);
    }
    .ng-mynotes-subheading-toggle {
      position: relative;
      align-self: flex-start;
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0;
      cursor: pointer;
    }
    .ng-mynotes-subheading-toggle:hover {
      color: var(--text-normal);
    }
    .ng-mynotes-caret {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.6em;
      margin-right: 0;
      display: inline-flex;
      width: 10px;
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }
    .ng-mynotes-subheading-label {
      padding-left: 14px;
    }
    .ng-mynotes-note-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .ng-mynotes-note-row:hover {
      background: color-mix(in srgb, var(--text-normal) 6%, transparent);
    }
    .ng-mynotes-note-indicator {
      width: 3px;
      height: 18px;
      border-radius: 2px;
      background: #ec9a63;
      flex-shrink: 0;
      margin-left: -7px;
    }
    .ng-mynotes-note-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ng-mynotes-note-heart,
    .ng-mynotes-note-open-right,
    .ng-mynotes-note-delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      padding: 4px;
      height: auto;
      cursor: pointer;
      color: var(--text-muted);
    }
    .ng-mynotes-note-heart svg,
    .ng-mynotes-note-open-right svg,
    .ng-mynotes-note-delete svg {
      width: 16px;
      height: 16px;
    }
    .ng-mynotes-note-heart:hover {
      color: #ff6565;
    }
    .ng-mynotes-note-heart.is-favourite {
      color: #ff6565;
    }
    .ng-mynotes-note-heart.is-favourite svg,
    .ng-mynotes-note-heart.is-favourite svg * {
      fill: #ff6565 !important;
    }
    .ng-heart-pop {
      animation: ng-heart-pop 0.3s ease;
    }
    @keyframes ng-heart-pop {
      0% { transform: scale(1); }
      45% { transform: scale(1.45); }
      100% { transform: scale(1); }
    }
    .ng-mynotes-note-open-right:hover {
      color: #ec9a63;
      filter: drop-shadow(0 0 4px rgba(236, 154, 99, 0.4));
      transform: translateY(-0.5px);
    }
    .ng-mynotes-note-open-right:hover svg,
    .ng-mynotes-note-open-right:hover svg * {
      stroke: #ec9a63;
      fill: #ec9a63;
    }
    .ng-mynotes-note-delete {
      color: #ff6565;
    }
    .ng-mynotes-note-delete:hover {
      color: #fb2c36;
    }
    .ng-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    .ng-overlay-card {
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 14px;
      padding: 20px;
      min-width: 280px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    }
    .ng-overlay-card.ng-mylearning-edit-overlay-wide {
      min-width: min(420px, 92vw);
      width: min(520px, 92vw);
    }
    .ng-overlay-title {
      margin: 0;
      text-align: center;
      color: var(--text-normal);
      font-weight: 500;
    }
    .ng-overlay-subtitle {
      text-align: center;
      font-style: italic;
      color: var(--text-muted);
    }
    .ng-overlay-error {
      text-align: center;
      color: #ff6565;
    }
    .ng-overlay-text {
      color: var(--text-normal);
      text-align: center;
    }
    .ng-overlay-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .ng-overlay-confirm,
    .ng-overlay-cancel,
    .ng-overlay-danger {
      padding: 6px 16px;
      border-radius: 999px;
      border: 1px solid var(--background-modifier-border);
      background: transparent;
      color: var(--text-normal);
      cursor: pointer;
    }
    .ng-overlay-confirm {
      border-color: #ec9a63;
      background: rgba(236, 154, 99, 0.18);
    }
    .ng-overlay-danger {
      border-color: #fb2c36;
      color: #fb2c36;
    }
    .ng-overlay-danger:hover {
      background: rgba(251, 44, 54, 0.15);
    }
    .view-content.ng-mynotes-header-host {
      display: flex !important;
      flex-direction: column;
      overflow: hidden !important;
    }
    .view-content.ng-mynotes-header-host > .markdown-source-view,
    .view-content.ng-mynotes-header-host > .markdown-reading-view {
      flex: 1 1 auto;
      min-height: 0;
      height: auto !important;
      width: 100%;
      position: relative !important;
      inset: auto !important;
      overflow: hidden;
      box-sizing: border-box;
    }
    .ng-note-header {
      max-width: 720px;
      width: 100%;
      flex: 0 0 auto;
      margin: 0 auto;
      padding: 0;
      border: none;
      border-bottom: 1px solid var(--background-modifier-border);
      display: flex;
      flex-direction: column;
      gap: 0;
      background: transparent;
      position: relative;
      z-index: 18;
    }
    .ng-note-header-top {
      position: relative;
      z-index: 2;
      background: transparent;
      border-bottom: none;
      padding: 6px 0;
    }
    .ng-note-header-top .ng-note-header-note-name {
      position: absolute;
      left: 50%;
      max-width: min(48%, 360px);
      opacity: 0;
      transform: translateX(-50%);
      pointer-events: none;
      transition: opacity 203ms ease;
    }
    .ng-note-header.is-collapsed .ng-note-header-top .ng-note-header-note-name {
      opacity: 1;
      transition: opacity 254ms ease 203ms;
    }
    .ng-note-header .ng-journal-nav-button {
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      padding: 0;
      width: auto;
    }
    .ng-note-header .ng-journal-nav-button:hover {
      border: none !important;
      background: none !important;
      box-shadow: none !important;
    }
    .ng-note-header-stage {
      position: relative;
      height: var(--ng-note-header-full-height, 1px);
      overflow: hidden;
      transition: height 355ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ng-note-header-collapsed-summary {
      display: flex;
      position: absolute;
      inset: 0 0 auto;
      flex-direction: column;
      gap: 4px;
      min-height: 44px;
      opacity: 0;
      transform: translateY(-3px);
      padding: 6px 42px 8px 0;
      box-sizing: border-box;
      border-bottom: none;
      background: transparent;
      pointer-events: none;
      transition: opacity 203ms ease, transform 203ms ease;
    }
    .ng-note-header.is-collapsed .ng-note-header-collapsed-summary {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      transition: opacity 254ms ease 203ms, transform 254ms ease 203ms;
    }
    .ng-note-header-collapsed-controls {
      display: inline-flex;
      position: absolute;
      right: 0;
      bottom: 4px;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .ng-note-header-note-name {
      margin: 0;
      font-size: 1.365em;
      color: var(--text-normal);
      font-weight: 600;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ng-note-header-collapsed-categories {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      gap: 6px;
    }
    .ng-note-header-mini-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, #ec9a63 30%, transparent);
      font-size: 0.82em;
      color: var(--text-muted);
      background: transparent;
    }
    .ng-note-header-mini-pill-support {
      border-color: var(--ng-support-color);
    }
    .ng-note-header-collapsed-empty {
      font-size: 0.82em;
      color: var(--text-muted);
      font-style: italic;
    }
    .ng-note-header-full {
      position: absolute;
      inset: 0 0 auto;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      transition: opacity 254ms ease 203ms, transform 254ms ease 203ms;
    }
    .ng-note-header.is-collapsed .ng-note-header-stage {
      height: var(--ng-note-header-compact-height, 1px);
    }
    .ng-note-header.is-collapsed .ng-note-header-full {
      opacity: 0;
      transform: translateY(-3px);
      pointer-events: none;
      transition: opacity 203ms ease, transform 203ms ease;
    }
    .ng-note-header-to-top {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin-left: 0;
      padding: 0;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: color-mix(in srgb, #ec9a63 62%, white);
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      opacity: 1;
      pointer-events: auto;
      transition: color 150ms ease, transform 150ms ease;
    }
    .ng-note-header-to-top:hover {
      color: #ec9a63;
      transform: translateY(-1px);
    }
    .ng-note-header-box {
      border: none;
      border-radius: 0;
      padding: 4px 0 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: transparent;
    }
    .ng-note-header .ng-mynotes-section-title {
      font-size: 1.3em;
      color: var(--text-normal);
    }
    .ng-note-header-categories-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ng-note-header-categories-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .ng-note-header-add-category-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: color-mix(in srgb, #ec9a63 55%, white);
      cursor: pointer;
      font-size: 1.5em;
      font-weight: 600;
      line-height: 1;
    }
    .ng-note-header-add-category-icon:hover {
      color: #ec9a63;
    }
    .ng-note-header-add-category-icon.has-input {
      color: #ec9a63;
    }
    .ng-note-header-fav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: var(--text-muted);
      cursor: pointer;
    }
    .ng-note-header-fav svg {
      width: 18px;
      height: 18px;
    }
    .ng-note-header-fav:hover {
      color: #ff6565;
    }
    .ng-note-header-fav.is-favourite {
      color: #ff6565;
    }
    .ng-note-header-fav.is-favourite svg,
    .ng-note-header-fav.is-favourite svg * {
      fill: #ff6565 !important;
    }
    .ng-note-header-support-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      color: var(--text-muted);
      cursor: pointer;
    }
    .ng-note-header-support-toggle svg {
      width: 18px;
      height: 18px;
    }
    .ng-note-header-support-toggle:hover {
      color: #00f0ff;
    }
    .ng-note-header-support-toggle.is-active {
      color: #00f0ff;
    }
    .ng-note-header-support-toggle.is-active svg,
    .ng-note-header-support-toggle.is-active svg * {
      stroke: #00f0ff;
      fill: #00f0ff !important;
    }
    .ng-note-header-nav {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
    .ng-note-header-spacer {
      height: 4px;
    }
    .ng-note-header-add-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .ng-note-header-add-row input {
      flex: 1;
    }
    .ng-note-header-support {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }
    .ng-note-header-support.is-hidden {
      display: none;
    }
    .ng-note-header-category-pill {
      border-color: color-mix(in srgb, var(--background-modifier-border) 55%, transparent);
      color: var(--text-muted);
    }
    .ng-learning-note-header .ng-note-header-category-pill {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 34%, var(--background-modifier-border));
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 4%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ng-mylearning-category-color) 8%, transparent);
      color: color-mix(in srgb, var(--text-normal) 90%, var(--background-primary));
    }
    .ng-learning-note-header .ng-note-header-category-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 76%, var(--background-modifier-border));
    }
    .ng-learning-note-header .ng-note-header-category-pill.is-active {
      border-color: var(--ng-mylearning-category-color);
      background: color-mix(in srgb, var(--ng-mylearning-category-color) 8%, var(--background-primary));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ng-mylearning-category-color) 28%, transparent), 0 0 12px color-mix(in srgb, var(--ng-mylearning-category-color) 18%, transparent);
      color: var(--text-normal);
    }
    .ng-learning-note-header .ng-mynotes-pill.is-edit-target {
      border-style: dashed;
      cursor: pointer;
    }
    .ng-mylearning .ng-mylearning-category-pill.ng-mynotes-pill:not(.is-active) {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 40%, transparent);
      color: var(--text-normal);
    }
    .ng-mylearning .ng-mylearning-category-pill.ng-mynotes-pill:not(.is-active):hover {
      border-color: color-mix(in srgb, var(--ng-mylearning-category-color) 78%, var(--background-modifier-border));
      color: var(--text-normal);
    }
    @media (max-width: 1024px), (hover: none) {
      .ng-mynotes-categories .ng-mylearning-inline-edit {
        width: 22px;
        min-width: 22px;
        height: 22px;
        color: color-mix(in srgb, var(--text-normal) 84%, white);
      }
      .ng-mynotes-categories .ng-mylearning-inline-edit svg {
        width: 14px;
        height: 14px;
      }
    }
  `;
  document.head.appendChild(style);
}

// src/homeView.ts
var NeuralGardenHomeView = class extends import_obsidian.ItemView {
  constructor(leaf, storage, journalingStorage, openJournalingView, openMyNotesView, openMyLearningView) {
    super(leaf);
    this.storage = storage;
    this.journalingStorage = journalingStorage;
    this.openJournalingView = openJournalingView;
    this.openMyNotesView = openMyNotesView;
    this.openMyLearningView = openMyLearningView;
    this.state = { ...DEFAULT_STATE };
    this.searchDebounceTimer = null;
    this.breakTickTimer = null;
    this.breakMessageTimer = null;
    this.breakTimerEl = null;
    this.breakMessageEl = null;
    this.lastBreakMessageIndex = null;
    this.supportHintTimer = null;
    this.supportHintEl = null;
    this.supportHints = [];
    this.lastSupportHintIndex = null;
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
    if (this.supportHintTimer) {
      window.clearInterval(this.supportHintTimer);
      this.supportHintTimer = null;
    }
    this.lastBreakMessageIndex = null;
    this.lastSupportHintIndex = null;
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
    if (this.shouldShowWeeklyRecapHint()) {
      categories.createDiv({ cls: "ng-weekly-available-hint", text: "Weekly Recap Available" });
    }
    const categoryGrid = categories.createDiv({ cls: "ng-category-grid" });
    const journalButton = this.makeCategoryButton("Journaling", "book-open", () => {
      void this.openJournalingView(true, this.leaf);
    });
    categoryGrid.appendChild(journalButton);
    const notesButton = this.makeCategoryButton("MyNotes", "folder", () => {
      void this.openMyNotesView(true, this.leaf);
    });
    categoryGrid.appendChild(notesButton);
    const quickNoteButton = this.makeCategoryButton("+ QuickNote", "pencil", () => {
      new import_obsidian.Notice("QuickNote interface placeholder");
    });
    categoryGrid.appendChild(quickNoteButton);
    const learningButton = this.makeCategoryButton("MyLearning", "brain", () => {
      void this.openMyLearningView(true, this.leaf);
    });
    categoryGrid.appendChild(learningButton);
    const hintStrip = wrapper.createDiv({ cls: "ng-home-hints-strip" });
    void this.renderSupportHintsStrip(hintStrip);
    this.renderSearchSection(wrapper);
    this.renderTaskManager(wrapper);
    const supportSection = wrapper.createDiv({ cls: "ng-home-support" });
    void this.renderSupportSection(supportSection);
    injectNeuralGardenStyles();
    this.syncBreakLiveUpdates();
  }
  async renderSupportSection(container) {
    container.empty();
    const recap = await this.getLatestWeeklyRecapFrontmatter();
    if (!recap || recap.supportNotes.length === 0) {
      container.remove();
      return;
    }
    const heading = container.createEl("h3", { text: "Support Notes", cls: "ng-home-support-heading" });
    heading.style.textAlign = "center";
    heading.style.color = "var(--text-normal)";
    const copy = container.createDiv({
      cls: "ng-home-support-copy",
      text: "Considering your current symptoms, take a look at the following notes."
    });
    copy.style.textAlign = "center";
    copy.style.setProperty("color", "var(--text-muted)", "important");
    copy.style.fontStyle = "italic";
    copy.style.fontSize = "0.86rem";
    const noteList = container.createDiv({ cls: "ng-home-support-notes" });
    for (const name of recap.supportNotes) {
      const row = noteList.createDiv({ cls: "ng-home-support-note" });
      row.textContent = name;
      const baseColor = "#8fcf9d";
      const hoverColor = "#47fc82";
      row.style.setProperty("color", baseColor, "important");
      row.addEventListener("mouseenter", () => {
        row.style.setProperty("color", hoverColor, "important");
      });
      row.addEventListener("mouseleave", () => {
        row.style.setProperty("color", baseColor, "important");
      });
      row.addEventListener("click", async () => {
        const target = this.app.vault.getMarkdownFiles().find((file) => file.basename === name && file.path.startsWith(`${NOTES_FOLDER}/`));
        if (!target) {
          new import_obsidian.Notice(`Support note not found: ${name}`);
          return;
        }
        await this.leaf.openFile(target);
      });
    }
  }
  async renderSupportHintsStrip(container) {
    var _a;
    container.empty();
    const recap = await this.getLatestWeeklyRecapFrontmatter();
    this.supportHintEl = container.createDiv({ cls: "ng-home-support-hint" });
    this.supportHints = (_a = recap == null ? void 0 : recap.supportHints) != null ? _a : [];
    if (this.supportHints.length === 0) {
      this.supportHintEl.textContent = "";
      return;
    }
    this.supportHintEl.textContent = this.getNextSupportHint();
    if (this.supportHintTimer) {
      window.clearInterval(this.supportHintTimer);
      this.supportHintTimer = null;
    }
    this.supportHintTimer = window.setInterval(() => {
      if (!this.supportHintEl) {
        return;
      }
      this.supportHintEl.classList.remove("is-visible");
      window.setTimeout(() => {
        if (!this.supportHintEl) {
          return;
        }
        this.supportHintEl.textContent = this.getNextSupportHint();
        this.supportHintEl.classList.add("is-visible");
      }, 2200);
    }, 7800);
    this.supportHintEl.classList.add("is-visible");
  }
  async getLatestWeeklyRecapFrontmatter() {
    const recaps = this.app.vault.getFiles().filter((file) => file.path.startsWith(`${JOURNAL_WEEKLY_FOLDER}/`) && file.extension === "md");
    if (recaps.length === 0) {
      return null;
    }
    let latestFrontmatter = null;
    let latestTime = 0;
    for (const recapFile of recaps) {
      const recap = await this.journalingStorage.readWeeklyRecap(recapFile);
      const stamp = Date.parse(recap.frontmatter.generatedAt || "");
      if (!latestFrontmatter || stamp > latestTime) {
        latestFrontmatter = recap.frontmatter;
        latestTime = stamp;
      }
    }
    return latestFrontmatter;
  }
  renderSearchSection(parent) {
    const searchSection = parent.createDiv({ cls: "ng-search" });
    const heading = searchSection.createEl("h3", { text: "Search Notes", cls: "ng-search-heading" });
    heading.style.textAlign = "center";
    const input = searchSection.createEl("input", {
      type: "text",
      placeholder: "Search Notes..."
    });
    input.addClass("ng-task-input");
    const results = searchSection.createDiv({ cls: "ng-search-results ng-mynotes-list" });
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
      const row = container.createDiv({ cls: "ng-mynotes-note-row ng-home-search-note-row" });
      row.createDiv({ cls: "ng-mynotes-note-indicator" });
      row.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });
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
  shouldShowWeeklyRecapHint() {
    const today = /* @__PURE__ */ new Date();
    const week = isoWeekInfo(today);
    const recapPath = this.journalingStorage.weeklyRecapPath(week.year, week.week);
    const recapFile = this.app.vault.getAbstractFileByPath(recapPath);
    if (recapFile) {
      return false;
    }
    const dailyCandidates = this.app.vault.getFiles().filter((file) => file.path.startsWith("Journal/Daily/") && file.extension === "md");
    const currentWeekEntries = dailyCandidates.filter((file) => {
      const date = parseDateFromDailyFileName(file.basename);
      if (!date) {
        return false;
      }
      const info = isoWeekInfo(date);
      return info.year === week.year && info.week === week.week;
    });
    return currentWeekEntries.length >= WEEKLY_RECAP_HOME_HINT_MIN_ENTRIES;
  }
  getNextSupportHint() {
    if (this.supportHints.length === 0) {
      return "";
    }
    if (this.supportHints.length === 1) {
      this.lastSupportHintIndex = 0;
      return this.supportHints[0];
    }
    let next = Math.floor(Math.random() * this.supportHints.length);
    if (this.lastSupportHintIndex !== null && next === this.lastSupportHintIndex) {
      next = (next + 1 + Math.floor(Math.random() * (this.supportHints.length - 1))) % this.supportHints.length;
    }
    this.lastSupportHintIndex = next;
    return this.supportHints[next];
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
function parseDateFromDailyFileName(baseName) {
  const match = baseName.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
function isoWeekInfo(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
  return { year: utcDate.getUTCFullYear(), week };
}
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

// src/overlay.ts
function openOverlay(title, dismissible = true) {
  const overlay = document.body.createDiv({ cls: "ng-overlay" });
  const card = overlay.createDiv({ cls: "ng-overlay-card" });
  card.createEl("h3", { text: title, cls: "ng-overlay-title" });
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKeyDown);
  };
  const onKeyDown = (event) => {
    if (dismissible && event.key === "Escape") {
      close();
    }
  };
  overlay.addEventListener("click", (event) => {
    if (dismissible && event.target === overlay) {
      close();
    }
  });
  document.addEventListener("keydown", onKeyDown);
  return { card, close };
}

// src/journalingEntryView.ts
var METRICS = [
  { key: "mood", label: "Mood", explanation: "How have you been feeling?" },
  { key: "sleep", label: "Sleep", explanation: "How rested did you feel after sleeping?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself?" },
  { key: "stress", label: "Stress", explanation: "How stressed were you?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel?" },
  { key: "sensoryLoad", label: "Sensory Load", explanation: "Have you had any sensory issues? How intense were they?" },
  { key: "socialLoad", label: "Social Load", explanation: "How demanding were social interactions?" }
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
    this.trackers = [];
    this.saveChain = Promise.resolve();
    this.compactStats = false;
    this.taskEditMode = false;
    this.collapseTimer = null;
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
    this.saveChain = Promise.resolve();
    this.compactStats = false;
    this.taskEditMode = false;
    if (this.collapseTimer !== null) {
      window.clearTimeout(this.collapseTimer);
      this.collapseTimer = null;
    }
  }
  async openForDate(dateKey, editable) {
    this.editable = editable && isEditableJournalDate(dateKey);
    const existing = await this.journalingStorage.readDailyEntryByDate(dateKey);
    if (!existing) {
      this.entry = null;
      this.renderEmpty();
      this.openCreationConfirmation(dateKey);
      return;
    }
    await this.showEntry(existing);
  }
  async showEntry(entry) {
    this.entry = entry;
    this.trackers = await this.journalingStorage.listTrackers();
    this.compactStats = !this.editable && this.entry.body.trim().length > 0;
    this.taskEditMode = false;
    this.render();
  }
  setCompactStats(compact) {
    const page = this.contentEl.querySelector(".ng-journal-entry-page");
    if (!(page instanceof HTMLElement)) {
      return;
    }
    if (compact && (this.compactStats || page.hasClass("is-collapsing"))) {
      return;
    }
    if (this.collapseTimer !== null) {
      window.clearTimeout(this.collapseTimer);
      this.collapseTimer = null;
    }
    if (!compact) {
      this.compactStats = false;
      page.removeClass("is-collapsing", "is-compact");
      return;
    }
    page.addClass("is-collapsing");
    this.collapseTimer = window.setTimeout(() => {
      this.collapseTimer = null;
      this.compactStats = true;
      page.removeClass("is-collapsing");
      page.addClass("is-compact");
    }, 360);
  }
  openCreationConfirmation(dateKey) {
    const { card, close } = openOverlay("Are your tasks up to date?", false);
    card.createDiv({
      cls: "ng-overlay-text",
      text: "Continuing will capture the current task list in this journal entry."
    });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const cancelButton = actions.createEl("button", { text: "Cancel" });
    const continueButton = actions.createEl("button", { text: "Continue", cls: "ng-overlay-confirm" });
    cancelButton.addEventListener("click", async () => {
      close();
      await this.openJournalingView(true, this.leaf);
    });
    continueButton.addEventListener("click", async () => {
      continueButton.disabled = true;
      cancelButton.disabled = true;
      try {
        const entry = await this.createDraftEntry(dateKey);
        close();
        await this.showEntry(entry);
      } catch (e) {
        continueButton.disabled = false;
        cancelButton.disabled = false;
        new import_obsidian2.Notice("Could not create the journal entry.");
      }
    });
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
      goodThing: "",
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
    wrapper.toggleClass("is-compact", this.compactStats);
    const stickyHeader = wrapper.createDiv({ cls: "ng-journal-entry-sticky-header" });
    const topBar = stickyHeader.createDiv({ cls: "ng-journal-topbar" });
    const leftNav = topBar.createDiv({ cls: "ng-journal-topbar-left" });
    leftNav.appendChild(this.makeNavButton("<- Journaling", async () => this.openJournalingView(true, this.leaf)));
    const rightNav = topBar.createDiv({ cls: "ng-journal-topbar-right" });
    rightNav.appendChild(this.makeNavButton("Home", async () => this.openHomeView(true, this.leaf)));
    const titleWrap = topBar.createDiv({ cls: "ng-journal-title-wrap" });
    titleWrap.createEl("h2", { text: `Journal Entry - ${formatReadableDate(this.entry.frontmatter.date)}` });
    titleWrap.createEl("h3", { text: "Daily Check In" });
    this.renderCompactSummary(stickyHeader);
    const fullCheckIn = wrapper.createDiv({ cls: "ng-journal-full-check-in" });
    this.renderMetrics(fullCheckIn);
    this.renderEmotions(fullCheckIn);
    this.renderTrackerSection(fullCheckIn);
    this.renderGoodThing(fullCheckIn);
    this.renderTasks(fullCheckIn);
    this.renderEntryBody(wrapper);
    this.syncCollapseHeights(wrapper);
  }
  syncCollapseHeights(page) {
    const fullCheckIn = page.querySelector(".ng-journal-full-check-in");
    const compactSummary = page.querySelector(".ng-journal-compact-summary");
    if (fullCheckIn instanceof HTMLElement) {
      page.style.setProperty("--ng-journal-full-height", `${fullCheckIn.scrollHeight}px`);
    }
    if (compactSummary instanceof HTMLElement) {
      page.style.setProperty("--ng-journal-compact-height", `${compactSummary.scrollHeight}px`);
    }
  }
  renderCompactSummary(parent) {
    var _a;
    if (!this.entry) {
      return;
    }
    const summary = parent.createDiv({ cls: "ng-journal-compact-summary" });
    const heading = summary.createDiv({ cls: "ng-journal-compact-heading" });
    heading.createSpan({ text: "Daily Check In" });
    const metrics = summary.createDiv({ cls: "ng-journal-compact-metrics" });
    for (const metric of METRICS) {
      const value = (_a = this.entry.frontmatter[metric.key]) != null ? _a : 0;
      const item = metrics.createDiv({ cls: "ng-journal-compact-metric" });
      item.createSpan({ text: metric.label });
      const track = item.createSpan({ cls: "ng-journal-compact-track" });
      const fill = track.createSpan({ cls: "ng-journal-compact-fill" });
      fill.style.width = `${value}%`;
      fill.style.backgroundColor = metricColor(metric.key, value);
    }
    const details = summary.createDiv({ cls: "ng-journal-compact-details" });
    const addDetailRow = (label, values) => {
      const row = details.createDiv({ cls: "ng-journal-compact-detail-row" });
      row.createSpan({ cls: "ng-journal-compact-detail-label", text: label });
      if (values.length === 0) {
        row.createSpan({ cls: "ng-journal-compact-empty", text: "None" });
        return;
      }
      for (const value of values) {
        const chip = row.createSpan({ cls: "ng-journal-compact-chip", text: value.text });
        if (value.tone) {
          chip.addClass(value.tone);
        }
        if (value.color) {
          chip.style.setProperty("--ng-compact-chip-color", value.color);
          chip.addClass("is-tracker");
        }
      }
    };
    addDetailRow("Emotions", this.entry.frontmatter.emotions.map((emotion) => ({
      text: emotion,
      tone: getEmotionToneClass(emotion)
    })));
    addDetailRow(
      "Trackers",
      this.trackers.filter((tracker) => tracker.dates.includes(this.entry.frontmatter.date)).map((tracker) => ({ text: tracker.name, color: tracker.color }))
    );
    addDetailRow("One Good Thing", this.entry.frontmatter.goodThing ? [{ text: this.entry.frontmatter.goodThing }] : []);
    const tasksRow = details.createDiv({ cls: "ng-journal-compact-detail-row ng-journal-compact-tasks-row" });
    const tasksLabel = tasksRow.createSpan({ cls: "ng-journal-compact-detail-label ng-journal-compact-tasks-label" });
    tasksLabel.createSpan({ text: "Tasks" });
    tasksLabel.createSpan({ text: "completed" });
    const tasks = tasksRow.createDiv({ cls: "ng-journal-compact-task-list" });
    if (this.entry.frontmatter.completedTasks.length === 0) {
      tasks.createSpan({ cls: "ng-journal-compact-empty", text: "None" });
    }
    for (const task of this.entry.frontmatter.completedTasks) {
      const taskItem = tasks.createDiv({ cls: "ng-journal-compact-task" });
      taskItem.createSpan({ cls: "ng-journal-compact-task-name", text: task.taskName });
      const badge = taskItem.createSpan({ cls: "ng-journal-compact-task-badge", text: effortLabel(task.effort) });
      badge.style.setProperty("--ng-compact-task-color", effortColor(task.effort));
    }
    const expandButton = tasksRow.createEl("button", {
      text: "Expand",
      cls: "ng-journal-nav-button ng-journal-compact-expand"
    });
    expandButton.addEventListener("click", () => this.setCompactStats(false));
  }
  renderGoodThing(parent) {
    if (!this.entry) {
      return;
    }
    const block = parent.createDiv({ cls: "ng-journal-good-thing" });
    block.createEl("h4", { text: "One Good Thing About Today" });
    if (!this.editable) {
      block.createDiv({
        cls: this.entry.frontmatter.goodThing ? "ng-journal-good-thing-value" : "ng-empty",
        text: this.entry.frontmatter.goodThing || "No reflection was recorded."
      });
      return;
    }
    const input = block.createEl("input", {
      type: "text",
      cls: "ng-task-input ng-journal-good-thing-input",
      placeholder: "Name one good thing from today"
    });
    input.value = this.entry.frontmatter.goodThing;
    input.addEventListener("input", () => {
      if (!this.entry) {
        return;
      }
      this.entry.frontmatter.goodThing = input.value;
      void this.persist();
    });
  }
  renderTrackerSection(parent) {
    if (!this.entry) {
      return;
    }
    const block = parent.createDiv({ cls: "ng-journal-tracker-block" });
    block.createEl("h4", { text: "Tracker" });
    if (this.trackers.length === 0) {
      block.createDiv({ cls: "ng-empty", text: "No trackers yet." });
      return;
    }
    const dateKey = this.entry.frontmatter.date;
    const chips = block.createDiv({ cls: "ng-journal-tracker-chips" });
    for (const tracker of this.trackers) {
      const isTracked = tracker.dates.includes(dateKey);
      const chip = chips.createDiv({ cls: "ng-journal-tracker-chip" });
      chip.style.setProperty("--ng-tracker-color", tracker.color);
      chip.createSpan({ text: tracker.name });
      chip.toggleClass("is-active", isTracked);
      if (!this.editable) {
        continue;
      }
      chip.addClass("is-clickable");
      chip.setAttribute("role", "button");
      chip.setAttribute("tabindex", "0");
      chip.setAttribute("aria-pressed", String(isTracked));
      const toggle = async () => {
        const next = await this.journalingStorage.toggleTrackerDate(tracker, dateKey);
        this.trackers = this.trackers.map((candidate) => candidate.file.path === next.file.path ? next : candidate);
        this.render();
      };
      chip.addEventListener("click", () => {
        void toggle();
      });
      chip.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void toggle();
        }
      });
    }
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
  renderTasks(parent) {
    if (!this.entry) {
      return;
    }
    const completedTasks = this.entry.frontmatter.completedTasks;
    const uncompletedTasks = this.entry.frontmatter.uncompletedTasks;
    const block = parent.createDiv({ cls: "ng-journal-tasks" });
    const header = block.createDiv({ cls: "ng-journal-tasks-header" });
    header.createEl("h4", { text: "Tasks" });
    if (this.editable) {
      const editButton = header.createEl("button", { cls: "ng-journal-task-edit-button" });
      editButton.setAttribute("aria-label", this.taskEditMode ? "Finish editing tasks" : "Edit tasks");
      editButton.setAttribute("title", this.taskEditMode ? "Finish editing tasks" : "Edit tasks");
      (0, import_obsidian2.setIcon)(editButton, this.taskEditMode ? "check" : "pencil");
      editButton.addEventListener("click", () => {
        this.taskEditMode = !this.taskEditMode;
        this.render();
      });
    }
    if (this.taskEditMode) {
      this.renderTaskEditor(block);
    }
    if (completedTasks.length > 0) {
      this.renderTaskGroup(block, "Completed Tasks", completedTasks, "completedTasks");
    }
    if (uncompletedTasks.length > 0) {
      this.renderTaskGroup(block, "Uncompleted Tasks", uncompletedTasks, "uncompletedTasks");
    }
    if (completedTasks.length === 0 && uncompletedTasks.length === 0) {
      block.createDiv({ cls: "ng-empty", text: "No tasks captured." });
    }
  }
  renderTaskEditor(parent) {
    const form = parent.createDiv({ cls: "ng-journal-task-editor" });
    const nameInput = form.createEl("input", { type: "text", placeholder: "Task name", cls: "ng-task-input" });
    const efforts = form.createDiv({ cls: "ng-journal-task-efforts" });
    const addTask = async (effort) => {
      if (!this.entry) {
        return;
      }
      const taskName = nameInput.value.trim();
      if (!taskName) {
        nameInput.focus();
        return;
      }
      this.entry.frontmatter.completedTasks = [
        ...this.entry.frontmatter.completedTasks,
        { taskName, effort: effort.key, energy: effort.energy }
      ];
      await this.persist();
      this.render();
    };
    for (const effort of EFFORTS) {
      const button = efforts.createEl("button", { text: effort.label, cls: "ng-journal-task-effort" });
      button.style.setProperty("--ng-task-effort-color", effort.color);
      button.setAttribute("aria-label", `Add completed task as ${effort.label}`);
      button.addEventListener("click", () => void addTask(effort));
    }
  }
  renderTaskGroup(parent, title, tasks, listKey) {
    const group = parent.createDiv({ cls: "ng-journal-task-group" });
    group.createEl("h5", { text: title });
    const list = group.createDiv({ cls: "ng-journal-task-list" });
    for (const task of tasks) {
      const row = list.createDiv({ cls: "ng-journal-task-row" });
      row.createDiv({ cls: "ng-journal-task-name", text: task.taskName });
      const badge = row.createSpan({ cls: "ng-journal-task-badge", text: effortLabel(task.effort) });
      badge.style.borderColor = effortColor(task.effort);
      badge.style.color = effortColor(task.effort);
      if (this.taskEditMode) {
        const deleteButton = row.createEl("button", { cls: "ng-journal-task-delete" });
        deleteButton.setAttribute("aria-label", `Delete ${task.taskName}`);
        (0, import_obsidian2.setIcon)(deleteButton, "x");
        deleteButton.addEventListener("click", async () => {
          if (!this.entry) {
            return;
          }
          this.entry.frontmatter[listKey] = this.entry.frontmatter[listKey].filter((_, index) => tasks[index] !== task);
          await this.persist();
          this.render();
        });
      }
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
    body.innerText = this.entry.body;
    body.contentEditable = String(this.editable);
    body.spellcheck = true;
    body.addEventListener("input", () => {
      var _a;
      if (!this.entry || !this.editable) {
        return;
      }
      this.entry.body = body.innerText.replace(/\r\n/g, "\n");
      if (this.entry.body.length > 0) {
        const stickyHeader = this.contentEl.querySelector(".ng-journal-entry-sticky-header");
        (_a = stickyHeader == null ? void 0 : stickyHeader.querySelector(".ng-journal-compact-summary")) == null ? void 0 : _a.remove();
        if (stickyHeader instanceof HTMLElement) {
          this.renderCompactSummary(stickyHeader);
        }
        const page = this.contentEl.querySelector(".ng-journal-entry-page");
        if (page instanceof HTMLElement) {
          this.syncCollapseHeights(page);
        }
        this.setCompactStats(true);
      }
    });
    body.addEventListener("blur", () => {
      if (!this.entry || !this.editable) {
        return;
      }
      this.entry.body = body.innerText.replace(/\r\n/g, "\n");
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
function yesterdayDateKey() {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function isEditableJournalDate(dateKey) {
  return dateKey === currentDateKey() || dateKey === yesterdayDateKey();
}
function formatReadableDate(dateKey) {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateKey;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString(void 0, { day: "numeric", month: "long", year: "numeric" });
}
function metricColor(metric, value) {
  const clamped = Math.max(0, Math.min(100, value));
  if (metric === "regulation" || metric === "mood" || metric === "sleep") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [255, 101, 101] },
      { value: 46, color: [240, 160, 76] },
      { value: 61, color: [244, 211, 94] },
      { value: 85, color: [57, 224, 90] },
      { value: 100, color: [57, 224, 90] }
    ]);
  }
  if (metric === "stress" || metric === "anxiety") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [57, 224, 90] },
      { value: 36, color: [244, 211, 94] },
      { value: 51, color: [240, 160, 76] },
      { value: 85, color: [255, 101, 101] },
      { value: 100, color: [255, 101, 101] }
    ]);
  }
  if (metric === "exhaustion" || metric === "sensoryLoad" || metric === "socialLoad") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [57, 224, 90] },
      { value: 41, color: [244, 211, 94] },
      { value: 56, color: [240, 160, 76] },
      { value: 85, color: [255, 101, 101] },
      { value: 100, color: [255, 101, 101] }
    ]);
  }
  return "#39e05a";
}
function interpolateMetricStops(value, stops) {
  if (stops.length === 0) {
    return "#39e05a";
  }
  if (value <= stops[0].value) {
    return rgbToHex(stops[0].color);
  }
  for (let i = 0; i < stops.length - 1; i += 1) {
    const start = stops[i];
    const end = stops[i + 1];
    if (value <= end.value) {
      const distance = end.value - start.value;
      const ratio = distance <= 0 ? 1 : (value - start.value) / distance;
      const color = [
        Math.round(start.color[0] + (end.color[0] - start.color[0]) * ratio),
        Math.round(start.color[1] + (end.color[1] - start.color[1]) * ratio),
        Math.round(start.color[2] + (end.color[2] - start.color[2]) * ratio)
      ];
      return rgbToHex(color);
    }
  }
  return rgbToHex(stops[stops.length - 1].color);
}
function rgbToHex([r, g, b]) {
  const toHex = (channel) => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function getMetricFeedback(metric, value) {
  if (metric === "mood") {
    if (value >= 80) return "I've been doing great.";
    if (value >= 51) return "I've been doing fine.";
    if (value >= 36) return "I've been alright.";
    return "I've been having a hard time.";
  }
  if (metric === "sleep") {
    if (value >= 80) return "My sleep was great, I feel well rested.";
    if (value >= 61) return "My sleep was good, I feel rested.";
    if (value >= 41) return "My sleep was alright.";
    if (value >= 21) return "I didn't really sleep well.";
    return "I've had a terrible night.";
  }
  if (metric === "regulation") {
    if (value >= 70) return "Regulation felt strong and steady.";
    if (value >= 51) return "I was mostly able to regulate myself.";
    if (value >= 36) return "Regulation was mixed, with some difficult moments.";
    return "I felt overwhelmed and dysregulated.";
  }
  if (metric === "stress") {
    if (value >= 80) return "I've been constantly stressed.";
    if (value >= 60) return "I was really stressed.";
    if (value >= 41) return "Stress was present, but I was able to manage it.";
    return "Stress has been fairly low.";
  }
  if (metric === "anxiety") {
    if (value >= 80) return "I've been constantly and severely anxious.";
    if (value >= 60) return "I was really anxious.";
    if (value >= 41) return "I've experienced anxiety here and there.";
    return "I had low or no anxiety.";
  }
  if (metric === "exhaustion") {
    if (value >= 80) return "I've felt extremely exhausted.";
    if (value >= 60) return "I felt heavily exhausted.";
    if (value >= 31) return "I was noticeably tired, but still functioning.";
    return "My energy felt steady.";
  }
  if (metric === "sensoryLoad") {
    if (value >= 80) return "I was in sensory overload.";
    if (value >= 60) return "I've had demanding sensory issues.";
    if (value >= 31) return "I've had fair sensory issues.";
    return "I've had no or low sensory issues.";
  }
  if (metric === "socialLoad") {
    if (value >= 80) return "Social interactions were highly demanding, wearing me out.";
    if (value >= 65) return "Social interactions were exhausting.";
    if (value >= 51) return "Social interactions were tiring.";
    if (value >= 30) return "Social interactions were alright.";
    return "Social interactions felt good, easy, and natural.";
  }
  if (value >= 70) return "Regulation felt strong and steady.";
  if (value >= 51) return "I was mostly able to regulate myself.";
  if (value >= 36) return "Regulation was mixed, with some difficult moments.";
  return "I felt overwhelmed and dysregulated.";
}
function getEmotionToneClass(emotion) {
  return PLEASANT_EMOTIONS.includes(emotion) ? "pleasant" : "unpleasant";
}

// src/journalingView.ts
var import_obsidian3 = require("obsidian");
var METRICS2 = [
  { key: "mood", label: "Mood", explanation: "How have you been feeling?" },
  { key: "sleep", label: "Sleep", explanation: "How rested did you feel after sleeping?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself?" },
  { key: "stress", label: "Stress", explanation: "How stressed were you?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel?" },
  { key: "sensoryLoad", label: "Sensory Load", explanation: "Have you had any sensory issues? How intense were they?" },
  { key: "socialLoad", label: "Social Load", explanation: "How demanding were social interactions?" }
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
var TRACKER_DAYS = 15;
var TRACKER_COLORS = [
  { name: "Green", value: "#39E05A" },
  { name: "Cyan", value: "#00F0FF" },
  { name: "Blue", value: "#5B8CFF" },
  { name: "Purple", value: "#A78BFA" },
  { name: "Orange", value: "#EC9A63" },
  { name: "Red", value: "#FF6565" }
];
var NeuralGardenJournalingView = class extends import_obsidian3.ItemView {
  constructor(leaf, taskStorage, journalingStorage, openHomeView, openJournalEntryView, openWeeklyRecap) {
    super(leaf);
    this.taskStorage = taskStorage;
    this.journalingStorage = journalingStorage;
    this.openHomeView = openHomeView;
    this.openJournalEntryView = openJournalEntryView;
    this.openWeeklyRecap = openWeeklyRecap;
    this.calendarMonth = startOfMonth(/* @__PURE__ */ new Date());
    this.selectedDateKey = null;
    this.dailyEntries = [];
    this.trackers = [];
    this.selectedEntry = null;
    this.selectedWeekKey = null;
    this.weeklyPreview = null;
    this.generatedWeeklyRecaps = /* @__PURE__ */ new Set();
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
    this.selectedDateKey = null;
    this.selectedWeekKey = null;
    this.weeklyPreview = null;
  }
  async reloadState() {
    var _a, _b;
    await this.journalingStorage.ensureJournalFolders();
    this.dailyEntries = await this.journalingStorage.listDailyEntries();
    this.trackers = (await this.journalingStorage.listTrackers()).slice(0, 18);
    this.generatedWeeklyRecaps = await this.loadGeneratedWeeklyRecapKeys();
    if (this.selectedDateKey) {
      if (!this.dailyEntries.some((entry) => entry.frontmatter.date === this.selectedDateKey)) {
        const latest = this.dailyEntries[this.dailyEntries.length - 1];
        if (latest) {
          this.selectedDateKey = latest.frontmatter.date;
          this.calendarMonth = startOfMonth((_a = parseDateKey(this.selectedDateKey)) != null ? _a : /* @__PURE__ */ new Date());
        }
      } else {
        this.calendarMonth = startOfMonth((_b = parseDateKey(this.selectedDateKey)) != null ? _b : /* @__PURE__ */ new Date());
      }
    }
    this.selectedEntry = null;
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
    this.renderDailySection(wrapper);
  }
  renderDailySection(parent) {
    const section = parent.createDiv({ cls: "ng-journal-daily" });
    const calendar = section.createDiv({ cls: "ng-journal-calendar-panel" });
    const calendarHeader = calendar.createDiv({ cls: "ng-journal-calendar-header" });
    calendarHeader.createEl("h3", { text: "Calendar" });
    const monthControls = calendarHeader.createDiv({ cls: "ng-journal-month-controls" });
    const prevMonthButton = monthControls.createEl("button", { text: "<--" });
    prevMonthButton.type = "button";
    prevMonthButton.addClass("ng-journal-month-stepper");
    prevMonthButton.title = "Previous month";
    prevMonthButton.addEventListener("click", () => {
      this.shiftCalendarMonth(-1);
    });
    const monthSelector = monthControls.createEl("button");
    monthSelector.type = "button";
    monthSelector.addClass("ng-journal-month-selector");
    monthSelector.textContent = formatMonthLabel(this.calendarMonth);
    monthSelector.title = "Use the arrow keys to change month";
    monthSelector.addEventListener("click", () => {
      monthSelector.focus();
    });
    monthSelector.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
        return;
      }
      event.preventDefault();
      const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      this.shiftCalendarMonth(delta);
    });
    const nextMonthButton = monthControls.createEl("button", { text: "-->" });
    nextMonthButton.type = "button";
    nextMonthButton.addClass("ng-journal-month-stepper");
    nextMonthButton.title = "Next month";
    nextMonthButton.addEventListener("click", () => {
      this.shiftCalendarMonth(1);
    });
    const today = todayKey();
    const hasTodayEntry = this.dailyEntries.some((entry) => entry.frontmatter.date === today);
    const createButton = calendarHeader.createEl("button", { text: "New Entry" });
    createButton.addClass("ng-journal-create-button");
    createButton.disabled = hasTodayEntry;
    if (!createButton.disabled) {
      createButton.addClass("is-highlighted");
      createButton.addEventListener("click", async () => {
        await this.openJournalEntryView(today, true, this.leaf);
      });
    }
    this.renderCalendar(calendar);
    const details = section.createDiv({ cls: "ng-journal-detail-panel" });
    this.renderSelectionPreview(details);
    const trackerSection = section.createDiv({ cls: "ng-tracker-section" });
    this.renderTrackers(trackerSection);
  }
  renderCalendar(container) {
    const entryDates = new Set(this.dailyEntries.map((entry) => entry.frontmatter.date));
    const weeks = buildCalendarWeeks(this.calendarMonth, entryDates);
    const grid = container.createDiv({ cls: "ng-journal-calendar-grid" });
    grid.createDiv({ cls: "ng-journal-calendar-weekday ng-journal-calendar-week-header", text: "Week" });
    for (const label of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      grid.createDiv({ cls: "ng-journal-calendar-weekday", text: label });
    }
    for (const week of weeks) {
      const weekKey = `${week.weekYear}-W${String(week.weekNumber).padStart(2, "0")}`;
      const wasSelectedWeek = this.selectedWeekKey === weekKey;
      const isGenerated = this.generatedWeeklyRecaps.has(weekKey);
      const weekButton = grid.createEl("button");
      weekButton.type = "button";
      weekButton.addClass("ng-journal-week-cell");
      weekButton.textContent = String(week.weekNumber);
      if (isGenerated) {
        weekButton.title = `Week ${week.weekNumber}: recap already created`;
      } else {
        weekButton.title = week.entryCount >= WEEKLY_RECAP_MIN_ENTRIES ? `Week ${week.weekNumber}: ${week.entryCount} entries` : `Week ${week.weekNumber}: ${week.entryCount} entries (need ${WEEKLY_RECAP_MIN_ENTRIES})`;
      }
      if (isGenerated || week.entryCount >= WEEKLY_RECAP_MIN_ENTRIES) {
        if (isGenerated) {
          weekButton.addClass("is-generated");
        } else {
          weekButton.addClass("is-available");
        }
        if (wasSelectedWeek) {
          weekButton.addClass("is-selected");
        }
        weekButton.addEventListener("click", async () => {
          if (wasSelectedWeek) {
            await this.openWeeklyRecap(week.weekYear, week.weekNumber, this.leaf);
            return;
          }
          await this.selectWeekPreview(week.weekYear, week.weekNumber);
        });
      } else {
        weekButton.disabled = true;
      }
      for (const cell of week.days) {
        const wasSelected = cell.dateKey === this.selectedDateKey;
        const button = grid.createEl("button");
        button.type = "button";
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
        const hasEntry = entryDates.has(cell.dateKey);
        if (hasEntry) {
          button.addClass("has-entry");
        }
        button.createDiv({ cls: "ng-journal-day-number", text: String(cell.day) });
        if (hasEntry) {
          button.createDiv({ cls: "ng-journal-day-dot" });
        }
        button.addEventListener("click", async (event) => {
          var _a, _b;
          this.selectedWeekKey = null;
          this.weeklyPreview = null;
          this.selectedDateKey = cell.dateKey;
          this.calendarMonth = startOfMonth((_a = parseDateKey(cell.dateKey)) != null ? _a : /* @__PURE__ */ new Date());
          this.selectedEntry = (_b = this.dailyEntries.find((entry) => entry.frontmatter.date === cell.dateKey)) != null ? _b : null;
          const isBackfillDate = isEditableBackfillDate(cell.dateKey);
          if ((hasEntry || isBackfillDate) && wasSelected) {
            const inNewSplit = event.metaKey || event.ctrlKey;
            const targetLeaf = inNewSplit ? this.app.workspace.getLeaf(true) : this.leaf;
            await this.openJournalEntryView(cell.dateKey, isBackfillDate, targetLeaf);
            return;
          }
          this.render();
        });
      }
    }
  }
  renderSelectionPreview(container) {
    if (this.weeklyPreview) {
      this.renderWeeklyPreview(container, this.weeklyPreview);
      return;
    }
    const entry = this.selectedEntry;
    const card = container.createDiv({ cls: "ng-journal-entry-card" });
    if (!entry) {
      card.createEl("h3", { text: "No Entry" });
      card.createDiv({ cls: "ng-empty", text: "Select a day with an entry to view its stats." });
      return;
    }
    card.createEl("h3", { text: `Journal Entry - ${formatReadableDate2(entry.frontmatter.date)}` });
    card.createEl("h4", { cls: "ng-journal-preview-summary", text: "Summary" });
    this.renderMetrics(card, entry.frontmatter);
    this.renderEmotionList(card, entry.frontmatter.emotions, true);
    this.renderTrackedTrackers(card, entry.frontmatter.date);
    this.renderTaskSnapshots(card, entry.frontmatter);
    this.renderBody(card, entry.body);
  }
  renderWeeklyPreview(container, weekly) {
    const card = container.createDiv({ cls: "ng-journal-entry-card" });
    card.createEl("h3", { text: `Weekly Recap - ${weekly.year}-W${String(weekly.week).padStart(2, "0")}` });
    card.createEl("h4", { cls: "ng-journal-preview-summary", text: "Summary" });
    if (!weekly.generated || !weekly.frontmatter) {
      card.createDiv({ cls: "ng-empty", text: "No generated recap yet. Click this week again to generate and open it." });
      return;
    }
    const frontmatter = weekly.frontmatter;
    card.createDiv({
      cls: "ng-journal-body-copy",
      text: `Processed dates: ${frontmatter.processedDateRange.start || "-"} to ${frontmatter.processedDateRange.end || "-"}`
    });
    const metrics = card.createDiv({ cls: "ng-journal-metrics" });
    const rows = [
      { label: "Mood", value: frontmatter.averages.mood, highIsBad: false },
      { label: "Sleep", value: frontmatter.averages.sleep, highIsBad: false },
      { label: "Regulation", value: frontmatter.averages.regulation, highIsBad: false },
      { label: "Stress", value: frontmatter.averages.stress, highIsBad: true },
      { label: "Anxiety", value: frontmatter.averages.anxiety, highIsBad: true },
      { label: "Exhaustion", value: frontmatter.averages.exhaustion, highIsBad: true },
      { label: "Sensory Load", value: frontmatter.averages.sensoryLoad, highIsBad: true },
      { label: "Social Load", value: frontmatter.averages.socialLoad, highIsBad: true }
    ];
    for (const row of rows) {
      const entry = metrics.createDiv({ cls: "ng-journal-metric" });
      const meta = entry.createDiv({ cls: "ng-journal-metric-meta" });
      meta.createDiv({ cls: "ng-journal-metric-label", text: row.label });
      const bar = entry.createDiv({ cls: "ng-journal-progress ng-journal-progress-readonly" });
      const fill = bar.createDiv({ cls: "ng-journal-progress-fill" });
      fill.style.width = `${Math.max(0, Math.min(100, row.value))}%`;
      fill.style.backgroundColor = weeklyMetricColor(row.value, row.highIsBad);
    }
    const emotions = card.createDiv({ cls: "ng-journal-emotion-list" });
    emotions.addClass("ng-weekly-preview-emotions");
    const sortedEmotions = [
      ...Object.entries(frontmatter.emotionCounts.unpleasant).map(([emotion, count]) => ({ emotion, count, tone: "unpleasant" })),
      ...Object.entries(frontmatter.emotionCounts.pleasant).map(([emotion, count]) => ({ emotion, count, tone: "pleasant" }))
    ].sort((a, b) => b.count - a.count).slice(0, 8);
    if (sortedEmotions.length === 0) {
      emotions.createDiv({ cls: "ng-empty", text: "No emotions recorded." });
    } else {
      for (const item of sortedEmotions) {
        const chip = emotions.createSpan({ cls: "ng-journal-emotion-chip", text: item.emotion });
        chip.addClass(item.tone);
      }
    }
    const trackerCloud = card.createDiv({ cls: "ng-weekly-tracker-cloud" });
    trackerCloud.addClass("ng-weekly-preview-tracker-cloud");
    const trackers = Object.entries(frontmatter.trackerCounts).sort((a, b) => b[1] - a[1]).filter(([, count]) => count > 0).slice(0, 6);
    for (const [name, count] of trackers) {
      const pill = trackerCloud.createDiv({ cls: "ng-weekly-tracker-pill", text: `${name} \xB7 ${count}` });
      pill.addClass("ng-weekly-preview-pill");
    }
    card.createDiv({ cls: "ng-journal-body-copy", text: `Support suggestions: ${frontmatter.supportNotes.length}` });
  }
  async selectWeekPreview(weekYear, weekNumber) {
    const key = `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
    this.selectedWeekKey = key;
    this.selectedDateKey = null;
    this.selectedEntry = null;
    const path = this.journalingStorage.weeklyRecapPath(weekYear, weekNumber);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian3.TFile)) {
      this.weeklyPreview = {
        key,
        year: weekYear,
        week: weekNumber,
        generated: false,
        frontmatter: null
      };
      this.render();
      return;
    }
    const recap = await this.journalingStorage.readWeeklyRecap(file);
    this.weeklyPreview = {
      key,
      year: weekYear,
      week: weekNumber,
      generated: recap.body.trim().length > 0,
      frontmatter: recap.frontmatter
    };
    this.render();
  }
  async loadGeneratedWeeklyRecapKeys() {
    const keys = /* @__PURE__ */ new Set();
    const files = this.app.vault.getFiles().filter((file) => file.path.startsWith("Journal/Weekly/") && file.extension === "md");
    for (const file of files) {
      const recap = await this.journalingStorage.readWeeklyRecap(file);
      if (recap.body.trim().length > 0) {
        keys.add(`${recap.frontmatter.year}-W${String(recap.frontmatter.week).padStart(2, "0")}`);
      }
    }
    return keys;
  }
  renderTrackedTrackers(container, dateKey) {
    const tracked = this.trackers.filter((tracker) => tracker.dates.includes(dateKey));
    if (tracked.length === 0) {
      return;
    }
    const block = container.createDiv({ cls: "ng-journal-tracker-block" });
    block.createEl("h4", { text: "Tracker" });
    const chips = block.createDiv({ cls: "ng-journal-tracker-chips" });
    for (const tracker of tracked) {
      const chip = chips.createDiv({ cls: "ng-journal-tracker-chip ng-journal-tracker-chip-preview" });
      chip.style.setProperty("--ng-tracker-color", normalizeHexColor(tracker.color));
      chip.createSpan({ text: tracker.name });
    }
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
    const header = tasks.createDiv({ cls: "ng-journal-tasks-header" });
    header.createEl("h4", { text: "Tasks" });
    this.renderTaskSnapshotGroup(tasks, "Completed Tasks", frontmatter.completedTasks);
    this.renderTaskSnapshotGroup(tasks, "Uncompleted Tasks", frontmatter.uncompletedTasks);
  }
  renderTaskSnapshotGroup(container, title, tasks) {
    if (tasks.length === 0) {
      return;
    }
    const group = container.createDiv({ cls: "ng-journal-task-group" });
    group.createEl("h5", { text: title });
    const list = group.createDiv({ cls: "ng-journal-task-list" });
    for (const task of tasks) {
      const row = list.createDiv({ cls: "ng-journal-task-row" });
      row.createDiv({ cls: "ng-journal-task-name", text: task.taskName });
      const badge = row.createSpan({ cls: "ng-journal-task-badge", text: effortLabel(task.effort) });
      badge.style.borderColor = effortColor(task.effort);
      badge.style.color = effortColor(task.effort);
    }
  }
  renderEntryMeta(container, frontmatter) {
    const meta = container.createDiv({ cls: "ng-journal-meta-grid" });
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
    section.createDiv({ cls: "ng-journal-body-copy ng-journal-body-preview", text: body.length > 0 ? body : "No entry text yet." });
  }
  renderTrackers(container) {
    const section = container.createDiv({ cls: "ng-journal-trackers" });
    const head = section.createDiv({ cls: "ng-journal-tracker-head" });
    head.createEl("h3", { text: "Tracker" });
    const addButton = head.createEl("button", { text: "Add Tracker", cls: "ng-journal-tracker-add-toggle" });
    addButton.setAttribute("aria-label", "Add Tracker");
    const addRow = section.createDiv({ cls: "ng-note-header-add-row ng-journal-tracker-add-row" });
    addRow.hide();
    const nameInput = addRow.createEl("input", { type: "text", placeholder: "Tracker name..." });
    nameInput.addClass("ng-task-input");
    const colorRow = addRow.createDiv({ cls: "ng-journal-tracker-color-row" });
    const submitTracker = async (color) => {
      const trackerName = nameInput.value.trim();
      if (!trackerName) {
        nameInput.focus();
        return;
      }
      await this.journalingStorage.upsertTracker(trackerName, color);
      nameInput.value = "";
      addRow.hide();
      await this.reloadState();
      this.render();
    };
    for (const color of TRACKER_COLORS) {
      const dot = colorRow.createDiv({ cls: "ng-journal-tracker-color-option" });
      dot.style.backgroundColor = color.value;
      dot.setAttribute("role", "button");
      dot.setAttribute("tabindex", "0");
      dot.setAttribute("aria-label", `Create tracker with ${color.name} color`);
      dot.title = color.name;
      dot.addEventListener("click", () => {
        void submitTracker(color.value);
      });
      dot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void submitTracker(color.value);
        }
      });
    }
    addButton.addEventListener("click", () => {
      if (addRow.isShown()) {
        addRow.hide();
        return;
      }
      addRow.show();
      nameInput.focus();
    });
    const list = section.createDiv({ cls: "ng-journal-tracker-list" });
    if (this.trackers.length === 0) {
      list.createDiv({ cls: "ng-empty", text: `No trackers yet. Add one above in ${TRACKER_FOLDER}.` });
      return;
    }
    const visibleDates = buildTrackerWindow(TRACKER_DAYS);
    const columns = `repeat(${visibleDates.length}, minmax(0, 1fr))`;
    const header = list.createDiv({ cls: "ng-journal-tracker-header ng-journal-tracker-row" });
    header.createDiv({ cls: "ng-journal-tracker-label ng-journal-tracker-label-empty" });
    const headerCells = header.createDiv({ cls: "ng-journal-tracker-cells" });
    headerCells.style.gridTemplateColumns = columns;
    for (const date of visibleDates) {
      const cell = headerCells.createDiv({ cls: "ng-journal-tracker-header-cell" });
      cell.createSpan({ cls: "ng-journal-tracker-day", text: String(date.day) });
      if (date.dateKey === todayKey()) {
        cell.addClass("is-today");
      }
    }
    for (const tracker of this.trackers) {
      const trackerColor = normalizeHexColor(tracker.color);
      const row = list.createDiv({ cls: "ng-journal-tracker-row" });
      row.style.setProperty("--ng-tracker-color", trackerColor);
      row.style.setProperty("--ng-tracker-streak-color", chooseReadableTextColor(trackerColor));
      const label = row.createDiv({ cls: "ng-journal-tracker-label" });
      label.title = tracker.file.path;
      const swatch = label.createSpan({ cls: "ng-journal-tracker-color-chip" });
      swatch.style.backgroundColor = trackerColor;
      swatch.setAttribute("role", "button");
      swatch.setAttribute("tabindex", "0");
      swatch.setAttribute("aria-label", `Change color of ${tracker.name}`);
      swatch.title = "Change bubble color";
      const hiddenColor = label.createEl("input", { type: "color" });
      hiddenColor.addClass("ng-journal-tracker-color-hidden");
      hiddenColor.value = trackerColor;
      hiddenColor.tabIndex = -1;
      hiddenColor.setAttribute("aria-hidden", "true");
      hiddenColor.addEventListener("change", async () => {
        await this.journalingStorage.upsertTracker(tracker.name, hiddenColor.value);
        await this.reloadState();
        this.render();
      });
      swatch.addEventListener("click", () => {
        hiddenColor.click();
      });
      label.createSpan({ cls: "ng-journal-tracker-title", text: tracker.name });
      const cells = row.createDiv({ cls: "ng-journal-tracker-cells" });
      cells.style.gridTemplateColumns = columns;
      for (let index = 0; index < visibleDates.length; index += 1) {
        const cellDate = visibleDates[index];
        const isTracked = tracker.dates.includes(cellDate.dateKey);
        const hasPrev = index > 0 && tracker.dates.includes(visibleDates[index - 1].dateKey);
        const hasNext = index < visibleDates.length - 1 && tracker.dates.includes(visibleDates[index + 1].dateKey);
        const cell = cells.createDiv({ cls: "ng-journal-tracker-cell" });
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("aria-pressed", String(isTracked));
        cell.setAttribute("aria-label", `${tracker.name}, ${cellDate.dateKey}${isTracked ? ", tracked" : ""}`);
        if (cellDate.dateKey === todayKey()) {
          cell.addClass("is-today");
        }
        if (isTracked) {
          cell.addClass("is-active");
          if (hasPrev) {
            cell.addClass("has-prev");
          }
          if (hasNext) {
            cell.addClass("has-next");
          }
        }
        cell.createSpan({ cls: "ng-journal-tracker-dot" });
        if (isTracked && !hasNext) {
          const streak = streakEndingAt(tracker.dates, cellDate.dateKey);
          if (streak > 1) {
            cell.createSpan({ cls: "ng-journal-tracker-streak", text: String(streak) });
          }
        }
        cell.addEventListener("click", async () => {
          const next = await this.journalingStorage.toggleTrackerDate(tracker, cellDate.dateKey);
          this.trackers = this.trackers.map((candidate) => candidate.file.path === next.file.path ? next : candidate);
          this.render();
        });
        cell.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            cell.click();
          }
        });
      }
    }
  }
  shiftCalendarMonth(amount) {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + amount, 1);
    this.render();
  }
};
function valueOrDash(value) {
  return value === null ? "-" : String(value);
}
function todayKey() {
  return formatDateKey(/* @__PURE__ */ new Date());
}
function yesterdayKey() {
  const previous = /* @__PURE__ */ new Date();
  previous.setDate(previous.getDate() - 1);
  return formatDateKey(previous);
}
function isEditableBackfillDate(dateKey) {
  return dateKey === todayKey() || dateKey === yesterdayKey();
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
function buildCalendarWeeks(month, entryDates) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const start = startOfWeek(monthStart);
  const weeks = [];
  for (let cursor = new Date(start); cursor <= monthEnd; cursor.setDate(cursor.getDate() + 7)) {
    const weekStart = new Date(cursor);
    const days = [];
    let entryCount = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + offset);
      const dateKey = formatDateKey(date);
      if (entryDates.has(dateKey)) {
        entryCount += 1;
      }
      days.push({
        dateKey,
        day: date.getDate(),
        outsideMonth: date.getMonth() !== month.getMonth()
      });
    }
    weeks.push({
      weekNumber: getIsoWeekNumber(weekStart),
      weekYear: getIsoWeekYear(weekStart),
      entryCount,
      days
    });
  }
  return weeks;
}
function startOfWeek(date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  return result;
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function getIsoWeekNumber(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
function getIsoWeekYear(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  return utcDate.getUTCFullYear();
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
function normalizeHexColor(color) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#EC9A63";
}
function chooseReadableTextColor(backgroundHex) {
  const rgb = parseHexColor(backgroundHex);
  if (!rgb) {
    return "#ffffff";
  }
  const whiteContrast = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const blackContrast = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
  return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}
function parseHexColor(hex) {
  const match = hex.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!match) {
    return null;
  }
  const value = match[1];
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}
function contrastRatio(left, right) {
  const l1 = relativeLuminance(left);
  const l2 = relativeLuminance(right);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function relativeLuminance(color) {
  const [r, g, b] = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
    if (clamped >= 75) return "#39E05A";
    if (clamped >= 51) return "#F4D35E";
    if (clamped >= 36) return "#F0A04C";
    return "#FF6565";
  }
  if (metric === "mood") {
    if (clamped >= 75) return "#39E05A";
    if (clamped >= 51) return "#F4D35E";
    if (clamped >= 36) return "#F0A04C";
    return "#FF6565";
  }
  if (metric === "sleep") {
    if (clamped >= 75) return "#39E05A";
    if (clamped >= 51) return "#F4D35E";
    if (clamped >= 36) return "#F0A04C";
    return "#FF6565";
  }
  if (metric === "stress" || metric === "anxiety") {
    if (clamped >= 75) return "#FF6565";
    if (clamped >= 41) return "#F0A04C";
    if (clamped >= 26) return "#F4D35E";
    return "#39E05A";
  }
  if (metric === "exhaustion" || metric === "sensoryLoad" || metric === "socialLoad") {
    if (clamped >= 75) return "#FF6565";
    if (clamped >= 46) return "#F0A04C";
    if (clamped >= 31) return "#F4D35E";
    return "#39E05A";
  }
  return "#39E05A";
}
function weeklyMetricColor(value, highIsBad) {
  const v = Math.max(0, Math.min(100, value));
  if (highIsBad) {
    if (v >= 80) return "#FF6565";
    if (v >= 60) return "#F0A04C";
    if (v >= 40) return "#F4D35E";
    return "#39E05A";
  }
  if (v >= 80) return "#39E05A";
  if (v >= 60) return "#A8D56E";
  if (v >= 40) return "#F4D35E";
  return "#FF6565";
}
function getEmotionToneClass2(emotion) {
  return PLEASANT_EMOTIONS2.includes(emotion) ? "pleasant" : "unpleasant";
}

// src/myLearningView.ts
var import_obsidian4 = require("obsidian");

// src/nameValidation.ts
var RESTRICTED_NAME_PATTERN = /[\\/:*?"<>|#^[\]]/;
function getNameValidationError(value) {
  const match = value.match(RESTRICTED_NAME_PATTERN);
  return match ? `"${match[0]}" isn't allowed in names. Try "-" or "_" instead.` : null;
}

// src/myLearningView.ts
var OPEN_RIGHT_ICON_CANDIDATES = ["separator-vertical", "panel-right-open", "split-square-vertical"];
var EDIT_ICON_CANDIDATES = ["pencil", "pencil-line", "edit-3"];
var DAILY_NOTE_DATE_PATTERN = /^Daily Note (\d{4}-\d{2}-\d{2})$/;
var DAILY_CALENDAR_DAYS = 30;
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function setOpenToRightIcon(el) {
  for (const iconName of OPEN_RIGHT_ICON_CANDIDATES) {
    (0, import_obsidian4.setIcon)(el, iconName);
    if (el.querySelector("svg")) {
      return;
    }
  }
  el.setText(">");
}
function setEditIcon(el) {
  for (const iconName of EDIT_ICON_CANDIDATES) {
    (0, import_obsidian4.setIcon)(el, iconName);
    if (el.querySelector("svg")) {
      return;
    }
  }
  el.setText("E");
}
var NeuralGardenMyLearningView = class extends import_obsidian4.ItemView {
  constructor(leaf, learningStorage, openHomeView, initialSelection, onSelectionChange) {
    var _a, _b;
    super(leaf);
    this.learningStorage = learningStorage;
    this.openHomeView = openHomeView;
    this.onSelectionChange = onSelectionChange;
    this.selectedCategory = null;
    this.selectedTopic = null;
    this.editMode = null;
    this.uncategorizedExpanded = false;
    this.searchQuery = "";
    this.searchDebounceTimer = null;
    this.dailyProgressOverrides = /* @__PURE__ */ new Map();
    this.selectedCategory = (_a = initialSelection == null ? void 0 : initialSelection.category) != null ? _a : null;
    this.selectedTopic = (_b = initialSelection == null ? void 0 : initialSelection.topic) != null ? _b : null;
  }
  getViewType() {
    return VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING;
  }
  getDisplayText() {
    return "MyLearning";
  }
  getIcon() {
    return "brain";
  }
  async onOpen() {
    await this.learningStorage.ensureProvisioned();
    await this.render();
  }
  async onClose() {
    if (this.searchDebounceTimer) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }
  async setSelection(category, topic) {
    this.selectedCategory = category;
    this.selectedTopic = topic != null ? topic : null;
    this.notifySelectionChange();
    await this.render();
  }
  async refresh() {
    await this.render();
  }
  notifySelectionChange() {
    var _a;
    (_a = this.onSelectionChange) == null ? void 0 : _a.call(this, this.selectedCategory, this.selectedTopic);
  }
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrapper = contentEl.createDiv({ cls: "ng-mylearning" });
    const topBar = wrapper.createDiv({ cls: "ng-mylearning-topbar" });
    const homeButton = topBar.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });
    const headingRow = wrapper.createDiv({ cls: "ng-mylearning-heading-row" });
    headingRow.createEl("h2", { text: "MyLearning", cls: "ng-mynotes-heading" });
    await this.renderSearchSection(wrapper);
    this.renderDailyNotesCalendar(wrapper);
    await this.renderCategoriesSection(wrapper);
    await this.renderTopicsSection(wrapper);
    await this.renderNotesGrid(wrapper);
    this.renderUncategorizedSection(wrapper);
  }
  renderDailyNotesCalendar(parent) {
    const section = parent.createDiv({ cls: "ng-mylearning-daily-calendar" });
    const leftArrow = section.createEl("button", { cls: "ng-mylearning-daily-arrow is-left" });
    leftArrow.setAttribute("aria-label", "Scroll to earlier days");
    (0, import_obsidian4.setIcon)(leftArrow, "chevron-left");
    const viewport = section.createDiv({ cls: "ng-mylearning-daily-viewport" });
    const row = viewport.createDiv({ cls: "ng-mylearning-daily-row" });
    const rightArrow = section.createEl("button", { cls: "ng-mylearning-daily-arrow is-right" });
    rightArrow.setAttribute("aria-label", "Scroll to later days");
    (0, import_obsidian4.setIcon)(rightArrow, "chevron-right");
    const notesByDate = /* @__PURE__ */ new Map();
    for (const file of this.learningStorage.listNotes()) {
      const match = file.basename.match(DAILY_NOTE_DATE_PATTERN);
      if (match == null ? void 0 : match[1]) {
        notesByDate.set(match[1], file);
      }
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(12, 0, 0, 0);
    const todayKey2 = formatLocalDate(today);
    for (let offset = DAILY_CALENDAR_DAYS - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dateKey = formatLocalDate(date);
      const file = notesByDate.get(dateKey);
      const processed = !!file && this.getDisplayedComprehension(file) >= 90;
      const day = row.createEl("button", { cls: "ng-mylearning-daily-day" });
      day.toggleClass("is-today", dateKey === todayKey2);
      day.toggleClass("has-note", !!file);
      day.toggleClass("is-processed", processed);
      day.setAttribute("aria-label", file ? `${file.basename}, ${processed ? "done" : "in progress"}` : `${dateKey}, no daily note`);
      day.createSpan({
        cls: "ng-mylearning-daily-weekday",
        text: date.toLocaleDateString(void 0, { weekday: "short" })
      });
      const numberWrap = day.createSpan({ cls: "ng-mylearning-daily-number-wrap" });
      numberWrap.createSpan({ cls: "ng-mylearning-daily-number", text: String(date.getDate()) });
      if (processed) {
        const check = numberWrap.createSpan({ cls: "ng-mylearning-daily-check" });
        (0, import_obsidian4.setIcon)(check, "check");
      } else if (file) {
        day.createSpan({ cls: "ng-mylearning-daily-marker" });
      }
      day.addEventListener("click", () => {
        if (file) {
          this.openDailyNoteActions(file);
        } else if (dateKey === todayKey2) {
          void this.createTodayDailyNote(dateKey);
        }
      });
    }
    const updateArrows = () => {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      leftArrow.disabled = viewport.scrollLeft <= 1;
      rightArrow.disabled = viewport.scrollLeft >= maxScroll - 1;
    };
    const scrollCalendar = (direction) => {
      viewport.scrollBy({ left: direction * viewport.clientWidth * 0.75, behavior: "smooth" });
    };
    leftArrow.addEventListener("click", () => scrollCalendar(-1));
    rightArrow.addEventListener("click", () => scrollCalendar(1));
    viewport.addEventListener("scroll", updateArrows);
    window.requestAnimationFrame(() => {
      viewport.scrollLeft = viewport.scrollWidth;
      updateArrows();
    });
    let startX = 0;
    let startScrollLeft = 0;
    let dragging = false;
    let pointerCaptured = false;
    let suppressClick = false;
    viewport.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      startScrollLeft = viewport.scrollLeft;
      dragging = true;
      pointerCaptured = false;
      suppressClick = false;
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) {
        suppressClick = true;
        viewport.addClass("is-dragging");
        if (!pointerCaptured) {
          viewport.setPointerCapture(event.pointerId);
          pointerCaptured = true;
        }
      }
      viewport.scrollLeft = startScrollLeft - distance;
    });
    const stopDragging = (event) => {
      dragging = false;
      viewport.removeClass("is-dragging");
      if (pointerCaptured && viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };
    viewport.addEventListener("pointerup", stopDragging);
    viewport.addEventListener("pointercancel", stopDragging);
    viewport.addEventListener("click", (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }
  async createTodayDailyNote(dateKey) {
    const file = await this.learningStorage.createDailyNote(dateKey);
    if (!file) {
      new import_obsidian4.Notice("Could not create today's daily note.");
      return;
    }
    await this.leaf.openFile(file);
  }
  getDisplayedComprehension(file) {
    const cached = this.learningStorage.getEntryComprehension(file);
    const override = this.dailyProgressOverrides.get(file.path);
    if (override === void 0) {
      return cached;
    }
    if (cached === override) {
      this.dailyProgressOverrides.delete(file.path);
      return cached;
    }
    return override;
  }
  openDailyNoteActions(file) {
    const { card, close } = openOverlay(file.basename);
    card.createDiv({ cls: "ng-overlay-text", text: "Open this daily note or mark it as processed." });
    const doneLabel = card.createEl("label", { cls: "ng-mylearning-daily-done" });
    const doneCheckbox = doneLabel.createEl("input", { type: "checkbox" });
    doneCheckbox.checked = this.getDisplayedComprehension(file) >= 90;
    doneLabel.createSpan({ text: "Finished" });
    doneCheckbox.addEventListener("change", async () => {
      const nextProgress = doneCheckbox.checked ? 100 : 0;
      this.dailyProgressOverrides.set(file.path, nextProgress);
      await this.learningStorage.setComprehension(file, nextProgress);
      close();
      await this.render();
    });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const openButton = actions.createEl("button", { text: "Open note", cls: "ng-overlay-confirm" });
    openButton.addEventListener("click", async () => {
      close();
      await this.leaf.openFile(file);
    });
  }
  async renderSearchSection(parent) {
    const section = parent.createDiv({ cls: "ng-search ng-mylearning-search" });
    const input = section.createEl("input", {
      type: "text",
      placeholder: "Search Learning..."
    });
    input.addClass("ng-task-input");
    input.value = this.searchQuery;
    const results = section.createDiv({ cls: "ng-search-results ng-mynotes-list" });
    await this.updateSearchResults(this.searchQuery, results);
    input.addEventListener("input", () => {
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = window.setTimeout(() => {
        this.searchQuery = input.value.trim();
        void this.updateSearchResults(this.searchQuery, results);
      }, 250);
    });
  }
  async updateSearchResults(query, container) {
    var _a, _b;
    container.empty();
    if (query.length < 2) {
      return;
    }
    const q = query.toLowerCase();
    const files = this.learningStorage.listEntries();
    const matches = [];
    for (const file of files) {
      const basenameMatch = file.basename.toLowerCase().includes(q);
      const category = (_b = (_a = this.learningStorage.getEntryCategory(file)) == null ? void 0 : _a.toLowerCase()) != null ? _b : "";
      const topics = this.learningStorage.getEntryTopics(file).map((entry) => entry.toLowerCase());
      const metadataMatch = category.includes(q) || topics.some((entry) => entry.includes(q));
      let contentMatch = false;
      if (file.extension === "md" && !basenameMatch && !metadataMatch) {
        const content = await this.app.vault.cachedRead(file);
        contentMatch = content.toLowerCase().includes(q);
      }
      if (basenameMatch || metadataMatch || contentMatch) {
        matches.push(file);
      }
    }
    if (matches.length === 0) {
      container.createDiv({ cls: "ng-empty", text: "No matching learning notes." });
      return;
    }
    for (const file of matches.slice(0, 20)) {
      this.renderNoteRow(container, file, this.selectedTopic);
    }
  }
  async renderCategoriesSection(parent) {
    const section = parent.createDiv({ cls: "ng-mylearning-topics" });
    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleGroup = header.createDiv({ cls: "ng-mylearning-heading-group" });
    titleGroup.createEl("div", { text: "Categories", cls: "ng-mylearning-label" });
    const actionsRow = titleGroup.createDiv({ cls: "ng-mylearning-header-actions" });
    const createButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createButton.setText("+");
    createButton.addEventListener("click", () => {
      this.openCreateCategoryOverlay();
    });
    const editButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-edit" });
    editButton.setAttribute("aria-label", "Edit Category");
    editButton.setAttribute("title", "Edit Category");
    setEditIcon(editButton);
    editButton.toggleClass("is-active", this.editMode === "category");
    editButton.addEventListener("click", () => {
      this.editMode = this.editMode === "category" ? null : "category";
      void this.render();
    });
    const addNoteButton = header.createEl("button", { cls: "ng-mynotes-new-button ng-mylearning-heading-add-note" });
    const addNoteIcon = addNoteButton.createSpan({ cls: "ng-mynotes-button-icon" });
    (0, import_obsidian4.setIcon)(addNoteIcon, "file-plus");
    addNoteButton.createSpan({ text: "Add Note" });
    addNoteButton.addEventListener("click", () => {
      this.openNewNoteOverlay(this.selectedCategory, this.selectedTopic);
    });
    const row = section.createDiv({ cls: "ng-mynotes-pill-row" });
    const categories = await this.learningStorage.listCategories();
    for (const category of categories) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-topic-pill" });
      pill.createSpan({ text: category });
      this.renderProgressSummary(pill, this.learningStorage.entriesInCategory(category));
      pill.toggleClass("is-active", this.selectedCategory === category);
      pill.toggleClass("is-edit-target", this.editMode === "category");
      pill.addEventListener("click", () => {
        if (this.editMode === "category") {
          this.openCategoryEditActions(category);
          return;
        }
        this.selectedCategory = this.selectedCategory === category ? null : category;
        this.selectedTopic = null;
        this.notifySelectionChange();
        void this.render();
      });
    }
    if (categories.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No categories yet. Click the plus button to add one." });
    }
    section.createDiv({ cls: "ng-mylearning-divider" });
  }
  async renderTopicsSection(parent) {
    if (!this.selectedCategory) {
      return;
    }
    const section = parent.createDiv({ cls: "ng-mylearning-categories" });
    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleGroup = header.createDiv({ cls: "ng-mylearning-heading-group" });
    titleGroup.createEl("div", { text: "Topics", cls: "ng-mylearning-label" });
    const actionsRow = titleGroup.createDiv({ cls: "ng-mylearning-header-actions" });
    const createButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createButton.setText("+");
    createButton.addEventListener("click", () => {
      if (!this.selectedCategory) {
        return;
      }
      this.openCreateTopicOverlay(this.selectedCategory);
    });
    const editButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-edit" });
    editButton.setAttribute("aria-label", "Edit Topic");
    editButton.setAttribute("title", "Edit Topic");
    setEditIcon(editButton);
    editButton.toggleClass("is-active", this.editMode === "topic");
    editButton.addEventListener("click", () => {
      this.editMode = this.editMode === "topic" ? null : "topic";
      void this.render();
    });
    const row = section.createDiv({ cls: "ng-mynotes-pill-row" });
    const topics = await this.learningStorage.listTopicsForCategory(this.selectedCategory);
    for (const topic of topics) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-category-pill" });
      pill.style.setProperty("--ng-mylearning-category-color", this.learningStorage.getTopicColor(this.selectedCategory, topic));
      pill.createSpan({ text: topic });
      this.renderProgressSummary(pill, this.learningStorage.entriesInCategoryTopic(this.selectedCategory, topic));
      pill.toggleClass("is-active", this.selectedTopic === topic);
      pill.toggleClass("is-edit-target", this.editMode === "topic");
      pill.addEventListener("click", () => {
        if (this.editMode === "topic") {
          if (this.selectedCategory) {
            this.openTopicEditActions(this.selectedCategory, topic);
          }
          return;
        }
        this.selectedTopic = this.selectedTopic === topic ? null : topic;
        this.notifySelectionChange();
        void this.render();
      });
    }
    section.createDiv({ cls: "ng-mylearning-divider" });
  }
  async renderNotesGrid(parent) {
    if (!this.selectedTopic) {
      return;
    }
    const section = parent.createDiv({ cls: "ng-mylearning-notes" });
    section.createDiv({ cls: "ng-mylearning-notes-title", text: "Notes & Canvases" });
    if (!this.selectedCategory) {
      section.createDiv({ cls: "ng-empty", text: "Select a category to view notes." });
      return;
    }
    const files = this.collectCategoryNotes(this.selectedCategory, this.selectedTopic);
    if (files.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No notes found." });
      return;
    }
    const grid = section.createDiv({ cls: "ng-mylearning-entry-list" });
    for (const file of files) {
      this.renderNoteRow(grid, file, this.selectedTopic);
    }
  }
  renderUncategorizedSection(parent) {
    const section = parent.createDiv({ cls: "ng-mylearning-uncategorized" });
    const toggle = section.createEl("button", {
      cls: "ng-mynotes-subheading ng-mynotes-subheading-toggle"
    });
    toggle.createSpan({
      cls: "ng-mynotes-caret",
      text: this.uncategorizedExpanded ? "\u25BC" : "\u25B6"
    });
    toggle.createSpan({ cls: "ng-mynotes-subheading-label", text: "Uncategorized Notes" });
    toggle.addEventListener("click", () => {
      this.uncategorizedExpanded = !this.uncategorizedExpanded;
      void this.render();
    });
    if (!this.uncategorizedExpanded) {
      return;
    }
    const uncategorized = this.learningStorage.listEntries().filter((file) => this.isUncategorized(file));
    if (uncategorized.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No uncategorized notes." });
      return;
    }
    for (const file of uncategorized) {
      this.renderNoteRow(section, file, null);
    }
  }
  collectCategoryNotes(category, topic) {
    if (!topic) {
      return this.learningStorage.entriesInCategory(category);
    }
    return this.learningStorage.entriesInCategoryTopic(category, topic);
  }
  renderNoteRow(container, file, activeTopic) {
    var _a;
    const row = container.createDiv({ cls: "ng-mynotes-note-row" });
    const comprehension = this.getDisplayedComprehension(file);
    row.toggleClass("is-low-comprehension", comprehension < 20);
    const indicator = row.createDiv({ cls: "ng-mynotes-note-indicator" });
    const topic = this.resolveIndicatorTopic(file, activeTopic);
    const category = (_a = this.learningStorage.getEntryCategory(file)) != null ? _a : "";
    indicator.style.background = this.learningStorage.getTopicColor(category, topic != null ? topic : file.basename);
    row.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });
    if (file.extension === "canvas") {
      row.createSpan({ cls: "ng-mylearning-entry-type", text: "Canvas" });
    }
    const actions = row.createDiv({ cls: "ng-mylearning-row-actions" });
    const progressTone = comprehension > 70 ? "is-green" : comprehension > 50 ? "is-yellow" : "is-orange";
    const progressTrack = actions.createDiv({ cls: `ng-mylearning-entry-progress ${progressTone}` });
    const progressFill = progressTrack.createDiv({
      cls: `ng-mylearning-entry-progress-fill ${progressTone}`
    });
    progressFill.style.width = `${comprehension}%`;
    const openRightButton = actions.createEl("button", { cls: "ng-mynotes-note-open-right" });
    openRightButton.setAttribute("aria-label", "Open to the right");
    setOpenToRightIcon(openRightButton);
    openRightButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const rightLeaf = this.app.workspace.getLeaf("split", "vertical");
      await rightLeaf.openFile(file);
    });
    const deleteButton = actions.createEl("button", { cls: "ng-mynotes-note-delete" });
    deleteButton.setAttribute("aria-label", `Delete ${file.basename}`);
    (0, import_obsidian4.setIcon)(deleteButton, "x");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.openDeleteOverlay(file);
    });
    row.addEventListener("click", async () => {
      await this.leaf.openFile(file);
    });
  }
  resolveIndicatorTopic(file, activeTopic) {
    var _a;
    if (activeTopic) {
      return activeTopic;
    }
    const topics = this.learningStorage.getEntryTopics(file);
    if (topics.length > 0) {
      return (_a = topics[0]) != null ? _a : null;
    }
    return this.learningStorage.getEntryCategory(file);
  }
  isUncategorized(file) {
    const category = this.learningStorage.getEntryCategory(file);
    const topics = this.learningStorage.getEntryTopics(file);
    return !category || topics.length === 0;
  }
  renderProgressSummary(container, files) {
    const total = files.length;
    const learned = files.filter((file) => this.getDisplayedComprehension(file) > 60).length;
    const average2 = total === 0 ? 0 : Math.round(files.reduce((sum, file) => sum + this.getDisplayedComprehension(file), 0) / total);
    const ratio = total === 0 ? 0 : learned / total * 100;
    const summary = container.createSpan({ cls: "ng-mylearning-progress-summary" });
    summary.createSpan({
      cls: `ng-mylearning-progress-count ${ratio > 70 ? "is-green" : ratio > 50 ? "is-yellow" : "is-orange"}`,
      text: `${learned}|${total}`
    });
    const track = summary.createSpan({ cls: "ng-mylearning-average-track" });
    const fill = track.createSpan({ cls: "ng-mylearning-average-fill" });
    fill.style.width = `${average2}%`;
  }
  openNewNoteOverlay(category, topic) {
    const { card, close } = openOverlay("Create A Note");
    card.createDiv({ cls: "ng-overlay-subtitle", text: "Write down a name" });
    if (category || topic) {
      const parts = [];
      if (category) {
        parts.push(`Category: ${category}`);
      }
      if (topic) {
        parts.push(`Topic: ${topic}`);
      }
      card.createDiv({ cls: "ng-overlay-text", text: parts.join(" | ") });
    }
    const input = card.createEl("input", { type: "text", placeholder: "Note name..." });
    input.addClass("ng-task-input");
    const typeControl = card.createDiv({ cls: "ng-mylearning-type-control" });
    const markdownButton = typeControl.createEl("button", { text: "Markdown", cls: "is-active" });
    const canvasButton = typeControl.createEl("button", { text: "Canvas" });
    let fileType = "markdown";
    const setFileType = (next) => {
      fileType = next;
      markdownButton.toggleClass("is-active", next === "markdown");
      canvasButton.toggleClass("is-active", next === "canvas");
    };
    markdownButton.addEventListener("click", () => setFileType("markdown"));
    canvasButton.addEventListener("click", () => setFileType("canvas"));
    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });
    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        errorEl.setText(validationError);
        errorEl.show();
        return;
      }
      if (this.learningStorage.noteExists(name)) {
        errorEl.setText("A note or canvas with this name already exists.");
        errorEl.show();
        input.focus();
        return;
      }
      const topics = topic ? [topic] : [];
      if (fileType === "canvas" && (!category || !topic)) {
        errorEl.setText("Select a category and topic before creating a canvas.");
        errorEl.show();
        return;
      }
      const file = fileType === "canvas" ? await this.learningStorage.createCanvas(name, category, topic) : await this.learningStorage.createNote(name, category != null ? category : null, topics);
      close();
      if (!file) {
        new import_obsidian4.Notice("Could not create the note. Try a different name.");
        return;
      }
      await this.leaf.openFile(file);
    };
    createButton.addEventListener("click", () => void submit());
    input.addEventListener("input", () => {
      const validationError = getNameValidationError(input.value);
      errorEl.toggle(validationError !== null);
      errorEl.setText(validationError != null ? validationError : "");
      createButton.disabled = validationError !== null;
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openCreateCategoryOverlay() {
    const { card, close } = openOverlay("Create Category");
    const input = card.createEl("input", { type: "text", placeholder: "Category name..." });
    input.addClass("ng-task-input");
    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });
    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        errorEl.setText(validationError);
        errorEl.show();
        return;
      }
      await this.learningStorage.addCategory(name);
      close();
      this.selectedCategory = name.trim();
      this.selectedTopic = null;
      this.notifySelectionChange();
      await this.render();
    };
    createButton.addEventListener("click", () => void submit());
    input.addEventListener("input", () => {
      const validationError = getNameValidationError(input.value);
      errorEl.toggle(validationError !== null);
      errorEl.setText(validationError != null ? validationError : "");
      createButton.disabled = validationError !== null;
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openCreateTopicOverlay(category) {
    const { card, close } = openOverlay("Create Topic");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `Category: ${category}` });
    const colorRow = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    const pickedColor = "#ec9a63";
    const nameInput = colorRow.createEl("input", { type: "text", placeholder: "Topic name..." });
    nameInput.addClass("ng-task-input");
    const colorWrap = colorRow.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = colorWrap.createEl("input", { type: "color", value: pickedColor });
    colorInput.addClass("ng-mylearning-color-input");
    const colorSwatch = colorWrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    colorSwatch.style.setProperty("--ng-mylearning-picked-color", pickedColor);
    colorSwatch.setAttribute("role", "button");
    colorSwatch.setAttribute("tabindex", "0");
    colorSwatch.setAttribute("aria-label", "Choose topic color");
    colorSwatch.addEventListener("click", () => {
      colorInput.click();
    });
    colorInput.addEventListener("input", () => {
      colorSwatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    });
    colorSwatch.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        colorInput.click();
      }
    });
    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });
    const submit = async () => {
      const name = nameInput.value.trim();
      if (!name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        errorEl.setText(validationError);
        errorEl.show();
        return;
      }
      await this.learningStorage.addTopic(category, name, colorInput.value);
      close();
      this.selectedTopic = name.trim();
      this.notifySelectionChange();
      await this.render();
    };
    createButton.addEventListener("click", () => void submit());
    nameInput.addEventListener("input", () => {
      const validationError = getNameValidationError(nameInput.value);
      errorEl.toggle(validationError !== null);
      errorEl.setText(validationError != null ? validationError : "");
      createButton.disabled = validationError !== null;
    });
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    nameInput.focus();
  }
  openDeleteOverlay(file) {
    const { card, close } = openOverlay("Delete Note");
    card.createDiv({
      cls: "ng-overlay-text",
      text: `Are you sure you want to delete "${file.basename}"?`
    });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    cancelButton.addEventListener("click", () => close());
    deleteButton.addEventListener("click", async () => {
      await this.learningStorage.deleteNote(file);
      close();
      await this.render();
    });
  }
  openCategoryEditActions(category) {
    const { card, close } = openOverlay(`Edit Category`);
    card.createDiv({ cls: "ng-overlay-subtitle", text: category });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    renameButton.addEventListener("click", () => {
      close();
      this.openRenameCategoryOverlay(category);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteCategoryOverlay(category);
    });
    cancelButton.addEventListener("click", () => close());
  }
  openTopicEditActions(category, topic) {
    const { card, close } = openOverlay(`Edit Topic`);
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${category} | ${topic}` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const colorButton = actions.createEl("button", { text: "Color", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    renameButton.addEventListener("click", () => {
      close();
      this.openRenameTopicOverlay(category, topic);
    });
    colorButton.addEventListener("click", () => {
      close();
      this.openRecolorTopicOverlay(category, topic);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteTopicOverlay(category, topic);
    });
    cancelButton.addEventListener("click", () => close());
  }
  openRecolorTopicOverlay(category, topic) {
    const { card, close } = openOverlay("Topic Color");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${category} | ${topic}` });
    const row = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    row.addClass("is-centered");
    const wrap = row.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = wrap.createEl("input", { type: "color", value: this.learningStorage.getTopicColor(category, topic) });
    colorInput.addClass("ng-mylearning-color-input");
    const swatch = wrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    swatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    swatch.setAttribute("role", "button");
    swatch.setAttribute("tabindex", "0");
    swatch.setAttribute("aria-label", "Choose topic color");
    swatch.addEventListener("click", () => colorInput.click());
    swatch.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        colorInput.click();
      }
    });
    colorInput.addEventListener("input", () => {
      swatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const saveButton = actions.createEl("button", { text: "Save", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const success = await this.learningStorage.setTopicColor(category, topic, colorInput.value);
      if (!success) {
        new import_obsidian4.Notice("Could not update topic color.");
        return;
      }
      close();
      await this.render();
    };
    saveButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
  }
  openRenameCategoryOverlay(previousCategory) {
    const { card, close } = openOverlay("Rename Category");
    const input = card.createEl("input", { type: "text", value: previousCategory, placeholder: "New category name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const nextCategory = input.value.trim();
      const success = await this.learningStorage.renameCategory(previousCategory, nextCategory);
      if (!success) {
        new import_obsidian4.Notice("Could not rename category. Check the new name and try again.");
        return;
      }
      if (this.selectedCategory === previousCategory) {
        this.selectedCategory = nextCategory;
        this.selectedTopic = null;
        this.notifySelectionChange();
      }
      this.editMode = null;
      close();
      await this.render();
    };
    renameButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openDeleteCategoryOverlay(category) {
    const { card, close } = openOverlay("Delete Category");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete category "${category}" and remove it from all notes?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const success = await this.learningStorage.deleteCategory(category);
      if (!success) {
        new import_obsidian4.Notice("Could not delete category.");
        return;
      }
      if (this.selectedCategory === category) {
        this.selectedCategory = null;
        this.selectedTopic = null;
        this.notifySelectionChange();
      }
      this.editMode = null;
      close();
      await this.render();
    };
    deleteButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
  }
  openRenameTopicOverlay(category, previousTopic) {
    const { card, close } = openOverlay("Rename Topic");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: category });
    const input = card.createEl("input", { type: "text", value: previousTopic, placeholder: "New topic name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const nextTopic = input.value.trim();
      const success = await this.learningStorage.renameTopic(category, previousTopic, nextTopic);
      if (!success) {
        new import_obsidian4.Notice("Could not rename topic. Check the new name and try again.");
        return;
      }
      if (this.selectedTopic === previousTopic) {
        this.selectedTopic = nextTopic;
        this.notifySelectionChange();
      }
      this.editMode = null;
      close();
      await this.render();
    };
    renameButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openDeleteTopicOverlay(category, topic) {
    const { card, close } = openOverlay("Delete Topic");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete topic "${topic}" and remove it from all notes in ${category}?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const success = await this.learningStorage.deleteTopic(category, topic);
      if (!success) {
        new import_obsidian4.Notice("Could not delete topic.");
        return;
      }
      if (this.selectedTopic === topic) {
        this.selectedTopic = null;
        this.notifySelectionChange();
      }
      this.editMode = null;
      close();
      await this.render();
    };
    deleteButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
  }
};

// src/myLearningStorage.ts
var import_obsidian5 = require("obsidian");
var LEGACY_NOTES_CATEGORIES_FOLDER = "Notes/Categories";
var LEGACY_HELP_TOPIC = "help";
var DAILY_NOTES_CATEGORY = "Daily Notes";
var DAILY_NOTES_TOPIC = "Daily";
function isValidHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}
function normalizeTopicList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const out = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed = normalizeTopicEntry(entry);
    if (!trimmed) {
      continue;
    }
    if (!out.includes(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}
function normalizeTopicEntry(value) {
  var _a, _b;
  const trimmed = value.trim();
  const linked = trimmed.match(/^\[\[([^\]]+)\]\]$/);
  if (!linked) {
    return trimmed;
  }
  const inner = (_b = (_a = linked[1]) == null ? void 0 : _a.trim()) != null ? _b : "";
  if (!inner) {
    return "";
  }
  const pipeIndex = inner.indexOf("|");
  return pipeIndex >= 0 ? inner.slice(0, pipeIndex).trim() : inner;
}
function asTopicLinks(topics) {
  return topics.map((topic) => `[[${topic}]]`);
}
var MyLearningStorage = class {
  constructor(app) {
    this.app = app;
  }
  async ensureProvisioned() {
    const configFile = await this.ensureConfigFile();
    await this.ensureFolderExists(LEARNING_FOLDER);
    await this.ensureFolderExists(NOTES_CATEGORIES_FOLDER);
    await this.migrateConfigSchema(configFile);
    for (const file of this.listNotes()) {
      await this.migrateNoteSchema(file);
    }
    await this.migrateCategoryLinkingNotes();
    await this.ensureCanvasTopicLinks();
  }
  async ensureConfigFile() {
    const existing = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (existing instanceof import_obsidian5.TFile) {
      return existing;
    }
    await this.ensureFolderExists(MY_LEARNING_MAINTENANCE_FOLDER);
    try {
      return await this.app.vault.create(MY_LEARNING_CONFIG_FILE_PATH, "---\ncategories: {}\ntopicColors: {}\ncanvases: {}\n---\n# MyLearning\n");
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
      if (createdByOtherCall instanceof import_obsidian5.TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create MyLearning config at ${MY_LEARNING_CONFIG_FILE_PATH}`);
    }
  }
  async loadCategoryMap() {
    const file = await this.ensureConfigFile();
    const raw = await this.readCategoriesFromFile(file);
    const categoryMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return categoryMap;
    }
    for (const [category, topics] of Object.entries(raw)) {
      const trimmedCategory = category.trim();
      if (!trimmedCategory) {
        continue;
      }
      const normalized = normalizeTopicList(topics);
      categoryMap[trimmedCategory] = normalized;
    }
    return categoryMap;
  }
  async listCategories() {
    return Object.keys(await this.loadCategoryMap()).sort((a, b) => a.localeCompare(b));
  }
  async addCategory(name) {
    const category = this.sanitizeName(name);
    if (!category) {
      return;
    }
    const file = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      if (!(category in categories)) {
        categories[category] = [];
      }
      fm.categories = categories;
    });
    await this.ensureCategoryLinkingNote(category);
  }
  async addTopic(categoryName, topicName, color) {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!category || !topic) {
      return;
    }
    const normalizedColor = this.sanitizeColor(color);
    const file = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      var _a, _b;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = (_a = categories[category]) != null ? _a : [];
      if (!topics.includes(topic)) {
        categories[category] = [...topics, topic];
      }
      fm.categories = categories;
      if (normalizedColor) {
        const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
        const categoryTopicColors = (_b = topicColors[category]) != null ? _b : {};
        categoryTopicColors[topic] = normalizedColor;
        topicColors[category] = categoryTopicColors;
        fm.topicColors = topicColors;
      }
    });
    await this.ensureCategoryLinkingNote(category, topic);
  }
  async renameCategory(previousName, nextName) {
    const previous = this.sanitizeName(previousName);
    const next = this.sanitizeName(nextName);
    if (!previous || !next || previous === next) {
      return false;
    }
    let renamed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      var _a, _b;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      if (!(previous in categories) || next in categories) {
        return;
      }
      categories[next] = (_a = categories[previous]) != null ? _a : [];
      delete categories[previous];
      fm.categories = categories;
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      if (previous in topicColors) {
        topicColors[next] = (_b = topicColors[previous]) != null ? _b : {};
        delete topicColors[previous];
      }
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === previous) {
          metadata.category = next;
        }
      }
      fm.canvases = canvases;
      renamed = true;
    });
    if (!renamed) {
      return false;
    }
    await this.renameCategoryLinkingNote(previous, next);
    const notes = this.notesInCategory(previous);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        if (this.normalizeCategoryScalar(fm.category) === previous) {
          fm.category = this.toFrontmatterScalar(next);
        }
      });
    }
    return true;
  }
  async deleteCategory(categoryName) {
    const category = this.sanitizeName(categoryName);
    if (!category) {
      return false;
    }
    let removed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      if (!(category in categories)) {
        return;
      }
      delete categories[category];
      fm.categories = categories;
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      if (category in topicColors) {
        delete topicColors[category];
      }
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const [path, metadata] of Object.entries(canvases)) {
        if (metadata.category === category) {
          delete canvases[path];
        }
      }
      fm.canvases = canvases;
      removed = true;
    });
    if (!removed) {
      return false;
    }
    await this.deleteCategoryLinkingNote(category);
    const notes = this.notesInCategory(category);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        if (this.normalizeCategoryScalar(fm.category) === category) {
          delete fm.category;
        }
      });
    }
    return true;
  }
  async renameTopic(categoryName, previousName, nextName) {
    const category = this.sanitizeName(categoryName);
    const previous = this.sanitizeName(previousName);
    const next = this.sanitizeName(nextName);
    if (!category || !previous || !next || previous === next) {
      return false;
    }
    let renamed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      var _a, _b;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = (_a = categories[category]) != null ? _a : [];
      if (!topics.includes(previous) || topics.includes(next)) {
        return;
      }
      categories[category] = topics.map((entry) => entry === previous ? next : entry);
      fm.categories = categories;
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      const categoryTopicColors = (_b = topicColors[category]) != null ? _b : {};
      const previousColor = categoryTopicColors[previous];
      if (previousColor) {
        categoryTopicColors[next] = previousColor;
      }
      delete categoryTopicColors[previous];
      topicColors[category] = categoryTopicColors;
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === category && metadata.topic === previous) {
          metadata.topic = next;
        }
      }
      fm.canvases = canvases;
      renamed = true;
    });
    if (!renamed) {
      return false;
    }
    await this.renameTopicInCategoryLinkingNote(category, previous, next);
    const notes = this.notesInCategory(category);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = normalizeTopicList(fm.topics);
        if (!current.includes(previous)) {
          return;
        }
        const updated = current.map((entry) => entry === previous ? next : entry).filter((entry, index, arr) => arr.indexOf(entry) === index);
        if (updated.length === 0) {
          delete fm.topics;
        } else {
          fm.topics = asTopicLinks(updated);
        }
      });
    }
    return true;
  }
  async deleteTopic(categoryName, topicName) {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!category || !topic) {
      return false;
    }
    let removed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      var _a, _b;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = (_a = categories[category]) != null ? _a : [];
      if (!topics.includes(topic)) {
        return;
      }
      categories[category] = topics.filter((entry) => entry !== topic);
      fm.categories = categories;
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      const categoryTopicColors = (_b = topicColors[category]) != null ? _b : {};
      delete categoryTopicColors[topic];
      topicColors[category] = categoryTopicColors;
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const [path, metadata] of Object.entries(canvases)) {
        if (metadata.category === category && metadata.topic === topic) {
          delete canvases[path];
        }
      }
      fm.canvases = canvases;
      removed = true;
    });
    if (!removed) {
      return false;
    }
    await this.deleteTopicFromCategoryLinkingNote(category, topic);
    const notes = this.notesInCategory(category);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = normalizeTopicList(fm.topics);
        if (!current.includes(topic)) {
          return;
        }
        const updated = current.filter((entry) => entry !== topic);
        if (updated.length === 0) {
          delete fm.topics;
        } else {
          fm.topics = asTopicLinks(updated);
        }
      });
    }
    return true;
  }
  async setTopicColor(categoryName, topicName, color) {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    const normalizedColor = this.sanitizeColor(color);
    if (!category || !topic || !normalizedColor) {
      return false;
    }
    let updated = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      var _a, _b;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = (_a = categories[category]) != null ? _a : [];
      if (!topics.includes(topic)) {
        return;
      }
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      const categoryTopicColors = (_b = topicColors[category]) != null ? _b : {};
      categoryTopicColors[topic] = normalizedColor;
      topicColors[category] = categoryTopicColors;
      fm.topicColors = topicColors;
      updated = true;
    });
    return updated;
  }
  async listTopicsForCategory(categoryName) {
    var _a;
    const categoryMap = await this.loadCategoryMap();
    return (_a = categoryMap[categoryName]) != null ? _a : [];
  }
  getTopicColor(categoryName, topicName) {
    var _a, _b, _c;
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!topic) {
      return this.fallbackColor(`${category}:${topic}`);
    }
    const colors = this.getTopicColorMapFromFrontmatter(
      (_b = (_a = this.app.metadataCache.getFileCache(this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH))) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.topicColors
    );
    const savedColor = (_c = colors[category]) == null ? void 0 : _c[topic];
    if (isValidHexColor(savedColor)) {
      return savedColor.trim().toLowerCase();
    }
    return this.fallbackColor(`${category}:${topic}`);
  }
  listNotes() {
    return this.app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(`${LEARNING_FOLDER}/`) && !file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`)).sort((a, b) => a.basename.localeCompare(b.basename));
  }
  listEntries() {
    return this.app.vault.getFiles().filter((file) => file.path.startsWith(`${LEARNING_FOLDER}/`) && !file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`) && (file.extension === "md" || file.extension === "canvas")).sort((a, b) => a.basename.localeCompare(b.basename));
  }
  isLearningNoteFile(file) {
    return !!file && file.extension === "md" && file.path.startsWith(`${LEARNING_FOLDER}/`) && !file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`);
  }
  noteExists(name) {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return false;
    }
    return ["md", "canvas"].some((extension) => this.app.vault.getAbstractFileByPath(`${LEARNING_FOLDER}/${trimmed}.${extension}`) instanceof import_obsidian5.TFile);
  }
  async createNote(name, category, topics) {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return null;
    }
    const path = `${LEARNING_FOLDER}/${trimmed}.md`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian5.TFile) {
      return existing;
    }
    await this.ensureProvisioned();
    const file = await this.app.vault.create(path, "");
    if (category || topics && topics.length > 0) {
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        if (category) {
          fm.category = this.toFrontmatterScalar(category);
        }
        if (topics && topics.length > 0) {
          const normalized = normalizeTopicList(topics);
          fm.topics = asTopicLinks(normalized);
        }
      });
    }
    return file;
  }
  async createDailyNote(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return null;
    }
    const name = `Daily Note ${dateKey}`;
    const existing = this.app.vault.getAbstractFileByPath(`${LEARNING_FOLDER}/${name}.md`);
    if (existing instanceof import_obsidian5.TFile) {
      return existing;
    }
    await this.addCategory(DAILY_NOTES_CATEGORY);
    await this.addTopic(DAILY_NOTES_CATEGORY, DAILY_NOTES_TOPIC);
    const file = await this.createNote(name, DAILY_NOTES_CATEGORY, [DAILY_NOTES_TOPIC]);
    if (!file) {
      return null;
    }
    await this.setComprehension(file, 0);
    return file;
  }
  async createCanvas(name, category, topic) {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return null;
    }
    const path = `${LEARNING_FOLDER}/${trimmed}.canvas`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian5.TFile) {
      return existing;
    }
    await this.ensureProvisioned();
    const sanitizedTopic = topic ? this.sanitizeName(topic) : "";
    const nodes = sanitizedTopic ? [this.buildCanvasTopicNode(sanitizedTopic)] : [];
    const file = await this.app.vault.create(path, JSON.stringify({ nodes, edges: [] }, null, 2));
    if (category && topic) {
      const configFile = await this.ensureConfigFile();
      await this.app.fileManager.processFrontMatter(configFile, (fm) => {
        const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
        canvases[file.path] = { category: this.sanitizeName(category), topic: this.sanitizeName(topic), progress: 0 };
        fm.canvases = canvases;
      });
    }
    return file;
  }
  async deleteNote(file) {
    if (file.extension === "canvas") {
      const configFile = await this.ensureConfigFile();
      await this.app.fileManager.processFrontMatter(configFile, (fm) => {
        const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
        delete canvases[file.path];
        fm.canvases = canvases;
      });
    }
    await this.app.vault.trash(file, true);
  }
  async handleEntryRename(file, oldPath) {
    if (file.extension !== "canvas" || oldPath === file.path) {
      return;
    }
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      const metadata = canvases[oldPath];
      if (!metadata) {
        return;
      }
      delete canvases[oldPath];
      canvases[file.path] = metadata;
      fm.canvases = canvases;
    });
  }
  getEntryCategory(file) {
    var _a, _b;
    if (file.extension === "canvas") {
      return (_b = (_a = this.getCanvasMetadata(file)) == null ? void 0 : _a.category) != null ? _b : null;
    }
    return this.getNoteCategory(file);
  }
  getCanvasSelection(file) {
    return file.extension === "canvas" ? this.getCanvasMetadata(file) : null;
  }
  getEntryTopics(file) {
    var _a;
    if (file.extension === "canvas") {
      const topic = (_a = this.getCanvasMetadata(file)) == null ? void 0 : _a.topic;
      return topic ? [topic] : [];
    }
    return this.getNoteTopics(file);
  }
  getEntryComprehension(file) {
    var _a, _b;
    return file.extension === "canvas" ? (_b = (_a = this.getCanvasMetadata(file)) == null ? void 0 : _a.progress) != null ? _b : 0 : this.getComprehension(file);
  }
  async setCanvasProgress(file, value) {
    if (file.extension !== "canvas") {
      return;
    }
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      const metadata = canvases[file.path];
      if (!metadata) {
        return;
      }
      metadata.progress = this.clampComprehension(value);
      fm.canvases = canvases;
    });
  }
  entriesInCategory(category) {
    return this.listEntries().filter((file) => this.getEntryCategory(file) === category);
  }
  entriesInCategoryTopic(category, topic) {
    return this.entriesInCategory(category).filter((file) => this.getEntryTopics(file).includes(topic));
  }
  getNoteCategory(file) {
    var _a, _b;
    const category = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.category;
    if (typeof category === "number" && Number.isFinite(category)) {
      return String(category);
    }
    return typeof category === "string" && category.trim().length > 0 ? category.trim() : null;
  }
  async setNoteCategory(file, category) {
    const trimmed = this.sanitizeName(category);
    if (!trimmed) {
      return;
    }
    await this.addCategory(trimmed);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.category = this.toFrontmatterScalar(trimmed);
    });
  }
  getNoteTopics(file) {
    var _a, _b;
    return normalizeTopicList((_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.topics);
  }
  async toggleNoteTopic(file, topic) {
    const target = this.sanitizeName(topic);
    if (!target) {
      return false;
    }
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = normalizeTopicList(fm.topics);
      if (current.includes(target)) {
        fm.topics = asTopicLinks(current.filter((entry) => entry !== target));
        nowActive = false;
      } else {
        fm.topics = asTopicLinks([...current, target]);
        nowActive = true;
      }
    });
    return nowActive;
  }
  getComprehension(file) {
    var _a, _b;
    const raw = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.comprehension;
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return 0;
    }
    return this.clampComprehension(raw);
  }
  async setComprehension(file, value) {
    const next = this.clampComprehension(value);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.comprehension = next;
    });
  }
  notesInCategory(category) {
    return this.listNotes().filter((file) => this.getNoteCategory(file) === category);
  }
  notesInCategoryTopic(category, topic) {
    return this.notesInCategory(category).filter((file) => this.getNoteTopics(file).includes(topic));
  }
  async ensureCategoryLinkingNote(categoryName, topicName) {
    const category = this.sanitizeName(categoryName);
    const topic = topicName ? this.sanitizeName(topicName) : "";
    if (!category) {
      return null;
    }
    await this.ensureFolderExists(NOTES_CATEGORIES_FOLDER);
    const path = this.buildCategoryLinkingNotePath(category);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian5.TFile) {
      await this.app.fileManager.processFrontMatter(existing, (fm) => {
        fm.category = this.toFrontmatterScalar(category);
        const current = normalizeTopicList(fm.topics);
        const next = topic && !current.includes(topic) ? [...current, topic] : current;
        fm.topics = asTopicLinks(next);
      });
      return existing;
    }
    const categoryValue = this.toFrontmatterScalar(category);
    const categoryYaml = typeof categoryValue === "number" ? String(categoryValue) : JSON.stringify(categoryValue);
    const topicsYaml = topic ? `
  - [[${topic}]]` : " []";
    const noteBody = `---
category: ${categoryYaml}
topics:${topicsYaml}
---

# ${category}
`;
    return this.app.vault.create(path, noteBody);
  }
  buildCategoryLinkingNotePath(categoryName) {
    const category = this.sanitizeNoteName(categoryName);
    return `${NOTES_CATEGORIES_FOLDER}/${category}.md`;
  }
  async renameTopicInCategoryLinkingNote(categoryName, previousTopic, nextTopic) {
    const category = this.sanitizeName(categoryName);
    const previous = this.sanitizeName(previousTopic);
    const next = this.sanitizeName(nextTopic);
    if (!category || !previous || !next || previous === next) {
      return;
    }
    const path = this.buildCategoryLinkingNotePath(category);
    const note = this.app.vault.getAbstractFileByPath(path);
    if (!(note instanceof import_obsidian5.TFile)) {
      return;
    }
    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const current = normalizeTopicList(fm.topics);
      if (!current.includes(previous)) {
        return;
      }
      const updated = current.map((entry) => entry === previous ? next : entry).filter((entry, index, arr) => arr.indexOf(entry) === index);
      fm.topics = asTopicLinks(updated);
    });
  }
  async renameCategoryLinkingNote(previousCategory, nextCategory) {
    const previous = this.sanitizeName(previousCategory);
    const next = this.sanitizeName(nextCategory);
    if (!previous || !next || previous === next) {
      return;
    }
    const sourcePath = this.buildCategoryLinkingNotePath(previous);
    const source = this.app.vault.getAbstractFileByPath(sourcePath);
    if (!(source instanceof import_obsidian5.TFile)) {
      return;
    }
    const targetPath = this.buildCategoryLinkingNotePath(next);
    const target = this.app.vault.getAbstractFileByPath(targetPath);
    if (target instanceof import_obsidian5.TFile && target.path !== source.path) {
      await this.app.vault.delete(target);
    }
    await this.app.vault.rename(source, targetPath);
    const renamed = this.app.vault.getAbstractFileByPath(targetPath);
    if (!(renamed instanceof import_obsidian5.TFile)) {
      return;
    }
    const content = await this.app.vault.cachedRead(renamed);
    const updatedContent = content.replace(/^# .*$/m, `# ${next}`);
    if (updatedContent !== content) {
      await this.app.vault.modify(renamed, updatedContent);
    }
    await this.app.fileManager.processFrontMatter(renamed, (fm) => {
      fm.category = this.toFrontmatterScalar(next);
      const topics = normalizeTopicList(fm.topics);
      fm.topics = asTopicLinks(topics);
    });
  }
  async deleteTopicFromCategoryLinkingNote(categoryName, topicName) {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!category || !topic) {
      return;
    }
    const path = this.buildCategoryLinkingNotePath(category);
    const note = this.app.vault.getAbstractFileByPath(path);
    if (!(note instanceof import_obsidian5.TFile)) {
      return;
    }
    let shouldDelete = false;
    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const current = normalizeTopicList(fm.topics);
      const updated = current.filter((entry) => entry !== topic);
      if (updated.length === 0) {
        shouldDelete = true;
        delete fm.topics;
        fm.category = this.toFrontmatterScalar(category);
      } else {
        fm.topics = asTopicLinks(updated);
      }
    });
    if (shouldDelete) {
      await this.app.vault.trash(note, true);
    }
  }
  async deleteCategoryLinkingNote(categoryName) {
    const category = this.sanitizeName(categoryName);
    if (!category) {
      return;
    }
    const path = this.buildCategoryLinkingNotePath(category);
    const note = this.app.vault.getAbstractFileByPath(path);
    if (note instanceof import_obsidian5.TFile) {
      await this.app.vault.trash(note, true);
    }
  }
  listCategoryLinkingNotes() {
    return this.app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`) || file.path.startsWith(`${LEGACY_NOTES_CATEGORIES_FOLDER}/`)).sort((a, b) => a.path.localeCompare(b.path));
  }
  async migrateCategoryLinkingNotes() {
    var _a;
    const notes = this.listCategoryLinkingNotes();
    for (const note of notes) {
      const frontmatter = (_a = this.app.metadataCache.getFileCache(note)) == null ? void 0 : _a.frontmatter;
      const separatorIndex = note.basename.indexOf("--");
      const legacyCategory = separatorIndex >= 0 ? note.basename.slice(0, separatorIndex).trim() : note.basename;
      const legacyTopic = separatorIndex >= 0 ? note.basename.slice(separatorIndex + 2).trim() : "";
      const category = typeof (frontmatter == null ? void 0 : frontmatter.category) === "number" ? String(frontmatter.category) : typeof (frontmatter == null ? void 0 : frontmatter.category) === "string" ? frontmatter.category.trim() : typeof (frontmatter == null ? void 0 : frontmatter.topic) === "string" ? frontmatter.topic.trim() : legacyCategory;
      if (!category) {
        continue;
      }
      const existingTopics = normalizeTopicList(frontmatter == null ? void 0 : frontmatter.topics);
      const legacyTopics = normalizeTopicList(frontmatter == null ? void 0 : frontmatter.categories);
      const topics = [...existingTopics, ...legacyTopics, legacyTopic].filter((topic, index, values) => topic && topic !== LEGACY_HELP_TOPIC && values.indexOf(topic) === index);
      const targetPath = this.buildCategoryLinkingNotePath(category);
      const target = this.app.vault.getAbstractFileByPath(targetPath);
      if (target instanceof import_obsidian5.TFile && target.path !== note.path) {
        await this.app.fileManager.processFrontMatter(target, (fm) => {
          const merged = [...normalizeTopicList(fm.topics), ...topics].filter((topic, index, values) => topic && topic !== LEGACY_HELP_TOPIC && values.indexOf(topic) === index);
          fm.category = this.toFrontmatterScalar(category);
          fm.topics = asTopicLinks(merged);
          delete fm.topic;
          if (Array.isArray(fm.categories)) {
            delete fm.categories;
          }
        });
        await this.app.vault.trash(note, true);
        continue;
      }
      if (note.path !== targetPath) {
        await this.app.vault.rename(note, targetPath);
      }
      const migrated = this.app.vault.getAbstractFileByPath(targetPath);
      if (!(migrated instanceof import_obsidian5.TFile)) {
        continue;
      }
      await this.app.fileManager.processFrontMatter(migrated, (fm) => {
        fm.category = this.toFrontmatterScalar(category);
        fm.topics = asTopicLinks(topics);
        delete fm.topic;
        if (Array.isArray(fm.categories)) {
          delete fm.categories;
        }
      });
      const content = await this.app.vault.cachedRead(migrated);
      const updatedContent = content.replace(/^# .*$/m, `# ${category}`);
      if (updatedContent !== content) {
        await this.app.vault.modify(migrated, updatedContent);
      }
    }
  }
  sanitizeNoteName(name) {
    return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  }
  sanitizeName(name) {
    return name.trim();
  }
  toFrontmatterScalar(value) {
    return /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) ? Number(value) : value;
  }
  normalizeCategoryScalar(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return null;
  }
  sanitizeColor(value) {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    return isValidHexColor(trimmed) ? trimmed.toLowerCase() : null;
  }
  clampComprehension(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  fallbackColor(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 74% 58%)`;
  }
  getCategoryMapFromFrontmatter(raw) {
    const map = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }
    for (const [category, topics] of Object.entries(raw)) {
      const trimmedCategory = this.sanitizeName(category);
      if (!trimmedCategory) {
        continue;
      }
      map[trimmedCategory] = normalizeTopicList(topics);
    }
    return map;
  }
  getTopicColorMapFromFrontmatter(raw) {
    const map = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }
    for (const [category, topics] of Object.entries(raw)) {
      const trimmedCategory = this.sanitizeName(category);
      if (!trimmedCategory || !topics || typeof topics !== "object" || Array.isArray(topics)) {
        continue;
      }
      const categoryTopicColors = {};
      for (const [topic, color] of Object.entries(topics)) {
        const trimmedTopic = this.sanitizeName(topic);
        if (!trimmedTopic || !isValidHexColor(color)) {
          continue;
        }
        categoryTopicColors[trimmedTopic] = color.trim().toLowerCase();
      }
      if (Object.keys(categoryTopicColors).length > 0) {
        map[trimmedCategory] = categoryTopicColors;
      }
    }
    return map;
  }
  getCanvasMetadata(file) {
    var _a, _b, _c;
    const configFile = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (!(configFile instanceof import_obsidian5.TFile)) {
      return null;
    }
    const canvases = this.getCanvasMapFromFrontmatter(
      (_b = (_a = this.app.metadataCache.getFileCache(configFile)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.canvases
    );
    return (_c = canvases[file.path]) != null ? _c : null;
  }
  buildCanvasTopicNode(topic) {
    return {
      id: "neural-garden-topic-link",
      type: "text",
      text: `### Topic
Do not touch this.\\
[[${topic}]]`,
      x: -1e4,
      y: -1e4,
      width: 170,
      height: 100
    };
  }
  async ensureCanvasTopicLinks() {
    var _a, _b, _c;
    const configFile = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (!(configFile instanceof import_obsidian5.TFile)) {
      return;
    }
    const canvases = this.getCanvasMapFromFrontmatter(
      (_b = (_a = this.app.metadataCache.getFileCache(configFile)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.canvases
    );
    for (const [path, metadata] of Object.entries(canvases)) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof import_obsidian5.TFile) || file.extension !== "canvas") {
        continue;
      }
      try {
        const data = JSON.parse(await this.app.vault.cachedRead(file));
        const nodes = Array.isArray(data.nodes) ? data.nodes : [];
        const topicNode = this.buildCanvasTopicNode(metadata.topic);
        const existingIndex = nodes.findIndex((node) => node.id === "neural-garden-topic-link");
        let changed = false;
        if (existingIndex >= 0) {
          const existingNode = (_c = nodes[existingIndex]) != null ? _c : {};
          if (existingNode.text !== topicNode.text || existingNode.type !== topicNode.type || existingNode.x !== topicNode.x || existingNode.y !== topicNode.y || existingNode.width !== topicNode.width || existingNode.height !== topicNode.height) {
            nodes[existingIndex] = { ...existingNode, ...topicNode };
            changed = true;
          }
        } else {
          nodes.unshift(topicNode);
          changed = true;
        }
        if (!changed) {
          continue;
        }
        data.nodes = nodes;
        data.edges = Array.isArray(data.edges) ? data.edges : [];
        await this.app.vault.modify(file, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error(`[Neural Garden] Could not add topic link to canvas ${path}`, error);
      }
    }
  }
  getCanvasMapFromFrontmatter(raw) {
    const map = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }
    for (const [path, value] of Object.entries(raw)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }
      const metadata = value;
      const category = typeof metadata.category === "string" ? this.sanitizeName(metadata.category) : "";
      const topic = typeof metadata.topic === "string" ? this.sanitizeName(metadata.topic) : "";
      if (path.endsWith(".canvas") && category && topic) {
        map[path] = {
          category,
          topic,
          progress: this.clampComprehension(typeof metadata.progress === "number" ? metadata.progress : 0)
        };
      }
    }
    return map;
  }
  async readCategoriesFromFile(file) {
    var _a, _b, _c;
    const content = await this.app.vault.cachedRead(file);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return {};
    }
    const parsed = this.parseCategoriesFrontmatter(match[1]);
    if (parsed) {
      return parsed;
    }
    return (_c = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.categories) != null ? _c : {};
  }
  parseCategoriesFrontmatter(frontmatterText) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const lines = frontmatterText.split(/\r?\n/);
    const categoriesIndex = lines.findIndex((line) => /^categories:\s*/.test(line));
    if (categoriesIndex < 0) {
      return null;
    }
    const firstLine = (_b = (_a = lines[categoriesIndex]) == null ? void 0 : _a.trim()) != null ? _b : "";
    if (firstLine === "categories: {}") {
      return {};
    }
    const map = {};
    let currentCategory = null;
    for (let i = categoriesIndex + 1; i < lines.length; i += 1) {
      const line = (_c = lines[i]) != null ? _c : "";
      if (!line.trim()) {
        continue;
      }
      if (!line.startsWith("  ")) {
        break;
      }
      const categoryMatch = line.match(/^  ([^:#][^:]*)\s*:\s*(.*)$/);
      if (categoryMatch) {
        currentCategory = (_e = (_d = categoryMatch[1]) == null ? void 0 : _d.trim()) != null ? _e : null;
        if (!currentCategory) {
          continue;
        }
        if (!(currentCategory in map)) {
          map[currentCategory] = [];
        }
        const inlineValue = (_g = (_f = categoryMatch[2]) == null ? void 0 : _f.trim()) != null ? _g : "";
        if (inlineValue === "[]") {
          continue;
        }
        if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
          const values = inlineValue.slice(1, -1).split(",").map((entry) => entry.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
          map[currentCategory] = values;
        }
        continue;
      }
      const topicMatch = line.match(/^    -\s+(.+)$/);
      if (topicMatch && currentCategory) {
        const topic = (_h = topicMatch[1]) == null ? void 0 : _h.trim().replace(/^['\"]|['\"]$/g, "");
        if (topic && !((_i = map[currentCategory]) == null ? void 0 : _i.includes(topic))) {
          (_j = map[currentCategory]) == null ? void 0 : _j.push(topic);
        }
      }
    }
    return map;
  }
  async migrateConfigSchema(file) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!fm.categories && fm.topics && typeof fm.topics === "object" && !Array.isArray(fm.topics)) {
        fm.categories = fm.topics;
      }
      if (!fm.topicColors && fm.categoryColors && typeof fm.categoryColors === "object") {
        fm.topicColors = fm.categoryColors;
      }
      delete fm.categoryColors;
      delete fm.topics;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      for (const category of Object.keys(categories)) {
        categories[category] = categories[category].filter((topic) => topic !== LEGACY_HELP_TOPIC);
      }
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      for (const colors of Object.values(topicColors)) {
        delete colors[LEGACY_HELP_TOPIC];
      }
      fm.categories = categories;
      fm.topicColors = topicColors;
      fm.canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
    });
  }
  async migrateNoteSchema(file) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!fm.category && typeof fm.topic === "string") {
        fm.category = this.toFrontmatterScalar(fm.topic);
      } else {
        const category = this.normalizeCategoryScalar(fm.category);
        if (category) {
          fm.category = this.toFrontmatterScalar(category);
        }
      }
      if (!fm.topics && Array.isArray(fm.categories)) {
        fm.topics = asTopicLinks(normalizeTopicList(fm.categories));
      }
      if (Array.isArray(fm.topics)) {
        fm.topics = asTopicLinks(normalizeTopicList(fm.topics).filter((topic) => topic !== LEGACY_HELP_TOPIC));
      }
      delete fm.help;
      delete fm.topic;
      if (Array.isArray(fm.categories)) {
        delete fm.categories;
      }
    });
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
        if (message.toLowerCase().includes("already exists") || this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
        throw error;
      }
    }
  }
};

// src/myNotesView.ts
var import_obsidian6 = require("obsidian");
var FAVOURITE_CATEGORY = "__favourite__";
var SUPPORT_PREFIX = "support:";
var OPEN_RIGHT_ICON_CANDIDATES2 = ["separator-vertical", "panel-right-open", "split-square-vertical"];
var EDIT_ICON_CANDIDATES2 = ["pencil", "pencil-line", "edit-3"];
function setOpenToRightIcon2(el) {
  for (const iconName of OPEN_RIGHT_ICON_CANDIDATES2) {
    (0, import_obsidian6.setIcon)(el, iconName);
    if (el.querySelector("svg")) {
      return;
    }
  }
  el.setText(">");
}
function setEditIcon2(el) {
  for (const iconName of EDIT_ICON_CANDIDATES2) {
    (0, import_obsidian6.setIcon)(el, iconName);
    if (el.querySelector("svg")) {
      return;
    }
  }
  el.setText("E");
}
var NeuralGardenMyNotesView = class extends import_obsidian6.ItemView {
  constructor(leaf, myNotesStorage, openHomeView) {
    super(leaf);
    this.myNotesStorage = myNotesStorage;
    this.openHomeView = openHomeView;
    this.selectedCategory = null;
    this.editMode = null;
    this.searchQuery = "";
    this.searchDebounceTimer = null;
    this.uncategorizedExpanded = false;
    this.searchHintEl = null;
    this.notesListEl = null;
    this.categoryPillRowEl = null;
    this.supportPillRowEl = null;
  }
  getViewType() {
    return VIEW_TYPE_NEURAL_GARDEN_MY_NOTES;
  }
  getDisplayText() {
    return "MyNotes";
  }
  getIcon() {
    return "folder";
  }
  async onOpen() {
    await this.myNotesStorage.ensureCategoriesFile();
    await this.render();
  }
  async onClose() {
    if (this.searchDebounceTimer) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }
  async render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrapper = contentEl.createDiv({ cls: "ng-mynotes" });
    const topBar = wrapper.createDiv({ cls: "ng-mynotes-topbar" });
    const homeButton = topBar.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });
    wrapper.createEl("h2", { text: "MyNotes", cls: "ng-mynotes-heading" });
    this.searchHintEl = wrapper.createDiv({ cls: "ng-mynotes-heading-hint" });
    this.renderSearchSection(wrapper);
    await this.renderCategoriesSection(wrapper);
    this.renderSupportSection(wrapper);
    this.notesListEl = wrapper.createDiv({ cls: "ng-mynotes-list" });
    await this.updateNotesList();
  }
  async renderCategoriesSection(parent) {
    const section = parent.createDiv({ cls: "ng-mynotes-categories" });
    const headerRow = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleWrap = headerRow.createDiv({ cls: "ng-mynotes-title-actions" });
    titleWrap.createEl("h4", { text: "Categories", cls: "ng-mynotes-section-title" });
    const categoryActions = titleWrap.createDiv({ cls: "ng-mylearning-header-actions ng-mynotes-header-actions" });
    const createCategoryButton = categoryActions.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createCategoryButton.setAttribute("aria-label", "Create Category");
    createCategoryButton.setAttribute("title", "Create Category");
    createCategoryButton.setText("+");
    createCategoryButton.addEventListener("click", () => {
      this.openCreateCategoryOverlay();
    });
    const editCategoryButton = categoryActions.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-edit" });
    editCategoryButton.setAttribute("aria-label", "Edit Categories");
    editCategoryButton.setAttribute("title", "Edit Categories");
    setEditIcon2(editCategoryButton);
    editCategoryButton.toggleClass("is-active", this.editMode === "category");
    editCategoryButton.addEventListener("click", () => {
      this.editMode = this.editMode === "category" ? null : "category";
      void this.render();
    });
    const newButton = headerRow.createEl("button", { cls: "ng-mynotes-new-button" });
    const newIcon = newButton.createSpan({ cls: "ng-mynotes-button-icon" });
    (0, import_obsidian6.setIcon)(newIcon, "file-plus-2");
    newButton.createSpan({ text: "New" });
    newButton.addEventListener("click", () => {
      this.openNewNoteOverlay();
    });
    const pillRow = section.createDiv({ cls: "ng-mynotes-pill-row" });
    this.categoryPillRowEl = pillRow;
    const favouritePill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-mynotes-pill-favourite" });
    favouritePill.dataset.categoryKey = FAVOURITE_CATEGORY;
    const heartIcon = favouritePill.createSpan({ cls: "ng-mynotes-button-icon" });
    (0, import_obsidian6.setIcon)(heartIcon, "heart");
    favouritePill.createSpan({ text: "Favourites" });
    if (this.selectedCategory === FAVOURITE_CATEGORY) {
      favouritePill.addClass("is-active");
    }
    favouritePill.addEventListener("click", () => {
      void this.selectCategory(FAVOURITE_CATEGORY);
    });
    const categories = await this.myNotesStorage.loadCategories();
    for (const category of categories) {
      const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill" });
      pill.dataset.categoryKey = category.name;
      pill.createSpan({ text: category.name });
      if (this.selectedCategory === category.name) {
        pill.addClass("is-active");
      }
      pill.toggleClass("is-edit-target", this.editMode === "category");
      pill.addEventListener("click", () => {
        if (this.editMode === "category") {
          this.openCategoryEditActions(category.name);
          return;
        }
        void this.selectCategory(category.name);
      });
    }
    if (categories.length === 0) {
      section.createDiv({
        cls: "ng-empty",
        text: "No categories yet. Add categories from a note's header."
      });
    }
  }
  renderSupportSection(parent) {
    const section = parent.createDiv({ cls: "ng-mynotes-support" });
    section.createEl("h4", { text: "Support Notes", cls: "ng-mynotes-section-title" });
    const pillRow = section.createDiv({ cls: "ng-mynotes-pill-row" });
    this.supportPillRowEl = pillRow;
    for (const support of SUPPORT_CATEGORIES) {
      const key = `${SUPPORT_PREFIX}${support.name}`;
      const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-mynotes-support-pill" });
      pill.dataset.categoryKey = key;
      pill.createSpan({ text: support.name });
      pill.style.setProperty("--ng-support-color", support.color);
      if (this.selectedCategory === key) {
        pill.addClass("is-active");
      }
      pill.addEventListener("click", () => {
        void this.selectCategory(key);
      });
    }
  }
  renderSearchSection(parent) {
    const section = parent.createDiv({ cls: "ng-mynotes-search" });
    const input = section.createEl("input", {
      type: "text",
      placeholder: "Search Notes..."
    });
    input.addClass("ng-task-input");
    input.value = this.searchQuery;
    input.addEventListener("input", () => {
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = window.setTimeout(() => {
        this.searchQuery = input.value.trim();
        void this.updateNotesList();
      }, 250);
    });
  }
  syncSearchHint() {
    if (!this.searchHintEl) {
      return;
    }
    this.searchHintEl.setText("Select a category or search to see notes");
  }
  async selectCategory(name) {
    this.selectedCategory = this.selectedCategory === name ? null : name;
    this.syncCategorySelectionState();
    await this.updateNotesList();
  }
  syncCategorySelectionState() {
    var _a;
    for (const button of this.contentEl.querySelectorAll(".ng-mynotes-pill[data-category-key]")) {
      const key = (_a = button.dataset.categoryKey) != null ? _a : null;
      button.toggleClass("is-active", key === this.selectedCategory);
    }
  }
  async updateNotesList() {
    const container = this.notesListEl;
    if (!container) {
      return;
    }
    container.empty();
    this.syncSearchHint();
    if (!this.selectedCategory && this.searchQuery.length < 2) {
      this.renderUncategorizedSection(container);
      return;
    }
    const files = await this.collectNotes();
    if (files.length === 0) {
      container.createDiv({ cls: "ng-empty", text: "No notes found." });
    } else {
      for (const file of files) {
        this.renderNoteRow(container, file);
      }
    }
    this.renderUncategorizedSection(container);
  }
  renderUncategorizedSection(container) {
    const uncategorized = this.myNotesStorage.listNotes().filter((file) => this.myNotesStorage.getNoteCategories(file).length === 0);
    const uncategorizedToggle = container.createEl("button", {
      cls: "ng-mynotes-subheading ng-mynotes-subheading-toggle"
    });
    uncategorizedToggle.createSpan({
      cls: "ng-mynotes-caret",
      text: this.uncategorizedExpanded ? "\u25BC" : "\u25B6"
    });
    uncategorizedToggle.createSpan({ cls: "ng-mynotes-subheading-label", text: "Uncategorized Notes" });
    uncategorizedToggle.addEventListener("click", () => {
      this.uncategorizedExpanded = !this.uncategorizedExpanded;
      void this.updateNotesList();
    });
    if (!this.uncategorizedExpanded) {
      return;
    }
    if (uncategorized.length === 0) {
      container.createDiv({ cls: "ng-empty", text: "No uncategorized notes." });
      return;
    }
    for (const file of uncategorized) {
      this.renderNoteRow(container, file);
    }
  }
  async collectNotes() {
    var _a;
    let files = null;
    if (this.selectedCategory === FAVOURITE_CATEGORY) {
      files = this.myNotesStorage.favouriteNotes();
    } else if ((_a = this.selectedCategory) == null ? void 0 : _a.startsWith(SUPPORT_PREFIX)) {
      files = this.myNotesStorage.notesWithSupport(this.selectedCategory.slice(SUPPORT_PREFIX.length));
    } else if (this.selectedCategory) {
      files = await this.myNotesStorage.notesInCategory(this.selectedCategory);
    }
    const query = this.searchQuery;
    if (query.length >= 2) {
      if (files === null) {
        return await searchNotesInFolder(this.app, query);
      }
      const q = query.toLowerCase();
      return files.filter((file) => file.basename.toLowerCase().includes(q));
    }
    return files != null ? files : [];
  }
  renderNoteRow(container, file) {
    const row = container.createDiv({ cls: "ng-mynotes-note-row" });
    const favouriteButton = row.createEl("button", { cls: "ng-mynotes-note-heart" });
    (0, import_obsidian6.setIcon)(favouriteButton, "heart");
    if (this.myNotesStorage.isFavourite(file)) {
      favouriteButton.addClass("is-favourite");
    }
    favouriteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const nowFavourite = await this.myNotesStorage.toggleFavourite(file);
      favouriteButton.toggleClass("is-favourite", nowFavourite);
      favouriteButton.removeClass("ng-heart-pop");
      void favouriteButton.offsetWidth;
      favouriteButton.addClass("ng-heart-pop");
      if (this.selectedCategory === FAVOURITE_CATEGORY && !nowFavourite) {
        row.remove();
      }
    });
    row.createDiv({ cls: "ng-mynotes-note-indicator" });
    row.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });
    const openRightButton = row.createEl("button", { cls: "ng-mynotes-note-open-right" });
    openRightButton.setAttribute("aria-label", "Open to the right");
    setOpenToRightIcon2(openRightButton);
    openRightButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const rightLeaf = this.app.workspace.getLeaf("split", "vertical");
      await rightLeaf.openFile(file);
    });
    const deleteButton = row.createEl("button", { cls: "ng-mynotes-note-delete" });
    (0, import_obsidian6.setIcon)(deleteButton, "x");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.openDeleteOverlay(file, row);
    });
    row.addEventListener("click", async () => {
      await this.leaf.openFile(file);
    });
  }
  openNewNoteOverlay() {
    const { card, close } = openOverlay("Create A Note");
    card.createDiv({ cls: "ng-overlay-subtitle", text: "Write down a name" });
    if (this.selectedCategory && this.selectedCategory !== FAVOURITE_CATEGORY) {
      const label = this.selectedCategory.startsWith(SUPPORT_PREFIX) ? `Support-Category: ${this.selectedCategory.slice(SUPPORT_PREFIX.length)}` : `Category: ${this.selectedCategory}`;
      card.createDiv({ cls: "ng-overlay-text", text: label });
    }
    const input = card.createEl("input", { type: "text", placeholder: "Note name..." });
    input.addClass("ng-task-input");
    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });
    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      if (this.myNotesStorage.noteExists(name)) {
        errorEl.setText("This Note already exists");
        errorEl.show();
        input.value = "";
        input.focus();
        return;
      }
      const file = await this.myNotesStorage.createNote(name);
      close();
      if (!file) {
        new import_obsidian6.Notice("Could not create the note. Try a different name.");
        return;
      }
      if (this.selectedCategory && this.selectedCategory !== FAVOURITE_CATEGORY) {
        if (this.selectedCategory.startsWith(SUPPORT_PREFIX)) {
          const supportName = this.selectedCategory.slice(SUPPORT_PREFIX.length);
          await this.myNotesStorage.setSupportNote(file, true);
          await this.myNotesStorage.toggleNoteSupport(file, supportName);
        } else {
          await this.myNotesStorage.toggleNoteCategory(file, this.selectedCategory);
        }
      }
      await this.leaf.openFile(file);
    };
    createButton.addEventListener("click", () => void submit());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openCreateCategoryOverlay() {
    const { card, close } = openOverlay("Create Category");
    const input = card.createEl("input", { type: "text", placeholder: "Category name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      await this.myNotesStorage.addCategory(name);
      this.selectedCategory = name;
      close();
      await this.render();
    };
    createButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openCategoryEditActions(category) {
    const { card, close } = openOverlay("Edit Category");
    card.createDiv({ cls: "ng-overlay-subtitle", text: category });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    renameButton.addEventListener("click", () => {
      close();
      this.openRenameCategoryOverlay(category);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteCategoryOverlay(category);
    });
    cancelButton.addEventListener("click", () => close());
  }
  openRenameCategoryOverlay(previousCategory) {
    const { card, close } = openOverlay("Rename Category");
    const input = card.createEl("input", { type: "text", value: previousCategory, placeholder: "New category name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const nextCategory = input.value.trim();
      const success = await this.myNotesStorage.renameCategory(previousCategory, nextCategory);
      if (!success) {
        new import_obsidian6.Notice("Could not rename category. Check the new name and try again.");
        return;
      }
      if (this.selectedCategory === previousCategory) {
        this.selectedCategory = nextCategory;
      }
      this.editMode = null;
      close();
      await this.render();
    };
    renameButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }
  openDeleteCategoryOverlay(category) {
    const { card, close } = openOverlay("Delete Category");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete category "${category}" and remove it from all notes?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const submit = async () => {
      const success = await this.myNotesStorage.deleteCategory(category);
      if (!success) {
        new import_obsidian6.Notice("Could not delete category.");
        return;
      }
      if (this.selectedCategory === category) {
        this.selectedCategory = null;
      }
      this.editMode = null;
      close();
      await this.render();
    };
    deleteButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
  }
  openDeleteOverlay(file, row) {
    const { card, close } = openOverlay("Delete Note");
    card.createDiv({
      cls: "ng-overlay-text",
      text: `Are you sure you want to delete "${file.basename}"?`
    });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    cancelButton.addEventListener("click", () => close());
    deleteButton.addEventListener("click", async () => {
      await this.myNotesStorage.deleteNote(file);
      close();
      row.remove();
      await this.render();
    });
  }
};

// src/weeklyRecapView.ts
var import_obsidian7 = require("obsidian");
var WEEKLY_ANIMATION_SCALE = 2;
var NeuralGardenWeeklyRecapView = class extends import_obsidian7.ItemView {
  constructor(leaf, journalingStorage, weeklyRecapManager, openHomeView, openJournalingView) {
    super(leaf);
    this.journalingStorage = journalingStorage;
    this.weeklyRecapManager = weeklyRecapManager;
    this.openHomeView = openHomeView;
    this.openJournalingView = openJournalingView;
    this.currentYear = null;
    this.currentWeek = null;
    this.currentFilePath = null;
    this.currentFrontmatter = null;
    this.currentBody = "";
    this.sectionObserver = null;
    this.supportRevealPlayed = false;
    this.revealTimeouts = [];
  }
  getViewType() {
    return VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP;
  }
  getDisplayText() {
    return "Weekly Recap";
  }
  getIcon() {
    return "sparkles";
  }
  async onOpen() {
    injectNeuralGardenStyles();
    this.renderLoading("Open a week from Journaling to view recap.");
  }
  async onClose() {
    var _a;
    (_a = this.sectionObserver) == null ? void 0 : _a.disconnect();
    this.sectionObserver = null;
    this.supportRevealPlayed = false;
    this.revealTimeouts.forEach((id) => window.clearTimeout(id));
    this.revealTimeouts = [];
  }
  async openForWeek(year, week) {
    this.currentYear = year;
    this.currentWeek = week;
    this.renderLoading("Preparing your weekly recap...");
    const data = await this.weeklyRecapManager.ensureWeeklyRecapData(year, week);
    this.currentFilePath = data.file.path;
    this.currentFrontmatter = data.frontmatter;
    this.currentBody = data.body;
    await this.renderRecap(data.frontmatter, data.generatedNow);
  }
  renderLoading(text) {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrap = contentEl.createDiv({ cls: "ng-weekly-view" });
    wrap.createDiv({ cls: "ng-empty", text });
  }
  async renderRecap(frontmatter, animateIn) {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrap = contentEl.createDiv({ cls: "ng-weekly-view" });
    const top = wrap.createDiv({ cls: "ng-journal-topbar" });
    const leftNav = top.createDiv({ cls: "ng-journal-topbar-left" });
    const rightNav = top.createDiv({ cls: "ng-journal-topbar-right" });
    const homeButton = rightNav.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });
    const journalingButton = leftNav.createEl("button", { text: "<- Journaling", cls: "ng-journal-nav-button" });
    journalingButton.addEventListener("click", async () => {
      await this.openJournalingView(true, this.leaf);
    });
    const intro = wrap.createDiv({ cls: "ng-weekly-intro" });
    intro.createEl("h3", { text: "This is your Weekly Recap" });
    const start = frontmatter.processedDateRange.start;
    const end = frontmatter.processedDateRange.end;
    if (start && end) {
      intro.createDiv({ cls: "ng-weekly-intro-subtitle", text: `${start} to ${end}` });
    }
    const symptoms = wrap.createDiv({ cls: "ng-weekly-section" });
    symptoms.createEl("h4", { text: "Symptom Recap", cls: "ng-weekly-section-heading" });
    const symptomRows = [
      { label: "Mood", value: frontmatter.averages.mood, highIsBad: false },
      { label: "Sleep", value: frontmatter.averages.sleep, highIsBad: false },
      { label: "Regulation", value: frontmatter.averages.regulation, highIsBad: false },
      { label: "Stress", value: frontmatter.averages.stress, highIsBad: true },
      { label: "Anxiety", value: frontmatter.averages.anxiety, highIsBad: true },
      { label: "Exhaustion", value: frontmatter.averages.exhaustion, highIsBad: true },
      { label: "Sensory Load", value: frontmatter.averages.sensoryLoad, highIsBad: true },
      { label: "Social Load", value: frontmatter.averages.socialLoad, highIsBad: true }
    ];
    const symptomBlocks = [];
    for (const row of symptomRows) {
      const block = symptoms.createDiv({ cls: "ng-weekly-symptom" });
      const name = block.createDiv({ cls: "ng-journal-metric-label", text: row.label });
      const bar = block.createDiv({ cls: "ng-journal-progress ng-journal-progress-readonly" });
      const fill = bar.createDiv({ cls: "ng-journal-progress-fill" });
      fill.dataset.targetWidth = String(Math.max(0, Math.min(100, row.value)));
      fill.style.width = "0%";
      fill.style.backgroundColor = weeklyMetricColor2(row.value, row.highIsBad);
      const copy = block.createDiv({ cls: "ng-weekly-symptom-copy", text: describeSymptom(row.label, row.value, row.highIsBad) });
      name.addClass("ng-weekly-fragment-hidden");
      bar.addClass("ng-weekly-fragment-hidden");
      copy.addClass("ng-weekly-fragment-hidden");
      symptomBlocks.push({ block, name, bar, copy });
    }
    const emotions = wrap.createDiv({ cls: "ng-weekly-section" });
    emotions.createEl("h4", { text: "Emotions", cls: "ng-weekly-section-heading" });
    const emotionalBalance = frontmatter.emotionCounts.pleasantTotal - frontmatter.emotionCounts.unpleasantTotal;
    const polarity = Math.max(-100, Math.min(100, emotionalBalance * 12));
    const balance = emotions.createDiv({ cls: "ng-weekly-emotion-balance" });
    const pointer = balance.createDiv({ cls: "ng-weekly-emotion-pointer" });
    pointer.style.left = `${50 + polarity / 2}%`;
    const emotionCounters = emotions.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-emotion-counters" });
    emotionCounters.createSpan({ text: `Unpleasant Emotions: ${frontmatter.emotionCounts.unpleasantTotal}` });
    emotionCounters.createSpan({ cls: "ng-weekly-emotion-counters-sep", text: "\xB7" });
    emotionCounters.createSpan({ text: `Pleasant Emotions: ${frontmatter.emotionCounts.pleasantTotal}` });
    const emotionCloud = emotions.createDiv({ cls: "ng-weekly-emotion-cloud" });
    const emotionTokens = renderMixedEmotionCloud(emotionCloud, frontmatter.emotionCounts.unpleasant, frontmatter.emotionCounts.pleasant);
    emotionTokens.forEach((token) => token.addClass("ng-weekly-fragment-hidden"));
    const trackers = wrap.createDiv({ cls: "ng-weekly-section" });
    trackers.createEl("h4", { text: "Tracker", cls: "ng-weekly-section-heading" });
    const trackerRows = Object.entries(frontmatter.trackerCounts).sort((a, b) => b[1] - a[1]).filter(([, count]) => count > 0);
    if (trackerRows.length === 0) {
      trackers.createDiv({ cls: "ng-empty", text: "No tracker activity in this week." });
    } else {
      const maxCount = trackerRows[0][1];
      const cloud = trackers.createDiv({ cls: "ng-weekly-tracker-cloud" });
      for (const [name, count] of trackerRows) {
        const row = cloud.createDiv({ cls: "ng-weekly-tracker-pill ng-weekly-fragment-hidden" });
        const label = row.createSpan({ text: `${name} \xB7 ${count}` });
        const size = Math.min(1.12, 0.65 + count / Math.max(1, maxCount) * 0.43);
        label.style.fontSize = `${size}rem`;
        if (count === maxCount && maxCount > 0) {
          row.addClass("is-winner");
        }
        row.style.animationDuration = `${6 + Math.random() * 5}s`;
        row.style.animationDelay = `${Math.random() * 1.4}s`;
      }
    }
    const support = wrap.createDiv({ cls: "ng-weekly-section" });
    support.dataset.weeklySection = "support";
    const supportHeading = support.createEl("h4", { text: "Support Notes", cls: "ng-weekly-section-heading" });
    const supportCopy = support.createDiv({
      cls: "ng-weekly-inline-copy",
      text: "Considering your current situation, you should take a look at the following notes."
    });
    supportCopy.addClass("ng-weekly-support-intro");
    supportHeading.addClass("ng-weekly-fragment-hidden");
    supportCopy.addClass("ng-weekly-fragment-hidden");
    const supportNoteFragments = [];
    const supportRemainderRows = [];
    if (frontmatter.supportNotes.length === 0) {
      const empty = support.createDiv({ cls: "ng-empty", text: "No support notes triggered." });
      empty.addClass("ng-weekly-fragment-hidden");
      supportRemainderRows.push({ row: empty, elements: [empty] });
    } else {
      for (const note of frontmatter.supportNotes) {
        const reason = (_a = frontmatter.supportNoteReasons[note]) != null ? _a : "symptom support";
        const row = support.createDiv({ cls: "ng-weekly-support-row ng-weekly-fragment-hidden" });
        const link = row.createSpan({ cls: "ng-weekly-support-link", text: note });
        link.addClass("ng-weekly-fragment-hidden");
        link.setAttribute("role", "button");
        link.setAttribute("tabindex", "0");
        link.addEventListener("click", async () => {
          const target = this.app.vault.getMarkdownFiles().find((file) => file.basename === note && file.path.startsWith(`${NOTES_FOLDER}/`));
          if (!target) {
            new import_obsidian7.Notice(`Support note not found: ${note}`);
            return;
          }
          await this.app.workspace.getLeaf(true).openFile(target);
        });
        link.addEventListener("keydown", async (event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }
          event.preventDefault();
          const target = this.app.vault.getMarkdownFiles().find((file) => file.basename === note && file.path.startsWith(`${NOTES_FOLDER}/`));
          if (!target) {
            new import_obsidian7.Notice(`Support note not found: ${note}`);
            return;
          }
          await this.app.workspace.getLeaf(true).openFile(target);
        });
        const reasonEl = row.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-fragment-hidden ng-weekly-support-reason", text: `Triggered by: ${reason}` });
        supportNoteFragments.push({ row, note: link, reason: reasonEl });
      }
      for (const symptom of frontmatter.missingSupportSymptoms) {
        const row = support.createDiv({ cls: "ng-weekly-support-row ng-weekly-fragment-hidden" });
        const item = row.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-fragment-hidden", text: `${symptom}: consider creating a support note for this.` });
        supportRemainderRows.push({ row, elements: [item] });
      }
      const criticalEntries = Object.entries(frontmatter.criticalDays).filter(([, days]) => days.length > 0);
      if (criticalEntries.length > 0) {
        const criticalBlock = support.createDiv({ cls: "ng-weekly-support-row ng-weekly-fragment-hidden" });
        const fragments = [];
        const title = criticalBlock.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-critical-title ng-weekly-fragment-hidden", text: "Critical days:" });
        fragments.push(title);
        for (const [symptom, days] of criticalEntries) {
          const line = criticalBlock.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-critical-line ng-weekly-fragment-hidden", text: `${symptom}: ${days.join(", ")}` });
          fragments.push(line);
        }
        supportRemainderRows.push({ row: criticalBlock, elements: fragments });
      }
    }
    const tasks = wrap.createDiv({ cls: "ng-weekly-section" });
    tasks.createEl("h4", { text: "Tasks", cls: "ng-weekly-section-heading" });
    renderTaskDeltaLine(tasks, "Weekly energy capacity", frontmatter.taskAdjustments.maxEnergy.from, frontmatter.taskAdjustments.maxEnergy.to, 200);
    renderTaskDeltaLine(tasks, "Break frequency", frontmatter.taskAdjustments.forcedBreakThreshold.from, frontmatter.taskAdjustments.forcedBreakThreshold.to, 100);
    renderTaskDeltaLine(tasks, "Break length", frontmatter.taskAdjustments.forcedBreakLength.from, frontmatter.taskAdjustments.forcedBreakLength.to, 60);
    const seeds = wrap.createDiv({ cls: "ng-weekly-section" });
    seeds.createEl("h4", { text: "Next Month's Topics", cls: "ng-weekly-section-heading" });
    seeds.createDiv({
      cls: "ng-weekly-inline-copy",
      text: "These two short topics seed your next Monthly Reflection so you can revisit what mattered across the month."
    });
    if (((_b = frontmatter.seeds) != null ? _b : []).length >= 2) {
      for (const seed of frontmatter.seeds) {
        seeds.createDiv({ cls: "ng-weekly-support-chip", text: seed });
      }
    } else {
      const row = seeds.createDiv({ cls: "ng-weekly-seed-form" });
      const one = row.createEl("input", { type: "text", placeholder: "Topic 1" });
      const two = row.createEl("input", { type: "text", placeholder: "Topic 2" });
      one.maxLength = 15;
      two.maxLength = 15;
      one.addClass("ng-task-input");
      two.addClass("ng-task-input");
      const submit = row.createEl("button", { text: "Save Topics", cls: "ng-weekly-seed-submit" });
      submit.addEventListener("click", async () => {
        const seedOne = one.value.slice(0, 15);
        const seedTwo = two.value.slice(0, 15);
        if (!seedOne || !seedTwo || !this.currentFilePath || !this.currentFrontmatter) {
          new import_obsidian7.Notice("Please fill both topics.");
          return;
        }
        this.currentFrontmatter.seeds = [seedOne, seedTwo];
        const file = this.app.vault.getAbstractFileByPath(this.currentFilePath);
        if (!(file instanceof import_obsidian7.TFile)) {
          return;
        }
        await this.journalingStorage.saveWeeklyRecap(file, this.currentFrontmatter, this.currentBody);
        await this.renderRecap(this.currentFrontmatter, false);
      });
    }
    const sections = [symptoms, emotions, trackers, support, tasks, seeds];
    if (animateIn) {
      this.supportRevealPlayed = false;
      this.revealTimeouts.forEach((id) => window.clearTimeout(id));
      this.revealTimeouts = [];
      sections.slice(1).forEach((section) => section.addClass("ng-weekly-scroll-hidden"));
      await this.playSymptomBuildup(symptoms, symptomBlocks);
      await this.playSequentialSectionReveal(
        [emotions, trackers, support, tasks, seeds],
        support,
        supportHeading,
        supportCopy,
        emotionTokens,
        supportNoteFragments,
        supportRemainderRows
      );
      return;
    }
    this.revealAllImmediate(
      symptomBlocks,
      supportHeading,
      supportCopy,
      supportNoteFragments,
      supportRemainderRows,
      sections.slice(1)
    );
  }
  async playSymptomBuildup(section, blocks) {
    var _a;
    section.addClass("is-visible");
    for (const row of blocks) {
      row.name.removeClass("ng-weekly-fragment-hidden");
      await wait(320);
      row.bar.removeClass("ng-weekly-fragment-hidden");
      await wait(90);
      const fill = row.bar.querySelector(".ng-journal-progress-fill");
      if (fill) {
        const target = Number.parseFloat((_a = fill.dataset.targetWidth) != null ? _a : "0");
        fill.style.width = `${target}%`;
      }
      await wait(360);
      row.copy.removeClass("ng-weekly-fragment-hidden");
      await wait(320);
    }
  }
  async playSupportSequentialReveal(heading, copy, noteFragments, remainderRows) {
    heading.removeClass("ng-weekly-fragment-hidden");
    await wait(700);
    copy.removeClass("ng-weekly-fragment-hidden");
    await wait(1e3);
    for (const fragment of noteFragments) {
      fragment.row.removeClass("ng-weekly-fragment-hidden");
      fragment.note.removeClass("ng-weekly-fragment-hidden");
    }
    await wait(650);
    for (const fragment of noteFragments) {
      fragment.reason.removeClass("ng-weekly-fragment-hidden");
    }
    await wait(450);
    for (const row of remainderRows) {
      row.row.removeClass("ng-weekly-fragment-hidden");
      for (const element of row.elements) {
        element.removeClass("ng-weekly-fragment-hidden");
        await wait(140);
      }
      await wait(180);
    }
  }
  async playSequentialSectionReveal(orderedSections, supportSection, supportHeading, supportCopy, emotionTokens, supportNoteFragments, supportRemainderRows) {
    var _a;
    (_a = this.sectionObserver) == null ? void 0 : _a.disconnect();
    for (let index = 0; index < orderedSections.length; index += 1) {
      const section = orderedSections[index];
      await this.waitForSectionReady(section, 2200 + index * 1400);
      section.classList.add("is-visible");
      section.classList.remove("ng-weekly-scroll-hidden");
      if (index === 0) {
        await this.revealEmotionTokens(emotionTokens);
      }
      if (index === 1) {
        await this.revealTrackerBubbles(section);
      }
      if (section === supportSection && !this.supportRevealPlayed) {
        this.supportRevealPlayed = true;
        await this.playSupportSequentialReveal(
          supportHeading,
          supportCopy,
          supportNoteFragments,
          supportRemainderRows
        );
      }
      if (index < orderedSections.length - 1) {
        await wait(260);
      }
    }
  }
  async revealEmotionTokens(tokens) {
    await this.revealBubbles(tokens);
  }
  async revealTrackerBubbles(section) {
    const pills = shuffle(Array.from(section.querySelectorAll(".ng-weekly-tracker-pill")));
    await this.revealBubbles(pills);
  }
  async revealBubbles(bubbles) {
    for (const bubble of shuffle(bubbles)) {
      bubble.style.animationName = "none";
      const animation = bubble.animate([
        { opacity: 0, transform: "scale(0.45) translateY(10px)" },
        { opacity: 1, transform: "scale(1.08) translateY(-1px)", offset: 0.78 },
        { opacity: 1, transform: "scale(1) translateY(0)" }
      ], {
        duration: 640,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)"
      });
      bubble.removeClass("ng-weekly-fragment-hidden");
      animation.addEventListener("finish", () => {
        bubble.style.animationName = "ng-weekly-float";
      }, { once: true });
      await wait(randomBetween(120, 190));
    }
  }
  async waitForSectionReady(section, fallbackMs) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        observer.disconnect();
        window.clearTimeout(timeoutId);
        resolve();
      };
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === section && entry.isIntersecting) {
            finish();
            break;
          }
        }
      }, { root: null, threshold: 0.25 });
      observer.observe(section);
      const timeoutId = window.setTimeout(finish, fallbackMs * WEEKLY_ANIMATION_SCALE);
      this.revealTimeouts.push(timeoutId);
    });
  }
  revealAllImmediate(blocks, supportHeading, supportCopy, supportNoteFragments, supportRemainderRows, tailSections) {
    var _a;
    for (const row of blocks) {
      row.name.removeClass("ng-weekly-fragment-hidden");
      row.bar.removeClass("ng-weekly-fragment-hidden");
      row.copy.removeClass("ng-weekly-fragment-hidden");
      const fill = row.bar.querySelector(".ng-journal-progress-fill");
      if (fill) {
        const target = Number.parseFloat((_a = fill.dataset.targetWidth) != null ? _a : "0");
        fill.style.width = `${target}%`;
      }
    }
    supportHeading.removeClass("ng-weekly-fragment-hidden");
    supportCopy.removeClass("ng-weekly-fragment-hidden");
    supportNoteFragments.forEach((fragment) => {
      fragment.row.removeClass("ng-weekly-fragment-hidden");
      fragment.note.removeClass("ng-weekly-fragment-hidden");
      fragment.reason.removeClass("ng-weekly-fragment-hidden");
    });
    supportRemainderRows.forEach((row) => {
      row.row.removeClass("ng-weekly-fragment-hidden");
      row.elements.forEach((element) => element.removeClass("ng-weekly-fragment-hidden"));
    });
    tailSections.forEach((section) => {
      section.classList.add("is-visible");
      section.classList.remove("ng-weekly-scroll-hidden");
      section.dataset.weeklyRevealed = "true";
      section.querySelectorAll(".ng-weekly-emotion-token, .ng-weekly-tracker-pill").forEach((bubble) => {
        bubble.removeClass("ng-weekly-fragment-hidden");
      });
    });
  }
};
function renderMixedEmotionCloud(container, negative, positive) {
  const entries = [
    ...Object.entries(negative).map(([emotion, count]) => ({ emotion, count, positive: false })),
    ...Object.entries(positive).map(([emotion, count]) => ({ emotion, count, positive: true }))
  ].sort((a, b) => b.count - a.count || Math.random() - 0.5);
  if (entries.length === 0) {
    container.createDiv({ cls: "ng-weekly-inline-copy", text: "No emotions logged." });
    return [];
  }
  const max = entries[0].count;
  const tokens = [];
  for (const entry of entries) {
    const chip = container.createSpan({ cls: `ng-weekly-emotion-token ${entry.positive ? "is-positive" : "is-negative"}`, text: entry.emotion });
    const count = entry.count;
    const scale = 0.85 + count / Math.max(1, max) * 0.95;
    chip.style.fontSize = `${scale}rem`;
    chip.style.animationDuration = `${6 + Math.random() * 4}s`;
    chip.style.animationDelay = `${Math.random() * 1.3}s`;
    tokens.push(chip);
  }
  return tokens;
}
function weeklyMetricColor2(value, highIsBad) {
  const v = Math.max(0, Math.min(100, value));
  if (highIsBad) {
    if (v >= 80) return "#FF6565";
    if (v >= 60) return "#F0A04C";
    if (v >= 40) return "#F4D35E";
    return "#39E05A";
  }
  if (v >= 80) return "#39E05A";
  if (v >= 60) return "#A8D56E";
  if (v >= 40) return "#F4D35E";
  return "#FF6565";
}
function describeSymptom(label, value, highIsBad) {
  const v = Math.round(value);
  if (highIsBad) {
    if (v >= 80) return `${label} has been very high this week. Please prioritize recovery.`;
    if (v >= 60) return `${label} has been elevated. Keep support routines close.`;
    if (v >= 40) return `${label} has been manageable, with some pressure.`;
    return `${label} looks stable this week.`;
  }
  if (v >= 80) return `Your ${label.toLowerCase()} has been great. Keep what helps you grounded.`;
  if (v >= 60) return `Your ${label.toLowerCase()} has been good and fairly stable.`;
  if (v >= 40) return `${label} was mixed this week. Gentle consistency may help.`;
  return `${label} has been low. Extra care and support could help next week.`;
}
function deltaLine(from, to, maxValue) {
  if (typeof maxValue === "number" && to >= maxValue - 0.01) {
    return "at-max";
  }
  if (Math.abs(from - to) < 0.01) {
    return "unchanged";
  }
  return to > from ? "increased" : "decreased";
}
function renderTaskDeltaLine(parent, label, from, to, maxValue) {
  const status = deltaLine(from, to, maxValue);
  const row = parent.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-task-status" });
  row.createSpan({ text: `${label}: ` });
  row.createSpan({ cls: `ng-weekly-task-status-value is-${status}`, text: status === "at-max" ? "at maximum" : status });
}
function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms * WEEKLY_ANIMATION_SCALE));
}
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

// src/journalingStorage.ts
var import_obsidian8 = require("obsidian");
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
    if (!(file instanceof import_obsidian8.TFile)) {
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
  async ensureWeeklyRecapFile(year, week) {
    const path = this.weeklyRecapPath(year, week);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian8.TFile) {
      return existing;
    }
    await this.ensureFolderExists(JOURNAL_WEEKLY_FOLDER);
    const frontmatter = defaultWeeklyFrontmatter(year, week);
    try {
      return await this.app.vault.create(path, `${this.serializeFrontmatter(frontmatter)}
`);
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(path);
      if (createdByOtherCall instanceof import_obsidian8.TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create weekly recap at ${path}`);
    }
  }
  async readWeeklyRecap(file) {
    const content = await this.app.vault.read(file);
    const frontmatter = normalizeWeeklyFrontmatter(this.extractFrontmatter(content));
    const body = content.replace(FRONTMATTER_REGEX, "").replace(/^\s+|\s+$/g, "");
    return { frontmatter, body };
  }
  async saveWeeklyRecap(file, frontmatter, body) {
    const content = `${this.serializeFrontmatter(frontmatter)}
${body.replace(/^\s+/, "")}`;
    await this.app.vault.modify(file, content.replace(/\s+$/, "") + "\n");
  }
  weeklyRecapPath(year, week) {
    return `${JOURNAL_WEEKLY_FOLDER}/${year}-W${String(week).padStart(2, "0")}.md`;
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
    const dates = existing instanceof import_obsidian8.TFile ? (await this.readTracker(existing)).dates : [];
    const file = existing instanceof import_obsidian8.TFile ? existing : await this.createTrackerFile(path, name, color, dates);
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
    if (existing instanceof import_obsidian8.TFile) {
      return existing;
    }
    await this.ensureFolderExists(JOURNAL_DAILY_FOLDER);
    try {
      return await this.app.vault.create(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`, this.buildDailyContent(defaultDailyFrontmatter(dateKey), ""));
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
      if (createdByOtherCall instanceof import_obsidian8.TFile) {
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
      if (createdByOtherCall instanceof import_obsidian8.TFile) {
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
    const parsed = (0, import_obsidian8.parseYaml)(match[0].replace(/^---\n|\n---\n?$/g, ""));
    return parsed != null ? parsed : {};
  }
  extractEntryBody(content) {
    const withoutFrontmatter = content.replace(FRONTMATTER_REGEX, "");
    return withoutFrontmatter.replace(ENTRY_HEADING_REGEX, "").replace(/\s+$/, "");
  }
  serializeFrontmatter(frontmatter) {
    return `---
${(0, import_obsidian8.stringifyYaml)(frontmatter).replace(/\s+$/, "")}
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
      goodThing: stringOr(raw.goodThing, ""),
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
    goodThing: "",
    emotions: []
  };
}
function defaultWeeklyFrontmatter(year, week) {
  return {
    week,
    year,
    generatedAt: "",
    processedDateRange: { start: "", end: "" },
    journalLinks: [],
    supportNotes: [],
    supportNoteReasons: {},
    missingSupportSymptoms: [],
    criticalDays: {},
    supportHints: [],
    seeds: [],
    averages: {
      mood: 0,
      sleep: 0,
      regulation: 0,
      stress: 0,
      anxiety: 0,
      exhaustion: 0,
      sensoryLoad: 0,
      socialLoad: 0
    },
    emotionCounts: {
      pleasant: {},
      unpleasant: {},
      pleasantTotal: 0,
      unpleasantTotal: 0
    },
    trackerCounts: {},
    taskAdjustments: {
      maxEnergy: { from: 100, to: 100 },
      forcedBreakThreshold: { from: 70, to: 70 },
      forcedBreakLength: { from: 20, to: 20 }
    }
  };
}
function normalizeWeeklyFrontmatter(raw) {
  const year = numberOr2(raw.year, (/* @__PURE__ */ new Date()).getFullYear());
  const week = numberOr2(raw.week, 1);
  const defaults = defaultWeeklyFrontmatter(year, week);
  const averagesRaw = raw.averages && typeof raw.averages === "object" ? raw.averages : {};
  const emotionRaw = raw.emotionCounts && typeof raw.emotionCounts === "object" ? raw.emotionCounts : {};
  const taskRaw = raw.taskAdjustments && typeof raw.taskAdjustments === "object" ? raw.taskAdjustments : {};
  const processedRangeRaw = raw.processedDateRange && typeof raw.processedDateRange === "object" ? raw.processedDateRange : {};
  const journalLinks = stringArrayOr(raw.journalLinks);
  const derivedRange = deriveProcessedDateRangeFromLinks(journalLinks);
  return {
    week,
    year,
    generatedAt: stringOr(raw.generatedAt, ""),
    processedDateRange: {
      start: stringOr(processedRangeRaw.start, derivedRange.start),
      end: stringOr(processedRangeRaw.end, derivedRange.end)
    },
    journalLinks,
    supportNotes: stringArrayOr(raw.supportNotes),
    supportNoteReasons: normalizeStringMap(raw.supportNoteReasons),
    missingSupportSymptoms: stringArrayOr(raw.missingSupportSymptoms),
    criticalDays: normalizeStringArrayMap(raw.criticalDays),
    supportHints: stringArrayOr(raw.supportHints),
    seeds: stringArrayOr(raw.seeds),
    averages: {
      mood: numberOr2(averagesRaw.mood, defaults.averages.mood),
      sleep: numberOr2(averagesRaw.sleep, defaults.averages.sleep),
      regulation: numberOr2(averagesRaw.regulation, defaults.averages.regulation),
      stress: numberOr2(averagesRaw.stress, defaults.averages.stress),
      anxiety: numberOr2(averagesRaw.anxiety, defaults.averages.anxiety),
      exhaustion: numberOr2(averagesRaw.exhaustion, defaults.averages.exhaustion),
      sensoryLoad: numberOr2(averagesRaw.sensoryLoad, defaults.averages.sensoryLoad),
      socialLoad: numberOr2(averagesRaw.socialLoad, defaults.averages.socialLoad)
    },
    emotionCounts: {
      pleasant: normalizeCountMap(emotionRaw.pleasant),
      unpleasant: normalizeCountMap(emotionRaw.unpleasant),
      pleasantTotal: numberOr2(emotionRaw.pleasantTotal, defaults.emotionCounts.pleasantTotal),
      unpleasantTotal: numberOr2(emotionRaw.unpleasantTotal, defaults.emotionCounts.unpleasantTotal)
    },
    trackerCounts: normalizeCountMap(raw.trackerCounts),
    taskAdjustments: {
      maxEnergy: normalizeDelta(taskRaw.maxEnergy, defaults.taskAdjustments.maxEnergy),
      forcedBreakThreshold: normalizeDelta(taskRaw.forcedBreakThreshold, defaults.taskAdjustments.forcedBreakThreshold),
      forcedBreakLength: normalizeDelta(taskRaw.forcedBreakLength, defaults.taskAdjustments.forcedBreakLength)
    }
  };
}
function deriveProcessedDateRangeFromLinks(journalLinks) {
  const dateKeys = journalLinks.map((link) => {
    var _a;
    const match = link.match(/\[\[(\d{4}-\d{2}-\d{2})\]\]/);
    return (_a = match == null ? void 0 : match[1]) != null ? _a : "";
  }).filter((value) => value.length > 0).sort();
  if (dateKeys.length === 0) {
    return { start: "", end: "" };
  }
  return { start: dateKeys[0], end: dateKeys[dateKeys.length - 1] };
}
function normalizeCountMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map = {};
  for (const [key, raw] of Object.entries(value)) {
    map[key] = numberOr2(raw, 0);
  }
  return map;
}
function normalizeStringMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string") {
      map[key] = raw;
    }
  }
  return map;
}
function normalizeStringArrayMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map = {};
  for (const [key, raw] of Object.entries(value)) {
    map[key] = stringArrayOr(raw);
  }
  return map;
}
function normalizeDelta(value, fallback) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }
  const record = value;
  return {
    from: numberOr2(record.from, fallback.from),
    to: numberOr2(record.to, fallback.to)
  };
}
function sanitizeFileName(name) {
  const cleaned = name.trim().replace(/[\\/:*?"<>|#^]/g, "-").replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : "Untitled Tracker";
}
function stringOr(value, fallback) {
  return typeof value === "string" ? value : fallback;
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

// src/myNotesStorage.ts
var import_obsidian9 = require("obsidian");
function stripLink(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}
function toLink(name) {
  return `[[${name}]]`;
}
function parseCategoryMap(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "{}") {
    return {};
  }
  const inner = trimmed.replace(/^\{/, "").replace(/\}$/, "");
  const entries = {};
  for (const part of inner.split(",")) {
    const [rawName, rawCount] = part.split(":");
    if (!rawName || !rawCount) {
      continue;
    }
    const name = rawName.trim().replace(/^['"]|['"]$/g, "");
    const count = Number(rawCount.trim());
    entries[name] = Number.isFinite(count) ? Math.max(0, count) : 0;
  }
  return entries;
}
function parseCategoriesFromText(text) {
  var _a, _b;
  const lines = text.split(/\r?\n/);
  const frontmatterStart = lines.indexOf("---");
  if (frontmatterStart < 0) {
    return {};
  }
  let inCategories = false;
  const block = [];
  for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      break;
    }
    if (!inCategories) {
      const match = line.match(/^categories:\s*(.*)$/);
      if (!match) {
        continue;
      }
      const inlineValue = (_b = (_a = match[1]) == null ? void 0 : _a.trim()) != null ? _b : "";
      if (inlineValue) {
        return parseCategoryMap(inlineValue);
      }
      inCategories = true;
      continue;
    }
    if (/^\S/.test(line)) {
      break;
    }
    const entry = line.match(/^\s{2}([^:]+):\s*(.*)$/);
    if (entry) {
      block.push(`${entry[1].trim()}: ${entry[2].trim()}`);
    }
  }
  return parseCategoryMap(`{${block.join(",")}}`);
}
function parseNoteCategoriesFromText(text) {
  var _a, _b;
  const lines = text.split(/\r?\n/);
  const frontmatterStart = lines.indexOf("---");
  if (frontmatterStart < 0) {
    return [];
  }
  let inCategoryBlock = false;
  const categories = [];
  for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      break;
    }
    if (!inCategoryBlock) {
      const match = line.match(/^category:\s*(.*)$/);
      if (!match) {
        continue;
      }
      const inlineValue = (_b = (_a = match[1]) == null ? void 0 : _a.trim()) != null ? _b : "";
      if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
        const inner = inlineValue.slice(1, -1);
        for (const entry2 of inner.split(",")) {
          const clean = stripLink(entry2.trim().replace(/^['"]|['"]$/g, ""));
          if (clean) {
            categories.push(clean);
          }
        }
        return categories;
      }
      inCategoryBlock = true;
      continue;
    }
    if (/^\S/.test(line)) {
      break;
    }
    const entry = line.match(/^\s*-\s*(.*)$/);
    if (entry) {
      const clean = stripLink(entry[1].trim().replace(/^['"]|['"]$/g, ""));
      if (clean) {
        categories.push(clean);
      }
    }
  }
  return categories;
}
function parseSupportFromText(text) {
  var _a, _b;
  const lines = text.split(/\r?\n/);
  const frontmatterStart = lines.indexOf("---");
  if (frontmatterStart < 0) {
    return [];
  }
  let inSupportBlock = false;
  const supports = [];
  for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      break;
    }
    if (!inSupportBlock) {
      const match = line.match(/^support:\s*(.*)$/);
      if (!match) {
        continue;
      }
      const inlineValue = (_b = (_a = match[1]) == null ? void 0 : _a.trim()) != null ? _b : "";
      if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
        const inner = inlineValue.slice(1, -1);
        for (const entry2 of inner.split(",")) {
          const clean = entry2.trim().replace(/^['"]|['"]$/g, "");
          if (clean) {
            supports.push(clean);
          }
        }
        return supports;
      }
      inSupportBlock = true;
      continue;
    }
    if (/^\S/.test(line)) {
      break;
    }
    const entry = line.match(/^\s*-\s*(.*)$/);
    if (entry) {
      const clean = entry[1].trim().replace(/^['"]|['"]$/g, "");
      if (clean) {
        supports.push(clean);
      }
    }
  }
  return supports;
}
var MyNotesStorage = class {
  constructor(app) {
    this.app = app;
  }
  toCategoryLinks(names) {
    return names.map((name) => toLink(name));
  }
  async ensureCategoriesFile() {
    const existing = this.app.vault.getAbstractFileByPath(MY_NOTES_CATEGORIES_FILE_PATH);
    if (existing instanceof import_obsidian9.TFile) {
      return existing;
    }
    await this.ensureFolderExists(MY_NOTES_MAINTENANCE_FOLDER);
    try {
      return await this.app.vault.create(MY_NOTES_CATEGORIES_FILE_PATH, "---\ncategories: {}\n---\n# Categories\n");
    } catch (e) {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(MY_NOTES_CATEGORIES_FILE_PATH);
      if (createdByOtherCall instanceof import_obsidian9.TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create categories file at ${MY_NOTES_CATEGORIES_FILE_PATH}`);
    }
  }
  async loadCategories() {
    const file = await this.ensureCategoriesFile();
    const text = await this.app.vault.read(file);
    const raw = parseCategoriesFromText(text);
    const categories = [];
    for (const [name, count] of Object.entries(raw)) {
      categories.push({ name, count });
    }
    return categories;
  }
  async addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const file = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories) ? fm.categories : {};
      if (!(trimmed in categories)) {
        categories[trimmed] = 0;
      }
      fm.categories = categories;
    });
  }
  async renameCategory(previousName, nextName) {
    const previous = previousName.trim();
    const next = nextName.trim();
    if (!previous || !next) {
      return false;
    }
    if (previous === next) {
      return true;
    }
    const file = await this.ensureCategoriesFile();
    let renamed = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories) ? fm.categories : {};
      if (!(previous in categories) || next in categories) {
        return;
      }
      const nextCategories = {};
      for (const [name, count] of Object.entries(categories)) {
        if (name === previous) {
          nextCategories[next] = count;
        } else {
          nextCategories[name] = count;
        }
      }
      fm.categories = nextCategories;
      renamed = true;
    });
    if (!renamed) {
      return false;
    }
    for (const note of await this.notesInCategory(previous)) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = Array.isArray(fm.category) ? fm.category.map(stripLink).filter(Boolean) : [];
        if (!current.includes(previous)) {
          return;
        }
        fm.category = this.toCategoryLinks(current.map((name) => name === previous ? next : name));
      });
    }
    return true;
  }
  async deleteCategory(name) {
    const target = name.trim();
    if (!target) {
      return false;
    }
    const file = await this.ensureCategoriesFile();
    let removed = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories) ? fm.categories : {};
      if (!(target in categories)) {
        return;
      }
      delete categories[target];
      fm.categories = categories;
      removed = true;
    });
    if (!removed) {
      return false;
    }
    for (const note of await this.notesInCategory(target)) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = Array.isArray(fm.category) ? fm.category.map(stripLink).filter(Boolean) : [];
        if (!current.includes(target)) {
          return;
        }
        fm.category = this.toCategoryLinks(current.filter((entry) => entry !== target));
      });
    }
    return true;
  }
  async adjustCategoryCount(name, delta) {
    const file = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories) ? fm.categories : {};
      const current = typeof categories[name] === "number" ? categories[name] : 0;
      categories[name] = Math.max(0, current + delta);
      fm.categories = categories;
    });
  }
  listNotes() {
    return this.app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(`${NOTES_FOLDER}/`)).sort((a, b) => a.basename.localeCompare(b.basename));
  }
  isNoteFile(file) {
    return !!file && file.extension === "md" && file.path.startsWith(`${NOTES_FOLDER}/`);
  }
  noteExists(name) {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return false;
    }
    return this.app.vault.getAbstractFileByPath(`${NOTES_FOLDER}/${trimmed}.md`) instanceof import_obsidian9.TFile;
  }
  async createNote(name) {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return null;
    }
    const path = `${NOTES_FOLDER}/${trimmed}.md`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian9.TFile) {
      return existing;
    }
    await this.ensureFolderExists(NOTES_FOLDER);
    return await this.app.vault.create(path, "");
  }
  async deleteNote(file) {
    const categories = this.getNoteCategories(file);
    await this.app.vault.trash(file, true);
    for (const category of categories) {
      await this.adjustCategoryCount(category, -1);
    }
  }
  sanitizeNoteName(name) {
    return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  }
  getNoteCategories(file) {
    var _a, _b;
    const raw = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.category;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map(stripLink).filter(Boolean);
  }
  async getNoteCategoriesFresh(file) {
    const text = await this.app.vault.read(file);
    return parseNoteCategoriesFromText(text);
  }
  async toggleNoteCategory(file, name) {
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = Array.isArray(fm.category) ? fm.category.map(stripLink).filter(Boolean) : [];
      if (current.includes(name)) {
        fm.category = current.filter((entry) => entry !== name).map(toLink);
        nowActive = false;
      } else {
        fm.category = [...current, name].map(toLink);
        nowActive = true;
      }
    });
    await this.adjustCategoryCount(name, nowActive ? 1 : -1);
    return nowActive;
  }
  isFavourite(file) {
    var _a, _b;
    return ((_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.favourite) === true;
  }
  async toggleFavourite(file) {
    let nowFavourite = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      nowFavourite = fm.favourite !== true;
      fm.favourite = nowFavourite;
    });
    return nowFavourite;
  }
  isSupportNote(file) {
    var _a, _b;
    return ((_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.SupportNote) === true;
  }
  async isSupportNoteFresh(file) {
    const text = await this.app.vault.read(file);
    const lines = text.split(/\r?\n/);
    const frontmatterStart = lines.indexOf("---");
    if (frontmatterStart < 0) {
      return false;
    }
    for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line === "---") {
        break;
      }
      const match = line.match(/^SupportNote:\s*(true|false)$/i);
      if (match) {
        return match[1].toLowerCase() === "true";
      }
    }
    return false;
  }
  async setSupportNote(file, value) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.SupportNote = value;
      if (!value) {
        delete fm.support;
      }
    });
  }
  getNoteSupports(file) {
    var _a, _b;
    const raw = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.support;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter((entry) => typeof entry === "string");
  }
  async getNoteSupportsFresh(file) {
    const text = await this.app.vault.read(file);
    return parseSupportFromText(text);
  }
  async toggleNoteSupport(file, name) {
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = Array.isArray(fm.support) ? fm.support.filter((entry) => typeof entry === "string") : [];
      if (current.includes(name)) {
        fm.support = current.filter((entry) => entry !== name);
        nowActive = false;
      } else {
        fm.support = [...current, name];
        nowActive = true;
      }
    });
    return nowActive;
  }
  async notesInCategory(name) {
    const files = this.listNotes();
    const matches = [];
    for (const file of files) {
      const text = await this.app.vault.read(file);
      if (parseNoteCategoriesFromText(text).includes(name)) {
        matches.push(file);
      }
    }
    return matches;
  }
  favouriteNotes() {
    return this.listNotes().filter((file) => this.isFavourite(file));
  }
  notesWithSupport(name) {
    return this.listNotes().filter((file) => this.isSupportNote(file) && this.getNoteSupports(file).includes(name));
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
        if (message.toLowerCase().includes("already exists") || this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
        throw error;
      }
    }
  }
};

// src/noteHeader.ts
var import_obsidian10 = require("obsidian");
var NoteHeaderManager = class {
  constructor(app, myNotesStorage, myLearningStorage, openHomeView, openMyNotesView, openMyLearningView) {
    this.app = app;
    this.myNotesStorage = myNotesStorage;
    this.myLearningStorage = myLearningStorage;
    this.openHomeView = openHomeView;
    this.openMyNotesView = openMyNotesView;
    this.openMyLearningView = openMyLearningView;
    this.headerDisposers = /* @__PURE__ */ new WeakMap();
  }
  sync() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!(view instanceof import_obsidian10.MarkdownView)) {
        continue;
      }
      const content = view.containerEl.querySelector(".view-content");
      if (!(content instanceof HTMLElement)) {
        continue;
      }
      const existing = content.querySelector(":scope > .ng-note-header");
      const file = view.file;
      if (!file) {
        this.disposeHeader(existing);
        existing == null ? void 0 : existing.remove();
        content.removeClass("ng-mynotes-header-host");
        continue;
      }
      const isMyNotesFile = this.myNotesStorage.isNoteFile(file);
      const isMyLearningFile = this.myLearningStorage.isLearningNoteFile(file);
      if (!isMyNotesFile && !isMyLearningFile) {
        this.disposeHeader(existing);
        existing == null ? void 0 : existing.remove();
        content.removeClass("ng-mynotes-header-host");
        continue;
      }
      const headerKind = isMyNotesFile ? "mynotes" : "mylearning";
      if (existing instanceof HTMLElement && existing.getAttribute("data-path") === file.path && existing.getAttribute("data-kind") === headerKind) {
        continue;
      }
      this.disposeHeader(existing);
      existing == null ? void 0 : existing.remove();
      if (isMyNotesFile) {
        void this.renderMyNotesHeader(content, leaf, file);
      } else if (isMyLearningFile) {
        void this.renderMyLearningHeader(content, leaf, file);
      } else {
        content.removeClass("ng-mynotes-header-host");
      }
    }
    this.syncCanvasNavigation();
  }
  detachAll() {
    document.querySelectorAll(".ng-note-header, .ng-learning-canvas-controls").forEach((el) => {
      this.disposeHeader(el);
      el.remove();
    });
  }
  syncCanvasNavigation() {
    const canvasLeaves = this.app.workspace.getLeavesOfType("canvas");
    const activeContainers = /* @__PURE__ */ new Set();
    for (const leaf of canvasLeaves) {
      const container = leaf.view.containerEl;
      activeContainers.add(container);
      const state = leaf.getViewState().state;
      const path = typeof (state == null ? void 0 : state.file) === "string" ? state.file : "";
      const file = path ? this.app.vault.getAbstractFileByPath(path) : null;
      const selection = file instanceof import_obsidian10.TFile ? this.myLearningStorage.getCanvasSelection(file) : null;
      const existing = container.querySelector(":scope > .ng-learning-canvas-controls");
      if (!selection) {
        existing == null ? void 0 : existing.remove();
        continue;
      }
      if ((existing == null ? void 0 : existing.dataset.path) === file.path) {
        const fill = existing.querySelector(".ng-learning-progress-fill");
        if (fill) {
          fill.style.width = `${selection.progress}%`;
        }
        continue;
      }
      existing == null ? void 0 : existing.remove();
      const controls = container.createDiv({ cls: "ng-learning-canvas-controls" });
      controls.dataset.path = file.path;
      const button = controls.createEl("button", {
        cls: "ng-learning-canvas-back",
        text: "\u2190 MyLearning"
      });
      button.setAttribute("aria-label", "Back to MyLearning");
      button.addEventListener("click", async () => {
        await this.openMyLearningView(true, leaf, selection.category, selection.topic);
      });
      const progress = controls.createDiv({ cls: "ng-learning-canvas-progress" });
      progress.createSpan({ text: "Progress" });
      const progressTrack = progress.createDiv({ cls: "ng-learning-progress-track" });
      const progressFill = progressTrack.createDiv({ cls: "ng-learning-progress-fill" });
      let currentProgress = selection.progress;
      const syncProgress = (clientX) => {
        const rect = progressTrack.getBoundingClientRect();
        if (rect.width <= 0) {
          return;
        }
        currentProgress = Math.max(0, Math.min(100, Math.round((clientX - rect.left) / rect.width * 100)));
        progressFill.style.width = `${currentProgress}%`;
      };
      progressFill.style.width = `${currentProgress}%`;
      let dragging = false;
      progressTrack.addEventListener("pointerdown", (event) => {
        dragging = true;
        progressTrack.setPointerCapture(event.pointerId);
        syncProgress(event.clientX);
        void this.myLearningStorage.setCanvasProgress(file, currentProgress);
      });
      progressTrack.addEventListener("pointermove", (event) => {
        if (!dragging) {
          return;
        }
        syncProgress(event.clientX);
        void this.myLearningStorage.setCanvasProgress(file, currentProgress);
      });
      progressTrack.addEventListener("pointerup", async (event) => {
        if (!dragging) {
          return;
        }
        dragging = false;
        progressTrack.releasePointerCapture(event.pointerId);
        await this.myLearningStorage.setCanvasProgress(file, currentProgress);
      });
      this.focusCanvasOrigin(leaf.view);
    }
    document.querySelectorAll(".ng-learning-canvas-controls").forEach((controls) => {
      if (!activeContainers.has(controls.parentElement)) {
        controls.remove();
      }
    });
  }
  focusCanvasOrigin(view) {
    const canvas = view.canvas;
    if (!canvas) {
      return;
    }
    window.requestAnimationFrame(() => {
      if (typeof canvas.zoomToBbox === "function") {
        canvas.zoomToBbox({ minX: -500, minY: -350, maxX: 500, maxY: 350 });
        return;
      }
      if (typeof canvas.setViewport === "function") {
        if (canvas.setViewport.length >= 3) {
          canvas.setViewport(0, 0, 1);
        } else {
          canvas.setViewport({ x: 0, y: 0, zoom: 1 });
        }
      }
    });
  }
  disposeHeader(header) {
    var _a;
    if (!(header instanceof HTMLElement)) {
      return;
    }
    (_a = this.headerDisposers.get(header)) == null ? void 0 : _a();
    this.headerDisposers.delete(header);
  }
  resolveScrollHost(content) {
    const cmScroller = content.querySelector(".markdown-source-view.mod-cm6 .cm-scroller");
    if (cmScroller instanceof HTMLElement) {
      return cmScroller;
    }
    return content;
  }
  bindMyNotesCollapseBehavior(content, header) {
    const scrollHost = this.resolveScrollHost(content);
    const stage = header.querySelector(".ng-note-header-stage");
    const fullHeader = header.querySelector(".ng-note-header-full");
    const compactHeader = header.querySelector(".ng-note-header-collapsed-summary");
    let lastTop = scrollHost.scrollTop;
    let collapsed = false;
    let lastTouchY = null;
    let resizeObserver = null;
    const syncStageHeights = () => {
      if (!(stage instanceof HTMLElement) || !(fullHeader instanceof HTMLElement) || !(compactHeader instanceof HTMLElement)) {
        return;
      }
      const fullHeight = Math.ceil(fullHeader.scrollHeight);
      const compactHeight = Math.ceil(compactHeader.scrollHeight);
      stage.style.setProperty("--ng-note-header-full-height", `${fullHeight}px`);
      stage.style.setProperty("--ng-note-header-compact-height", `${compactHeight}px`);
    };
    const setCollapsed = (value) => {
      if (collapsed === value) {
        return;
      }
      collapsed = value;
      header.toggleClass("is-collapsed", value);
    };
    const syncFromScroll = () => {
      const top = scrollHost.scrollTop;
      if (top <= 2) {
        if (top < lastTop) {
          setCollapsed(false);
        } else if (top > lastTop) {
          setCollapsed(true);
        }
      } else if (top > lastTop) {
        setCollapsed(true);
      }
      lastTop = top;
      header.toggleClass("is-away-from-top", top > 2);
    };
    const onScroll = () => {
      syncFromScroll();
    };
    const onWheel = (event) => {
      if (collapsed && scrollHost.scrollTop <= 2 && event.deltaY < 0) {
        setCollapsed(false);
        return;
      }
      if (!collapsed && event.deltaY > 0 && !event.ctrlKey && event.cancelable) {
        const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? scrollHost.clientHeight : 1;
        event.preventDefault();
        setCollapsed(true);
        scrollHost.scrollBy({ top: event.deltaY * deltaScale * 0.5, behavior: "auto" });
      }
    };
    const onTouchStart = (event) => {
      var _a, _b;
      lastTouchY = (_b = (_a = event.touches[0]) == null ? void 0 : _a.clientY) != null ? _b : null;
    };
    const onTouchMove = (event) => {
      var _a;
      const touchY = (_a = event.touches[0]) == null ? void 0 : _a.clientY;
      if (touchY === void 0 || lastTouchY === null) {
        return;
      }
      if (collapsed && scrollHost.scrollTop <= 2 && touchY > lastTouchY + 4) {
        setCollapsed(false);
      }
      lastTouchY = touchY;
    };
    const onTouchEnd = () => {
      lastTouchY = null;
    };
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.target instanceof Element && event.target.closest(".ng-note-header")) {
        return;
      }
      const key = event.key;
      const isTypingKey = key.length === 1 || key === "Backspace" || key === "Delete" || key === "Enter" || key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";
      if (!isTypingKey) {
        return;
      }
      setCollapsed(true);
    };
    syncFromScroll();
    syncStageHeights();
    if (typeof ResizeObserver !== "undefined" && fullHeader instanceof HTMLElement && compactHeader instanceof HTMLElement) {
      resizeObserver = new ResizeObserver(() => {
        syncStageHeights();
      });
      resizeObserver.observe(fullHeader);
      resizeObserver.observe(compactHeader);
    }
    scrollHost.addEventListener("scroll", onScroll, { passive: true });
    scrollHost.addEventListener("wheel", onWheel, { passive: false });
    scrollHost.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollHost.addEventListener("touchmove", onTouchMove, { passive: true });
    scrollHost.addEventListener("touchend", onTouchEnd, { passive: true });
    content.addEventListener("keydown", onKeyDown, true);
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      scrollHost.removeEventListener("scroll", onScroll);
      scrollHost.removeEventListener("wheel", onWheel);
      scrollHost.removeEventListener("touchstart", onTouchStart);
      scrollHost.removeEventListener("touchmove", onTouchMove);
      scrollHost.removeEventListener("touchend", onTouchEnd);
      content.removeEventListener("keydown", onKeyDown, true);
    };
  }
  async renderMyNotesHeader(content, leaf, file) {
    this.disposeHeader(content.querySelector(":scope > .ng-note-header"));
    content.addClass("ng-mynotes-header-host");
    const header = document.createElement("div");
    header.className = "ng-note-header";
    header.setAttribute("data-path", file.path);
    header.setAttribute("data-kind", "mynotes");
    content.prepend(header);
    const scrollHost = this.resolveScrollHost(content);
    const navRow = header.createDiv({ cls: "ng-note-header-top" });
    const navLeft = navRow.createDiv({ cls: "ng-note-header-top-left" });
    const collapsedName = navRow.createEl("h4", { cls: "ng-note-header-note-name", text: file.basename });
    const navRight = navRow.createDiv({ cls: "ng-note-header-top-right" });
    const myNotesButton = navLeft.createEl("button", { text: "\u2190 MyNotes", cls: "ng-journal-nav-button" });
    myNotesButton.addEventListener("click", async () => {
      await this.openMyNotesView(true, leaf);
    });
    const homeButton = navRight.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, leaf);
    });
    const stage = header.createDiv({ cls: "ng-note-header-stage" });
    const collapsedSummary = stage.createDiv({ cls: "ng-note-header-collapsed-summary" });
    const collapsedCategories = collapsedSummary.createDiv({ cls: "ng-note-header-collapsed-categories" });
    const collapsedControls = collapsedSummary.createDiv({ cls: "ng-note-header-collapsed-controls" });
    const toTopButton = collapsedControls.createEl("button", { cls: "ng-note-header-to-top" });
    toTopButton.setAttribute("aria-label", "Back to top");
    toTopButton.setAttribute("title", "Back to top");
    toTopButton.setText("\u2191");
    toTopButton.addEventListener("click", () => {
      scrollHost.scrollTo({ top: 0, behavior: "smooth" });
    });
    const fullHeader = stage.createDiv({ cls: "ng-note-header-full" });
    fullHeader.createDiv({ cls: "ng-note-header-spacer" });
    const box = fullHeader.createDiv({ cls: "ng-note-header-box" });
    const syncCollapsedSummary = async () => {
      collapsedCategories.empty();
      const activeCategories = await this.myNotesStorage.getNoteCategoriesFresh(file);
      const activeSupport = await this.myNotesStorage.getNoteSupportsFresh(file);
      if (activeCategories.length === 0 && activeSupport.length === 0) {
        collapsedCategories.createDiv({ cls: "ng-note-header-collapsed-empty", text: "No categories" });
        return;
      }
      for (const category of activeCategories) {
        collapsedCategories.createSpan({ cls: "ng-note-header-mini-pill", text: category });
      }
      for (const support of activeSupport) {
        const supportPill = collapsedCategories.createSpan({ cls: "ng-note-header-mini-pill ng-note-header-mini-pill-support", text: support });
        const supportEntry = SUPPORT_CATEGORIES.find((entry) => entry.name === support);
        if (supportEntry) {
          supportPill.style.setProperty("--ng-support-color", supportEntry.color);
        }
      }
    };
    await syncCollapsedSummary();
    const categoriesHeader = box.createDiv({ cls: "ng-note-header-categories-row" });
    categoriesHeader.createEl("h4", { text: "Categories", cls: "ng-mynotes-section-title" });
    const categoriesActions = categoriesHeader.createDiv({ cls: "ng-note-header-categories-actions" });
    const addButton = categoriesActions.createEl("button", { cls: "ng-note-header-add-category-icon" });
    addButton.setAttribute("aria-label", "Add Category");
    addButton.setAttribute("title", "Add Category");
    const supportButton = categoriesActions.createEl("button", { cls: "ng-note-header-support-toggle" });
    supportButton.setAttribute("aria-label", "Toggle Support Note");
    (0, import_obsidian10.setIcon)(supportButton, "shield-plus");
    const favouriteButton = categoriesActions.createEl("button", { cls: "ng-note-header-fav" });
    favouriteButton.setAttribute("aria-label", "Favourite");
    favouriteButton.setAttribute("title", "Favourite");
    (0, import_obsidian10.setIcon)(favouriteButton, "heart");
    const syncFavouriteButtons = (isFavourite) => {
      favouriteButton.toggleClass("is-favourite", isFavourite);
    };
    syncFavouriteButtons(this.myNotesStorage.isFavourite(file));
    favouriteButton.addEventListener("click", async () => {
      const nowFavourite = await this.myNotesStorage.toggleFavourite(file);
      syncFavouriteButtons(nowFavourite);
      favouriteButton.removeClass("ng-heart-pop");
      void favouriteButton.offsetWidth;
      favouriteButton.addClass("ng-heart-pop");
    });
    const addRow = box.createDiv({ cls: "ng-note-header-add-row" });
    addRow.hide();
    const addInput = addRow.createEl("input", { type: "text", placeholder: "Category name..." });
    addInput.addClass("ng-task-input");
    const updateAddButton = () => {
      const open = addRow.isShown();
      const hasText = addInput.value.trim().length > 0;
      addButton.toggleClass("has-input", open && hasText);
      if (!open) {
        addButton.setText("+");
      } else if (hasText) {
        addButton.setText("\u2713");
      } else {
        addButton.setText("-");
      }
    };
    updateAddButton();
    addInput.addEventListener("input", updateAddButton);
    addButton.addEventListener("click", () => {
      if (!addRow.isShown()) {
        addRow.show();
        addInput.focus();
        updateAddButton();
        return;
      }
      if (addInput.value.trim().length > 0) {
        void submitNewCategory();
      } else {
        addRow.hide();
        updateAddButton();
      }
    });
    const pillRow = box.createDiv({ cls: "ng-mynotes-pill-row" });
    await this.renderMyNotesCategoryPills(pillRow, file, void 0, syncCollapsedSummary);
    const submitNewCategory = async () => {
      const name = addInput.value.trim();
      if (!name) {
        return;
      }
      await this.myNotesStorage.addCategory(name);
      const active = this.myNotesStorage.getNoteCategories(file);
      if (!active.includes(name)) {
        await this.myNotesStorage.toggleNoteCategory(file, name);
      }
      addInput.value = "";
      addRow.hide();
      updateAddButton();
      await this.renderMyNotesCategoryPills(pillRow, file, name, () => void syncCollapsedSummary());
      void syncCollapsedSummary();
    };
    addInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submitNewCategory();
      }
    });
    const supportSection = box.createDiv({ cls: "ng-note-header-support" });
    supportSection.createEl("h4", { text: "Support Note", cls: "ng-mynotes-section-title" });
    let supportActive = this.myNotesStorage.isSupportNote(file);
    supportButton.toggleClass("is-active", supportActive);
    supportSection.toggleClass("is-hidden", !supportActive);
    const supportPillRow = supportSection.createDiv({ cls: "ng-mynotes-pill-row" });
    const renderSupportPills = () => {
      supportPillRow.empty();
      const active = this.myNotesStorage.getNoteSupports(file);
      for (const support of SUPPORT_CATEGORIES) {
        const pill = supportPillRow.createEl("button", { cls: "ng-mynotes-pill ng-mynotes-support-pill" });
        pill.createSpan({ text: support.name });
        pill.style.setProperty("--ng-support-color", support.color);
        pill.toggleClass("is-active", active.includes(support.name));
        pill.addEventListener("click", async () => {
          const nowActive = await this.myNotesStorage.toggleNoteSupport(file, support.name);
          pill.toggleClass("is-active", nowActive);
          void syncCollapsedSummary();
        });
      }
    };
    if (supportActive) {
      renderSupportPills();
    }
    const toggleSupport = async () => {
      supportActive = !supportActive;
      supportButton.toggleClass("is-active", supportActive);
      supportSection.toggleClass("is-hidden", !supportActive);
      await this.myNotesStorage.setSupportNote(file, supportActive);
      if (supportActive) {
        renderSupportPills();
      }
      void syncCollapsedSummary();
    };
    supportButton.addEventListener("click", () => {
      void toggleSupport();
    });
    supportButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void toggleSupport();
      }
    });
    const disposeCollapseBehavior = this.bindMyNotesCollapseBehavior(content, header);
    this.headerDisposers.set(header, () => {
      disposeCollapseBehavior();
      content.removeClass("ng-mynotes-header-host");
    });
  }
  async renderMyLearningHeader(content, leaf, file) {
    this.disposeHeader(content.querySelector(":scope > .ng-note-header"));
    content.addClass("ng-mynotes-header-host");
    const header = document.createElement("div");
    header.className = "ng-note-header ng-learning-note-header";
    header.setAttribute("data-path", file.path);
    header.setAttribute("data-kind", "mylearning");
    content.prepend(header);
    const scrollHost = this.resolveScrollHost(content);
    const navRow = header.createDiv({ cls: "ng-note-header-top" });
    const leftNav = navRow.createDiv({ cls: "ng-note-header-top-left" });
    navRow.createEl("h4", { cls: "ng-note-header-note-name", text: file.basename });
    const rightNav = navRow.createDiv({ cls: "ng-note-header-top-right" });
    const backButton = leftNav.createEl("button", { text: "\u2190 MyLearning", cls: "ng-journal-nav-button" });
    backButton.addEventListener("click", async () => {
      var _a;
      const selectedCategory = (_a = this.myLearningStorage.getNoteCategory(file)) != null ? _a : void 0;
      const selectedTopic = this.myLearningStorage.getNoteTopics(file)[0];
      await this.openMyLearningView(true, leaf, selectedCategory, selectedTopic);
    });
    const homeButton = rightNav.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, leaf);
    });
    const stage = header.createDiv({ cls: "ng-note-header-stage" });
    const collapsedSummary = stage.createDiv({ cls: "ng-note-header-collapsed-summary ng-learning-collapsed-summary" });
    const collapsedRow = collapsedSummary.createDiv({ cls: "ng-learning-collapsed-row" });
    const collapsedCategory = collapsedRow.createDiv({ cls: "ng-learning-collapsed-category" });
    const collapsedTopics = collapsedRow.createDiv({ cls: "ng-note-header-collapsed-categories" });
    const collapsedProgress = collapsedRow.createDiv({ cls: "ng-learning-progress-wrap ng-learning-progress-wrap-compact" });
    const collapsedProgressTrack = collapsedProgress.createDiv({ cls: "ng-learning-progress-track" });
    const collapsedProgressFill = collapsedProgressTrack.createDiv({ cls: "ng-learning-progress-fill" });
    const collapsedControls = collapsedRow.createDiv({ cls: "ng-note-header-collapsed-controls" });
    const toTopButton = collapsedControls.createEl("button", { cls: "ng-note-header-to-top" });
    toTopButton.setAttribute("aria-label", "Back to top");
    toTopButton.setAttribute("title", "Back to top");
    toTopButton.setText("\u2191");
    toTopButton.addEventListener("click", () => {
      scrollHost.scrollTo({ top: 0, behavior: "smooth" });
    });
    const fullHeader = stage.createDiv({ cls: "ng-note-header-full" });
    const box = fullHeader.createDiv({ cls: "ng-note-header-box ng-learning-note-box" });
    const categoryHeading = box.createEl("h3", { cls: "ng-learning-topic-heading" });
    let currentCategory = this.myLearningStorage.getNoteCategory(file);
    const syncCategoryHeading = () => {
      const text = currentCategory != null ? currentCategory : "Assign a Category";
      categoryHeading.setText(text);
      categoryHeading.toggleClass("is-placeholder", !currentCategory);
      collapsedCategory.setText(`${text}:`);
      collapsedCategory.toggleClass("is-placeholder", !currentCategory);
    };
    syncCategoryHeading();
    const categoriesHeader = box.createDiv({ cls: "ng-note-header-categories-row" });
    const categoriesLeft = categoriesHeader.createDiv({ cls: "ng-learning-categories-left" });
    categoriesLeft.createEl("h4", { text: "Topics", cls: "ng-mynotes-section-title" });
    const addButton = categoriesLeft.createEl("button", { cls: "ng-note-header-add-category-icon" });
    addButton.setAttribute("aria-label", "Add Topic");
    addButton.setAttribute("title", "Add Topic");
    const addRow = box.createDiv({ cls: "ng-note-header-add-row" });
    addRow.hide();
    const addInput = addRow.createEl("input", { type: "text", placeholder: "Topic name..." });
    addInput.addClass("ng-task-input");
    const addError = addRow.createDiv({ cls: "ng-overlay-error ng-note-header-input-error" });
    addError.hide();
    const pillRow = box.createDiv({ cls: "ng-mynotes-pill-row" });
    const updateAddButton = () => {
      const open = addRow.isShown();
      const hasText = addInput.value.trim().length > 0;
      addButton.toggleClass("has-input", open && hasText);
      if (!open) {
        addButton.setText("+");
      } else if (hasText) {
        addButton.setText("\u2713");
      } else {
        addButton.setText("-");
      }
    };
    let displayedTopics = this.myLearningStorage.getNoteTopics(file);
    const syncCollapsedTopics = () => {
      collapsedTopics.empty();
      if (displayedTopics.length === 0) {
        collapsedTopics.createDiv({ cls: "ng-note-header-collapsed-empty", text: "No topics" });
        return;
      }
      for (const topic of displayedTopics) {
        const compactPill = collapsedTopics.createSpan({ cls: "ng-note-header-mini-pill", text: topic });
        compactPill.style.setProperty(
          "--ng-mylearning-category-color",
          this.myLearningStorage.getTopicColor(currentCategory != null ? currentCategory : "", topic)
        );
      }
    };
    const renderLearningTopicPills = async (ensureTopic) => {
      pillRow.empty();
      if (!currentCategory) {
        pillRow.createDiv({ cls: "ng-empty", text: "Assign a category first." });
        return;
      }
      const topics = await this.myLearningStorage.listTopicsForCategory(currentCategory);
      if (ensureTopic && !topics.includes(ensureTopic)) {
        topics.push(ensureTopic);
      }
      const active = this.myLearningStorage.getNoteTopics(file);
      if (ensureTopic && !active.includes(ensureTopic)) {
        active.push(ensureTopic);
      }
      displayedTopics = [...active];
      if (topics.length === 0) {
        pillRow.createDiv({ cls: "ng-empty", text: "No topics yet." });
        return;
      }
      for (const topic of topics) {
        const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-note-header-category-pill" });
        pill.style.setProperty("--ng-mylearning-category-color", this.myLearningStorage.getTopicColor(currentCategory, topic));
        pill.createSpan({ text: topic });
        pill.toggleClass("is-active", active.includes(topic));
        pill.addEventListener("click", async () => {
          const nowActive = await this.myLearningStorage.toggleNoteTopic(file, topic);
          pill.toggleClass("is-active", nowActive);
          displayedTopics = nowActive ? [...displayedTopics, topic].filter((entry, index, topics2) => topics2.indexOf(entry) === index) : displayedTopics.filter((entry) => entry !== topic);
          syncCollapsedTopics();
        });
      }
      syncCollapsedTopics();
    };
    updateAddButton();
    syncCollapsedTopics();
    await renderLearningTopicPills();
    const submitNewTopic = async () => {
      if (!currentCategory) {
        await this.openCategoryPicker(file, async (category) => {
          currentCategory = category;
          syncCategoryHeading();
          await renderLearningTopicPills();
        });
      }
      const name = addInput.value.trim();
      if (!currentCategory || !name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        addError.setText(validationError);
        addError.show();
        return;
      }
      await this.myLearningStorage.addTopic(currentCategory, name);
      const active = this.myLearningStorage.getNoteTopics(file);
      if (!active.includes(name)) {
        await this.myLearningStorage.toggleNoteTopic(file, name);
      }
      addInput.value = "";
      addRow.hide();
      updateAddButton();
      await renderLearningTopicPills(name);
    };
    addInput.addEventListener("input", updateAddButton);
    addInput.addEventListener("input", () => {
      const validationError = getNameValidationError(addInput.value);
      addError.toggle(validationError !== null);
      addError.setText(validationError != null ? validationError : "");
    });
    addInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submitNewTopic();
      }
    });
    addButton.addEventListener("click", () => {
      if (!addRow.isShown()) {
        addRow.show();
        addInput.focus();
        updateAddButton();
        return;
      }
      if (addInput.value.trim().length > 0) {
        void submitNewTopic();
      } else {
        addRow.hide();
        updateAddButton();
      }
    });
    categoryHeading.addEventListener("click", () => {
      void this.openCategoryPicker(file, async (category) => {
        currentCategory = category;
        syncCategoryHeading();
        await renderLearningTopicPills();
      });
    });
    const progressWrap = box.createDiv({ cls: "ng-learning-progress-wrap" });
    const progressTrack = progressWrap.createDiv({ cls: "ng-learning-progress-track" });
    const progressFill = progressTrack.createDiv({ cls: "ng-learning-progress-fill" });
    let currentComprehension = this.myLearningStorage.getComprehension(file);
    const syncProgressValue = (value) => {
      currentComprehension = Math.max(0, Math.min(100, Math.round(value)));
      progressFill.style.width = `${currentComprehension}%`;
      collapsedProgressFill.style.width = `${currentComprehension}%`;
    };
    syncProgressValue(currentComprehension);
    const bindProgressTrack = (track) => {
      const updateFromPointer = (clientX) => {
        const rect = track.getBoundingClientRect();
        if (rect.width <= 0) {
          return;
        }
        syncProgressValue((clientX - rect.left) / rect.width * 100);
      };
      let dragging = false;
      track.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        dragging = true;
        track.setPointerCapture(event.pointerId);
        updateFromPointer(event.clientX);
        void this.myLearningStorage.setComprehension(file, currentComprehension);
      });
      track.addEventListener("pointermove", (event) => {
        if (!dragging) {
          return;
        }
        updateFromPointer(event.clientX);
        void this.myLearningStorage.setComprehension(file, currentComprehension);
      });
      track.addEventListener("pointerup", async (event) => {
        if (!dragging) {
          return;
        }
        dragging = false;
        track.releasePointerCapture(event.pointerId);
        await this.myLearningStorage.setComprehension(file, currentComprehension);
      });
    };
    bindProgressTrack(progressTrack);
    bindProgressTrack(collapsedProgressTrack);
    const disposeCollapseBehavior = this.bindMyNotesCollapseBehavior(content, header);
    this.headerDisposers.set(header, () => {
      disposeCollapseBehavior();
      content.removeClass("ng-mynotes-header-host");
    });
  }
  async renderMyNotesCategoryPills(pillRow, file, ensureCategory, onToggle) {
    pillRow.empty();
    const categories = await this.myNotesStorage.loadCategories();
    if (ensureCategory && !categories.some((category) => category.name === ensureCategory)) {
      categories.push({ name: ensureCategory, count: 1 });
    }
    const active = this.myNotesStorage.getNoteCategories(file);
    if (ensureCategory && !active.includes(ensureCategory)) {
      active.push(ensureCategory);
    }
    if (categories.length === 0) {
      pillRow.createDiv({ cls: "ng-empty", text: "No categories yet." });
      return;
    }
    for (const category of categories) {
      const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-note-header-category-pill" });
      pill.createSpan({ text: category.name });
      pill.toggleClass("is-active", active.includes(category.name));
      pill.addEventListener("click", async () => {
        const nowActive = await this.myNotesStorage.toggleNoteCategory(file, category.name);
        pill.toggleClass("is-active", nowActive);
        onToggle == null ? void 0 : onToggle();
      });
    }
  }
  async openCategoryPicker(file, onSelect) {
    const categories = await this.myLearningStorage.listCategories();
    const { card, close } = openOverlay("Assign Category");
    if (categories.length === 0) {
      card.createDiv({ cls: "ng-empty", text: "No categories yet. Create one from the MyLearning view." });
      return;
    }
    const row = card.createDiv({ cls: "ng-mynotes-pill-row" });
    for (const category of categories) {
      const button = row.createEl("button", { cls: "ng-mynotes-pill" });
      button.createSpan({ text: category });
      button.addEventListener("click", async () => {
        await this.myLearningStorage.setNoteCategory(file, category);
        close();
        await onSelect(category);
      });
    }
  }
};

// src/storage.ts
var import_obsidian11 = require("obsidian");
var TaskManagerStorage = class {
  constructor(app) {
    this.app = app;
  }
  async ensureTaskManagerFile() {
    const existing = this.app.vault.getAbstractFileByPath(TASK_MANAGER_FILE_PATH);
    if (existing instanceof import_obsidian11.TFile) {
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
      if (createdByOtherCall instanceof import_obsidian11.TFile) {
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
    return (_a = (0, import_obsidian11.parseYaml)(match[1])) != null ? _a : {};
  }
  serializeFrontmatter(state) {
    const yaml = (0, import_obsidian11.stringifyYaml)(state).replace(/\s+$/, "");
    return `---
${yaml}
---`;
  }
};

// src/weeklyRecapManager.ts
var import_obsidian12 = require("obsidian");
var POSITIVE_EMOTIONS = /* @__PURE__ */ new Set([
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
]);
var NEGATIVE_EMOTIONS = /* @__PURE__ */ new Set([
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
]);
var SUPPORT_HINTS = {
  Mood: [
    "A tiny joyful ritual today can stabilize tomorrow.",
    "Pick one gentle thing that usually softens your day.",
    "Low mood is data, not failure. Keep your steps small.",
    "Try one predictable comfort activity before bedtime.",
    "Name one thing that felt even slightly okay today."
  ],
  Sleep: [
    "Protect one fixed wind-down anchor tonight.",
    "Dim light earlier than usual to cue your system.",
    "A shorter evening task list can protect sleep quality.",
    "Use a simple pre-sleep sequence to reduce friction.",
    "Your body trusts rhythm; keep bedtime timing gentle but steady."
  ],
  Regulation: [
    "One pause before reacting can change the whole hour.",
    "Try grounding through touch, temperature, or pressure.",
    "Reduce one input source when your system feels loud.",
    "Regulation grows through repetition, not perfection.",
    "Build in a two-minute reset between demanding tasks."
  ],
  Stress: [
    "Short breaks now prevent long crashes later.",
    "Choose one non-essential task to postpone this week.",
    "Lowering pace is still progress.",
    "Your nervous system benefits from predictable pauses.",
    "Try three slower breaths before switching tasks."
  ],
  Anxiety: [
    "Contain uncertainty by choosing one next concrete action.",
    "Name what is known right now before forecasting.",
    "Use brief body cues: unclench jaw, drop shoulders, exhale.",
    "Anxiety peaks pass faster when you reduce input noise.",
    "Anchor attention to one sensory detail in the room."
  ],
  Exhaustion: [
    "Protect recovery time before adding new commitments.",
    "A slower day can be productive for your long-term baseline.",
    "Energy is a resource to steward, not a test to pass.",
    "Prioritize the one task with highest real value.",
    "Tiny rest windows count, especially when repeated."
  ],
  "Sensory Load": [
    "Reduce one sensory trigger where possible this week.",
    "Use transitions: from high-input to low-input spaces gradually.",
    "Noise, light, and social density all tax the same battery.",
    "Schedule low-stimulation moments before your hardest blocks.",
    "Your comfort tools are strategy, not weakness."
  ],
  "Social Load": [
    "Plan one low-demand social option to balance heavier ones.",
    "A short social recovery window can prevent overload.",
    "Set one clear boundary before high-contact days.",
    "Quality over quantity is valid for social energy.",
    "Choose contexts where you can leave early if needed."
  ]
};
var SYMPTOMS = [
  { label: "Mood", key: "mood", highIsBad: false },
  { label: "Sleep", key: "sleep", highIsBad: false },
  { label: "Regulation", key: "regulation", highIsBad: false },
  { label: "Stress", key: "stress", highIsBad: true },
  { label: "Anxiety", key: "anxiety", highIsBad: true },
  { label: "Exhaustion", key: "exhaustion", highIsBad: true },
  { label: "Sensory Load", key: "sensoryLoad", highIsBad: true },
  { label: "Social Load", key: "socialLoad", highIsBad: true }
];
var WeeklyRecapManager = class {
  constructor(app, journalingStorage, taskStorage, myNotesStorage) {
    this.app = app;
    this.journalingStorage = journalingStorage;
    this.taskStorage = taskStorage;
    this.myNotesStorage = myNotesStorage;
  }
  async ensureWeeklyRecapData(year, week) {
    const file = await this.journalingStorage.ensureWeeklyRecapFile(year, week);
    const existing = await this.journalingStorage.readWeeklyRecap(file);
    if (existing.body.trim().length > 0) {
      return { file, frontmatter: existing.frontmatter, body: existing.body, generatedNow: false };
    }
    const generated = await this.generateWeeklyRecap(file);
    if (!generated) {
      const latest2 = await this.journalingStorage.readWeeklyRecap(file);
      return { file, frontmatter: latest2.frontmatter, body: latest2.body, generatedNow: false };
    }
    const latest = await this.journalingStorage.readWeeklyRecap(file);
    return { file, frontmatter: latest.frontmatter, body: latest.body, generatedNow: true };
  }
  async generateWeeklyRecap(file) {
    var _a, _b, _c, _d, _e;
    const parsed = parseWeekFile(file.basename);
    if (!parsed) {
      new import_obsidian12.Notice("Invalid weekly recap name.");
      return false;
    }
    const range = isoWeekRange(parsed.year, parsed.week);
    const allEntries = await this.journalingStorage.listDailyEntries();
    const entries = allEntries.filter((entry) => entry.frontmatter.date >= range.start && entry.frontmatter.date <= range.end);
    if (entries.length < 4) {
      new import_obsidian12.Notice("This week needs at least 4 entries.");
      return false;
    }
    const averages = {
      mood: average(entries.map((entry) => entry.frontmatter.mood)),
      sleep: average(entries.map((entry) => entry.frontmatter.sleep)),
      regulation: average(entries.map((entry) => entry.frontmatter.regulation)),
      stress: average(entries.map((entry) => entry.frontmatter.stress)),
      anxiety: average(entries.map((entry) => entry.frontmatter.anxiety)),
      exhaustion: average(entries.map((entry) => entry.frontmatter.exhaustion)),
      sensoryLoad: average(entries.map((entry) => entry.frontmatter.sensoryLoad)),
      socialLoad: average(entries.map((entry) => entry.frontmatter.socialLoad))
    };
    const emotionCounts = countEmotions(entries);
    const trackers = await this.journalingStorage.listTrackers();
    const trackerCounts = {};
    for (const tracker of trackers) {
      trackerCounts[tracker.name] = tracker.dates.filter((date) => date >= range.start && date <= range.end).length;
    }
    const taskState = await this.taskStorage.loadTaskManagerState();
    const beforeThreshold = taskState.forcedBreakThreshold;
    const beforeBreakLength = taskState.forcedBreakLength;
    const beforeMaxEnergy = taskState.maxEnergy;
    const stressFactor = tierFactor(averages.stress);
    let nextThreshold = beforeThreshold;
    if (stressFactor.mode === "high") {
      nextThreshold = beforeThreshold / stressFactor.factor;
    } else if (stressFactor.mode === "low") {
      nextThreshold = beforeThreshold * stressFactor.factor;
    }
    nextThreshold = clamp(nextThreshold, 30, 100);
    const exhaustionFactor = tierFactor(averages.exhaustion);
    let nextBreakLength = beforeBreakLength;
    if (exhaustionFactor.mode === "high") {
      nextBreakLength = beforeBreakLength * exhaustionFactor.factor;
    } else if (exhaustionFactor.mode === "low") {
      nextBreakLength = beforeBreakLength / exhaustionFactor.factor;
    }
    nextBreakLength = clamp(nextBreakLength, 15, 60);
    const completedEnergies = entries.reduce((acc, entry) => {
      const energies = entry.frontmatter.completedTasks.map((task) => task.energy);
      return acc.concat(energies);
    }, []);
    const weeklyAverageCompletedEnergy = average(completedEnergies.map((value) => value));
    const baseTaskEnergy = (_a = taskState.baseTaskEnergy) != null ? _a : 120;
    const nextMaxEnergy = clamp((baseTaskEnergy * 2 + weeklyAverageCompletedEnergy) / 3, 50, 200);
    taskState.forcedBreakThreshold = round2(nextThreshold);
    taskState.forcedBreakLength = round2(nextBreakLength);
    taskState.maxEnergy = round2(nextMaxEnergy);
    taskState.baseTaskEnergy = baseTaskEnergy;
    taskState.lastWeeklyRecap = `${parsed.year}-W${String(parsed.week).padStart(2, "0")}`;
    await this.taskStorage.saveTaskManagerState(taskState);
    const noteSupportSignals = buildSupportSignals(entries, averages, true);
    const hintSupportSignals = buildSupportSignals(entries, averages, false);
    const supportSelection = this.pickSupportNotes(noteSupportSignals);
    const supportHints = pickSupportHints(hintSupportSignals.map((signal) => signal.label));
    const supportNoteReasons = {};
    for (const note of supportSelection.notes) {
      supportNoteReasons[note.name] = note.symptom;
    }
    const criticalDays = {};
    for (const signal of noteSupportSignals) {
      if (signal.affectedDays.length > 0) {
        criticalDays[signal.label] = signal.affectedDays;
      }
    }
    const frontmatter = {
      week: parsed.week,
      year: parsed.year,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      processedDateRange: {
        start: (_c = (_b = entries[0]) == null ? void 0 : _b.frontmatter.date) != null ? _c : "",
        end: (_e = (_d = entries[entries.length - 1]) == null ? void 0 : _d.frontmatter.date) != null ? _e : ""
      },
      journalLinks: entries.map((entry) => `[[${entry.file.basename}]]`),
      supportNotes: supportSelection.notes.map((note) => note.name),
      supportNoteReasons,
      missingSupportSymptoms: supportSelection.missing,
      criticalDays,
      supportHints,
      seeds: [],
      averages: {
        mood: round2(averages.mood),
        sleep: round2(averages.sleep),
        regulation: round2(averages.regulation),
        stress: round2(averages.stress),
        anxiety: round2(averages.anxiety),
        exhaustion: round2(averages.exhaustion),
        sensoryLoad: round2(averages.sensoryLoad),
        socialLoad: round2(averages.socialLoad)
      },
      emotionCounts,
      trackerCounts,
      taskAdjustments: {
        maxEnergy: { from: round2(beforeMaxEnergy), to: round2(nextMaxEnergy) },
        forcedBreakThreshold: { from: round2(beforeThreshold), to: round2(nextThreshold) },
        forcedBreakLength: { from: round2(beforeBreakLength), to: round2(nextBreakLength) }
      }
    };
    const body = buildWeeklyMarkdown({
      range,
      entries,
      averages,
      emotionCounts,
      trackerCounts,
      supportSelection,
      supportHints,
      taskAdjustments: frontmatter.taskAdjustments,
      noteSignals: noteSupportSignals
    });
    await this.journalingStorage.saveWeeklyRecap(file, frontmatter, body);
    return true;
  }
  pickSupportNotes(signals) {
    const sorted = [...signals].sort((a, b) => b.severity - a.severity || Math.random() - 0.5);
    const selected = [];
    const used = /* @__PURE__ */ new Set();
    const missing = [];
    for (const signal of sorted) {
      if (selected.length >= 4) {
        break;
      }
      const candidates = shuffle2(this.myNotesStorage.notesWithSupport(signal.label));
      const pick = candidates.find((candidate) => !used.has(candidate.path));
      if (!pick) {
        missing.push(signal.label);
        continue;
      }
      used.add(pick.path);
      selected.push({ name: pick.basename, symptom: signal.label });
    }
    return { notes: selected, missing: unique(missing) };
  }
};
function parseWeekFile(baseName) {
  const match = baseName.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), week: Number(match[2]) };
}
function isoWeekRange(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: dateKeyUTC(monday), end: dateKeyUTC(sunday) };
}
function dateKeyUTC(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function average(values) {
  const filtered = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (filtered.length === 0) {
    return 0;
  }
  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
}
function countEmotions(entries) {
  var _a, _b;
  const pleasant = {};
  const unpleasant = {};
  for (const entry of entries) {
    for (const emotion of entry.frontmatter.emotions) {
      if (POSITIVE_EMOTIONS.has(emotion)) {
        pleasant[emotion] = ((_a = pleasant[emotion]) != null ? _a : 0) + 1;
      } else if (NEGATIVE_EMOTIONS.has(emotion)) {
        unpleasant[emotion] = ((_b = unpleasant[emotion]) != null ? _b : 0) + 1;
      }
    }
  }
  return {
    pleasant,
    unpleasant,
    pleasantTotal: Object.values(pleasant).reduce((sum, value) => sum + value, 0),
    unpleasantTotal: Object.values(unpleasant).reduce((sum, value) => sum + value, 0)
  };
}
function tierFactor(value) {
  if (value >= 90) return { mode: "high", factor: 1.7 };
  if (value >= 80) return { mode: "high", factor: 1.5 };
  if (value >= 70) return { mode: "high", factor: 1.3 };
  if (value >= 60) return { mode: "high", factor: 1.1 };
  if (value <= 10) return { mode: "low", factor: 1.5 };
  if (value <= 20) return { mode: "low", factor: 1.3 };
  if (value <= 30) return { mode: "low", factor: 1.1 };
  return { mode: "none", factor: 1 };
}
function buildSupportSignals(entries, averages, forNotes) {
  const list = [];
  for (const symptom of SYMPTOMS) {
    const avg = averages[symptom.key];
    const values = entries.map((entry) => ({ date: entry.frontmatter.date, value: entry.frontmatter[symptom.key] })).filter((row) => typeof row.value === "number");
    const avgThreshold = symptom.highIsBad ? forNotes ? 70 : 60 : forNotes ? 35 : 50;
    const dailyThreshold = symptom.highIsBad ? forNotes ? 85 : 80 : forNotes ? 20 : 30;
    const avgTriggered = symptom.highIsBad ? avg > avgThreshold : avg < avgThreshold;
    const affectedDaily = values.filter((row) => symptom.highIsBad ? row.value > dailyThreshold : row.value < dailyThreshold).map((row) => row.date);
    if (!avgTriggered && affectedDaily.length === 0) {
      continue;
    }
    const avgSeverity = symptom.highIsBad ? Math.max(0, avg - avgThreshold) : Math.max(0, avgThreshold - avg);
    const dailySeverity = values.reduce((acc, row) => {
      const delta = symptom.highIsBad ? row.value - dailyThreshold : dailyThreshold - row.value;
      return Math.max(acc, Math.max(0, delta));
    }, 0);
    list.push({
      label: symptom.label,
      severity: avgSeverity + dailySeverity,
      affectedDays: affectedDaily
    });
  }
  return list;
}
function pickSupportHints(symptoms) {
  var _a;
  const hints = [];
  for (const symptom of unique(symptoms)) {
    const pool = (_a = SUPPORT_HINTS[symptom]) != null ? _a : [];
    if (pool.length === 0) {
      continue;
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    hints.push(picked);
  }
  return hints;
}
function buildWeeklyMarkdown(args) {
  const strongestTracker = Object.entries(args.trackerCounts).sort((a, b) => b[1] - a[1])[0];
  const symptomRows = SYMPTOMS.map((symptom) => {
    const value = round2(args.averages[symptom.key]);
    return `- ${symptom.label}: ${value}`;
  }).join("\n");
  const pleasantRows = Object.entries(args.emotionCounts.pleasant).sort((a, b) => b[1] - a[1]).map(([emotion, count]) => `- ${emotion}: ${count}`).join("\n") || "- none";
  const unpleasantRows = Object.entries(args.emotionCounts.unpleasant).sort((a, b) => b[1] - a[1]).map(([emotion, count]) => `- ${emotion}: ${count}`).join("\n") || "- none";
  const trackerRows = Object.entries(args.trackerCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => `- ${name}: ${count}`).join("\n") || "- none";
  const supportRows = args.supportSelection.notes.map((note) => `- ${note.name} (triggered by ${note.symptom})`).join("\n") || "- none";
  const missingRows = args.supportSelection.missing.map((symptom) => `- ${symptom}: consider working on a supportive note for this.`).join("\n") || "- none";
  const criticalRows = args.noteSignals.filter((signal) => signal.affectedDays.length > 0).map((signal) => `- ${signal.label}: ${signal.affectedDays.join(", ")}`).join("\n") || "- none";
  const hintRows = args.supportHints.map((hint) => `- ${hint}`).join("\n") || "- none";
  const taskFeedback = [
    describeDelta("Weekly energy capacity", args.taskAdjustments.maxEnergy.from, args.taskAdjustments.maxEnergy.to),
    describeDelta("Break frequency threshold", args.taskAdjustments.forcedBreakThreshold.from, args.taskAdjustments.forcedBreakThreshold.to),
    describeDelta("Break length", args.taskAdjustments.forcedBreakLength.from, args.taskAdjustments.forcedBreakLength.to)
  ].join("\n");
  const winner = strongestTracker && strongestTracker[1] > 0 ? `Weekly winner: ${strongestTracker[0]} (${strongestTracker[1]})` : "Weekly winner: none";
  return [
    "# Weekly Recap",
    "",
    `Week Range: ${args.range.start} to ${args.range.end}`,
    `Entries Used: ${args.entries.length}`,
    "",
    "## Symptom Recap",
    symptomRows,
    "",
    "## Emotions",
    `- Positive total: ${args.emotionCounts.pleasantTotal}`,
    `- Negative total: ${args.emotionCounts.unpleasantTotal}`,
    "",
    "### Pleasant emotions",
    pleasantRows,
    "",
    "### Unpleasant emotions",
    unpleasantRows,
    "",
    "## Tracker",
    winner,
    trackerRows,
    "",
    "## Support System",
    "### Suggested support notes",
    supportRows,
    "",
    "### Missing support coverage",
    missingRows,
    "",
    "### Critical days",
    criticalRows,
    "",
    "### Support hints",
    hintRows,
    "",
    "## Task Manager Feedback",
    taskFeedback,
    "",
    "## Seeding",
    "Seeds are added through the weekly overlay input."
  ].join("\n");
}
function describeDelta(label, from, to) {
  if (Math.abs(from - to) < 0.01) {
    return `- ${label}: unchanged`;
  }
  if (to > from) {
    return `- ${label}: increased (${round2(from)} -> ${round2(to)})`;
  }
  return `- ${label}: decreased (${round2(from)} -> ${round2(to)})`;
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function round2(value) {
  return Math.round(value * 100) / 100;
}
function shuffle2(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function unique(items) {
  return [...new Set(items)];
}

// src/plugin.ts
var NeuralGardenPlugin = class extends import_obsidian13.Plugin {
  constructor() {
    super(...arguments);
    this.myLearningSelection = {
      category: null,
      topic: null
    };
    this.openHomeView = async (makeActive, targetLeaf) => {
      const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_HOME, active: makeActive });
      if (makeActive) {
        this.app.workspace.revealLeaf(leaf);
      }
    };
    this.openWeeklyRecap = async (year, week, targetLeaf) => {
      const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP, active: true });
      const view = leaf.view;
      if (view instanceof NeuralGardenWeeklyRecapView) {
        await view.openForWeek(year, week);
      }
      this.app.workspace.revealLeaf(leaf);
    };
    this.openMyNotesView = async (makeActive, targetLeaf) => {
      const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_MY_NOTES, active: makeActive });
      if (makeActive) {
        this.app.workspace.revealLeaf(leaf);
      }
    };
    this.openMyLearningView = async (makeActive, targetLeaf, selectedCategory, selectedTopic) => {
      var _a, _b;
      const leaf = targetLeaf != null ? targetLeaf : this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING, active: makeActive });
      const view = leaf.view;
      if (view instanceof NeuralGardenMyLearningView) {
        const category = (_b = (_a = this.myLearningSelection.category) != null ? _a : selectedCategory) != null ? _b : null;
        const topic = category === this.myLearningSelection.category ? this.myLearningSelection.topic : selectedTopic != null ? selectedTopic : null;
        await view.setSelection(category, topic);
      }
      if (makeActive) {
        this.app.workspace.revealLeaf(leaf);
      }
    };
  }
  async onload() {
    this.storage = new TaskManagerStorage(this.app);
    this.journalingStorage = new JournalingStorage(this.app);
    this.myNotesStorage = new MyNotesStorage(this.app);
    this.myLearningStorage = new MyLearningStorage(this.app);
    this.hidePropertiesInDocument();
    this.noteHeaderManager = new NoteHeaderManager(
      this.app,
      this.myNotesStorage,
      this.myLearningStorage,
      this.openHomeView,
      this.openMyNotesView,
      this.openMyLearningView
    );
    this.weeklyRecapManager = new WeeklyRecapManager(
      this.app,
      this.journalingStorage,
      this.storage,
      this.myNotesStorage
    );
    await this.safeInitStep("ensure Notes folder", async () => {
      await this.storage.ensureNotesFolder();
    });
    await this.safeInitStep("ensure Journal folders", async () => {
      await this.journalingStorage.ensureJournalFolders();
    });
    await this.safeInitStep("ensure MyLearning storage", async () => {
      await this.myLearningStorage.ensureProvisioned();
    });
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_HOME,
      (leaf) => new NeuralGardenHomeView(leaf, this.storage, this.journalingStorage, this.openJournalingView, this.openMyNotesView, this.openMyLearningView)
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_MY_NOTES,
      (leaf) => new NeuralGardenMyNotesView(leaf, this.myNotesStorage, this.openHomeView)
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING,
      (leaf) => new NeuralGardenMyLearningView(
        leaf,
        this.myLearningStorage,
        this.openHomeView,
        this.myLearningSelection,
        (category, topic) => {
          this.myLearningSelection = { category, topic };
        }
      )
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_JOURNALING,
      (leaf) => new NeuralGardenJournalingView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalEntryView, this.openWeeklyRecap)
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY,
      (leaf) => new NeuralGardenJournalEntryView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalingView)
    );
    this.registerView(
      VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP,
      (leaf) => new NeuralGardenWeeklyRecapView(leaf, this.journalingStorage, this.weeklyRecapManager, this.openHomeView, this.openJournalingView)
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
    this.addCommand({
      id: "open-neural-garden-my-notes",
      name: "Open Neural Garden MyNotes",
      callback: async () => {
        await this.openMyNotesView(true);
      }
    });
    this.addCommand({
      id: "open-neural-garden-my-learning",
      name: "Open Neural Garden MyLearning",
      callback: async () => {
        await this.openMyLearningView(true);
      }
    });
    this.addRibbonIcon("sparkles", "Open Neural Garden Home", async () => {
      await this.openHomeView(true);
    });
    this.app.workspace.onLayoutReady(() => {
      void this.openHomeOnStartupSafe();
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async (leaf) => {
        if (!leaf) {
          return;
        }
        if (leaf.getViewState().type === "empty") {
          try {
            await this.openHomeView(false, leaf);
          } catch (error) {
            console.error("[Neural Garden] Failed to open Home view on active leaf change", error);
          }
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.noteHeaderManager.sync();
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.noteHeaderManager.sync();
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", async (file, oldPath) => {
        if (file instanceof import_obsidian13.TFile) {
          await this.myLearningStorage.handleEntryRename(file, oldPath);
        }
        window.setTimeout(() => {
          for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING)) {
            if (leaf.view instanceof NeuralGardenMyLearningView) {
              void leaf.view.refresh();
            }
          }
        }, 100);
      })
    );
    this.app.workspace.onLayoutReady(() => {
      this.noteHeaderManager.sync();
    });
  }
  onunload() {
    this.noteHeaderManager.detachAll();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP);
  }
  hidePropertiesInDocument() {
    var _a, _b;
    const vault = this.app.vault;
    if (((_a = vault.getConfig) == null ? void 0 : _a.call(vault, "propertiesInDocument")) !== "hidden") {
      (_b = vault.setConfig) == null ? void 0 : _b.call(vault, "propertiesInDocument", "hidden");
    }
  }
  async openHomeOnStartup() {
    var _a;
    const targetLeaf = (_a = this.app.workspace.getMostRecentLeaf()) != null ? _a : this.app.workspace.getLeaf(true);
    await this.openHomeView(true, targetLeaf);
  }
  async openHomeOnStartupSafe() {
    try {
      window.setTimeout(() => {
        void this.safeInitStep("open Home on startup", async () => {
          await this.openHomeOnStartup();
        });
      }, 0);
    } catch (error) {
      console.error("[Neural Garden] Failed scheduling Home open on startup", error);
    }
  }
  async safeInitStep(label, fn) {
    try {
      await fn();
    } catch (error) {
      console.error(`[Neural Garden] Startup step failed: ${label}`, error);
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
