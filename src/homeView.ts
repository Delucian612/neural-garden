import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import {
  BREAK_MESSAGES,
  DEFAULT_STATE,
  EFFORTS,
  ENERGY_STOPS,
  NOTES_FOLDER,
  VIEW_TYPE_NEURAL_GARDEN_HOME,
  WEEKLY_RECAP_MIN_ENTRIES,
} from "./constants";
import { searchNotesInFolder } from "./search";
import { TaskManagerStorage } from "./storage";
import { injectNeuralGardenStyles } from "./styles";
import {
  createId,
  effortColor,
  effortLabel,
  energyColorAt,
  getEffectiveForcedBreakThreshold,
  getEffectiveMaxEnergy,
  recalculateTotals,
} from "./taskState";
import { TaskItem, TaskManagerState } from "./types";

export class NeuralGardenHomeView extends ItemView {
  state: TaskManagerState = { ...DEFAULT_STATE };
  searchDebounceTimer: number | null = null;
  breakTickTimer: number | null = null;
  breakMessageTimer: number | null = null;
  breakTimerEl: HTMLElement | null = null;
  breakMessageEl: HTMLElement | null = null;
  lastBreakMessageIndex: number | null = null;
  refocusTaskInputAfterRender = false;

  constructor(leaf: WorkspaceLeaf, private readonly storage: TaskManagerStorage) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_NEURAL_GARDEN_HOME;
  }

  getDisplayText(): string {
    return "Home";
  }

  getIcon(): string {
    return "home";
  }

  async onOpen(): Promise<void> {
    this.state = await this.storage.loadTaskManagerState();
    if (this.state.forcedBreakThreshold === 50) {
      this.state.forcedBreakThreshold = 70;
    }
    this.applyBreakRecovery();
    await this.storage.saveTaskManagerState(this.state);
    this.render();
    this.startBreakTicker();
  }

  async onClose(): Promise<void> {
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

  private startBreakTicker(): void {
    this.syncBreakLiveUpdates();
  }

  private async persistAndRender(): Promise<void> {
    recalculateTotals(this.state);
    this.applyBreakRecovery();
    await this.storage.saveTaskManagerState(this.state);
    this.render();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");

    const wrapper = contentEl.createDiv({ cls: "neural-garden-home" });
    wrapper.createEl("h2", { text: "Home" });

    const categories = wrapper.createDiv({ cls: "ng-categories" });
    const categoryGrid = categories.createDiv({ cls: "ng-category-grid" });
    const journalButton = this.makeCategoryButton("Journaling", "book-open", () => {
      new Notice("Journaling interface placeholder");
    });
    categoryGrid.appendChild(journalButton);

    const notesButton = this.makeCategoryButton("My Notes", "folder", () => {
      new Notice("My Notes interface placeholder");
    });
    categoryGrid.appendChild(notesButton);

    const settingsButton = this.makeCategoryButton("Settings", "settings", () => {
      new Notice("Settings interface placeholder");
    });
    categoryGrid.appendChild(settingsButton);

    const quickNoteButton = this.makeCategoryButton("+ QuickNote", "pencil", () => {
      new Notice("QuickNote interface placeholder");
    });
    categoryGrid.appendChild(quickNoteButton);

    if (this.shouldShowWeeklyRecapButton()) {
      const recapContainer = categories.createDiv({ cls: "ng-weekly-recap-row" });
      const weeklyRecapButton = this.makeCategoryButton(
        "Weekly Recap",
        "sparkles",
        () => {
          new Notice("Weekly recap will be implemented in a later step");
        },
        "#00F0FF",
      );
      recapContainer.appendChild(weeklyRecapButton);
    }

    this.renderSearchSection(wrapper);
    this.renderTaskManager(wrapper);
    injectNeuralGardenStyles();
    this.syncBreakLiveUpdates();
  }

  private renderSearchSection(parent: HTMLElement): void {
    const searchSection = parent.createDiv({ cls: "ng-search" });
    searchSection.createEl("h3", { text: "Search Notes" });

    const input = searchSection.createEl("input", {
      type: "text",
      placeholder: "Search Notes...",
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

  private async updateSearchResults(query: string, container: HTMLElement): Promise<void> {
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

  private renderTaskManager(parent: HTMLElement): void {
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
        new Notice("Task manager is in break mode");
        return;
      }
      if (!this.state.overdriveAvailability) {
        new Notice("Overdrive currently not available");
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
    const currentPercent = effectiveMaxEnergy > 0 ? (this.state.totalEnergy / effectiveMaxEnergy) * 100 : 0;

    if (currentPercent >= 115) {
      const warning = progressWrap.createSpan({ cls: "ng-warning" });
      warning.textContent = "⚠";
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
          new Notice("Task manager is in break mode");
          return;
        }

        const taskName = taskInput.value.trim();
        if (!taskName) {
          new Notice("Please type a task first");
          return;
        }

        button.addClass("is-pulsing");
        window.setTimeout(() => button.removeClass("is-pulsing"), 500);

        this.state.tasks.unshift({
          id: createId(),
          taskName,
          effort: effort.key,
          energy: effort.energy,
          completed: false,
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

  private renderTaskRow(container: HTMLElement, task: TaskItem): void {
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
    let titleInput: HTMLInputElement | null = null;

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

  private renderForcedBreakPanel(container: HTMLElement): void {
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
        this.state.forcedBreakEnd = Date.now() + durationMinutes * 60_000;
        await this.persistAndRender();
      });
      return;
    }

    const now = Date.now();
    const end = this.state.forcedBreakEnd ?? now;
    const remainingMs = Math.max(0, end - now);
    const remainingMinutes = Math.floor(remainingMs / 60_000);
    const remainingSeconds = Math.floor((remainingMs % 60_000) / 1000);

    const timer = panel.createDiv({ cls: "ng-break-timer" });
    timer.textContent = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    this.breakTimerEl = timer;

    const message = panel.createDiv({ cls: "ng-break-copy ng-break-copy-animated" });
    message.textContent = this.getNextBreakMessage();
    this.breakMessageEl = message;
  }

  private syncBreakLiveUpdates(): void {
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
      const remainingMinutes = Math.floor(remainingMs / 60_000);
      const remainingSeconds = Math.floor((remainingMs % 60_000) / 1000);
      this.breakTimerEl.textContent = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    if (!this.breakTickTimer) {
      void updateTimer();
      this.breakTickTimer = window.setInterval(() => {
        void updateTimer();
      }, 1000);
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
        }, 12000);
    }
  }

  private getNextBreakMessage(): string {
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

  private updateForcedBreakValues(): void {
    const effectiveThreshold = getEffectiveForcedBreakThreshold(this.state);
    this.state.forcedBreakEnergyEx = Math.max(0, this.state.forcedBreakEnergy - effectiveThreshold);
    this.state.forcedBreakAdd = effectiveThreshold > 0 ? this.state.forcedBreakEnergyEx / effectiveThreshold : 0;
    this.state.forcedBreakTime = this.state.forcedBreakLength + this.state.forcedBreakLength * this.state.forcedBreakAdd;
    if (this.state.forcedBreakEnergy >= effectiveThreshold) {
      this.state.forcedBreak = true;
    }
  }

  private applyBreakRecovery(): void {
    if (!this.state.resting || !this.state.forcedBreakEnd) {
      return;
    }

    if (Date.now() >= this.state.forcedBreakEnd) {
      this.resetForcedBreakState();
    }
  }

  private resetForcedBreakState(): void {
    this.state.forcedBreak = false;
    this.state.resting = false;
    this.state.forcedBreakEnd = undefined;
    this.state.forcedBreakEnergy = 0;
    this.state.forcedBreakEnergyEx = 0;
    this.state.forcedBreakAdd = 0;
    this.state.forcedBreakTime = this.state.forcedBreakLength;
  }

  private getCalculatedBreakTimeMinutes(): number {
    this.updateForcedBreakValues();
    return Math.max(1, Math.round(this.state.forcedBreakTime));
  }

  private shouldShowWeeklyRecapButton(): boolean {
    const dailyCandidates = this.app.vault
      .getFiles()
      .filter((file) => file.path.toLowerCase().includes("daily") || file.path.toLowerCase().includes("journal"));
    return dailyCandidates.length >= WEEKLY_RECAP_MIN_ENTRIES;
  }

  private makeCategoryButton(label: string, iconName: string, onClick: () => void, color = "#EC9A63"): HTMLButtonElement {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.app as any).iconManager?.setIcon?.(icon, iconName);

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
}

function toMutedButtonColor(hex: string, saturationFactor = 0.7, lightnessFactor = 0.6, alpha = 1): string {
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
        h = ((g - b) / d) % 6;
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
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
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

function reduceSaturation(color: string, saturationFactor: number): string {
  const rgb = parseCssColor(color);
  if (!rgb) {
    return color;
  }

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const nextS = Math.max(0, Math.min(1, s * saturationFactor));
  const nextRgb = hslToRgb(h, nextS, l);
  return `rgb(${nextRgb.r}, ${nextRgb.g}, ${nextRgb.b})`;
}

function darkenColor(color: string, lightnessFactor: number): string {
  const rgb = parseCssColor(color);
  if (!rgb) {
    return color;
  }

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const nextL = Math.max(0, Math.min(1, l * lightnessFactor));
  const nextRgb = hslToRgb(h, s, nextL);
  return `rgb(${nextRgb.r}, ${nextRgb.g}, ${nextRgb.b})`;
}

function getEnergyStopGradientPair(percent: number): { primary: string; secondary: string } {
  const stops = ENERGY_STOPS.filter((stop) => stop.percent <= 100);
  if (stops.length === 0) {
    return { primary: "rgb(63, 214, 255)", secondary: "rgb(49, 201, 80)" };
  }

  if (percent <= stops[0].percent) {
    const next = stops[1] ?? stops[0];
    return { primary: stopToCss(stops[0].color), secondary: stopToCss(next.color) };
  }

  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i];
    const next = stops[i + 1];
    if (percent >= current.percent && percent < next.percent) {
      return { primary: stopToCss(current.color), secondary: stopToCss(next.color) };
    }
    if (percent === next.percent) {
      const following = stops[i + 2] ?? next;
      return { primary: stopToCss(next.color), secondary: stopToCss(following.color) };
    }
  }

  const last = stops[stops.length - 1];
  return { primary: stopToCss(last.color), secondary: "#FFFFFF" };
}

function stopToCss(rgb: number[]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function parseCssColor(color: string): { r: number; g: number; b: number } | null {
  const hex = color.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (hex) {
    return {
      r: parseInt(hex[1].slice(0, 2), 16),
      g: parseInt(hex[1].slice(2, 4), 16),
      b: parseInt(hex[1].slice(4, 6), 16),
    };
  }

  const rgb = color.trim().match(/^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/i);
  if (rgb) {
    return {
      r: Math.max(0, Math.min(255, Number(rgb[1]))),
      g: Math.max(0, Math.min(255, Number(rgb[2]))),
      b: Math.max(0, Math.min(255, Number(rgb[3]))),
    };
  }

  return null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) {
      tt += 1;
    }
    if (tt > 1) {
      tt -= 1;
    }
    if (tt < 1 / 6) {
      return p + (q - p) * 6 * tt;
    }
    if (tt < 1 / 2) {
      return q;
    }
    if (tt < 2 / 3) {
      return p + (q - p) * (2 / 3 - tt) * 6;
    }
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  };
}
