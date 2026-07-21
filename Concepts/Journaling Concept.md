# Journaling Concept

The Journaling Concept supports everyday life by offering Daily Journal Entries, Weekly Recaps, and Monthly Reflections.

Each part has its own role and job to do. The Daily Journaling gathers useful data from everyday life. The Weekly Recap makes small adaptations and provides support based on the different symptoms. The Weekly Recap also offers the possibility to "plant seeds," a way to mark a possible topic that needs to be worked on in the next month. The Monthly Reflection reflects on whether symptoms have improved or become more stable. It gives feedback by comparing the weekly entries with each other and reacts to the data by suggesting different daily life adaptations, based on the symptoms. The Monthly Recap also processes the seeds planted during the Weekly Recaps.

### Journal Hub/Journaling

Here, past Daily Journals, Weekly Recaps, and Monthly Reflections can be accessed. A calendar at the top shows which days have a journal entry, by highlighting them in a color, and which don't. Clicking a day that has a journal entry opens that specific entry and shows its stats. If it's a past entry, the values can't be changed. If it's the current entry (same day, or no entry has been made since that day), it can still be edited.

### Daily Journals

_Daily Reflections_

#### Values Gathered & Needed

- **Mood**
- **Sleep**
- **Stress**
- **Anxiety**
- **Regulation**
- **Sensory Load**
- **Social Load**
- **SpentEnergy** (grabbed from TaskManager.md)
- **Completed and Uncompleted Tasks**
- **Processed** (boolean)

##### Selectable Emotions

**Pleasant emotions**

- Happy
- Relaxed
- Excited
- Grateful
- Proud
- Settled
- Inspired
- Serene
- Confident

**Unpleasant Emotions**

- Frustrated
- Anxious
- Overwhelmed
- Sad
- Angry
- Lonely
- Irritated
- Overwhelmed

#### Page Buildup

When starting a journal entry, a mask (overlay/pop-up form) appears. The headline reads "Journal Entry" plus today's date (written like "20th of July, 2026") and is centered. Below that is a divider line. Then a smaller headline: "Daily Check-in." Below it, in normal text: "How have you been doing today?"

The user now sees a few interactive progress bars, whose values can be set by increasing or decreasing them, tapping, clicking, or dragging along the bar. The bars change color, with a smooth transition, as they fill up. Below each affected progress bar is a text that makes it easier to interpret the value before any input has been made ("BarExplain").

These progress bars are used for the following values:

**Mood** — 20% Red, 50% Yellow, 90% Green, >90% Orange BarExplain: "How have you been feeling today?"

**Sleep** — 20% Red, 50% Yellow, 90% Green BarExplain: "How rested did you feel after tonight's sleep?"

**Stress** — 20% Green, 40% Yellow, 60% Orange, 80% Red BarExplain: "How stressed were you today?"

**Anxiety** — 20% Green, 40% Yellow, 60% Orange, 80% Red BarExplain: "Have you been anxious today? How intense was it?"

**SensoryLoad** — 20% Green, 40% Yellow, 60% Orange, 80% Red BarExplain: "Have you had any sensory issues? How intense were they?"

**SocialLoad** — 20% Green, 40% Yellow, 60% Orange, 80% Red BarExplain: "How demanding were social interactions today? How much energy did they draw from you?"

#### Selectable Emotions

This section lets the user select up to 5 emotions that best represent and describe the day. These are listed in two categories: pleasant and unpleasant emotions. The user can click on the buttons (which use a soft style, with no background) to highlight the chosen emotions. Pleasant emotions have a green border color, unpleasant emotions an orange border color. When an emotion is active, its background is highlighted in a softer version of the border color (green border → soft green/teal background; orange border → soft orange background).

##### Progress Bar Direct Feedback

To make it easier for the user to fill out the progress bars, direct feedback appears as text, replacing the "BarExplain" text, as if answering the question ("BarFeedback"):

**Mood**

- BarFeedback >80%: "I've been doing great"
- BarFeedback >65%: "I've been doing fine"
- BarFeedback >50%: "I've been alright"
- BarFeedback >35%: semi-bad mood sentence
- BarFeedback <35%: bad mood sentence

**Sleep**

- BarFeedback >80%: "My sleep was great, I feel well rested"
- BarFeedback >65%: "My sleep was good, I feel rested"
- BarFeedback >50%: "My sleep was alright"
- BarFeedback >35%: "I've been struggling, my sleep wasn't very restful"
- BarFeedback <35%: "I've had a terrible night"

**Stress**

- BarFeedback >80%: "I've been constantly stressed today" (or an equivalent sentence expressing high stress plus a sense of struggling)
- BarFeedback >65%: "I was really stressed today"
- BarFeedback >35%: soft stress sentence
- BarFeedback <35%: good stress sentence

**Anxiety**

- BarFeedback >80%: "I've been constantly and severely anxious today"
- BarFeedback >65%: "I was really anxious today"
- BarFeedback >35%: soft anxiety sentence
- BarFeedback >20%: "I've been a little anxious today"
- BarFeedback <20%: "I had low or no anxiety"

**SensoryLoad**

- BarFeedback >80%: "I was in sensory overload today"
- BarFeedback >65%: "I've had demanding sensory issues today"
- BarFeedback >35%: "I've had medium sensory issues"
- BarFeedback >20%: "I've had some sensory issues today"
- BarFeedback <20%: "I've had no or low sensory issues"

**SocialLoad**

- BarFeedback >80%: "Social interactions were highly demanding, wearing me out"
- BarFeedback >65%: "Social interactions were exhausting"
- BarFeedback >35%: "Social interactions were tiring today"
- BarFeedback >20%: "Social interactions were alright, but still a little tiring"
- BarFeedback <20%: "Social interactions felt good, easy, and natural"

#### A Few Words About Today

A text input lets the user type a few core moments from today, with a limit of 256 characters. The limit is displayed and shows how many characters are left (e.g., "75/256").

#### Tracker

A tracker showing the currently set trackers listed vertically on the left side, with a calendar on the right side showing the past x days. It should work similarly to the "Habit Tracker 21" plugin by zincplusplus, with the difference that trackers can be created directly within the interface. There's a small empty gap in the top-left corner, where a small text input field is placed, along with a color selector and a "+" button to add a tracker.

When a tracker is created, it creates a note with the tracker's name in the "Maintenance/Tracker" folder. If the folder doesn't exist, it is created; if it already exists, nothing happens.

When an event is created by clicking a spot on the calendar, the date is saved in the note's frontmatter, and a circle in the tracker's color code is placed at that spot on the calendar. If events happen on subsequent days (for example, Irritation on the 20th and 21st of July), the dots connect, showing a streak number.

The tracker also loads all data from the notes in the "Maintenance/Tracker" folder, so the user can always see the progress/tracking of past days.

The list should show a maximum of 18 entries total.

#### Tasks

The completed and uncompleted tasks are listed here, with the energy badge shown next to each one.

#### Entry

A text input for the entry follows, letting the user write down whatever they want.

---

### Storing the Data Somewhere

Since none of this can be handled in a normal markdown file, a different approach is needed.

Creating a journal entry creates a markdown file named after the date (YYYY-MM-DD) inside the "Journal/Daily" folder. This markdown file holds all of that day's data within its frontmatter, so it can be accessed/processed later. Below the frontmatter, there is an H1 heading, "Entry." Every word typed into the Journal UI's Entry text input is placed there. To avoid relying on a save function, and to avoid risking loss of the typed message if the app is accidentally closed, it is written live as it's typed.

---

### What Data Is Stored and How?

- **Mood**: value 0–100
- **Sleep**: value 0–100
- **Stress**: value 0–100
- **Anxiety**: value 0–100
- **Regulation**: value 0–100
- **Sensory Load**: value 0–100
- **Social Load**: value 0–100
- **SpentEnergy**: value grabbed from TaskManager.md
- **Completed Tasks**
- **Uncompleted Tasks**
- **Processed** (boolean) — always false on creation; needed for later use
- **Today's Note (A few words about today)**: string
- **Emotions**: selected emotions are listed here

---

### What Else Happens When a Journal Entry Is Executed?

- TaskManager values get reset: totalEnergy, spentEnergy, tasks, ForcedBreakEnergy
- TaskManager: if OverdriveMode was true, it is set to false, and OverdriveAftereffects is set to true
- TaskManager: if OverdriveAftereffects was true, it is set to false