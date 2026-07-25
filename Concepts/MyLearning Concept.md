# MyLearning Feature — Implementation Spec

**Context:** Neural Garden Obsidian plugin. This feature is a sibling to the existing **MyNotes** feature and should reuse its components, styling, and interaction patterns wherever noted below. Where this spec says "same as MyNotes," pull the exact component/class/logic from MyNotes rather than reimplementing.

---

## 1. Data Storage

**Auto-provisioning:** on plugin load (or on first use of MyLearning, whichever pattern MyNotes already follows), check for the folders/files below. If missing, create them. If they already exist, leave them untouched (no-op). The user should never have to manually create `Maintenance/MyLearning/`, `MyLearning.md`, or the `Learning/` folder themselves — this applies to all three:
- `Maintenance/MyLearning/` folder
- `Maintenance/MyLearning/MyLearning.md` config note (with default/empty frontmatter)
- `Learning/` root folder

### 1.1 Config note (frontmatter store)
- Path: `Maintenance/MyLearning/MyLearning.md`
- Purpose: single source of truth for all Topics and Categories (mirrors how MyNotes stores its own category list).
- Frontmatter must track, at minimum:
  - List of Topics (e.g. `school`, `programming`, …)
  - List of Categories, associated per-topic
  - Every Topic automatically includes a built-in **"help"** category (see 3.4) — this should be injected programmatically, not something the user can delete.

### 1.2 Notes created by this feature
- Folder: `Learning` (root-level folder, **not** nested under Maintenance).
- Each note gets frontmatter fields:
  - `topic` (single value)
  - `categories` (array, multi-select)
  - `comprehension` (integer, 0–100)
  - `help` (boolean flag — present/true when the question-mark toggle is active; see 3.5)

---

## 2. Main MyLearning View

### 2.1 Top navigation
- Top-left: **Home** button (same as MyNotes).
- Next to it: **"Back to MyNotes"** button, returning to the MyNotes interface.

### 2.2 Page heading
- `## MyLearning` — H2, same color/formatting as the MyNotes H2 heading.

### 2.3 Top-right action button
- Icon: `file-plus`, label: **"New"** (see naming note at end of doc — you asked if "New" is overused; alternatives: "Add Note," "Create Note," or just the icon with no label since it's already visually distinct from the other two "New" buttons via icon+position).
- Behavior: launches the **same note-naming flow as MyNotes**.
- New file is saved to `Learning/` (root folder — confirmed).
- If a Category and/or Topic were already selected in the view when this button is pressed, the naming dialog shows that selection back to the user as a preview/confirmation, and pressing "Create" auto-assigns that topic/category to the new note's frontmatter.

### 2.4 Topics row
- Replaces the search bar location used in MyNotes.
- Left side: `Topics` label, normal text color (not a heading color).
- Right side, same line: **Create Topic** button — icon `layers-plus`, label **"New"**.
- Below: all existing Topics, listed **horizontally**, rendered as buttons.
  - Styling: same button style as the MyNotes category buttons, but **larger**.
  - Clicking a Topic selects it and reveals its Categories below (2.5), with a bit of vertical spacing plus a horizontal divider line separating Topics from Categories visually.

### 2.5 Categories section
- Only visible once a Topic is selected (or shows the global category list — pick one; **assumption: shows categories scoped to the selected Topic**, since categories are per-topic per section 1.1).
- Left: `Categories` label.
- Right, same line: **Create Category** button — icon `grid-2x2-plus`, label **"New"**.
- A horizontal divider separates this section from the note grid below.

### 2.6 Note grid (per selected Topic)
- Clicking a Topic lists all notes belonging to it in a **2-column** layout.
- Fill order: note 1 → left column, note 2 → right column, note 3 → left, note 4 → right, etc. (row-major alternating fill, not "fill left column fully then right").
- Each note entry:
  - Color indicator (category color swatch) in front of the note title — same concept as MyNotes' color idents.
  - Hover state: background lightens slightly (same as MyNotes hover).
  - **No heart icon** here (unlike MyNotes' note list, which does show one).
- Same delete flow as MyNotes.
- Same split-view opening behavior as MyNotes.

### 2.7 Bottom section — comprehension tracker
- At the very bottom of the MyLearning view: a list of notes sorted by `comprehension` value, **ascending** (least understood first, most understood last).
- Each list entry shows the note's progress bar (see 3.6 for the bar's visual spec) so the user can see standing progress at a glance.
- Assumption: this list spans **all** notes/topics, not just the currently selected topic — flag if you meant it scoped to the open topic instead.

### 2.8 Uncategorized Notes
- At the very end of the MyLearning view (below 2.7), same pattern as MyNotes' existing "Uncategorized Notes" section.
- Heading: `Uncategorized Notes`.
- Lists any note missing its **Topic**, its **Category**, or both — a note needs only one of the two missing to land here.
- Same list/row styling as the rest of the note listings in this view (color ident, hover highlight, no heart icon — per 2.6).

---

## 3. Note File Heading (inside notes stored in `Learning/`)

This is the header block shown at the top of each individual learning note — parallel to the MyNotes file heading.

### 3.1 Top navigation
- Two buttons, side by side, top-right corner:
  - **Home**
  - **"← MyLearning"** (back to the MyLearning main view)

### 3.2 Topic heading
- Centered heading showing the Topic assigned to this note.
- If no Topic is assigned yet, this heading acts as a clickable control (e.g. shows placeholder text like "Assign a Topic") — clicking it opens a Topic picker (from the existing Topic list in `MyLearning.md`) and writes the selection to the note's `topic` frontmatter field.

### 3.3 Categories block
- Heading: `Categories`
- Below it: all categories for this note's topic, rendered as toggleable chips/buttons.
- Multi-select: user can select/deselect multiple categories freely; each toggle updates the note's `categories` frontmatter array.
- Same row as the "Categories" heading, right-aligned: a **"+"** button to add a new category — same mechanic as the MyNotes file-heading "+" button, just operating on the MyLearning category set instead of MyNotes'.

### 3.4 Help toggle
- Icon: `circle-question-mark`.
- Positioned top-right, **at the same height as the "Categories" heading**.
- Rendered as a bare icon — no visible button chrome/background in its default state.
- On press: toggles active/inactive.
  - Active state: icon turns **red**, with a brief visual feedback animation on toggle (same treatment as the heart-icon toggle animation in MyNotes).
  - Active state writes `help: true` to the note's frontmatter (or add/remove the note from the topic's "help" pseudo-category — pick whichever mechanism MyNotes uses for its own boolean-flag-driven categories, for consistency).
- Notes flagged this way are surfaced under the auto-generated **"help"** category for that Topic (see 1.1).

### 3.5 Progress bar
- Positioned below the Categories block.
- Centered horizontally, with margin/padding on both left and right (not edge-to-edge).
- Color: **cyan**.
- Manually operated by the user (drag/click to set, not automatic).
- Value range: 0–100, written to the note's `comprehension` frontmatter field.

---

## 4. Explicitly reused from MyNotes (do not reimplement from scratch)
- Note-naming flow (triggered by the "New" note button).
- Category button visual styling (topics/categories buttons are the same style, just scaled up for Topics).
- Delete flow for notes.
- Split-view behavior.
- "+" add-category button mechanic in the file heading.
- Toggle-with-color-change animation (heart icon → question-mark icon).

## 5. Flagged assumptions to double-check
1. **Categories in 2.5** are scoped to the selected Topic (not global) — confirm.
2. **Bottom comprehension-sorted list (2.7)** shows notes across all topics, not just the active one — confirm.
3. "Help" is implemented as a real frontmatter boolean (`help: true`) that the plugin filters on to build the virtual "help" category, rather than a literal entry in the categories array — confirm this matches how you want the data modeled.
4. On the "New" wording: you use "New" for Topic creation, Category creation, and Note creation. Since each is visually distinct (different icon, different position, different button size), reusing "New" for all three isn't actually confusing — but if you'd rather differentiate, swap the note-creation button to "Add Note" and leave Topic/Category as "New."

