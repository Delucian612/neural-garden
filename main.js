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
var import_obsidian3 = require("obsidian");

// src/homeView.ts
var import_obsidian = require("obsidian");

// src/constants.ts
var VIEW_TYPE_NEURAL_GARDEN_HOME = "neural-garden-home";
var TASK_MANAGER_FILE_PATH = "Maintenance/TaskManager/TaskManager.md";
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
    .ng-task-empty {
      font-size: 0.96rem;
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
        grid-template-columns: 1fr;
      }
      .ng-task-row {
        grid-template-columns: minmax(0, 1fr) auto;
        grid-auto-rows: auto;
      }
      .ng-effort-buttons {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

// src/homeView.ts
var NeuralGardenHomeView = class extends import_obsidian.ItemView {
  constructor(leaf, storage) {
    super(leaf);
    this.storage = storage;
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
      new import_obsidian.Notice("Journaling interface placeholder");
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
    const pair = getEnergyStopGradientPair(currentPercent);
    const secondaryDarkened = darkenColor(pair.secondary, 0.7);
    barInner.style.background = `linear-gradient(120deg, ${pair.primary}, ${secondaryDarkened}, ${pair.primary})`;
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

// src/storage.ts
var import_obsidian2 = require("obsidian");
var TaskManagerStorage = class {
  constructor(app) {
    this.app = app;
  }
  async ensureTaskManagerFile() {
    const existing = this.app.vault.getAbstractFileByPath(TASK_MANAGER_FILE_PATH);
    if (existing instanceof import_obsidian2.TFile) {
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
      if (createdByOtherCall instanceof import_obsidian2.TFile) {
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
    return (_a = (0, import_obsidian2.parseYaml)(match[1])) != null ? _a : {};
  }
  serializeFrontmatter(state) {
    const yaml = (0, import_obsidian2.stringifyYaml)(state).replace(/\s+$/, "");
    return `---
${yaml}
---`;
  }
};

// src/plugin.ts
var NeuralGardenPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    this.storage = new TaskManagerStorage(this.app);
    await this.storage.ensureNotesFolder();
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_HOME, (leaf) => new NeuralGardenHomeView(leaf, this.storage));
    this.addCommand({
      id: "open-neural-garden-home",
      name: "Open Neural Garden Home",
      callback: async () => {
        await this.openHomeView(true);
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
};
//# sourceMappingURL=main.js.map
