# Neural Garden

Neural Garden began as a personal necessity.

Over the last 8 months, this project grew through constant trial and error while life felt difficult to manage. The goal was never to build another productivity toy. The goal was to build a support system that could actually hold up on hard days, reduce chaos, and make self-management possible with less friction.

## Why this exists

At first, Obsidian felt powerful but overwhelming. Too many possible workflows, too many clicks, too many decisions when mental energy was already low.

So Neural Garden moved toward a simpler interface made of focused graphical screens for specific actions. The Home view became the pathway: a stable starting point that routes into the things that matter most without forcing a long navigation chain.

## From overload to structure

A recurring pattern was clear: periods of overdoing things for weeks, then crashing into depression and low function.

I started with a weird way of journaling, tracking everything that seemed relevant and using tags to connect signals over time. Those tags became a map for emotions, symptoms, and energy, and slowly made it easier to notice links between internal states and external factors.

Journaling was the first real foundation in this Obsidian journey. It was originally used to reflect manually, detect patterns, and adjust behavior by hand.

Now that time is tighter, the Journal system is being shaped to capture the current state quickly and reliably. The intent is simple: fast input in the present, useful processing in the background. Parts of that automation are still in progress, but the direction is clear: future feedback loops should adapt behavior over time, including influencing Task Manager responses among other functionalities.

From that process, the Task Manager emerged as a natural consequence and solution. It addresses the energy problem step by step, treats tasks as energy-bearing actions instead of plain checkboxes, and introduces forced breaks when strain runs too high. The exact calculation stays out of the way; what matters is that the system helps prevent another long overpush cycle.

## What is implemented right now

### Journaling system

The current journaling flow is split into a Hub and an Entry view.

The Hub is calendar-based and built for quick navigation: you can browse entries by day, preview selected days, and open full entries. It supports current-day writing and yesterday backfill (for writing after midnight). The week starts on Monday, and week numbers are shown on the left side.

The Entry view is where the actual daily reflection happens. It includes symptom and state progress bars, emotion selection, a short note field, tracker interaction, task snapshots, and free-form writing. The goal is to collect relevant information quickly without forcing long manual processes.

### Task Manager

The Task Manager is based on energy, not only completion status.

Each task carries an effort level, and total daily load is tracked continuously. When strain rises too far, the forced break behavior is triggered to interrupt overuse early. This is meant to reduce the repeated pattern of overpushing for too long and crashing afterward. 

The system is intentionally practical: create tasks quickly, estimate effort, complete or edit tasks, and let the manager reflect the day’s overall demand in real time.

Values from the single Journal entries softly guide the TaskManagers behaviour, making it adapt to each person and each situation individually.

### Home note

The Home view acts as the plugin's central pathway.

Instead of navigating raw folders or many separate notes, the Home screen provides direct access to the main systems: Journaling, Task Manager, search, and category-based entry points. It is designed to lower friction when mental energy is low and make the next action obvious.

## Ongoing direction

Neural Garden is still evolving, but always toward the same promise: fewer decisions in moments of stress, clearer feedback over time, and tools that support recovery instead of draining attention.

## Ending Sentence

This plugin exists because I exist, and I needed support in parts of my life. Realizing that this technology could help, I became determined to build what supports me - and maybe, over time, supports others too.