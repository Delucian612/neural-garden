import { Plugin, WorkspaceLeaf } from "obsidian";
import { NeuralGardenHomeView } from "./homeView";
import { TaskManagerStorage } from "./storage";
import { VIEW_TYPE_NEURAL_GARDEN_HOME } from "./constants";

export default class NeuralGardenPlugin extends Plugin {
  private storage!: TaskManagerStorage;

  async onload() {
    this.storage = new TaskManagerStorage(this.app);
    await this.storage.ensureNotesFolder();

    this.registerView(VIEW_TYPE_NEURAL_GARDEN_HOME, (leaf) => new NeuralGardenHomeView(leaf, this.storage));

    this.addCommand({
      id: "open-neural-garden-home",
      name: "Open Neural Garden Home",
      callback: async () => {
        await this.openHomeView(true);
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
  }

  private async openHomeOnStartup(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_NEURAL_GARDEN_HOME);
    if (leaves.length > 0) {
      return;
    }

    const activeLeaf = this.app.workspace.getMostRecentLeaf();
    if (activeLeaf && activeLeaf.getViewState().type === "empty") {
      await this.openHomeView(false, activeLeaf);
      return;
    }

    if (!activeLeaf) {
      await this.openHomeView(false);
    }
  }

  private async openHomeView(makeActive: boolean, targetLeaf?: WorkspaceLeaf): Promise<void> {
    const leaf = targetLeaf ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_NEURAL_GARDEN_HOME, active: makeActive });
    if (makeActive) {
      this.app.workspace.revealLeaf(leaf);
    }
  }
}
