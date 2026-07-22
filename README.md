# Neural Garden

Neural Garden began as a personal necessity.

Over the last 8 months, this project grew through constant trial and error while life felt difficult to manage. The goal was never to build another productivity toy. The goal was to build a support system that could actually hold up on hard days, reduce chaos, and make self-management possible with less friction.

## Why this exists

At my first startup, Obsidian felt powerful but overwhelming. Too many possible workflows, too many clicks, too many decisions when mental energy was already low.
The first few journal entries and mechanics felt clunky and operated truly manually. I was reading every JournalEntry, looked at the correlating tags and wrote a summary, trying to find new ways. Slowly but surely over the span of a few months it became graphically more pleasant, but still remained fully manual.

In the past few weeks and months, The Neural Garden has moved toward a simpler interface involving some graphical inputs for specific actions. I was experimenting with sliders, which affected the frontmatter of a Note to actually store information, which could be read and processed. At some point, The Home view became a pathway leading me through Obsidian. However, sometimes the navigation chains still remained long, and things like creating a new topic became tedious, sometimes even including building up the notebook from scratch.

## From overload to structure

Each week some recurring patterns became clear: periods of overdoing things for weeks, not taking care of myself and my own mental health which then inevitably led to crashing into deep depression and low function.

As mentioned above, Journaling started in a weird way, trying to use the built-in functions of Obsidian, tracking everything that seemed relevant, using tags to connect important things over time. Those tags became a map for emotions, symptoms, and energy, and slowly made it easier to notice links between internal states and external factors. My Mental health slowly started to recover and I got more stable with every weekly reflection I did.

Journaling was the first real foundation in this Obsidian journey. The Notes I created while being on this journey accompanied the whole process. During the past months I have mainly focused on reflecting on myself, and created hundreds of Notes about Mental Health and Psychology among others. Working on the Notebook and the notebook concept also aligned with the intention of working on myself. However: I spent an enormous amount of Time doing so.

Now that time is tighter as the circumstances of life have changed, the whole system needed to be reshaped to capture the current state quickly and reliably, and have supporting measurements trigger depending on the values typed in. Fast input in the present, useful processing in the background. Parts of that automation are still in progress and will be implemented over time, but the direction is clear: future feedback loops should adapt to the behavior over time, including influencing Task Manager responses among other functionalities.

The Task Manager emerged as a natural consequence and solution of one of my exhaustion and "overload" problems. It addresses the energy problem step by step, treats tasks as energy-bearing actions instead of plain checkboxes, and now also introduces forced breaks when strain runs too high. The exact calculation stays out of the way; what matters is that the system helps prevent another long overpush cycle.

## What is implemented right now

### Journaling system

The current journaling flow is split into a Hub and an Entry view.

The Hub is calendar-based and built for quick navigation: you can browse entries by day, preview selected days, and open full entries. It supports current-day writing and yesterday backfill (for writing after midnight). The week starts on Monday, and week numbers are shown on the left side.

The Entry view is where the actual daily reflection happens. It includes symptom and state progress bars, emotion selection, a short note field, tracker interaction, task snapshots, and free-form writing. The goal is to collect relevant information quickly without forcing long manual processes.

### Task Manager

The Task Manager is based on energy, not only completion status.

Each task carries an effort level, and total daily load is tracked continuously. When strain rises too far, the forced break behavior is triggered to interrupt overuse early. This is meant to reduce the repeated pattern of overpushing for too long and crashing afterward. 

The system is intentionally practical: create tasks quickly, estimate effort, complete or edit tasks, and let the manager reflect the day’s overall demand in real time.

Values from single Journal entries softly guide the Task Manager's behavior, making it adapt to each person and each situation individually.

### Home note

The Home view acts as the plugin's central pathway.

Instead of navigating raw folders or many separate notes, the Home screen provides direct access to the main systems: Journaling, Task Manager, search, and category-based entry points. It is designed to lower friction when mental energy is low and make the next action obvious.

## Ongoing direction

Neural Garden is still evolving, but always toward the same promise: fewer decisions in moments of stress, clearer feedback over time, and tools that support recovery instead of draining attention.

## Ending Sentence

This plugin exists because I exist, and I needed support in parts of my life. Realizing that this technology could help, I became determined to build what supports me - and maybe, over time, supports others too.