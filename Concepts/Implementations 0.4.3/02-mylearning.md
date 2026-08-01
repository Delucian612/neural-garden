# Neural Garden — MyLearning Implementation Steps

**Order note:** Implement this file after `01-mynotes.md` (this module reuses
MyNotes' header-collapse pattern and existing note-deletion behavior). Within this
file, **Step 1 (the topic/category rename) must be done first** — nearly every
later step here refers to the *new* names, and doing the rename last would mean
re-touching every other step.

---

## Step 1: Swap the naming of "topic" and "category" (FOUNDATIONAL — do first)

**Problem:** The current naming feels backwards: what's currently called
"category" should be "topic," and what's currently called "topic" should be
"category."

**Proposed solution:** Rename the underlying concepts/labels throughout
MyLearning: current `topic` → `category`, current `category` → `topic`. This is a
pure rename, not a structural change — the hierarchy stays the same, only the
labels swap.

**Acceptance criteria:**
- All UI labels, frontmatter keys, and internal variable/type names reflect the
  swapped terminology.
- No functional behavior changes in this step — it's a rename pass only.

**Files likely touched:** MyLearning view component(s), data model/frontmatter
schema for learning notes, any type definitions referencing "topic"/"category."

**Depends on:** none. **Blocks:** every other step in this file.

---

## Step 2: Link topic and category in Graph view

**Problem:** Topics (after the Step 1 rename) aren't represented as linkable
notes, so the graph view doesn't connect them to their categories.

**Proposed solution:** When a topic is created, wrap its name in `[[ ]]`
(wikilink syntax) so Obsidian's graph view treats it as a linked note.

**Acceptance criteria:** Creating a topic produces a note reference that appears
as a node in the graph view, connected to its categories.

**Files likely touched:** Topic creation handler.

**Depends on:** Step 1 (terminology must already be swapped).

---

## Step 3: Fix note header collapsing while writing/navigating

**Problem:** Same issue as MyNotes — the header disappears while actively
writing or navigating with arrow keys.

**Proposed solution:** Same fix pattern as `01-mynotes.md` Step 1 (collapse
instead of scroll, unfold on scroll-up), with one difference: the collapsed
MyLearning header also shows the progress bar, plus both the topic and the
category (post-rename) inline.

**Acceptance criteria:** Same as MyNotes Step 1, plus progress bar and
topic/category both visible in the collapsed state.

**Files likely touched:** MyLearning note header component.

**Depends on:** Step 1.

---

## Step 4: Remove QuickNoteButton; reposition Add Note button

**Problem:** The QuickNoteButton feels sluggish and should be removed.

**Proposed solution:**
- Remove the QuickNoteButton entirely.
- Move the "Add Note" button down, closer to the user's typical action area.
- Give "Add Note" the same quick-categorization behavior the removed button had
  when items are already selected.

**Acceptance criteria:** QuickNoteButton is gone; Add Note button is
repositioned and inherits quick-categorization when a selection exists.

**Files likely touched:** MyLearning toolbar/action bar component.

**Depends on:** none directly, but do after Step 1 for naming consistency.

---

## Step 5: Add canvas creation option alongside Markdown notes

**Problem:** There's currently no way to create a canvas file from MyLearning.

**Proposed solution:** On note creation, offer a toggle between "Markdown note"
(default/first) and "Canvas." Selecting Canvas creates a `.canvas` file instead
of a `.md` file, and canvases should be listed alongside notes.

**Acceptance criteria:**
- Default creation path still produces a Markdown note with no extra clicks.
- Toggling to Canvas produces a valid `.canvas` file.
- Canvases appear in the note listing.

**Files likely touched:** Note creation modal/handler, note list rendering.

**Depends on:** none directly.

---

## Step 6: Replace the comprehension tracker with embedded progress indicators

**Problem:** The standalone comprehension tracker feels disconnected ("icky")
from the rest of the interface, and there's no way to see topic-level learning
progress at a glance.

**Proposed solution:** Remove the standalone comprehension tracker and embed
progress directly into the topic/category display:
- **Topic level:** a progress bar showing average comprehension, plus two
  numbers next to the topic name formatted `X|Y` where X = notes with >50%
  comprehension, Y = total notes in that topic.
  - X/Y ratio > 70% → number shown in green
  - X/Y ratio > 50% → number shown in yellow
  - X/Y ratio ≤ 49% → number shown in orange
- **Category level:** identical `X|Y` treatment (notes >50% comprehension |
  total notes in category).
- Any note below 49% comprehension gets a faint red background highlight and a
  bold red "!" indicator instead of a normal icon.

**Acceptance criteria:**
- Old comprehension tracker UI is removed.
- Topic and category rows show the `X|Y` indicator with correct color
  thresholds.
- Notes under 49% comprehension are visually flagged (background + "!" icon).

**Files likely touched:** Topic/category list rendering, note comprehension data
source, an icon asset for the "!" indicator (may need to source/create one).

**Depends on:** Step 1 (topic/category naming must be final before wiring this
up, to avoid relabeling the same logic twice).

---

## Step 7: Add validation feedback for restricted characters

**Problem:** Creating a note, topic, or category with `:` or other
Obsidian-restricted characters silently fails or breaks.

**Proposed solution:** Detect restricted characters at input time and show a
clear inline feedback message (e.g. "`:` isn't allowed in names — try `-` or
`_`") before allowing creation.

**Acceptance criteria:** Attempting to use a restricted character shows
feedback and blocks creation until fixed; valid names proceed normally.

**Files likely touched:** Note/topic/category creation input validation
(shared validation utility, ideally reusable across MyNotes too).

**Depends on:** none.

---

## Step 8: Dim unselected topics/categories

**Problem:** Unselected topics and categories look flat/lifeless next to their
assigned color.

**Proposed solution:** When a topic/category is not selected, render its
assigned color at 40% of selected opacity. Full opacity on selection/hover.

**Acceptance criteria:** Unselected items visibly show a muted version of their
color; selecting restores full color.

**Files likely touched:** Topic/category list item styling.

**Depends on:** Step 1.

---

## Step 9: Fix squished note listing; add delete "x"

**Problem:** With the comprehension tracker removed (Step 6), there's more
horizontal space, so notes should no longer be forced into a two-row squished
layout. Titles are sometimes cut off.

**Proposed solution:**
- Switch the note listing to a normal single-flow list (no forced two-row grid).
- Add an "x" at the end of each listed note to delete it, using the **same
  deletion behavior already implemented in MyNotes** (no new pattern needed —
  reuse it).

**Acceptance criteria:**
- Note titles are no longer truncated by the old two-row layout.
- "x" deletes a note using the existing MyNotes-style deletion flow.

**Files likely touched:** Note list rendering component, delete handler (reuse
from MyNotes if shared, otherwise mirror its behavior).

**Depends on:** Step 6 (layout only makes sense once tracker space is freed
up); reuses existing MyNotes deletion logic from `01-mynotes.md`.

---

## Step 10: Daily Notes horizontal calendar strip

**Problem:** No quick way to create/see daily notes.

**Proposed solution:**
- Add a single horizontal calendar line, current day always on the right, past
  days to the left, draggable/scrollable.
- Clicking the current day creates a daily note in one click, named/formatted
  as `Daily Note yyyy-MM-dd`.
- A colored dot appears below the day number once a daily note exists for that
  day (including past days).
- **Processed indicator:** the dot becomes a green checkmark (number still
  visible faintly behind it) when the note is ≥90% processed via the progress
  bar, OR when the user clicks an existing daily note in the strip and ticks a
  "Done?" confirmation popup (which sets processed to 100%).

**Acceptance criteria:**
- Calendar strip renders, scrolls/drags horizontally, current day pinned right.
- One click on current day creates a correctly named/formatted daily note.
- Dot appears for days with a note; green check appears once processed
  threshold is met via either path.

**Files likely touched:** New calendar strip component, daily note creation
handler, progress-bar-to-processed-state logic.

**Depends on:** Step 1 (naming), Step 6 (progress bar pattern this reuses).

---

## Open item — do not implement yet, flag for discussion

**Help icon UX:** The current "?" icon and its help function need a different
approach — possibly a dedicated "help" button with an actual explanation
flow. No concrete solution decided yet. Leave this out of the implementation
pass; note it as a TODO/discussion item in the codebase (e.g. a comment or
tracked issue) rather than building something speculative.
