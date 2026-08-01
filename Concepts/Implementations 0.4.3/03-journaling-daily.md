# Neural Garden — Journaling: Daily Journal Implementation Steps

**Order note:** Implement before `04-journaling-weekly-recap.md` — the "one good
thing about today" frontmatter field added here (Step 2) is consumed by the
Weekly Recap's new "This week's highlights" section.

---

## Step 1: Shrink stats bar into a mini-header once writing starts

**Problem:** Writing the journal entry feels awkward because the full stats
block stays at the top, forcing the user to scroll past it after just a few
lines of text.

**Proposed solution:** Once the user focuses the entry field and types the
first character, animate the stats block down into a compact mini-header,
similar in height to the MyNotes file heading:
- Small subheading label indicating what's shown.
- Mood, Sleep, Regulation, Stress, Anxiety, Exhaustion, Sensory load, Social
  load shown in their existing progress-bar colors (compact form).
- Selected emotions listed inline below (in their red/green coloring).
- Selected trackers listed below that.
- Completed tasks listed below that.
- Navigation buttons stay pinned top-left and top-right.

**Acceptance criteria:**
- Full stats block shows by default (no entry started yet).
- On first keystroke in the entry field, it animates/collapses to the compact
  form described above.
- All data (mood/sleep/etc. colors, emotions, trackers, tasks, nav buttons)
  remains present and readable in the compact form.

**Files likely touched:** Daily Journal view component, stats block component,
associated CSS/animation.

---

## Step 2: Add "one good thing about today" section

**Problem:** There's no prompt for a small positive reflection in the daily
entry.

**Proposed solution:** Add a new section below the Tracker section prompting
the user for one single thing about today (working title — naming still open,
see note below). Store the input in that day's frontmatter.

**Acceptance criteria:**
- Section appears below Tracker section.
- Input is stored in the daily note's frontmatter under a clear key (e.g.
  `good_thing` or similar — pick one consistent key, since Weekly Recap will
  read it in `04-journaling-weekly-recap.md`).

**Files likely touched:** Daily Journal view component, frontmatter schema.

**Open question:** exact section title wasn't finalized (something like "Name
one good thing about today" or similar). Pick a working title and treat it as
easy to rename later — the frontmatter key matters more than the label.

---

## Step 3: Limit journal entry preview to 10 lines

**Problem:** The preview of long journal entries is too long.

**Proposed solution:** Cap the entry preview display to 10 lines, with
truncation (e.g. fade or "…") beyond that.

**Acceptance criteria:** Previews never render more than 10 lines regardless of
entry length.

**Files likely touched:** Journal entry preview component.

---

## Step 4: Add a subtle glow to the journal entry text field border

**Problem:** The writing area doesn't feel distinct/special.

**Proposed solution:** Add a subtle glow effect to the entry field's border
(theme-aware — should follow the current Obsidian appearance theme's color, not
a hard-coded color, to stay consistent with the general theming issue tracked
in `08-general-and-support.md`).

**Acceptance criteria:** Entry field border has a visible but subtle glow that
adapts to light/dark theme.

**Files likely touched:** Daily Journal entry field CSS.

---

## Step 5: Editable task list in the journal entry

**Problem:** Tasks listed in the journal entry can't be added or removed from
within the journal view.

**Proposed solution:** Add a small pencil icon on the right side of the Tasks
section that opens add/delete editing for that day's tasks. Edits here should
update the day's frontmatter the same way the Task Manager's own task
collection does.

**Acceptance criteria:**
- Pencil icon opens an edit mode for the task list.
- Adding/removing a task here updates frontmatter identically to editing it via
  the Task Manager.

**Files likely touched:** Daily Journal Tasks section component, shared
task-frontmatter update logic (reuse the Task Manager's existing update path
rather than duplicating it).

---

## Step 6: "Are your tasks up to date?" prompt before creating an entry

**Problem:** Nothing nudges the user to finish updating tasks before writing
the journal entry, so entries can be created against stale task data.

**Proposed solution:** Show a confirmation popup when starting a journal entry,
asking something like "Are your tasks up to date?" before proceeding.

**Acceptance criteria:** Popup appears at journal-entry-creation time and
requires acknowledgment (or lets the user jump to tasks first) before entry
creation continues.

**Files likely touched:** Daily Journal entry creation flow.

**Open question:** exact wording not finalized — treat as easy to adjust.
