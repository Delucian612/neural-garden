import { EffortDefinition, EffortKey, TaskManagerState } from "./types";

export const VIEW_TYPE_NEURAL_GARDEN_HOME = "neural-garden-home";
export const VIEW_TYPE_NEURAL_GARDEN_JOURNALING = "neural-garden-journaling";
export const VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY = "neural-garden-journal-entry";
export const TASK_MANAGER_FILE_PATH = "Maintenance/TaskManager/TaskManager.md";
export const JOURNAL_DAILY_FOLDER = "Journal/Daily";
export const JOURNAL_WEEKLY_FOLDER = "Journal/Weekly";
export const JOURNAL_MONTHLY_FOLDER = "Journal/Monthly";
export const TRACKER_FOLDER = "Maintenance/Tracker";
export const NOTES_FOLDER = "Notes";
export const WEEKLY_RECAP_MIN_ENTRIES = 7;

export const EFFORTS: EffortDefinition[] = [
  { key: "easy-peasy", label: "Easy Peasy", energy: 5, color: "#3FD6FF" },
  { key: "easy", label: "Easy", energy: 15, color: "#39E05A" },
  { key: "medium", label: "Medium", energy: 30, color: "#F0A04C" },
  { key: "hard", label: "Hard", energy: 50, color: "#E06E2C" },
  { key: "heavy", label: "Heavy", energy: 70, color: "#FF6565" },
];

export const EFFORT_MAP = new Map<EffortKey, EffortDefinition>(
  EFFORTS.map((effort) => [effort.key, effort]),
);

export const ENERGY_STOPS = [
  { percent: 0, color: [0x3f, 0xd6, 0xff] },
  { percent: 60, color: [0x31, 0xc9, 0x50] },
  { percent: 90, color: [0xd0, 0x87, 0x2e] },
  { percent: 100, color: [0xfb, 0x2c, 0x36] },
  { percent: 115, color: [0xff, 0x00, 0x00] },
];

export const BREAK_MESSAGES = [
  "Have a break, have a kitkat.",
  "Breathe and reset.",
  "Do something just for you.",
  "Your energy matters, so preserve it now.",
  "Take a deep breath.",
  "Take a couple of steps away from the screen.",
  "Relax your jaw, lower your shoulders, and soften your focus.",
  "Let the next three breaths be your full attention.",
  "Be kind to your mind.",
  "Go on with the day with a smile on your mind.",
];

export const DEFAULT_STATE: TaskManagerState = {
  maxEnergy: 100,
  totalEnergy: 0,
  spentEnergy: 0,
  tasks: [],
  overdriveAvailability: true,
  overdriveMode: false,
  overdriveAftereffects: false,
  resting: false,
  forcedBreak: false,
  forcedBreakThreshold: 70,
  forcedBreakEnergy: 0,
  forcedBreakEnergyEx: 0,
  forcedBreakAdd: 0,
  forcedBreakLength: 20,
  forcedBreakTime: 20,
  forcedBreakEnd: undefined,
};
