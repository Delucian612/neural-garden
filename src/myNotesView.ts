import { ItemView, Notice, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import {
  QUICK_NOTES_CATEGORY,
  SUPPORT_CATEGORIES,
  VIEW_TYPE_NEURAL_GARDEN_MY_NOTES,
} from "./constants";
import { MyNotesStorage } from "./myNotesStorage";
import { getNameValidationError } from "./nameValidation";
import { openOverlay } from "./overlay";
import { createHelpButton } from "./onboarding";
import { searchNotesInFolder } from "./search";

const FAVOURITE_CATEGORY = "__favourite__";
const SUPPORT_PREFIX = "support:";

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

export class NeuralGardenMyNotesView extends ItemView {
  private selectedCategory: string | null = null;
  private selectedTopic: string | null = null;
  private editMode = false;
  private renderVersion = 0;
  private searchQuery = "";
  private searchDebounceTimer: number | null = null;
  private uncategorizedExpanded = false;
  private searchHintEl: HTMLElement | null = null;
  private notesListEl: HTMLElement | null = null;
  private categoryPillRowEl: HTMLElement | null = null;
  private supportPillRowEl: HTMLElement | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly myNotesStorage: MyNotesStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openHelp: () => void,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_NEURAL_GARDEN_MY_NOTES;
  }

  getDisplayText(): string {
    return "MyNotes";
  }

  getIcon(): string {
    return "folder";
  }

  async onOpen(): Promise<void> {
    await this.myNotesStorage.ensureCategoriesFile();
    await this.render();
  }

  async onClose(): Promise<void> {
    if (this.searchDebounceTimer) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  private async render(): Promise<void> {
    const renderVersion = ++this.renderVersion;
    const { contentEl } = this;
    const wrapper = document.createElement("div");
    wrapper.addClass("ng-mynotes");

    const topBar = wrapper.createDiv({ cls: "ng-mynotes-topbar" });
    const homeButton = topBar.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, this.leaf);
    });
    createHelpButton(topBar, this.openHelp);

    wrapper.createEl("h2", { text: "MyNotes", cls: "ng-mynotes-heading" });
    const searchHintEl = wrapper.createDiv({ cls: "ng-mynotes-heading-hint" });

    this.renderSearchSection(wrapper);
    await this.renderCategoriesSection(wrapper);
    await this.renderTopicsSection(wrapper);
    this.renderSupportSection(wrapper);

    const notesListEl = wrapper.createDiv({ cls: "ng-mynotes-list" });
    await this.updateNotesList(notesListEl, searchHintEl);

    if (renderVersion !== this.renderVersion) {
      return;
    }
    contentEl.empty();
    contentEl.addClass("neural-garden-root");
    contentEl.appendChild(wrapper);
    this.searchHintEl = searchHintEl;
    this.notesListEl = notesListEl;
  }

  private async renderCategoriesSection(parent: HTMLElement): Promise<void> {
    const section = parent.createDiv({ cls: "ng-mynotes-categories" });

    const headerRow = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleWrap = headerRow.createDiv({ cls: "ng-mynotes-title-actions" });
    titleWrap.createEl("h4", { text: "Categories", cls: "ng-mynotes-section-title" });

    const categoryActions = titleWrap.createDiv({ cls: "ng-mylearning-header-actions ng-mynotes-header-actions" });
    const createCategoryButton = categoryActions.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createCategoryButton.setAttribute("aria-label", "Create Category");
    createCategoryButton.setAttribute("title", "Create Category");
    createCategoryButton.setText("+");
    createCategoryButton.addEventListener("click", () => {
      this.openCreateCategoryOverlay();
    });

    const headerActions = headerRow.createDiv({ cls: "ng-mynotes-primary-actions" });
    const newButton = headerActions.createEl("button", { cls: "ng-mynotes-new-button" });
    const newIcon = newButton.createSpan({ cls: "ng-mynotes-button-icon" });
    setIcon(newIcon, "file-plus-2");
    newButton.createSpan({ text: "New" });
    newButton.addEventListener("click", () => {
      this.openNewNoteOverlay();
    });

    const editCategoryButton = headerActions.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-edit" });
    editCategoryButton.setAttribute("aria-label", "Edit Categories and Topics");
    editCategoryButton.setAttribute("title", "Edit Categories and Topics");
    setEditIcon(editCategoryButton);
    editCategoryButton.toggleClass("is-active", this.editMode);
    editCategoryButton.addEventListener("click", () => {
      this.editMode = !this.editMode;
      void this.render();
    });

    const pillRow = section.createDiv({ cls: "ng-mynotes-pill-row" });
    this.categoryPillRowEl = pillRow;

    const favouritePill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-mynotes-pill-favourite" });
    favouritePill.dataset.categoryKey = FAVOURITE_CATEGORY;
    const heartIcon = favouritePill.createSpan({ cls: "ng-mynotes-button-icon" });
    setIcon(heartIcon, "heart");
    favouritePill.createSpan({ text: "Favourites" });
    if (this.selectedCategory === FAVOURITE_CATEGORY) {
      favouritePill.addClass("is-active");
    }
    favouritePill.addEventListener("click", () => {
      void this.selectCategory(FAVOURITE_CATEGORY);
    });

    const quickNotesPill = pillRow.createEl("button", { cls: "ng-mynotes-pill" });
    quickNotesPill.dataset.categoryKey = QUICK_NOTES_CATEGORY;
    quickNotesPill.createSpan({ text: QUICK_NOTES_CATEGORY });
    if (this.selectedCategory === QUICK_NOTES_CATEGORY) {
      quickNotesPill.addClass("is-active");
    }
    quickNotesPill.addEventListener("click", () => {
      void this.selectCategory(QUICK_NOTES_CATEGORY);
    });

    const categories = (await this.myNotesStorage.loadCategories())
      .filter((category) => category.name !== QUICK_NOTES_CATEGORY);
    for (const category of categories) {
      const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill" });
      pill.dataset.categoryKey = category.name;
      pill.createSpan({ text: category.name });
      if (this.selectedCategory === category.name) {
        pill.addClass("is-active");
      }
      pill.toggleClass("is-edit-target", this.editMode);
      pill.addEventListener("click", () => {
        if (this.editMode) {
          this.openCategoryEditActions(category.name);
          return;
        }
        void this.selectCategory(category.name);
      });
    }

    if (categories.length === 0) {
      section.createDiv({
        cls: "ng-empty",
        text: "No custom categories yet. Add categories from a note's header.",
      });
    }
  }

  private renderSupportSection(parent: HTMLElement): void {
    const section = parent.createDiv({ cls: "ng-mynotes-support" });
    section.createEl("h4", { text: "Support Notes", cls: "ng-mynotes-section-title" });

    const pillRow = section.createDiv({ cls: "ng-mynotes-pill-row" });
    this.supportPillRowEl = pillRow;
    for (const support of SUPPORT_CATEGORIES) {
      const key = `${SUPPORT_PREFIX}${support.name}`;
      const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-mynotes-support-pill" });
      pill.dataset.categoryKey = key;
      pill.createSpan({ text: support.name });
      pill.style.setProperty("--ng-support-color", support.color);
      if (this.selectedCategory === key) {
        pill.addClass("is-active");
      }
      pill.addEventListener("click", () => {
        void this.selectCategory(key);
      });
    }
  }

  private async renderTopicsSection(parent: HTMLElement): Promise<void> {
    if (!this.selectedCategory || this.isSpecialCategory(this.selectedCategory)) {
      return;
    }

    const section = parent.createDiv({ cls: "ng-mylearning-categories" });
    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleGroup = header.createDiv({ cls: "ng-mylearning-heading-group" });
    titleGroup.createEl("h4", { text: "Topics", cls: "ng-mynotes-section-title" });
    const actions = titleGroup.createDiv({ cls: "ng-mylearning-header-actions" });

    const addButton = actions.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    addButton.setAttribute("aria-label", "Create Topic");
    addButton.setText("+");
    addButton.addEventListener("click", () => {
      if (this.selectedCategory) {
        this.openCreateTopicOverlay(this.selectedCategory);
      }
    });

    const row = section.createDiv({ cls: "ng-mynotes-pill-row" });
    const topics = await this.myNotesStorage.listTopicsForCategory(this.selectedCategory);
    for (const topic of topics) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-category-pill" });
      pill.style.setProperty("--ng-mylearning-category-color", this.myNotesStorage.getTopicColor(this.selectedCategory, topic));
      pill.style.setProperty("--ng-mynotes-topic-color-muted", this.myNotesStorage.getMutedTopicColor(this.selectedCategory, topic));
      pill.createSpan({ text: topic });
      pill.toggleClass("is-active", this.selectedTopic === topic);
      pill.toggleClass("is-edit-target", this.editMode);
      pill.addEventListener("click", () => {
        if (this.editMode) {
          this.openTopicEditActions(this.selectedCategory!, topic);
          return;
        }
        this.selectedTopic = this.selectedTopic === topic ? null : topic;
        void this.updateNotesList();
        this.syncTopicSelectionState();
      });
    }

    if (topics.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No topics yet. Click the plus button to add one." });
    }
  }

  private renderSearchSection(parent: HTMLElement): void {
    const section = parent.createDiv({ cls: "ng-mynotes-search" });
    const input = section.createEl("input", {
      type: "text",
      placeholder: "Search Notes...",
    });
    input.addClass("ng-task-input");
    input.value = this.searchQuery;
    input.addEventListener("input", () => {
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = window.setTimeout(() => {
        this.searchQuery = input.value.trim();
        void this.updateNotesList();
      }, 250);
    });
  }

  private syncSearchHint(): void {
    if (!this.searchHintEl) {
      return;
    }
    this.searchHintEl.setText("Select a category or search to see notes");
  }

  private async selectCategory(name: string): Promise<void> {
    this.selectedCategory = this.selectedCategory === name ? null : name;
    this.selectedTopic = null;
    await this.render();
  }

  async showCategory(name: string | null): Promise<void> {
    this.selectedCategory = name;
    this.selectedTopic = null;
    this.searchQuery = "";
    await this.render();
  }

  private syncCategorySelectionState(): void {
    for (const button of this.contentEl.querySelectorAll<HTMLButtonElement>(".ng-mynotes-pill[data-category-key]")) {
      const key = button.dataset.categoryKey ?? null;
      button.toggleClass("is-active", key === this.selectedCategory);
    }
  }

  private syncTopicSelectionState(): void {
    for (const button of this.contentEl.querySelectorAll<HTMLButtonElement>(".ng-mylearning-category-pill")) {
      button.toggleClass("is-active", button.textContent === this.selectedTopic);
    }
  }

  private async updateNotesList(
    targetContainer?: HTMLElement | null,
    targetSearchHint?: HTMLElement | null,
  ): Promise<void> {
    const container = targetContainer ?? this.notesListEl;
    if (!container) {
      return;
    }
    container.empty();
    (targetSearchHint ?? this.searchHintEl)?.setText("Select a category or search to see notes");

    if (!this.selectedCategory && this.searchQuery.length < 2) {
      this.renderUncategorizedSection(container);
      return;
    }

    if (this.selectedCategory && !this.isSpecialCategory(this.selectedCategory) && !this.selectedTopic && this.searchQuery.length < 2) {
      this.renderUncategorizedSection(container);
      return;
    }

    const files = await this.collectNotes();
    if (files.length === 0) {
      container.createDiv({ cls: "ng-empty", text: "No notes found." });
    } else {
      for (const file of files) {
        this.renderNoteRow(container, file);
      }
    }

    this.renderUncategorizedSection(container);
  }

  private renderUncategorizedSection(container: HTMLElement): void {
    const uncategorized = this.myNotesStorage.listNotes().filter((file) => {
      const category = this.myNotesStorage.getNoteCategory(file);
      return !category || (category !== QUICK_NOTES_CATEGORY && this.myNotesStorage.getNoteTopics(file).length === 0);
    });

    const uncategorizedToggle = container.createEl("button", {
      cls: "ng-mynotes-subheading ng-mynotes-subheading-toggle",
    });
    uncategorizedToggle.createSpan({
      cls: "ng-mynotes-caret",
      text: this.uncategorizedExpanded ? "\u25BC" : "\u25B6",
    });
    uncategorizedToggle.createSpan({ cls: "ng-mynotes-subheading-label", text: "Uncategorized Notes" });
    uncategorizedToggle.addEventListener("click", () => {
      this.uncategorizedExpanded = !this.uncategorizedExpanded;
      void this.updateNotesList();
    });

    if (!this.uncategorizedExpanded) {
      return;
    }
    if (uncategorized.length === 0) {
      container.createDiv({ cls: "ng-empty", text: "No uncategorized notes." });
      return;
    }
    for (const file of uncategorized) {
      this.renderNoteRow(container, file);
    }
  }

  private async collectNotes(): Promise<TFile[]> {
    let files: TFile[] | null = null;

    if (this.selectedCategory === FAVOURITE_CATEGORY) {
      files = this.myNotesStorage.favouriteNotes();
    } else if (this.selectedCategory?.startsWith(SUPPORT_PREFIX)) {
      files = this.myNotesStorage.notesWithSupport(this.selectedCategory.slice(SUPPORT_PREFIX.length));
    } else if (this.selectedCategory) {
      files = this.selectedTopic
        ? this.myNotesStorage.notesInCategoryTopic(this.selectedCategory, this.selectedTopic)
        : await this.myNotesStorage.notesInCategory(this.selectedCategory);
    }

    const query = this.searchQuery;
    if (query.length >= 2) {
      if (files === null) {
        const matches = await searchNotesInFolder(this.app, query);
        const allowed = new Set(this.myNotesStorage.listNotes().map((file) => file.path));
        return matches.filter((file) => allowed.has(file.path));
      }
      const q = query.toLowerCase();
      return files.filter((file) => file.basename.toLowerCase().includes(q));
    }

    return files ?? [];
  }

  private renderNoteRow(container: HTMLElement, file: TFile): void {
    const row = container.createDiv({ cls: "ng-mynotes-note-row" });

    const favouriteButton = row.createEl("button", { cls: "ng-mynotes-note-heart" });
    setIcon(favouriteButton, "heart");
    if (this.myNotesStorage.isFavourite(file)) {
      favouriteButton.addClass("is-favourite");
    }
    favouriteButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const nowFavourite = await this.myNotesStorage.toggleFavourite(file);
      favouriteButton.toggleClass("is-favourite", nowFavourite);
      favouriteButton.removeClass("ng-heart-pop");
      void favouriteButton.offsetWidth;
      favouriteButton.addClass("ng-heart-pop");
      if (this.selectedCategory === FAVOURITE_CATEGORY && !nowFavourite) {
        row.remove();
      }
    });

    const indicator = row.createDiv({ cls: "ng-mynotes-note-indicator" });
    const category = this.myNotesStorage.getNoteCategory(file) ?? "";
    const topic = this.selectedTopic ?? this.myNotesStorage.getNoteTopics(file)[0] ?? file.basename;
    indicator.style.background = this.myNotesStorage.getTopicColor(category, topic);

    row.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });

    const openRightButton = row.createEl("button", { cls: "ng-mynotes-note-open-right" });
    openRightButton.setAttribute("aria-label", "Open to the right");
    setOpenToRightIcon(openRightButton);
    openRightButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const rightLeaf = this.app.workspace.getLeaf("split", "vertical");
      await rightLeaf.openFile(file);
    });

    const deleteButton = row.createEl("button", { cls: "ng-mynotes-note-delete" });
    setIcon(deleteButton, "x");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.openDeleteOverlay(file, row);
    });

    row.addEventListener("click", async () => {
      await this.leaf.openFile(file);
    });
  }

  private openNewNoteOverlay(): void {
    const { card, close } = openOverlay("Create A Note");
    card.createDiv({ cls: "ng-overlay-subtitle", text: "Write down a name" });

    if (this.selectedCategory && this.selectedCategory !== FAVOURITE_CATEGORY) {
      const label = this.selectedCategory.startsWith(SUPPORT_PREFIX)
        ? `Support-Category: ${this.selectedCategory.slice(SUPPORT_PREFIX.length)}`
        : `Category: ${this.selectedCategory}${this.selectedTopic ? ` | Topic: ${this.selectedTopic}` : ""}`;
      card.createDiv({ cls: "ng-overlay-text", text: label });
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
      if (this.myNotesStorage.noteExists(name)) {
        errorEl.setText("This Note already exists");
        errorEl.show();
        input.value = "";
        input.focus();
        return;
      }
      const file = await this.myNotesStorage.createNote(name);
      close();
      if (!file) {
        new Notice("Could not create the note. Try a different name.");
        return;
      }

      if (this.selectedCategory && this.selectedCategory !== FAVOURITE_CATEGORY) {
        if (this.selectedCategory.startsWith(SUPPORT_PREFIX)) {
          const supportName = this.selectedCategory.slice(SUPPORT_PREFIX.length);
          await this.myNotesStorage.setSupportNote(file, true);
          await this.myNotesStorage.toggleNoteSupport(file, supportName);
        } else {
          await this.myNotesStorage.setNoteCategory(file, this.selectedCategory);
          if (this.selectedTopic) {
            await this.myNotesStorage.toggleNoteTopic(file, this.selectedTopic);
          }
        }
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

  private openCreateCategoryOverlay(): void {
    const { card, close } = openOverlay("Create Category");
    const input = card.createEl("input", { type: "text", placeholder: "Category name..." });
    input.addClass("ng-task-input");

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      await this.myNotesStorage.addCategory(name);
      this.selectedCategory = name;
      close();
      await this.render();
    };

    createButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }

  private openCreateTopicOverlay(category: string): void {
    const { card, close } = openOverlay("Create Topic");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `Category: ${category}` });
    const row = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    const input = row.createEl("input", { type: "text", placeholder: "Topic name..." });
    input.addClass("ng-task-input");
    const colorWrap = row.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = colorWrap.createEl("input", { type: "color", value: "#ec9a63" });
    colorInput.addClass("ng-mylearning-color-input");
    const colorSwatch = colorWrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    colorSwatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    colorSwatch.setAttribute("role", "button");
    colorSwatch.setAttribute("tabindex", "0");
    colorSwatch.setAttribute("aria-label", "Choose topic color");
    colorSwatch.addEventListener("click", () => colorInput.click());
    colorSwatch.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        colorInput.click();
      }
    });
    colorInput.addEventListener("input", () => {
      colorSwatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    });
    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = input.value.trim();
      const validationError = getNameValidationError(name);
      if (!name || validationError) {
        errorEl.setText(validationError ?? "Enter a topic name.");
        errorEl.show();
        return;
      }
      await this.myNotesStorage.addTopic(category, name, colorInput.value);
      this.selectedTopic = name;
      close();
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

  private openTopicEditActions(category: string, topic: string): void {
    const { card, close } = openOverlay("Edit Topic");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${category} | ${topic}` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const colorButton = actions.createEl("button", { text: "Color", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    renameButton.addEventListener("click", () => {
      close();
      this.openRenameTopicOverlay(category, topic);
    });
    colorButton.addEventListener("click", () => {
      close();
      this.openTopicColorOverlay(category, topic);
    });
    deleteButton.addEventListener("click", async () => {
      await this.myNotesStorage.deleteTopic(category, topic);
      if (this.selectedTopic === topic) {
        this.selectedTopic = null;
      }
      this.editMode = false;
      close();
      await this.render();
    });
  }

  private openRenameTopicOverlay(category: string, topic: string): void {
    const { card, close } = openOverlay("Rename Topic");
    const input = card.createEl("input", { type: "text", value: topic });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    renameButton.addEventListener("click", async () => {
      const next = input.value.trim();
      if (await this.myNotesStorage.renameTopic(category, topic, next)) {
        this.selectedTopic = this.selectedTopic === topic ? next : this.selectedTopic;
        this.editMode = false;
        close();
        await this.render();
      }
    });
    input.focus();
  }

  private openTopicColorOverlay(category: string, topic: string): void {
    const { card, close } = openOverlay("Topic Color");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${category} | ${topic}` });
    const row = card.createDiv({ cls: "ng-mylearning-category-color-row is-centered" });
    const wrap = row.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const input = wrap.createEl("input", {
      type: "color",
      value: this.myNotesStorage.getTopicColor(category, topic),
    });
    input.addClass("ng-mylearning-color-input");
    const swatch = wrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    swatch.style.setProperty("--ng-mylearning-picked-color", input.value);
    swatch.setAttribute("role", "button");
    swatch.setAttribute("tabindex", "0");
    swatch.setAttribute("aria-label", "Choose topic color");
    swatch.addEventListener("click", () => input.click());
    swatch.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }
    });
    input.addEventListener("input", () => {
      swatch.style.setProperty("--ng-mylearning-picked-color", input.value);
    });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const saveButton = actions.createEl("button", { text: "Save", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
    saveButton.addEventListener("click", async () => {
      await this.myNotesStorage.setTopicColor(category, topic, input.value);
      this.editMode = false;
      close();
      await this.render();
    });
    cancelButton.addEventListener("click", () => close());
  }

  private isSpecialCategory(category: string): boolean {
    return category === FAVOURITE_CATEGORY
      || category === QUICK_NOTES_CATEGORY
      || category.startsWith(SUPPORT_PREFIX);
  }

  private openCategoryEditActions(category: string): void {
    const { card, close } = openOverlay("Edit Category");
    card.createDiv({ cls: "ng-overlay-subtitle", text: category });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    renameButton.addEventListener("click", () => {
      close();
      this.openRenameCategoryOverlay(category);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteCategoryOverlay(category);
    });
    cancelButton.addEventListener("click", () => close());
  }

  private openRenameCategoryOverlay(previousCategory: string): void {
    const { card, close } = openOverlay("Rename Category");
    const input = card.createEl("input", { type: "text", value: previousCategory, placeholder: "New category name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const nextCategory = input.value.trim();
      const success = await this.myNotesStorage.renameCategory(previousCategory, nextCategory);
      if (!success) {
        new Notice("Could not rename category. Check the new name and try again.");
        return;
      }

      if (this.selectedCategory === previousCategory) {
        this.selectedCategory = nextCategory;
      }

      this.editMode = false;
      close();
      await this.render();
    };

    renameButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submit();
      }
    });
    input.focus();
  }

  private openDeleteCategoryOverlay(category: string): void {
    const { card, close } = openOverlay("Delete Category");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete category \"${category}\" and remove it from all notes?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const success = await this.myNotesStorage.deleteCategory(category);
      if (!success) {
        new Notice("Could not delete category.");
        return;
      }

      if (this.selectedCategory === category) {
        this.selectedCategory = null;
      }

      this.editMode = false;
      close();
      await this.render();
    };

    deleteButton.addEventListener("click", () => {
      void submit();
    });
    cancelButton.addEventListener("click", () => close());
  }

  private openDeleteOverlay(file: TFile, row: HTMLElement): void {
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
      await this.myNotesStorage.deleteNote(file);
      close();
      row.remove();
      await this.render();
    });
  }
}
