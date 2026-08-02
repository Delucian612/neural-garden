import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import {
  BREAK_MESSAGES,
  DEFAULT_STATE,
  EFFORT_MAP,
  EFFORTS,
  ENERGY_STOPS,
  JOURNAL_WEEKLY_FOLDER,
  NOTES_FOLDER,
  QUICK_NOTES_CATEGORY,
  VIEW_TYPE_NEURAL_GARDEN_HOME,
  WEEKLY_RECAP_HOME_HINT_MIN_ENTRIES,
} from "./constants";
import { JournalingStorage } from "./journalingStorage";
import { MyNotesStorage } from "./myNotesStorage";
import { openOverlay } from "./overlay";
import { TaskManagerStorage } from "./storage";
import { injectNeuralGardenStyles } from "./styles";
import {
  createId,
  effortColor,
  effortLabel,
  energyColorAt,
  recalculateTotals,
} from "./taskState";
import {
  EffortKey,
  TaskItem,
  TaskManagerState,
  WeeklyRecapFrontmatter,
  WeeklyTaskEffort,
} from "./types";
export class NeuralGardenHomeView extends ItemView {
  state: TaskManagerState = { ...DEFAULT_STATE };
  breakTickTimer: number | null = null;
  breakMessageTimer: number | null = null;
  breakTimerEl: HTMLElement | null = null;
  breakMessageEl: HTMLElement | null = null;
  lastBreakMessageIndex: number | null = null;
  supportHintTimer: number | null = null;
  supportHintEl: HTMLElement | null = null;
  supportHints: string[] = [];
  lastSupportHintIndex: number | null = null;
  refocusTaskInputAfterRender = false;
  weeklyTasksEl: HTMLElement | null = null;
  taskManagerEl: HTMLElement | null = null;
  energyAnimationFromPercent: number | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly storage: TaskManagerStorage,
    private readonly journalingStorage: JournalingStorage,
    private readonly myNotesStorage: MyNotesStorage,
    private forcedBreaksEnabled: boolean,
    private readonly openJournalingView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyNotesView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyLearningView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openWeeklyRecap: (year: number, week: number, targetLeaf?: WorkspaceLeaf) => Promise<void>,
  ) {
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
    if (this.forcedBreaksEnabled) {
      this.applyBreakRecovery();
    } else {
      this.resetForcedBreakState();
    }
    await this.storage.saveTaskManagerState(this.state);
    this.render();
    this.startBreakTicker();
  }

  async onClose(): Promise<void> {
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

  private startBreakTicker(): void {
    this.syncBreakLiveUpdates();
  }

  async setForcedBreaksEnabled(enabled: boolean): Promise<void> {
    this.forcedBreaksEnabled = enabled;
    if (!enabled) {
      this.resetForcedBreakState();
    }
    await this.persistAndRender();
  }

  private async persistAndRender(): Promise<void> {
    recalculateTotals(this.state);
    this.applyBreakRecovery();
    await this.storage.saveTaskManagerState(this.state);
    this.renderTaskManagerOnly();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");

    const wrapper = contentEl.createDiv({ cls: "neural-garden-home" });
    wrapper.createEl("h2", { text: "Home" });

    const hintStrip = wrapper.createDiv({ cls: "ng-home-hints-strip" });
    hintStrip.style.display = "none";
    void this.renderSupportHintsStrip(hintStrip);

    const categories = wrapper.createDiv({ cls: "ng-categories" });
    if (this.shouldShowWeeklyRecapHint()) {
      const recapHint = categories.createDiv({
        cls: "ng-weekly-available-hint",
        text: "Weekly Recap Available",
      });
      recapHint.setAttribute("role", "button");
      recapHint.tabIndex = 0;
      const openRecap = async () => {
        const week = isoWeekInfo(new Date());
        await this.openWeeklyRecap(week.year, week.week, this.leaf);
      };
      recapHint.addEventListener("click", () => void openRecap());
      recapHint.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void openRecap();
        }
      });
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
      this.openQuickNoteOverlay();
    });
    categoryGrid.appendChild(quickNoteButton);

    const learningButton = this.makeCategoryButton("MyLearning", "brain", () => {
      void this.openMyLearningView(true, this.leaf);
    });
    categoryGrid.appendChild(learningButton);

    this.weeklyTasksEl = wrapper.createDiv({ cls: "ng-this-week-tasks" });
    this.weeklyTasksEl.style.display = "none";
    void this.renderWeeklyPlannedTasks(this.weeklyTasksEl);
    this.taskManagerEl = wrapper.createDiv({ cls: "ng-task-manager" });
    this.renderTaskManager(this.taskManagerEl);
    const supportSection = wrapper.createDiv({ cls: "ng-home-support" });
    void this.renderSupportSection(supportSection);
    injectNeuralGardenStyles();
    this.syncBreakLiveUpdates();
  }

  private openQuickNoteOverlay(): void {
    const { card, close } = openOverlay("Create A QuickNote");
    card.createDiv({ cls: "ng-overlay-subtitle", text: "Write down a name" });
    card.createDiv({ cls: "ng-overlay-text", text: `Category: ${QUICK_NOTES_CATEGORY}` });

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
      if (!file) {
        new Notice("Could not create the note. Try a different name.");
        return;
      }
      await this.myNotesStorage.toggleNoteCategory(file, QUICK_NOTES_CATEGORY);
      close();
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

  private async renderSupportSection(container: HTMLElement): Promise<void> {
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
      text: "Considering your current symptoms, take a look at the following notes.",
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
        const target = this.app.vault
          .getMarkdownFiles()
          .find((file) => file.basename === name && file.path.startsWith(`${NOTES_FOLDER}/`));
        if (!target) {
          new Notice(`Support note not found: ${name}`);
          return;
        }
        await this.leaf.openFile(target);
      });
    }
  }

  private async renderSupportHintsStrip(container: HTMLElement): Promise<void> {
    container.empty();
    const recap = await this.getLatestWeeklyRecapFrontmatter();
    this.supportHints = recap?.supportHints ?? [];
    if (this.supportHints.length === 0) {
      if (this.supportHintTimer) {
        window.clearInterval(this.supportHintTimer);
        this.supportHintTimer = null;
      }
      this.supportHintEl = null;
      container.remove();
      return;
    }

    container.style.removeProperty("display");
    this.supportHintEl = container.createDiv({ cls: "ng-home-support-hint" });
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

  private async getLatestWeeklyRecapFrontmatter(): Promise<WeeklyRecapFrontmatter | null> {
    return (await this.getLatestWeeklyRecap())?.frontmatter ?? null;
  }

  private async getLatestWeeklyRecap(): Promise<{
    file: TFile;
    frontmatter: WeeklyRecapFrontmatter;
    body: string;
  } | null> {
    const recaps = this.app.vault
      .getFiles()
      .filter((file) => file.path.startsWith(`${JOURNAL_WEEKLY_FOLDER}/`) && file.extension === "md");
    if (recaps.length === 0) {
      return null;
    }

    let latestRecap: { file: TFile; frontmatter: WeeklyRecapFrontmatter; body: string } | null = null;
    let latestTime = Number.NEGATIVE_INFINITY;

    for (const recapFile of recaps) {
      const recap = await this.journalingStorage.readWeeklyRecap(recapFile);
      const stamp = Date.parse(recap.frontmatter.generatedAt || "");
      const comparableTime = Number.isNaN(stamp) ? recapFile.stat.ctime : stamp;
      if (!latestRecap || comparableTime > latestTime) {
        latestRecap = { file: recapFile, ...recap };
        latestTime = comparableTime;
      }
    }

    return latestRecap;
  }

  private renderTaskManagerOnly(): void {
    if (!this.taskManagerEl?.isConnected) {
      this.render();
      return;
    }
    if (this.weeklyTasksEl?.isConnected) {
      void this.renderWeeklyPlannedTasks(this.weeklyTasksEl);
    }
    this.renderTaskManager(this.taskManagerEl);
    this.syncBreakLiveUpdates();
  }

  private renderTaskManager(section: HTMLElement): void {
    section.empty();
    section.removeClass("ng-resting", "ng-break-locked");
    if (this.state.resting) {
      section.addClass("ng-resting");
    }

    const isBreakActive = this.state.forcedBreak || this.state.resting;
    if (isBreakActive) {
      section.addClass("ng-break-locked");
    }

    const form = section.createDiv({ cls: "ng-task-form" });

    const heading = form.createDiv({ cls: "ng-task-heading" });
    heading.createEl("h3", { text: "Add New Task" });

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

    const currentPercent = this.state.maxEnergy > 0 ? (this.state.totalEnergy / this.state.maxEnergy) * 100 : 0;

    if (currentPercent >= 115) {
      const warning = progressWrap.createSpan({ cls: "ng-warning" });
      warning.textContent = "⚠";
      warning.ariaLabel = "Warning";
    }

    const barOuter = progressWrap.createDiv({ cls: "ng-progress" });
    const barInner = barOuter.createDiv({ cls: "ng-progress-fill" });

    const targetPercent = Math.max(0, Math.min(currentPercent, 130));
    const animationStart = this.energyAnimationFromPercent;
    this.energyAnimationFromPercent = null;
    barInner.style.width = `${animationStart === null ? targetPercent : Math.max(0, Math.min(animationStart, 130))}%`;
    const pair = getEnergyStopGradientPair(currentPercent);
    const secondaryColor = darkenColor(pair.secondary, 0.7);
    barInner.style.background = `linear-gradient(120deg, ${pair.primary}, ${secondaryColor}, ${pair.primary})`;
    barInner.style.backgroundSize = "200% 100%";
    if (animationStart !== null) {
      void barInner.offsetWidth;
      window.requestAnimationFrame(() => {
        barInner.style.width = `${targetPercent}%`;
      });
    }

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

        this.energyAnimationFromPercent = currentPercent;
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

  private async renderWeeklyPlannedTasks(container: HTMLElement): Promise<void> {
    container.empty();
    container.style.display = "none";
    if (this.state.forcedBreak || this.state.resting) {
      return;
    }

    const recap = await this.getLatestWeeklyRecap();
    if (!recap) {
      return;
    }

    const recapPath = recap.file.path;
    if (!container.isConnected) {
      return;
    }

    const convertedCounts = new Map<string, number>();
    for (const task of this.state.tasks) {
      if (task.completed || task.weeklySource?.recapPath !== recapPath) {
        continue;
      }
      const key = weeklyTaskKey(task.weeklySource.taskName, task.weeklySource.effort);
      convertedCounts.set(key, (convertedCounts.get(key) ?? 0) + 1);
    }
    const availableTasks = recap.frontmatter.nextWeekTasks.filter((task) => {
      const key = weeklyTaskKey(task.taskName, task.effort);
      const converted = convertedCounts.get(key) ?? 0;
      if (converted === 0) {
        return true;
      }
      convertedCounts.set(key, converted - 1);
      return false;
    });

    if (availableTasks.length === 0) {
      return;
    }

    container.style.removeProperty("display");
    const heading = container.createDiv({ cls: "ng-this-week-heading" });
    heading.createEl("h4", { text: "This Week's Tasks" });
    const taskList = container.createDiv({ cls: "ng-this-week-buttons" });
    for (const plannedTask of availableTasks) {
      const effortKey = weeklyEffortToTaskEffort(plannedTask.effort);
      const effort = EFFORT_MAP.get(effortKey);
      if (!effort) {
        continue;
      }
      const row = taskList.createDiv({ cls: "ng-this-week-task" });
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.dataset.effort = effort.key;
      const badgeColor = taskBadgeColor(effort.key);
      row.style.setProperty("--ng-weekly-effort-color", badgeColor);
      const effortDot = row.createSpan({ cls: "ng-this-week-task-effort-dot" });
      effortDot.title = `${effort.label} effort`;
      const textContainer = row.createDiv({ cls: "ng-task-text" });
      const taskName = textContainer.createDiv({ cls: "ng-task-title ng-this-week-task-name", text: plannedTask.taskName });
      taskName.title = plannedTask.taskName;
      let activating = false;
      const activate = async () => {
        if (activating) {
          return;
        }
        if (this.state.forcedBreak || this.state.resting) {
          new Notice("Task manager is in break mode");
          return;
        }
        activating = true;
        row.setAttribute("aria-disabled", "true");
        this.energyAnimationFromPercent = this.state.maxEnergy > 0
          ? (this.state.totalEnergy / this.state.maxEnergy) * 100
          : 0;
        this.state.tasks.unshift({
          id: createId(),
          taskName: plannedTask.taskName,
          effort: effort.key,
          energy: effort.energy,
          completed: false,
          weeklySource: {
            recapPath,
            taskName: plannedTask.taskName,
            effort: plannedTask.effort,
          },
        });
        await this.persistAndRender();
      };
      row.addEventListener("click", () => void activate());
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void activate();
        }
      });
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
    const badgeColor = taskBadgeColor(task.effort);
    badge.style.setProperty("--ng-task-badge-color", badgeColor);
    badge.style.borderColor = badgeColor;
    badge.style.color = badgeColor;

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
        if (this.forcedBreaksEnabled) {
          this.state.forcedBreakEnergy += task.energy;
          this.updateForcedBreakValues();
        }
        await this.removeCompletedWeeklyTask(task);
        await this.persistAndRender();
      }, 720);
    });
  }

  private async removeCompletedWeeklyTask(task: TaskItem): Promise<void> {
    const source = task.weeklySource;
    if (!source) {
      return;
    }
    const recapFile = this.app.vault.getAbstractFileByPath(source.recapPath);
    if (!(recapFile instanceof TFile)) {
      return;
    }
    try {
      const recap = await this.journalingStorage.readWeeklyRecap(recapFile);
      const taskIndex = recap.frontmatter.nextWeekTasks.findIndex((plannedTask) => (
        plannedTask.taskName === source.taskName && plannedTask.effort === source.effort
      ));
      if (taskIndex < 0) {
        return;
      }
      recap.frontmatter.nextWeekTasks.splice(taskIndex, 1);
      await this.journalingStorage.saveWeeklyRecap(recapFile, recap.frontmatter, recap.body);
    } catch {
      new Notice("Task completed, but its Weekly Recap entry could not be removed.");
    }
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
      const breakButton = panel.createEl("button", { text: "Start my Break" });
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
    if (!this.forcedBreaksEnabled) {
      this.resetForcedBreakState();
      return;
    }
    const effectiveThreshold = this.state.forcedBreakThreshold;
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

  private shouldShowWeeklyRecapHint(): boolean {
    const today = new Date();
    const week = isoWeekInfo(today);
    const recapPath = this.journalingStorage.weeklyRecapPath(week.year, week.week);
    const recapFile = this.app.vault.getAbstractFileByPath(recapPath);
    if (recapFile) {
      return false;
    }

    const dailyCandidates = this.app.vault
      .getFiles()
      .filter((file) => file.path.startsWith("Journal/Daily/") && file.extension === "md");

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

  private getNextSupportHint(): string {
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

function parseDateFromDailyFileName(baseName: string): Date | null {
  const match = baseName.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function isoWeekInfo(date: Date): { year: number; week: number } {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: utcDate.getUTCFullYear(), week };
}

function weeklyEffortToTaskEffort(effort: WeeklyTaskEffort): EffortKey {
  const effortMap: Record<WeeklyTaskEffort, EffortKey> = {
    light: "easy-peasy",
    easy: "easy",
    fair: "medium",
    hard: "hard",
    heavy: "heavy",
  };
  return effortMap[effort];
}

function taskBadgeColor(effort: EffortKey): string {
  if (effort === "heavy") {
    return toMutedButtonColor(effortColor(effort), 0.78, 0.68);
  }
  return toMutedButtonColor(effortColor(effort), 0.9, 0.75);
}

function weeklyTaskKey(taskName: string, effort: WeeklyTaskEffort): string {
  return `${taskName}\u0000${effort}`;
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
