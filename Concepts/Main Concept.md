# Neural Garden - Concept

The Neural Garden should act as a extension of Obsidian, adding some features, which make it feel a little better to operate, but also some mental health aspects, supporting various parts of the life.

  

This Plugin exists because I exist, needing support in some parts of my life. Having figured out technology can help me with that I am now determined working on what can help me, and maybe even help others.

  

The Plugin consists of following parts.

  

___

  

## Main Page / Home Page

In here the User can directly navigate to the different Categories/Topics per button-press.

While also offering a User Interface for other "good to have on start up" things

This Page should be the start up page, as well as when opening a new tab

  

### Final and Set "Button-Press" categories / Topics

- Journaling

- My Notes

- Settings

- Weekly Recap (only showing, when there is a certain amount of Journal entries)

### Final Interfaces

- Task Manager

- Current Focus

- Search Bar after the Home Categories, being able to search for notes containing tags, names, or just some sort of ocr

  
More To the Main Page / Home Page in its concept note

___
## Journaling

### Daily Journal

Using Obsidians "Daily Note" function for that.

Might be in dependency of the templater plugin

  

The Daily Journal makes it easy to have plenty of important information being filled out in a short time.

It currently has following build up:

**Daily Check-In**

Using ProgressBars and buttons to determine the current mood / symptoms

The Daily check in ends with a "A few words about today, in which there is a text input field, letting the user write some compressed information down about this day.

**Tracker**

A horizontal sliding calendar like interface making self-set tracking-goals clickable, seeing the current and past trackings'

  

**Current topics**

The current self set topics listed down verticall

One Note per line

Notes are clickable and will lead to the said Note

At the end of the list there is a selection possibility with:

"I have made progress in the above topics" / I have not made progress in the above topics

  

Interactive ProgressBars and other methods are being used to evaluated and reflect the days symptoms / mood

If buttons are being clicked(to mark them as active) they are being highlighted

  

**Entry**

A Button "start writing" brings the user to be able to write freely, as much as he wants to, without any information being stored anywhere

  

**Tasks**

Writes down the completed and uncompleted Tasks of that day and the Effortlevel next to it

  

#### Daily Check-In

The value of the daily check in is stored in the frontmatter of the note, making it easier to grab later

- Mood (5 smiley faces going from frowning to happy)

- Sleep (progressbar)

- Stress (progressbar, getting more red the fuller)

- Anxiety (progressbar, getting more red the fuller)

- Regulation (Question: how good were you able to regulate yourself today?" answer via buttons: "Good" "alright" "Struggling" "Dysregulated" "overwhelmed")

- Sensory Load (Question: Have you had any sensory issues, multiselect Yes/No, if yes is being clicked buttons appear which can be pressed: "slightly, Medium, Heavy, Overload)

- Social Load (Question: "How tiring were social interactions, how did they make you feel?" answer via buttons: Easy, Alright, Tiring, Exhausting)

The Daily check in ends with a "A few words about today, in which there is a text input field, letting the user write some compressed information down about this day. This should be limited to about 150-200 letters. the *note* is stored in the frontmatter

  

#### Tracker

A tracker having the current (set) trackers on the left side listed down, on the right side there is a calendar showing the past x days. It should work similar to the "Habit Tracker 21" plugin from zincplusplus, with the difference of being able to create trackers in the interface itself. having a little empty gap on the top left corner. A little textinput field, a colour selection (to make clear which colour the dots have in the calendar) and a "+" to add a tracker.
#### Current topics

Notes within a specific folder will be listed down, currently following code is being used:


```
LIST FROM "04 Seeding"

WHERE file.name != "Seeding"
```

however, this will probably change
### Weekly Recap

Takes all of the information within the Daily Journal, calculates the values, gives an output and executes different operations

(Like Adapting the max_energy when the AverageSpentEnergy is above the old leves)

  

More to the Journaling in its concept note.

___

## Task Manager

The Task Manager is a significant part of the whole construct.

Tasks can be created by writing them down in the line and clicking(or tapping) the Effort level the individual task has

That task is then placed below the interface in a list, being able to be clicked to finish it or edited to change its name or the effort level

A ProgressBar is showing the current Energyusage of all tasks in comparison to the Max energy

  
More to the task manager in its concept note.

___

## QuickNote

A Button in the Home page, Clicking it will open an interface, having an 1line TextInput as a naming thing and a bigger textinput for the actual text, to make it possible to instantly write down a Note. Pressing "save" will Save the note with the Name in the nameing thing and the text down below into a specific folder, and categorizing it into the "Quick Note" Category which can be accessed through the category manager


___

  

## MyNotes

This will be one of the main differences to the usual Obsidian behaviour, Using a category interface to display Notes within this category, and to naturally link them in a quite easy way.

  

More about the MyNotes(and QuickNote) Function will be in its concept note

___