import { App, TFile } from "obsidian";
import {
  LEARNING_FOLDER,
  MY_LEARNING_CONFIG_FILE_PATH,
  MY_LEARNING_MAINTENANCE_FOLDER,
} from "./constants";

const HELP_CATEGORY = "help";

export type MyLearningTopicMap = Record<string, string[]>;
export type MyLearningCategoryColorMap = Record<string, Record<string, string>>;

function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

function normalizeCategoryList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed = normalizeCategoryEntry(entry);
    if (!trimmed) {
      continue;
    }
    if (!out.includes(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}

function normalizeCategoryEntry(value: string): string {
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

function asCategoryLinks(categories: string[]): string[] {
  return categories.map((category) => `[[${category}]]`);
}

export class MyLearningStorage {
  constructor(private readonly app: App) {}

  async ensureProvisioned(): Promise<void> {
    await this.ensureConfigFile();
    await this.ensureFolderExists(LEARNING_FOLDER);
  }

  async ensureConfigFile(): Promise<TFile> {
    const existing = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
    if (existing instanceof TFile) {
      return existing;
    }
    await this.ensureFolderExists(MY_LEARNING_MAINTENANCE_FOLDER);
    try {
      return await this.app.vault.create(MY_LEARNING_CONFIG_FILE_PATH, "---\ntopics: {}\ncategoryColors: {}\n---\n# MyLearning\n");
    } catch {
      const createdByOtherCall = this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH);
      if (createdByOtherCall instanceof TFile) {
        return createdByOtherCall;
      }
      throw new Error(`Failed to create MyLearning config at ${MY_LEARNING_CONFIG_FILE_PATH}`);
    }
  }

  async loadTopicMap(): Promise<MyLearningTopicMap> {
    const file = await this.ensureConfigFile();
    const raw = await this.readTopicsFromFile(file);
    const topicMap: MyLearningTopicMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return topicMap;
    }

    for (const [topic, categories] of Object.entries(raw as Record<string, unknown>)) {
      const trimmedTopic = topic.trim();
      if (!trimmedTopic) {
        continue;
      }
      const normalized = normalizeCategoryList(categories).filter((name) => name !== HELP_CATEGORY);
      topicMap[trimmedTopic] = normalized;
    }

    return topicMap;
  }

  async listTopics(): Promise<string[]> {
    return Object.keys(await this.loadTopicMap()).sort((a, b) => a.localeCompare(b));
  }

  async addTopic(name: string): Promise<void> {
    const topic = this.sanitizeName(name);
    if (!topic) {
      return;
    }
    const file = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      if (!(topic in topics)) {
        topics[topic] = [];
      }
      fm.topics = topics;
    });
  }

  async addCategory(topicName: string, categoryName: string, color?: string): Promise<void> {
    const topic = this.sanitizeName(topicName);
    const category = this.sanitizeName(categoryName);
    if (!topic || !category || category === HELP_CATEGORY) {
      return;
    }
    const normalizedColor = this.sanitizeColor(color);
    const file = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      const categories = topics[topic] ?? [];
      if (!categories.includes(category)) {
        topics[topic] = [...categories, category];
      }
      fm.topics = topics;

      if (normalizedColor) {
        const categoryColors = this.getCategoryColorMapFromFrontmatter(fm.categoryColors);
        const topicColors = categoryColors[topic] ?? {};
        topicColors[category] = normalizedColor;
        categoryColors[topic] = topicColors;
        fm.categoryColors = categoryColors;
      }
    });
  }

  async renameTopic(previousName: string, nextName: string): Promise<boolean> {
    const previous = this.sanitizeName(previousName);
    const next = this.sanitizeName(nextName);
    if (!previous || !next || previous === next) {
      return false;
    }

    let renamed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      if (!(previous in topics) || (next in topics)) {
        return;
      }
      topics[next] = topics[previous] ?? [];
      delete topics[previous];
      fm.topics = topics;

      const categoryColors = this.getCategoryColorMapFromFrontmatter(fm.categoryColors);
      if (previous in categoryColors) {
        categoryColors[next] = categoryColors[previous] ?? {};
        delete categoryColors[previous];
      }
      fm.categoryColors = categoryColors;
      renamed = true;
    });

    if (!renamed) {
      return false;
    }

    const notes = this.notesInTopic(previous);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        if (typeof fm.topic === "string" && this.sanitizeName(fm.topic) === previous) {
          fm.topic = next;
        }
      });
    }

    return true;
  }

  async deleteTopic(topicName: string): Promise<boolean> {
    const topic = this.sanitizeName(topicName);
    if (!topic) {
      return false;
    }

    let removed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      if (!(topic in topics)) {
        return;
      }
      delete topics[topic];
      fm.topics = topics;

      const categoryColors = this.getCategoryColorMapFromFrontmatter(fm.categoryColors);
      if (topic in categoryColors) {
        delete categoryColors[topic];
      }
      fm.categoryColors = categoryColors;
      removed = true;
    });

    if (!removed) {
      return false;
    }

    const notes = this.notesInTopic(topic);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        if (typeof fm.topic === "string" && this.sanitizeName(fm.topic) === topic) {
          delete fm.topic;
        }
      });
    }

    return true;
  }

  async renameCategory(topicName: string, previousName: string, nextName: string): Promise<boolean> {
    const topic = this.sanitizeName(topicName);
    const previous = this.sanitizeName(previousName);
    const next = this.sanitizeName(nextName);
    if (!topic || !previous || !next || previous === next || previous === HELP_CATEGORY || next === HELP_CATEGORY) {
      return false;
    }

    let renamed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      const categories = topics[topic] ?? [];
      if (!categories.includes(previous) || categories.includes(next)) {
        return;
      }
      topics[topic] = categories.map((entry) => (entry === previous ? next : entry));
      fm.topics = topics;

      const categoryColors = this.getCategoryColorMapFromFrontmatter(fm.categoryColors);
      const topicColors = categoryColors[topic] ?? {};
      const previousColor = topicColors[previous];
      if (previousColor) {
        topicColors[next] = previousColor;
      }
      delete topicColors[previous];
      categoryColors[topic] = topicColors;
      fm.categoryColors = categoryColors;
      renamed = true;
    });

    if (!renamed) {
      return false;
    }

    const notes = this.notesInTopic(topic);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = normalizeCategoryList(fm.categories).filter((entry) => entry !== HELP_CATEGORY);
        if (!current.includes(previous)) {
          return;
        }
        const updated = current
          .map((entry) => (entry === previous ? next : entry))
          .filter((entry, index, arr) => arr.indexOf(entry) === index);
        if (updated.length === 0) {
          delete fm.categories;
        } else {
          fm.categories = asCategoryLinks(updated);
        }
      });
    }

    return true;
  }

  async deleteCategory(topicName: string, categoryName: string): Promise<boolean> {
    const topic = this.sanitizeName(topicName);
    const category = this.sanitizeName(categoryName);
    if (!topic || !category || category === HELP_CATEGORY) {
      return false;
    }

    let removed = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      const categories = topics[topic] ?? [];
      if (!categories.includes(category)) {
        return;
      }
      topics[topic] = categories.filter((entry) => entry !== category);
      fm.topics = topics;

      const categoryColors = this.getCategoryColorMapFromFrontmatter(fm.categoryColors);
      const topicColors = categoryColors[topic] ?? {};
      delete topicColors[category];
      categoryColors[topic] = topicColors;
      fm.categoryColors = categoryColors;
      removed = true;
    });

    if (!removed) {
      return false;
    }

    const notes = this.notesInTopic(topic);
    for (const note of notes) {
      await this.app.fileManager.processFrontMatter(note, (fm) => {
        const current = normalizeCategoryList(fm.categories).filter((entry) => entry !== HELP_CATEGORY);
        if (!current.includes(category)) {
          return;
        }
        const updated = current.filter((entry) => entry !== category);
        if (updated.length === 0) {
          delete fm.categories;
        } else {
          fm.categories = asCategoryLinks(updated);
        }
      });
    }

    return true;
  }

  async setCategoryColor(topicName: string, categoryName: string, color: string): Promise<boolean> {
    const topic = this.sanitizeName(topicName);
    const category = this.sanitizeName(categoryName);
    const normalizedColor = this.sanitizeColor(color);
    if (!topic || !category || category === HELP_CATEGORY || !normalizedColor) {
      return false;
    }

    let updated = false;
    const configFile = await this.ensureConfigFile();
    await this.app.fileManager.processFrontMatter(configFile, (fm) => {
      const topics = this.getTopicMapFromFrontmatter(fm.topics);
      const categories = topics[topic] ?? [];
      if (!categories.includes(category)) {
        return;
      }

      const categoryColors = this.getCategoryColorMapFromFrontmatter(fm.categoryColors);
      const topicColors = categoryColors[topic] ?? {};
      topicColors[category] = normalizedColor;
      categoryColors[topic] = topicColors;
      fm.categoryColors = categoryColors;
      updated = true;
    });

    return updated;
  }

  async listCategoriesForTopic(topicName: string): Promise<string[]> {
    const topicMap = await this.loadTopicMap();
    const categories = topicMap[topicName] ?? [];
    return [HELP_CATEGORY, ...categories.filter((name) => name !== HELP_CATEGORY)];
  }

  getCategoryColor(topicName: string, categoryName: string): string {
    const topic = this.sanitizeName(topicName);
    const category = this.sanitizeName(categoryName);
    if (!category) {
      return this.fallbackColor(`${topic}:${category}`);
    }
    if (category === HELP_CATEGORY) {
      return "#ae2929";
    }

    const colors = this.getCategoryColorMapFromFrontmatter(
      this.app.metadataCache.getFileCache(this.app.vault.getAbstractFileByPath(MY_LEARNING_CONFIG_FILE_PATH) as TFile | null)?.frontmatter?.categoryColors,
    );
    const savedColor = colors[topic]?.[category];
    if (isValidHexColor(savedColor)) {
      return savedColor.trim().toLowerCase();
    }

    return this.fallbackColor(`${topic}:${category}`);
  }

  listNotes(): TFile[] {
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(`${LEARNING_FOLDER}/`))
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  isLearningNoteFile(file: TFile | null): boolean {
    return !!file && file.extension === "md" && file.path.startsWith(`${LEARNING_FOLDER}/`);
  }

  noteExists(name: string): boolean {
    const trimmed = this.sanitizeNoteName(name);
    if (!trimmed) {
      return false;
    }
    return this.app.vault.getAbstractFileByPath(`${LEARNING_FOLDER}/${trimmed}.md`) instanceof TFile;
  }

  async createNote(name: string, topic?: string | null, categories?: string[]): Promise<TFile | null> {
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

    if (topic || (categories && categories.length > 0)) {
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        if (topic) {
          fm.topic = topic;
        }
        if (categories && categories.length > 0) {
          const normalized = normalizeCategoryList(categories).filter((entry) => entry !== HELP_CATEGORY);
          fm.categories = asCategoryLinks(normalized);
        }
      });
    }

    return file;
  }

  async deleteNote(file: TFile): Promise<void> {
    await this.app.vault.trash(file, true);
  }

  getNoteTopic(file: TFile): string | null {
    const topic = this.app.metadataCache.getFileCache(file)?.frontmatter?.topic;
    return typeof topic === "string" && topic.trim().length > 0 ? topic.trim() : null;
  }

  async setNoteTopic(file: TFile, topic: string): Promise<void> {
    const trimmed = this.sanitizeName(topic);
    if (!trimmed) {
      return;
    }
    await this.addTopic(trimmed);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.topic = trimmed;
    });
  }

  getNoteCategories(file: TFile): string[] {
    return normalizeCategoryList(this.app.metadataCache.getFileCache(file)?.frontmatter?.categories);
  }

  async toggleNoteCategory(file: TFile, category: string): Promise<boolean> {
    const target = this.sanitizeName(category);
    if (!target || target === HELP_CATEGORY) {
      return false;
    }

    let nowActive = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = normalizeCategoryList(fm.categories).filter((entry) => entry !== HELP_CATEGORY);
      if (current.includes(target)) {
        fm.categories = asCategoryLinks(current.filter((entry) => entry !== target));
        nowActive = false;
      } else {
        fm.categories = asCategoryLinks([...current, target]);
        nowActive = true;
      }
    });

    return nowActive;
  }

  isHelpEnabled(file: TFile): boolean {
    return this.app.metadataCache.getFileCache(file)?.frontmatter?.help === true;
  }

  async setHelpEnabled(file: TFile, enabled: boolean): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      if (enabled) {
        fm.help = true;
      } else {
        delete fm.help;
      }
    });
  }

  async toggleHelpEnabled(file: TFile): Promise<boolean> {
    const next = !this.isHelpEnabled(file);
    await this.setHelpEnabled(file, next);
    return next;
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

  notesInTopic(topic: string): TFile[] {
    return this.listNotes().filter((file) => this.getNoteTopic(file) === topic);
  }

  notesInTopicCategory(topic: string, category: string): TFile[] {
    if (category === HELP_CATEGORY) {
      return this.notesInTopic(topic).filter((file) => this.isHelpEnabled(file));
    }
    return this.notesInTopic(topic).filter((file) => this.getNoteCategories(file).includes(category));
  }

  private sanitizeNoteName(name: string): string {
    return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "").trim();
  }

  private sanitizeName(name: string): string {
    return name.trim();
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

  private getTopicMapFromFrontmatter(raw: unknown): MyLearningTopicMap {
    const map: MyLearningTopicMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }

    for (const [topic, categories] of Object.entries(raw as Record<string, unknown>)) {
      const trimmedTopic = this.sanitizeName(topic);
      if (!trimmedTopic) {
        continue;
      }
      map[trimmedTopic] = normalizeCategoryList(categories).filter((name) => name !== HELP_CATEGORY);
    }

    return map;
  }

  private getCategoryColorMapFromFrontmatter(raw: unknown): MyLearningCategoryColorMap {
    const map: MyLearningCategoryColorMap = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return map;
    }

    for (const [topic, categories] of Object.entries(raw as Record<string, unknown>)) {
      const trimmedTopic = this.sanitizeName(topic);
      if (!trimmedTopic || !categories || typeof categories !== "object" || Array.isArray(categories)) {
        continue;
      }

      const topicColors: Record<string, string> = {};
      for (const [category, color] of Object.entries(categories as Record<string, unknown>)) {
        const trimmedCategory = this.sanitizeName(category);
        if (!trimmedCategory || !isValidHexColor(color)) {
          continue;
        }
        topicColors[trimmedCategory] = color.trim().toLowerCase();
      }

      if (Object.keys(topicColors).length > 0) {
        map[trimmedTopic] = topicColors;
      }
    }

    return map;
  }

  private async readTopicsFromFile(file: TFile): Promise<unknown> {
    const content = await this.app.vault.cachedRead(file);
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return {};
    }

    const parsed = this.parseTopicsFrontmatter(match[1]);
    if (parsed) {
      return parsed;
    }
    return this.app.metadataCache.getFileCache(file)?.frontmatter?.topics ?? {};
  }

  private parseTopicsFrontmatter(frontmatterText: string): Record<string, string[]> | null {
    const lines = frontmatterText.split(/\r?\n/);
    const topicsIndex = lines.findIndex((line) => /^topics:\s*/.test(line));
    if (topicsIndex < 0) {
      return null;
    }

    const firstLine = lines[topicsIndex]?.trim() ?? "";
    if (firstLine === "topics: {}") {
      return {};
    }

    const map: Record<string, string[]> = {};
    let currentTopic: string | null = null;

    for (let i = topicsIndex + 1; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      if (!line.trim()) {
        continue;
      }
      if (!line.startsWith("  ")) {
        break;
      }

      const topicMatch = line.match(/^  ([^:#][^:]*)\s*:\s*(.*)$/);
      if (topicMatch) {
        currentTopic = topicMatch[1]?.trim() ?? null;
        if (!currentTopic) {
          continue;
        }
        if (!(currentTopic in map)) {
          map[currentTopic] = [];
        }

        const inlineValue = topicMatch[2]?.trim() ?? "";
        if (inlineValue === "[]") {
          continue;
        }
        if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
          const values = inlineValue
            .slice(1, -1)
            .split(",")
            .map((entry) => entry.trim().replace(/^['\"]|['\"]$/g, ""))
            .filter(Boolean);
          map[currentTopic] = values;
        }
        continue;
      }

      const categoryMatch = line.match(/^    -\s+(.+)$/);
      if (categoryMatch && currentTopic) {
        const category = categoryMatch[1]?.trim().replace(/^['\"]|['\"]$/g, "");
        if (category && !map[currentTopic]?.includes(category)) {
          map[currentTopic]?.push(category);
        }
      }
    }

    return map;
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
