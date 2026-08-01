# Neural Garden — MyNotes Implementation Steps

**Order note:** Implement this file first. MyLearning reuses this module's note-header
collapse behavior and note-deletion pattern; Home's QuickNotes feature depends on the
category system built here.

---

## Step 1: Fix note header collapsing while writing/navigating

**Problem:** The note header disappears when the user is actively writing or
navigating with arrow keys. It currently behaves as a scrollable element, so it
gets scrolled out of view during input. Reopening the note fixes it temporarily;
scrolling without writing is fine.

**Proposed solution:** Stop treating the note header as part of the scrollable
content area. Instead, let it shrink into a collapsed state that always stays
visible:
- Collapsed state shows only: navigation buttons (top line), active categories
  (next line), note name (next line).
- The header should never scroll out of frame while the user is typing.
- Scrolling **up** in the note body should "unfold" the header back to full size.

**Acceptance criteria:**
- Typing/arrow-key navigation never hides the header.
- Scrolling up while not writing restores the full header.
- Header remains sticky/pinned rather than part of the scroll container.

**Files likely touched:** MyNotes view component, note header component, associated
CSS. (Confirm actual filenames in the repo — these are best-guess names.)

---

## Step 2: Add category creation from the main interface

**Problem:** Categories can't currently be created directly from the main MyNotes
interface.

**Proposed solution:** Add a "+" button next to the categories list that opens a
lightweight create-category flow (name input, confirm).

**Acceptance criteria:**
- "+" appears next to the category list.
- Creating a category updates the list immediately without a full interface refresh.

**Files likely touched:** MyNotes category list component.

**Depends on:** none.

---

## Step 3: Auto-categorize notes created via the Create Note button

**Problem:** Selecting a category and then using the "Create Note" button (top
right) doesn't automatically place the new note into that selected category.

**Proposed solution:**
- If a category is selected when "Create Note" is pressed, the new note is
  automatically filed into that category.
- Give a visible hint (e.g. label or tooltip near the button) showing which
  category the note will land in before creation.

**Acceptance criteria:**
- New note's frontmatter/category assignment matches the selected category.
- UI communicates the target category before the note is created.

**Files likely touched:** Create Note button component, note creation handler.

---

## Step 4: Fix category edit pen not showing on tablet

**Problem:** The pencil icon used to edit categories doesn't render on the tablet
layout/breakpoint.

**Proposed solution:** Audit the responsive/breakpoint CSS for the category edit
control and ensure it's visible (not just hover-triggered, since tablets don't
have hover) at tablet widths.

**Acceptance criteria:** Edit pen is visible and tappable on tablet viewport
widths, without requiring hover.

**Files likely touched:** Category list component CSS/responsive styles.

---

## Reference for later steps (no action needed here)

Note deletion in MyNotes (the "x" icon pattern) already exists and will be
**reused as-is** by MyLearning's note-list step — no changes needed in this file
for that.
