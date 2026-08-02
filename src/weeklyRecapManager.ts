import { App, Notice, TFile } from "obsidian";
import { JournalingStorage } from "./journalingStorage";
import { MyNotesStorage } from "./myNotesStorage";
import { TaskManagerStorage } from "./storage";
import { JournalEntryRecord, WeeklyHighlight, WeeklyRecapFrontmatter } from "./types";

const POSITIVE_EMOTIONS = new Set([
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
]);

const NEGATIVE_EMOTIONS = new Set([
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
]);

const SUPPORT_HINTS: Record<string, string[]> = {
  Mood: [
    "A tiny joyful ritual today can stabilize tomorrow.",
    "Pick one gentle thing that usually softens your day.",
    "Low mood is data, not failure. Keep your steps small.",
    "Try one predictable comfort activity before bedtime.",
    "Name one thing that felt even slightly okay today.",
  ],
  Sleep: [
    "Protect one fixed wind-down anchor tonight.",
    "Dim light earlier than usual to cue your system.",
    "A shorter evening task list can protect sleep quality.",
    "Use a simple pre-sleep sequence to reduce friction.",
    "Your body trusts rhythm; keep bedtime timing gentle but steady.",
  ],
  Regulation: [
    "One pause before reacting can change the whole hour.",
    "Try grounding through touch, temperature, or pressure.",
    "Reduce one input source when your system feels loud.",
    "Regulation grows through repetition, not perfection.",
    "Build in a two-minute reset between demanding tasks.",
  ],
  Stress: [
    "Short breaks now prevent long crashes later.",
    "Choose one non-essential task to postpone this week.",
    "Lowering pace is still progress.",
    "Your nervous system benefits from predictable pauses.",
    "Try three slower breaths before switching tasks.",
  ],
  Anxiety: [
    "Contain uncertainty by choosing one next concrete action.",
    "Name what is known right now before forecasting.",
    "Use brief body cues: unclench jaw, drop shoulders, exhale.",
    "Anxiety peaks pass faster when you reduce input noise.",
    "Anchor attention to one sensory detail in the room.",
  ],
  Exhaustion: [
    "Protect recovery time before adding new commitments.",
    "A slower day can be productive for your long-term baseline.",
    "Energy is a resource to steward, not a test to pass.",
    "Prioritize the one task with highest real value.",
    "Tiny rest windows count, especially when repeated.",
  ],
  "Sensory Load": [
    "Reduce one sensory trigger where possible this week.",
    "Use transitions: from high-input to low-input spaces gradually.",
    "Noise, light, and social density all tax the same battery.",
    "Schedule low-stimulation moments before your hardest blocks.",
    "Your comfort tools are strategy, not weakness.",
  ],
  "Social Load": [
    "Plan one low-demand social option to balance heavier ones.",
    "A short social recovery window can prevent overload.",
    "Set one clear boundary before high-contact days.",
    "Quality over quantity is valid for social energy.",
    "Choose contexts where you can leave early if needed.",
  ],
};

type SymptomKey = "mood" | "sleep" | "regulation" | "stress" | "anxiety" | "exhaustion" | "sensoryLoad" | "socialLoad";

type SymptomInfo = {
  label: string;
  key: SymptomKey;
  highIsBad: boolean;
};

const SYMPTOMS: SymptomInfo[] = [
  { label: "Mood", key: "mood", highIsBad: false },
  { label: "Sleep", key: "sleep", highIsBad: false },
  { label: "Regulation", key: "regulation", highIsBad: false },
  { label: "Stress", key: "stress", highIsBad: true },
  { label: "Anxiety", key: "anxiety", highIsBad: true },
  { label: "Exhaustion", key: "exhaustion", highIsBad: true },
  { label: "Sensory Load", key: "sensoryLoad", highIsBad: true },
  { label: "Social Load", key: "socialLoad", highIsBad: true },
];

export class WeeklyRecapManager {
  constructor(
    private readonly app: App,
    private readonly journalingStorage: JournalingStorage,
    private readonly taskStorage: TaskManagerStorage,
    private readonly myNotesStorage: MyNotesStorage,
  ) {}

  async ensureWeeklyRecapData(year: number, week: number): Promise<{
    file: TFile;
    frontmatter: WeeklyRecapFrontmatter;
    body: string;
    generatedNow: boolean;
  }> {
    const file = await this.journalingStorage.ensureWeeklyRecapFile(year, week);
    const existing = await this.journalingStorage.readWeeklyRecap(file);
    if (existing.frontmatter.generatedAt) {
      const highlights = await this.collectHighlights(year, week);
      if (existing.body.trim() || JSON.stringify(existing.frontmatter.highlights) !== JSON.stringify(highlights)) {
        existing.frontmatter.highlights = highlights;
        await this.journalingStorage.saveWeeklyRecap(file, existing.frontmatter, "");
      }
      return { file, frontmatter: existing.frontmatter, body: "", generatedNow: false };
    }

    const generated = await this.generateWeeklyRecap(file);
    if (!generated) {
      const latest = await this.journalingStorage.readWeeklyRecap(file);
      return { file, frontmatter: latest.frontmatter, body: latest.body, generatedNow: false };
    }

    const latest = await this.journalingStorage.readWeeklyRecap(file);
    return { file, frontmatter: latest.frontmatter, body: latest.body, generatedNow: true };
  }

  private async collectHighlights(year: number, week: number): Promise<WeeklyHighlight[]> {
    const range = isoWeekRange(year, week);
    const entries = await this.journalingStorage.listDailyEntries();
    return highlightsFromEntries(entries.filter((entry) => (
      entry.frontmatter.date >= range.start && entry.frontmatter.date <= range.end
    )));
  }

  private async generateWeeklyRecap(file: TFile): Promise<boolean> {
    const parsed = parseWeekFile(file.basename);
    if (!parsed) {
      new Notice("Invalid weekly recap name.");
      return false;
    }

    const range = isoWeekRange(parsed.year, parsed.week);
    const allEntries = await this.journalingStorage.listDailyEntries();
    const entries = allEntries.filter((entry) => entry.frontmatter.date >= range.start && entry.frontmatter.date <= range.end);

    if (entries.length < 4) {
      new Notice("This week needs at least 4 entries.");
      return false;
    }

    const averages = {
      mood: average(entries.map((entry) => entry.frontmatter.mood)),
      sleep: average(entries.map((entry) => entry.frontmatter.sleep)),
      regulation: average(entries.map((entry) => entry.frontmatter.regulation)),
      stress: average(entries.map((entry) => entry.frontmatter.stress)),
      anxiety: average(entries.map((entry) => entry.frontmatter.anxiety)),
      exhaustion: average(entries.map((entry) => entry.frontmatter.exhaustion)),
      sensoryLoad: average(entries.map((entry) => entry.frontmatter.sensoryLoad)),
      socialLoad: average(entries.map((entry) => entry.frontmatter.socialLoad)),
    };

    const emotionCounts = countEmotions(entries);
    const trackers = await this.journalingStorage.listTrackers();
    const trackerCounts: Record<string, number> = {};
    for (const tracker of trackers) {
      trackerCounts[tracker.name] = tracker.dates.filter((date) => date >= range.start && date <= range.end).length;
    }

    const taskState = await this.taskStorage.loadTaskManagerState();
    const beforeThreshold = taskState.forcedBreakThreshold;
    const beforeBreakLength = taskState.forcedBreakLength;
    const beforeMaxEnergy = taskState.maxEnergy;

    const stressFactor = tierFactor(averages.stress);
    let nextThreshold = beforeThreshold;
    if (stressFactor.mode === "high") {
      nextThreshold = beforeThreshold / stressFactor.factor;
    } else if (stressFactor.mode === "low") {
      nextThreshold = beforeThreshold * stressFactor.factor;
    }
    nextThreshold = clamp(nextThreshold, 30, 100);

    const exhaustionFactor = tierFactor(averages.exhaustion);
    let nextBreakLength = beforeBreakLength;
    if (exhaustionFactor.mode === "high") {
      nextBreakLength = beforeBreakLength * exhaustionFactor.factor;
    } else if (exhaustionFactor.mode === "low") {
      nextBreakLength = beforeBreakLength / exhaustionFactor.factor;
    }
    nextBreakLength = clamp(nextBreakLength, 15, 60);

    const completedEnergies = entries.reduce<number[]>((acc, entry: JournalEntryRecord) => {
      const energies = entry.frontmatter.completedTasks.map((task) => task.energy);
      return acc.concat(energies);
    }, []);
    const weeklyAverageCompletedEnergy = average(completedEnergies.map((value: number) => value));
    const baseTaskEnergy = taskState.baseTaskEnergy ?? 120;
    const nextMaxEnergy = clamp(((baseTaskEnergy * 2) + weeklyAverageCompletedEnergy) / 3, 50, 200);

    taskState.forcedBreakThreshold = round2(nextThreshold);
    taskState.forcedBreakLength = round2(nextBreakLength);
    taskState.maxEnergy = round2(nextMaxEnergy);
    taskState.baseTaskEnergy = baseTaskEnergy;
    taskState.lastWeeklyRecap = `${parsed.year}-W${String(parsed.week).padStart(2, "0")}`;
    await this.taskStorage.saveTaskManagerState(taskState);

    const noteSupportSignals = buildSupportSignals(entries, averages, true);
    const hintSupportSignals = buildSupportSignals(entries, averages, false);

    const supportSelection = this.pickSupportNotes(noteSupportSignals);
    const supportHints = pickSupportHints(hintSupportSignals.map((signal) => signal.label));
    const supportNoteReasons: Record<string, string> = {};
    for (const note of supportSelection.notes) {
      supportNoteReasons[note.name] = note.symptom;
    }
    const criticalDays: Record<string, string[]> = {};
    for (const signal of noteSupportSignals) {
      if (signal.affectedDays.length > 0) {
        criticalDays[signal.label] = signal.affectedDays;
      }
    }

    const frontmatter: WeeklyRecapFrontmatter = {
      week: parsed.week,
      year: parsed.year,
      generatedAt: new Date().toISOString(),
      processedDateRange: {
        start: entries[0]?.frontmatter.date ?? "",
        end: entries[entries.length - 1]?.frontmatter.date ?? "",
      },
      journalLinks: entries.map((entry) => `[[${entry.file.basename}]]`),
      supportNotes: supportSelection.notes.map((note) => note.name),
      supportNoteReasons,
      missingSupportSymptoms: supportSelection.missing,
      criticalDays,
      supportHints,
      highlights: highlightsFromEntries(entries),
      nextWeekTasks: [],
      averages: {
        mood: round2(averages.mood),
        sleep: round2(averages.sleep),
        regulation: round2(averages.regulation),
        stress: round2(averages.stress),
        anxiety: round2(averages.anxiety),
        exhaustion: round2(averages.exhaustion),
        sensoryLoad: round2(averages.sensoryLoad),
        socialLoad: round2(averages.socialLoad),
      },
      emotionCounts,
      trackerCounts,
      taskAdjustments: {
        maxEnergy: { from: round2(beforeMaxEnergy), to: round2(nextMaxEnergy) },
        forcedBreakThreshold: { from: round2(beforeThreshold), to: round2(nextThreshold) },
        forcedBreakLength: { from: round2(beforeBreakLength), to: round2(nextBreakLength) },
      },
    };

    await this.journalingStorage.saveWeeklyRecap(file, frontmatter, "");
    return true;
  }

  private pickSupportNotes(signals: Array<{ label: string; severity: number; affectedDays: string[] }>): {
    notes: Array<{ name: string; symptom: string }>;
    missing: string[];
  } {
    const sorted = [...signals].sort((a, b) => b.severity - a.severity || Math.random() - 0.5);
    const selected: Array<{ name: string; symptom: string }> = [];
    const used = new Set<string>();
    const missing: string[] = [];

    for (const signal of sorted) {
      if (selected.length >= 4) {
        break;
      }
      const candidates = shuffle(this.myNotesStorage.notesWithSupport(signal.label));
      const pick = candidates.find((candidate) => !used.has(candidate.path));
      if (!pick) {
        missing.push(signal.label);
        continue;
      }
      used.add(pick.path);
      selected.push({ name: pick.basename, symptom: signal.label });
    }

    return { notes: selected, missing: unique(missing) };
  }

}

function parseWeekFile(baseName: string): { year: number; week: number } | null {
  const match = baseName.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), week: Number(match[2]) };
}

function isoWeekRange(year: number, week: number): { start: string; end: string } {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + ((week - 1) * 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: dateKeyUTC(monday), end: dateKeyUTC(sunday) };
}

function dateKeyUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function average(values: Array<number | null>): number {
  const filtered = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (filtered.length === 0) {
    return 0;
  }
  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
}

function countEmotions(entries: JournalEntryRecord[]): WeeklyRecapFrontmatter["emotionCounts"] {
  const pleasant: Record<string, number> = {};
  const unpleasant: Record<string, number> = {};

  for (const entry of entries) {
    for (const emotion of entry.frontmatter.emotions) {
      if (POSITIVE_EMOTIONS.has(emotion)) {
        pleasant[emotion] = (pleasant[emotion] ?? 0) + 1;
      } else if (NEGATIVE_EMOTIONS.has(emotion)) {
        unpleasant[emotion] = (unpleasant[emotion] ?? 0) + 1;
      }
    }
  }

  return {
    pleasant,
    unpleasant,
    pleasantTotal: Object.values(pleasant).reduce((sum, value) => sum + value, 0),
    unpleasantTotal: Object.values(unpleasant).reduce((sum, value) => sum + value, 0),
  };
}

function tierFactor(value: number): { mode: "high" | "low" | "none"; factor: number } {
  if (value >= 90) return { mode: "high", factor: 1.7 };
  if (value >= 80) return { mode: "high", factor: 1.5 };
  if (value >= 70) return { mode: "high", factor: 1.3 };
  if (value >= 60) return { mode: "high", factor: 1.1 };
  if (value <= 10) return { mode: "low", factor: 1.5 };
  if (value <= 20) return { mode: "low", factor: 1.3 };
  if (value <= 30) return { mode: "low", factor: 1.1 };
  return { mode: "none", factor: 1 };
}

function buildSupportSignals(
  entries: JournalEntryRecord[],
  averages: Record<SymptomKey, number>,
  forNotes: boolean,
): Array<{ label: string; severity: number; affectedDays: string[] }> {
  const list: Array<{ label: string; severity: number; affectedDays: string[] }> = [];

  for (const symptom of SYMPTOMS) {
    const avg = averages[symptom.key];
    const values = entries
      .map((entry) => ({ date: entry.frontmatter.date, value: entry.frontmatter[symptom.key] }))
      .filter((row): row is { date: string; value: number } => typeof row.value === "number");

    const avgThreshold = symptom.highIsBad
      ? (forNotes ? 70 : 60)
      : (forNotes ? 35 : 50);
    const dailyThreshold = symptom.highIsBad
      ? (forNotes ? 85 : 80)
      : (forNotes ? 20 : 30);

    const avgTriggered = symptom.highIsBad ? avg > avgThreshold : avg < avgThreshold;
    const affectedDaily = values
      .filter((row) => (symptom.highIsBad ? row.value > dailyThreshold : row.value < dailyThreshold))
      .map((row) => row.date);

    if (!avgTriggered && affectedDaily.length === 0) {
      continue;
    }

    const avgSeverity = symptom.highIsBad ? Math.max(0, avg - avgThreshold) : Math.max(0, avgThreshold - avg);
    const dailySeverity = values.reduce((acc, row) => {
      const delta = symptom.highIsBad ? row.value - dailyThreshold : dailyThreshold - row.value;
      return Math.max(acc, Math.max(0, delta));
    }, 0);

    list.push({
      label: symptom.label,
      severity: avgSeverity + dailySeverity,
      affectedDays: affectedDaily,
    });
  }

  return list;
}

function pickSupportHints(symptoms: string[]): string[] {
  const hints: string[] = [];
  for (const symptom of unique(symptoms)) {
    const pool = SUPPORT_HINTS[symptom] ?? [];
    if (pool.length === 0) {
      continue;
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    hints.push(picked);
  }
  return hints;
}

function highlightsFromEntries(entries: JournalEntryRecord[]): WeeklyHighlight[] {
  return entries.flatMap((entry) => {
    const text = entry.frontmatter.goodThing.trim();
    return text ? [{ date: entry.frontmatter.date, text }] : [];
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
