import { App, MarkdownView, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import { SUPPORT_CATEGORIES } from "./constants";
import { MyLearningStorage } from "./myLearningStorage";
import { MyNotesStorage } from "./myNotesStorage";
import { getNameValidationError } from "./nameValidation";
import { openOverlay } from "./overlay";

export class NoteHeaderManager {
  private readonly headerDisposers = new WeakMap<HTMLElement, () => void>();

  constructor(
    private readonly app: App,
    private readonly myNotesStorage: MyNotesStorage,
    private readonly myLearningStorage: MyLearningStorage,
    private readonly openHomeView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyNotesView: (makeActive: boolean, targetLeaf?: WorkspaceLeaf) => Promise<void>,
    private readonly openMyLearningView: (
      makeActive: boolean,
      targetLeaf?: WorkspaceLeaf,
      selectedCategory?: string,
      selectedTopic?: string,
    ) => Promise<void>,
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
        this.disposeHeader(existing);
        existing?.remove();
        content.removeClass("ng-mynotes-header-host");
        continue;
      }

      const isMyNotesFile = this.myNotesStorage.isNoteFile(file);
      const isMyLearningFile = this.myLearningStorage.isLearningNoteFile(file);
      if (!isMyNotesFile && !isMyLearningFile) {
        this.disposeHeader(existing);
        existing?.remove();
        content.removeClass("ng-mynotes-header-host");
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

      this.disposeHeader(existing);
      existing?.remove();
      if (isMyNotesFile) {
        void this.renderMyNotesHeader(content, leaf, file);
      } else if (isMyLearningFile) {
        void this.renderMyLearningHeader(content, leaf, file);
      } else {
        content.removeClass("ng-mynotes-header-host");
      }
    }
    this.syncCanvasNavigation();
  }

  detachAll(): void {
    document.querySelectorAll(".ng-note-header, .ng-learning-canvas-controls").forEach((el) => {
      this.disposeHeader(el);
      el.remove();
    });
  }

  private syncCanvasNavigation(): void {
    const canvasLeaves = this.app.workspace.getLeavesOfType("canvas");
    const activeContainers = new Set<HTMLElement>();

    for (const leaf of canvasLeaves) {
      const container = leaf.view.containerEl;
      activeContainers.add(container);
      const state = leaf.getViewState().state;
      const path = typeof state?.file === "string" ? state.file : "";
      const file = path ? this.app.vault.getAbstractFileByPath(path) : null;
      const selection = file instanceof TFile ? this.myLearningStorage.getCanvasSelection(file) : null;
      const existing = container.querySelector<HTMLElement>(":scope > .ng-learning-canvas-controls");

      if (!selection) {
        existing?.remove();
        continue;
      }
      if (existing?.dataset.path === file.path) {
        const fill = existing.querySelector<HTMLElement>(".ng-learning-progress-fill");
        if (fill) {
          fill.style.width = `${selection.progress}%`;
        }
        continue;
      }
      existing?.remove();

      const controls = container.createDiv({ cls: "ng-learning-canvas-controls" });
      controls.dataset.path = file.path;
      const button = controls.createEl("button", {
        cls: "ng-learning-canvas-back",
        text: "\u2190 MyLearning",
      });
      button.setAttribute("aria-label", "Back to MyLearning");
      button.addEventListener("click", async () => {
        await this.openMyLearningView(true, leaf, selection.category, selection.topic);
      });

      const progress = controls.createDiv({ cls: "ng-learning-canvas-progress" });
      progress.createSpan({ text: "Progress" });
      const progressTrack = progress.createDiv({ cls: "ng-learning-progress-track" });
      const progressFill = progressTrack.createDiv({ cls: "ng-learning-progress-fill" });
      let currentProgress = selection.progress;
      const syncProgress = (clientX: number) => {
        const rect = progressTrack.getBoundingClientRect();
        if (rect.width <= 0) {
          return;
        }
        currentProgress = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
        progressFill.style.width = `${currentProgress}%`;
      };
      progressFill.style.width = `${currentProgress}%`;

      let dragging = false;
      progressTrack.addEventListener("pointerdown", (event) => {
        dragging = true;
        progressTrack.setPointerCapture(event.pointerId);
        syncProgress(event.clientX);
        void this.myLearningStorage.setCanvasProgress(file, currentProgress);
      });
      progressTrack.addEventListener("pointermove", (event) => {
        if (!dragging) {
          return;
        }
        syncProgress(event.clientX);
        void this.myLearningStorage.setCanvasProgress(file, currentProgress);
      });
      progressTrack.addEventListener("pointerup", async (event) => {
        if (!dragging) {
          return;
        }
        dragging = false;
        progressTrack.releasePointerCapture(event.pointerId);
        await this.myLearningStorage.setCanvasProgress(file, currentProgress);
      });

      this.focusCanvasOrigin(leaf.view);
    }

    document.querySelectorAll<HTMLElement>(".ng-learning-canvas-controls").forEach((controls) => {
      if (!activeContainers.has(controls.parentElement as HTMLElement)) {
        controls.remove();
      }
    });
  }

  private focusCanvasOrigin(view: unknown): void {
    const canvas = (view as {
      canvas?: {
        zoomToBbox?: (bbox: { minX: number; minY: number; maxX: number; maxY: number }) => void;
        setViewport?: (...args: unknown[]) => void;
      };
    }).canvas;
    if (!canvas) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (typeof canvas.zoomToBbox === "function") {
        canvas.zoomToBbox({ minX: -500, minY: -350, maxX: 500, maxY: 350 });
        return;
      }
      if (typeof canvas.setViewport === "function") {
        if (canvas.setViewport.length >= 3) {
          canvas.setViewport(0, 0, 1);
        } else {
          canvas.setViewport({ x: 0, y: 0, zoom: 1 });
        }
      }
    });
  }

  private disposeHeader(header: Element | null): void {
    if (!(header instanceof HTMLElement)) {
      return;
    }
    this.headerDisposers.get(header)?.();
    this.headerDisposers.delete(header);
  }

  private resolveScrollHost(content: HTMLElement): HTMLElement {
    const cmScroller = content.querySelector(".markdown-source-view.mod-cm6 .cm-scroller");
    if (cmScroller instanceof HTMLElement) {
      return cmScroller;
    }
    return content;
  }

  private bindMyNotesCollapseBehavior(content: HTMLElement, header: HTMLElement): () => void {
    const scrollHost = this.resolveScrollHost(content);
    const stage = header.querySelector(".ng-note-header-stage");
    const fullHeader = header.querySelector(".ng-note-header-full");
    const compactHeader = header.querySelector(".ng-note-header-collapsed-summary");
    let lastTop = scrollHost.scrollTop;
    let collapsed = false;
    let lastTouchY: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const syncStageHeights = () => {
      if (!(stage instanceof HTMLElement) || !(fullHeader instanceof HTMLElement) || !(compactHeader instanceof HTMLElement)) {
        return;
      }
      const fullHeight = Math.ceil(fullHeader.scrollHeight);
      const compactHeight = Math.ceil(compactHeader.scrollHeight);
      stage.style.setProperty("--ng-note-header-full-height", `${fullHeight}px`);
      stage.style.setProperty("--ng-note-header-compact-height", `${compactHeight}px`);
    };

    const setCollapsed = (value: boolean) => {
      if (collapsed === value) {
        return;
      }
      collapsed = value;
      header.toggleClass("is-collapsed", value);
    };

    const syncFromScroll = () => {
      const top = scrollHost.scrollTop;
      if (top <= 2) {
        if (top < lastTop) {
          setCollapsed(false);
        } else if (top > lastTop) {
          setCollapsed(true);
        }
      } else if (top > lastTop) {
        setCollapsed(true);
      }
      lastTop = top;
      header.toggleClass("is-away-from-top", top > 2);
    };

    const onScroll = () => {
      syncFromScroll();
    };

    const onWheel = (event: WheelEvent) => {
      if (collapsed && scrollHost.scrollTop <= 2 && event.deltaY < 0) {
        setCollapsed(false);
        return;
      }
      if (!collapsed && event.deltaY > 0 && !event.ctrlKey && event.cancelable) {
        const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? scrollHost.clientHeight
            : 1;
        event.preventDefault();
        setCollapsed(true);
        scrollHost.scrollBy({ top: event.deltaY * deltaScale * 0.5, behavior: "auto" });
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY;
      if (touchY === undefined || lastTouchY === null) {
        return;
      }
      if (collapsed && scrollHost.scrollTop <= 2 && touchY > lastTouchY + 4) {
        setCollapsed(false);
      }
      lastTouchY = touchY;
    };

    const onTouchEnd = () => {
      lastTouchY = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.target instanceof Element && event.target.closest(".ng-note-header")) {
        return;
      }
      const key = event.key;
      const isTypingKey = key.length === 1
        || key === "Backspace"
        || key === "Delete"
        || key === "Enter"
        || key === "ArrowUp"
        || key === "ArrowDown"
        || key === "ArrowLeft"
        || key === "ArrowRight";
      if (!isTypingKey) {
        return;
      }
      setCollapsed(true);
    };

    syncFromScroll();
    syncStageHeights();
    if (
      typeof ResizeObserver !== "undefined"
      && fullHeader instanceof HTMLElement
      && compactHeader instanceof HTMLElement
    ) {
      resizeObserver = new ResizeObserver(() => {
        syncStageHeights();
      });
      resizeObserver.observe(fullHeader);
      resizeObserver.observe(compactHeader);
    }
    scrollHost.addEventListener("scroll", onScroll, { passive: true });
    scrollHost.addEventListener("wheel", onWheel, { passive: false });
    scrollHost.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollHost.addEventListener("touchmove", onTouchMove, { passive: true });
    scrollHost.addEventListener("touchend", onTouchEnd, { passive: true });
    content.addEventListener("keydown", onKeyDown, true);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      scrollHost.removeEventListener("scroll", onScroll);
      scrollHost.removeEventListener("wheel", onWheel);
      scrollHost.removeEventListener("touchstart", onTouchStart);
      scrollHost.removeEventListener("touchmove", onTouchMove);
      scrollHost.removeEventListener("touchend", onTouchEnd);
      content.removeEventListener("keydown", onKeyDown, true);
    };
  }

  private async renderMyNotesHeader(content: HTMLElement, leaf: WorkspaceLeaf, file: TFile): Promise<void> {
    this.disposeHeader(content.querySelector(":scope > .ng-note-header"));
    content.addClass("ng-mynotes-header-host");

    const header = document.createElement("div");
    header.className = "ng-note-header";
    header.setAttribute("data-path", file.path);
    header.setAttribute("data-kind", "mynotes");
    content.prepend(header);

    const scrollHost = this.resolveScrollHost(content);

    const navRow = header.createDiv({ cls: "ng-note-header-top" });
    const navLeft = navRow.createDiv({ cls: "ng-note-header-top-left" });
    const collapsedName = navRow.createEl("h4", { cls: "ng-note-header-note-name", text: file.basename });
    const navRight = navRow.createDiv({ cls: "ng-note-header-top-right" });

    const myNotesButton = navLeft.createEl("button", { text: "\u2190 MyNotes", cls: "ng-journal-nav-button" });
    myNotesButton.addEventListener("click", async () => {
      await this.openMyNotesView(true, leaf);
    });

    const homeButton = navRight.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, leaf);
    });

    const stage = header.createDiv({ cls: "ng-note-header-stage" });
    const collapsedSummary = stage.createDiv({ cls: "ng-note-header-collapsed-summary" });
    const collapsedCategories = collapsedSummary.createDiv({ cls: "ng-note-header-collapsed-categories" });
    const collapsedControls = collapsedSummary.createDiv({ cls: "ng-note-header-collapsed-controls" });
    const toTopButton = collapsedControls.createEl("button", { cls: "ng-note-header-to-top" });
    toTopButton.setAttribute("aria-label", "Back to top");
    toTopButton.setAttribute("title", "Back to top");
    toTopButton.setText("↑");
    toTopButton.addEventListener("click", () => {
      scrollHost.scrollTo({ top: 0, behavior: "smooth" });
    });

    const fullHeader = stage.createDiv({ cls: "ng-note-header-full" });
    fullHeader.createDiv({ cls: "ng-note-header-spacer" });
    const box = fullHeader.createDiv({ cls: "ng-note-header-box" });

    const syncCollapsedSummary = async () => {
      collapsedCategories.empty();
      const activeCategories = await this.myNotesStorage.getNoteCategoriesFresh(file);
      const activeSupport = await this.myNotesStorage.getNoteSupportsFresh(file);

      if (activeCategories.length === 0 && activeSupport.length === 0) {
        collapsedCategories.createDiv({ cls: "ng-note-header-collapsed-empty", text: "No categories" });
        return;
      }

      for (const category of activeCategories) {
        collapsedCategories.createSpan({ cls: "ng-note-header-mini-pill", text: category });
      }
      for (const support of activeSupport) {
        const supportPill = collapsedCategories.createSpan({ cls: "ng-note-header-mini-pill ng-note-header-mini-pill-support", text: support });
        const supportEntry = SUPPORT_CATEGORIES.find((entry) => entry.name === support);
        if (supportEntry) {
          supportPill.style.setProperty("--ng-support-color", supportEntry.color);
        }
      }
    };

    await syncCollapsedSummary();

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
    const syncFavouriteButtons = (isFavourite: boolean) => {
      favouriteButton.toggleClass("is-favourite", isFavourite);
    };
    syncFavouriteButtons(this.myNotesStorage.isFavourite(file));
    favouriteButton.addEventListener("click", async () => {
      const nowFavourite = await this.myNotesStorage.toggleFavourite(file);
      syncFavouriteButtons(nowFavourite);
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
    await this.renderMyNotesCategoryPills(pillRow, file, undefined, syncCollapsedSummary);

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
      await this.renderMyNotesCategoryPills(pillRow, file, name, () => void syncCollapsedSummary());
      void syncCollapsedSummary();
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
          void syncCollapsedSummary();
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
      void syncCollapsedSummary();
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

    const disposeCollapseBehavior = this.bindMyNotesCollapseBehavior(content, header);
    this.headerDisposers.set(header, () => {
      disposeCollapseBehavior();
      content.removeClass("ng-mynotes-header-host");
    });
  }

  private async renderMyLearningHeader(content: HTMLElement, leaf: WorkspaceLeaf, file: TFile): Promise<void> {
    this.disposeHeader(content.querySelector(":scope > .ng-note-header"));
    content.addClass("ng-mynotes-header-host");

    const header = document.createElement("div");
    header.className = "ng-note-header ng-learning-note-header";
    header.setAttribute("data-path", file.path);
    header.setAttribute("data-kind", "mylearning");
    content.prepend(header);

    const scrollHost = this.resolveScrollHost(content);
    const navRow = header.createDiv({ cls: "ng-note-header-top" });
    const leftNav = navRow.createDiv({ cls: "ng-note-header-top-left" });
    navRow.createEl("h4", { cls: "ng-note-header-note-name", text: file.basename });
    const rightNav = navRow.createDiv({ cls: "ng-note-header-top-right" });

    const backButton = leftNav.createEl("button", { text: "\u2190 MyLearning", cls: "ng-journal-nav-button" });
    backButton.addEventListener("click", async () => {
      const selectedCategory = this.myLearningStorage.getNoteCategory(file) ?? undefined;
      const selectedTopic = this.myLearningStorage.getNoteTopics(file)[0];
      await this.openMyLearningView(true, leaf, selectedCategory, selectedTopic);
    });

    const homeButton = rightNav.createEl("button", { text: "Home", cls: "ng-journal-nav-button" });
    homeButton.addEventListener("click", async () => {
      await this.openHomeView(true, leaf);
    });

    const stage = header.createDiv({ cls: "ng-note-header-stage" });
    const collapsedSummary = stage.createDiv({ cls: "ng-note-header-collapsed-summary ng-learning-collapsed-summary" });
    const collapsedRow = collapsedSummary.createDiv({ cls: "ng-learning-collapsed-row" });
    const collapsedCategory = collapsedRow.createDiv({ cls: "ng-learning-collapsed-category" });
    const collapsedTopics = collapsedRow.createDiv({ cls: "ng-note-header-collapsed-categories" });
    const collapsedProgress = collapsedRow.createDiv({ cls: "ng-learning-progress-wrap ng-learning-progress-wrap-compact" });
    const collapsedProgressTrack = collapsedProgress.createDiv({ cls: "ng-learning-progress-track" });
    const collapsedProgressFill = collapsedProgressTrack.createDiv({ cls: "ng-learning-progress-fill" });
    const collapsedControls = collapsedRow.createDiv({ cls: "ng-note-header-collapsed-controls" });
    const toTopButton = collapsedControls.createEl("button", { cls: "ng-note-header-to-top" });
    toTopButton.setAttribute("aria-label", "Back to top");
    toTopButton.setAttribute("title", "Back to top");
    toTopButton.setText("↑");
    toTopButton.addEventListener("click", () => {
      scrollHost.scrollTo({ top: 0, behavior: "smooth" });
    });

    const fullHeader = stage.createDiv({ cls: "ng-note-header-full" });
    const box = fullHeader.createDiv({ cls: "ng-note-header-box ng-learning-note-box" });

    const categoryHeading = box.createEl("h3", { cls: "ng-learning-topic-heading" });
    let currentCategory = this.myLearningStorage.getNoteCategory(file);
    const syncCategoryHeading = () => {
      const text = currentCategory ?? "Assign a Category";
      categoryHeading.setText(text);
      categoryHeading.toggleClass("is-placeholder", !currentCategory);
      collapsedCategory.setText(`${text}:`);
      collapsedCategory.toggleClass("is-placeholder", !currentCategory);
    };
    syncCategoryHeading();

    const categoriesHeader = box.createDiv({ cls: "ng-note-header-categories-row" });
    const categoriesLeft = categoriesHeader.createDiv({ cls: "ng-learning-categories-left" });
    categoriesLeft.createEl("h4", { text: "Topics", cls: "ng-mynotes-section-title" });

    const addButton = categoriesLeft.createEl("button", { cls: "ng-note-header-add-category-icon" });
    addButton.setAttribute("aria-label", "Add Topic");
    addButton.setAttribute("title", "Add Topic");

    const addRow = box.createDiv({ cls: "ng-note-header-add-row" });
    addRow.hide();
    const addInput = addRow.createEl("input", { type: "text", placeholder: "Topic name..." });
    addInput.addClass("ng-task-input");
    const addError = addRow.createDiv({ cls: "ng-overlay-error ng-note-header-input-error" });
    addError.hide();

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

    let displayedTopics = this.myLearningStorage.getNoteTopics(file);
    const syncCollapsedTopics = () => {
      collapsedTopics.empty();
      if (displayedTopics.length === 0) {
        collapsedTopics.createDiv({ cls: "ng-note-header-collapsed-empty", text: "No topics" });
        return;
      }
      for (const topic of displayedTopics) {
        const compactPill = collapsedTopics.createSpan({ cls: "ng-note-header-mini-pill", text: topic });
        compactPill.style.setProperty(
          "--ng-mylearning-category-color",
          this.myLearningStorage.getTopicColor(currentCategory ?? "", topic),
        );
      }
    };

    const renderLearningTopicPills = async (ensureTopic?: string): Promise<void> => {
      pillRow.empty();
      if (!currentCategory) {
        pillRow.createDiv({ cls: "ng-empty", text: "Assign a category first." });
        return;
      }

      const topics = await this.myLearningStorage.listTopicsForCategory(currentCategory);
      if (ensureTopic && !topics.includes(ensureTopic)) {
        topics.push(ensureTopic);
      }

      const active = this.myLearningStorage.getNoteTopics(file);
      if (ensureTopic && !active.includes(ensureTopic)) {
        active.push(ensureTopic);
      }
      displayedTopics = [...active];

      if (topics.length === 0) {
        pillRow.createDiv({ cls: "ng-empty", text: "No topics yet." });
        return;
      }

      for (const topic of topics) {
        const pill = pillRow.createEl("button", { cls: "ng-mynotes-pill ng-note-header-category-pill" });
        pill.style.setProperty("--ng-mylearning-category-color", this.myLearningStorage.getTopicColor(currentCategory, topic));
        pill.createSpan({ text: topic });
        pill.toggleClass("is-active", active.includes(topic));
        pill.addEventListener("click", async () => {
          const nowActive = await this.myLearningStorage.toggleNoteTopic(file, topic);
          pill.toggleClass("is-active", nowActive);
          displayedTopics = nowActive
            ? [...displayedTopics, topic].filter((entry, index, topics) => topics.indexOf(entry) === index)
            : displayedTopics.filter((entry) => entry !== topic);
          syncCollapsedTopics();
        });
      }
      syncCollapsedTopics();
    };

    updateAddButton();
    syncCollapsedTopics();
    await renderLearningTopicPills();

    const submitNewTopic = async () => {
      if (!currentCategory) {
        await this.openCategoryPicker(file, async (category) => {
          currentCategory = category;
          syncCategoryHeading();
          await renderLearningTopicPills();
        });
      }

      const name = addInput.value.trim();
      if (!currentCategory || !name) {
        return;
      }
      const validationError = getNameValidationError(name);
      if (validationError) {
        addError.setText(validationError);
        addError.show();
        return;
      }

      await this.myLearningStorage.addTopic(currentCategory, name);
      const active = this.myLearningStorage.getNoteTopics(file);
      if (!active.includes(name)) {
        await this.myLearningStorage.toggleNoteTopic(file, name);
      }

      addInput.value = "";
      addRow.hide();
      updateAddButton();
      await renderLearningTopicPills(name);
    };

    addInput.addEventListener("input", updateAddButton);
    addInput.addEventListener("input", () => {
      const validationError = getNameValidationError(addInput.value);
      addError.toggle(validationError !== null);
      addError.setText(validationError ?? "");
    });
    addInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void submitNewTopic();
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
        void submitNewTopic();
      } else {
        addRow.hide();
        updateAddButton();
      }
    });

    categoryHeading.addEventListener("click", () => {
      void this.openCategoryPicker(file, async (category) => {
        currentCategory = category;
        syncCategoryHeading();
        await renderLearningTopicPills();
      });
    });

    const progressWrap = box.createDiv({ cls: "ng-learning-progress-wrap" });
    const progressTrack = progressWrap.createDiv({ cls: "ng-learning-progress-track" });
    const progressFill = progressTrack.createDiv({ cls: "ng-learning-progress-fill" });

    let currentComprehension = this.myLearningStorage.getComprehension(file);
    const syncProgressValue = (value: number) => {
      currentComprehension = Math.max(0, Math.min(100, Math.round(value)));
      progressFill.style.width = `${currentComprehension}%`;
      collapsedProgressFill.style.width = `${currentComprehension}%`;
    };

    syncProgressValue(currentComprehension);

    const bindProgressTrack = (track: HTMLElement): void => {
      const updateFromPointer = (clientX: number): void => {
        const rect = track.getBoundingClientRect();
        if (rect.width <= 0) {
          return;
        }
        syncProgressValue(((clientX - rect.left) / rect.width) * 100);
      };

      let dragging = false;
      track.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        dragging = true;
        track.setPointerCapture(event.pointerId);
        updateFromPointer(event.clientX);
        void this.myLearningStorage.setComprehension(file, currentComprehension);
      });
      track.addEventListener("pointermove", (event) => {
        if (!dragging) {
          return;
        }
        updateFromPointer(event.clientX);
        void this.myLearningStorage.setComprehension(file, currentComprehension);
      });
      track.addEventListener("pointerup", async (event) => {
        if (!dragging) {
          return;
        }
        dragging = false;
        track.releasePointerCapture(event.pointerId);
        await this.myLearningStorage.setComprehension(file, currentComprehension);
      });
    };

    bindProgressTrack(progressTrack);
    bindProgressTrack(collapsedProgressTrack);

    const disposeCollapseBehavior = this.bindMyNotesCollapseBehavior(content, header);
    this.headerDisposers.set(header, () => {
      disposeCollapseBehavior();
      content.removeClass("ng-mynotes-header-host");
    });
  }

  private async renderMyNotesCategoryPills(
    pillRow: HTMLElement,
    file: TFile,
    ensureCategory?: string,
    onToggle?: () => void,
  ): Promise<void> {
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
        onToggle?.();
      });
    }
  }

  private async openCategoryPicker(file: TFile, onSelect: (category: string) => Promise<void>): Promise<void> {
    const categories = await this.myLearningStorage.listCategories();
    const { card, close } = openOverlay("Assign Category");

    if (categories.length === 0) {
      card.createDiv({ cls: "ng-empty", text: "No categories yet. Create one from the MyLearning view." });
      return;
    }

    const row = card.createDiv({ cls: "ng-mynotes-pill-row" });
    for (const category of categories) {
      const button = row.createEl("button", { cls: "ng-mynotes-pill" });
      button.createSpan({ text: category });
      button.addEventListener("click", async () => {
        await this.myLearningStorage.setNoteCategory(file, category);
        close();
        await onSelect(category);
      });
    }
  }
}
