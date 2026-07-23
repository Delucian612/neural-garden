import { App, MarkdownView, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import { SUPPORT_CATEGORIES } from "./constants";
import { MyNotesStorage } from "./myNotesStorage";

export class NoteHeaderManager {
  constructor(
    private readonly app: App,
    private readonly myNotesStorage: MyNotesStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyNotesView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
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
      if (!file || !this.myNotesStorage.isNoteFile(file)) {
        existing?.remove();
        continue;
      }
      if (existing instanceof HTMLElement && existing.getAttribute("data-path") === file.path) {
        continue;
      }
      existing?.remove();
      void this.renderHeader(content, leaf, file);
    }
  }

  detachAll(): void {
    document.querySelectorAll(".ng-note-header").forEach((el) => el.remove());
  }

  private async renderHeader(content: HTMLElement, leaf: WorkspaceLeaf, file: TFile): Promise<void> {
    const header = document.createElement("div");
    header.className = "ng-note-header";
    header.setAttribute("data-path", file.path);
    content.prepend(header);

    const navColumn = header.createDiv({ cls: "ng-note-header-nav" });
    const homeButton = navColumn.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
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
    await this.renderCategoryPills(pillRow, file);

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
      await this.renderCategoryPills(pillRow, file, name);
    };
    addInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submitNewCategory();
      }
    });

    const supportSection = box.createDiv({ cls: "ng-note-header-support" });
    const supportToggle = supportSection.createDiv({ cls: "ng-note-header-support-label" });
    supportToggle.setText("Support Note");
    supportToggle.setAttribute("role", "button");
    supportToggle.setAttribute("tabindex", "0");
    supportSection.createDiv({
      cls: "ng-note-header-support-hint",
      text: "Press the above Support note to show support categories",
    });
    let supportActive = this.myNotesStorage.isSupportNote(file);
    supportToggle.toggleClass("is-active", supportActive);
    const supportHint = supportSection.querySelector(".ng-note-header-support-hint");
    if (supportHint instanceof HTMLElement) {
      supportHint.toggleClass("is-hidden", supportActive);
    }

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
    } else {
      supportPillRow.hide();
    }

    const toggleSupport = async () => {
      supportActive = !supportActive;
      supportToggle.toggleClass("is-active", supportActive);
      if (supportHint instanceof HTMLElement) {
        supportHint.toggleClass("is-hidden", supportActive);
      }
      await this.myNotesStorage.setSupportNote(file, supportActive);
      if (supportActive) {
        renderSupportPills();
        supportPillRow.show();
      } else {
        supportPillRow.hide();
      }
    };

    supportToggle.addEventListener("click", () => {
      void toggleSupport();
    });
    supportToggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void toggleSupport();
      }
    });
  }

  private async renderCategoryPills(pillRow: HTMLElement, file: TFile, ensureCategory?: string): Promise<void> {
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
}
