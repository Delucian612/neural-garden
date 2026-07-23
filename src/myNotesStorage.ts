import { App, TFile } from "obsidian";
import {
  MY_NOTES_CATEGORIES_FILE_PATH,
  MY_NOTES_MAINTENANCE_FOLDER,
  NOTES_FOLDER,
} from "./constants";

export interface MyNotesCategory {
  name: string;
  count: number;
}

function stripLink(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}

function toLink(name: string): string {
  return `[[${name}]]`;
}

export class MyNotesStorage {
  constructor(private readonly app: App) {}

  async ensureCategoriesFile(): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(MY_NOTES_CATEGORIES_FILE_PATH);
    if (existing instanceof TFile) {
      return existing;
    }
    await this.ensureFolderExists(MY_NOTES_MAINTENANCE_FOLDER);
    try {
      return await this.app.vault.create(MY_NOTES_CATEGORIES_FILE_PATH, "---\ncategories: {}\n---\n# Categories\n");
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(MY_NOTES_CATEGORIES_FILE_PATH);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create categories file at ${MY_NOTES_CATEGORIES_FILE_PATH}`);
    }
  }

  async loadCategories(): Promise<MyNotesCategory[]> {
    const file = await this.ensureCategoriesFile();
    const raw = this.app.metadataCache.getFileCache(file)?.frontmatter?.categories;
    const categories: MyNotesCategory[] = [];
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [name, count] of Object.entries(raw as Record<string, unknown>)) {
        categories.push({ name, count: typeof count === "number" && Number.isFinite(count) ? Math.max(0, count) : 0 });
      }
    }
    return categories;
  }

  async addCategory(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const file = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = (fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories))
        ? fm.categories as Record<string, number>
        : {};
      if (!(trimmed in categories)) {
        categories[trimmed] = 0;
      }
      fm.categories = categories;
    });
  }

  async adjustCategoryCount(name: string, delta: number): Promise<void> {
    const file = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = (fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories))
        ? fm.categories as Record<string, number>
        : {};
      const current = typeof categories[name] === "number" ? categories[name] : 0;
      categories[name] = Math.max(0, current + delta);
      fm.categories = categories;
    });
  }

  listNotes(): TFile[] {
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(`${NOTES_FOLDER}/`))
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  isNoteFile(file: TFile | null): boolean {
    return !!file && file.extension === "md" && file.path.startsWith(`${NOTES_FOLDER}/`);
  }

  noteExists(name: string): boolean {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return false;
    }
    return this.app.vault.getAbstractFileByPath(`${NOTES_FOLDER}/${trimmed}.md`) instanceof TFile;
  }

  async createNote(name: string): Promise<TFile | null> {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return null;
    }
    const path = `${NOTES_FOLDER}/${trimmed}.md`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      return existing;
    }
    await this.ensureFolderExists(NOTES_FOLDER);
    return await this.app.vault.create(path, "");
  }

  async deleteNote(file: TFile): Promise<void> {
    const categories = this.getNoteCategories(file);
    await this.app.vault.trash(file, true);
    for (const category of categories) {
      await this.adjustCategoryCount(category, -1);
    }
  }

  private sanitizeNoteName(name: string): string {
    return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  }

  getNoteCategories(file: TFile): string[] {
    const raw = this.app.metadataCache.getFileCache(file)?.frontmatter?.category;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map(stripLink).filter(Boolean);
  }

  async toggleNoteCategory(file: TFile, name: string): Promise<boolean> {
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current: string[] = Array.isArray(fm.category) ? fm.category.map(stripLink).filter(Boolean) : [];
      if (current.includes(name)) {
        fm.category = current.filter((entry) => entry !== name).map(toLink);
        nowActive = false;
      } else {
        fm.category = [...current, name].map(toLink);
        nowActive = true;
      }
    });
    await this.adjustCategoryCount(name, nowActive ? 1 : -1);
    return nowActive;
  }

  isFavourite(file: TFile): boolean {
    return this.app.metadataCache.getFileCache(file)?.frontmatter?.favourite === true;
  }

  async toggleFavourite(file: TFile): Promise<boolean> {
    let nowFavourite = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      nowFavourite = fm.favourite !== true;
      fm.favourite = nowFavourite;
    });
    return nowFavourite;
  }

  isSupportNote(file: TFile): boolean {
    return this.app.metadataCache.getFileCache(file)?.frontmatter?.SupportNote === true;
  }

  async setSupportNote(file: TFile, value: boolean): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.SupportNote = value;
      if (!value) {
        delete fm.support;
      }
    });
  }

  getNoteSupports(file: TFile): string[] {
    const raw = this.app.metadataCache.getFileCache(file)?.frontmatter?.support;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter((entry): entry is string => typeof entry === "string");
  }

  async toggleNoteSupport(file: TFile, name: string): Promise<boolean> {
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current: string[] = Array.isArray(fm.support)
        ? fm.support.filter((entry: unknown): entry is string => typeof entry === "string")
        : [];
      if (current.includes(name)) {
        fm.support = current.filter((entry) => entry !== name);
        nowActive = false;
      } else {
        fm.support = [...current, name];
        nowActive = true;
      }
    });
    return nowActive;
  }

  notesInCategory(name: string): TFile[] {
    return this.listNotes().filter((file) => this.getNoteCategories(file).includes(name));
  }

  favouriteNotes(): TFile[] {
    return this.listNotes().filter((file) => this.isFavourite(file));
  }

  notesWithSupport(name: string): TFile[] {
    return this.listNotes().filter((file) => this.isSupportNote(file) && this.getNoteSupports(file).includes(name));
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
        if (message.toLowerCase().includes("already exists") || this.app.vault.getAbstractFileByPath(currentPath)) {
          continue;
        }
        throw error;
      }
    }
  }
}
