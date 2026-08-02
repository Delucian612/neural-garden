import { App, EventRef, TFile } from "obsidian";
import {
  JOURNAL_DAILY_FOLDER,
  MY_LEARNING_CONFIG_FILE_PATH,
  MY_NOTES_CATEGORIES_FILE_PATH,
  TASK_MANAGER_FILE_PATH,
} from "./constants";
import { JournalingStorage } from "./journalingStorage";
import { TaskManagerStorage } from "./storage";
import { recalculateTotals } from "./taskState";
import { JournalEntryFrontmatter } from "./types";

export type OnboardingDemoState = {
  id: string;
  createdPaths: string[];
  snapshots: Record<string, string | null>;
  journalDates: string[];
  year: number;
  week: number;
};

type PersistDemoState = (state: OnboardingDemoState | null) => void | Promise<void>;

const SNAPSHOT_PATHS = [
  TASK_MANAGER_FILE_PATH,
  MY_NOTES_CATEGORIES_FILE_PATH,
  MY_LEARNING_CONFIG_FILE_PATH,
];

export class OnboardingDemoSession {
  private state: OnboardingDemoState | null;
  private eventRefs: EventRef[] = [];
  private expectedPrefixes: string[] = [];
  private expectedRemaining = 0;
  private expectationExpiresAt = 0;

  constructor(
    private readonly app: App,
    private readonly journalingStorage: JournalingStorage,
    private readonly taskStorage: TaskManagerStorage,
    initialState: OnboardingDemoState | null,
    private readonly persist: PersistDemoState,
  ) {
    this.state = initialState;
  }

  get journalDates(): string[] {
    return this.state?.journalDates ?? [];
  }

  get nameSuffix(): string {
    return this.state?.id.slice(-6) ?? "demo";
  }

  get year(): number {
    return this.state?.year ?? 0;
  }

  get week(): number {
    return this.state?.week ?? 0;
  }

  async begin(): Promise<void> {
    await this.cleanup();
    const snapshots: Record<string, string | null> = {};
    for (const path of SNAPSHOT_PATHS) {
      const file = this.app.vault.getAbstractFileByPath(path);
      snapshots[path] = file instanceof TFile ? await this.app.vault.read(file) : null;
    }
    const { year, week, dates } = this.findEmptyDemoWeek();
    this.state = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdPaths: [],
      snapshots,
      journalDates: dates,
      year,
      week,
    };
    this.bindVaultEvents();
    await this.persist(this.state);
  }

  async seedJournalEntries(): Promise<void> {
    const dates = this.journalDates.slice(0, 3);
    for (const [index, date] of dates.entries()) {
      this.expectCreatedFiles([`${JOURNAL_DAILY_FOLDER}/`]);
      const frontmatter: JournalEntryFrontmatter = {
        date,
        mood: 35 + index * 5,
        sleep: 40,
        stress: 85 - index * 3,
        anxiety: 76,
        exhaustion: 72,
        regulation: 38,
        sensoryLoad: 68,
        socialLoad: 65,
        spentEnergy: 40,
        completedTasks: [],
        uncompletedTasks: [],
        goodThing: "A temporary onboarding journal entry.",
        emotions: ["Overwhelmed", "Drained"],
      };
      await this.journalingStorage.createDailyEntry(frontmatter, "Temporary Neural Garden onboarding entry.");
    }
  }

  async seedJournalEntryMeasurements(dateKey: string): Promise<void> {
    let entry = await this.journalingStorage.readDailyEntryByDate(dateKey);
    for (let attempt = 0; !entry && attempt < 20; attempt += 1) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
      entry = await this.journalingStorage.readDailyEntryByDate(dateKey);
    }
    if (!entry) {
      return;
    }
    Object.assign(entry.frontmatter, {
      mood: 62,
      sleep: 54,
      stress: 68,
      anxiety: 58,
      exhaustion: 64,
      regulation: 48,
      sensoryLoad: 57,
      socialLoad: 52,
    });
    await this.journalingStorage.saveDailyEntry(entry.file, entry.frontmatter, entry.body);
  }

  async seedHomeTask(): Promise<void> {
    if (!this.state) {
      return;
    }
    const state = await this.taskStorage.loadTaskManagerState();
    const id = `ng-onboarding-${this.state.id}`;
    if (state.tasks.some((task) => task.id === id)) {
      return;
    }
    state.tasks.unshift({
      id,
      taskName: "Explore Neural Garden",
      effort: "easy",
      energy: 15,
      completed: false,
    });
    recalculateTotals(state);
    await this.taskStorage.saveTaskManagerState(state);
  }

  async ensureWeeklyRecapSupportOutputs(year: number, week: number, supportNoteName: string): Promise<void> {
    const path = this.journalingStorage.weeklyRecapPath(year, week);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
      return;
    }
    const recap = await this.journalingStorage.readWeeklyRecap(file);
    if (!recap.frontmatter.supportNotes.includes(supportNoteName)) {
      recap.frontmatter.supportNotes = [supportNoteName, ...recap.frontmatter.supportNotes];
    }
    recap.frontmatter.supportNoteReasons = {
      ...recap.frontmatter.supportNoteReasons,
      [supportNoteName]: recap.frontmatter.supportNoteReasons[supportNoteName] ?? "Stress",
    };
    if (recap.frontmatter.supportHints.length === 0) {
      recap.frontmatter.supportHints = ["Lowering pace is still progress."];
    }
    await this.journalingStorage.saveWeeklyRecap(file, recap.frontmatter, recap.body);
  }

  expectCreatedFiles(prefixes: string[], maxCount = 1): void {
    this.expectedPrefixes = prefixes;
    this.expectedRemaining = maxCount;
    this.expectationExpiresAt = Date.now() + 10_000;
  }

  async cleanup(): Promise<void> {
    this.unbindVaultEvents();
    this.clearExpectation();
    const state = this.state;
    if (!state) {
      return;
    }

    for (const path of [...state.createdPaths].reverse()) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        try {
          await this.app.vault.delete(file, true);
        } catch (error) {
          console.error(`[Neural Garden] Could not delete onboarding demo file: ${path}`, error);
        }
      }
    }

    // Also delete any markdown files tagged with this demo id in case a path was missed.
    const taggedDemoFiles = this.app.vault.getMarkdownFiles().filter((file) => {
      const taggedId = this.app.metadataCache.getFileCache(file)?.frontmatter?.neuralGardenDemo;
      return typeof taggedId === "string" && taggedId === state.id;
    });
    for (const file of taggedDemoFiles) {
      try {
        await this.app.vault.delete(file, true);
      } catch (error) {
        console.error(`[Neural Garden] Could not delete tagged onboarding demo file: ${file.path}`, error);
      }
    }

    for (const [path, content] of Object.entries(state.snapshots)) {
      const file = this.app.vault.getAbstractFileByPath(path);
      try {
        if (content === null) {
          if (file instanceof TFile) {
            await this.app.vault.delete(file, true);
          }
        } else if (file instanceof TFile) {
          await this.app.vault.modify(file, content);
        } else {
          await this.ensureParentFolder(path);
          await this.app.vault.create(path, content);
        }
      } catch (error) {
        console.error(`[Neural Garden] Could not restore onboarding snapshot: ${path}`, error);
      }
    }

    this.state = null;
    await this.persist(null);
  }

  private bindVaultEvents(): void {
    this.unbindVaultEvents();
    this.eventRefs.push(this.app.vault.on("create", (file) => {
      if (
        !(file instanceof TFile)
        || !this.state
        || SNAPSHOT_PATHS.includes(file.path)
        || Date.now() > this.expectationExpiresAt
        || this.expectedRemaining <= 0
        || !this.expectedPrefixes.some((prefix) => file.path.startsWith(prefix))
      ) {
        return;
      }
      this.addCreatedPath(file.path);
      this.expectedRemaining -= 1;
      if (this.expectedRemaining <= 0) {
        this.clearExpectation();
      }
      if (file.extension === "md") {
        window.setTimeout(() => void this.markDemoFile(file), 100);
      }
    }));
    this.eventRefs.push(this.app.vault.on("rename", (file, oldPath) => {
      if (!this.state || !(file instanceof TFile)) {
        return;
      }
      const index = this.state.createdPaths.indexOf(oldPath);
      if (index < 0) {
        return;
      }
      this.state.createdPaths[index] = file.path;
      void this.persist(this.state);
    }));
  }

  private unbindVaultEvents(): void {
    for (const ref of this.eventRefs) {
      this.app.vault.offref(ref);
    }
    this.eventRefs = [];
  }

  private clearExpectation(): void {
    this.expectedPrefixes = [];
    this.expectedRemaining = 0;
    this.expectationExpiresAt = 0;
  }

  private addCreatedPath(path: string): void {
    if (!this.state || this.state.createdPaths.includes(path)) {
      return;
    }
    this.state.createdPaths.push(path);
    void this.persist(this.state);
  }

  private async markDemoFile(file: TFile): Promise<void> {
    const state = this.state;
    if (!state || !state.createdPaths.includes(file.path) || !file.parent) {
      return;
    }
    try {
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter.neuralGardenDemo = state.id;
      });
    } catch {
      // The persisted path manifest remains the cleanup authority.
    }
  }

  private findEmptyDemoWeek(): { year: number; week: number; dates: string[] } {
    for (let year = 1990; year >= 1970; year -= 1) {
      const januaryFourth = new Date(year, 0, 4, 12);
      const monday = new Date(januaryFourth);
      monday.setDate(januaryFourth.getDate() - ((januaryFourth.getDay() + 6) % 7));
      const dates = [0, 1, 2, 3].map((offset) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + offset);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      });
      const occupied = dates.some((date) => (
        this.app.vault.getAbstractFileByPath(`${JOURNAL_DAILY_FOLDER}/${date}.md`) instanceof TFile
      ));
      if (!occupied) {
        return { year, week: 1, dates };
      }
    }
    throw new Error("Could not find an empty week for onboarding demo entries.");
  }

  private async ensureParentFolder(path: string): Promise<void> {
    const parts = path.split("/").slice(0, -1);
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }
}
