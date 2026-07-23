import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY } from "./constants";
import { JournalingStorage } from "./journalingStorage";
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
  { key: "mood", label: "Mood", explanation: "How have you been feeling today?" },
  { key: "sleep", label: "Sleep", explanation: "How rested did you feel after tonight's sleep?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself today?" },
  { key: "stress", label: "Stress", explanation: "How stressed were you today?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious today? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel today?" },
  { key: "sensoryLoad", label: "Sensory Load", explanation: "Have you had any sensory issues? How intense were they?" },
  { key: "socialLoad", label: "Social Load", explanation: "How demanding were social interactions today?" },
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
  private liveTaskSnapshots: {
    completed: Array<{ taskName: string; effort: EffortKey; energy: number }>;
    uncompleted: Array<{ taskName: string; effort: EffortKey; energy: number }>;
  } | null = null;
  private saveChain: Promise<void> = Promise.resolve();

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
    this.liveTaskSnapshots = null;
    this.saveChain = Promise.resolve();
  }

  async openForDate(dateKey: string, editable: boolean): Promise<void> {
    this.editable = editable && isEditableJournalDate(dateKey);
    this.entry = (await this.journalingStorage.readDailyEntryByDate(dateKey)) ?? (await this.createDraftEntry(dateKey));
    this.trackers = await this.journalingStorage.listTrackers();
    if (this.editable) {
      const taskState = await this.taskStorage.loadTaskManagerState();
      this.liveTaskSnapshots = {
        completed: taskState.tasks.filter((task) => task.completed).map(snapshotTask),
        uncompleted: taskState.tasks.filter((task) => !task.completed).map(snapshotTask),
      };
    } else {
      this.liveTaskSnapshots = null;
    }
    this.render();
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
      processed: false,
      todaysNote: "",
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
      if (taskState.overdriveMode) {
        taskState.overdriveMode = false;
        taskState.overdriveAftereffects = true;
      } else if (taskState.overdriveAftereffects) {
        taskState.overdriveAftereffects = false;
      }
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
    const topBar = wrapper.createDiv({ cls: "ng-journal-topbar" });
    topBar.appendChild(this.makeNavButton("Home", async () => this.openHomeView(true, this.leaf)));
    topBar.appendChild(this.makeNavButton("Back to Journaling", async () => this.openJournalingView(true, this.leaf)));

    const titleWrap = topBar.createDiv({ cls: "ng-journal-title-wrap" });
    titleWrap.createEl("h2", { text: `Journal Entry - ${formatReadableDate(this.entry.frontmatter.date)}` });
    titleWrap.createEl("h3", { text: "Daily Check In" });

    this.renderMetrics(wrapper);
    this.renderEmotions(wrapper);
    this.renderTrackerSection(wrapper);
    this.renderTasks(wrapper);
    this.renderEntryBody(wrapper);
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

  private renderNote(parent: HTMLElement): void {
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

  private renderTasks(parent: HTMLElement): void {
    if (!this.entry) {
      return;
    }

    const liveCompleted = this.editable && this.liveTaskSnapshots ? this.liveTaskSnapshots.completed : [];
    const liveUncompleted = this.editable && this.liveTaskSnapshots ? this.liveTaskSnapshots.uncompleted : [];
    const hasLiveTasks = liveCompleted.length > 0 || liveUncompleted.length > 0;

    const completedTasks = hasLiveTasks
      ? liveCompleted
      : this.entry.frontmatter.completedTasks;
    const uncompletedTasks = hasLiveTasks
      ? liveUncompleted
      : this.entry.frontmatter.uncompletedTasks;

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

  private renderTaskGroup(
    parent: HTMLElement,
    title: string,
    tasks: Array<{ taskName: string; effort: EffortKey; energy: number }>,
  ): void {
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
      { value: 46, color: [240, 160, 76] },
      { value: 61, color: [244, 211, 94] },
      { value: 85, color: [57, 224, 90] },
      { value: 100, color: [57, 224, 90] },
    ]);
  }
  if (metric === "stress" || metric === "anxiety") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [57, 224, 90] },
      { value: 36, color: [244, 211, 94] },
      { value: 51, color: [240, 160, 76] },
      { value: 85, color: [255, 101, 101] },
      { value: 100, color: [255, 101, 101] },
    ]);
  }
  if (metric === "exhaustion" || metric === "sensoryLoad" || metric === "socialLoad") {
    return interpolateMetricStops(clamped, [
      { value: 0, color: [57, 224, 90] },
      { value: 41, color: [244, 211, 94] },
      { value: 56, color: [240, 160, 76] },
      { value: 85, color: [255, 101, 101] },
      { value: 100, color: [255, 101, 101] },
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
    if (value >= 80) return "I've been doing great.";
    if (value >= 51) return "I've been doing fine.";
    if (value >= 36) return "I've been alright.";
    return "I've been having a hard time today.";
  }
  if (metric === "sleep") {
    if (value >= 70) return "My sleep was great, I feel well rested.";
    if (value >= 51) return "My sleep was good, I feel rested.";
    if (value >= 36) return "My sleep was alright.";
    return "I've had a terrible night.";
  }
  if (metric === "regulation") {
    if (value >= 70) return "Regulation felt strong and steady today.";
    if (value >= 51) return "I was mostly able to regulate myself today.";
    if (value >= 36) return "Regulation was mixed, with some difficult moments.";
    return "I felt overwhelmed and dysregulated today.";
  }
  if (metric === "stress") {
    if (value >= 75) return "I've been constantly stressed today.";
    if (value >= 65) return "I was really stressed today.";
    if (value >= 41) return "Stress was present today, but I was able to manage it.";
    return "Stress has been fairly low today.";
  }
  if (metric === "anxiety") {
    if (value >= 75) return "I've been constantly and severely anxious today.";
    if (value >= 55) return "I was really anxious today.";
    if (value >= 41) return "I've experienced anxiety here and there.";
    return "I had low or no anxiety.";
  }
  if (metric === "exhaustion") {
    if (value >= 70) return "I've felt extremely exhausted all day.";
    if (value >= 46) return "I felt heavily exhausted today.";
    if (value >= 31) return "I was noticeably tired, but still functioning.";
    return "My energy felt steady today.";
  }
  if (metric === "sensoryLoad") {
    if (value >= 70) return "I was in sensory overload today.";
    if (value >= 46) return "I've had demanding sensory issues today.";
    if (value >= 31) return "I've had fair sensory issues.";
    return "I've had no or low sensory issues.";
  }
  if (metric === "socialLoad") {
    if (value >= 70) return "Social interactions were highly demanding, wearing me out.";
    if (value >= 46) return "Social interactions were exhausting.";
    if (value >= 31) return "Social interactions were tiring today.";
    return "Social interactions felt good, easy, and natural.";
  }
  if (value >= 70) return "Regulation felt strong and steady today.";
  if (value >= 51) return "I was mostly able to regulate myself today.";
  if (value >= 36) return "Regulation was mixed, with some difficult moments.";
  return "I felt overwhelmed and dysregulated today.";
}

function getEmotionToneClass(emotion: string): string {
  return PLEASANT_EMOTIONS.includes(emotion) ? "pleasant" : "unpleasant";
}
