import { App, TFile } from "obsidian";
import {
  LEARNING_FOLDER,
  MY_LEARNING_CONFIG_FILE_PATH,
  MY_LEARNING_MAINTENANCE_FOLDER,
  NOTES_CATEGORIES_FOLDER,
} from "./constants";

const LEGACY_NOTES_CATEGORIES_FOLDER = "Notes/Categories";
const LEGACY_HELP_TOPIC = "help";
const DAILY_NOTES_CATEGORY = "Daily Notes";
const DAILY_NOTES_TOPIC = "Daily";

export type MyLearningCategoryMap = Record<string, string[]>;
export type MyLearningTopicColorMap = Record<string, Record<string, string>>;
export type MyLearningCanvasMap = Record<string, { category: string; topic: string; progress: number }>;

function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

function normalizeTopicList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed = normalizeTopicEntry(entry);
    if (!trimmed) {
      continue;
    }
    if (!out.includes(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}

function normalizeTopicEntry(value: string): string {
  const trimmed = value.trim();
  const linked = trimmed.match(/^\[\[([^\]]+)\]\]$/);
  if (!linked) {
    return trimmed;
  }
  const inner = linked[1]?.trim() ?? "";
  if (!inner) {
    return "";
  }
  const pipeIndex = inner.indexOf("|");
  return pipeIndex >= 0 ? inner.slice(0, pipeIndex).trim() : inner;
}

function asTopicLinks(topics: string[]): string[] {
  return topics.map((topic) => `[[${topic}]]`);
}

export class MyLearningStorage {
  constructor(private readonly app: App) {}

  async ensureProvisioned(): Promise<void> {
    const configFile = await this.ensureConfigFile();
    await this.ensureFolderExists(LEARNING_FOLDER);
    await this.ensureFolderExists(NOTES_CATEGORIES_FOLDER);
    await this.migrateConfigSchema(configFile);
    for (const file of this.listNotes()) {
      await this.migrateNoteSchema(file);
    }
    await this.migrateCategoryLinkingNotes();
    await this.ensureCanvasTopicLinks();
  }

  async ensureConfigFile(): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (existing instanceof TFile) {
      return existing;
    }
    await this.ensureFolderExists(MY_LEARNING_MAINTENANCE_FOLDER);
    try {
      return await this.app.vault.create(MY_LEARNING_CONFIG_FILE_PATH, "---\ncategories: {}\ntopicColors: {}\ncanvases: {}\n---\n# MyLearning\n");
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create MyLearning config at ${MY_LEARNING_CONFIG_FILE_PATH}`);
    }
  }

  async loadCategoryMap(): Promise<MyLearningCategoryMap> {
    const file = await this.ensureConfigFile();
    const raw = await this.readCategoriesFromFile(file);
    const categoryMap: MyLearningCategoryMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return categoryMap;
    }

    for (const [category, topics] of Object.entries(raw as Record<string, unknown>)) {
      const trimmedCategory = category.trim();
      if (!trimmedCategory) {
        continue;
      }
      const normalized = normalizeTopicList(topics);
      categoryMap[trimmedCategory] = normalized;
    }

    return categoryMap;
  }

  async listCategories(): Promise<string[]> {
    return Object.keys(await this.loadCategoryMap()).sort((a, b) => a.localeCompare(b));
  }

  async addCategory(name: string): Promise<void> {
    const category = this.sanitizeName(name);
    if (!category) {
      return;
    }
    const file = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      if (!(category in categories)) {
        categories[category] = [];
      }
      fm.categories = categories;
    });

    await this.ensureCategoryLinkingNote(category);
  }

  async addTopic(categoryName: string, topicName: string, color?: string): Promise<void> {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!category || !topic) {
      return;
    }
    const normalizedColor = this.sanitizeColor(color);
    const file = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = categories[category] ?? [];
      if (!topics.includes(topic)) {
        categories[category] = [...topics, topic];
      }
      fm.categories = categories;

      if (normalizedColor) {
        const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
        const categoryTopicColors = topicColors[category] ?? {};
        categoryTopicColors[topic] = normalizedColor;
        topicColors[category] = categoryTopicColors;
        fm.topicColors = topicColors;
      }
    });

    await this.ensureCategoryLinkingNote(category, topic);
  }

  async renameCategory(previousName: string, nextName: string): Promise<boolean> {
    const previous = this.sanitizeName(previousName);
    const next = this.sanitizeName(nextName);
    if (!previous || !next || previous === next) {
      return false;
    }

    let renamed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      if (!(previous in categories) || (next in categories)) {
        return;
      }
      categories[next] = categories[previous] ?? [];
      delete categories[previous];
      fm.categories = categories;

      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      if (previous in topicColors) {
        topicColors[next] = topicColors[previous] ?? {};
        delete topicColors[previous];
      }
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
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

    const notes = this.notesInCategory(previous);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        if (this.normalizeCategoryScalar(fm.category) === previous) {
          fm.category = this.toFrontmatterScalar(next);
        }
      });
    }

    return true;
  }

  async deleteCategory(categoryName: string): Promise<boolean> {
    const category = this.sanitizeName(categoryName);
    if (!category) {
      return false;
    }

    let removed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      if (!(category in categories)) {
        return;
      }
      delete categories[category];
      fm.categories = categories;

      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      if (category in topicColors) {
        delete topicColors[category];
      }
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const [path, metadata] of Object.entries(canvases)) {
        if (metadata.category === category) {
          delete canvases[path];
        }
      }
      fm.canvases = canvases;
      removed = true;
    });

    if (!removed) {
      return false;
    }

    await this.deleteCategoryLinkingNote(category);

    const notes = this.notesInCategory(category);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        if (this.normalizeCategoryScalar(fm.category) === category) {
          delete fm.category;
        }
      });
    }

    return true;
  }

  async renameTopic(categoryName: string, previousName: string, nextName: string): Promise<boolean> {
    const category = this.sanitizeName(categoryName);
    const previous = this.sanitizeName(previousName);
    const next = this.sanitizeName(nextName);
    if (!category || !previous || !next || previous === next) {
      return false;
    }

    let renamed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = categories[category] ?? [];
      if (!topics.includes(previous) || topics.includes(next)) {
        return;
      }
      categories[category] = topics.map((entry) => (entry === previous ? next : entry));
      fm.categories = categories;

      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      const categoryTopicColors = topicColors[category] ?? {};
      const previousColor = categoryTopicColors[previous];
      if (previousColor) {
        categoryTopicColors[next] = previousColor;
      }
      delete categoryTopicColors[previous];
      topicColors[category] = categoryTopicColors;
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const metadata of Object.values(canvases)) {
        if (metadata.category === category && metadata.topic === previous) {
          metadata.topic = next;
        }
      }
      fm.canvases = canvases;
      renamed = true;
    });

    if (!renamed) {
      return false;
    }

    await this.renameTopicInCategoryLinkingNote(category, previous, next);

    const notes = this.notesInCategory(category);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = normalizeTopicList(fm.topics);
        if (!current.includes(previous)) {
          return;
        }
        const updated = current
          .map((entry) => (entry === previous ? next : entry))
          .filter((entry, index, arr) => arr.indexOf(entry) === index);
        if (updated.length === 0) {
          delete fm.topics;
        } else {
          fm.topics = asTopicLinks(updated);
        }
      });
    }

    return true;
  }

  async deleteTopic(categoryName: string, topicName: string): Promise<boolean> {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!category || !topic) {
      return false;
    }

    let removed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = categories[category] ?? [];
      if (!topics.includes(topic)) {
        return;
      }
      categories[category] = topics.filter((entry) => entry !== topic);
      fm.categories = categories;

      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      const categoryTopicColors = topicColors[category] ?? {};
      delete categoryTopicColors[topic];
      topicColors[category] = categoryTopicColors;
      fm.topicColors = topicColors;
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      for (const [path, metadata] of Object.entries(canvases)) {
        if (metadata.category === category && metadata.topic === topic) {
          delete canvases[path];
        }
      }
      fm.canvases = canvases;
      removed = true;
    });

    if (!removed) {
      return false;
    }

    await this.deleteTopicFromCategoryLinkingNote(category, topic);

    const notes = this.notesInCategory(category);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = normalizeTopicList(fm.topics);
        if (!current.includes(topic)) {
          return;
        }
        const updated = current.filter((entry) => entry !== topic);
        if (updated.length === 0) {
          delete fm.topics;
        } else {
          fm.topics = asTopicLinks(updated);
        }
      });
    }

    return true;
  }

  async setTopicColor(categoryName: string, topicName: string, color: string): Promise<boolean> {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    const normalizedColor = this.sanitizeColor(color);
    if (!category || !topic || !normalizedColor) {
      return false;
    }

    let updated = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      const topics = categories[category] ?? [];
      if (!topics.includes(topic)) {
        return;
      }

      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      const categoryTopicColors = topicColors[category] ?? {};
      categoryTopicColors[topic] = normalizedColor;
      topicColors[category] = categoryTopicColors;
      fm.topicColors = topicColors;
      updated = true;
    });

    return updated;
  }

  async listTopicsForCategory(categoryName: string): Promise<string[]> {
    const categoryMap = await this.loadCategoryMap();
    return categoryMap[categoryName] ?? [];
  }

  getTopicColor(categoryName: string, topicName: string): string {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!topic) {
      return this.fallbackColor(`${category}:${topic}`);
    }
    const colors = this.getTopicColorMapFromFrontmatter(
      this.app.metadataCache.getFileCache(this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH) as TFile | null)?.frontmatter?.topicColors,
    );
    const savedColor = colors[category]?.[topic];
    if (isValidHexColor(savedColor)) {
      return savedColor.trim().toLowerCase();
    }

    return this.fallbackColor(`${category}:${topic}`);
  }

  listNotes(): TFile[] {
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => (
        file.path.startsWith(`${LEARNING_FOLDER}/`)
        && !file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`)
      ))
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  listEntries(): TFile[] {
    return this.app.vault
      .getFiles()
      .filter((file) => (
        file.path.startsWith(`${LEARNING_FOLDER}/`)
        && !file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`)
        && (file.extension === "md" || file.extension === "canvas")
      ))
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  isLearningNoteFile(file: TFile | null): boolean {
    return !!file
      && file.extension === "md"
      && file.path.startsWith(`${LEARNING_FOLDER}/`)
      && !file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`);
  }

  noteExists(name: string): boolean {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return false;
    }
    return ["md", "canvas"].some((extension) => (
      this.app.vault.getAbstractFileByPath(`${LEARNING_FOLDER}/${trimmed}.${extension}`) instanceof TFile
    ));
  }

  async createNote(name: string, category?: string | null, topics?: string[]): Promise<TFile | null> {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return null;
    }
    const path = `${LEARNING_FOLDER}/${trimmed}.md`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      return existing;
    }

    await this.ensureProvisioned();
    const file = await this.app.vault.create(path, "");

    if (category || (topics && topics.length > 0)) {
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        if (category) {
          fm.category = this.toFrontmatterScalar(category);
        }
        if (topics && topics.length > 0) {
          const normalized = normalizeTopicList(topics);
          fm.topics = asTopicLinks(normalized);
        }
      });
    }

    return file;
  }

  async createDailyNote(dateKey: string): Promise<TFile | null> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return null;
    }

    const name = `Daily Note ${dateKey}`;
    const existing = this.app.vault.getAbstractFileByPath(`${LEARNING_FOLDER}/${name}.md`);
    if (existing instanceof TFile) {
      return existing;
    }

    await this.addCategory(DAILY_NOTES_CATEGORY);
    await this.addTopic(DAILY_NOTES_CATEGORY, DAILY_NOTES_TOPIC);
    const file = await this.createNote(name, DAILY_NOTES_CATEGORY, [DAILY_NOTES_TOPIC]);
    if (!file) {
      return null;
    }

    await this.setComprehension(file, 0);
    return file;
  }

  async createCanvas(name: string, category?: string | null, topic?: string | null): Promise<TFile | null> {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return null;
    }
    const path = `${LEARNING_FOLDER}/${trimmed}.canvas`;
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      return existing;
    }

    await this.ensureProvisioned();
    const sanitizedTopic = topic ? this.sanitizeName(topic) : "";
    const nodes = sanitizedTopic
      ? [this.buildCanvasTopicNode(sanitizedTopic)]
      : [];
    const file = await this.app.vault.create(path, JSON.stringify({ nodes, edges: [] }, null, 2));
    if (category && topic) {
      const configFile = await this.ensureConfigFile();
      await this.app.fileManager.processFrontMatter(configFile, (fm) => {
        const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
        canvases[file.path] = { category: this.sanitizeName(category), topic: this.sanitizeName(topic), progress: 0 };
        fm.canvases = canvases;
      });
    }
    return file;
  }

  async deleteNote(file: TFile): Promise<void> {
    if (file.extension === "canvas") {
      const configFile = await this.ensureConfigFile();
      await this.app.fileManager.processFrontMatter(configFile, (fm) => {
        const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
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
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      const metadata = canvases[oldPath];
      if (!metadata) {
        return;
      }
      delete canvases[oldPath];
      canvases[file.path] = metadata;
      fm.canvases = canvases;
    });
  }

  getEntryCategory(file: TFile): string | null {
    if (file.extension === "canvas") {
      return this.getCanvasMetadata(file)?.category ?? null;
    }
    return this.getNoteCategory(file);
  }

  getCanvasSelection(file: TFile): { category: string; topic: string; progress: number } | null {
    return file.extension === "canvas" ? this.getCanvasMetadata(file) : null;
  }

  getEntryTopics(file: TFile): string[] {
    if (file.extension === "canvas") {
      const topic = this.getCanvasMetadata(file)?.topic;
      return topic ? [topic] : [];
    }
    return this.getNoteTopics(file);
  }

  getEntryComprehension(file: TFile): number {
    return file.extension === "canvas" ? this.getCanvasMetadata(file)?.progress ?? 0 : this.getComprehension(file);
  }

  async setCanvasProgress(file: TFile, value: number): Promise<void> {
    if (file.extension !== "canvas") {
      return;
    }
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
      const metadata = canvases[file.path];
      if (!metadata) {
        return;
      }
      metadata.progress = this.clampComprehension(value);
      fm.canvases = canvases;
    });
  }

  entriesInCategory(category: string): TFile[] {
    return this.listEntries().filter((file) => this.getEntryCategory(file) === category);
  }

  entriesInCategoryTopic(category: string, topic: string): TFile[] {
    return this.entriesInCategory(category).filter((file) => this.getEntryTopics(file).includes(topic));
  }

  getNoteCategory(file: TFile): string | null {
    const category = this.app.metadataCache.getFileCache(file)?.frontmatter?.category;
    if (typeof category === "number" && Number.isFinite(category)) {
      return String(category);
    }
    return typeof category === "string" && category.trim().length > 0 ? category.trim() : null;
  }

  async setNoteCategory(file: TFile, category: string): Promise<void> {
    const trimmed = this.sanitizeName(category);
    if (!trimmed) {
      return;
    }
    await this.addCategory(trimmed);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.category = this.toFrontmatterScalar(trimmed);
    });
  }

  getNoteTopics(file: TFile): string[] {
    return normalizeTopicList(this.app.metadataCache.getFileCache(file)?.frontmatter?.topics);
  }

  async toggleNoteTopic(file: TFile, topic: string): Promise<boolean> {
    const target = this.sanitizeName(topic);
    if (!target) {
      return false;
    }

    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = normalizeTopicList(fm.topics);
      if (current.includes(target)) {
        fm.topics = asTopicLinks(current.filter((entry) => entry !== target));
        nowActive = false;
      } else {
        fm.topics = asTopicLinks([...current, target]);
        nowActive = true;
      }
    });

    return nowActive;
  }

  getComprehension(file: TFile): number {
    const raw = this.app.metadataCache.getFileCache(file)?.frontmatter?.comprehension;
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return 0;
    }
    return this.clampComprehension(raw);
  }

  async setComprehension(file: TFile, value: number): Promise<void> {
    const next = this.clampComprehension(value);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.comprehension = next;
    });
  }

  notesInCategory(category: string): TFile[] {
    return this.listNotes().filter((file) => this.getNoteCategory(file) === category);
  }

  notesInCategoryTopic(category: string, topic: string): TFile[] {
    return this.notesInCategory(category).filter((file) => this.getNoteTopics(file).includes(topic));
  }

  private async ensureCategoryLinkingNote(categoryName: string, topicName?: string): Promise<TFile | null> {
    const category = this.sanitizeName(categoryName);
    const topic = topicName ? this.sanitizeName(topicName) : "";
    if (!category) {
      return null;
    }

    await this.ensureFolderExists(NOTES_CATEGORIES_FOLDER);
    const path = this.buildCategoryLinkingNotePath(category);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await this.app.fileManager.processFrontMatter(existing, (fm) => {
        fm.category = this.toFrontmatterScalar(category);
        const current = normalizeTopicList(fm.topics);
        const next = topic && !current.includes(topic) ? [...current, topic] : current;
        fm.topics = asTopicLinks(next);
      });
      return existing;
    }

    const categoryValue = this.toFrontmatterScalar(category);
    const categoryYaml = typeof categoryValue === "number" ? String(categoryValue) : JSON.stringify(categoryValue);
    const topicsYaml = topic ? `\n  - [[${topic}]]` : " []";
    const noteBody = `---\ncategory: ${categoryYaml}\ntopics:${topicsYaml}\n---\n\n# ${category}\n`;
    return this.app.vault.create(path, noteBody);
  }

  private buildCategoryLinkingNotePath(categoryName: string): string {
    const category = this.sanitizeNoteName(categoryName);
    return `${NOTES_CATEGORIES_FOLDER}/${category}.md`;
  }

  private async renameTopicInCategoryLinkingNote(categoryName: string, previousTopic: string, nextTopic: string): Promise<void> {
    const category = this.sanitizeName(categoryName);
    const previous = this.sanitizeName(previousTopic);
    const next = this.sanitizeName(nextTopic);
    if (!category || !previous || !next || previous === next) {
      return;
    }

    const path = this.buildCategoryLinkingNotePath(category);
    const note = this.app.vault.getAbstractFileByPath(path);
    if (!(note instanceof TFile)) {
      return;
    }

    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const current = normalizeTopicList(fm.topics);
      if (!current.includes(previous)) {
        return;
      }
      const updated = current
        .map((entry) => (entry === previous ? next : entry))
        .filter((entry, index, arr) => arr.indexOf(entry) === index);
      fm.topics = asTopicLinks(updated);
    });
  }

  private async renameCategoryLinkingNote(previousCategory: string, nextCategory: string): Promise<void> {
    const previous = this.sanitizeName(previousCategory);
    const next = this.sanitizeName(nextCategory);
    if (!previous || !next || previous === next) {
      return;
    }

    const sourcePath = this.buildCategoryLinkingNotePath(previous);
    const source = this.app.vault.getAbstractFileByPath(sourcePath);
    if (!(source instanceof TFile)) {
      return;
    }

    const targetPath = this.buildCategoryLinkingNotePath(next);
    const target = this.app.vault.getAbstractFileByPath(targetPath);
    if (target instanceof TFile && target.path !== source.path) {
      await this.app.vault.delete(target);
    }

    await this.app.vault.rename(source, targetPath);

    const renamed = this.app.vault.getAbstractFileByPath(targetPath);
    if (!(renamed instanceof TFile)) {
      return;
    }

    const content = await this.app.vault.cachedRead(renamed);
    const updatedContent = content.replace(/^# .*$/m, `# ${next}`);
    if (updatedContent !== content) {
      await this.app.vault.modify(renamed, updatedContent);
    }

    await this.app.fileManager.processFrontMatter(renamed, (fm) => {
      fm.category = this.toFrontmatterScalar(next);
      const topics = normalizeTopicList(fm.topics);
      fm.topics = asTopicLinks(topics);
    });
  }

  private async deleteTopicFromCategoryLinkingNote(categoryName: string, topicName: string): Promise<void> {
    const category = this.sanitizeName(categoryName);
    const topic = this.sanitizeName(topicName);
    if (!category || !topic) {
      return;
    }

    const path = this.buildCategoryLinkingNotePath(category);
    const note = this.app.vault.getAbstractFileByPath(path);
    if (!(note instanceof TFile)) {
      return;
    }

    let shouldDelete = false;
    await this.app.fileManager.processFrontMatter(note, (fm) => {
      const current = normalizeTopicList(fm.topics);
      const updated = current.filter((entry) => entry !== topic);
      if (updated.length === 0) {
        shouldDelete = true;
        delete fm.topics;
        fm.category = this.toFrontmatterScalar(category);
      } else {
        fm.topics = asTopicLinks(updated);
      }
    });

    if (shouldDelete) {
      await this.app.vault.trash(note, true);
    }
  }

  private async deleteCategoryLinkingNote(categoryName: string): Promise<void> {
    const category = this.sanitizeName(categoryName);
    if (!category) {
      return;
    }

    const path = this.buildCategoryLinkingNotePath(category);
    const note = this.app.vault.getAbstractFileByPath(path);
    if (note instanceof TFile) {
      await this.app.vault.trash(note, true);
    }
  }

  private listCategoryLinkingNotes(): TFile[] {
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(`${NOTES_CATEGORIES_FOLDER}/`) || file.path.startsWith(`${LEGACY_NOTES_CATEGORIES_FOLDER}/`))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  private async migrateCategoryLinkingNotes(): Promise<void> {
    const notes = this.listCategoryLinkingNotes();
    for (const note of notes) {
      const frontmatter = this.app.metadataCache.getFileCache(note)?.frontmatter;
      const separatorIndex = note.basename.indexOf("--");
      const legacyCategory = separatorIndex >= 0 ? note.basename.slice(0, separatorIndex).trim() : note.basename;
      const legacyTopic = separatorIndex >= 0 ? note.basename.slice(separatorIndex + 2).trim() : "";
      const category = typeof frontmatter?.category === "number"
        ? String(frontmatter.category)
        : typeof frontmatter?.category === "string"
          ? frontmatter.category.trim()
        : typeof frontmatter?.topic === "string"
          ? frontmatter.topic.trim()
          : legacyCategory;
      if (!category) {
        continue;
      }

      const existingTopics = normalizeTopicList(frontmatter?.topics);
      const legacyTopics = normalizeTopicList(frontmatter?.categories);
      const topics = [...existingTopics, ...legacyTopics, legacyTopic]
        .filter((topic, index, values) => topic && topic !== LEGACY_HELP_TOPIC && values.indexOf(topic) === index);
      const targetPath = this.buildCategoryLinkingNotePath(category);
      const target = this.app.vault.getAbstractFileByPath(targetPath);

      if (target instanceof TFile && target.path !== note.path) {
        await this.app.fileManager.processFrontMatter(target, (fm) => {
          const merged = [...normalizeTopicList(fm.topics), ...topics]
            .filter((topic, index, values) => topic && topic !== LEGACY_HELP_TOPIC && values.indexOf(topic) === index);
          fm.category = this.toFrontmatterScalar(category);
          fm.topics = asTopicLinks(merged);
          delete fm.topic;
          if (Array.isArray(fm.categories)) {
            delete fm.categories;
          }
        });
        await this.app.vault.trash(note, true);
        continue;
      }

      if (note.path !== targetPath) {
        await this.app.vault.rename(note, targetPath);
      }
      const migrated = this.app.vault.getAbstractFileByPath(targetPath);
      if (!(migrated instanceof TFile)) {
        continue;
      }
      await this.app.fileManager.processFrontMatter(migrated, (fm) => {
        fm.category = this.toFrontmatterScalar(category);
        fm.topics = asTopicLinks(topics);
        delete fm.topic;
        if (Array.isArray(fm.categories)) {
          delete fm.categories;
        }
      });
      const content = await this.app.vault.cachedRead(migrated);
      const updatedContent = content.replace(/^# .*$/m, `# ${category}`);
      if (updatedContent !== content) {
        await this.app.vault.modify(migrated, updatedContent);
      }
    }
  }

  private sanitizeNoteName(name: string): string {
    return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  }

  private sanitizeName(name: string): string {
    return name.trim();
  }

  private toFrontmatterScalar(value: string): string | number {
    return /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) ? Number(value) : value;
  }

  private normalizeCategoryScalar(value: unknown): string | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return null;
  }

  private sanitizeColor(value: string | undefined): string | null {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    return isValidHexColor(trimmed) ? trimmed.toLowerCase() : null;
  }

  private clampComprehension(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private fallbackColor(value: string): string {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 74% 58%)`;
  }

  private getCategoryMapFromFrontmatter(raw: unknown): MyLearningCategoryMap {
    const map: MyLearningCategoryMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }

    for (const [category, topics] of Object.entries(raw as Record<string, unknown>)) {
      const trimmedCategory = this.sanitizeName(category);
      if (!trimmedCategory) {
        continue;
      }
      map[trimmedCategory] = normalizeTopicList(topics);
    }

    return map;
  }

  private getTopicColorMapFromFrontmatter(raw: unknown): MyLearningTopicColorMap {
    const map: MyLearningTopicColorMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }

    for (const [category, topics] of Object.entries(raw as Record<string, unknown>)) {
      const trimmedCategory = this.sanitizeName(category);
      if (!trimmedCategory || !topics || typeof topics !== "object" || Array.isArray(topics)) {
        continue;
      }

      const categoryTopicColors: Record<string, string> = {};
      for (const [topic, color] of Object.entries(topics as Record<string, unknown>)) {
        const trimmedTopic = this.sanitizeName(topic);
        if (!trimmedTopic || !isValidHexColor(color)) {
          continue;
        }
        categoryTopicColors[trimmedTopic] = color.trim().toLowerCase();
      }

      if (Object.keys(categoryTopicColors).length > 0) {
        map[trimmedCategory] = categoryTopicColors;
      }
    }

    return map;
  }

  private getCanvasMetadata(file: TFile): { category: string; topic: string; progress: number } | null {
    const configFile = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (!(configFile instanceof TFile)) {
      return null;
    }
    const canvases = this.getCanvasMapFromFrontmatter(
      this.app.metadataCache.getFileCache(configFile)?.frontmatter?.canvases,
    );
    return canvases[file.path] ?? null;
  }

  private buildCanvasTopicNode(topic: string): Record<string, unknown> {
    return {
      id: "neural-garden-topic-link",
      type: "text",
      text: `### Topic\nDo not touch this.\\\n[[${topic}]]`,
      x: -10000,
      y: -10000,
      width: 170,
      height: 100,
    };
  }

  private async ensureCanvasTopicLinks(): Promise<void> {
    const configFile = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (!(configFile instanceof TFile)) {
      return;
    }
    const canvases = this.getCanvasMapFromFrontmatter(
      this.app.metadataCache.getFileCache(configFile)?.frontmatter?.canvases,
    );
    for (const [path, metadata] of Object.entries(canvases)) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!(file instanceof TFile) || file.extension !== "canvas") {
        continue;
      }
      try {
        const data = JSON.parse(await this.app.vault.cachedRead(file)) as {
          nodes?: Array<Record<string, unknown>>;
          edges?: Array<Record<string, unknown>>;
        };
        const nodes = Array.isArray(data.nodes) ? data.nodes : [];
        const topicNode = this.buildCanvasTopicNode(metadata.topic);
        const existingIndex = nodes.findIndex((node) => node.id === "neural-garden-topic-link");
        let changed = false;
        if (existingIndex >= 0) {
          const existingNode = nodes[existingIndex] ?? {};
          if (
            existingNode.text !== topicNode.text
            || existingNode.type !== topicNode.type
            || existingNode.x !== topicNode.x
            || existingNode.y !== topicNode.y
            || existingNode.width !== topicNode.width
            || existingNode.height !== topicNode.height
          ) {
            nodes[existingIndex] = { ...existingNode, ...topicNode };
            changed = true;
          }
        } else {
          nodes.unshift(topicNode);
          changed = true;
        }
        if (!changed) {
          continue;
        }
        data.nodes = nodes;
        data.edges = Array.isArray(data.edges) ? data.edges : [];
        await this.app.vault.modify(file, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error(`[Neural Garden] Could not add topic link to canvas ${path}`, error);
      }
    }
  }

  private getCanvasMapFromFrontmatter(raw: unknown): MyLearningCanvasMap {
    const map: MyLearningCanvasMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }
    for (const [path, value] of Object.entries(raw as Record<string, unknown>)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }
      const metadata = value as Record<string, unknown>;
      const category = typeof metadata.category === "string" ? this.sanitizeName(metadata.category) : "";
      const topic = typeof metadata.topic === "string" ? this.sanitizeName(metadata.topic) : "";
      if (path.endsWith(".canvas") && category && topic) {
        map[path] = {
          category,
          topic,
          progress: this.clampComprehension(typeof metadata.progress === "number" ? metadata.progress : 0),
        };
      }
    }
    return map;
  }

  private async readCategoriesFromFile(file: TFile): Promise<unknown> {
    const content = await this.app.vault.cachedRead(file);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return {};
    }

    const parsed = this.parseCategoriesFrontmatter(match[1]);
    if (parsed) {
      return parsed;
    }
    return this.app.metadataCache.getFileCache(file)?.frontmatter?.categories ?? {};
  }

  private parseCategoriesFrontmatter(frontmatterText: string): Record<string, string[]> | null {
    const lines = frontmatterText.split(/\r?\n/);
    const categoriesIndex = lines.findIndex((line) => /^categories:\s*/.test(line));
    if (categoriesIndex < 0) {
      return null;
    }

    const firstLine = lines[categoriesIndex]?.trim() ?? "";
    if (firstLine === "categories: {}") {
      return {};
    }

    const map: Record<string, string[]> = {};
    let currentCategory: string | null = null;

    for (let i = categoriesIndex + 1; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      if (!line.trim()) {
        continue;
      }
      if (!line.startsWith("  ")) {
        break;
      }

      const categoryMatch = line.match(/^  ([^:#][^:]*)\s*:\s*(.*)$/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1]?.trim() ?? null;
        if (!currentCategory) {
          continue;
        }
        if (!(currentCategory in map)) {
          map[currentCategory] = [];
        }

        const inlineValue = categoryMatch[2]?.trim() ?? "";
        if (inlineValue === "[]") {
          continue;
        }
        if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
          const values = inlineValue
            .slice(1, -1)
            .split(",")
            .map((entry) => entry.trim().replace(/^['\"]|['\"]$/g, ""))
            .filter(Boolean);
          map[currentCategory] = values;
        }
        continue;
      }

      const topicMatch = line.match(/^    -\s+(.+)$/);
      if (topicMatch && currentCategory) {
        const topic = topicMatch[1]?.trim().replace(/^['\"]|['\"]$/g, "");
        if (topic && !map[currentCategory]?.includes(topic)) {
          map[currentCategory]?.push(topic);
        }
      }
    }

    return map;
  }

  private async migrateConfigSchema(file: TFile): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!fm.categories && fm.topics && typeof fm.topics === "object" && !Array.isArray(fm.topics)) {
        fm.categories = fm.topics;
      }
      if (!fm.topicColors && fm.categoryColors && typeof fm.categoryColors === "object") {
        fm.topicColors = fm.categoryColors;
      }
      delete fm.categoryColors;
      delete fm.topics;
      const categories = this.getCategoryMapFromFrontmatter(fm.categories);
      for (const category of Object.keys(categories)) {
        categories[category] = categories[category].filter((topic) => topic !== LEGACY_HELP_TOPIC);
      }
      const topicColors = this.getTopicColorMapFromFrontmatter(fm.topicColors);
      for (const colors of Object.values(topicColors)) {
        delete colors[LEGACY_HELP_TOPIC];
      }
      fm.categories = categories;
      fm.topicColors = topicColors;
      fm.canvases = this.getCanvasMapFromFrontmatter(fm.canvases);
    });
  }

  private async migrateNoteSchema(file: TFile): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (!fm.category && typeof fm.topic === "string") {
        fm.category = this.toFrontmatterScalar(fm.topic);
      } else {
        const category = this.normalizeCategoryScalar(fm.category);
        if (category) {
          fm.category = this.toFrontmatterScalar(category);
        }
      }
      if (!fm.topics && Array.isArray(fm.categories)) {
        fm.topics = asTopicLinks(normalizeTopicList(fm.categories));
      }
      if (Array.isArray(fm.topics)) {
        fm.topics = asTopicLinks(normalizeTopicList(fm.topics).filter((topic) => topic !== LEGACY_HELP_TOPIC));
      }
      delete fm.help;
      delete fm.topic;
      if (Array.isArray(fm.categories)) {
        delete fm.categories;
      }
    });
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
