import { App, TFile, getFrontMatterInfo, parseYaml } from "obsidian";
import {
  MY_NOTES_CATEGORIES_FILE_PATH,
  MY_NOTES_CATEGORIES_FOLDER,
  MY_NOTES_INDEX_FILE_PATH,
  MY_NOTES_MAINTENANCE_FOLDER,
  NOTES_FOLDER,
} from "./constants";

export interface MyNotesCategory {
  name: string;
  count: number;
}

type MyNotesCanvasSelection = { category: string | null; topics: string[] };
type MyNotesCanvasMap = Record<string, MyNotesCanvasSelection>;

function stripLink(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}

function toLink(name: string): string {
  return `[[${name}]]`;
}

function normalizeLinks(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return values
    .map(stripLink)
    .filter((entry, index, entries) => entry.length > 0 && entries.indexOf(entry) === index);
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
      const normalizedInlineValue = inlineValue.replace(/^['"]|['"]$/g, "");
      if (normalizedInlineValue.startsWith("[[") && normalizedInlineValue.endsWith("]]")) {
        const clean = stripLink(normalizedInlineValue);
        return clean ? [clean] : [];
      }
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
  private topicColors: Record<string, Record<string, string>> = {};
  private topicColorsLoaded = false;

  constructor(private readonly app: App) {}

  private toCategoryLinks(names: string[]): string[] {
    return names.map((name) => toLink(name));
  }

  async ensureCategoriesFile(): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(MY_NOTES_INDEX_FILE_PATH);
    if (existing instanceof TFile) {
      const frontmatter = await this.readFrontmatter(existing);
      let categories = normalizeLinks(frontmatter?.categories);
      if (frontmatter?.schemaVersion !== 2) {
        const legacyCategories = await this.loadLegacyCategories();
        categories = [...categories, ...legacyCategories]
          .filter((category, index, entries) => entries.indexOf(category) === index);
        await this.app.fileManager.processFrontMatter(existing, (fm) => {
          fm.categories = categories.map(toLink);
          fm.topicColors = this.getTopicColorMap(fm.topicColors);
          fm.canvases = this.getCanvasMap(fm.canvases);
          fm.schemaVersion = 2;
        });
        await this.migrateExistingNotes();
      }
      const topicColors = this.getTopicColorMap(frontmatter.topicColors);
      this.topicColors = topicColors;
      this.topicColorsLoaded = true;
      for (const category of categories) {
        const knownTopics = [
          ...Object.keys(topicColors[category] ?? {}),
          ...this.notesInCategorySync(category).flatMap((note) => this.getNoteTopics(note)),
        ].filter((topic, index, topics) => topics.indexOf(topic) === index);
        await this.ensureCategoryLinkingNote(category, knownTopics);
      }
      return existing;
    }
    await this.ensureFolderExists(NOTES_FOLDER);
    const legacyCategories = await this.loadLegacyCategories();
    try {
      const file = await this.app.vault.create(
        MY_NOTES_INDEX_FILE_PATH,
        "---\ncategories: []\ntopicColors: {}\ncanvases: {}\nschemaVersion: 2\n---\n# Notes\n",
      );
      this.topicColors = {};
      this.topicColorsLoaded = true;
      for (const category of legacyCategories) {
        await this.addCategory(category);
      }
      await this.migrateExistingNotes();
      return file;
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(MY_NOTES_INDEX_FILE_PATH);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create MyNotes index at ${MY_NOTES_INDEX_FILE_PATH}`);
    }
  }

  async loadCategories(): Promise<MyNotesCategory[]> {
    const file = await this.ensureCategoriesFile();
    const raw = (await this.readFrontmatter(file)).categories;
    return normalizeLinks(raw)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, count: this.entriesInCategory(name).length }));
  }

  async addCategory(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const file = await this.ensureCategoriesFile();
    const existingCategories = normalizeLinks((await this.readFrontmatter(file)).categories);
    if (existingCategories.includes(trimmed)) {
      await this.ensureCategoryLinkingNote(trimmed);
      return;
    }
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = normalizeLinks(fm.categories);
      if (!categories.includes(trimmed)) {
        categories.push(trimmed);
      }
      fm.categories = categories.map(toLink);
    });
    await this.ensureCategoryLinkingNote(trimmed);
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
      const categories = normalizeLinks(fm.categories);
      if (!categories.includes(previous) || categories.includes(next)) {
        return;
      }
      fm.categories = categories.map((name) => toLink(name === previous ? next : name));
      const topicColors = this.getTopicColorMap(fm.topicColors);
      if (previous in topicColors) {
        topicColors[next] = topicColors[previous] ?? {};
        delete topicColors[previous];
      }
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMap(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === previous) {
          metadata.category = next;
        }
      }
      fm.canvases = canvases;
      renamed = true;
    });

    if (!renamed) {
      return false;
    }

    await this.renameCategoryLinkingNote(previous, next);
    for (const note of await this.notesInCategory(previous)) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        fm.category = toLink(next);
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
      const categories = normalizeLinks(fm.categories);
      if (!categories.includes(target)) {
        return;
      }
      fm.categories = categories.filter((name) => name !== target).map(toLink);
      const topicColors = this.getTopicColorMap(fm.topicColors);
      delete topicColors[target];
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMap(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === target) {
          metadata.category = null;
          metadata.topics = [];
        }
      }
      fm.canvases = canvases;
      removed = true;
    });

    if (!removed) {
      return false;
    }

    await this.deleteCategoryLinkingNote(target);
    for (const note of await this.notesInCategory(target)) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        delete fm.category;
        delete fm.topics;
      });
    }

    return true;
  }

  async adjustCategoryCount(name: string, delta: number): Promise<void> {
    void name;
    void delta;
  }

  listNotes(): TFile[] {
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => (
        file.path.startsWith(`${NOTES_FOLDER}/`)
        && file.path !== MY_NOTES_INDEX_FILE_PATH
        && !file.path.startsWith(`${MY_NOTES_CATEGORIES_FOLDER}/`)
      ))
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  listEntries(): TFile[] {
    return this.app.vault
      .getFiles()
      .filter((file) => (
        file.path.startsWith(`${NOTES_FOLDER}/`)
        && file.path !== MY_NOTES_INDEX_FILE_PATH
        && !file.path.startsWith(`${MY_NOTES_CATEGORIES_FOLDER}/`)
        && (file.extension === "md" || file.extension === "canvas")
      ))
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  isNoteFile(file: TFile | null): boolean {
    return !!file
      && file.extension === "md"
      && file.path.startsWith(`${NOTES_FOLDER}/`)
      && file.path !== MY_NOTES_INDEX_FILE_PATH
      && !file.path.startsWith(`${MY_NOTES_CATEGORIES_FOLDER}/`);
  }

  noteExists(name: string): boolean {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return false;
    }
    return ["md", "canvas"].some((extension) => (
      this.app.vault.getAbstractFileByPath(`${NOTES_FOLDER}/${trimmed}.${extension}`) instanceof TFile
    ));
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

  async createCanvas(name: string, category: string, topic: string): Promise<TFile | null> {
    const trimmed = this.sanitizeNoteName(name);
    const normalizedCategory = category.trim();
    const normalizedTopic = topic.trim();
    if (!trimmed || !normalizedCategory || !normalizedTopic) {
      return null;
    }
    const path = `${NOTES_FOLDER}/${trimmed}.canvas`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      return existing;
    }
    await this.ensureFolderExists(NOTES_FOLDER);
    const file = await this.app.vault.create(path, JSON.stringify({ nodes: [], edges: [] }, null, 2));
    const index = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(index, (fm) => {
      const canvases = this.getCanvasMap(fm.canvases);
      canvases[file.path] = { category: normalizedCategory, topics: [normalizedTopic] };
      fm.canvases = canvases;
    });
    await this.syncCanvasTopicLinks(file, [normalizedTopic]);
    return file;
  }

  async deleteNote(file: TFile): Promise<void> {
    if (file.extension === "canvas") {
      const index = await this.ensureCategoriesFile();
      await this.app.fileManager.processFrontMatter(index, (fm) => {
        const canvases = this.getCanvasMap(fm.canvases);
        delete canvases[file.path];
        fm.canvases = canvases;
      });
    }
    await this.app.vault.trash(file, true);
  }

  async handleEntryRename(file: TFile, oldPath: string): Promise<void> {
    if (file.extension !== "canvas" || oldPath === file.path) {
      return;
    }
    const index = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(index, (fm) => {
      const canvases = this.getCanvasMap(fm.canvases);
      const metadata = canvases[oldPath];
      if (!metadata) {
        return;
      }
      delete canvases[oldPath];
      canvases[file.path] = metadata;
      fm.canvases = canvases;
    });
  }

  private sanitizeNoteName(name: string): string {
    return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  }

  getNoteCategories(file: TFile): string[] {
    const raw = this.app.metadataCache.getFileCache(file)?.frontmatter?.category;
    return normalizeLinks(raw).slice(0, 1);
  }

  getNoteCategory(file: TFile): string | null {
    return this.getNoteCategories(file)[0] ?? null;
  }

  getEntryCategory(file: TFile): string | null {
    return file.extension === "canvas"
      ? this.getCanvasMetadata(file)?.category ?? null
      : this.getNoteCategory(file);
  }

  async getNoteCategoriesFresh(file: TFile): Promise<string[]> {
    const text = await this.app.vault.read(file);
    return parseNoteCategoriesFromText(text);
  }

  async toggleNoteCategory(file: TFile, name: string): Promise<boolean> {
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = normalizeLinks(fm.category)[0] ?? null;
      if (current === name) {
        delete fm.category;
        delete fm.topics;
        nowActive = false;
      } else {
        fm.category = toLink(name);
        fm.topics = [];
        nowActive = true;
      }
    });
    if (nowActive) {
      await this.addCategory(name);
    }
    return nowActive;
  }

  async setNoteCategory(file: TFile, name: string): Promise<void> {
    const category = name.trim();
    if (!category) {
      return;
    }
    await this.addCategory(category);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const changed = normalizeLinks(fm.category)[0] !== category;
      fm.category = toLink(category);
      if (changed) {
        fm.topics = [];
      }
    });
  }

  getNoteTopics(file: TFile): string[] {
    return normalizeLinks(this.app.metadataCache.getFileCache(file)?.frontmatter?.topics);
  }

  getEntryTopics(file: TFile): string[] {
    if (file.extension === "canvas") {
      return this.getCanvasMetadata(file)?.topics ?? [];
    }
    return this.getNoteTopics(file);
  }

  getCanvasSelection(file: TFile): MyNotesCanvasSelection | null {
    return file.extension === "canvas" ? this.getCanvasMetadata(file) : null;
  }

  async toggleCanvasCategory(file: TFile, name: string): Promise<boolean> {
    const category = name.trim();
    if (file.extension !== "canvas" || !category) {
      return false;
    }
    let nowActive = false;
    const index = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(index, (fm) => {
      const canvases = this.getCanvasMap(fm.canvases);
      const selection = canvases[file.path] ?? { category: null, topics: [] };
      nowActive = selection.category !== category;
      selection.category = nowActive ? category : null;
      selection.topics = [];
      canvases[file.path] = selection;
      fm.canvases = canvases;
    });
    await this.syncCanvasTopicLinks(file, []);
    return nowActive;
  }

  async toggleCanvasTopic(file: TFile, name: string): Promise<boolean> {
    const topic = name.trim();
    if (file.extension !== "canvas" || !topic) {
      return false;
    }
    let nowActive = false;
    let selectedTopics: string[] = [];
    const index = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(index, (fm) => {
      const canvases = this.getCanvasMap(fm.canvases);
      const selection = canvases[file.path];
      if (!selection?.category) {
        return;
      }
      nowActive = !selection.topics.includes(topic);
      selection.topics = nowActive
        ? [...selection.topics, topic]
        : selection.topics.filter((entry) => entry !== topic);
      selectedTopics = [...selection.topics];
      fm.canvases = canvases;
    });
    await this.syncCanvasTopicLinks(file, selectedTopics);
    return nowActive;
  }

  async syncCanvasTopicLinks(file: TFile, topics: string[]): Promise<void> {
    if (file.extension !== "canvas") {
      return;
    }
    try {
      const data = JSON.parse(await this.app.vault.cachedRead(file)) as {
        nodes?: Array<Record<string, unknown>>;
        edges?: Array<Record<string, unknown>>;
      };
      const nodes = Array.isArray(data.nodes) ? data.nodes : [];
      const nodeId = "neural-garden-mynotes-topic-links";
      const existingIndex = nodes.findIndex((node) => node.id === nodeId);
      const normalizedTopics = topics
        .map((topic) => topic.trim())
        .filter((topic, index, entries) => topic.length > 0 && entries.indexOf(topic) === index);

      if (normalizedTopics.length === 0) {
        if (existingIndex < 0) {
          return;
        }
        nodes.splice(existingIndex, 1);
      } else {
        const topicNode: Record<string, unknown> = {
          id: nodeId,
          type: "text",
          text: `### Topics\nDo not touch this.\\\n${normalizedTopics.map((topic) => `[[${topic}]]`).join("\n")}`,
          x: -10000,
          y: -10000,
          width: 190,
          height: Math.max(100, 70 + normalizedTopics.length * 28),
        };
        if (existingIndex >= 0) {
          nodes[existingIndex] = { ...(nodes[existingIndex] ?? {}), ...topicNode };
        } else {
          nodes.unshift(topicNode);
        }
      }

      data.nodes = nodes;
      data.edges = Array.isArray(data.edges) ? data.edges : [];
      await this.app.vault.modify(file, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`[Neural Garden] Could not update topic links in canvas ${file.path}`, error);
    }
  }

  async toggleNoteTopic(file: TFile, name: string): Promise<boolean> {
    const topic = name.trim();
    if (!topic) {
      return false;
    }
    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = normalizeLinks(fm.topics);
      if (current.includes(topic)) {
        fm.topics = current.filter((entry) => entry !== topic).map(toLink);
      } else {
        fm.topics = [...current, topic].map(toLink);
        nowActive = true;
      }
    });
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
    return this.notesInCategorySync(name);
  }

  notesInCategoryTopic(category: string, topic: string): TFile[] {
    return this.notesInCategorySync(category).filter((file) => this.getNoteTopics(file).includes(topic));
  }

  entriesInCategory(category: string): TFile[] {
    return this.listEntries().filter((file) => this.getEntryCategory(file) === category);
  }

  entriesInCategoryTopic(category: string, topic: string): TFile[] {
    return this.entriesInCategory(category).filter((file) => this.getEntryTopics(file).includes(topic));
  }

  async listTopicsForCategory(category: string): Promise<string[]> {
    const note = this.app.vault.getAbstractFileByPath(this.categoryPath(category));
    if (!(note instanceof TFile)) {
      return [];
    }
    return normalizeLinks((await this.readFrontmatter(note)).topics);
  }

  async addTopic(categoryName: string, topicName: string, color?: string): Promise<void> {
    const category = categoryName.trim();
    const topic = topicName.trim();
    if (!category || !topic) {
      return;
    }
    const note = await this.ensureCategoryLinkingNote(category);
    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const topics = normalizeLinks(fm.topics);
      if (!topics.includes(topic)) {
        topics.push(topic);
      }
      fm.category = toLink(category);
      fm.topics = topics.map(toLink);
    });
    if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
      await this.setTopicColor(category, topic, color);
    }
  }

  async renameTopic(category: string, previous: string, next: string): Promise<boolean> {
    const note = this.app.vault.getAbstractFileByPath(this.categoryPath(category));
    if (!(note instanceof TFile) || !next.trim()) {
      return false;
    }
    let renamed = false;
    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const topics = normalizeLinks(fm.topics);
      if (!topics.includes(previous) || topics.includes(next)) {
        return;
      }
      fm.topics = topics.map((topic) => toLink(topic === previous ? next : topic));
      renamed = true;
    });
    if (!renamed) {
      return false;
    }
    const index = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(index, (fm) => {
      const colors = this.getTopicColorMap(fm.topicColors);
      const categoryColors = colors[category] ?? {};
      if (categoryColors[previous]) {
        categoryColors[next] = categoryColors[previous];
      }
      delete categoryColors[previous];
      colors[category] = categoryColors;
      fm.topicColors = colors;
      const canvases = this.getCanvasMap(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === category && metadata.topics.includes(previous)) {
          metadata.topics = metadata.topics
            .map((topic) => topic === previous ? next : topic)
            .filter((topic, index, topics) => topics.indexOf(topic) === index);
        }
      }
      fm.canvases = canvases;
    });
    for (const file of this.notesInCategoryTopic(category, previous)) {
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        fm.topics = normalizeLinks(fm.topics).map((topic) => toLink(topic === previous ? next : topic));
      });
    }
    return true;
  }

  async deleteTopic(category: string, topic: string): Promise<boolean> {
    const note = this.app.vault.getAbstractFileByPath(this.categoryPath(category));
    if (!(note instanceof TFile)) {
      return false;
    }
    let removed = false;
    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const topics = normalizeLinks(fm.topics);
      if (!topics.includes(topic)) {
        return;
      }
      fm.topics = topics.filter((entry) => entry !== topic).map(toLink);
      removed = true;
    });
    if (!removed) {
      return false;
    }
    const index = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(index, (fm) => {
      const colors = this.getTopicColorMap(fm.topicColors);
      const categoryColors = colors[category] ?? {};
      delete categoryColors[topic];
      colors[category] = categoryColors;
      fm.topicColors = colors;
      const canvases = this.getCanvasMap(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === category) {
          metadata.topics = metadata.topics.filter((entry) => entry !== topic);
        }
      }
      fm.canvases = canvases;
    });
    for (const file of this.notesInCategoryTopic(category, topic)) {
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        fm.topics = normalizeLinks(fm.topics).filter((entry) => entry !== topic).map(toLink);
      });
    }
    return true;
  }

  getTopicColor(category: string, topic: string): string {
    const file = this.app.vault.getAbstractFileByPath(MY_NOTES_INDEX_FILE_PATH);
    const colors = this.topicColorsLoaded
      ? this.topicColors
      : file instanceof TFile
      ? this.getTopicColorMap(this.app.metadataCache.getFileCache(file)?.frontmatter?.topicColors)
      : {};
    return colors[category]?.[topic] ?? this.fallbackColor(`${category}:${topic}`);
  }

  getMutedTopicColor(category: string, topic: string): string {
    const color = this.getTopicColor(category, topic).replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(color)) {
      return this.getTopicColor(category, topic);
    }
    const red = parseInt(color.slice(0, 2), 16) / 255;
    const green = parseInt(color.slice(2, 4), 16) / 255;
    const blue = parseInt(color.slice(4, 6), 16) / 255;
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const delta = maximum - minimum;
    let hue = 0;
    if (delta > 0) {
      if (maximum === red) {
        hue = 60 * (((green - blue) / delta) % 6);
      } else if (maximum === green) {
        hue = 60 * ((blue - red) / delta + 2);
      } else {
        hue = 60 * ((red - green) / delta + 4);
      }
    }
    if (hue < 0) {
      hue += 360;
    }
    const saturation = maximum === 0 ? 0 : (delta / maximum) * 0.5;
    const brightness = maximum * 0.5;
    const chroma = brightness * saturation;
    const segment = hue / 60;
    const intermediate = chroma * (1 - Math.abs((segment % 2) - 1));
    const offset = brightness - chroma;
    let rgb: [number, number, number];
    if (segment < 1) rgb = [chroma, intermediate, 0];
    else if (segment < 2) rgb = [intermediate, chroma, 0];
    else if (segment < 3) rgb = [0, chroma, intermediate];
    else if (segment < 4) rgb = [0, intermediate, chroma];
    else if (segment < 5) rgb = [intermediate, 0, chroma];
    else rgb = [chroma, 0, intermediate];
    return `#${rgb.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
  }

  private async readFrontmatter(file: TFile): Promise<Record<string, unknown>> {
    const content = await this.app.vault.read(file);
    const yaml = getFrontMatterInfo(content).frontmatter;
    if (!yaml.trim()) {
      return {};
    }
    const parsed = parseYaml(yaml);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  }

  async setTopicColor(category: string, topic: string, color: string): Promise<boolean> {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      return false;
    }
    const file = await this.ensureCategoriesFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const colors = this.getTopicColorMap(fm.topicColors);
      colors[category] = { ...(colors[category] ?? {}), [topic]: color.toLowerCase() };
      fm.topicColors = colors;
      this.topicColors = colors;
      this.topicColorsLoaded = true;
    });
    return true;
  }

  favouriteNotes(): TFile[] {
    return this.listNotes().filter((file) => this.isFavourite(file));
  }

  notesWithSupport(name: string): TFile[] {
    return this.listNotes().filter((file) => this.isSupportNote(file) && this.getNoteSupports(file).includes(name));
  }

  private notesInCategorySync(name: string): TFile[] {
    return this.listNotes().filter((file) => this.getNoteCategory(file) === name);
  }

  private async loadLegacyCategories(): Promise<string[]> {
    const file = this.app.vault.getAbstractFileByPath(MY_NOTES_CATEGORIES_FILE_PATH);
    if (!(file instanceof TFile)) {
      return [];
    }
    return Object.keys(parseCategoriesFromText(await this.app.vault.read(file)));
  }

  private async migrateExistingNotes(): Promise<void> {
    for (const note of this.listNotes()) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const category = normalizeLinks(fm.category)[0];
        if (category) {
          fm.category = toLink(category);
        }
        fm.topics = normalizeLinks(fm.topics).map(toLink);
      });
    }
  }

  private categoryPath(name: string): string {
    return `${MY_NOTES_CATEGORIES_FOLDER}/${this.sanitizeNoteName(name)}.md`;
  }

  private async ensureCategoryLinkingNote(name: string, knownTopics: string[] = []): Promise<TFile> {
    await this.ensureFolderExists(MY_NOTES_CATEGORIES_FOLDER);
    const path = this.categoryPath(name);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      if (knownTopics.length > 0) {
        const frontmatter = await this.readFrontmatter(existing);
        const currentCategory = normalizeLinks(frontmatter.category)[0] ?? null;
        const currentTopics = normalizeLinks(frontmatter.topics);
        const mergedTopics = [...currentTopics, ...knownTopics]
          .filter((topic, index, entries) => entries.indexOf(topic) === index);
        if (currentCategory === name && mergedTopics.length === currentTopics.length) {
          return existing;
        }
        await this.app.fileManager.processFrontMatter(existing, (fm) => {
          fm.category = toLink(name);
          fm.topics = mergedTopics.map(toLink);
        });
      }
      return existing;
    }
    const topicLines = knownTopics.length > 0
      ? `\n${knownTopics.map((topic) => `  - ${JSON.stringify(toLink(topic))}`).join("\n")}`
      : " []";
    return this.app.vault.create(
      path,
      `---\ncategory: ${JSON.stringify(toLink(name))}\ntopics:${topicLines}\n---\n# ${name}\n`,
    );
  }

  private async renameCategoryLinkingNote(previous: string, next: string): Promise<void> {
    const source = this.app.vault.getAbstractFileByPath(this.categoryPath(previous));
    if (!(source instanceof TFile)) {
      await this.ensureCategoryLinkingNote(next);
      return;
    }
    await this.app.vault.rename(source, this.categoryPath(next));
    const renamed = this.app.vault.getAbstractFileByPath(this.categoryPath(next));
    if (renamed instanceof TFile) {
      await this.app.fileManager.processFrontMatter(renamed, (fm) => {
        fm.category = toLink(next);
      });
    }
  }

  private async deleteCategoryLinkingNote(name: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(this.categoryPath(name));
    if (file instanceof TFile) {
      await this.app.vault.trash(file, true);
    }
  }

  private getTopicColorMap(value: unknown): Record<string, Record<string, string>> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, Record<string, string>>;
  }

  private getCanvasMetadata(file: TFile): MyNotesCanvasSelection | null {
    const index = this.app.vault.getAbstractFileByPath(MY_NOTES_INDEX_FILE_PATH);
    if (!(index instanceof TFile)) {
      return null;
    }
    const canvases = this.getCanvasMap(this.app.metadataCache.getFileCache(index)?.frontmatter?.canvases);
    return canvases[file.path] ?? null;
  }

  private getCanvasMap(value: unknown): MyNotesCanvasMap {
    const canvases: MyNotesCanvasMap = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return canvases;
    }
    for (const [path, rawMetadata] of Object.entries(value as Record<string, unknown>)) {
      if (!path.endsWith(".canvas") || !rawMetadata || typeof rawMetadata !== "object" || Array.isArray(rawMetadata)) {
        continue;
      }
      const metadata = rawMetadata as Record<string, unknown>;
      const category = typeof metadata.category === "string" ? metadata.category.trim() : "";
      const legacyTopic = typeof metadata.topic === "string" ? metadata.topic.trim() : "";
      const topics = normalizeLinks(metadata.topics ?? (legacyTopic ? [legacyTopic] : []));
      canvases[path] = { category: category || null, topics };
    }
    return canvases;
  }

  private fallbackColor(seed: string): string {
    const colors = ["#ec9a63", "#54b8a8", "#e06e73", "#6f9fd8", "#d6ad49", "#8f7ac8"];
    let hash = 0;
    for (const char of seed) {
      hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }
    return colors[Math.abs(hash) % colors.length] ?? colors[0];
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
