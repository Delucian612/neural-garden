# Neural Garden — General & Support System Implementation Steps

**Order note:** Implement this file last. Step 2 (onboarding/help) explains
already-built interface sections, so it's most efficient once the other
feature areas are stable. Step 3 (theme adaptation) is a larger architectural
concern that touches styling across every module built so far.

---

## Step 1: Hard-code the Add Tracker button to match journal styling

**Problem:** The "Add Tracker" button doesn't follow the general Notebooks
styling — it currently depends on whatever the active Appearance theme is,
which looks inconsistent.

**Proposed solution:** Hard-code the button's styling to follow the current
Journals design orientation specifically, rather than inheriting from the
active theme.

**Acceptance criteria:** Add Tracker button renders consistently with the
Journals section's design regardless of the active Obsidian theme.

**Files likely touched:** Add Tracker button component/CSS.

---

## Step 2: Build first-run onboarding + per-section help

**Problem:** The whole interface needs explanation, and there's currently no
onboarding or contextual help.

**Proposed solution:**
- On first startup, show an introduction/explanation flow: highlight each
  section being explained, and reveal explanatory text with a typing animation
  (not appearing all at once).
- Add a "help" affordance on each main interface (Home incl. Task Manager,
  MyNotes, MyLearning, Journaling) that opens a how-to / visual walkthrough
  highlighting and explaining that specific section.
- redo the first startup possibilities in the settings

**Acceptance criteria:**
- First launch triggers the guided intro exactly once (persisted so it doesn't
  repeat on every open).
- Each of the four main interfaces has a help entry point that opens a
  section-specific walkthrough.
- Explanatory text animates in a typewriter style.

**Files likely touched:** New onboarding/tour component, help modal component,
per-section help content, plugin settings/state for "has seen intro" flag.

**Depends on:** conceptually depends on the other feature areas being in their
near-final shape, since the walkthroughs describe them.

---

## Step 3: Make the design adapt to the active Obsidian theme

**Problem:** The interface design doesn't adapt to the user's Obsidian theme,
which makes publishing the plugin difficult since it clashes with Obsidian's
plugin guidelines.

**Proposed solution:** No concrete solution decided yet — this is flagged as
an open architectural issue, not a ready-to-implement step. Before touching
code, this needs a scoping conversation: likely involves migrating hard-coded
colors to Obsidian's CSS variables (e.g. `--background-primary`,
`--text-normal`, etc.) wherever the plugin currently uses fixed values.

**Suggested first move:** Audit all CSS/styling across the plugin for hard-coded
color values and list them out, then decide case-by-case which should switch to
theme variables versus staying intentionally fixed (like the Add Tracker button
in Step 1, which was deliberately hard-coded).

**Files likely touched:** All CSS across the plugin — this is a cross-cutting
audit, not a single-file change.

**Note:** Do this step last, after every other file in this series, so the
audit covers final styling rather than styling that's about to change anyway.

---

## Step 4: Explain how support notes work (open issue)

**Problem:** It's unclear how the support-note system works, and how/why users
should assign them.

**Proposed solution:** Not yet decided. Needs a short design/scoping pass
(likely folds into the Step 2 onboarding/help system as one of the per-section
walkthroughs) rather than being built as a standalone feature.

**Suggested handling:** Fold this into Step 2's Support-system help content
once that step is underway, rather than treating it as separate work.
