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
};

export type TaskManagerState = {
  maxEnergy: number;
  totalEnergy: number;
  spentEnergy: number;
  tasks: TaskItem[];
  overdriveAvailability: boolean;
  overdriveMode: boolean;
  overdriveAftereffects: boolean;
  resting: boolean;
  forcedBreak: boolean;
  forcedBreakThreshold: number;
  forcedBreakEnergy: number;
  forcedBreakEnergyEx: number;
  forcedBreakAdd: number;
  forcedBreakLength: number;
  forcedBreakTime: number;
  forcedBreakEnd?: number;
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
  processed: boolean;
  todaysNote: string;
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
