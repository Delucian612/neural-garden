import { ItemView, Notice, WorkspaceLeaf, setIcon } from "obsidian";
import { EFFORTS, VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY } from "./constants";
import { JournalingStorage } from "./journalingStorage";
import { openOverlay } from "./overlay";
import { injectNeuralGardenStyles } from "./styles";
import { TaskManagerStorage } from "./storage";
import { effortColor, effortLabel } from "./taskState";
import { EffortKey, JournalEntryFrontmatter, JournalEntryRecord, JournalTrackerRecord } from "./types";

type MetricKey =
  | "mood"
  | "sleep"
  | "stress"
  | "anxiety"
  | "exhaustion"
  | "regulation"
  | "sensoryLoad"
  | "socialLoad";

const METRICS: Array<{ key: MetricKey; label: string; explanation: string }> = [
  { key: "mood", label: "Mood", explanation: "How have you been feeling?" },
  { key: "sleep", label: "Sleep", explanation: "How rested did you feel after sleeping?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself?" },
  { key: "stress", label: "Stress", explanation: "How stressed were you?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel?" },
  { key: "sensoryLoad", label: "Sensory Load", explanation: "Have you had any sensory issues? How intense were they?" },
  { key: "socialLoad", label: "Social Load", explanation: "How demanding were social interactions?" },
];

const PLEASANT_EMOTIONS = [
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
  "Curious",
];
const UNPLEASANT_EMOTIONS = [
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
  "Tense",
];
const MAX_EMOTIONS = 7;

export class NeuralGardenJournalEntryView extends ItemView {
  private entry: JournalEntryRecord | null = null;
  private editable = false;
  private trackers: JournalTrackerRecord[] = [];
  private saveChain: Promise<void> = Promise.resolve();
  private compactStats = false;
  private taskEditMode = false;
  private collapseTimer: number | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly taskStorage: TaskManagerStorage,
    private readonly journalingStorage: JournalingStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openJournalingView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY;
  }

  getDisplayText(): string {
    return "Journal Entry";
  }

  getIcon(): string {
    return "book-marked";
  }

  async onOpen(): Promise<void> {
    injectNeuralGardenStyles();
    this.renderEmpty();
  }

  async onClose(): Promise<void> {
    this.entry = null;
    this.saveChain = Promise.resolve();
    this.compactStats = false;
    this.taskEditMode = false;
    if (this.collapseTimer !== null) {
      window.clearTimeout(this.collapseTimer);
      this.collapseTimer = null;
    }
  }

  async openForDate(dateKey: string, editable: boolean): Promise<void> {
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

  private async showEntry(entry: JournalEntryRecord): Promise<void> {
    this.entry = entry;
    this.trackers = await this.journalingStorage.listTrackers();
    this.compactStats = !this.editable && this.entry.body.trim().length > 0;
    this.taskEditMode = false;
    this.render();
  }

  private setCompactStats(compact: boolean): void {
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

  private openCreationConfirmation(dateKey: string): void {
    const { card, close } = openOverlay("Are your tasks up to date?", false);
    card.createDiv({
      cls: "ng-overlay-text",
      text: "Continuing will capture the current task list in this journal entry.",
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
      } catch {
        continueButton.disabled = false;
        cancelButton.disabled = false;
        new Notice("Could not create the journal entry.");
      }
    });
  }

  private async createDraftEntry(dateKey: string): Promise<JournalEntryRecord> {
    const taskState = await this.taskStorage.loadTaskManagerState();
    const completedSnapshots = taskState.tasks.filter((task) => task.completed).map(snapshotTask);
    const uncompletedSnapshots = taskState.tasks.filter((task) => !task.completed).map(snapshotTask);
    const entry: JournalEntryFrontmatter = {
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
      emotions: [],
    };

    const created = await this.journalingStorage.createDailyEntry(entry, "");

    // Verify that task snapshots are written before resetting Task Manager state.
    const persisted = await this.journalingStorage.readDailyEntryByDate(dateKey);
    const tasksWritten =
      persisted !== null
      && persisted.frontmatter.completedTasks.length === completedSnapshots.length
      && persisted.frontmatter.uncompletedTasks.length === uncompletedSnapshots.length;

    if (!tasksWritten) {
      await this.journalingStorage.saveDailyEntry(created.file, entry, "");
      const secondRead = await this.journalingStorage.readDailyEntryByDate(dateKey);
      const secondWriteOk =
        secondRead !== null
        && secondRead.frontmatter.completedTasks.length === completedSnapshots.length
        && secondRead.frontmatter.uncompletedTasks.length === uncompletedSnapshots.length;
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
      taskState.forcedBreakEnd = undefined;
      taskState.forcedBreakEnergy = 0;
      taskState.forcedBreakEnergyEx = 0;
      taskState.forcedBreakAdd = 0;
      taskState.forcedBreakTime = taskState.forcedBreakLength;
      await this.taskStorage.saveTaskManagerState(taskState);
    }

    return (await this.journalingStorage.readDailyEntryByDate(dateKey)) as JournalEntryRecord;
  }

  private renderEmpty(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const empty = contentEl.createDiv({ cls: "ng-journal-entry-page" });
    empty.createDiv({ cls: "ng-empty", text: "Open a journal date to start editing or reviewing it." });
  }

  private render(): void {
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
    const secondaryCheckIn = fullCheckIn.createDiv({ cls: "ng-journal-secondary-check-in" });
    this.renderEmotions(secondaryCheckIn);
    this.renderTrackerSection(secondaryCheckIn);
    this.renderGoodThing(secondaryCheckIn);
    this.renderTasks(secondaryCheckIn);
    this.renderEntryBody(wrapper);
    this.syncCollapseHeights(wrapper);
  }

  private syncCollapseHeights(page: HTMLElement): void {
    const fullCheckIn = page.querySelector(".ng-journal-full-check-in");
    const compactSummary = page.querySelector(".ng-journal-compact-summary");
    if (fullCheckIn instanceof HTMLElement) {
      page.style.setProperty("--ng-journal-full-height", `${fullCheckIn.scrollHeight}px`);
    }
    if (compactSummary instanceof HTMLElement) {
      page.style.setProperty("--ng-journal-compact-height", `${compactSummary.scrollHeight}px`);
    }
  }

  private renderCompactSummary(parent: HTMLElement): void {
    if (!this.entry) {
      return;
    }

    const summary = parent.createDiv({ cls: "ng-journal-compact-summary" });
    const heading = summary.createDiv({ cls: "ng-journal-compact-heading" });
    heading.createSpan({ text: "Daily Check In" });

    const metrics = summary.createDiv({ cls: "ng-journal-compact-metrics" });
    for (const metric of METRICS) {
      const value = this.entry.frontmatter[metric.key] ?? 0;
      const item = metrics.createDiv({ cls: "ng-journal-compact-metric" });
      item.createSpan({ text: metric.label });
      const track = item.createSpan({ cls: "ng-journal-compact-track" });
      const fill = track.createSpan({ cls: "ng-journal-compact-fill" });
      fill.style.width = `${value}%`;
      fill.style.backgroundColor = metricColor(metric.key, value);
    }

    const details = summary.createDiv({ cls: "ng-journal-compact-details" });
    const addDetailRow = (label: string, values: Array<{ text: string; color?: string; tone?: string }>) => {
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
      tone: getEmotionToneClass(emotion),
    })));
    addDetailRow(
      "Trackers",
      this.trackers
        .filter((tracker) => tracker.dates.includes(this.entry!.frontmatter.date))
        .map((tracker) => ({ text: tracker.name, color: tracker.color })),
    );
    addDetailRow("One Good Thing", this.entry.frontmatter.goodThing
      ? [{ text: this.entry.frontmatter.goodThing }]
      : []);
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
      cls: "ng-journal-nav-button ng-journal-compact-expand",
    });
    expandButton.addEventListener("click", () => this.setCompactStats(false));
  }

  private renderGoodThing(parent: HTMLElement): void {
    if (!this.entry) {
      return;
    }

    const block = parent.createDiv({ cls: "ng-journal-good-thing" });
    block.createEl("h4", { text: "One Good Thing About Today" });
    if (!this.editable) {
      const input = block.createEl("input", {
        type: "text",
        cls: "ng-task-input ng-journal-good-thing-input",
        placeholder: "Name one good thing from today",
      });
      input.readOnly = true;
      input.value = this.entry.frontmatter.goodThing || "";
      block.createDiv({
        cls: "ng-journal-good-thing-value",
        text: "This entry is read-only in the introduction preview.",
      });
      return;
    }

    const input = block.createEl("input", {
      type: "text",
      cls: "ng-task-input ng-journal-good-thing-input",
      placeholder: "Name one good thing from today",
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

  private renderTrackerSection(parent: HTMLElement): void {
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
        this.trackers = this.trackers.map((candidate) => (candidate.file.path === next.file.path ? next : candidate));
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

  private makeNavButton(label: string, onClick: () => Promise<void>): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = "ng-home-category-button ng-journal-nav-button";
    button.addEventListener("click", () => {
      void onClick();
    });
    return button;
  }

  private renderMetrics(parent: HTMLElement): void {
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

      const update = (currentValue: number | null) => {
        const next = currentValue ?? 0;
        fill.style.width = `${next}%`;
        fill.style.backgroundColor = metricColor(metric.key, next);
      };

      update(value);
      if (this.editable) {
        bar.style.touchAction = "none";
        const updateFromClientX = (clientX: number) => this.updateMetricFromPointer(clientX, metric.key, fill, bar);
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

          const moveHandler = (moveEvent: PointerEvent) => {
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

  private updateMetricFromPointer(clientX: number, key: MetricKey, fill: HTMLElement, bar: HTMLElement): void {
    if (!this.entry || !this.editable) {
      return;
    }

    const rect = bar.getBoundingClientRect();
    const nextValue = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    this.entry.frontmatter[key] = nextValue;
    fill.style.width = `${nextValue}%`;
    fill.style.backgroundColor = metricColor(key, nextValue);
  }

  private renderEmotions(parent: HTMLElement): void {
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
    const renderGroup = (emotions: string[], className: string) => {
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
              new Notice(`You can choose up to ${MAX_EMOTIONS} emotions.`);
              return;
            }
            selected.add(emotion);
          }
          this.entry!.frontmatter.emotions = [...selected];
          this.render();
          void this.persist();
        });
      }
    };

    renderGroup(PLEASANT_EMOTIONS, "pleasant");
    renderGroup(UNPLEASANT_EMOTIONS, "unpleasant");
  }

  private renderEmotionList(container: HTMLElement, emotions: string[], readOnly = false): void {
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

  private renderTasks(parent: HTMLElement): void {
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
      setIcon(editButton, this.taskEditMode ? "check" : "pencil");
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

  private renderTaskEditor(parent: HTMLElement): void {
    const form = parent.createDiv({ cls: "ng-journal-task-editor" });
    const nameInput = form.createEl("input", { type: "text", placeholder: "Task name", cls: "ng-task-input" });
    const efforts = form.createDiv({ cls: "ng-journal-task-efforts" });
    const addTask = async (effort: (typeof EFFORTS)[number]) => {
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
        { taskName, effort: effort.key, energy: effort.energy },
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

  private renderTaskGroup(
    parent: HTMLElement,
    title: string,
    tasks: Array<{ taskName: string; effort: EffortKey; energy: number }>,
    listKey: "completedTasks" | "uncompletedTasks",
  ): void {
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
        setIcon(deleteButton, "x");
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

  private renderEntryBody(parent: HTMLElement): void {
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
      if (!this.entry || !this.editable) {
        return;
      }
      this.entry.body = body.innerText.replace(/\r\n/g, "\n");
      if (this.entry.body.length > 0) {
        const stickyHeader = this.contentEl.querySelector(".ng-journal-entry-sticky-header");
        stickyHeader?.querySelector(".ng-journal-compact-summary")?.remove();
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

  private async persist(): Promise<void> {
    if (!this.entry || !this.editable) {
      return;
    }

    const file = this.entry.file;
    const next = async () => {
      await this.journalingStorage.saveDailyEntry(file, this.entry!.frontmatter, this.entry!.body);
    };

    this.saveChain = this.saveChain.then(next).catch(() => undefined);
    await this.saveChain;
  }
}

function snapshotTask(task: { taskName: string; effort: EffortKey; energy: number }) {
  return { taskName: task.taskName, effort: task.effort, energy: task.energy };
}

function currentDateKey(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function yesterdayDateKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isEditableJournalDate(dateKey: string): boolean {
  return dateKey === currentDateKey() || dateKey === yesterdayDateKey();
}

function formatReadableDate(dateKey: string): string {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateKey;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function metricColor(metric: MetricKey, value: number): string {
  const clamped = Math.max(0, Math.min(100, value));
  if (metric === "regulation" || metric === "mood" || metric === "sleep") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [255, 101, 101] },
      { value: 30, color: [255, 150, 66] },
      { value: 50, color: [244, 211, 94] },
      { value: 85, color: [57, 224, 90] },
      { value: 100, color: [57, 240, 90] },
    ]);
  }
  if (metric === "stress" || metric === "anxiety") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [57, 224, 90] },
      { value: 40, color: [244, 211, 94] },
      { value: 65, color: [240, 160, 76] },
      { value: 85, color: [255, 101, 101] },
      { value: 100, color: [255, 50, 50] },
    ]);
  }
  if (metric === "exhaustion" || metric === "sensoryLoad" || metric === "socialLoad") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [57, 224, 90] },
      { value: 40, color: [244, 211, 94] },
      { value: 65, color: [240, 160, 76] },
      { value: 85, color: [255, 101, 101] },
      { value: 100, color: [255, 50, 50] },
    ]);
  }
  return "#39e05a";
}

function interpolateMetricStops(
  value: number,
  stops: Array<{ value: number; color: [number, number, number] }>,
): string {
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
      const color: [number, number, number] = [
        Math.round(start.color[0] + (end.color[0] - start.color[0]) * ratio),
        Math.round(start.color[1] + (end.color[1] - start.color[1]) * ratio),
        Math.round(start.color[2] + (end.color[2] - start.color[2]) * ratio),
      ];
      return rgbToHex(color);
    }
  }

  return rgbToHex(stops[stops.length - 1].color);
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getMetricFeedback(metric: MetricKey, value: number): string {
  if (metric === "mood") {
    if (value >= 85) return "I've been doing great.";
    if (value >= 60) return "I've been doing good.";
    if (value >= 41) return "I've been doing okay.";
    if (value >= 25) return "I've been struggling here and there.";
    return "I've been having a hard time.";
  }
  if (metric === "sleep") {
    if (value >= 80) return "My sleep was great, I feel well rested.";
    if (value >= 61) return "My sleep was good, I feel rested.";
    if (value >= 41) return "My sleep was alright-ish.";
    if (value >= 31) return "I have had struggles with sleep.";
    if (value >= 21) return "I didn't really sleep well.";
    return "I've had a terrible night.";
  }
  if (metric === "regulation") {
    if (value >= 70) return "Regulation felt strong and steady.";
    if (value >= 51) return "I was mostly able to regulate myself.";
    if (value >= 30) return "Regulation was mixed, with some difficult moments.";
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

function getEmotionToneClass(emotion: string): string {
  return PLEASANT_EMOTIONS.includes(emotion) ? "pleasant" : "unpleasant";
}
