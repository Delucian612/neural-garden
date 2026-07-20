import { DEFAULT_STATE, EFFORT_MAP, ENERGY_STOPS } from "./constants";
import { EffortKey, TaskItem, TaskManagerState } from "./types";

export function normalizeState(raw: Partial<TaskManagerState>): TaskManagerState {
  const parsedTasks: TaskItem[] = Array.isArray(raw.tasks)
    ? raw.tasks
        .map((task): TaskItem | undefined => {
          const mapped = task as Partial<TaskItem>;
          if (!mapped || typeof mapped !== "object") {
            return undefined;
          }
          const effort = EFFORT_MAP.get(mapped.effort as EffortKey);
          return {
            id: typeof mapped.id === "string" ? mapped.id : createId(),
            taskName: typeof mapped.taskName === "string" ? mapped.taskName : "Untitled Task",
            effort: effort?.key ?? "easy",
            energy: typeof mapped.energy === "number" ? mapped.energy : effort?.energy ?? 15,
            completed: Boolean(mapped.completed),
            completedAt: typeof mapped.completedAt === "number" ? mapped.completedAt : undefined,
          };
        })
        .filter((task): task is TaskItem => task !== undefined)
    : [];

  const state: TaskManagerState = {
    maxEnergy: numberOr(raw.maxEnergy, DEFAULT_STATE.maxEnergy),
    totalEnergy: numberOr(raw.totalEnergy, DEFAULT_STATE.totalEnergy),
    spentEnergy: numberOr(raw.spentEnergy, DEFAULT_STATE.spentEnergy),
    tasks: parsedTasks,
    overdriveAvailability: boolOr(raw.overdriveAvailability, DEFAULT_STATE.overdriveAvailability),
    overdriveMode: boolOr(raw.overdriveMode, DEFAULT_STATE.overdriveMode),
    overdriveAftereffects: boolOr(raw.overdriveAftereffects, DEFAULT_STATE.overdriveAftereffects),
    resting: boolOr(raw.resting, DEFAULT_STATE.resting),
    forcedBreak: boolOr(raw.forcedBreak, DEFAULT_STATE.forcedBreak),
    forcedBreakThreshold: numberOr(raw.forcedBreakThreshold, DEFAULT_STATE.forcedBreakThreshold),
    forcedBreakEnergy: numberOr(raw.forcedBreakEnergy, DEFAULT_STATE.forcedBreakEnergy),
    forcedBreakEnergyEx: numberOr(raw.forcedBreakEnergyEx, DEFAULT_STATE.forcedBreakEnergyEx),
    forcedBreakAdd: numberOr(raw.forcedBreakAdd, DEFAULT_STATE.forcedBreakAdd),
    forcedBreakLength: numberOr(raw.forcedBreakLength, DEFAULT_STATE.forcedBreakLength),
    forcedBreakTime: numberOr(raw.forcedBreakTime, DEFAULT_STATE.forcedBreakTime),
    forcedBreakEnd: numberOrUndefined(raw.forcedBreakEnd),
  };

  recalculateTotals(state);
  return state;
}

export function recalculateTotals(state: TaskManagerState): void {
  state.totalEnergy = state.tasks.reduce((sum, task) => sum + task.energy, 0);
  state.spentEnergy = state.tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.energy, 0);
}

export function effortLabel(effort: EffortKey): string {
  return EFFORT_MAP.get(effort)?.label ?? "Easy";
}

export function effortColor(effort: EffortKey): string {
  return EFFORT_MAP.get(effort)?.color ?? "#39E05A";
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getEffectiveMaxEnergy(state: TaskManagerState): number {
  return state.overdriveMode ? state.maxEnergy * 2 : state.maxEnergy;
}

export function getEffectiveForcedBreakThreshold(state: TaskManagerState): number {
  return state.overdriveMode ? state.forcedBreakThreshold * 2 : state.forcedBreakThreshold;
}

export function energyColorAt(percent: number): string {
  const clamped = Math.max(ENERGY_STOPS[0].percent, Math.min(percent, ENERGY_STOPS[ENERGY_STOPS.length - 1].percent));
  let left = ENERGY_STOPS[0];
  let right = ENERGY_STOPS[ENERGY_STOPS.length - 1];

  for (let i = 0; i < ENERGY_STOPS.length - 1; i += 1) {
    const current = ENERGY_STOPS[i];
    const next = ENERGY_STOPS[i + 1];
    if (clamped >= current.percent && clamped <= next.percent) {
      left = current;
      right = next;
      break;
    }
  }

  const range = right.percent - left.percent;
  const t = range === 0 ? 0 : (clamped - left.percent) / range;
  const rgb = [0, 1, 2].map((idx) => Math.round(left.color[idx] + (right.color[idx] - left.color[idx]) * t));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function normalizeFrontmatterTags(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).toLowerCase());
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function boolOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
