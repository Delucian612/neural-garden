import { ItemView, Notice, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import { VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING } from "./constants";
import { MyLearningStorage } from "./myLearningStorage";
import { openOverlay } from "./overlay";

const OPEN_RIGHT_ICON_CANDIDATES = ["separator-vertical", "panel-right-open", "split-square-vertical"];
const EDIT_ICON_CANDIDATES = ["pencil", "pencil-line", "edit-3"];

function setOpenToRightIcon(el: HTMLElement): void {
  for (const iconName of OPEN_RIGHT_ICON_CANDIDATES) {
    setIcon(el, iconName);
    if (el.querySelector("svg")) {
      return;
    }
  }
  el.setText(">");
}

function setEditIcon(el: HTMLElement): void {
  for (const iconName of EDIT_ICON_CANDIDATES) {
    setIcon(el, iconName);
    if (el.querySelector("svg")) {
      return;
    }
  }
  el.setText("E");
}

function colorFromString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 74% 58%)`;
}

export class NeuralGardenMyLearningView extends ItemView {
  private selectedTopic: string | null = null;
  private selectedCategory: string | null = null;
  private editMode: "topic" | "category" | null = null;
  private uncategorizedExpanded = false;
  private comprehensionExpanded = true;
  private searchQuery = "";
  private searchDebounceTimer: number | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly learningStorage: MyLearningStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING;
  }

  getDisplayText(): string {
    return "MyLearning";
  }

  getIcon(): string {
    return "brain";
  }

  async onOpen(): Promise<void> {
    await this.learningStorage.ensureProvisioned();
    await this.render();
  }

  async onClose(): Promise<void> {
    if (this.searchDebounceTimer) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  async setSelectedTopic(topic: string | null): Promise<void> {
    this.selectedTopic = topic;
    this.selectedCategory = null;
    await this.render();
  }

  private async render(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("neural-garden-root");

    const wrapper = contentEl.createDiv({ cls: "ng-mylearning" });

    const topBar = wrapper.createDiv({ cls: "ng-mylearning-topbar" });
    const homeButton = topBar.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });

    const addNoteButton = topBar.createEl("button", { cls: "ng-mynotes-new-button" });
    const addNoteIcon = addNoteButton.createSpan({ cls: "ng-mynotes-button-icon" });
    setIcon(addNoteIcon, "file-plus");
    addNoteButton.createSpan({ text: "Add Note" });
    addNoteButton.addEventListener("click", () => {
      this.openNewNoteOverlay();
    });

    const headingRow = wrapper.createDiv({ cls: "ng-mylearning-heading-row" });
    headingRow.createEl("h2", { text: "MyLearning", cls: "ng-mynotes-heading" });

    await this.renderSearchSection(wrapper);
    await this.renderTopicsSection(wrapper);
    await this.renderCategoriesSection(wrapper);
    await this.renderNotesGrid(wrapper);
    this.renderComprehensionSection(wrapper);
    this.renderUncategorizedSection(wrapper);
  }

  private async renderSearchSection(parent: HTMLElement): Promise<void> {
    const section = parent.createDiv({ cls: "ng-search ng-mylearning-search" });
    const input = section.createEl("input", {
      type: "text",
      placeholder: "Search Learning...",
    });
    input.addClass("ng-task-input");
    input.value = this.searchQuery;

    const results = section.createDiv({ cls: "ng-search-results ng-mynotes-list" });
    await this.updateSearchResults(this.searchQuery, results);

    input.addEventListener("input", () => {
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = window.setTimeout(() => {
        this.searchQuery = input.value.trim();
        void this.updateSearchResults(this.searchQuery, results);
      }, 250);
    });
  }

  private async updateSearchResults(query: string, container: HTMLElement): Promise<void> {
    container.empty();
    if (query.length < 2) {
      return;
    }

    const q = query.toLowerCase();
    const files = this.learningStorage.listNotes();
    const matches: TFile[] = [];

    for (const file of files) {
      const basenameMatch = file.basename.toLowerCase().includes(q);
      const topic = this.learningStorage.getNoteTopic(file)?.toLowerCase() ?? "";
      const categories = this.learningStorage.getNoteCategories(file).map((entry) => entry.toLowerCase());
      const metadataMatch = topic.includes(q) || categories.some((entry) => entry.includes(q));

      let contentMatch = false;
      if (!basenameMatch && !metadataMatch) {
        const content = await this.app.vault.cachedRead(file);
        contentMatch = content.toLowerCase().includes(q);
      }

      if (basenameMatch || metadataMatch || contentMatch) {
        matches.push(file);
      }
    }

    if (matches.length === 0) {
      container.createDiv({ cls: "ng-empty", text: "No matching learning notes." });
      return;
    }

    for (const file of matches.slice(0, 20)) {
      this.renderNoteRow(container, file, this.selectedCategory);
    }
  }

  private async renderTopicsSection(parent: HTMLElement): Promise<void> {
    const section = parent.createDiv({ cls: "ng-mylearning-topics" });

    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    header.createEl("div", { text: "Topics", cls: "ng-mylearning-label" });
    const actionsRow = header.createDiv({ cls: "ng-mylearning-header-actions" });
    const createButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createButton.setText("+");
    createButton.addEventListener("click", () => {
      this.openCreateTopicOverlay();
    });
    const editButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-edit" });
    editButton.setAttribute("aria-label", "Edit Topic");
    editButton.setAttribute("title", "Edit Topic");
    setEditIcon(editButton);
    editButton.toggleClass("is-active", this.editMode === "topic");
    editButton.addEventListener("click", () => {
      this.editMode = this.editMode === "topic" ? null : "topic";
      void this.render();
    });

    const row = section.createDiv({ cls: "ng-mynotes-pill-row" });
    const topics = await this.learningStorage.listTopics();
    for (const topic of topics) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-topic-pill" });
      pill.createSpan({ text: topic });
      pill.toggleClass("is-active", this.selectedTopic === topic);
      pill.toggleClass("is-edit-target", this.editMode === "topic");
      pill.addEventListener("click", () => {
        if (this.editMode === "topic") {
          this.openTopicEditActions(topic);
          return;
        }
        this.selectedTopic = this.selectedTopic === topic ? null : topic;
        this.selectedCategory = null;
        void this.render();
      });
    }

    if (topics.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No topics yet." });
    }

    section.createDiv({ cls: "ng-mylearning-divider" });
  }

  private async renderCategoriesSection(parent: HTMLElement): Promise<void> {
    if (!this.selectedTopic) {
      return;
    }

    const section = parent.createDiv({ cls: "ng-mylearning-categories" });

    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    header.createEl("div", { text: "Categories", cls: "ng-mylearning-label" });
    const actionsRow = header.createDiv({ cls: "ng-mylearning-header-actions" });
    const createButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createButton.setText("+");
    createButton.addEventListener("click", () => {
      if (!this.selectedTopic) {
        return;
      }
      this.openCreateCategoryOverlay(this.selectedTopic);
    });
    const editButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-edit" });
    editButton.setAttribute("aria-label", "Edit Category");
    editButton.setAttribute("title", "Edit Category");
    setEditIcon(editButton);
    editButton.toggleClass("is-active", this.editMode === "category");
    editButton.addEventListener("click", () => {
      this.editMode = this.editMode === "category" ? null : "category";
      void this.render();
    });

    const row = section.createDiv({ cls: "ng-mynotes-pill-row" });
    const categories = await this.learningStorage.listCategoriesForTopic(this.selectedTopic);
    for (const category of categories) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-category-pill" });
      pill.style.setProperty("--ng-mylearning-category-color", this.learningStorage.getCategoryColor(this.selectedTopic, category));
      if (category === "help") {
        pill.addClass("is-help");
      }
      pill.createSpan({ text: category });
      pill.toggleClass("is-active", this.selectedCategory === category);
      pill.toggleClass("is-edit-target", this.editMode === "category" && category !== "help");
      pill.addEventListener("click", () => {
        if (this.editMode === "category") {
          if (category !== "help" && this.selectedTopic) {
            this.openCategoryEditActions(this.selectedTopic, category);
          }
          return;
        }
        this.selectedCategory = this.selectedCategory === category ? null : category;
        void this.render();
      });
    }

    section.createDiv({ cls: "ng-mylearning-divider" });
  }

  private async renderNotesGrid(parent: HTMLElement): Promise<void> {
    if (!this.selectedCategory) {
      return;
    }

    const section = parent.createDiv({ cls: "ng-mylearning-notes" });

    const notesHeader = section.createDiv({ cls: "ng-mylearning-notes-header" });
    const notesTitleWrap = notesHeader.createDiv({ cls: "ng-mylearning-notes-title-wrap" });
    notesTitleWrap.createDiv({ cls: "ng-mylearning-notes-title", text: "Notes" });

    if (this.selectedTopic && this.selectedCategory) {
      const quickCreate = notesTitleWrap.createEl("button", {
        cls: "ng-mylearning-quick-create",
        attr: { type: "button", "aria-label": "Quick create note" },
      });
      const quickCreateIcon = quickCreate.createSpan({ cls: "ng-mynotes-button-icon" });
      setIcon(quickCreateIcon, "file-plus");
      const triggerQuickCreate = () => {
        this.openNewNoteOverlay(this.selectedTopic, this.selectedCategory);
      };
      quickCreate.addEventListener("click", triggerQuickCreate);
      quickCreate.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          triggerQuickCreate();
        }
      });
    }

    if (!this.selectedTopic) {
      section.createDiv({ cls: "ng-empty", text: "Select a topic to view notes." });
      return;
    }

    const files = this.collectTopicNotes(this.selectedTopic, this.selectedCategory);
    if (files.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No notes found." });
      return;
    }

    const grid = section.createDiv({ cls: "ng-mylearning-grid" });
    grid.createDiv({ cls: "ng-mylearning-grid-divider" });
    for (const file of files) {
      this.renderNoteRow(grid, file, this.selectedCategory);
    }
  }

  private renderComprehensionSection(parent: HTMLElement): void {
    if (!this.selectedTopic) {
      return;
    }

    const section = parent.createDiv({ cls: "ng-mylearning-comprehension" });
    const toggle = section.createEl("button", {
      cls: "ng-mynotes-subheading ng-mynotes-subheading-toggle",
    });
    toggle.createSpan({
      cls: "ng-mynotes-caret",
      text: this.comprehensionExpanded ? "\u25BC" : "\u25B6",
    });
    toggle.createSpan({ cls: "ng-mynotes-subheading-label", text: "Comprehension Tracker" });
    toggle.addEventListener("click", () => {
      this.comprehensionExpanded = !this.comprehensionExpanded;
      void this.render();
    });

    if (!this.comprehensionExpanded) {
      return;
    }

    const rows = this.learningStorage
      .notesInTopic(this.selectedTopic)
      .slice()
      .sort((a, b) => this.learningStorage.getComprehension(a) - this.learningStorage.getComprehension(b))
      .slice(0, 10);

    if (rows.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No notes in this topic yet." });
      return;
    }

    const list = section.createDiv({ cls: "ng-mylearning-comprehension-list" });
    for (const file of rows) {
      const row = list.createDiv({ cls: "ng-mylearning-comprehension-row ng-mylearning-comprehension-item" });
      const textWrap = row.createDiv({ cls: "ng-mylearning-comprehension-text" });
      const titleLine = textWrap.createDiv({ cls: "ng-mylearning-comprehension-title-line" });
      titleLine.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });
      const categoryBadgeRow = titleLine.createDiv({ cls: "ng-mylearning-topic-badge-row" });
      const categories = this.learningStorage.getNoteCategories(file);
      for (const category of categories) {
        const badge = categoryBadgeRow.createDiv({ cls: "ng-mylearning-topic-badge ng-mylearning-category-badge" });
        const noteTopic = this.learningStorage.getNoteTopic(file);
        badge.style.setProperty("--ng-mylearning-category-color", this.learningStorage.getCategoryColor(noteTopic ?? "", category));
        badge.setText(category);
      }
      const track = row.createDiv({ cls: "ng-mylearning-mini-progress" });
      const fill = track.createDiv({ cls: "ng-mylearning-mini-progress-fill" });
      fill.style.width = `${this.learningStorage.getComprehension(file)}%`;
      row.addEventListener("click", async () => {
        await this.leaf.openFile(file);
      });
    }
  }

  private renderUncategorizedSection(parent: HTMLElement): void {
    const section = parent.createDiv({ cls: "ng-mylearning-uncategorized" });

    const toggle = section.createEl("button", {
      cls: "ng-mynotes-subheading ng-mynotes-subheading-toggle",
    });
    toggle.createSpan({
      cls: "ng-mynotes-caret",
      text: this.uncategorizedExpanded ? "\u25BC" : "\u25B6",
    });
    toggle.createSpan({ cls: "ng-mynotes-subheading-label", text: "Uncategorized Notes" });
    toggle.addEventListener("click", () => {
      this.uncategorizedExpanded = !this.uncategorizedExpanded;
      void this.render();
    });

    if (!this.uncategorizedExpanded) {
      return;
    }

    const uncategorized = this.learningStorage.listNotes().filter((file) => this.isUncategorized(file));
    if (uncategorized.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No uncategorized notes." });
      return;
    }

    for (const file of uncategorized) {
      this.renderNoteRow(section, file, null);
    }
  }

  private collectTopicNotes(topic: string, category: string | null): TFile[] {
    if (!category) {
      return this.learningStorage.notesInTopic(topic);
    }
    return this.learningStorage.notesInTopicCategory(topic, category);
  }

  private renderNoteRow(container: HTMLElement, file: TFile, activeCategory: string | null): void {
    const row = container.createDiv({ cls: "ng-mynotes-note-row" });

    const indicator = row.createDiv({ cls: "ng-mynotes-note-indicator" });
    const category = this.resolveIndicatorCategory(file, activeCategory);
    const topic = this.learningStorage.getNoteTopic(file) ?? "";
    indicator.style.background = this.learningStorage.getCategoryColor(topic, category ?? file.basename);

    row.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });

    const actions = row.createDiv({ cls: "ng-mylearning-row-actions" });

    const openRightButton = actions.createEl("button", { cls: "ng-mynotes-note-open-right" });
    openRightButton.setAttribute("aria-label", "Open to the right");
    setOpenToRightIcon(openRightButton);
    openRightButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const rightLeaf = this.app.workspace.getLeaf("split", "vertical");
      await rightLeaf.openFile(file);
    });

    row.addEventListener("click", async () => {
      await this.leaf.openFile(file);
    });
  }

  private resolveIndicatorCategory(file: TFile, activeCategory: string | null): string | null {
    if (activeCategory && activeCategory !== "help") {
      return activeCategory;
    }
    const categories = this.learningStorage.getNoteCategories(file);
    if (categories.length > 0) {
      return categories[0] ?? null;
    }
    return this.learningStorage.getNoteTopic(file);
  }

  private isUncategorized(file: TFile): boolean {
    const topic = this.learningStorage.getNoteTopic(file);
    const categories = this.learningStorage.getNoteCategories(file);
    return !topic || categories.length === 0;
  }

  private openNewNoteOverlay(topic?: string | null, category?: string | null): void {
    const { card, close } = openOverlay("Create A Note");
    card.createDiv({ cls: "ng-overlay-subtitle", text: "Write down a name" });

    if (topic || category) {
      const parts: string[] = [];
      if (topic) {
        parts.push(`Topic: ${topic}`);
      }
      if (category) {
        parts.push(`Category: ${category}`);
      }
      card.createDiv({ cls: "ng-overlay-text", text: parts.join(" | ") });
    }

    const input = card.createEl("input", { type: "text", placeholder: "Note name..." });
    input.addClass("ng-task-input");

    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      if (this.learningStorage.noteExists(name)) {
        errorEl.setText("This Note already exists");
        errorEl.show();
        input.value = "";
        input.focus();
        return;
      }

      const categories = category && category !== "help"
        ? [category]
        : [];

      const file = await this.learningStorage.createNote(name, topic ?? null, categories);
      if (file && category === "help") {
        await this.learningStorage.setHelpEnabled(file, true);
      }

      close();
      if (!file) {
        new Notice("Could not create the note. Try a different name.");
        return;
      }

      await this.leaf.openFile(file);
    };

    createButton.addEventListener("click", () => void submit());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }

  private openCreateTopicOverlay(): void {
    const { card, close } = openOverlay("Create Topic");
    const input = card.createEl("input", { type: "text", placeholder: "Topic name..." });
    input.addClass("ng-task-input");

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      await this.learningStorage.addTopic(name);
      close();
      this.selectedTopic = name.trim();
      this.selectedCategory = null;
      await this.render();
    };

    createButton.addEventListener("click", () => void submit());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }

  private openCreateCategoryOverlay(topic: string): void {
    const { card, close } = openOverlay("Create Category");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `Topic: ${topic}` });

    const colorRow = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    const pickedColor = "#ec9a63";
    const nameInput = colorRow.createEl("input", { type: "text", placeholder: "Category name..." });
    nameInput.addClass("ng-task-input");
    const colorWrap = colorRow.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = colorWrap.createEl("input", { type: "color", value: pickedColor });
    colorInput.addClass("ng-mylearning-color-input");
    const colorSwatch = colorWrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    colorSwatch.style.setProperty("--ng-mylearning-picked-color", pickedColor);
    colorSwatch.setAttribute("role", "button");
    colorSwatch.setAttribute("tabindex", "0");
    colorSwatch.setAttribute("aria-label", "Choose category color");
    colorSwatch.addEventListener("click", () => {
      colorInput.click();
    });
    colorInput.addEventListener("input", () => {
      colorSwatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    });
    colorSwatch.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        colorInput.click();
      }
    });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = nameInput.value.trim();
      if (!name) {
        return;
      }
      await this.learningStorage.addCategory(topic, name, colorInput.value);
      close();
      this.selectedCategory = name.trim();
      await this.render();
    };

    createButton.addEventListener("click", () => void submit());
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    nameInput.focus();
  }

  private openDeleteOverlay(file: TFile): void {
    const { card, close } = openOverlay("Delete Note");
    card.createDiv({
      cls: "ng-overlay-text",
      text: `Are you sure you want to delete "${file.basename}"?`,
    });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });

    cancelButton.addEventListener("click", () => close());
    deleteButton.addEventListener("click", async () => {
      await this.learningStorage.deleteNote(file);
      close();
      await this.render();
    });
  }

  private openTopicEditActions(topic: string): void {
    const { card, close } = openOverlay(`Edit Topic`);
    card.createDiv({ cls: "ng-overlay-subtitle", text: topic });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    renameButton.addEventListener("click", () => {
      close();
      this.openRenameTopicOverlay(topic);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteTopicOverlay(topic);
    });
    cancelButton.addEventListener("click", () => close());
  }

  private openCategoryEditActions(topic: string, category: string): void {
    const { card, close } = openOverlay(`Edit Category`);
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${topic} | ${category}` });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const colorButton = actions.createEl("button", { text: "Color", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    renameButton.addEventListener("click", () => {
      close();
      this.openRenameCategoryOverlay(topic, category);
    });
    colorButton.addEventListener("click", () => {
      close();
      this.openRecolorCategoryOverlay(topic, category);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteCategoryOverlay(topic, category);
    });
    cancelButton.addEventListener("click", () => close());
  }

  private openRecolorCategoryOverlay(topic: string, category: string): void {
    const { card, close } = openOverlay("Category Color");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${topic} | ${category}` });

    const row = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    row.addClass("is-centered");
    const wrap = row.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = wrap.createEl("input", { type: "color", value: this.learningStorage.getCategoryColor(topic, category) });
    colorInput.addClass("ng-mylearning-color-input");
    const swatch = wrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    swatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    swatch.setAttribute("role", "button");
    swatch.setAttribute("tabindex", "0");
    swatch.setAttribute("aria-label", "Choose category color");
    swatch.addEventListener("click", () => colorInput.click());
    swatch.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        colorInput.click();
      }
    });
    colorInput.addEventListener("input", () => {
      swatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const saveButton = actions.createEl("button", { text: "Save", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const success = await this.learningStorage.setCategoryColor(topic, category, colorInput.value);
      if (!success) {
        new Notice("Could not update category color.");
        return;
      }
      close();
      await this.render();
    };

    saveButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
  }

  private openRenameTopicOverlay(previousTopic: string): void {
    const { card, close } = openOverlay("Rename Topic");
    const input = card.createEl("input", { type: "text", value: previousTopic, placeholder: "New topic name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const nextTopic = input.value.trim();
      const success = await this.learningStorage.renameTopic(previousTopic, nextTopic);
      if (!success) {
        new Notice("Could not rename topic. Check the new name and try again.");
        return;
      }
      if (this.selectedTopic === previousTopic) {
        this.selectedTopic = nextTopic;
        this.selectedCategory = null;
      }
      this.editMode = null;
      close();
      await this.render();
    };

    renameButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }

  private openDeleteTopicOverlay(topic: string): void {
    const { card, close } = openOverlay("Delete Topic");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete topic \"${topic}\" and remove it from all notes?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const success = await this.learningStorage.deleteTopic(topic);
      if (!success) {
        new Notice("Could not delete topic.");
        return;
      }
      if (this.selectedTopic === topic) {
        this.selectedTopic = null;
        this.selectedCategory = null;
      }
      this.editMode = null;
      close();
      await this.render();
    };

    deleteButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
  }

  private openRenameCategoryOverlay(topic: string, previousCategory: string): void {
    const { card, close } = openOverlay("Rename Category");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: topic });
    const input = card.createEl("input", { type: "text", value: previousCategory, placeholder: "New category name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const nextCategory = input.value.trim();
      const success = await this.learningStorage.renameCategory(topic, previousCategory, nextCategory);
      if (!success) {
        new Notice("Could not rename category. Check the new name and try again.");
        return;
      }
      if (this.selectedCategory === previousCategory) {
        this.selectedCategory = nextCategory;
      }
      this.editMode = null;
      close();
      await this.render();
    };

    renameButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }

  private openDeleteCategoryOverlay(topic: string, category: string): void {
    const { card, close } = openOverlay("Delete Category");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete category \"${category}\" and remove it from all notes in ${topic}?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const success = await this.learningStorage.deleteCategory(topic, category);
      if (!success) {
        new Notice("Could not delete category.");
        return;
      }
      if (this.selectedCategory === category) {
        this.selectedCategory = null;
      }
      this.editMode = null;
      close();
      await this.render();
    };

    deleteButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
  }
}
