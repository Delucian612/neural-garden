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
  DEFAULT_SETTINGS,
  NeuralGardenSettings,
  NeuralGardenSettingTab,
} from "./settings";
import { TaskManagerStorage } from "./storage";
import { WeeklyRecapManager } from "./weeklyRecapManager";
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
  private myLearningSelection: { category: string | null; topic: string | null } = {
    category: null,
    topic: null,
  };

  async onload() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...await this.loadData() as Partial<NeuralGardenSettings> | null,
    };
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
        this.settings.forcedBreaksEnabled,
        this.openJournalingView,
        this.openMyNotesView,
        this.openMyLearningView,
        this.openWeeklyRecap,
      ),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES, (leaf) =>
      new NeuralGardenMyNotesView(leaf, this.myNotesStorage, this.openHomeView),
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
      ),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_JOURNALING, (leaf) =>
      new NeuralGardenJournalingView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalEntryView, this.openWeeklyRecap),
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
    this.noteHeaderManager.detachAll();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_WEEKLY_RECAP);
  }

  async setForcedBreaksEnabled(enabled: boolean): Promise<void> {
    this.settings.forcedBreaksEnabled = enabled;
    await this.saveData(this.settings);
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME)) {
      if (leaf.view instanceof NeuralGardenHomeView) {
        await leaf.view.setForcedBreaksEnabled(enabled);
      }
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
