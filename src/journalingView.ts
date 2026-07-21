import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { TRACKER_FOLDER, VIEW_TYPE_NEURAL_GARDEN_JOURNALING } from "./constants";
import { JournalingStorage } from "./journalingStorage";
import { injectNeuralGardenStyles } from "./styles";
import { TaskManagerStorage } from "./storage";
import { effortColor, effortLabel } from "./taskState";
import { EffortKey, JournalEntryFrontmatter, JournalEntryRecord, JournalTrackerRecord } from "./types";

type JournalSection = "daily" | "weekly" | "monthly";

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
  { key: "stress", label: "Stress", explanation: "How stressed were you today?" },
  { key: "anxiety", label: "Anxiety", explanation: "Have you been anxious today? How intense was it?" },
  { key: "exhaustion", label: "Exhaustion", explanation: "How exhausted did you feel today?" },
  { key: "regulation", label: "Regulation", explanation: "How well were you able to regulate yourself today?" },
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
const TRACKER_DAYS = 21;

export class NeuralGardenJournalingView extends ItemView {
  private section: JournalSection = "daily";
  private calendarMonth = startOfMonth(new Date());
  private selectedDateKey = todayKey();
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
  }

  private async reloadState(): Promise<void> {
    await this.journalingStorage.ensureJournalFolders();
    this.dailyEntries = await this.journalingStorage.listDailyEntries();
    this.trackers = (await this.journalingStorage.listTrackers()).slice(0, 18);

    if (!this.dailyEntries.some((entry) => entry.frontmatter.date === this.selectedDateKey)) {
      const latest = this.dailyEntries[this.dailyEntries.length - 1];
      if (latest) {
        this.selectedDateKey = latest.frontmatter.date;
      }
    }

    this.calendarMonth = startOfMonth(parseDateKey(this.selectedDateKey) ?? new Date());
    this.selectedEntry = this.dailyEntries.find((entry) => entry.frontmatter.date === this.selectedDateKey) ?? null;
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

  private makeModeButton(container: HTMLElement, section: JournalSection, label: string): void {
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

  private renderPlaceholder(parent: HTMLElement, section: JournalSection): void {
    const placeholder = parent.createDiv({ cls: "ng-journal-placeholder" });
    placeholder.createEl("h3", { text: section === "weekly" ? "Weekly Recap" : "Monthly Reflection" });
    placeholder.createDiv({
      cls: "ng-empty",
      text: section === "weekly" ? "Weekly recap is intentionally left as a placeholder for now." : "Monthly reflection is intentionally left as a placeholder for now.",
    });
  }

  private renderDailySection(parent: HTMLElement): void {
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

  private renderCalendar(container: HTMLElement): void {
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
        this.selectedDateKey = cell.dateKey;
        this.calendarMonth = startOfMonth(parseDateKey(cell.dateKey) ?? new Date());
        this.selectedEntry = this.dailyEntries.find((entry) => entry.frontmatter.date === cell.dateKey) ?? null;
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

  private renderSelectedEntry(container: HTMLElement): void {
    const entry = this.selectedEntry;
    const card = container.createDiv({ cls: "ng-journal-entry-card" });
    if (!entry) {
      card.createEl("h3", { text: "No Entry" });
      card.createDiv({ cls: "ng-empty", text: "Select a day with an entry to view its stats." });
      return;
    }

    card.createEl("h3", { text: `Journal Entry - ${formatReadableDate(entry.frontmatter.date)}` });
    this.renderMetrics(card, entry.frontmatter);
    this.renderEmotionList(card, entry.frontmatter.emotions, true);
    this.renderTaskSnapshots(card, entry.frontmatter);
    this.renderBody(card, entry.body);
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
        new Notice("Please enter a tracker name first.");
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
          this.trackers = this.trackers.map((candidate) => (candidate.file.path === next.file.path ? next : candidate));
          this.render();
        });
      }
    }
  }
}

function valueOrDash(value: number | null): string {
  return value === null ? "-" : String(value);
}

function todayKey(): string {
  return formatDateKey(new Date());
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

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
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

function buildCalendarCells(month: Date): Array<{ dateKey: string; day: number; outsideMonth: boolean }> {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  const cells: Array<{ dateKey: string; day: number; outsideMonth: boolean }> = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    cells.push({
      dateKey: formatDateKey(date),
      day: date.getDate(),
      outsideMonth: date.getMonth() !== month.getMonth(),
    });
  }
  return cells;
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

function getEmotionToneClass(emotion: string): string {
  return PLEASANT_EMOTIONS.includes(emotion) ? "pleasant" : "unpleasant";
}
