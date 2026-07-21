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
      processed: booleanOr(raw.processed, false),
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
    processed: false,
    todaysNote: "",
    emotions: [],
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