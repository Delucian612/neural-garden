import { NeuralGardenTour, TourStep } from "./onboarding";
import { OnboardingDemoSession } from "./onboardingDemo";

export type WalkthroughSection = "home" | "mynotes" | "mylearning" | "journaling";

export type WalkthroughNavigation = {
  openHome: () => Promise<void>;
  closeAllTourWindows: () => Promise<void>;
  openMyNotes: () => Promise<void>;
  openMyNotesCategory: (category: string | null) => Promise<void>;
  openMyLearning: () => Promise<void>;
  openJournaling: () => Promise<void>;
  openWeeklyRecapWeek: (year: number, week: number) => Promise<void>;
  openJournalEntry: (dateKey: string) => Promise<void>;
  openJournalingDate: (dateKey: string) => Promise<void>;
  openJournalingDemoDate: (dateKey: string) => Promise<void>;
  setBreakMode: (enabled: boolean) => Promise<void>;
  refreshHome: () => Promise<void>;
};

export type WalkthroughCallbacks = {
  onFirstRunComplete: () => void | Promise<void>;
  onFirstRunSkip: () => void | Promise<void>;
};

export class WalkthroughManager {
  private readonly tour = new NeuralGardenTour();

  constructor(
    private readonly navigation: WalkthroughNavigation,
    private readonly callbacks: WalkthroughCallbacks,
    private readonly demo: OnboardingDemoSession,
  ) {}

  get isActive(): boolean {
    return this.tour.isActive;
  }

  async startFirstRun(): Promise<void> {
    await this.demo.begin();
    await this.tour.start(this.allSteps(true), {
      label: "Introduction",
      onComplete: async () => {
        try {
          await this.navigation.closeAllTourWindows();
          await this.navigation.openHome();
          await this.callbacks.onFirstRunComplete();
        } finally {
          await this.demo.cleanup();
        }
      },
      onSkip: async () => {
        try {
          await this.navigation.closeAllTourWindows();
          await this.navigation.openHome();
          await this.callbacks.onFirstRunSkip();
        } finally {
          await this.demo.cleanup();
        }
      },
    });
  }

  async startFullReplay(): Promise<void> {
    await this.tour.start(this.allSteps(false), { label: "Full walkthrough" });
  }

  async startSection(section: WalkthroughSection): Promise<void> {
    await this.tour.start(this.stepsFor(section), {
      label: sectionLabel(section),
    });
  }

  async close(): Promise<void> {
    await this.tour.close(false);
  }

  private allSteps(interactive: boolean): TourStep[] {
    return [
      ...(interactive ? withInterface("Home", [this.welcomeStep()]) : []),
      ...withInterface("Home", this.homeSteps(interactive)),
      ...withInterface("MyNotes", this.myNotesSteps(interactive)),
      ...(interactive ? withInterface("MyNotes", this.myNotesExercise()) : []),
      ...withInterface("MyLearning", this.myLearningSteps(interactive)),
      ...(interactive ? withInterface("MyLearning", this.myLearningExercise()) : []),
      ...withInterface("Journaling", this.journalingSteps(interactive)),
      ...(interactive ? this.journalingExercise() : []),
    ];
  }

  private welcomeStep(): TourStep {
    return {
      title: "Welcome to Neural Garden",
      description: "Hello, welcome to Neural Garden. I will give you a short tour of how things work around here, explain the main areas, and let you try some of them yourself.",
      target: activeTarget(".neural-garden-home"),
      before: this.navigation.openHome,
      progressText: "Welcome",
      countInProgress: false,
      highlightMessage: true,
    };
  }

  private stepsFor(section: WalkthroughSection): TourStep[] {
    if (section === "home") {
      return withInterface("Home", this.homeSteps(false));
    }
    if (section === "mynotes") {
      return withInterface("MyNotes", this.myNotesSteps(false));
    }
    if (section === "mylearning") {
      return withInterface("MyLearning", this.myLearningSteps(false));
    }
    return withInterface("Journaling", this.journalingSteps(false));
  }

  private homeSteps(interactive: boolean): TourStep[] {
    const open = this.navigation.openHome;
    const steps: TourStep[] = [
      {
        title: "Home",
        description: "Home brings the main Neural Garden workflows together. The highlighted sections are live views of your notes, learning, journal, and current workload.",
        target: activeTarget(".neural-garden-home"),
        before: open,
      },
      {
        title: "Main sections",
        description: "These buttons take you to Journaling, MyNotes, or MyLearning. QuickNote creates a note directly in the Quick Notes category.",
        target: activeTarget(".ng-category-grid"),
      },
      {
        title: "Task energy",
        description: "Enter a task and choose the effort it will cost. The energy bar totals all created tasks, so effort stays visible before you commit to more work.",
        target: activeTarget(".ng-task-form"),
      },
      {
        title: "Current tasks",
        description: "Clicking a task completes it and records its energy for journaling. Edit changes its name, while the remove control deletes it without completing it.",
        target: activeTarget(".ng-task-list"),
        before: interactive ? async () => {
          await this.demo.seedHomeTask();
          await this.navigation.refreshHome();
        } : undefined,
      },
      {
        title: "Break Mode",
        description: "When Break mode is enabled in Settings, completed tasks build toward a forced break. During that break the Task Manager locks until its recovery timer finishes.",
        target: activeTarget(".ng-task-manager"),
      },
    ];
    if (interactive) {
      steps.push(
        {
          title: "Choose Break mode",
          description: "Would you like to use forced breaks? They work best when Neural Garden is used across a phone and a tablet or computer, and are not advised for computer-only use.",
          target: activeTarget(".ng-task-manager"),
          choices: [
            { label: "Use forced breaks", onSelect: () => this.navigation.setBreakMode(true) },
            { label: "Do not use forced breaks", onSelect: () => this.navigation.setBreakMode(false) },
          ],
        },
        {
          title: "Go to MyNotes",
          description: "Select MyNotes to continue. This is where you can create, organize, and find your personal notes.",
          target: homeButton("MyNotes"),
          interaction: { event: "click" },
        },
      );
    }
    return steps;
  }

  private myNotesSteps(interactive: boolean): TourStep[] {
    const open = this.navigation.openMyNotes;
    const steps: TourStep[] = [
      {
        title: "MyNotes",
        description: "MyNotes keeps your notes organized so they remain easy to find and revisit.",
        target: activeTarget(".ng-mynotes"),
        before: open,
      },
      {
        title: "Find notes",
        description: "Search checks note names and content. Combining search with a selected category narrows only that category's notes.",
        target: activeTarget(".ng-mynotes-search"),
      },
      {
        title: "Categories, Favourites and Quick Notes",
        description: "Category buttons filter the list. Use the plus and pencil beside Categories to create or edit categories, and use the New button to create a note.",
        target: activeTarget(".ng-mynotes-categories .ng-mynotes-section-header"),
      },
      {
        title: "Support-note filters",
        description: "These symptom pills show notes assigned to Mood, Sleep, Regulation, Stress, Anxiety, Exhaustion, Sensory Load, or Social Load support.",
        target: activeTarget(".ng-mynotes-support"),
      },
      {
        title: "How support notes work",
        description: "Open a note, enable its shield control, and assign the symptoms it can help with. Weekly Recap compares those assignments with journal patterns, then suggests matching notes and hints on Home.",
        target: activeTarget(".ng-mynotes-support"),
      },
      {
        title: "Uncategorized notes",
        description: "Notes with no category remain available here. Expand the section to find and organize files that have not been assigned yet.",
        target: activeTarget(".ng-mynotes-subheading-toggle"),
      },
    ];
    if (interactive) {
      const categoryName = `Main Category ${this.demo.nameSuffix}`;
      steps.splice(3, 0,
        {
          title: "Create a main category",
          description: "Use the plus in the main Categories section to create a category for organizing your notes.",
          target: activeTarget(".ng-mynotes-categories .ng-mylearning-inline-plus"),
          interaction: { event: "click" },
        },
        {
          title: "Name the category",
          description: "Give the category a name. Creating it also selects it, so the next note you create is assigned there automatically.",
          target: overlayTarget('input[placeholder="Category name..."]'),
          before: () => setOverlayInput('input[placeholder="Category name..."]', categoryName),
        },
        {
          title: "Create the category",
          description: "Select Create to add the category to the main category list.",
          target: overlayTarget(".ng-overlay-confirm"),
          interaction: { event: "click" },
        },
        {
          title: "Favourites and Quick Notes",
          description: "Favourites collects notes marked with a heart. Quick Notes contains notes created through Home's QuickNote button, while your custom categories appear beside them.",
          target: activeTarget(".ng-mynotes-categories .ng-mynotes-pill-row"),
        },
      );
    }
    return steps;
  }

  private myLearningSteps(interactive: boolean): TourStep[] {
    const steps: TourStep[] = [];
    if (interactive) {
      steps.push({
        title: "Go to MyLearning",
        description: "Select MyLearning to continue and explore the tools that support your learning.",
        target: homeButton("MyLearning"),
        interaction: { event: "click" },
      });
    }
    steps.push(
      {
        title: "MyLearning",
        description: "MyLearning helps you learn, whether you are exploring something new, need support with school, or want a place to work through any other subject.",
        target: activeTarget(".ng-mylearning"),
        before: interactive ? undefined : this.navigation.openMyLearning,
      },
      {
        title: "Learning search",
        description: "Search looks through note names, categories, topics, and the written content of your learning notes. Select a result to open it.",
        target: activeTarget(".ng-mylearning-search input"),
      },
      {
        title: "Daily learning",
        description: "Today's date is always highlighted. Selecting it creates today's learning note when none exists. Selecting a day with a note being present opens a pop-up where you can open the note or mark it as finished.",
        target: activeTarget(".ng-mylearning-daily-calendar"),
      },
      {
        title: "Categories",
        description: "Categories are the top level of the learning hierarchy. Their progress summaries combine comprehension from the entries assigned beneath them.",
        target: activeTarget(".ng-mylearning-topics"),
      },
      {
        title: "Topics",
        description: "Selecting a category reveals its topics. Topics narrow the visible entries and can carry their own colour and progress summary.",
        target: activeTarget(".ng-mylearning-categories", ".ng-mylearning-topics"),
      },
      {
        title: "Notes and canvases",
        description: "New notes and canvases are placed under the category and topic you selected. Open one to read or work on it and update your learning progress.",
        target: activeTarget(".ng-mylearning-notes", ".ng-mylearning"),
      },
    );
    return steps;
  }

  private journalingSteps(interactive: boolean): TourStep[] {
    const steps: TourStep[] = [];
    if (interactive) {
      steps.push({
        title: "Go to Journaling",
        description: "Return to Home and select Journaling to continue with daily entries, trackers, and Weekly Recaps.",
        target: homeButton("Journaling"),
        interaction: { event: "click" },
      });
    }
    steps.push(
      {
        title: "Journal Hub",
        description: "The Journal Hub combines daily check-ins, weekly recaps, and trackers. Its calendar is the entry point for both individual days and completed weeks.",
        target: activeTarget(".ng-journaling"),
        before: interactive ? undefined : this.navigation.openJournaling,
      },
      {
        title: "Daily entries",
        description: "New Entry opens today's check-in. A date with a dot has saved journal data; select it once for a preview and again to open the complete entry.",
        target: activeTarget(".ng-journal-calendar-panel"),
      },
      {
        title: "Weekly recaps",
        description: "The weekday headings organize daily entries, while the Week column opens Weekly Recaps. A week becomes available after enough daily entries; select it once for a preview and again to generate or open its recap.",
        target: activeTarget(".ng-journal-calendar-grid"),
      },
      {
        title: "Trackers",
        description: "Trackers record whether a habit or event occurred on each date. Add Tracker creates a named color row; journal entries let you toggle that tracker for their date.",
        target: activeTarget(".ng-journal-trackers"),
      },
    );
    return steps;
  }

  private myNotesExercise(): TourStep[] {
    const noteName = `NG Demo Support ${this.demo.nameSuffix}`;
    const categoryName = `Helpful ${this.demo.nameSuffix}`;
    const mainCategoryName = `Main Category ${this.demo.nameSuffix}`;
    return [
      {
        title: "Try it: create a note",
        description: "Use the New button to open the note creator.",
        target: activeTarget(".ng-mynotes-new-button"),
        before: () => this.navigation.openMyNotesCategory(null),
        interaction: { event: "click" },
      },
      {
        title: "Name the demo note",
        description: "This temporary name is unique to the current introduction. The created file is tracked and permanently removed when the introduction ends.",
        target: overlayTarget('input[placeholder="Note name..."]'),
        before: () => setOverlayInput('input[placeholder="Note name..."]', noteName),
      },
      {
        title: "Create the note",
        description: "Create opens the Markdown note with Neural Garden's note header attached above the editor.",
        target: overlayTarget(".ng-overlay-confirm"),
        before: () => this.demo.expectCreatedFiles(["Notes/"]),
        interaction: { event: "click" },
      },
      {
        title: "Add a category",
        description: "Use the plus beside Categories to create a category directly from this note.",
        target: activeTarget(".ng-note-header-box .ng-note-header-add-category-icon"),
        interaction: { event: "click" },
      },
      {
        title: "Name the category",
        description: "Give the category a name. Categories help you group notes that belong together.",
        target: activeTarget('.ng-note-header-add-row input[placeholder="Category name..."]'),
        before: () => setActiveInput('.ng-note-header-add-row input[placeholder="Category name..."]', categoryName),
      },
      {
        title: "Create and assign it",
        description: "Select the checkmark to create the category and assign it to this note at the same time.",
        target: activeTarget(".ng-note-header-box .ng-note-header-add-category-icon.has-input"),
        interaction: { event: "click" },
      },
      {
        title: "Assigned category",
        description: "Both existing categories are shown here. Helpful is already selected; select the unselected Main Category to assign this note to both.",
        target: activeTarget(".ng-note-header-box .ng-mynotes-pill-row"),
        interaction: {
          event: "click",
          target: activeTextTarget(".ng-note-header-category-pill:not(.is-active)", mainCategoryName),
        },
      },
      {
        title: "Favourite this note",
        description: "Select the heart in the note heading to mark this note as a favourite. Favourite notes are collected in MyNotes' Favourites category.",
        target: activeTarget(".ng-note-header-fav"),
        interaction: { event: "click" },
      },
      {
        title: "Enable support",
        description: "The shield marks this file as a support note. This reveals symptom assignments without changing the note's ordinary Markdown body.",
        target: activeTarget(".ng-note-header-support-toggle"),
        interaction: { event: "click" },
      },
      {
        title: "Assign a symptom",
        description: "Choose a symptom this note could support. Weekly Recap uses these assignments when matching difficult journal patterns to useful notes.",
        target: activeTextTarget(".ng-note-header-support .ng-mynotes-support-pill", "Stress"),
        interaction: {
          event: "click",
          target: activeTextTarget(".ng-note-header-support .ng-mynotes-support-pill", "Stress"),
        },
      },
      {
        title: "Return to MyNotes",
        description: "Use the MyNotes navigation button to return to your note list.",
        target: activeButton("← MyNotes"),
        interaction: { event: "click" },
      },
      {
        title: "Open a listed note",
        description: "Select the note's name or row to open it normally in the current view.",
        target: activeTextTarget(".ng-mynotes-note-row", noteName),
        before: () => this.navigation.openMyNotesCategory(mainCategoryName),
      },
      {
        title: "Open beside MyNotes",
        description: "This side-opening button opens the note to the right, keeping the MyNotes list visible beside it.",
        target: activeDescendantTarget(".ng-mynotes-note-row", noteName, ".ng-mynotes-note-open-right"),
      },
      {
        title: "Favourite from the list",
        description: "The heart on a listed note shows whether it is a favourite. Select the heart whenever you want to either mark or unmark it.",
        target: activeDescendantTarget(".ng-mynotes-note-row", noteName, ".ng-mynotes-note-heart"),
      },
      {
        title: "Return Home",
        description: "Use the Home navigation button to return to Neural Garden's main interface and continue to MyLearning.",
        target: activeButton("Home"),
        interaction: { event: "click" },
      },
    ];
  }

  private myLearningExercise(): TourStep[] {
    const categoryName = `Demo Category ${this.demo.nameSuffix}`;
    const topicName = `Demo Topic ${this.demo.nameSuffix}`;
    const noteName = `NG Demo Learning ${this.demo.nameSuffix}`;
    return [
      {
        title: "Try it: create a category",
        description: "Use the plus beside Categories to add the top level of your learning hierarchy.",
        target: activeTarget(".ng-mylearning-topics .ng-mylearning-inline-plus"),
        interaction: { event: "click" },
      },
      {
        title: "Name the category",
        description: "Categories group related topics and summarize progress across their learning notes.",
        target: overlayTarget('input[placeholder="Category name..."]'),
        before: () => setOverlayInput('input[placeholder="Category name..."]', categoryName),
      },
      {
        title: "Create the category",
        description: "Creating it selects the new category and reveals its Topics section.",
        target: overlayTarget(".ng-overlay-confirm"),
        before: () => this.demo.expectCreatedFiles(["Learning/Categories/"]),
        interaction: { event: "click" },
      },
      {
        title: "Create a topic",
        description: "Topics divide a category into focused areas and carry the color used by their entry indicators.",
        target: activeTarget(".ng-mylearning-categories .ng-mylearning-inline-plus"),
        interaction: { event: "click" },
      },
      {
        title: "Name and color the topic",
        description: "Give the topic a name and choose its color. The color indicator helps you recognize this topic throughout MyLearning.",
        target: overlayTarget(".ng-mylearning-category-color-row"),
        before: () => setOverlayInput('input[placeholder="Topic name..."]', topicName),
      },
      {
        title: "Create the topic",
        description: "Creating the topic selects it, so the next learning note is automatically placed under both this category and topic.",
        target: overlayTarget(".ng-overlay-confirm"),
        interaction: { event: "click" },
      },
      {
        title: "Add a learning note",
        description: "Use Add Note to create learning material inside the selected category and topic.",
        target: activeTarget(".ng-mylearning-heading-add-note"),
        interaction: { event: "click" },
      },
      {
        title: "Name the learning note",
        description: "Give the learning note a name, then it will open inside the category and topic you selected.",
        target: overlayTarget('input[placeholder="Note name..."]'),
        before: () => setOverlayInput('input[placeholder="Note name..."]', noteName),
      },
      {
        title: "Choose Markdown or Canvas",
        description: "Choose Markdown for a written note, or Canvas for a visual workspace where ideas can be arranged and connected.",
        target: overlayTarget(".ng-mylearning-type-control"),
      },
      {
        title: "Create the learning note",
        description: "Create opens the note. Its MyLearning heading lets you return to the selected category and topic and update your learning progress.",
        target: overlayTarget(".ng-overlay-confirm"),
        before: () => this.demo.expectCreatedFiles(["Learning/"]),
        interaction: { event: "click" },
      },
      {
        title: "Learning progress",
        description: "The progress bar records how well you understand this learning note. Update it as your comprehension develops; category and topic summaries combine this progress across their entries.",
        target: activeTarget(".ng-learning-note-box .ng-learning-progress-wrap"),
      },
      {
        title: "Return Home",
        description: "Use the Home navigation button to return to Neural Garden's main interface.",
        target: activeButton("Home"),
        interaction: { event: "click" },
      },
    ];
  }

  private journalingExercise(): TourStep[] {
    const trackerName = `NG Demo Tracker ${this.demo.nameSuffix}`;
    const userDate = this.demo.journalDates[3] ?? "";
    const supportNoteName = `NG Demo Support ${this.demo.nameSuffix}`;
    const nextWeekTaskName = `NG Weekly Task ${this.demo.nameSuffix}`;
    const journalSteps: TourStep[] = [
      {
        title: "Try it: add a tracker",
        description: "Open the tracker creator. The tracker you make here will also be available inside the journal entry you create next.",
        target: activeTarget(".ng-journal-tracker-add-toggle"),
        before: async () => {
          await this.demo.seedJournalEntries();
          await this.navigation.openJournalingDemoDate(userDate);
        },
        interaction: { event: "click" },
      },
      {
        title: "Name the tracker",
        description: "Choose a name for any habit, symptom, or recurring event that you want to follow over time.",
        target: activeTarget('.ng-journal-tracker-add-row input[placeholder="Tracker name..."]'),
        before: () => setActiveInput('.ng-journal-tracker-add-row input[placeholder="Tracker name..."]', trackerName),
      },
      {
        title: "Choose its color",
        description: "Selecting a color creates the tracker. Its dates will use the same color throughout Journaling.",
        target: activeTarget(".ng-journal-tracker-color-option"),
        before: () => this.demo.expectCreatedFiles(["Maintenance/Tracker/"]),
        interaction: { event: "click" },
      },
      {
        title: "Create a new entry",
        description: "Select New Entry to begin the fourth daily check-in for this week.",
        target: activeTarget(".ng-journal-create-button"),
        interaction: { event: "click" },
      },
      {
        title: "Check your tasks first",
        description: "This warning appears because a journal entry stores a snapshot of the Task Manager at the moment it is created. Return Home if completed or unfinished tasks need correcting; otherwise continue and the current task state will be preserved in today's entry.",
        target: () => document.querySelector<HTMLElement>(".ng-overlay-card"),
      },
      {
        title: "Continue to the entry",
        description: "Continue creates the entry with the current task snapshot and opens the complete Daily Check In.",
        target: overlayTarget(".ng-overlay-confirm"),
        before: () => this.demo.expectCreatedFiles(["Journal/Daily/"]),
        interaction: { event: "click" },
      },
      {
        title: "Daily measurements",
        description: "These eight measurements describe different parts of the day. Each progress bar stores a value from low to high, while its color and message help explain what the selected value means.",
        target: activeTarget(".ng-journal-metrics"),
        before: async () => {
          await this.demo.seedJournalEntryMeasurements(userDate);
          await this.navigation.openJournalEntry(userDate);
        },
      },
      {
        title: "Other daily sections",
        description: "Below the measurements, Daily Check In also includes emotions, tracker updates, one good thing, and task snapshots. Together they complete the daily context used later in Weekly Recap.",
        target: activeTarget(".ng-journal-secondary-check-in"),
      },
      {
        title: "One good thing",
        description: "Use this input to type one good thing from your day. This text is saved in the journal entry and appears later in Weekly Highlights.",
        target: activeTarget(".ng-journal-good-thing-input"),
      },
      {
        title: "Write your journal entry",
        description: "Finish with a reflection in the Entry area. This example text has been prepared for the introduction; your own journal text is saved when you leave the editor.",
        target: activeTarget(".ng-journal-body-content"),
        before: () => setActiveEditable(".ng-journal-body-content", "Today I took time to notice what supported me and what used my energy."),
      },
      {
        title: "Return to the Journal Hub",
        description: "Use the Journaling button to return to the calendar and create the Weekly Recap.",
        target: activeButton("<- Journaling"),
        interaction: { event: "click" },
      },
      {
        title: "Entry preview",
        description: "Back in the Journal Hub, the selected daily entry can be reviewed without reopening it. The preview includes measurements, emotions, trackers, task snapshots, and journal text.",
        target: activeTarget(".ng-journal-detail-panel"),
        before: () => this.navigation.openJournalingDate(userDate),
      },
      {
        title: "Select the available week",
        description: "Four entries make this week available. The first click selects it and loads a weekly preview in the Journal Hub.",
        target: activeTarget(".ng-journal-week-cell.is-available"),
        interaction: { event: "click" },
      },
      {
        title: "Generate the Weekly Recap",
        description: "Select the week again to generate its recap from the daily entries, emotions, trackers, tasks, and support-note assignments.",
        target: activeTarget(".ng-journal-week-cell.is-selected"),
        before: () => this.demo.expectCreatedFiles(["Journal/Weekly/"]),
        interaction: { event: "click" },
      },
    ];
    const recapSteps = withInterface("Weekly Recap", [
      {
        title: "Your Weekly Recap",
        description: "The Weekly Recap brings the completed week's information together. We will move through it from top to bottom.",
        target: activeTarget('[data-weekly-section="intro"]'),
      },
      {
        title: "Symptom recap",
        description: "These measurements summarize the week's daily check-ins and explain how each area has been developing.",
        target: activeTarget('[data-weekly-section="symptoms"]'),
      },
      {
        title: "Emotions",
        description: "The emotion balance and cloud show which feelings appeared during the week and how often they were selected.",
        target: activeTarget('[data-weekly-section="emotions"]'),
      },
      {
        title: "Tracker recap",
        description: "Tracker results show how often each tracked habit or event occurred during this week.",
        target: activeTarget('[data-weekly-section="trackers"]'),
      },
      {
        title: "Support notes",
        description: "The created support note from the beginning is now shown here with its trigger reason. Weekly Recap compares journal patterns with support categories to suggest matching notes.",
        target: activeTarget('[data-weekly-section="support"]'),
        before: async () => {
          await this.demo.ensureWeeklyRecapSupportOutputs(this.demo.year, this.demo.week, supportNoteName);
          await this.navigation.openWeeklyRecapWeek(this.demo.year, this.demo.week);
        },
      },
      {
        title: "Critical days",
        description: "Critical days point out dates where one or more measurements showed that extra care may have been needed.",
        target: activeTarget('[data-weekly-section="critical"]'),
      },
      {
        title: "Weekly highlights",
        description: "The good things recorded in daily entries are collected here as highlights from the week.",
        target: activeTarget('[data-weekly-section="highlights"]'),
      },
      {
        title: "Task Manager adjustments",
        description: "These adjustments show how the week's entries changed energy capacity, break frequency, and break length for future planning.",
        target: activeTarget('[data-weekly-section="adjustments"]'),
      },
      {
        title: "Plan next week's task",
        description: "Add one task for next week. After naming it and choosing effort, it will appear on Home in This Week's Tasks.",
        target: activeTarget('[data-weekly-section="next-tasks"]'),
      },
      {
        title: "Name the next-week task",
        description: "Enter one task name for next week.",
        target: activeTarget('[data-weekly-section="next-tasks"] .ng-weekly-next-task-input'),
        before: () => setActiveInput('.ng-weekly-next-task-input', nextWeekTaskName),
      },
      {
        title: "Choose the effort",
        description: "Select an effort level to save this next-week task.",
        target: activeTarget('[data-weekly-section="next-tasks"] .ng-weekly-task-effort'),
        interaction: { event: "click" },
      },
    ]);
    const homeSupport = withInterface("Home", [
      {
        title: "This week's tasks on Home",
        description: "Tasks you planned in Weekly Recap appear here.",
        target: activeTarget(".ng-this-week-tasks"),
        before: async () => {
          await this.navigation.openHome();
          await this.navigation.refreshHome();
        },
      },
      {
        title: "Adding a weekly task",
        description: "Press a task row here to add it directly to the Task Manager with effort already set.",
        target: activeTarget(".ng-this-week-task"),
        interaction: {
          event: "click",
          target: activeTarget(".ng-this-week-task"),
          autoAdvance: true,
        },
      },
      {
        title: "Task Manager update",
        description: "Great. The selected weekly task is now added to Task Manager. This Home view shows your weekly tasks, task list, support notes, and support hints together.",
        target: activeTarget(".neural-garden-home"),
        before: async () => {
          await this.navigation.openHome();
          await this.navigation.refreshHome();
        },
      },
      {
        title: "Support notes on Home",
        description: "The created support note from the beginning is now listed here. Pressing a support note opens that note directly.",
        target: activeTarget(".ng-home-support-note", ".ng-home-support"),
        before: async () => {
          await this.navigation.openHome();
          await this.navigation.refreshHome();
        },
      },
      {
        title: "Support hints",
        description: "Support hints from the Weekly Recap rotate here to give short, practical reminders.",
        target: activeTarget(".ng-home-hints-strip"),
        before: async () => {
          await this.navigation.openHome();
          await this.navigation.refreshHome();
        },
      },
      {
        title: "You are all set",
        description: "Alright, you are settled. Have fun using and expanding YOUR Neural Garden.",
        target: activeTarget(".neural-garden-home"),
      },
    ]);
    return [
      ...withInterface("Journaling", journalSteps),
      ...recapSteps,
      ...homeSupport,
    ];
  }
}

function activeTarget(selector: string, fallbackSelector?: string): () => HTMLElement | null {
  return () => {
    const activeLeaf = document.querySelector<HTMLElement>(".workspace-leaf.mod-active");
    return activeLeaf?.querySelector<HTMLElement>(selector)
      ?? (fallbackSelector ? activeLeaf?.querySelector<HTMLElement>(fallbackSelector) : null);
  };
}

function homeButton(label: string): () => HTMLElement | null {
  return () => [...(document.querySelector<HTMLElement>(".workspace-leaf.mod-active")
    ?.querySelectorAll<HTMLButtonElement>(".ng-home-category-button") ?? [])]
    .find((button) => button.textContent?.trim() === label) ?? null;
}

function activeButton(label: string): () => HTMLElement | null {
  return () => [...(document.querySelector<HTMLElement>(".workspace-leaf.mod-active")
    ?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
    .find((button) => button.textContent?.trim() === label) ?? null;
}

function activeTextTarget(selector: string, text: string): () => HTMLElement | null {
  return () => [...(document.querySelector<HTMLElement>(".workspace-leaf.mod-active")
    ?.querySelectorAll<HTMLElement>(selector) ?? [])]
    .find((element) => element.textContent?.includes(text)) ?? null;
}

function activeDescendantTarget(rowSelector: string, text: string, targetSelector: string): () => HTMLElement | null {
  return () => [...(document.querySelector<HTMLElement>(".workspace-leaf.mod-active")
    ?.querySelectorAll<HTMLElement>(rowSelector) ?? [])]
    .find((element) => element.textContent?.includes(text))
    ?.querySelector<HTMLElement>(targetSelector) ?? null;
}

function withInterface(interfaceName: string, steps: TourStep[]): TourStep[] {
  return steps.map((step) => ({ ...step, interfaceName: step.interfaceName ?? interfaceName }));
}

function sectionLabel(section: WalkthroughSection): string {
  if (section === "mynotes") {
    return "MyNotes walkthrough";
  }
  if (section === "mylearning") {
    return "MyLearning walkthrough";
  }
  if (section === "journaling") {
    return "Journaling walkthrough";
  }
  return "Home walkthrough";
}

function overlayTarget(selector: string): () => HTMLElement | null {
  return () => document.querySelector<HTMLElement>(`.ng-overlay-card ${selector}`);
}

function setOverlayInput(selector: string, value: string): void {
  setInputValue(document.querySelector<HTMLInputElement>(`.ng-overlay-card ${selector}`), value);
}

function setActiveInput(selector: string, value: string): void {
  const activeLeaf = document.querySelector<HTMLElement>(".workspace-leaf.mod-active");
  setInputValue(activeLeaf?.querySelector<HTMLInputElement>(selector) ?? null, value);
}

function setActiveEditable(selector: string, value: string): void {
  const activeLeaf = document.querySelector<HTMLElement>(".workspace-leaf.mod-active");
  const editor = activeLeaf?.querySelector<HTMLElement>(selector);
  if (!editor) {
    return;
  }
  editor.innerText = value;
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
}

function setInputValue(input: HTMLInputElement | null, value: string): void {
  if (!input) {
    return;
  }
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
  input.setSelectionRange(0, input.value.length);
}
