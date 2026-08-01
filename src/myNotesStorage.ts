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

function parseCategoryMap(value: string): Record<string, number> {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "{}") {
    return {};
  }

  const inner = trimmed.replace(/^\{/, "").replace(/\}$/, "");
  const entries: Record<string, number> = {};
  for (const part of inner.split(",")) {
    const [rawName, rawCount] = part.split(":");
    if (!rawName || !rawCount) {
      continue;
    }
    const name = rawName.trim().replace(/^['"]|['"]$/g, "");
    const count = Number(rawCount.trim());
    entries[name] = Number.isFinite(count) ? Math.max(0, count) : 0;
  }
  return entries;
}

function parseCategoriesFromText(text: string): Record<string, number> {
  const lines = text.split(/\r?\n/);
  const frontmatterStart = lines.indexOf("---");
  if (frontmatterStart < 0) {
    return {};
  }

  let inCategories = false;
  const block: string[] = [];
  for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      break;
    }

    if (!inCategories) {
      const match = line.match(/^categories:\s*(.*)$/);
      if (!match) {
        continue;
      }

      const inlineValue = match[1]?.trim() ?? "";
      if (inlineValue) {
        return parseCategoryMap(inlineValue);
      }

      inCategories = true;
      continue;
    }

    if (/^\S/.test(line)) {
      break;
    }
    const entry = line.match(/^\s{2}([^:]+):\s*(.*)$/);
    if (entry) {
      block.push(`${entry[1].trim()}: ${entry[2].trim()}`);
    }
  }

  return parseCategoryMap(`{${block.join(",")}}`);
}

function parseNoteCategoriesFromText(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const frontmatterStart = lines.indexOf("---");
  if (frontmatterStart < 0) {
    return [];
  }

  let inCategoryBlock = false;
  const categories: string[] = [];
  for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      break;
    }

    if (!inCategoryBlock) {
      const match = line.match(/^category:\s*(.*)$/);
      if (!match) {
        continue;
      }

      const inlineValue = match[1]?.trim() ?? "";
      if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
        const inner = inlineValue.slice(1, -1);
        for (const entry of inner.split(",")) {
          const clean = stripLink(entry.trim().replace(/^['"]|['"]$/g, ""));
          if (clean) {
            categories.push(clean);
          }
        }
        return categories;
      }

      inCategoryBlock = true;
      continue;
    }

    if (/^\S/.test(line)) {
      break;
    }

    const entry = line.match(/^\s*-\s*(.*)$/);
    if (entry) {
      const clean = stripLink(entry[1].trim().replace(/^['"]|['"]$/g, ""));
      if (clean) {
        categories.push(clean);
      }
    }
  }

  return categories;
}

function parseSupportFromText(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const frontmatterStart = lines.indexOf("---");
  if (frontmatterStart < 0) {
    return [];
  }

  let inSupportBlock = false;
  const supports: string[] = [];
  for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      break;
    }

    if (!inSupportBlock) {
      const match = line.match(/^support:\s*(.*)$/);
      if (!match) {
        continue;
      }

      const inlineValue = match[1]?.trim() ?? "";
      if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
        const inner = inlineValue.slice(1, -1);
        for (const entry of inner.split(",")) {
          const clean = entry.trim().replace(/^['"]|['"]$/g, "");
          if (clean) {
            supports.push(clean);
          }
        }
        return supports;
      }

      inSupportBlock = true;
      continue;
    }

    if (/^\S/.test(line)) {
      break;
    }

    const entry = line.match(/^\s*-\s*(.*)$/);
    if (entry) {
      const clean = entry[1].trim().replace(/^['"]|['"]$/g, "");
      if (clean) {
        supports.push(clean);
      }
    }
  }

  return supports;
}

export class MyNotesStorage {
  constructor(private readonly app: App) {}

  private toCategoryLinks(names: string[]): string[] {
    return names.map((name) => toLink(name));
  }

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
    const text = await this.app.vault.read(file);
    const raw = parseCategoriesFromText(text);
    const categories: MyNotesCategory[] = [];
    for (const [name, count] of Object.entries(raw)) {
      categories.push({ name, count });
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

  async renameCategory(previousName: string, nextName: string): Promise<boolean> {
    const previous = previousName.trim();
    const next = nextName.trim();
    if (!previous || !next) {
      return false;
    }
    if (previous === next) {
      return true;
    }

    const file = await this.ensureCategoriesFile();
    let renamed = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = (fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories))
        ? fm.categories as Record<string, number>
        : {};

      if (!(previous in categories) || (next in categories)) {
        return;
      }

      const nextCategories: Record<string, number> = {};
      for (const [name, count] of Object.entries(categories)) {
        if (name === previous) {
          nextCategories[next] = count;
        } else {
          nextCategories[name] = count;
        }
      }

      fm.categories = nextCategories;
      renamed = true;
    });

    if (!renamed) {
      return false;
    }

    for (const note of await this.notesInCategory(previous)) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = Array.isArray(fm.category) ? fm.category.map(stripLink).filter(Boolean) : [];
        if (!current.includes(previous)) {
          return;
        }
        fm.category = this.toCategoryLinks(current.map((name) => (name === previous ? next : name)));
      });
    }

    return true;
  }

  async deleteCategory(name: string): Promise<boolean> {
    const target = name.trim();
    if (!target) {
      return false;
    }

    const file = await this.ensureCategoriesFile();
    let removed = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = (fm.categories && typeof fm.categories === "object" && !Array.isArray(fm.categories))
        ? fm.categories as Record<string, number>
        : {};

      if (!(target in categories)) {
        return;
      }

      delete categories[target];
      fm.categories = categories;
      removed = true;
    });

    if (!removed) {
      return false;
    }

    for (const note of await this.notesInCategory(target)) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = Array.isArray(fm.category) ? fm.category.map(stripLink).filter(Boolean) : [];
        if (!current.includes(target)) {
          return;
        }
        fm.category = this.toCategoryLinks(current.filter((entry) => entry !== target));
      });
    }

    return true;
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

  async getNoteCategoriesFresh(file: TFile): Promise<string[]> {
    const text = await this.app.vault.read(file);
    return parseNoteCategoriesFromText(text);
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

  async isSupportNoteFresh(file: TFile): Promise<boolean> {
    const text = await this.app.vault.read(file);
    const lines = text.split(/\r?\n/);
    const frontmatterStart = lines.indexOf("---");
    if (frontmatterStart < 0) {
      return false;
    }
    for (let index = frontmatterStart + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line === "---") {
        break;
      }
      const match = line.match(/^SupportNote:\s*(true|false)$/i);
      if (match) {
        return match[1].toLowerCase() === "true";
      }
    }
    return false;
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

  async getNoteSupportsFresh(file: TFile): Promise<string[]> {
    const text = await this.app.vault.read(file);
    return parseSupportFromText(text);
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

  async notesInCategory(name: string): Promise<TFile[]> {
    const files = this.listNotes();
    const matches: TFile[] = [];
    for (const file of files) {
      const text = await this.app.vault.read(file);
      if (parseNoteCategoriesFromText(text).includes(name)) {
        matches.push(file);
      }
    }
    return matches;
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
