import { ItemView, Notice, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import { VIEW_TYPE_NEURAL_GARDEN_MY_LEARNING } from "./constants";
import { MyLearningStorage } from "./myLearningStorage";
import { getNameValidationError } from "./nameValidation";
import { openOverlay } from "./overlay";
import { createHelpButton } from "./onboarding";

const OPEN_RIGHT_ICON_CANDIDATES = ["separator-vertical", "panel-right-open", "split-square-vertical"];
const EDIT_ICON_CANDIDATES = ["pencil", "pencil-line", "edit-3"];
const DAILY_NOTE_DATE_PATTERN = /^Daily Note (\d{4}-\d{2}-\d{2})$/;
const DAILY_CALENDAR_DAYS = 30;

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

export class NeuralGardenMyLearningView extends ItemView {
  private selectedCategory: string | null = null;
  private selectedTopic: string | null = null;
  private editMode: "topic" | "category" | null = null;
  private uncategorizedExpanded = false;
  private searchQuery = "";
  private searchDebounceTimer: number | null = null;
  private dailyProgressOverrides = new Map<string, number>();

  constructor(
    leaf: WorkspaceLeaf,
    private readonly learningStorage: MyLearningStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    initialSelection?: { category: string | null; topic: string | null },
    private readonly onSelectionChange?: (category: string | null, topic: string | null) => void,
    private readonly openHelp: () => void = () => undefined,
  ) {
    super(leaf);
    this.selectedCategory = initialSelection?.category ?? null;
    this.selectedTopic = initialSelection?.topic ?? null;
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

  async setSelection(category: string | null, topic?: string | null): Promise<void> {
    this.selectedCategory = category;
    this.selectedTopic = topic ?? null;
    this.notifySelectionChange();
    await this.render();
  }

  async refresh(): Promise<void> {
    await this.render();
  }

  private notifySelectionChange(): void {
    this.onSelectionChange?.(this.selectedCategory, this.selectedTopic);
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
    createHelpButton(topBar, this.openHelp);

    const headingRow = wrapper.createDiv({ cls: "ng-mylearning-heading-row" });
    headingRow.createEl("h2", { text: "MyLearning", cls: "ng-mynotes-heading" });

    await this.renderSearchSection(wrapper);
    this.renderDailyNotesCalendar(wrapper);
    await this.renderCategoriesSection(wrapper);
    await this.renderTopicsSection(wrapper);
    await this.renderNotesGrid(wrapper);
    this.renderUncategorizedSection(wrapper);
  }

  private renderDailyNotesCalendar(parent: HTMLElement): void {
    const section = parent.createDiv({ cls: "ng-mylearning-daily-calendar" });
    const leftArrow = section.createEl("button", { cls: "ng-mylearning-daily-arrow is-left" });
    leftArrow.setAttribute("aria-label", "Scroll to earlier days");
    setIcon(leftArrow, "chevron-left");
    const viewport = section.createDiv({ cls: "ng-mylearning-daily-viewport" });
    const row = viewport.createDiv({ cls: "ng-mylearning-daily-row" });
    const rightArrow = section.createEl("button", { cls: "ng-mylearning-daily-arrow is-right" });
    rightArrow.setAttribute("aria-label", "Scroll to later days");
    setIcon(rightArrow, "chevron-right");
    const notesByDate = new Map<string, TFile>();

    for (const file of this.learningStorage.listNotes()) {
      const match = file.basename.match(DAILY_NOTE_DATE_PATTERN);
      if (match?.[1]) {
        notesByDate.set(match[1], file);
      }
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayKey = formatLocalDate(today);
    for (let offset = DAILY_CALENDAR_DAYS - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dateKey = formatLocalDate(date);
      const file = notesByDate.get(dateKey);
      const processed = !!file && this.getDisplayedComprehension(file) >= 90;
      const day = row.createEl("button", { cls: "ng-mylearning-daily-day" });
      day.toggleClass("is-today", dateKey === todayKey);
      day.toggleClass("has-note", !!file);
      day.toggleClass("is-processed", processed);
      day.setAttribute("aria-label", file
        ? `${file.basename}, ${processed ? "done" : "in progress"}`
        : `${dateKey}, no daily note`);
      day.createSpan({
        cls: "ng-mylearning-daily-weekday",
        text: date.toLocaleDateString(undefined, { weekday: "short" }),
      });
      const numberWrap = day.createSpan({ cls: "ng-mylearning-daily-number-wrap" });
      numberWrap.createSpan({ cls: "ng-mylearning-daily-number", text: String(date.getDate()) });
      if (processed) {
        const check = numberWrap.createSpan({ cls: "ng-mylearning-daily-check" });
        setIcon(check, "check");
      } else if (file) {
        day.createSpan({ cls: "ng-mylearning-daily-marker" });
      }

      day.addEventListener("click", () => {
        if (file) {
          this.openDailyNoteActions(file);
        } else if (dateKey === todayKey) {
          void this.createTodayDailyNote(dateKey);
        }
      });
    }

    const updateArrows = () => {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      leftArrow.disabled = viewport.scrollLeft <= 1;
      rightArrow.disabled = viewport.scrollLeft >= maxScroll - 1;
    };
    const scrollCalendar = (direction: -1 | 1) => {
      viewport.scrollBy({ left: direction * viewport.clientWidth * 0.75, behavior: "smooth" });
    };
    leftArrow.addEventListener("click", () => scrollCalendar(-1));
    rightArrow.addEventListener("click", () => scrollCalendar(1));
    viewport.addEventListener("scroll", updateArrows);
    window.requestAnimationFrame(() => {
      viewport.scrollLeft = viewport.scrollWidth;
      updateArrows();
    });

    let startX = 0;
    let startScrollLeft = 0;
    let dragging = false;
    let pointerCaptured = false;
    let suppressClick = false;
    viewport.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      startScrollLeft = viewport.scrollLeft;
      dragging = true;
      pointerCaptured = false;
      suppressClick = false;
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) {
        suppressClick = true;
        viewport.addClass("is-dragging");
        if (!pointerCaptured) {
          viewport.setPointerCapture(event.pointerId);
          pointerCaptured = true;
        }
      }
      viewport.scrollLeft = startScrollLeft - distance;
    });
    const stopDragging = (event: PointerEvent) => {
      dragging = false;
      viewport.removeClass("is-dragging");
      if (pointerCaptured && viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };
    viewport.addEventListener("pointerup", stopDragging);
    viewport.addEventListener("pointercancel", stopDragging);
    viewport.addEventListener("click", (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  private async createTodayDailyNote(dateKey: string): Promise<void> {
    const file = await this.learningStorage.createDailyNote(dateKey);
    if (!file) {
      new Notice("Could not create today's daily note.");
      return;
    }
    await this.leaf.openFile(file);
  }

  private getDisplayedComprehension(file: TFile): number {
    const cached = this.learningStorage.getEntryComprehension(file);
    const override = this.dailyProgressOverrides.get(file.path);
    if (override === undefined) {
      return cached;
    }
    if (cached === override) {
      this.dailyProgressOverrides.delete(file.path);
      return cached;
    }
    return override;
  }

  private openDailyNoteActions(file: TFile): void {
    const { card, close } = openOverlay(file.basename);
    card.createDiv({ cls: "ng-overlay-text", text: "Open this daily note or mark it as processed." });

    const doneLabel = card.createEl("label", { cls: "ng-mylearning-daily-done" });
    const doneCheckbox = doneLabel.createEl("input", { type: "checkbox" });
    doneCheckbox.checked = this.getDisplayedComprehension(file) >= 90;
    doneLabel.createSpan({ text: "Finished" });
    doneCheckbox.addEventListener("change", async () => {
      const nextProgress = doneCheckbox.checked ? 100 : 0;
      this.dailyProgressOverrides.set(file.path, nextProgress);
      await this.learningStorage.setComprehension(file, nextProgress);
      close();
      await this.render();
    });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const openButton = actions.createEl("button", { text: "Open note", cls: "ng-overlay-confirm" });
    openButton.addEventListener("click", async () => {
      close();
      await this.leaf.openFile(file);
    });
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
    const files = this.learningStorage.listEntries();
    const matches: TFile[] = [];

    for (const file of files) {
      const basenameMatch = file.basename.toLowerCase().includes(q);
      const category = this.learningStorage.getEntryCategory(file)?.toLowerCase() ?? "";
      const topics = this.learningStorage.getEntryTopics(file).map((entry) => entry.toLowerCase());
      const metadataMatch = category.includes(q) || topics.some((entry) => entry.includes(q));

      let contentMatch = false;
      if (file.extension === "md" && !basenameMatch && !metadataMatch) {
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
      this.renderNoteRow(container, file, this.selectedTopic);
    }
  }

  private async renderCategoriesSection(parent: HTMLElement): Promise<void> {
    const section = parent.createDiv({ cls: "ng-mylearning-topics" });

    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleGroup = header.createDiv({ cls: "ng-mylearning-heading-group" });
    titleGroup.createEl("div", { text: "Categories", cls: "ng-mylearning-label" });
    const actionsRow = titleGroup.createDiv({ cls: "ng-mylearning-header-actions" });
    const createButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createButton.setText("+");
    createButton.addEventListener("click", () => {
      this.openCreateCategoryOverlay();
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
    const addNoteButton = header.createEl("button", { cls: "ng-mynotes-new-button ng-mylearning-heading-add-note" });
    const addNoteIcon = addNoteButton.createSpan({ cls: "ng-mynotes-button-icon" });
    setIcon(addNoteIcon, "file-plus");
    addNoteButton.createSpan({ text: "Add Note" });
    addNoteButton.addEventListener("click", () => {
      this.openNewNoteOverlay(this.selectedCategory, this.selectedTopic);
    });

    const row = section.createDiv({ cls: "ng-mynotes-pill-row" });
    const categories = await this.learningStorage.listCategories();
    for (const category of categories) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-topic-pill" });
      pill.createSpan({ text: category });
      this.renderProgressSummary(pill, this.learningStorage.entriesInCategory(category));
      pill.toggleClass("is-active", this.selectedCategory === category);
      pill.toggleClass("is-edit-target", this.editMode === "category");
      pill.addEventListener("click", () => {
        if (this.editMode === "category") {
          this.openCategoryEditActions(category);
          return;
        }
        this.selectedCategory = this.selectedCategory === category ? null : category;
        this.selectedTopic = null;
        this.notifySelectionChange();
        void this.render();
      });
    }

    if (categories.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No categories yet. Click the plus button to add one." });
    }

    section.createDiv({ cls: "ng-mylearning-divider" });
  }

  private async renderTopicsSection(parent: HTMLElement): Promise<void> {
    if (!this.selectedCategory) {
      return;
    }

    const section = parent.createDiv({ cls: "ng-mylearning-categories" });

    const header = section.createDiv({ cls: "ng-mynotes-section-header" });
    const titleGroup = header.createDiv({ cls: "ng-mylearning-heading-group" });
    titleGroup.createEl("div", { text: "Topics", cls: "ng-mylearning-label" });
    const actionsRow = titleGroup.createDiv({ cls: "ng-mylearning-header-actions" });
    const createButton = actionsRow.createEl("button", { cls: "ng-note-header-add-category-icon ng-mylearning-inline-plus" });
    createButton.setText("+");
    createButton.addEventListener("click", () => {
      if (!this.selectedCategory) {
        return;
      }
      this.openCreateTopicOverlay(this.selectedCategory);
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
    const topics = await this.learningStorage.listTopicsForCategory(this.selectedCategory);
    for (const topic of topics) {
      const pill = row.createEl("button", { cls: "ng-mynotes-pill ng-mylearning-category-pill" });
      pill.style.setProperty("--ng-mylearning-category-color", this.learningStorage.getTopicColor(this.selectedCategory, topic));
      pill.createSpan({ text: topic });
      this.renderProgressSummary(pill, this.learningStorage.entriesInCategoryTopic(this.selectedCategory, topic));
      pill.toggleClass("is-active", this.selectedTopic === topic);
      pill.toggleClass("is-edit-target", this.editMode === "topic");
      pill.addEventListener("click", () => {
        if (this.editMode === "topic") {
          if (this.selectedCategory) {
            this.openTopicEditActions(this.selectedCategory, topic);
          }
          return;
        }
        this.selectedTopic = this.selectedTopic === topic ? null : topic;
        this.notifySelectionChange();
        void this.render();
      });
    }

    section.createDiv({ cls: "ng-mylearning-divider" });
  }

  private async renderNotesGrid(parent: HTMLElement): Promise<void> {
    if (!this.selectedTopic) {
      return;
    }

    const section = parent.createDiv({ cls: "ng-mylearning-notes" });

    section.createDiv({ cls: "ng-mylearning-notes-title", text: "Notes & Canvases" });

    if (!this.selectedCategory) {
      section.createDiv({ cls: "ng-empty", text: "Select a category to view notes." });
      return;
    }

    const files = this.collectCategoryNotes(this.selectedCategory, this.selectedTopic);
    if (files.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No notes found." });
      return;
    }

    const grid = section.createDiv({ cls: "ng-mylearning-entry-list" });
    for (const file of files) {
      this.renderNoteRow(grid, file, this.selectedTopic);
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

    const uncategorized = this.learningStorage.listEntries().filter((file) => this.isUncategorized(file));
    if (uncategorized.length === 0) {
      section.createDiv({ cls: "ng-empty", text: "No uncategorized notes." });
      return;
    }

    for (const file of uncategorized) {
      this.renderNoteRow(section, file, null);
    }
  }

  private collectCategoryNotes(category: string, topic: string | null): TFile[] {
    if (!topic) {
      return this.learningStorage.entriesInCategory(category);
    }
    return this.learningStorage.entriesInCategoryTopic(category, topic);
  }

  private renderNoteRow(container: HTMLElement, file: TFile, activeTopic: string | null): void {
    const row = container.createDiv({ cls: "ng-mynotes-note-row" });

    const comprehension = this.getDisplayedComprehension(file);
    row.toggleClass("is-low-comprehension", comprehension < 20);
    const indicator = row.createDiv({ cls: "ng-mynotes-note-indicator" });
    const topic = this.resolveIndicatorTopic(file, activeTopic);
    const category = this.learningStorage.getEntryCategory(file) ?? "";
    indicator.style.background = this.learningStorage.getTopicColor(category, topic ?? file.basename);

    row.createDiv({ cls: "ng-mynotes-note-title", text: file.basename });
    if (file.extension === "canvas") {
      row.createSpan({ cls: "ng-mylearning-entry-type", text: "Canvas" });
    }

    const actions = row.createDiv({ cls: "ng-mylearning-row-actions" });
    const progressTone = comprehension > 70 ? "is-green" : comprehension > 50 ? "is-yellow" : "is-orange";
    const progressTrack = actions.createDiv({ cls: `ng-mylearning-entry-progress ${progressTone}` });
    const progressFill = progressTrack.createDiv({
      cls: `ng-mylearning-entry-progress-fill ${progressTone}`,
    });
    progressFill.style.width = `${comprehension}%`;

    const openRightButton = actions.createEl("button", { cls: "ng-mynotes-note-open-right" });
    openRightButton.setAttribute("aria-label", "Open to the right");
    setOpenToRightIcon(openRightButton);
    openRightButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const rightLeaf = this.app.workspace.getLeaf("split", "vertical");
      await rightLeaf.openFile(file);
    });

    const deleteButton = actions.createEl("button", { cls: "ng-mynotes-note-delete" });
    deleteButton.setAttribute("aria-label", `Delete ${file.basename}`);
    setIcon(deleteButton, "x");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.openDeleteOverlay(file);
    });

    row.addEventListener("click", async () => {
      await this.leaf.openFile(file);
    });
  }

  private resolveIndicatorTopic(file: TFile, activeTopic: string | null): string | null {
    if (activeTopic) {
      return activeTopic;
    }
    const topics = this.learningStorage.getEntryTopics(file);
    if (topics.length > 0) {
      return topics[0] ?? null;
    }
    return this.learningStorage.getEntryCategory(file);
  }

  private isUncategorized(file: TFile): boolean {
    const category = this.learningStorage.getEntryCategory(file);
    const topics = this.learningStorage.getEntryTopics(file);
    return !category || topics.length === 0;
  }

  private renderProgressSummary(container: HTMLElement, files: TFile[]): void {
    const total = files.length;
    const learned = files.filter((file) => this.getDisplayedComprehension(file) > 60).length;
    const average = total === 0
      ? 0
      : Math.round(files.reduce((sum, file) => sum + this.getDisplayedComprehension(file), 0) / total);
    const ratio = total === 0 ? 0 : (learned / total) * 100;
    const summary = container.createSpan({ cls: "ng-mylearning-progress-summary" });
    summary.createSpan({
      cls: `ng-mylearning-progress-count ${ratio > 70 ? "is-green" : ratio > 50 ? "is-yellow" : "is-orange"}`,
      text: `${learned}|${total}`,
    });
    const track = summary.createSpan({ cls: "ng-mylearning-average-track" });
    const fill = track.createSpan({ cls: "ng-mylearning-average-fill" });
    fill.style.width = `${average}%`;
  }

  private openNewNoteOverlay(category?: string | null, topic?: string | null): void {
    const { card, close } = openOverlay("Create A Note");
    card.createDiv({ cls: "ng-overlay-subtitle", text: "Write down a name" });

    if (category || topic) {
      const parts: string[] = [];
      if (category) {
        parts.push(`Category: ${category}`);
      }
      if (topic) {
        parts.push(`Topic: ${topic}`);
      }
      card.createDiv({ cls: "ng-overlay-text", text: parts.join(" | ") });
    }

    const input = card.createEl("input", { type: "text", placeholder: "Note name..." });
    input.addClass("ng-task-input");

    const typeControl = card.createDiv({ cls: "ng-mylearning-type-control" });
    const markdownButton = typeControl.createEl("button", { text: "Markdown", cls: "is-active" });
    const canvasButton = typeControl.createEl("button", { text: "Canvas" });
    let fileType: "markdown" | "canvas" = "markdown";
    const setFileType = (next: "markdown" | "canvas") => {
      fileType = next;
      markdownButton.toggleClass("is-active", next === "markdown");
      canvasButton.toggleClass("is-active", next === "canvas");
    };
    markdownButton.addEventListener("click", () => setFileType("markdown"));
    canvasButton.addEventListener("click", () => setFileType("canvas"));

    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        errorEl.setText(validationError);
        errorEl.show();
        return;
      }
      if (this.learningStorage.noteExists(name)) {
        errorEl.setText("A note or canvas with this name already exists.");
        errorEl.show();
        input.focus();
        return;
      }

      const topics = topic ? [topic] : [];

      if (fileType === "canvas" && (!category || !topic)) {
        errorEl.setText("Select a category and topic before creating a canvas.");
        errorEl.show();
        return;
      }

      const file = fileType === "canvas"
        ? await this.learningStorage.createCanvas(name, category, topic)
        : await this.learningStorage.createNote(name, category ?? null, topics);
      close();
      if (!file) {
        new Notice("Could not create the note. Try a different name.");
        return;
      }

      await this.leaf.openFile(file);
    };

    createButton.addEventListener("click", () => void submit());
    input.addEventListener("input", () => {
      const validationError = getNameValidationError(input.value);
      errorEl.toggle(validationError !== null);
      errorEl.setText(validationError ?? "");
      createButton.disabled = validationError !== null;
    });
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
    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = input.value.trim();
      if (!name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        errorEl.setText(validationError);
        errorEl.show();
        return;
      }
      await this.learningStorage.addCategory(name);
      close();
      this.selectedCategory = name.trim();
      this.selectedTopic = null;
      this.notifySelectionChange();
      await this.render();
    };

    createButton.addEventListener("click", () => void submit());
    input.addEventListener("input", () => {
      const validationError = getNameValidationError(input.value);
      errorEl.toggle(validationError !== null);
      errorEl.setText(validationError ?? "");
      createButton.disabled = validationError !== null;
    });
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

    const colorRow = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    const pickedColor = "#ec9a63";
    const nameInput = colorRow.createEl("input", { type: "text", placeholder: "Topic name..." });
    nameInput.addClass("ng-task-input");
    const colorWrap = colorRow.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = colorWrap.createEl("input", { type: "color", value: pickedColor });
    colorInput.addClass("ng-mylearning-color-input");
    const colorSwatch = colorWrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    colorSwatch.style.setProperty("--ng-mylearning-picked-color", pickedColor);
    colorSwatch.setAttribute("role", "button");
    colorSwatch.setAttribute("tabindex", "0");
    colorSwatch.setAttribute("aria-label", "Choose topic color");
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

    const errorEl = card.createDiv({ cls: "ng-overlay-error" });
    errorEl.hide();

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const createButton = actions.createEl("button", { text: "Create", cls: "ng-overlay-confirm" });

    const submit = async () => {
      const name = nameInput.value.trim();
      if (!name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        errorEl.setText(validationError);
        errorEl.show();
        return;
      }
      await this.learningStorage.addTopic(category, name, colorInput.value);
      close();
      this.selectedTopic = name.trim();
      this.notifySelectionChange();
      await this.render();
    };

    createButton.addEventListener("click", () => void submit());
    nameInput.addEventListener("input", () => {
      const validationError = getNameValidationError(nameInput.value);
      errorEl.toggle(validationError !== null);
      errorEl.setText(validationError ?? "");
      createButton.disabled = validationError !== null;
    });
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

  private openCategoryEditActions(category: string): void {
    const { card, close } = openOverlay(`Edit Category`);
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

  private openTopicEditActions(category: string, topic: string): void {
    const { card, close } = openOverlay(`Edit Topic`);
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${category} | ${topic}` });

    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const colorButton = actions.createEl("button", { text: "Color", cls: "ng-overlay-confirm" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    renameButton.addEventListener("click", () => {
      close();
      this.openRenameTopicOverlay(category, topic);
    });
    colorButton.addEventListener("click", () => {
      close();
      this.openRecolorTopicOverlay(category, topic);
    });
    deleteButton.addEventListener("click", () => {
      close();
      this.openDeleteTopicOverlay(category, topic);
    });
    cancelButton.addEventListener("click", () => close());
  }

  private openRecolorTopicOverlay(category: string, topic: string): void {
    const { card, close } = openOverlay("Topic Color");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: `${category} | ${topic}` });

    const row = card.createDiv({ cls: "ng-mylearning-category-color-row" });
    row.addClass("is-centered");
    const wrap = row.createDiv({ cls: "ng-mylearning-category-color-wrap" });
    const colorInput = wrap.createEl("input", { type: "color", value: this.learningStorage.getTopicColor(category, topic) });
    colorInput.addClass("ng-mylearning-color-input");
    const swatch = wrap.createSpan({ cls: "ng-mylearning-color-swatch" });
    swatch.style.setProperty("--ng-mylearning-picked-color", colorInput.value);
    swatch.setAttribute("role", "button");
    swatch.setAttribute("tabindex", "0");
    swatch.setAttribute("aria-label", "Choose topic color");
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
      const success = await this.learningStorage.setTopicColor(category, topic, colorInput.value);
      if (!success) {
        new Notice("Could not update topic color.");
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

  private openRenameCategoryOverlay(previousCategory: string): void {
    const { card, close } = openOverlay("Rename Category");
    const input = card.createEl("input", { type: "text", value: previousCategory, placeholder: "New category name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const nextCategory = input.value.trim();
      const success = await this.learningStorage.renameCategory(previousCategory, nextCategory);
      if (!success) {
        new Notice("Could not rename category. Check the new name and try again.");
        return;
      }
      if (this.selectedCategory === previousCategory) {
        this.selectedCategory = nextCategory;
        this.selectedTopic = null;
        this.notifySelectionChange();
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

  private openDeleteCategoryOverlay(category: string): void {
    const { card, close } = openOverlay("Delete Category");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete category \"${category}\" and remove it from all notes?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const success = await this.learningStorage.deleteCategory(category);
      if (!success) {
        new Notice("Could not delete category.");
        return;
      }
      if (this.selectedCategory === category) {
        this.selectedCategory = null;
        this.selectedTopic = null;
        this.notifySelectionChange();
      }
      this.editMode = null;
      close();
      await this.render();
    };

    deleteButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
  }

  private openRenameTopicOverlay(category: string, previousTopic: string): void {
    const { card, close } = openOverlay("Rename Topic");
    card.addClass("ng-mylearning-edit-overlay-wide");
    card.createDiv({ cls: "ng-overlay-subtitle", text: category });
    const input = card.createEl("input", { type: "text", value: previousTopic, placeholder: "New topic name..." });
    input.addClass("ng-task-input");
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const renameButton = actions.createEl("button", { text: "Rename", cls: "ng-overlay-confirm" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const nextTopic = input.value.trim();
      const success = await this.learningStorage.renameTopic(category, previousTopic, nextTopic);
      if (!success) {
        new Notice("Could not rename topic. Check the new name and try again.");
        return;
      }
      if (this.selectedTopic === previousTopic) {
        this.selectedTopic = nextTopic;
        this.notifySelectionChange();
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

  private openDeleteTopicOverlay(category: string, topic: string): void {
    const { card, close } = openOverlay("Delete Topic");
    card.createDiv({ cls: "ng-overlay-text", text: `Delete topic \"${topic}\" and remove it from all notes in ${category}?` });
    const actions = card.createDiv({ cls: "ng-overlay-actions" });
    const deleteButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });
    const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });

    const submit = async () => {
      const success = await this.learningStorage.deleteTopic(category, topic);
      if (!success) {
        new Notice("Could not delete topic.");
        return;
      }
      if (this.selectedTopic === topic) {
        this.selectedTopic = null;
        this.notifySelectionChange();
      }
      this.editMode = null;
      close();
      await this.render();
    };

    deleteButton.addEventListener("click", () => void submit());
    cancelButton.addEventListener("click", () => close());
  }
}
