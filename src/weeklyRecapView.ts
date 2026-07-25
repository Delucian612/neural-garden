import { ItemView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP } from "./constants";
import { NOTES_FOLDER } from "./constants";
import { JournalingStorage } from "./journalingStorage";
import { injectNeuralGardenStyles } from "./styles";
import { WeeklyRecapManager } from "./weeklyRecapManager";
import { WeeklyRecapFrontmatter } from "./types";

type SymptomRow = { label: string; value: number; highIsBad: boolean };
const WEEKLY_ANIMATION_SCALE = 2;

type SupportNoteFragment = {
  row: HTMLElement;
  note: HTMLElement;
  reason: HTMLElement;
};

type SupportLooseFragment = {
  row: HTMLElement;
  elements: HTMLElement[];
};

export class NeuralGardenWeeklyRecapView extends ItemView {
  private currentYear: number | null = null;
  private currentWeek: number | null = null;
  private currentFilePath: string | null = null;
  private currentFrontmatter: WeeklyRecapFrontmatter | null = null;
  private currentBody = "";
  private sectionObserver: IntersectionObserver | null = null;
  private supportRevealPlayed = false;
  private revealTimeouts: number[] = [];

  constructor(
    leaf: WorkspaceLeaf,
    private readonly journalingStorage: JournalingStorage,
    private readonly weeklyRecapManager: WeeklyRecapManager,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openJournalingView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP;
  }

  getDisplayText(): string {
    return "Weekly Recap";
  }

  getIcon(): string {
    return "sparkles";
  }

  async onOpen(): Promise<void> {
    injectNeuralGardenStyles();
    this.renderLoading("Open a week from Journaling to view recap.");
  }

  async onClose(): Promise<void> {
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;
    this.supportRevealPlayed = false;
    this.revealTimeouts.forEach((id) => window.clearTimeout(id));
    this.revealTimeouts = [];
  }

  async openForWeek(year: number, week: number): Promise<void> {
    this.currentYear = year;
    this.currentWeek = week;
    this.renderLoading("Preparing your weekly recap...");

    const data = await this.weeklyRecapManager.ensureWeeklyRecapData(year, week);
    this.currentFilePath = data.file.path;
    this.currentFrontmatter = data.frontmatter;
    this.currentBody = data.body;

    await this.renderRecap(data.frontmatter, data.generatedNow);
  }

  private renderLoading(text: string): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    const wrap = contentEl.createDiv({ cls: "ng-weekly-view" });
    wrap.createDiv({ cls: "ng-empty", text });
  }

  private async renderRecap(frontmatter: WeeklyRecapFrontmatter, animateIn: boolean): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");

    const wrap = contentEl.createDiv({ cls: "ng-weekly-view" });
    const top = wrap.createDiv({ cls: "ng-journal-topbar" });
    const homeButton = top.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });
    const journalingButton = top.createEl("button", { text: "Back to Journaling", cls: "ng-journal-nav-button" });
    journalingButton.addEventListener("click", async () => {
      await this.openJournalingView(true, this.leaf);
    });

    const intro = wrap.createDiv({ cls: "ng-weekly-intro" });
    intro.createEl("h3", { text: "This is your Weekly Recap" });
    const start = frontmatter.processedDateRange.start;
    const end = frontmatter.processedDateRange.end;
    if (start && end) {
      intro.createDiv({ cls: "ng-weekly-intro-subtitle", text: `${start} to ${end}` });
    }

    const symptoms = wrap.createDiv({ cls: "ng-weekly-section" });
    symptoms.createEl("h4", { text: "Symptom Recap", cls: "ng-weekly-section-heading" });
    const symptomRows: SymptomRow[] = [
      { label: "Mood", value: frontmatter.averages.mood, highIsBad: false },
      { label: "Sleep", value: frontmatter.averages.sleep, highIsBad: false },
      { label: "Regulation", value: frontmatter.averages.regulation, highIsBad: false },
      { label: "Stress", value: frontmatter.averages.stress, highIsBad: true },
      { label: "Anxiety", value: frontmatter.averages.anxiety, highIsBad: true },
      { label: "Exhaustion", value: frontmatter.averages.exhaustion, highIsBad: true },
      { label: "Sensory Load", value: frontmatter.averages.sensoryLoad, highIsBad: true },
      { label: "Social Load", value: frontmatter.averages.socialLoad, highIsBad: true },
    ];

    const symptomBlocks: Array<{ block: HTMLElement; name: HTMLElement; bar: HTMLElement; copy: HTMLElement }> = [];
    for (const row of symptomRows) {
      const block = symptoms.createDiv({ cls: "ng-weekly-symptom" });
      const name = block.createDiv({ cls: "ng-journal-metric-label", text: row.label });
      const bar = block.createDiv({ cls: "ng-journal-progress ng-journal-progress-readonly" });
      const fill = bar.createDiv({ cls: "ng-journal-progress-fill" });
      fill.dataset.targetWidth = String(Math.max(0, Math.min(100, row.value)));
      fill.style.width = "0%";
      fill.style.backgroundColor = weeklyMetricColor(row.value, row.highIsBad);
      const copy = block.createDiv({ cls: "ng-weekly-symptom-copy", text: describeSymptom(row.label, row.value, row.highIsBad) });
      name.addClass("ng-weekly-fragment-hidden");
      bar.addClass("ng-weekly-fragment-hidden");
      copy.addClass("ng-weekly-fragment-hidden");
      symptomBlocks.push({ block, name, bar, copy });
    }

    const emotions = wrap.createDiv({ cls: "ng-weekly-section" });
    emotions.createEl("h4", { text: "Emotions", cls: "ng-weekly-section-heading" });
    const emotionalBalance = frontmatter.emotionCounts.pleasantTotal - frontmatter.emotionCounts.unpleasantTotal;
    const polarity = Math.max(-100, Math.min(100, emotionalBalance * 12));
    const balance = emotions.createDiv({ cls: "ng-weekly-emotion-balance" });
    const pointer = balance.createDiv({ cls: "ng-weekly-emotion-pointer" });
    pointer.style.left = `${50 + (polarity / 2)}%`;
    const emotionCounters = emotions.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-emotion-counters" });
    emotionCounters.createSpan({ text: `Unpleasant Emotions: ${frontmatter.emotionCounts.unpleasantTotal}` });
    emotionCounters.createSpan({ cls: "ng-weekly-emotion-counters-sep", text: "·" });
    emotionCounters.createSpan({ text: `Pleasant Emotions: ${frontmatter.emotionCounts.pleasantTotal}` });
    const emotionCloud = emotions.createDiv({ cls: "ng-weekly-emotion-cloud" });
    const emotionTokens = renderMixedEmotionCloud(emotionCloud, frontmatter.emotionCounts.unpleasant, frontmatter.emotionCounts.pleasant);
    emotionTokens.forEach((token) => token.addClass("ng-weekly-fragment-hidden"));

    const trackers = wrap.createDiv({ cls: "ng-weekly-section" });
    trackers.createEl("h4", { text: "Tracker", cls: "ng-weekly-section-heading" });
    const trackerRows = Object.entries(frontmatter.trackerCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count > 0);
    if (trackerRows.length === 0) {
      trackers.createDiv({ cls: "ng-empty", text: "No tracker activity in this week." });
    } else {
      const maxCount = trackerRows[0][1];
      const cloud = trackers.createDiv({ cls: "ng-weekly-tracker-cloud" });
      for (const [name, count] of trackerRows) {
        const row = cloud.createDiv({ cls: "ng-weekly-tracker-pill ng-weekly-fragment-hidden" });
        const label = row.createSpan({ text: `${name} · ${count}` });
        const size = Math.min(1.12, 0.65 + (count / Math.max(1, maxCount)) * 0.43);
        label.style.fontSize = `${size}rem`;
        if (count === maxCount && maxCount > 0) {
          row.addClass("is-winner");
        }
        row.style.animationDuration = `${6 + (Math.random() * 5)}s`;
        row.style.animationDelay = `${Math.random() * 1.4}s`;
      }
    }

    const support = wrap.createDiv({ cls: "ng-weekly-section" });
    support.dataset.weeklySection = "support";
    const supportHeading = support.createEl("h4", { text: "Support Notes", cls: "ng-weekly-section-heading" });
    const supportCopy = support.createDiv({
      cls: "ng-weekly-inline-copy",
      text: "Considering your current situation, you should take a look at the following notes.",
    });
    supportCopy.addClass("ng-weekly-support-intro");
    supportHeading.addClass("ng-weekly-fragment-hidden");
    supportCopy.addClass("ng-weekly-fragment-hidden");
    const supportNoteFragments: SupportNoteFragment[] = [];
    const supportRemainderRows: SupportLooseFragment[] = [];
    if (frontmatter.supportNotes.length === 0) {
      const empty = support.createDiv({ cls: "ng-empty", text: "No support notes triggered." });
      empty.addClass("ng-weekly-fragment-hidden");
      supportRemainderRows.push({ row: empty, elements: [empty] });
    } else {
      for (const note of frontmatter.supportNotes) {
        const reason = frontmatter.supportNoteReasons[note] ?? "symptom support";
        const row = support.createDiv({ cls: "ng-weekly-support-row ng-weekly-fragment-hidden" });
        const link = row.createSpan({ cls: "ng-weekly-support-link", text: note });
        link.addClass("ng-weekly-fragment-hidden");
        link.setAttribute("role", "button");
        link.setAttribute("tabindex", "0");
        link.addEventListener("click", async () => {
          const target = this.app.vault
            .getMarkdownFiles()
            .find((file) => file.basename === note && file.path.startsWith(`${NOTES_FOLDER}/`));
          if (!target) {
            new Notice(`Support note not found: ${note}`);
            return;
          }
          await this.app.workspace.getLeaf(true).openFile(target);
        });
        link.addEventListener("keydown", async (event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }
          event.preventDefault();
          const target = this.app.vault
            .getMarkdownFiles()
            .find((file) => file.basename === note && file.path.startsWith(`${NOTES_FOLDER}/`));
          if (!target) {
            new Notice(`Support note not found: ${note}`);
            return;
          }
          await this.app.workspace.getLeaf(true).openFile(target);
        });
        const reasonEl = row.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-fragment-hidden ng-weekly-support-reason", text: `Triggered by: ${reason}` });
        supportNoteFragments.push({ row, note: link, reason: reasonEl });
      }
      for (const symptom of frontmatter.missingSupportSymptoms) {
        const row = support.createDiv({ cls: "ng-weekly-support-row ng-weekly-fragment-hidden" });
        const item = row.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-fragment-hidden", text: `${symptom}: consider creating a support note for this.` });
        supportRemainderRows.push({ row, elements: [item] });
      }
      const criticalEntries = Object.entries(frontmatter.criticalDays).filter(([, days]) => days.length > 0);
      if (criticalEntries.length > 0) {
        const criticalBlock = support.createDiv({ cls: "ng-weekly-support-row ng-weekly-fragment-hidden" });
        const fragments: HTMLElement[] = [];
        const title = criticalBlock.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-critical-title ng-weekly-fragment-hidden", text: "Critical days:" });
        fragments.push(title);
        for (const [symptom, days] of criticalEntries) {
          const line = criticalBlock.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-critical-line ng-weekly-fragment-hidden", text: `${symptom}: ${days.join(", ")}` });
          fragments.push(line);
        }
        supportRemainderRows.push({ row: criticalBlock, elements: fragments });
      }
    }

    const tasks = wrap.createDiv({ cls: "ng-weekly-section" });
    tasks.createEl("h4", { text: "Tasks", cls: "ng-weekly-section-heading" });
    renderTaskDeltaLine(tasks, "Weekly energy capacity", frontmatter.taskAdjustments.maxEnergy.from, frontmatter.taskAdjustments.maxEnergy.to, 200);
    renderTaskDeltaLine(tasks, "Break frequency", frontmatter.taskAdjustments.forcedBreakThreshold.from, frontmatter.taskAdjustments.forcedBreakThreshold.to, 100);
    renderTaskDeltaLine(tasks, "Break length", frontmatter.taskAdjustments.forcedBreakLength.from, frontmatter.taskAdjustments.forcedBreakLength.to, 60);

    const seeds = wrap.createDiv({ cls: "ng-weekly-section" });
    seeds.createEl("h4", { text: "Next Month's Topics", cls: "ng-weekly-section-heading" });
    seeds.createDiv({
      cls: "ng-weekly-inline-copy",
      text: "These two short topics seed your next Monthly Reflection so you can revisit what mattered across the month.",
    });
    if ((frontmatter.seeds ?? []).length >= 2) {
      for (const seed of frontmatter.seeds) {
        seeds.createDiv({ cls: "ng-weekly-support-chip", text: seed });
      }
    } else {
      const row = seeds.createDiv({ cls: "ng-weekly-seed-form" });
      const one = row.createEl("input", { type: "text", placeholder: "Topic 1" });
      const two = row.createEl("input", { type: "text", placeholder: "Topic 2" });
      one.maxLength = 15;
      two.maxLength = 15;
      one.addClass("ng-task-input");
      two.addClass("ng-task-input");
      const submit = row.createEl("button", { text: "Save Topics", cls: "ng-weekly-seed-submit" });
      submit.addEventListener("click", async () => {
        const seedOne = one.value.slice(0, 15);
        const seedTwo = two.value.slice(0, 15);
        if (!seedOne || !seedTwo || !this.currentFilePath || !this.currentFrontmatter) {
          new Notice("Please fill both topics.");
          return;
        }
        this.currentFrontmatter.seeds = [seedOne, seedTwo];
        const file = this.app.vault.getAbstractFileByPath(this.currentFilePath);
        if (!(file instanceof TFile)) {
          return;
        }
        await this.journalingStorage.saveWeeklyRecap(file, this.currentFrontmatter, this.currentBody);
        await this.renderRecap(this.currentFrontmatter, false);
      });
    }

    const sections = [symptoms, emotions, trackers, support, tasks, seeds];
    if (animateIn) {
      this.supportRevealPlayed = false;
      this.revealTimeouts.forEach((id) => window.clearTimeout(id));
      this.revealTimeouts = [];
      sections.slice(1).forEach((section) => section.addClass("ng-weekly-scroll-hidden"));
      await this.playSymptomBuildup(symptoms, symptomBlocks);
      await this.playSequentialSectionReveal(
        [emotions, trackers, support, tasks, seeds],
        support,
        supportHeading,
        supportCopy,
        emotionTokens,
        supportNoteFragments,
        supportRemainderRows,
      );
      return;
    }

    this.revealAllImmediate(
      symptomBlocks,
      supportHeading,
      supportCopy,
      supportNoteFragments,
      supportRemainderRows,
      sections.slice(1),
    );
  }

  private async playSymptomBuildup(
    section: HTMLElement,
    blocks: Array<{ block: HTMLElement; name: HTMLElement; bar: HTMLElement; copy: HTMLElement }>,
  ): Promise<void> {
    section.addClass("is-visible");
    for (const row of blocks) {
      row.name.removeClass("ng-weekly-fragment-hidden");
      await wait(320);
      row.bar.removeClass("ng-weekly-fragment-hidden");
      await wait(90);
      const fill = row.bar.querySelector(".ng-journal-progress-fill") as HTMLElement | null;
      if (fill) {
        const target = Number.parseFloat(fill.dataset.targetWidth ?? "0");
        fill.style.width = `${target}%`;
      }
      await wait(360);
      row.copy.removeClass("ng-weekly-fragment-hidden");
      await wait(320);
    }
  }

  private async playSupportSequentialReveal(
    heading: HTMLElement,
    copy: HTMLElement,
    noteFragments: SupportNoteFragment[],
    remainderRows: SupportLooseFragment[],
  ): Promise<void> {
    heading.removeClass("ng-weekly-fragment-hidden");
    await wait(700);
    copy.removeClass("ng-weekly-fragment-hidden");
    await wait(1000);

    for (const fragment of noteFragments) {
      fragment.row.removeClass("ng-weekly-fragment-hidden");
      fragment.note.removeClass("ng-weekly-fragment-hidden");
    }

    await wait(650);

    for (const fragment of noteFragments) {
      fragment.reason.removeClass("ng-weekly-fragment-hidden");
    }

    await wait(450);

    for (const row of remainderRows) {
      row.row.removeClass("ng-weekly-fragment-hidden");
      for (const element of row.elements) {
        element.removeClass("ng-weekly-fragment-hidden");
        await wait(140);
      }
      await wait(180);
    }
  }

  private async playSequentialSectionReveal(
    orderedSections: HTMLElement[],
    supportSection: HTMLElement,
    supportHeading: HTMLElement,
    supportCopy: HTMLElement,
    emotionTokens: HTMLElement[],
    supportNoteFragments: SupportNoteFragment[],
    supportRemainderRows: SupportLooseFragment[],
  ): Promise<void> {
    this.sectionObserver?.disconnect();

    for (let index = 0; index < orderedSections.length; index += 1) {
      const section = orderedSections[index];
      await this.waitForSectionReady(section, 2200 + (index * 1400));
      section.classList.add("is-visible");
      section.classList.remove("ng-weekly-scroll-hidden");

      if (index === 0) {
        await this.revealEmotionTokens(emotionTokens);
      }

      if (index === 1) {
        await this.revealTrackerBubbles(section);
      }

      if (section === supportSection && !this.supportRevealPlayed) {
        this.supportRevealPlayed = true;
        await this.playSupportSequentialReveal(
          supportHeading,
          supportCopy,
          supportNoteFragments,
          supportRemainderRows,
        );
      }

      if (index < orderedSections.length - 1) {
        await wait(260);
      }
    }
  }

  private async revealEmotionTokens(tokens: HTMLElement[]): Promise<void> {
    await this.revealBubbles(tokens);
  }

  private async revealTrackerBubbles(section: HTMLElement): Promise<void> {
    const pills = shuffle(Array.from(section.querySelectorAll<HTMLElement>(".ng-weekly-tracker-pill")));
    await this.revealBubbles(pills);
  }

  private async revealBubbles(bubbles: HTMLElement[]): Promise<void> {
    for (const bubble of shuffle(bubbles)) {
      bubble.style.animationName = "none";
      const animation = bubble.animate([
        { opacity: 0, transform: "scale(0.45) translateY(10px)" },
        { opacity: 1, transform: "scale(1.08) translateY(-1px)", offset: 0.78 },
        { opacity: 1, transform: "scale(1) translateY(0)" },
      ], {
        duration: 640,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
      bubble.removeClass("ng-weekly-fragment-hidden");
      animation.addEventListener("finish", () => {
        bubble.style.animationName = "ng-weekly-float";
      }, { once: true });
      await wait(randomBetween(120, 190));
    }
  }

  private async waitForSectionReady(section: HTMLElement, fallbackMs: number): Promise<void> {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        observer.disconnect();
        window.clearTimeout(timeoutId);
        resolve();
      };

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === section && entry.isIntersecting) {
            finish();
            break;
          }
        }
      }, { root: null, threshold: 0.25 });

      observer.observe(section);
      const timeoutId = window.setTimeout(finish, fallbackMs * WEEKLY_ANIMATION_SCALE);
      this.revealTimeouts.push(timeoutId);
    });
  }

  private revealAllImmediate(
    blocks: Array<{ block: HTMLElement; name: HTMLElement; bar: HTMLElement; copy: HTMLElement }>,
    supportHeading: HTMLElement,
    supportCopy: HTMLElement,
    supportNoteFragments: SupportNoteFragment[],
    supportRemainderRows: SupportLooseFragment[],
    tailSections: HTMLElement[],
  ): void {
    for (const row of blocks) {
      row.name.removeClass("ng-weekly-fragment-hidden");
      row.bar.removeClass("ng-weekly-fragment-hidden");
      row.copy.removeClass("ng-weekly-fragment-hidden");
      const fill = row.bar.querySelector(".ng-journal-progress-fill") as HTMLElement | null;
      if (fill) {
        const target = Number.parseFloat(fill.dataset.targetWidth ?? "0");
        fill.style.width = `${target}%`;
      }
    }
    supportHeading.removeClass("ng-weekly-fragment-hidden");
    supportCopy.removeClass("ng-weekly-fragment-hidden");
    supportNoteFragments.forEach((fragment) => {
      fragment.row.removeClass("ng-weekly-fragment-hidden");
      fragment.note.removeClass("ng-weekly-fragment-hidden");
      fragment.reason.removeClass("ng-weekly-fragment-hidden");
    });
    supportRemainderRows.forEach((row) => {
      row.row.removeClass("ng-weekly-fragment-hidden");
      row.elements.forEach((element) => element.removeClass("ng-weekly-fragment-hidden"));
    });
    tailSections.forEach((section) => {
      section.classList.add("is-visible");
      section.classList.remove("ng-weekly-scroll-hidden");
      section.dataset.weeklyRevealed = "true";
      section.querySelectorAll<HTMLElement>(".ng-weekly-emotion-token, .ng-weekly-tracker-pill").forEach((bubble) => {
        bubble.removeClass("ng-weekly-fragment-hidden");
      });
    });
  }
}

function renderMixedEmotionCloud(
  container: HTMLElement,
  negative: Record<string, number>,
  positive: Record<string, number>,
): HTMLElement[] {
  const entries = [
    ...Object.entries(negative).map(([emotion, count]) => ({ emotion, count, positive: false })),
    ...Object.entries(positive).map(([emotion, count]) => ({ emotion, count, positive: true })),
  ].sort((a, b) => b.count - a.count || Math.random() - 0.5);

  if (entries.length === 0) {
    container.createDiv({ cls: "ng-weekly-inline-copy", text: "No emotions logged." });
    return [];
  }

  const max = entries[0].count;
  const tokens: HTMLElement[] = [];
  for (const entry of entries) {
    const chip = container.createSpan({ cls: `ng-weekly-emotion-token ${entry.positive ? "is-positive" : "is-negative"}`, text: entry.emotion });
    const count = entry.count;
    const scale = 0.85 + (count / Math.max(1, max)) * 0.95;
    chip.style.fontSize = `${scale}rem`;
    chip.style.animationDuration = `${6 + (Math.random() * 4)}s`;
    chip.style.animationDelay = `${Math.random() * 1.3}s`;
    tokens.push(chip);
  }
  return tokens;
}

function weeklyMetricColor(value: number, highIsBad: boolean): string {
  const v = Math.max(0, Math.min(100, value));
  if (highIsBad) {
    if (v >= 80) return "#FF6565";
    if (v >= 60) return "#F0A04C";
    if (v >= 40) return "#F4D35E";
    return "#39E05A";
  }
  if (v >= 80) return "#39E05A";
  if (v >= 60) return "#A8D56E";
  if (v >= 40) return "#F4D35E";
  return "#FF6565";
}

function describeSymptom(label: string, value: number, highIsBad: boolean): string {
  const v = Math.round(value);
  if (highIsBad) {
    if (v >= 80) return `${label} has been very high this week. Please prioritize recovery.`;
    if (v >= 60) return `${label} has been elevated. Keep support routines close.`;
    if (v >= 40) return `${label} has been manageable, with some pressure.`;
    return `${label} looks stable this week.`;
  }
  if (v >= 80) return `Your ${label.toLowerCase()} has been great. Keep what helps you grounded.`;
  if (v >= 60) return `Your ${label.toLowerCase()} has been good and fairly stable.`;
  if (v >= 40) return `${label} was mixed this week. Gentle consistency may help.`;
  return `${label} has been low. Extra care and support could help next week.`;
}

function deltaLine(from: number, to: number, maxValue?: number): "increased" | "decreased" | "unchanged" | "at-max" {
  if (typeof maxValue === "number" && to >= (maxValue - 0.01)) {
    return "at-max";
  }
  if (Math.abs(from - to) < 0.01) {
    return "unchanged";
  }
  return to > from ? "increased" : "decreased";
}

function renderTaskDeltaLine(parent: HTMLElement, label: string, from: number, to: number, maxValue?: number): void {
  const status = deltaLine(from, to, maxValue);
  const row = parent.createDiv({ cls: "ng-weekly-inline-copy ng-weekly-task-status" });
  row.createSpan({ text: `${label}: ` });
  row.createSpan({ cls: `ng-weekly-task-status-value is-${status}`, text: status === "at-max" ? "at maximum" : status });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms * WEEKLY_ANIMATION_SCALE));
}

function randomBetween(min: number, max: number): number {
  return min + (Math.random() * (max - min));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
