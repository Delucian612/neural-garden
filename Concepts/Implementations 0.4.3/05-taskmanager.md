# Neural Garden — TaskManager Implementation Steps

**Order note:** Steps 1–5 are independent and can be done in any order relative
to other feature areas. Step 6 depends on `04-journaling-weekly-recap.md`
Step 3 and should be implemented after that file.

---

## Step 1: Scope task-creation refresh to the Task Manager only

**Problem:** Creating a task triggers a hard refresh of the whole Home
interface (including support hints), which is unnecessary and jarring.

**Proposed solution:** Refactor the task-creation update so it only
re-renders/refreshes the Task Manager's own instance, not the parent Home
interface.

**Acceptance criteria:** Creating a task no longer visibly refreshes anything
outside the Task Manager component (support hints, etc. stay untouched).

**Files likely touched:** Task Manager component, Home interface state
management (check for shared refresh triggers).

---

## Step 2: Rename "Break Mode" button to "Start my Break"

**Problem:** "Break Mode" as a button label feels unnatural.

**Proposed solution:** Rename the button label to "Start my Break." No
functional change.

**Acceptance criteria:** Button text updated; behavior unchanged.

**Files likely touched:** Task Manager break control component.

---

## Step 3: Animate the Energy progress bar fill

**Problem:** The Energy progress bar jumps instantly when a task is added,
which feels harsh.

**Proposed solution:** Animate the bar filling from its old value to its new
value over ~0.5 seconds whenever a task's energy is added.

**Acceptance criteria:** Adding a task visibly animates the bar over roughly
half a second, always starting from the pre-task value.

**Files likely touched:** Energy progress bar component/CSS transition.

---

## Step 4: Add hover feedback to the delete "x"

**Problem:** The delete button gives no visual feedback on hover.

**Proposed solution:** On hover, the "x" turns red.

**Acceptance criteria:** Hovering the delete "x" shows a red state; reverts on
mouse-out.

**Files likely touched:** Task list item delete control CSS.

---

## Step 5: Add a setting to disable Forced Breaks

**Problem:** Forced Breaks only make sense when using a combination of
computer and mobile phone — not everyone wants them.

**Proposed solution:** Add a toggle in Settings to turn Forced Breaks off.

**Acceptance criteria:** Toggle exists in Settings; when off, forced breaks no
longer trigger.

**Files likely touched:** Task Manager break logic, Settings panel (see
`06-settings.md`).

---

## Step 6: Remove Overdrive mode entirely

**Problem:** Overdrive mode feels off and should be removed.

**Proposed solution:** Remove Overdrive mode and every piece of logic/UI tied
to it (state flags, buttons, related styling, any references elsewhere in the
plugin).

**Acceptance criteria:** No Overdrive-related code, UI, or settings remain
anywhere in the codebase. Search the whole repo for references before
considering this done.

**Files likely touched:** Task Manager component, Settings panel, any shared
state/store referencing Overdrive.

---

## Step 7: Surface "this week's tasks" from the Weekly Recap

**Problem:** Tasks the user plans in the Weekly Recap's "Next week's tasks"
section (see `04-journaling-weekly-recap.md` Step 3) don't currently appear
anywhere in the Task Manager.

**Proposed solution:** Read the Weekly Recap frontmatter's task rows (name +
effort level) and render each as a clickable button in the Task Manager
interface, visually indicating it originated from the Weekly Recap (e.g. a
"This week's tasks" label/badge).

**Acceptance criteria:**
- Each filled row from the current Weekly Recap appears as a button in the
  Task Manager.
- Buttons are visually distinguishable as coming from the Weekly Recap.
- Clicking a button should reasonably convert it into an actual tracked task
  (confirm exact click behavior with the user if not obvious from context).

**Files likely touched:** Task Manager UI component, Weekly Recap frontmatter
reader.

**Depends on:** `04-journaling-weekly-recap.md` Step 3.

**Open question:** exact placement within the Task Manager UI is not decided
yet — flagged in the source notes as undecided. Confirm placement before/while
implementing.
