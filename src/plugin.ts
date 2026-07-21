import { Plugin, WorkspaceLeaf } from "obsidian";
import { NeuralGardenHomeView } from "./homeView";
import { NeuralGardenJournalEntryView } from "./journalingEntryView";
import { NeuralGardenJournalingView } from "./journalingView";
import { JournalingStorage } from "./journalingStorage";
import { TaskManagerStorage } from "./storage";
import {
  VIEW_TYPE_NEURAL_GARDEN_HOME,
  VIEW_TYPE_NEURAL_GARDEN_JOURNALING,
  VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY,
} from "./constants";

export default class NeuralGardenPlugin extends Plugin {
  private storage!: TaskManagerStorage;
  private journalingStorage!: JournalingStorage;

  async onload() {
    this.storage = new TaskManagerStorage(this.app);
    this.journalingStorage = new JournalingStorage(this.app);
    await this.storage.ensureNotesFolder();
    await this.journalingStorage.ensureJournalFolders();

    this.registerView(VIEW_TYPE_NEURAL_GARDEN_HOME, (leaf) =>
      new NeuralGardenHomeView(leaf, this.storage, this.openJournalingView),
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
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNALING);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_JOURNAL_ENTRY);
  }

  private async openHomeOnStartup(): Promise<void> {
    const targetLeaf = this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(true);
    await this.openHomeView(true, targetLeaf);
  }

  private async openHomeView(makeActive: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> {
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
