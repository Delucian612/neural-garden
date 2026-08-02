import { setIcon } from "obsidian";

export type TourChoice = {
  label: string;
  onSelect: () => void | Promise<void>;
};

export type TourStep = {
  title: string;
  description: string;
  target: string | (() => HTMLElement | null);
  interfaceName?: string;
  progressText?: string;
  countInProgress?: boolean;
  highlightMessage?: boolean;
  before?: () => void | Promise<void>;
  choices?: TourChoice[];
  interaction?: {
    event: "click" | "change" | "input";
    target?: string | (() => HTMLElement | null);
    onAction?: () => void | Promise<void>;
    completeWhen?: (event: Event) => boolean;
    autoAdvance?: boolean;
  };
};

export type TourRunOptions = {
  label: string;
  onComplete?: () => void | Promise<void>;
  onSkip?: () => void | Promise<void>;
};

const TARGET_PADDING = 7;
const TYPE_INTERVAL_MS = 28;
const ACTION_ADVANCE_DELAY_MS = 250;

export class NeuralGardenTour {
  private root: HTMLElement | null = null;
  private spotlight: HTMLElement | null = null;
  private blockers: HTMLElement[] = [];
  private panel: HTMLElement | null = null;
  private titleEl: HTMLElement | null = null;
  private descriptionEl: HTMLElement | null = null;
  private choicesEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private backButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;
  private steps: TourStep[] = [];
  private options: TourRunOptions | null = null;
  private currentIndex = 0;
  private activeTarget: HTMLElement | null = null;
  private interactionCleanup: (() => void) | null = null;
  private actionAdvanceTimer: number | null = null;
  private typeTimer: number | null = null;
  private renderVersion = 0;

  get isActive(): boolean {
    return this.root?.isConnected ?? false;
  }

  async start(steps: TourStep[], options: TourRunOptions): Promise<void> {
    await this.close(false);
    if (steps.length === 0) {
      return;
    }
    this.steps = steps;
    this.options = options;
    this.currentIndex = 0;
    this.mount();
    await this.showCurrentStep();
  }

  async close(skipped = true): Promise<void> {
    if (!this.root) {
      return;
    }
    const options = this.options;
    this.clearStepState();
    this.root.remove();
    this.root = null;
    this.spotlight = null;
    this.blockers = [];
    this.panel = null;
    this.titleEl = null;
    this.descriptionEl = null;
    this.choicesEl = null;
    this.progressEl = null;
    this.backButton = null;
    this.nextButton = null;
    this.steps = [];
    this.options = null;
    window.removeEventListener("resize", this.updateGeometry);
    document.removeEventListener("scroll", this.updateGeometry, true);
    document.removeEventListener("keydown", this.onKeyDown);
    if (skipped) {
      await options?.onSkip?.();
    }
  }

  private mount(): void {
    const root = document.body.createDiv({ cls: "ng-tour" });
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", this.options?.label ?? "Neural Garden walkthrough");
    this.root = root;

    for (let index = 0; index < 4; index += 1) {
      this.blockers.push(root.createDiv({ cls: "ng-tour-blocker" }));
    }
    this.spotlight = root.createDiv({ cls: "ng-tour-spotlight" });
    const panel = root.createDiv({ cls: "ng-tour-panel" });
    this.panel = panel;

    const header = panel.createDiv({ cls: "ng-tour-header" });
    this.progressEl = header.createDiv({ cls: "ng-tour-progress" });

    this.titleEl = panel.createEl("h3", { cls: "ng-tour-title" });
    this.descriptionEl = panel.createDiv({ cls: "ng-tour-description" });
    this.choicesEl = panel.createDiv({ cls: "ng-tour-choices" });

    const actions = panel.createDiv({ cls: "ng-tour-actions" });
    const skipButton = actions.createEl("button", { text: "Skip", cls: "ng-tour-skip" });
    skipButton.addEventListener("click", () => void this.close(true));
    const navigation = actions.createDiv({ cls: "ng-tour-navigation" });
    this.backButton = navigation.createEl("button", { text: "Back", cls: "ng-tour-back" });
    this.backButton.addEventListener("click", () => void this.goBack());
    this.nextButton = navigation.createEl("button", { text: "Next", cls: "ng-tour-next" });
    this.nextButton.addEventListener("click", () => void this.goNext());

    window.addEventListener("resize", this.updateGeometry);
    document.addEventListener("scroll", this.updateGeometry, true);
    document.addEventListener("keydown", this.onKeyDown);
  }

  private async showCurrentStep(): Promise<void> {
    const version = ++this.renderVersion;
    this.clearStepState();
    this.root?.addClass("is-resolving");
    const step = this.steps[this.currentIndex];
    if (!step || !this.root) {
      return;
    }
    await step.before?.();
    await nextPaint();
    if (version !== this.renderVersion || !this.root) {
      return;
    }

    if (step.highlightMessage) {
      this.titleEl?.setText(step.title);
      this.progressEl?.setText(step.progressText ?? "Welcome");
      this.renderChoices(step.choices ?? []);
      this.root.removeClass("is-resolving");
      this.root.addClass("is-message-highlight");
      if (this.backButton) {
        this.backButton.disabled = this.findPreviousVisibleStep() < 0;
      }
      if (this.nextButton) {
        this.nextButton.setText("Begin tour");
        this.nextButton.disabled = false;
      }
      this.startTyping(step.description);
      return;
    }

    const target = await this.resolveTarget(step.target);
    if (!target) {
      await this.goNext();
      return;
    }
    this.activeTarget = target;
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    await nextPaint();

    this.titleEl?.setText(step.title);
    const interfaceName = step.interfaceName ?? this.options?.label ?? "Walkthrough";
    const interfaceStep = this.steps
      .slice(0, this.currentIndex + 1)
      .filter((candidate) => (
        (candidate.interfaceName ?? this.options?.label) === interfaceName
        && candidate.countInProgress !== false
      ))
      .length;
    const interfaceTotal = this.steps.filter((candidate) => (
      (candidate.interfaceName ?? this.options?.label) === interfaceName
      && candidate.countInProgress !== false
    )).length;
    this.progressEl?.setText(step.progressText ?? `${interfaceName} - Introduction ${interfaceStep}/${interfaceTotal}`);
    if (this.backButton) {
      this.backButton.disabled = this.findPreviousVisibleStep() < 0;
    }
    if (this.nextButton) {
      this.nextButton.setText(this.currentIndex === this.steps.length - 1 ? "Finish" : "Next");
      this.nextButton.disabled = !!step.interaction || !!step.choices?.length;
    }
    this.renderChoices(step.choices ?? []);
    this.setInteractiveTarget(!!step.interaction);
    this.updateGeometry();
    this.root.removeClass("is-resolving");
    this.startTyping(step.description);
    if (step.interaction) {
      this.bindInteraction(step.interaction);
    }
  }

  private async resolveTarget(target: TourStep["target"]): Promise<HTMLElement | null> {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const element = typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : target();
      if (element?.isConnected && element.getClientRects().length > 0) {
        return element;
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    }
    return null;
  }

  private bindInteraction(interaction: NonNullable<TourStep["interaction"]>): void {
    const interactionTarget = interaction.target
      ? typeof interaction.target === "string"
        ? document.querySelector<HTMLElement>(interaction.target)
        : interaction.target()
      : this.activeTarget;
    if (!interactionTarget) {
      return;
    }
    let handled = false;
    const onAction = async (event: Event) => {
      if (handled) {
        return;
      }
      if (interaction.completeWhen && !interaction.completeWhen(event)) {
        return;
      }
      handled = true;
      await interaction.onAction?.();
      this.setInteractiveTarget(false);
      this.interactionCleanup?.();
      this.interactionCleanup = null;
      const autoAdvance = interaction.autoAdvance ?? interaction.event !== "input";
      if (autoAdvance) {
        this.actionAdvanceTimer = window.setTimeout(() => {
          this.actionAdvanceTimer = null;
          if (this.nextButton) {
            this.nextButton.disabled = false;
          }
          void this.goNext();
        }, ACTION_ADVANCE_DELAY_MS);
      } else if (this.nextButton) {
        this.nextButton.disabled = false;
      }
    };
    interactionTarget.addEventListener(interaction.event, onAction);
    this.interactionCleanup = () => interactionTarget.removeEventListener(interaction.event, onAction);
  }

  private renderChoices(choices: TourChoice[]): void {
    if (!this.choicesEl) {
      return;
    }
    this.choicesEl.empty();
    this.choicesEl.toggle(choices.length > 0);
    for (const choice of choices) {
      const button = this.choicesEl.createEl("button", { text: choice.label, cls: "ng-tour-choice" });
      button.addEventListener("click", async () => {
        for (const candidate of this.choicesEl?.querySelectorAll<HTMLButtonElement>("button") ?? []) {
          candidate.disabled = true;
        }
        await choice.onSelect();
        this.actionAdvanceTimer = window.setTimeout(() => {
          this.actionAdvanceTimer = null;
          if (this.nextButton) {
            this.nextButton.disabled = false;
          }
          void this.goNext();
        }, 250);
      });
    }
  }

  private setInteractiveTarget(interactive: boolean): void {
    this.root?.toggleClass("is-interactive", interactive);
    this.activeTarget?.toggleClass("ng-tour-target", true);
  }

  private startTyping(text: string): void {
    if (!this.descriptionEl) {
      return;
    }
    this.descriptionEl.empty();
    let characterIndex = 0;
    this.typeTimer = window.setInterval(() => {
      if (!this.descriptionEl) {
        return;
      }
      characterIndex += 1;
      this.descriptionEl.setText(text.slice(0, characterIndex));
      if (characterIndex >= text.length) {
        this.stopTyping();
      }
    }, TYPE_INTERVAL_MS);
  }

  private stopTyping(): void {
    if (this.typeTimer !== null) {
      window.clearInterval(this.typeTimer);
      this.typeTimer = null;
    }
  }

  private clearStepState(): void {
    this.stopTyping();
    this.root?.removeClass("is-message-highlight");
    if (this.actionAdvanceTimer !== null) {
      window.clearTimeout(this.actionAdvanceTimer);
      this.actionAdvanceTimer = null;
    }
    this.interactionCleanup?.();
    this.interactionCleanup = null;
    this.activeTarget?.removeClass("ng-tour-target");
    this.activeTarget = null;
  }

  private goBack = async (): Promise<void> => {
    if (this.currentIndex === 0) {
      return;
    }
    const previousIndex = this.findPreviousVisibleStep();
    if (previousIndex < 0) {
      return;
    }
    this.currentIndex = previousIndex;
    await this.showCurrentStep();
  };

  private findPreviousVisibleStep(): number {
    const currentStep = this.steps[this.currentIndex];
    const currentInterface = currentStep?.interfaceName ?? this.options?.label;
    for (let index = this.currentIndex - 1; index >= 0; index -= 1) {
      const step = this.steps[index];
      if ((step?.interfaceName ?? this.options?.label) !== currentInterface) {
        continue;
      }
      const target = step?.interaction?.target ?? step?.target;
      if (!target) {
        continue;
      }
      const element = typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : target();
      if (element?.isConnected && element.getClientRects().length > 0) {
        return index;
      }
    }
    return -1;
  }

  private goNext = async (): Promise<void> => {
    if (this.nextButton?.disabled) {
      return;
    }
    if (this.currentIndex >= this.steps.length - 1) {
      const options = this.options;
      await this.close(false);
      await options?.onComplete?.();
      return;
    }
    this.currentIndex += 1;
    await this.showCurrentStep();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      void this.close(true);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      void this.goBack();
      return;
    }
    if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault();
      void this.goNext();
    }
  };

  private updateGeometry = (): void => {
    if (!this.activeTarget || !this.spotlight || !this.panel || this.blockers.length !== 4) {
      return;
    }
    const rect = this.activeTarget.getBoundingClientRect();
    const left = Math.max(4, rect.left - TARGET_PADDING);
    const top = Math.max(4, rect.top - TARGET_PADDING);
    const right = Math.min(window.innerWidth - 4, rect.right + TARGET_PADDING);
    const bottom = Math.min(window.innerHeight - 4, rect.bottom + TARGET_PADDING);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);

    Object.assign(this.spotlight.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    const [topBlocker, rightBlocker, bottomBlocker, leftBlocker] = this.blockers;
    Object.assign(topBlocker?.style ?? {}, { left: "0", top: "0", width: "100vw", height: `${top}px` });
    Object.assign(rightBlocker?.style ?? {}, { left: `${right}px`, top: `${top}px`, width: `${Math.max(0, window.innerWidth - right)}px`, height: `${height}px` });
    Object.assign(bottomBlocker?.style ?? {}, { left: "0", top: `${bottom}px`, width: "100vw", height: `${Math.max(0, window.innerHeight - bottom)}px` });
    Object.assign(leftBlocker?.style ?? {}, { left: "0", top: `${top}px`, width: `${left}px`, height: `${height}px` });

    const panelRect = this.panel.getBoundingClientRect();
    const availableBelow = window.innerHeight - bottom;
    const panelTop = availableBelow >= panelRect.height + 18
      ? bottom + 12
      : Math.max(12, top - panelRect.height - 12);
    const panelLeft = Math.max(12, Math.min(left, window.innerWidth - panelRect.width - 12));
    Object.assign(this.panel.style, { left: `${panelLeft}px`, top: `${panelTop}px` });
  };
}

export function createHelpButton(parent: HTMLElement, onClick: () => void): HTMLButtonElement {
  const button = parent.createEl("button", { cls: "ng-help-button" });
  button.setAttribute("aria-label", "Open walkthrough");
  button.setAttribute("title", "Open walkthrough");
  for (const iconName of ["circle-help", "help-circle", "circle-question-mark"]) {
    setIcon(button, iconName);
    if (button.querySelector("svg")) {
      break;
    }
  }
  if (!button.querySelector("svg")) {
    button.setText("?");
  }
  button.addEventListener("click", onClick);
  return button;
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
}
