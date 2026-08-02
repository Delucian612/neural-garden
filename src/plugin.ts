import { Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { NeuralGardenHomeView } from "./homeView";
import { NeuralGardenJournalEntryView } from "./journalingEntryView";
import { NeuralGardenJournalingView } from "./journalingView";
import { NeuralGardenMyLearningView } from "./myLearningView";
import { MyLearningStorage } from "./myLearningStorage";
import { NeuralGardenMyNotesView } from "./myNotesView";
import { NeuralGardenWeeklyRecapView } from "./weeklyRecapView";
import { JournalingStorage } from "./journalingStorage";
import { MyNotesStorage } from "./myNotesStorage";
import { NoteHeaderManager } from "./noteHeader";
import {
  APPEARANCE_CSS_VARIABLES,
  APPEARANCE_SETTING_KEYS,
  AppearanceSettingKey,
  DEFAULT_SETTINGS,
  NeuralGardenSettings,
  NeuralGardenSettingTab,
} from "./settings";
import { TaskManagerStorage } from "./storage";
import { injectNeuralGardenStyles } from "./styles";
import { WeeklyRecapManager } from "./weeklyRecapManager";
import { WalkthroughManager, WalkthroughSection } from "./walkthroughs";
import { OnboardingDemoSession } from "./onboardingDemo";
import {
  QUICK_NOTES_CATEGORY,
  VIEW_TYPE_NEURAL_GARDEN_HOME,
  VIEW_TYPE_NEURAL_GARDEN_JOURNALING,
  VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY,
  VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING,
  VIEW_TYPE_NEURAL_GARDEN_MY_NOTES,
  VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP,
} from "./constants";

export default class NeuralGardenPlugin extends Plugin {
  settings: NeuralGardenSettings = { ...DEFAULT_SETTINGS };
  private storage!: TaskManagerStorage;
  private journalingStorage!: JournalingStorage;
  private myNotesStorage!: MyNotesStorage;
  private myLearningStorage!: MyLearningStorage;
  private noteHeaderManager!: NoteHeaderManager;
  private weeklyRecapManager!: WeeklyRecapManager;
  private walkthroughManager!: WalkthroughManager;
  private onboardingDemo!: OnboardingDemoSession;
  private myLearningSelection: { category: string | null; topic: string | null } = {
    category: null,
    topic: null,
  };

  async onload() {
    const stored = await this.loadData() as (Partial<NeuralGardenSettings> & {
      forcedBreaksEnabled?: boolean;
      primaryAccent?: string;
      secondaryAccent?: string;
      supportAccent?: string;
    }) | null;
    this.settings = {
      breakModeEnabled: stored?.breakModeEnabled
        ?? stored?.forcedBreaksEnabled
        ?? DEFAULT_SETTINGS.breakModeEnabled,
      generalColor: stored?.generalColor
        ?? stored?.secondaryAccent
        ?? DEFAULT_SETTINGS.generalColor,
      hoverColor: stored?.hoverColor ?? DEFAULT_SETTINGS.hoverColor,
      highlightColor: stored?.highlightColor
        ?? stored?.primaryAccent
        ?? DEFAULT_SETTINGS.highlightColor,
      onboardingCompleted: stored?.onboardingCompleted ?? DEFAULT_SETTINGS.onboardingCompleted,
      onboardingDemo: stored?.onboardingDemo ?? DEFAULT_SETTINGS.onboardingDemo,
    };
    injectNeuralGardenStyles();
    this.applyAppearanceSettings();
    this.storage = new TaskManagerStorage(this.app);
    this.journalingStorage = new JournalingStorage(this.app);
    this.myNotesStorage = new MyNotesStorage(this.app);
    this.myLearningStorage = new MyLearningStorage(this.app);
    this.hidePropertiesInDocument();
    this.noteHeaderManager = new NoteHeaderManager(
      this.app,
      this.myNotesStorage,
      this.myLearningStorage,
      this.openHomeView,
      this.openMyNotesView,
      this.openMyLearningView,
    );
    this.weeklyRecapManager = new WeeklyRecapManager(
      this.app,
      this.journalingStorage,
      this.storage,
      this.myNotesStorage,
    );
    this.onboardingDemo = new OnboardingDemoSession(
      this.app,
      this.journalingStorage,
      this.storage,
      this.settings.onboardingDemo,
      async (state) => {
        this.settings.onboardingDemo = state;
        await this.saveData(this.settings);
      },
    );
    if (this.settings.onboardingDemo) {
      await this.onboardingDemo.cleanup();
    }
    this.walkthroughManager = new WalkthroughManager(
      {
        openHome: async () => {
          const leaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
          await this.openHomeView(true, leaf);
        },
        closeAllTourWindows: async () => this.closeAllNeuralGardenViews(),
        openMyNotes: async () => {
          const leaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
          await this.openMyNotesView(true, leaf);
        },
        openMyNotesCategory: async (category) => {
          const targetLeaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
          await this.openMyNotesView(true, targetLeaf);
          const leaf = this.app.workspace.getMostRecentLeaf();
          if (leaf?.view instanceof NeuralGardenMyNotesView) {
            await leaf.view.showCategory(category);
          }
        },
        openMyLearning: async () => {
          const leaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
          await this.openMyLearningView(true, leaf);
        },
        openJournaling: async () => {
          const leaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
          await this.openJournalingView(true, leaf);
        },
        openWeeklyRecapWeek: async (year, week) => this.openWeeklyRecap(year, week),
        openJournalEntry: async (dateKey) => this.openJournalEntryView(dateKey, true),
        openJournalingDate: async (dateKey) => this.openJournalingForDate(dateKey),
        openJournalingDemoDate: async (dateKey) => {
          await this.openJournalingView(true);
          const leaf = this.app.workspace.getMostRecentLeaf();
          if (leaf?.view instanceof NeuralGardenJournalingView) {
            await leaf.view.showDemoDate(dateKey);
          }
        },
        setBreakMode: async (enabled) => this.setBreakModeEnabled(enabled),
        refreshHome: async () => {
          for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME)) {
            if (leaf.view instanceof NeuralGardenHomeView) {
              await leaf.view.refresh();
            }
          }
        },
      },
      {
        onFirstRunComplete: async () => {
          this.settings.onboardingCompleted = true;
          await this.saveData(this.settings);
        },
        onFirstRunSkip: () => undefined,
      },
      this.onboardingDemo,
    );
    await this.safeInitStep("ensure Notes folder", async () => {
      await this.storage.ensureNotesFolder();
    });
    await this.safeInitStep("ensure Quick Notes category", async () => {
      await this.myNotesStorage.addCategory(QUICK_NOTES_CATEGORY);
    });
    await this.safeInitStep("ensure Journal folders", async () => {
      await this.journalingStorage.ensureJournalFolders();
    });
    await this.safeInitStep("ensure MyLearning storage", async () => {
      await this.myLearningStorage.ensureProvisioned();
    });

    this.registerView(VIEW_TYPE_NEURAL_GARDEN_HOME, (leaf) =>
      new NeuralGardenHomeView(
        leaf,
        this.storage,
        this.journalingStorage,
        this.myNotesStorage,
        this.settings.breakModeEnabled,
        this.openJournalingView,
        this.openMyNotesView,
        this.openMyLearningView,
        this.openWeeklyRecap,
        () => void this.openWalkthrough("home"),
      ),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES, (leaf) =>
      new NeuralGardenMyNotesView(leaf, this.myNotesStorage, this.openHomeView, () => void this.openWalkthrough("mynotes")),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING, (leaf) =>
      new NeuralGardenMyLearningView(
        leaf,
        this.myLearningStorage,
        this.openHomeView,
        this.myLearningSelection,
        (category, topic) => {
          this.myLearningSelection = { category, topic };
        },
        () => void this.openWalkthrough("mylearning"),
      ),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_JOURNALING, (leaf) =>
      new NeuralGardenJournalingView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalEntryView, this.openWeeklyRecap, () => void this.openWalkthrough("journaling")),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY, (leaf) =>
      new NeuralGardenJournalEntryView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalingView),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP, (leaf) =>
      new NeuralGardenWeeklyRecapView(leaf, this.journalingStorage, this.weeklyRecapManager, this.openHomeView, this.openJournalingView),
    );
    this.addSettingTab(new NeuralGardenSettingTab(this));

    this.addCommand({
      id: "open-neural-garden-home",
      name: "Open Neural Garden Home",
      callback: async () => {
        await this.openHomeView(true);
      },
    });

    this.addCommand({
      id: "open-neural-garden-journaling",
      name: "Open Neural Garden Journaling",
      callback: async () => {
        await this.openJournalingView(true);
      },
    });

    this.addCommand({
      id: "open-neural-garden-my-notes",
      name: "Open Neural Garden MyNotes",
      callback: async () => {
        await this.openMyNotesView(true);
      },
    });

    this.addCommand({
      id: "open-neural-garden-my-learning",
      name: "Open Neural Garden MyLearning",
      callback: async () => {
        await this.openMyLearningView(true);
      },
    });

    this.addRibbonIcon("sparkles", "Open Neural Garden Home", async () => {
      await this.openHomeView(true);
    });

    this.app.workspace.onLayoutReady(() => {
      void this.openHomeOnStartupSafe();
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async (leaf) => {
        if (!leaf) {
          return;
        }
        if (leaf.getViewState().type === "empty") {
          try {
            await this.openHomeView(false, leaf);
          } catch (error) {
            console.error("[Neural Garden] Failed to open Home view on active leaf change", error);
          }
        }
      }),
    );

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.noteHeaderManager.sync();
      }),
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.noteHeaderManager.sync();
      }),
    );
    this.registerEvent(
      this.app.vault.on("rename", async (file, oldPath) => {
        if (file instanceof TFile) {
          await this.myLearningStorage.handleEntryRename(file, oldPath);
        }
        window.setTimeout(() => {
          for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING)) {
            if (leaf.view instanceof NeuralGardenMyLearningView) {
              void leaf.view.refresh();
            }
          }
        }, 100);
      }),
    );
    this.app.workspace.onLayoutReady(() => {
      this.noteHeaderManager.sync();
    });
  }

  onunload() {
    void this.walkthroughManager.close();
    for (const key of APPEARANCE_SETTING_KEYS) {
      document.body.style.removeProperty(APPEARANCE_CSS_VARIABLES[key]);
    }
    this.noteHeaderManager.detachAll();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP);
  }

  async setBreakModeEnabled(enabled: boolean): Promise<void> {
    this.settings.breakModeEnabled = enabled;
    await this.saveData(this.settings);
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME)) {
      if (leaf.view instanceof NeuralGardenHomeView) {
        await leaf.view.setBreakModeEnabled(enabled);
      }
    }
  }

  async setAppearanceColor(key: AppearanceSettingKey, value: string): Promise<void> {
    this.settings[key] = value;
    this.applyAppearanceSettings();
    await this.saveData(this.settings);
  }

  async resetAppearanceColor(key: AppearanceSettingKey): Promise<void> {
    this.settings[key] = DEFAULT_SETTINGS[key];
    this.applyAppearanceSettings();
    await this.saveData(this.settings);
  }

  async resetAllAppearanceColors(): Promise<void> {
    for (const key of APPEARANCE_SETTING_KEYS) {
      this.settings[key] = DEFAULT_SETTINGS[key];
    }
    this.applyAppearanceSettings();
    await this.saveData(this.settings);
  }

  async openWalkthrough(section: WalkthroughSection): Promise<void> {
    await this.walkthroughManager.startSection(section);
  }

  async replayFullWalkthrough(): Promise<void> {
    await this.walkthroughManager.startFullReplay();
  }

  private async closeAllNeuralGardenViews(): Promise<void> {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP);
  }

  private applyAppearanceSettings(): void {
    for (const key of APPEARANCE_SETTING_KEYS) {
      document.body.style.setProperty(APPEARANCE_CSS_VARIABLES[key], this.settings[key]);
    }
  }

  private hidePropertiesInDocument(): void {
    const vault = this.app.vault as unknown as {
      getConfig?: (key: string) => unknown;
      setConfig?: (key: string, value: unknown) => void;
    };
    if (vault.getConfig?.("propertiesInDocument") !== "hidden") {
      vault.setConfig?.("propertiesInDocument", "hidden");
    }
  }

  private async openHomeOnStartup(): Promise<void> {
    const targetLeaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
    await this.openHomeView(true, targetLeaf);
    if (!this.settings.onboardingCompleted) {
      await this.walkthroughManager.startFirstRun();
    }
  }

  private async openHomeOnStartupSafe(): Promise<void> {
    try {
      // Queue after layout-ready tick so leaves are fully initialized on cold startup.
      window.setTimeout(() => {
        void this.safeInitStep("open Home on startup", async () => {
          await this.openHomeOnStartup();
        });
      }, 0);
    } catch (error) {
      console.error("[Neural Garden] Failed scheduling Home open on startup", error);
    }
  }

  private async safeInitStep(label: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (error) {
      console.error(`[Neural Garden] Startup step failed: ${label}`, error);
    }
  }

  private openHomeView = async (makeActive: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> => {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_HOME, active: makeActive });
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }

  private async openJournalingView(makeActive: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_JOURNALING, active: makeActive });
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }

  private async openJournalingForDate(dateKey: string): Promise<void> {
    await this.openJournalingView(true);
    const leaf = this.app.workspace.getMostRecentLeaf();
    if (leaf?.view instanceof NeuralGardenJournalingView) {
      await leaf.view.showDate(dateKey);
    }
  }

  private openWeeklyRecap = async (year: number, week: number, targetLeaf?: WorkspaceLeaf): Promise<void> => {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP, active: true });
    const view = leaf.view;
    if (view instanceof NeuralGardenWeeklyRecapView) {
      await view.openForWeek(year, week);
    }
    this.app.workspace.revealLeaf(leaf);
  }

  private openMyNotesView = async (makeActive: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> => {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_MY_NOTES, active: makeActive });
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }

  private openMyLearningView = async (
    makeActive: boolean,
    targetLeaf?: WorkspaceLeaf,
    selectedCategory?: string,
    selectedTopic?: string,
  ): Promise<void> => {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING, active: makeActive });
    const view = leaf.view;
    if (view instanceof NeuralGardenMyLearningView) {
      const category = this.myLearningSelection.category ?? selectedCategory ?? null;
      const topic = category === this.myLearningSelection.category
        ? this.myLearningSelection.topic
        : selectedTopic ?? null;
      await view.setSelection(category, topic);
    }
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }

  private async openJournalEntryView(dateKey: string, editable: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY, active: true });
    const view = leaf.view;
    if (view instanceof NeuralGardenJournalEntryView) {
      await view.openForDate(dateKey, editable);
    }
    this.app.workspace.revealLeaf(leaf);
  }
}
