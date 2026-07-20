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
    if (folderPath && !this.app.vault.getAbstractFileByPath(folderPath)) {
      await this.app.vault.createFolder(folderPath);
    }

    const fileContent = `${this.serializeFrontmatter(DEFAULT_STATE)}\n# Task Manager\n`;
    return this.app.vault.create(TASK_MANAGER_FILE_PATH, fileContent);
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
    if (!this.app.vault.getAbstractFileByPath(NOTES_FOLDER)) {
      await this.app.vault.createFolder(NOTES_FOLDER);
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
