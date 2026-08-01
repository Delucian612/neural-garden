# Neural Garden — Home Implementation Steps

**Order note:** Step 2 depends on `01-mynotes.md` (category system). Step 3
references the existing Weekly Recap feature, not the changes in
`04-journaling-weekly-recap.md`, so it can be done independently of that file.

---

## Step 1: Fix spacing when no support hint is shown

**Problem:** There's an awkward gap (originally reserved for a support hint)
between categories and the search bar when no support hint is present.

**Proposed solution:** Move the support-hint gap to sit *above* the clickable
category buttons instead, so it produces a similar passive/psychological
effect without leaving dead space when no hint is shown.

**Acceptance criteria:** No visible empty gap between categories and search bar
regardless of whether a support hint is present; the same subtle spacing effect
now sits above the category buttons.

**Files likely touched:** Home layout component, support hint placeholder CSS.

---

## Step 2: Make the QuickNote button functional

**Problem:** The QuickNote button currently does nothing.

**Proposed solution:**
- Clicking it opens a popup to type a name and confirm (Enter key or a Create
  button).
- The resulting note is filed under a "Quick Notes" category.
- In the MyNotes interface, add a "Quick Notes" entry to the category list,
  positioned second (right after "Favourites").
- The note is stored in the normal Notes folder and uses the standard MyNotes
  note header.

**Acceptance criteria:**
- Popup flow works as described (name input + Enter/Create).
- New note appears filed under "Quick Notes" in MyNotes, in the normal Notes
  folder, with the standard note header.
- "Quick Notes" category appears second in MyNotes' category list.

**Files likely touched:** Home QuickNote button/popup component, MyNotes
category list ordering.

**Depends on:** `01-mynotes.md` (category system must exist first).

---

## Step 3: Make "Weekly Recap available" clickable

**Problem:** The "Weekly Recap available" indicator on Home looks like it
should be clickable but isn't.

**Proposed solution:**
- On hover, intensify its color/brightness to signal interactivity.
- On click, redirect to the Journaling platform and start the Weekly Recap.

**Acceptance criteria:** Hover shows a clear visual affordance; click navigates
directly into an active Weekly Recap session.

**Files likely touched:** Home Weekly Recap indicator component.
