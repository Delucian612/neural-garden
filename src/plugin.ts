import { Plugin, WorkspaceLeaf } from "obsidian";
import { NeuralGardenHomeView } from "./homeView";
import { NeuralGardenJournalEntryView } from "./journalingEntryView";
import { NeuralGardenJournalingView } from "./journalingView";
import { NeuralGardenMyNotesView } from "./myNotesView";
import { JournalingStorage } from "./journalingStorage";
import { MyNotesStorage } from "./myNotesStorage";
import { NoteHeaderManager } from "./noteHeader";
import { TaskManagerStorage } from "./storage";
import {
  VIEW_TYPE_NEURAL_GARDEN_HOME,
  VIEW_TYPE_NEURAL_GARDEN_JOURNALING,
  VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY,
  VIEW_TYPE_NEURAL_GARDEN_MY_NOTES,
} from "./constants";

export default class NeuralGardenPlugin extends Plugin {
  private storage!: TaskManagerStorage;
  private journalingStorage!: JournalingStorage;
  private myNotesStorage!: MyNotesStorage;
  private noteHeaderManager!: NoteHeaderManager;

  async onload() {
    this.storage = new TaskManagerStorage(this.app);
    this.journalingStorage = new JournalingStorage(this.app);
    this.myNotesStorage = new MyNotesStorage(this.app);
    this.hidePropertiesInDocument();
    this.noteHeaderManager = new NoteHeaderManager(
      this.app,
      this.myNotesStorage,
      this.openHomeView,
      this.openMyNotesView,
    );
    await this.storage.ensureNotesFolder();
    await this.journalingStorage.ensureJournalFolders();

    this.registerView(VIEW_TYPE_NEURAL_GARDEN_HOME, (leaf) =>
      new NeuralGardenHomeView(leaf, this.storage, this.openJournalingView, this.openMyNotesView),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES, (leaf) =>
      new NeuralGardenMyNotesView(leaf, this.myNotesStorage, this.openHomeView),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_JOURNALING, (leaf) =>
      new NeuralGardenJournalingView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalEntryView),
    );
    this.registerView(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY, (leaf) =>
      new NeuralGardenJournalEntryView(leaf, this.storage, this.journalingStorage, this.openHomeView, this.openJournalingView),
    );

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

    this.addRibbonIcon("sparkles", "Open Neural Garden Home", async () => {
      await this.openHomeView(true);
    });

    this.app.workspace.onLayoutReady(async () => {
      await this.openHomeOnStartup();
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", async (leaf) => {
        if (!leaf) {
          return;
        }
        if (leaf.getViewState().type === "empty") {
          await this.openHomeView(false, leaf);
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
    this.app.workspace.onLayoutReady(() => {
      this.noteHeaderManager.sync();
    });
  }

  onunload() {
    this.noteHeaderManager.detachAll();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_MY_NOTES);
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

  private openMyNotesView = async (makeActive: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> => {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_MY_NOTES, active: makeActive });
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
