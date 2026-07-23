# Neural Garden

Neural Garden began as a personal necessity.

Over the last 8 months, this project grew through constant trial and error while life felt difficult to manage. The goal was never to build another productivity tool. The goal was to build a support system that could actually hold up on hard days, reduce chaos, and make self-management possible with less friction.

## Why this exists

At first, Obsidian felt powerful but overwhelming. Too many possible workflows, too many clicks, too many decisions when mental energy was already low.

The first journal entries and mechanics were clunky and ran entirely by hand. I read through every journal entry, looked at the connected tags, and wrote summaries myself, always searching for a better way. Over the span of a few months it slowly became more pleasant to look at, but it still remained fully manual.

In the past weeks and months, Neural Garden has moved toward a simpler interface with graphical inputs for specific actions. I experimented with sliders that wrote directly into a note's frontmatter, so the values could actually be stored, read, and processed later. At some point, the Home view became a pathway that led me through Obsidian. Still, some navigation chains stayed long, and things like starting a new topic felt tedious - sometimes it meant rebuilding parts of the notebook from scratch.

## From overload to structure

Week after week, the same patterns kept showing up: long stretches of overdoing things, neglecting my own mental health, and then inevitably crashing into deep depression and low function.

Journaling started in a strange way. I tried to use Obsidian's built-in features, tracked everything that seemed relevant, and used tags to connect the important things over time. Those tags became a map of emotions, symptoms, and energy, and slowly made it easier to notice links between internal states and external factors. My mental health began to recover, and I became more stable with every weekly reflection.

Journaling was the first real foundation of this journey. The notes I created along the way accompanied the whole process. Over the past months I focused heavily on self-reflection and wrote hundreds of notes about mental health, psychology, and related topics. Working on the notebook and its concept went hand in hand with working on myself. But I also spent an enormous amount of time doing it.

Now that time is tighter and life circumstances have changed, the whole system needed to be reshaped: capture the current state quickly and reliably, and let supporting measures trigger based on the values that come in. Fast input in the present, useful processing in the background. Parts of that automation are still in progress, but the direction is clear - future feedback loops should adapt to behavior over time, including how the Task Manager responds.

The Task Manager grew out of one of my biggest problems: exhaustion and overload. It treats tasks as energy-bearing actions instead of plain checkboxes, tracks the day's total load, and steps in with forced breaks when strain runs too high. The exact calculation stays out of the way; what matters is that the system helps prevent another long overpush cycle.

## What is implemented right now

### Journaling system

The journaling flow is split into a Hub and an Entry view.

The Hub is calendar-based and built for quick navigation: browse entries by day, preview a selected day, and open full entries. It supports current-day writing and yesterday backfill (for writing after midnight). The week starts on Monday, and week numbers sit on the left side of the calendar. The day preview shows the entry's summary - metrics, emotions, tasks - and also lists which trackers were logged on that day.

The Entry view is where the daily reflection happens. It includes symptom and state progress bars, emotion selection, a short note field, a compact tracker section, task snapshots, and free-form writing. The goal is to collect what matters quickly, without forcing a long manual process.

### Tracker

The Journal Hub contains a tracker section inspired by minimalist habit trackers, rebuilt to fit Neural Garden.

Each tracker is a note in the vault, and each tracked day is a colored dot on a rolling window of recent days. Consecutive days connect into a streak line, with the current streak count shown inside the last dot - the text color adjusts automatically so it stays readable on any tracker color.

Creating a tracker happens directly in the interface: open the create row, type a name, and pick one of the preset colors - the tracker is created the moment you click a color. The color of an existing tracker can be changed anytime through the small color dot next to its name.

A minimal version of the tracker also lives inside the Journal Entry view, so logging something for the day (a symptom, a habit, an event) is one click away while journaling. Past entries show which trackers were active that day without allowing changes.

### Task Manager

The Task Manager is based on energy, not just completion status.

Each task carries an effort level, and the total daily load is tracked continuously. When strain rises too far, a forced break interrupts the overuse early. This is meant to break the old pattern of pushing too long and crashing afterward.

The system stays practical: create tasks quickly, estimate effort, complete or edit them, and let the manager reflect the day's overall demand in real time.

Values from journal entries softly guide the Task Manager's behavior, so it adapts to each person and each situation individually.

### MyNotes

MyNotes is the note management layer of Neural Garden.

It brings all personal notes into one view, organized by categories and a set of colored support categories (like Mood or Anxiety) that mark what a note helps with. Notes can be favourited with a heart, searched directly, created and deleted from the same screen, and uncategorized notes stay tucked away in a collapsible section until needed.

Every note in the Notes folder also gets a header injected at the top of the note itself. From there you can favourite the note, assign or create categories on the spot, and mark it as a Support Note - all without leaving the note. The header ends in a simple divider line, keeping the note itself clean.

### Home view

The Home view acts as the plugin's central pathway.

Instead of navigating raw folders or scattered notes, the Home screen gives direct access to the main systems: Journaling, Task Manager, MyNotes, and search. It is designed to lower friction when mental energy is low and make the next action obvious.

## Design direction

The interface keeps moving toward a calm, transparent look: fewer boxes, fewer borders, more space. Buttons only look like buttons when they are active, panels let the background shine through, and the layout stays consistent between desktop and mobile.

## Ongoing direction

Neural Garden is still evolving, but always toward the same promise: fewer decisions in moments of stress, clearer feedback over time, and tools that support recovery instead of draining attention.

## Ending sentence

This plugin exists because I exist, and I needed support in parts of my life. Realizing that this technology could help, I became determined to build what supports me — and maybe, over time, supports others too.
