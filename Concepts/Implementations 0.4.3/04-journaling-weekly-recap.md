# Neural Garden — Journaling: Weekly Recap Implementation Steps

**Order note:** Implement after `03-journaling-daily.md` (Step 2 there — depends
on the "one good thing" frontmatter field). Step 3 in this file produces
frontmatter that `05-taskmanager.md`'s integration step depends on — implement
this file before wiring up that TaskManager step.

---

## Step 1: Give "Critical Days" its own section

**Problem:** Critical days aren't surfaced prominently enough in the recap.

**Proposed solution:**
- Break "Critical Days" out into its own section with a neutral heading,
  placed directly below the "Tracker" section.
- List each affected day individually, formatted human-readably, e.g.
  `Tuesday - 12-08-2026`.
- Under each day, list the symptoms that made it a critical day.

**Acceptance criteria:**
- Critical Days is a standalone section, positioned right after Tracker.
- Each day is listed with weekday name + formatted date, with its symptoms
  underneath.

**Files likely touched:** Weekly Recap view component, date formatting utility.

---

## Step 2: Add "This week's highlights" section

**Problem:** The positive daily reflections aren't surfaced anywhere in the
weekly view — useful especially after a Critical Days section that may read as
negative.

**Proposed solution:** Add a new section directly after Critical Days, pulling
in the "one good thing about today" entries from each day that week (see
`03-journaling-daily.md` Step 2). Heading: "This week's highlights", with a
centered subtext: "These were your highlights of this week."

**Acceptance criteria:**
- Section appears immediately after Critical Days.
- Displays each day's "one good thing" entry for the week (skip days with no
  entry).
- Heading and centered subtext match the copy above.

**Files likely touched:** Weekly Recap view component, frontmatter reader for
the daily "good thing" field.

**Depends on:** `03-journaling-daily.md` Step 2 (frontmatter field must exist).

---

## Step 3: Replace "Next Month's Topics" with "Next week's tasks"

**Problem:** "Next Month's Topics" is being removed in favor of a
weekly-scoped task planning feature.

**Proposed solution:**
- Remove "Next Month's Topics."
- Add "Next week's tasks": a task name text input + an effort-level dropdown
  (badge style).
- Start with one input row. Once it's filled (task name entered + effort level
  selected), automatically reveal a new empty row. Allow up to 5 rows total.
- Store each filled row (task name, effort level) in the current Weekly
  Recap's frontmatter.

**Acceptance criteria:**
- Old "Next Month's Topics" section is gone.
- New section allows progressive reveal up to 5 task rows, each requiring both
  name and effort level to "count" as filled.
- Data is written to the Weekly Recap's frontmatter in a structured, readable
  format (task name + effort level per row).

**Files likely touched:** Weekly Recap view component, frontmatter schema.

**Note for next step:** This frontmatter is what `05-taskmanager.md`'s "this
week's tasks" button integration step will read from — keep the frontmatter
key names stable/documented so that step can reference them.

**Open question:** exact placement of the resulting buttons in the Task
Manager UI wasn't decided — flagged for you to confirm before/while
implementing `05-taskmanager.md`'s integration step.
