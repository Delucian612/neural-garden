import { App, MarkdownView, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import { SUPPORT_CATEGORIES } from "./constants";
import { MyLearningStorage } from "./myLearningStorage";
import { MyNotesStorage } from "./myNotesStorage";
import { openOverlay } from "./overlay";

export class NoteHeaderManager {
  constructor(
    private readonly app: App,
    private readonly myNotesStorage: MyNotesStorage,
    private readonly myLearningStorage: MyLearningStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyNotesView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyLearningView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf, selectedTopic?: string) => Promise<void>,
  ) {}

  sync(): void {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!(view instanceof MarkdownView)) {
        continue;
      }
      const content = view.containerEl.querySelector(".view-content");
      if (!(content instanceof HTMLElement)) {
        continue;
      }

      const existing = content.querySelector(":scope > .ng-note-header");
      const file = view.file;
      if (!file) {
        existing?.remove();
        continue;
      }

      const isMyNotesFile = this.myNotesStorage.isNoteFile(file);
      const isMyLearningFile = this.myLearningStorage.isLearningNoteFile(file);
      if (!isMyNotesFile && !isMyLearningFile) {
        existing?.remove();
        continue;
      }

      const headerKind = isMyNotesFile ? "mynotes" : "mylearning";
      if (
        existing instanceof HTMLElement
        && existing.getAttribute("data-path") === file.path
        && existing.getAttribute("data-kind") === headerKind
      ) {
        continue;
      }

      existing?.remove();
      if (isMyNotesFile) {
        void this.renderMyNotesHeader(content, leaf, file);
      } else {
        void this.renderMyLearningHeader(content, leaf, file);
      }
    }
  }

  detachAll(): void {
    document.querySelectorAll(".ng-note-header").forEach((el) => el.remove());
  }

  private async renderMyNotesHeader(content: HTMLElement, leaf: WorkspaceLeaf, file: TFile): Promise<void> {
    const header = document.createElement("div");
    header.className = "ng-note-header";
    header.setAttribute("data-path", file.path);
    header.setAttribute("data-kind", "mynotes");
    content.prepend(header);

    const navRow = header.createDiv({ cls: "ng-note-header-top" });
    const navLeft = navRow.createDiv({ cls: "ng-note-header-top-left" });
    const navRight = navRow.createDiv({ cls: "ng-note-header-top-right" });

    const myNotesButton = navLeft.createEl("button", { text: "\u2190 MyNotes", cls: "ng-journal-nav-button" });
    myNotesButton.addEventListener("click", async () => {
      await this.openMyNotesView(true, leaf);
    });

    const homeButton = navRight.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, leaf);
    });

    header.createDiv({ cls: "ng-note-header-spacer" });

    const box = header.createDiv({ cls: "ng-note-header-box" });

    const categoriesHeader = box.createDiv({ cls: "ng-note-header-categories-row" });
    categoriesHeader.createEl("h4", { text: "Categories", cls: "ng-mynotes-section-title" });
    const categoriesActions = categoriesHeader.createDiv({ cls: "ng-note-header-categories-actions" });
    const addButton = categoriesActions.createEl("button", { cls: "ng-note-header-add-category-icon" });
    addButton.setAttribute("aria-label", "Add Category");
    addButton.setAttribute("title", "Add Category");

    const supportButton = categoriesActions.createEl("button", { cls: "ng-note-header-support-toggle" });
    supportButton.setAttribute("aria-label", "Toggle Support Note");
    setIcon(supportButton, "shield-plus");

    const favouriteButton = categoriesActions.createEl("button", { cls: "ng-note-header-fav" });
    favouriteButton.setAttribute("aria-label", "Favourite");
    favouriteButton.setAttribute("title", "Favourite");
    setIcon(favouriteButton, "heart");
    favouriteButton.toggleClass("is-favourite", this.myNotesStorage.isFavourite(file));
    favouriteButton.addEventListener("click", async () => {
      const nowFavourite = await this.myNotesStorage.toggleFavourite(file);
      favouriteButton.toggleClass("is-favourite", nowFavourite);
      favouriteButton.removeClass("ng-heart-pop");
      void favouriteButton.offsetWidth;
      favouriteButton.addClass("ng-heart-pop");
    });

    const addRow = box.createDiv({ cls: "ng-note-header-add-row" });
    addRow.hide();
    const addInput = addRow.createEl("input", { type: "text", placeholder: "Category name..." });
    addInput.addClass("ng-task-input");

    const updateAddButton = () => {
      const open = addRow.isShown();
      const hasText = addInput.value.trim().length > 0;
      addButton.toggleClass("has-input", open && hasText);
      if (!open) {
        addButton.setText("+");
      } else if (hasText) {
        addButton.setText("\u2713");
      } else {
        addButton.setText("-");
      }
    };

    updateAddButton();
    addInput.addEventListener("input", updateAddButton);

    addButton.addEventListener("click", () => {
      if (!addRow.isShown()) {
        addRow.show();
        addInput.focus();
        updateAddButton();
        return;
      }
      if (addInput.value.trim().length > 0) {
        void submitNewCategory();
      } else {
        addRow.hide();
        updateAddButton();
      }
    });

    const pillRow = box.createDiv({ cls: "ng-mynotes-pill-row" });
    await this.renderMyNotesCategoryPills(pillRow, file);

    const submitNewCategory = async () => {
      const name = addInput.value.trim();
      if (!name) {
        return;
      }
      await this.myNotesStorage.addCategory(name);
      const active = this.myNotesStorage.getNoteCategories(file);
      if (!active.includes(name)) {
        await this.myNotesStorage.toggleNoteCategory(file, name);
      }
      addInput.value = "";
      addRow.hide();
      updateAddButton();
      await this.renderMyNotesCategoryPills(pillRow, file, name);
    };

    addInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submitNewCategory();
      }
    });

    const supportSection = box.createDiv({ cls: "ng-note-header-support" });
    supportSection.createEl("h4", { text: "Support Note", cls: "ng-mynotes-section-title" });

    let supportActive = this.myNotesStorage.isSupportNote(file);
    supportButton.toggleClass("is-active", supportActive);
    supportSection.toggleClass("is-hidden", !supportActive);

    const supportPillRow = supportSection.createDiv({ cls: "ng-mynotes-pill-row" });
    const renderSupportPills = () => {
      supportPillRow.empty();
      const active = this.myNotesStorage.getNoteSupports(file);
      for (const support of SUPPORT_CATEGORIES) {
        const pill = supportPillRow.createEl("button", { cls: "ng-mynotes-pill ng-mynotes-support-pill" });
        pill.createSpan({ text: support.name });
        pill.style.setProperty("--ng-support-color", support.color);
        pill.toggleClass("is-active", active.includes(support.name));
        pill.addEventListener("click", async () => {
          const nowActive = await this.myNotesStorage.toggleNoteSupport(file, support.name);
          pill.toggleClass("is-active", nowActive);
        });
      }
    };

    if (supportActive) {
      renderSupportPills();
    }

    const toggleSupport = async () => {
      supportActive = !supportActive;
      supportButton.toggleClass("is-active", supportActive);
      supportSection.toggleClass("is-hidden", !supportActive);
      await this.myNotesStorage.setSupportNote(file, supportActive);
      if (supportActive) {
        renderSupportPills();
      }
    };

    supportButton.addEventListener("click", () => {
      void toggleSupport();
    });
    supportButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void toggleSupport();
      }
    });
  }

  private async renderMyLearningHeader(content: HTMLElement, leaf: WorkspaceLeaf, file: TFile): Promise<void> {
    const header = document.createElement("div");
    header.className = "ng-note-header ng-learning-note-header";
    header.setAttribute("data-path", file.path);
    header.setAttribute("data-kind", "mylearning");
    content.prepend(header);

    const navRow = header.createDiv({ cls: "ng-learning-note-header-top" });
    const leftNav = navRow.createDiv({ cls: "ng-learning-note-header-top-left" });
    const rightNav = navRow.createDiv({ cls: "ng-learning-note-header-top-right" });

    const backButton = leftNav.createEl("button", { text: "\u2190 MyLearning", cls: "ng-journal-nav-button" });
    backButton.addEventListener("click", async () => {
      const selectedTopic = this.myLearningStorage.getNoteTopic(file) ?? undefined;
      await this.openMyLearningView(true, leaf, selectedTopic);
    });

    const homeButton = rightNav.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, leaf);
    });

    const deleteButton = rightNav.createEl("button", { cls: "ng-learning-delete-button" });
    deleteButton.setAttribute("aria-label", "Delete Note");
    deleteButton.setAttribute("title", "Delete Note");
    deleteButton.setText("×");
    deleteButton.addEventListener("click", async () => {
      const { card, close } = openOverlay("Delete Note");
      card.createDiv({
        cls: "ng-overlay-text",
        text: `Are you sure you want to delete "${file.basename}"?`,
      });

      const actions = card.createDiv({ cls: "ng-overlay-actions" });
      const cancelButton = actions.createEl("button", { text: "Cancel", cls: "ng-overlay-cancel" });
      const confirmButton = actions.createEl("button", { text: "Delete", cls: "ng-overlay-danger" });

      let deleting = false;
      const confirmDelete = async () => {
        if (deleting) {
          return;
        }
        deleting = true;
        await this.myLearningStorage.deleteNote(file);
        close();
        await this.openMyLearningView(true, leaf);
      };

      cancelButton.addEventListener("click", () => close());
      confirmButton.addEventListener("click", () => {
        void confirmDelete();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          void confirmDelete();
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      });
      confirmButton.focus();
    });

    const topicHeading = header.createEl("h3", { cls: "ng-learning-topic-heading" });
    let currentTopic = this.myLearningStorage.getNoteTopic(file);
    const syncTopicHeading = () => {
      topicHeading.setText(currentTopic ?? "Assign a Topic");
      topicHeading.toggleClass("is-placeholder", !currentTopic);
    };
    syncTopicHeading();

    const box = header.createDiv({ cls: "ng-note-header-box ng-learning-note-box" });

    const categoriesHeader = box.createDiv({ cls: "ng-note-header-categories-row" });
    const categoriesLeft = categoriesHeader.createDiv({ cls: "ng-learning-categories-left" });
    categoriesLeft.createEl("h4", { text: "Categories", cls: "ng-mynotes-section-title" });

    const addButton = categoriesLeft.createEl("button", { cls: "ng-note-header-add-category-icon" });
    addButton.setAttribute("aria-label", "Add Category");
    addButton.setAttribute("title", "Add Category");

    const helpButton = categoriesHeader.createEl("button", { cls: "ng-note-header-support-toggle ng-learning-help-toggle" });
    helpButton.setAttribute("aria-label", "Toggle Help");
    helpButton.setAttribute("title", "Toggle Help");
    setIcon(helpButton, "circle-question-mark");

    const addRow = box.createDiv({ cls: "ng-note-header-add-row" });
    addRow.hide();
    const addInput = addRow.createEl("input", { type: "text", placeholder: "Category name..." });
    addInput.addClass("ng-task-input");

    const pillRow = box.createDiv({ cls: "ng-mynotes-pill-row" });

    const updateAddButton = () => {
      const open = addRow.isShown();
      const hasText = addInput.value.trim().length > 0;
      addButton.toggleClass("has-input", open && hasText);
      if (!open) {
        addButton.setText("+");
      } else if (hasText) {
        addButton.setText("\u2713");
      } else {
        addButton.setText("-");
      }
    };

    const syncHelpButton = () => {
      setIcon(helpButton, "circle-question-mark");
      helpButton.toggleClass("is-active", this.myLearningStorage.isHelpEnabled(file));
    };

    const renderLearningCategoryPills = async (ensureCategory?: string): Promise<void> => {
      pillRow.empty();
      if (!currentTopic) {
        pillRow.createDiv({ cls: "ng-empty", text: "Assign a topic first." });
        return;
      }

      const categories = (await this.myLearningStorage.listCategoriesForTopic(currentTopic)).filter((name) => name !== "help");
      if (ensureCategory && !categories.includes(ensureCategory)) {
        categories.push(ensureCategory);
      }

      const active = this.myLearningStorage.getNoteCategories(file);
      if (ensureCategory && !active.includes(ensureCategory)) {
        active.push(ensureCategory);
      }

      if (categories.length === 0) {
        pillRow.createDiv({ cls: "ng-empty", text: "No categories yet." });
        return;
      }

      for (const category of categories) {
        const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-note-header-category-pill" });
        pill.style.setProperty("--ng-mylearning-category-color", this.myLearningStorage.getCategoryColor(currentTopic, category));
        pill.createSpan({ text: category });
        pill.toggleClass("is-active", active.includes(category));
        pill.addEventListener("click", async () => {
          const nowActive = await this.myLearningStorage.toggleNoteCategory(file, category);
          pill.toggleClass("is-active", nowActive);
        });
      }
    };

    updateAddButton();
    syncHelpButton();
    await renderLearningCategoryPills();

    const submitNewCategory = async () => {
      if (!currentTopic) {
        await this.openTopicPicker(file, async (topic) => {
          currentTopic = topic;
          syncTopicHeading();
          await renderLearningCategoryPills();
        });
      }

      const name = addInput.value.trim();
      if (!currentTopic || !name) {
        return;
      }

      await this.myLearningStorage.addCategory(currentTopic, name);
      const active = this.myLearningStorage.getNoteCategories(file);
      if (!active.includes(name)) {
        await this.myLearningStorage.toggleNoteCategory(file, name);
      }

      addInput.value = "";
      addRow.hide();
      updateAddButton();
      await renderLearningCategoryPills(name);
    };

    addInput.addEventListener("input", updateAddButton);
    addInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submitNewCategory();
      }
    });

    addButton.addEventListener("click", () => {
      if (!addRow.isShown()) {
        addRow.show();
        addInput.focus();
        updateAddButton();
        return;
      }

      if (addInput.value.trim().length > 0) {
        void submitNewCategory();
      } else {
        addRow.hide();
        updateAddButton();
      }
    });

    topicHeading.addEventListener("click", () => {
      void this.openTopicPicker(file, async (topic) => {
        currentTopic = topic;
        syncTopicHeading();
        await renderLearningCategoryPills();
      });
    });

    helpButton.addEventListener("click", async () => {
      const enabled = await this.myLearningStorage.toggleHelpEnabled(file);
      setIcon(helpButton, "circle-question-mark");
      helpButton.toggleClass("is-active", enabled);
      helpButton.removeClass("ng-heart-pop");
      void helpButton.offsetWidth;
      helpButton.addClass("ng-heart-pop");
    });

    const progressWrap = box.createDiv({ cls: "ng-learning-progress-wrap" });
    progressWrap.createEl("h5", { text: "Progress", cls: "ng-learning-progress-heading" });
    const progressTrack = progressWrap.createDiv({ cls: "ng-learning-progress-track" });
    const progressFill = progressTrack.createDiv({ cls: "ng-learning-progress-fill" });

    let currentComprehension = this.myLearningStorage.getComprehension(file);
    const syncProgressValue = (value: number) => {
      currentComprehension = Math.max(0, Math.min(100, Math.round(value)));
      progressFill.style.width = `${currentComprehension}%`;
    };

    syncProgressValue(currentComprehension);

    const updateFromPointer = (clientX: number): void => {
      const rect = progressTrack.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }
      const pct = ((clientX - rect.left) / rect.width) * 100;
      syncProgressValue(pct);
    };

    let dragging = false;
    progressTrack.addEventListener("pointerdown", (event) => {
      dragging = true;
      progressTrack.setPointerCapture(event.pointerId);
      updateFromPointer(event.clientX);
      void this.myLearningStorage.setComprehension(file, currentComprehension);
    });

    progressTrack.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      updateFromPointer(event.clientX);
      void this.myLearningStorage.setComprehension(file, currentComprehension);
    });

    progressTrack.addEventListener("pointerup", async (event) => {
      if (!dragging) {
        return;
      }
      dragging = false;
      progressTrack.releasePointerCapture(event.pointerId);
      await this.myLearningStorage.setComprehension(file, currentComprehension);
    });
  }

  private async renderMyNotesCategoryPills(pillRow: HTMLElement, file: TFile, ensureCategory?: string): Promise<void> {
    pillRow.empty();
    const categories = await this.myNotesStorage.loadCategories();
    if (ensureCategory && !categories.some((category) => category.name === ensureCategory)) {
      categories.push({ name: ensureCategory, count: 1 });
    }

    const active = this.myNotesStorage.getNoteCategories(file);
    if (ensureCategory && !active.includes(ensureCategory)) {
      active.push(ensureCategory);
    }

    if (categories.length === 0) {
      pillRow.createDiv({ cls: "ng-empty", text: "No categories yet." });
      return;
    }

    for (const category of categories) {
      const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-note-header-category-pill" });
      pill.createSpan({ text: category.name });
      pill.toggleClass("is-active", active.includes(category.name));
      pill.addEventListener("click", async () => {
        const nowActive = await this.myNotesStorage.toggleNoteCategory(file, category.name);
        pill.toggleClass("is-active", nowActive);
      });
    }
  }

  private async openTopicPicker(file: TFile, onSelect: (topic: string) => Promise<void>): Promise<void> {
    const topics = await this.myLearningStorage.listTopics();
    const { card, close } = openOverlay("Assign Topic");

    if (topics.length === 0) {
      card.createDiv({ cls: "ng-empty", text: "No topics yet. Create one from the MyLearning view." });
      return;
    }

    const row = card.createDiv({ cls: "ng-mynotes-pill-row" });
    for (const topic of topics) {
      const button = row.createEl("button", { cls: "ng-mynotes-pill" });
      button.createSpan({ text: topic });
      button.addEventListener("click", async () => {
        await this.myLearningStorage.setNoteTopic(file, topic);
        close();
        await onSelect(topic);
      });
    }
  }
}
