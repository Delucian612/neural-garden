# Neural Garden

Neural Garden is a local-first Obsidian plugin for journaling, energy-aware task management, personal notes, and learning material. It brings these workflows into one visual system while keeping the underlying information in ordinary files inside your vault.

No AI service is used. Neural Garden works with local notes, frontmatter, links, and deterministic calculations.

## What Neural Garden Includes

### Home and Task Manager

The Home view is the starting point for the plugin. It provides direct access to Journaling, MyNotes, MyLearning, and Quick Notes alongside the daily Task Manager.

- Create tasks with Light, Easy, Fair, Hard, or Heavy effort levels.
- Track the day's total energy load visually.
- Complete, edit, and remove tasks without leaving Home.
- Enable Break Mode to lock the task list when the configured energy threshold is reached.
- Use the guided break timer before returning to unfinished work.
- Promote tasks prepared in a Weekly Recap into the current task list.
- Surface relevant support notes and support hints from the latest recap.

### Journaling

Journaling combines structured check-ins with free-form writing.

- Browse entries from a calendar-based view.
- Create today's entry or backfill a recent day.
- Record wellbeing metrics, emotions, completed tasks, trackers, and written reflections.
- Create custom trackers with individual colors.
- Log trackers directly from a journal entry.
- Review entry previews without opening every note.

Journal data remains readable Markdown and frontmatter under the vault's `Journal/` folder.

### Weekly Recap

Weekly Recap turns recent journal entries into a review of the week.

- Summarize tracked symptoms, emotions, habits, and task load.
- Highlight difficult days and positive moments.
- Review changes from the previous week.
- Select support notes connected to current needs.
- Prepare tasks for the following week.
- Save each recap as a Markdown note under `Journal/Weekly/`.

The recap is generated locally from journal data. It does not send entries to an external service.

### MyNotes

MyNotes organizes general-purpose notes with a two-level hierarchy:

1. **Categories** provide the main grouping.
2. **Topics** organize notes within a selected category.

Key features include:

- Create, rename, and remove categories and topics.
- Assign one category and multiple topics to a note.
- Give topics individual colors for faster visual scanning.
- Filter notes by category, topic, favourite status, or support type.
- Search note names and contents.
- Keep unsorted notes in a dedicated collapsible section.
- Create notes directly within the current category and topic.
- Open notes in the current pane or a split pane.

Each MyNotes file receives a collapsible header for category and topic assignment, favourites, and Support Note settings. Category and topic links are also represented in the vault so they can participate in Obsidian's graph.

### MyLearning

MyLearning provides a similar category/topic structure for study notes and canvases.

- Organize learning material by category and topic.
- Create Markdown notes or Obsidian canvases from the selected context.
- Assign multiple topics to a learning note.
- Color topics consistently across the manager and note headers.
- Set a manual comprehension value from 0 to 100 on each note or canvas.
- Review progress summaries across categories and topics.
- Rename or remove structure while updating related entries.
- Use the Daily Notes category for lightweight recurring learning capture.

Learning notes and canvases are stored under `Learning/`. Linking notes used for graph relationships are kept separately from normal learning entries.

### Note Headers

MyNotes and MyLearning Markdown files receive a shared collapsible header.

- Navigate back to the relevant manager or Home.
- Assign categories and topics without editing YAML manually.
- See active topics and their colors while the header is collapsed.
- Collapse automatically while writing to preserve editor space.
- Return to the top of long notes with the animated up-arrow control.

### Walkthroughs and Appearance

- First-run walkthroughs introduce the main workflows.
- Individual walkthrough sections can be replayed from Settings.
- General, hover, and highlight colors can be customized.
- Break Mode can be enabled or disabled independently.

## Local Data and Privacy

Neural Garden does not require an account, cloud backend, or AI provider. Plugin state and user content remain in the Obsidian vault.

The plugin creates and maintains folders such as:

```text
Journal/
Learning/
Notes/
Maintenance/
```

Most information is stored as Markdown, YAML frontmatter, canvas JSON, or Obsidian links. Back up the vault normally before testing major updates or reorganizing generated folders.

## Installation

Neural Garden is not currently available in Obsidian's Community Plugins directory.

### Manual Installation

1. Download the latest Neural Garden release or repository ZIP.
2. Extract the `neural-garden` plugin folder.
3. Place it in `<vault>/.obsidian/plugins/`.
4. Open **Settings -> Community plugins** in Obsidian.
5. Refresh the installed plugin list and enable **Neural Garden**.

The installed folder must contain at least `manifest.json` and `main.js`.

Neural Garden supports desktop and mobile Obsidian. Some layouts and interactions may vary with screen size and platform.

## Getting Started

1. Enable the plugin and complete the introductory walkthrough.
2. Open Neural Garden from the ribbon or the **Open Neural Garden Home** command.
3. Add a task, create a journal entry, or open MyNotes/MyLearning.
4. Use **Settings -> Neural Garden** to adjust colors, Break Mode, or replay a walkthrough.

## Health Disclaimer

Neural Garden is a personal organization and reflection tool. It is not medical software and does not provide diagnosis, treatment, or emergency support.

## Acknowledgment

Thanks to the therapists and supporters whose guidance helped shape the personal practices behind this project, and to everyone who encouraged its early versions.

Danke an die Therapeutinnen, Therapeuten und Unterstützenden, deren Begleitung die Grundlagen dieses Projekts mitgeprägt hat.
