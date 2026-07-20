import { App, TFile, parseYaml, stringifyYaml } from "obsidian";
import { DEFAULT_STATE, NOTES_FOLDER, TASK_MANAGER_FILE_PATH } from "./constants";
import { normalizeState } from "./taskState";
import { TaskManagerState } from "./types";

export class TaskManagerStorage {
  constructor(private readonly app: App) {}

  async ensureTaskManagerFile(): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(TASK_MANAGER_FILE_PATH);
    if (existing instanceof TFile) {
      return existing;
    }

    const folderPath = TASK_MANAGER_FILE_PATH.split("/").slice(0, -1).join("/");
    if (folderPath) {
      await this.ensureFolderExists(folderPath);
    }

    const fileContent = `${this.serializeFrontmatter(DEFAULT_STATE)}\n# Task Manager\n`;
    try {
      return await this.app.vault.create(TASK_MANAGER_FILE_PATH, fileContent);
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(TASK_MANAGER_FILE_PATH);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create task manager file at ${TASK_MANAGER_FILE_PATH}`);
    }
  }

  async loadTaskManagerState(): Promise<TaskManagerState> {
    const file = await this.ensureTaskManagerFile();
    const content = await this.app.vault.read(file);
    const frontmatter = this.extractFrontmatter(content);
    return normalizeState({ ...DEFAULT_STATE, ...frontmatter });
  }

  async saveTaskManagerState(state: TaskManagerState): Promise<void> {
    const file = await this.ensureTaskManagerFile();
    const content = await this.app.vault.read(file);
    const normalized = normalizeState(state);
    const frontmatterText = this.serializeFrontmatter(normalized);
    const next = content.match(/^---\n[\s\S]*?\n---\n?/) ? content.replace(/^---\n[\s\S]*?\n---\n?/, `${frontmatterText}\n`) : `${frontmatterText}\n${content}`;
    await this.app.vault.modify(file, next);
  }

  async ensureNotesFolder(): Promise<void> {
    await this.ensureFolderExists(NOTES_FOLDER);
  }

  private async ensureFolderExists(path: string): Promise<void> {
    const segments = path.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (this.app.vault.getAbstractFileByPath(currentPath)) {
        continue;
      }

      try {
        await this.app.vault.createFolder(currentPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const lower = message.toLowerCase();
        if (lower.includes("already exists")) {
          continue;
        }
        if (this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
        const existsOnDisk = await this.app.vault.adapter.exists(currentPath);
        if (existsOnDisk) {
          continue;
        }
        throw new Error(`Failed to create folder at ${currentPath}: ${message}`);
      }
    }
  }

  private extractFrontmatter(content: string): Record<string, unknown> {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!match) {
      return {};
    }
    return (parseYaml(match[1]) as Record<string, unknown>) ?? {};
  }

  private serializeFrontmatter(state: TaskManagerState): string {
    const yaml = stringifyYaml(state).replace(/\s+$/, "");
    return `---\n${yaml}\n---`;
  }
}
