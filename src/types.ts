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
