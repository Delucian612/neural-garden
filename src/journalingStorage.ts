import { App, TFile, parseYaml, stringifyYaml } from "obsidian";
import {
  JOURNAL_DAILY_FOLDER,
  JOURNAL_MONTHLY_FOLDER,
  JOURNAL_WEEKLY_FOLDER,
  TRACKER_FOLDER,
} from "./constants";
import {
  JournalEntryFrontmatter,
  JournalEntryRecord,
  JournalTaskSnapshot,
  JournalTrackerFrontmatter,
  JournalTrackerRecord,
  WeeklyRecapFrontmatter,
} from "./types";

const FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n?/;
const ENTRY_HEADING_REGEX = /^# Entry\s*(?:\n|\r\n)+/i;

export class JournalingStorage {
  constructor(private readonly app: App) {}

  async ensureJournalFolders(): Promise<void> {
    await this.ensureFolderExists(JOURNAL_DAILY_FOLDER);
    await this.ensureFolderExists(JOURNAL_WEEKLY_FOLDER);
    await this.ensureFolderExists(JOURNAL_MONTHLY_FOLDER);
    await this.ensureFolderExists(TRACKER_FOLDER);
  }

  async listDailyEntries(): Promise<JournalEntryRecord[]> {
    const files = this.app.vault
      .getFiles()
      .filter((file) => file.path.startsWith(`${JOURNAL_DAILY_FOLDER}/`) && file.extension === "md");

    const entries = await Promise.all(files.map(async (file) => this.readDailyEntry(file)));
    return entries.sort((left, right) => left.frontmatter.date.localeCompare(right.frontmatter.date));
  }

  async readDailyEntryByDate(dateKey: string): Promise<JournalEntryRecord | null> {
    const file = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
    if (!(file instanceof TFile)) {
      return null;
    }
    return this.readDailyEntry(file);
  }

  async createDailyEntry(frontmatter: JournalEntryFrontmatter, bodyText: string): Promise<JournalEntryRecord> {
    const file = await this.ensureDailyFile(frontmatter.date);
    await this.app.vault.modify(file, this.buildDailyContent(frontmatter, bodyText));
    return { file, frontmatter, body: bodyText };
  }

  async saveDailyEntry(file: TFile, frontmatter: JournalEntryFrontmatter, bodyText: string): Promise<void> {
    await this.app.vault.modify(file, this.buildDailyContent(frontmatter, bodyText));
  }

  async ensureWeeklyRecapFile(year: number, week: number): Promise<TFile> {
    const path = this.weeklyRecapPath(year, week);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      return existing;
    }
    await this.ensureFolderExists(JOURNAL_WEEKLY_FOLDER);
    const frontmatter = defaultWeeklyFrontmatter(year, week);
    try {
      return await this.app.vault.create(path, `${this.serializeFrontmatter(frontmatter)}\n`);
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(path);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create weekly recap at ${path}`);
    }
  }

  async readWeeklyRecap(file: TFile): Promise<{ frontmatter: WeeklyRecapFrontmatter; body: string }> {
    const content = await this.app.vault.read(file);
    const frontmatter = normalizeWeeklyFrontmatter(this.extractFrontmatter(content));
    const body = content.replace(FRONTMATTER_REGEX, "").replace(/^\s+|\s+$/g, "");
    return { frontmatter, body };
  }

  async saveWeeklyRecap(file: TFile, frontmatter: WeeklyRecapFrontmatter, body: string): Promise<void> {
    const content = `${this.serializeFrontmatter(frontmatter)}\n${body.replace(/^\s+/, "")}`;
    await this.app.vault.modify(file, content.replace(/\s+$/, "") + "\n");
  }

  weeklyRecapPath(year: number, week: number): string {
    return `${JOURNAL_WEEKLY_FOLDER}/${year}-W${String(week).padStart(2, "0")}.md`;
  }

  async listTrackers(): Promise<JournalTrackerRecord[]> {
    const files = this.app.vault
      .getFiles()
      .filter((file) => file.path.startsWith(`${TRACKER_FOLDER}/`) && file.extension === "md");

    const trackers = await Promise.all(files.map(async (file) => this.readTracker(file))); 
    return trackers.sort((left, right) => left.name.localeCompare(right.name));
  }

  async upsertTracker(name: string, color: string): Promise<JournalTrackerRecord> {
    const fileName = sanitizeFileName(name);
    const path = `${TRACKER_FOLDER}/${fileName}.md`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    const dates = existing instanceof TFile ? (await this.readTracker(existing)).dates : [];
    const file = existing instanceof TFile ? existing : await this.createTrackerFile(path, name, color, dates);
    const frontmatter = { Date: dates, color } satisfies JournalTrackerFrontmatter;
    await this.writeTrackerFile(file, name, frontmatter, dates);
    return { file, name, frontmatter, dates, color };
  }

  async toggleTrackerDate(tracker: JournalTrackerRecord, dateKey: string): Promise<JournalTrackerRecord> {
    const nextDates = tracker.dates.includes(dateKey)
      ? tracker.dates.filter((candidate) => candidate !== dateKey)
      : [...tracker.dates, dateKey];
    nextDates.sort();
    const frontmatter = { Date: nextDates, color: tracker.color } satisfies JournalTrackerFrontmatter;
    await this.writeTrackerFile(tracker.file, tracker.name, frontmatter, nextDates);
    return { ...tracker, frontmatter, dates: nextDates };
  }

  private async ensureDailyFile(dateKey: string): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
    if (existing instanceof TFile) {
      return existing;
    }

    await this.ensureFolderExists(JOURNAL_DAILY_FOLDER);
    try {
      return await this.app.vault.create(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`, this.buildDailyContent(defaultDailyFrontmatter(dateKey), ""));
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${dateKey}.md`);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create daily journal file for ${dateKey}`);
    }
  }

  private async readDailyEntry(file: TFile): Promise<JournalEntryRecord> {
    const content = await this.app.vault.read(file);
    const frontmatter = this.normalizeDailyFrontmatter(this.extractFrontmatter(content), file.basename);
    const body = this.extractEntryBody(content);
    return { file, frontmatter, body };
  }

  private async readTracker(file: TFile): Promise<JournalTrackerRecord> {
    const content = await this.app.vault.read(file);
    const frontmatter = this.normalizeTrackerFrontmatter(this.extractFrontmatter(content));
    return {
      file,
      name: file.basename,
      frontmatter,
      dates: frontmatter.Date,
      color: frontmatter.color,
    };
  }

  private async createTrackerFile(path: string, name: string, color: string, dates: string[]): Promise<TFile> {
    await this.ensureFolderExists(TRACKER_FOLDER);
    const frontmatter = { Date: dates, color } satisfies JournalTrackerFrontmatter;
    const content = this.buildTrackerContent(name, frontmatter, dates);
    try {
      return await this.app.vault.create(path, content);
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(path);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create tracker note at ${path}`);
    }
  }

  private async writeTrackerFile(
    file: TFile,
    name: string,
    frontmatter: JournalTrackerFrontmatter,
    dates: string[],
  ): Promise<void> {
    await this.app.vault.modify(file, this.buildTrackerContent(name, frontmatter, dates));
  }

  private buildDailyContent(frontmatter: JournalEntryFrontmatter, bodyText: string): string {
    const body = bodyText.replace(/\s+$/, "");
    const entryBody = body.length > 0 ? `# Entry\n\n${body}\n` : `# Entry\n`;
    return `${this.serializeFrontmatter(frontmatter)}\n${entryBody}`;
  }

  private buildTrackerContent(name: string, frontmatter: JournalTrackerFrontmatter, dates: string[] = frontmatter.Date): string {
    const safeDates = [...dates].sort();
    const content = `# ${name}\n`;
    return `${this.serializeFrontmatter({ Date: safeDates, color: frontmatter.color })}\n${content}`;
  }

  private extractFrontmatter(content: string): Record<string, unknown> {
    const match = content.match(FRONTMATTER_REGEX);
    if (!match) {
      return {};
    }
    const parsed = parseYaml(match[0].replace(/^---\n|\n---\n?$/g, ""));
    return (parsed as Record<string, unknown>) ?? {};
  }

  private extractEntryBody(content: string): string {
    const withoutFrontmatter = content.replace(FRONTMATTER_REGEX, "");
    return withoutFrontmatter.replace(ENTRY_HEADING_REGEX, "").replace(/\s+$/, "");
  }

  private serializeFrontmatter(frontmatter: Record<string, unknown>): string {
    return `---\n${stringifyYaml(frontmatter).replace(/\s+$/, "")}\n---`;
  }

  private normalizeDailyFrontmatter(raw: Record<string, unknown>, fallbackDate: string): JournalEntryFrontmatter {
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
      spentEnergy: numberOr(raw.spentEnergy, 0),
      completedTasks: snapshotArray(raw.completedTasks),
      uncompletedTasks: snapshotArray(raw.uncompletedTasks),
      todaysNote: stringOr(raw.todaysNote, ""),
      emotions: stringArrayOr(raw.emotions),
    };
  }

  private normalizeTrackerFrontmatter(raw: Record<string, unknown>): JournalTrackerFrontmatter {
    return {
      Date: stringArrayOr(raw.Date),
      color: stringOr(raw.color, "#EC9A63"),
    };
  }

  private async ensureFolderExists(path: string): Promise<void> {
    const segments = path.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (this.app.vault.getAbstractFileByPath(currentPath)) {
        continue;
      }

      try {
        await this.app.vault.createFolder(currentPath);
      } catch {
        if (this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
      }
    }
  }
}

function defaultDailyFrontmatter(dateKey: string): JournalEntryFrontmatter {
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
    todaysNote: "",
    emotions: [],
  };
}

function defaultWeeklyFrontmatter(year: number, week: number): WeeklyRecapFrontmatter {
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
      socialLoad: 0,
    },
    emotionCounts: {
      pleasant: {},
      unpleasant: {},
      pleasantTotal: 0,
      unpleasantTotal: 0,
    },
    trackerCounts: {},
    taskAdjustments: {
      maxEnergy: { from: 100, to: 100 },
      forcedBreakThreshold: { from: 70, to: 70 },
      forcedBreakLength: { from: 20, to: 20 },
    },
  };
}

function normalizeWeeklyFrontmatter(raw: Record<string, unknown>): WeeklyRecapFrontmatter {
  const year = numberOr(raw.year, new Date().getFullYear());
  const week = numberOr(raw.week, 1);
  const defaults = defaultWeeklyFrontmatter(year, week);
  const averagesRaw = (raw.averages && typeof raw.averages === "object") ? raw.averages as Record<string, unknown> : {};
  const emotionRaw = (raw.emotionCounts && typeof raw.emotionCounts === "object") ? raw.emotionCounts as Record<string, unknown> : {};
  const taskRaw = (raw.taskAdjustments && typeof raw.taskAdjustments === "object") ? raw.taskAdjustments as Record<string, unknown> : {};
  const processedRangeRaw = (raw.processedDateRange && typeof raw.processedDateRange === "object")
    ? raw.processedDateRange as Record<string, unknown>
    : {};
  const journalLinks = stringArrayOr(raw.journalLinks);
  const derivedRange = deriveProcessedDateRangeFromLinks(journalLinks);

  return {
    week,
    year,
    generatedAt: stringOr(raw.generatedAt, ""),
    processedDateRange: {
      start: stringOr(processedRangeRaw.start, derivedRange.start),
      end: stringOr(processedRangeRaw.end, derivedRange.end),
    },
    journalLinks,
    supportNotes: stringArrayOr(raw.supportNotes),
    supportNoteReasons: normalizeStringMap(raw.supportNoteReasons),
    missingSupportSymptoms: stringArrayOr(raw.missingSupportSymptoms),
    criticalDays: normalizeStringArrayMap(raw.criticalDays),
    supportHints: stringArrayOr(raw.supportHints),
    seeds: stringArrayOr(raw.seeds),
    averages: {
      mood: numberOr(averagesRaw.mood, defaults.averages.mood),
      sleep: numberOr(averagesRaw.sleep, defaults.averages.sleep),
      regulation: numberOr(averagesRaw.regulation, defaults.averages.regulation),
      stress: numberOr(averagesRaw.stress, defaults.averages.stress),
      anxiety: numberOr(averagesRaw.anxiety, defaults.averages.anxiety),
      exhaustion: numberOr(averagesRaw.exhaustion, defaults.averages.exhaustion),
      sensoryLoad: numberOr(averagesRaw.sensoryLoad, defaults.averages.sensoryLoad),
      socialLoad: numberOr(averagesRaw.socialLoad, defaults.averages.socialLoad),
    },
    emotionCounts: {
      pleasant: normalizeCountMap(emotionRaw.pleasant),
      unpleasant: normalizeCountMap(emotionRaw.unpleasant),
      pleasantTotal: numberOr(emotionRaw.pleasantTotal, defaults.emotionCounts.pleasantTotal),
      unpleasantTotal: numberOr(emotionRaw.unpleasantTotal, defaults.emotionCounts.unpleasantTotal),
    },
    trackerCounts: normalizeCountMap(raw.trackerCounts),
    taskAdjustments: {
      maxEnergy: normalizeDelta(taskRaw.maxEnergy, defaults.taskAdjustments.maxEnergy),
      forcedBreakThreshold: normalizeDelta(taskRaw.forcedBreakThreshold, defaults.taskAdjustments.forcedBreakThreshold),
      forcedBreakLength: normalizeDelta(taskRaw.forcedBreakLength, defaults.taskAdjustments.forcedBreakLength),
    },
  };
}

function deriveProcessedDateRangeFromLinks(journalLinks: string[]): { start: string; end: string } {
  const dateKeys = journalLinks
    .map((link) => {
      const match = link.match(/\[\[(\d{4}-\d{2}-\d{2})\]\]/);
      return match?.[1] ?? "";
    })
    .filter((value) => value.length > 0)
    .sort();
  if (dateKeys.length === 0) {
    return { start: "", end: "" };
  }
  return { start: dateKeys[0], end: dateKeys[dateKeys.length - 1] };
}

function normalizeCountMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    map[key] = numberOr(raw, 0);
  }
  return map;
}

function normalizeStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") {
      map[key] = raw;
    }
  }
  return map;
}

function normalizeStringArrayMap(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    map[key] = stringArrayOr(raw);
  }
  return map;
}

function normalizeDelta(value: unknown, fallback: { from: number; to: number }): { from: number; to: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }
  const record = value as Record<string, unknown>;
  return {
    from: numberOr(record.from, fallback.from),
    to: numberOr(record.to, fallback.to),
  };
}

function sanitizeFileName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|#^]/g, "-").replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : "Untitled Tracker";
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function numberOrNullable(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringArrayOr(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item)).filter((item) => item.length > 0);
}

function snapshotArray(value: unknown): JournalTaskSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return undefined;
      }
      const record = item as Partial<JournalTaskSnapshot>;
      return {
        taskName: typeof record.taskName === "string" ? record.taskName : "Untitled Task",
        effort: typeof record.effort === "string" ? record.effort : "easy",
        energy: typeof record.energy === "number" && Number.isFinite(record.energy) ? record.energy : 15,
      };
    })
    .filter((item): item is JournalTaskSnapshot => item !== undefined);
}