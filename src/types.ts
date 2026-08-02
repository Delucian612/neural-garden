import type { TFile } from "obsidian";

export type EffortKey = "easy-peasy" | "easy" | "medium" | "hard" | "heavy";

export type EffortDefinition = {
  key: EffortKey;
  label: string;
  energy: number;
  color: string;
};

export type TaskItem = {
  id: string;
  taskName: string;
  effort: EffortKey;
  energy: number;
  completed: boolean;
  completedAt?: number;
  weeklySource?: {
    recapPath: string;
    taskName: string;
    effort: WeeklyTaskEffort;
  };
};

export type TaskManagerState = {
  maxEnergy: number;
  totalEnergy: number;
  spentEnergy: number;
  tasks: TaskItem[];
  resting: boolean;
  forcedBreak: boolean;
  forcedBreakThreshold: number;
  forcedBreakEnergy: number;
  forcedBreakEnergyEx: number;
  forcedBreakAdd: number;
  forcedBreakLength: number;
  forcedBreakTime: number;
  forcedBreakEnd?: number;
  baseTaskEnergy?: number;
  lastWeeklyRecap?: string;
};

export type JournalTaskSnapshot = {
  taskName: string;
  effort: EffortKey;
  energy: number;
};

export type JournalEntryFrontmatter = {
  date: string;
  mood: number | null;
  sleep: number | null;
  stress: number | null;
  anxiety: number | null;
  exhaustion: number | null;
  regulation: number | null;
  sensoryLoad: number | null;
  socialLoad: number | null;
  spentEnergy: number;
  completedTasks: JournalTaskSnapshot[];
  uncompletedTasks: JournalTaskSnapshot[];
  goodThing: string;
  emotions: string[];
};

export type JournalEntryRecord = {
  file: TFile;
  frontmatter: JournalEntryFrontmatter;
  body: string;
};

export type JournalTrackerFrontmatter = {
  Date: string[];
  color: string;
};

export type JournalTrackerRecord = {
  file: TFile;
  name: string;
  frontmatter: JournalTrackerFrontmatter;
  dates: string[];
  color: string;
};

export type WeeklyAverages = {
  mood: number;
  sleep: number;
  regulation: number;
  stress: number;
  anxiety: number;
  exhaustion: number;
  sensoryLoad: number;
  socialLoad: number;
};

export type WeeklyEmotionCounts = {
  pleasant: Record<string, number>;
  unpleasant: Record<string, number>;
  pleasantTotal: number;
  unpleasantTotal: number;
};

export type WeeklyTaskAdjustments = {
  maxEnergy: { from: number; to: number };
  forcedBreakThreshold: { from: number; to: number };
  forcedBreakLength: { from: number; to: number };
};

export type WeeklyHighlight = {
  date: string;
  text: string;
};

export type WeeklyTaskEffort = "light" | "easy" | "fair" | "hard" | "heavy";

export type WeeklyPlannedTask = {
  taskName: string;
  effort: WeeklyTaskEffort;
};

export type WeeklyRecapFrontmatter = {
  week: number;
  year: number;
  generatedAt: string;
  processedDateRange: { start: string; end: string };
  journalLinks: string[];
  supportNotes: string[];
  supportNoteReasons: Record<string, string>;
  missingSupportSymptoms: string[];
  criticalDays: Record<string, string[]>;
  supportHints: string[];
  highlights: WeeklyHighlight[];
  nextWeekTasks: WeeklyPlannedTask[];
  averages: WeeklyAverages;
  emotionCounts: WeeklyEmotionCounts;
  trackerCounts: Record<string, number>;
  taskAdjustments: WeeklyTaskAdjustments;
};
