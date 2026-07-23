import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { TRACKER_FOLDER, VIEW_TYPE_NEURAL_GARDEN_JOURNALING } from "./constants";
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

type MetricDefinition = {
  key: MetricKey;
  label: string;
  explanation: string;
};

const METRICS: MetricDefinition[] = [
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
const TRACKER_DAYS = 15;
const TRACKER_COLORS = [
  { name: "Green", value: "#39E05A" },
  { name: "Cyan", value: "#00F0FF" },
  { name: "Blue", value: "#5B8CFF" },
  { name: "Purple", value: "#A78BFA" },
  { name: "Orange", value: "#EC9A63" },
  { name: "Red", value: "#FF6565" },
];

export class NeuralGardenJournalingView extends ItemView {
  private calendarMonth = startOfMonth(new Date());
  private selectedDateKey: string | null = null;
  private dailyEntries: JournalEntryRecord[] = [];
  private trackers: JournalTrackerRecord[] = [];
  private selectedEntry: JournalEntryRecord | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly taskStorage: TaskManagerStorage,
    private readonly journalingStorage: JournalingStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openJournalEntryView: (dateKey: string, editable: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_NEURAL_GARDEN_JOURNALING;
  }

  getDisplayText(): string {
    return "Journaling";
  }

  getIcon(): string {
    return "book-open";
  }

  async onOpen(): Promise<void> {
    injectNeuralGardenStyles();
    await this.reloadState();
    this.render();
  }

  async onClose(): Promise<void> {
    this.selectedEntry = null;
    this.selectedDateKey = null;
  }

  private async reloadState(): Promise<void> {
    await this.journalingStorage.ensureJournalFolders();
    this.dailyEntries = await this.journalingStorage.listDailyEntries();
    this.trackers = (await this.journalingStorage.listTrackers()).slice(0, 18);

    if (this.selectedDateKey) {
      if (!this.dailyEntries.some((entry) => entry.frontmatter.date === this.selectedDateKey)) {
        const latest = this.dailyEntries[this.dailyEntries.length - 1];
        if (latest) {
          this.selectedDateKey = latest.frontmatter.date;
          this.calendarMonth = startOfMonth(parseDateKey(this.selectedDateKey) ?? new Date());
        }
      } else {
        this.calendarMonth = startOfMonth(parseDateKey(this.selectedDateKey) ?? new Date());
      }
    }
    this.selectedEntry = null;
  }

  private render(): void {
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

  private renderDailySection(parent: HTMLElement): void {
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
    this.renderSelectedEntry(details);

    const trackerSection = section.createDiv({ cls: "ng-tracker-section" });
    this.renderTrackers(trackerSection);
  }

  private renderCalendar(container: HTMLElement): void {
    const entryDates = new Set(this.dailyEntries.map((entry) => entry.frontmatter.date));
    const weeks = buildCalendarWeeks(this.calendarMonth, entryDates);
    const grid = container.createDiv({ cls: "ng-journal-calendar-grid" });
    grid.createDiv({ cls: "ng-journal-calendar-weekday ng-journal-calendar-week-header", text: "Week" });
    for (const label of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      grid.createDiv({ cls: "ng-journal-calendar-weekday", text: label });
    }

    for (const week of weeks) {
      const weekButton = grid.createEl("button");
      weekButton.type = "button";
      weekButton.addClass("ng-journal-week-cell");
      weekButton.textContent = String(week.weekNumber);
      weekButton.title = week.entryCount >= 4 ? `Week ${week.weekNumber}: ${week.entryCount} entries` : `Week ${week.weekNumber}: ${week.entryCount} entries (need 4)`;
      if (week.entryCount >= 4) {
        weekButton.addClass("is-available");
        weekButton.addEventListener("click", () => {
          new Notice(`Weekly reflection for week ${week.weekNumber} is ready.`);
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
          this.selectedDateKey = cell.dateKey;
          this.calendarMonth = startOfMonth(parseDateKey(cell.dateKey) ?? new Date());
          this.selectedEntry = this.dailyEntries.find((entry) => entry.frontmatter.date === cell.dateKey) ?? null;
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

  private renderSelectedEntry(container: HTMLElement): void {
    const entry = this.selectedEntry;
    const card = container.createDiv({ cls: "ng-journal-entry-card" });
    if (!entry) {
      card.createEl("h3", { text: "No Entry" });
      card.createDiv({ cls: "ng-empty", text: "Select a day with an entry to view its stats." });
      return;
    }

    card.createEl("h3", { text: `Journal Entry - ${formatReadableDate(entry.frontmatter.date)}` });
    card.createEl("h4", { cls: "ng-journal-preview-summary", text: "Summary" });
    this.renderMetrics(card, entry.frontmatter);
    this.renderEmotionList(card, entry.frontmatter.emotions, true);
    this.renderTrackedTrackers(card, entry.frontmatter.date);
    this.renderTaskSnapshots(card, entry.frontmatter);
    this.renderBody(card, entry.body);
  }

  private renderTrackedTrackers(container: HTMLElement, dateKey: string): void {
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

  private renderMetrics(container: HTMLElement, frontmatter: JournalEntryFrontmatter): void {
    const grid = container.createDiv({ cls: "ng-journal-metrics" });
    for (const metric of METRICS) {
      const value = frontmatter[metric.key];
      const row = grid.createDiv({ cls: "ng-journal-metric" });
      const meta = row.createDiv({ cls: "ng-journal-metric-meta" });
      meta.createDiv({ cls: "ng-journal-metric-label", text: metric.label });
      const bar = row.createDiv({ cls: "ng-journal-progress ng-journal-progress-readonly" });
      const fill = bar.createDiv({ cls: "ng-journal-progress-fill" });

      const nextValue = value ?? 0;
      fill.style.width = `${nextValue}%`;
      fill.style.backgroundColor = metricColor(metric.key, nextValue);
    }
  }

  private renderEmotionList(container: HTMLElement, emotions: string[], readOnly = false): void {
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
        chip.addClass(getEmotionToneClass(emotion));
      }
    }
  }

  private renderTaskSnapshots(container: HTMLElement, frontmatter: JournalEntryFrontmatter): void {
    const hasTasks = frontmatter.completedTasks.length > 0 || frontmatter.uncompletedTasks.length > 0;
    if (!hasTasks) {
      return;
    }

    const tasks = container.createDiv({ cls: "ng-journal-tasks" });
    tasks.createEl("h4", { text: "Tasks" });
    this.renderTaskSnapshotGroup(tasks, "Completed Tasks", frontmatter.completedTasks);
    this.renderTaskSnapshotGroup(tasks, "Uncompleted Tasks", frontmatter.uncompletedTasks);
  }

  private renderTaskSnapshotGroup(container: HTMLElement, title: string, tasks: Array<{ taskName: string; effort: string; energy: number }>): void {
    if (tasks.length === 0) {
      return;
    }

    const group = container.createDiv({ cls: "ng-journal-task-group" });
    group.createEl("h5", { text: title });
    for (const task of tasks) {
      const row = group.createDiv({ cls: "ng-journal-task-row" });
      row.createDiv({ cls: "ng-journal-task-name", text: task.taskName });
      const badge = row.createSpan({ cls: "ng-journal-task-badge", text: effortLabel(task.effort as EffortKey) });
      badge.style.borderColor = effortColor(task.effort as EffortKey);
      badge.style.color = effortColor(task.effort as EffortKey);
    }
  }

  private renderEntryMeta(container: HTMLElement, frontmatter: JournalEntryFrontmatter): void {
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

  private renderBody(container: HTMLElement, body: string): void {
    const section = container.createDiv({ cls: "ng-journal-body" });
    section.createEl("h4", { text: "Entry" });
    section.createDiv({ cls: "ng-journal-body-copy", text: body.length > 0 ? body : "No entry text yet." });
  }

  private renderTrackers(container: HTMLElement): void {
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
    const submitTracker = async (color: string) => {
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
          this.trackers = this.trackers.map((candidate) => (candidate.file.path === next.file.path ? next : candidate));
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

  private shiftCalendarMonth(amount: number): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + amount, 1);
    this.render();
  }
}

function valueOrDash(value: number | null): string {
  return value === null ? "-" : String(value);
}

function todayKey(): string {
  return formatDateKey(new Date());
}

function yesterdayKey(): string {
  const previous = new Date();
  previous.setDate(previous.getDate() - 1);
  return formatDateKey(previous);
}

function isEditableBackfillDate(dateKey: string): boolean {
  return dateKey === todayKey() || dateKey === yesterdayKey();
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date | null {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonthPickerValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatReadableDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  const day = date.getDate();
  return `${day}${ordinalSuffix(day)} of ${date.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
}

function ordinalSuffix(day: number): string {
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

function buildCalendarWeeks(
  month: Date,
  entryDates: Set<string>,
): Array<{ weekNumber: number; entryCount: number; days: Array<{ dateKey: string; day: number; outsideMonth: boolean }> }> {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const start = startOfWeek(monthStart);
  const weeks: Array<{ weekNumber: number; entryCount: number; days: Array<{ dateKey: string; day: number; outsideMonth: boolean }> }> = [];

  for (let cursor = new Date(start); cursor <= monthEnd; cursor.setDate(cursor.getDate() + 7)) {
    const weekStart = new Date(cursor);
    const days: Array<{ dateKey: string; day: number; outsideMonth: boolean }> = [];
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
        outsideMonth: date.getMonth() !== month.getMonth(),
      });
    }

    weeks.push({
      weekNumber: getIsoWeekNumber(weekStart),
      entryCount,
      days,
    });
  }

  return weeks;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  return result;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getIsoWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function buildTrackerWindow(days: number): Array<{ dateKey: string; day: number }> {
  const today = new Date();
  const cells: Array<{ dateKey: string; day: number }> = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    cells.push({ dateKey: formatDateKey(date), day: date.getDate() });
  }
  return cells;
}

function normalizeHexColor(color: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#EC9A63";
}

function chooseReadableTextColor(backgroundHex: string): string {
  const rgb = parseHexColor(backgroundHex);
  if (!rgb) {
    return "#ffffff";
  }
  const whiteContrast = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const blackContrast = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
  return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!match) {
    return null;
  }
  const value = match[1];
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function contrastRatio(left: { r: number; g: number; b: number }, right: { r: number; g: number; b: number }): number {
  const l1 = relativeLuminance(left);
  const l2 = relativeLuminance(right);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: { r: number; g: number; b: number }): number {
  const [r, g, b] = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function streakEndingAt(dates: string[], dateKey: string): number {
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

function metricColor(metric: MetricKey, value: number): string {
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

function getEmotionToneClass(emotion: string): string {
  return PLEASANT_EMOTIONS.includes(emotion) ? "pleasant" : "unpleasant";
}
