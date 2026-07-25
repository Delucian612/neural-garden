# Neural Garden

**Neural Garden** is a personal support system built as an Obsidian plugin, combining journaling, energy-aware task management, note organization, and study tracking into one low-friction environment for reducing chaos and supporting self-management.

---

## Installation

Neural Garden is not yet available on the official Obsidian Community Plugin store. Until then, it can be installed manually.

### Requirements

- Obsidian (desktop or mobile)
- An existing Obsidian vault

### Manual installation

1. Download and unzip the plugin: on the plugin's GitHub page, click the green **"Code"** button, choose **"Download ZIP"**, then double-click the downloaded file to unzip it.
2. In Obsidian, go to **Settings → Community Plugins** and turn on **Community plugins** if it isn't already enabled.
3. Still in **Community Plugins**, click the folder icon next to "Installed plugins" to open your vault's plugins folder directly.
4. Copy the extracted `neural-garden` folder (from step 1) into that folder.
5. Back in Obsidian, click the refresh icon in **Community Plugins** to detect the new plugin.
6. Find **Neural Garden** in the list, and turn it on.

Once enabled, Neural Garden is ready to use, with no further setup required.

---

## Background

Neural Garden wasn't created to be another productivity tool or journaling app. It started out of necessity, at a point where I felt helpless and heavily dysregulated and needed something that could actually hold that. I've spent the last eight months building it through a lot of trial and error, trying to lower the mental load of managing my own life and make self-management possible even on the hard days.

### Origins

Obsidian felt powerful right from the start, but also overwhelming. Too many possible workflows, too many decisions to make when I barely had the energy for any of them. So the first version of this system was completely manual: I reviewed every journal entry myself, cross-referenced tags by hand, wrote my own summaries. Back then, creating a new topic or category was an enormous effort in itself, tedious enough that every so often I'd end up rebuilding parts of, or the whole, vault from scratch just to keep it manageable. Over time it grew into something more graphical, with sliders that write straight into a note's frontmatter and a Home view that guides me through the vault.

### From overload to structure

The whole plugin exists because of one pattern that kept repeating: I'd push too hard for too long, neglect myself, and eventually crash into a rough stretch of low mood and low function. Journaling is what first helped me see that cycle clearly. I used tags to track my emotions, symptoms, and energy over time, and slowly those tags turned into a map connecting how I felt to what was actually going on around me. Along the way I wrote hundreds of notes about mental health and psychology. Working on the notebook and working on myself literally became the same process.

These days I have a lot less free time than when this started, so the system has shifted to match: capture things fast, and let the background processing do more of the work. The Task Manager is a direct result of that shift, and of the exhaustion I kept running into. It tracks how much I've taken on for the day and forces a break before I push past my limit again.

### A word of thanks

Somewhere along the way, this project quietly turned into something that ran alongside my therapy. A lot of what ended up in the notebook started as something a therapist said in a session, a thought that stuck with me afterward, that I kept turning over until I figured out how to actually build it into the vault. None of them set out to help design a plugin, but in a passive, sometimes unknowing way, they did.

I remember bringing in my very first alpha-alpha-alpha version, rough and barely holding together, and having them believe in it anyway, and in me, well before there was much to show for it. That belief only got stronger once my symptoms actually started to stabilize and they could see it wasn't just an idea I was chasing. Their help with my own life is - in the end - help with this notebook too, since the two were never really separate. This project also exists because they helped me through some of my darkest stretches, alongside a whole series of "happy little accidents," as Bob Ross would call them, that, one by one, kept improving and strengthening it into what it is today. I want to thank every one of them for that.

### Danksagung (für meine nicht englischsprachigen Therapeutinnen)

Dieses Projekt ist mit der Zeit zu einem stillen Begleiter meiner Therapie geworden, auch wenn ich das nie so geplant hatte. Ein großer Teil dessen, was heute im Notizbuch steckt, geht jene Sätze zurück welche mir meine Therapeutinnen und Unterstützer im Laufe unzähliger Sitzungen mitgegeben haben, Gedanken, die mir einfach nicht mehr aus dem Kopf gingen bis ich einen Weg gefunden hatte, diese tatsächlich in mein System umzusetzen. Keiner von ihnen hat je an einem Plugin/Projekt aktiv mitgearbeitet, und trotzdem haben sie es auf ihre Weise getan, oft ohne es selbst zu bemerken. 

Ich erinnere mich noch gut daran, wie ich ihnen meine allererste, völlig rohe Frühversion gezeigt habe, kaum mehr als ein Gerüst, und wie sehr an die Idee und an mich geglaubt wurde. Dieser Glaube vertiefte sich (vermutlich), als meine Symptome tatsächlich durchgehend zu stabilisieren begannen und man sehen konnt, dass es eben nicht nur ein kleines Projekt ist, sondern vielmehr ein Fundament welches meine Schwächen unterstützt und meine Stärken festigt. Was sie für mich persönlich getan haben, kommt am Ende genauso diesem Notizbuch zugute, beides lässt sich gar nicht wirklich trennen, weil es inzwischen zu einer Einheit geworden ist. Dieses Projekt existiert, weil sie mich durch einige der dunkelsten Phasen meines Lebens begleitet haben, zusammen mit einer ganzen Reihe "glücklicher kleiner Zufälle", wie Bob Ross sie genannt hätte, die es Stück für Stück verbessert und gestärkt haben bis an den Punkt an dem heute steht. Dafür möchte ich mich bei jeder und jedem Einzelnen von ihnen von Herzen bedanken.

---

## Current Feature Set

### Journaling System

The **Journaling System** is the core reflection layer, capturing the day's state quickly and building it into a clear picture over time.

Key capabilities:

- **Calendar-based Hub**: browse entries by day, each preview summarizing metrics, emotions, tasks, and active trackers.
- **Same-day and backfill writing**: entries can be written for today or backfilled for "yesterday."
- **Structured Entry view**: progress bars, emotion selection, a note field, task snapshots, and free-form writing in one capture flow.
- **Streak-based trackers**: each tracker is its own note, with tracked days shown as colored dots forming a streak line.
- **One-click tracker creation**: a new tracker is created the moment a name and color are chosen.
- **In-entry logging**: a minimal tracker view inside the Journal Entry makes daily logging one click.

### Task Manager

The **Task Manager** manages workload around energy expenditure rather than simple completion status.

Key capabilities:

- **Effort-based tasks**: every task carries an effort level instead of being a plain checkbox.
- **Real-time load tracking**: total daily load updates continuously as tasks are completed.
- **Forced breaks**: when strain crosses a threshold, a break is triggered automatically.
- **Lightweight workflow**: tasks can be created, estimated, and completed with minimal overhead.
- **Adaptive behavior**: data from journal entries lets thresholds adjust to individual patterns over time.

### MyLearning

**MyLearning** is a built-in study companion for organizing, tracking, and revisiting learning material within the vault.

Material is organized into **Topics** (e.g., "School," "Programming") and, within each, into **Categories**.

Key capabilities:

- **At-a-glance overview**: selecting a topic surfaces every associated note, color-coded by category.
- **Self-assessed progress tracking**: each note has a progress bar for rating comprehension over time.
- **Dedicated "stuck" flag**: one click files a note under a "help" category, keeping weak spots together.
- **Fast capture**: new notes can be created in one click, with topic and category pre-filled.
- **Structural integrity**: renaming or removing topics and categories updates all referencing notes automatically.

### MyNotes

**MyNotes** is the general note management layer, bringing all personal notes into a single organized view.

Key capabilities:

- **Unified note view**: all notes appear in one place, organized by category and color-coded support categories (such as Mood or Anxiety).
- **Favoriting and search**: notes can be favorited and searched from the same screen.
- **Inline creation and deletion**: notes can be created or deleted without leaving MyNotes.
- **Uncategorized handling**: notes without a category stay in a collapsible section until sorted.
- **In-note header**: every note gets an injected header for favoriting, category assignment, and Support Note designation.

### Home View

The **Home view** is the plugin's central navigation point, built to make the next action obvious.

Key capabilities:

- **Direct system access**: one screen links directly to Journaling, Task Manager, MyLearning, MyNotes, and search.
- **Low-friction design**: the layout minimizes decisions, particularly when mental energy is limited.

---

## Design Direction

The interface favors a calm, transparent visual language: fewer boxes, fewer borders, more open space. Buttons only look like buttons when active, panels let the background show through, and layout stays consistent across desktop and mobile.

---

## Roadmap

Neural Garden continues to evolve around the same priorities: fewer decisions during moments of stress, clearer feedback over time, and tooling that supports recovery rather than draining attention.

---

## Closing Note

This plugin exists out of necessity, built to support a part of life that needed it. What began as a personal project has become a broader effort to support its creator first, and perhaps others over time.