# Neural Garden — Settings Implementation Steps

**Order note:** New feature area — no hard dependency on other files, but
Step 1 (appearance/color settings) makes more sense once the general theming
work in `08-general-and-support.md` is at least scoped, since both touch
theme-driven coloring. Step 2 depends on `05-taskmanager.md` Step 5.

---

## Step 1: Add appearance settings with live preview

**Problem:** No plugin settings currently exist for adjusting appearance.

**Proposed solution:** Build a standard Obsidian plugin settings tab allowing
the user to adjust interface colors/appearance, with a live preview of how the
change will look before it's applied.

**Acceptance criteria:**
- Settings tab registers correctly in Obsidian's plugin settings.
- Color/appearance options are adjustable.
- A preview updates live as the user changes values, before committing.

**Files likely touched:** New Settings tab component, plugin settings schema.

---

## Step 2: Add toggle for Task Manager's break mode

**Problem:** There's no way to activate/deactivate the Task Manager's break
mode feature from Settings.

**Proposed solution:** Add a toggle in Settings to enable/disable break mode
entirely (distinct from the Forced Breaks toggle in
`05-taskmanager.md` Step 5 — confirm with the user whether these should be the
same toggle or two separate ones, since the source notes mention both).

**Acceptance criteria:** Toggle exists and correctly enables/disables break
mode functionality in the Task Manager.

**Files likely touched:** Settings tab component, Task Manager break logic.

**Depends on:** `05-taskmanager.md` Step 5 (Forced Breaks toggle) — implement
together or clarify the relationship between the two toggles first.
