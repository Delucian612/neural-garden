# MyNotes
## General
MyNotes is a Plattform(just like Journaling is a platform), which is being used to Access the notes in a efficient way. It uses Categories(which can be created or deleted) listing down the Notes within this category when selected. It is also introducing "Support Notes" which is another functionality, working hand in hand with the Journal.

## What I want it to do
I want to be able to go into the MyNotes Platform, having all of my categories listed. pressing on one category makes all of the Notes which are  [[Linked]] with this category be listed down. It is equipped with a search bar as well. If a category is selected the search bar will only display searched notes within this category, if no category is selected, the input is working like in the home note
I want to be able to press on a heart icon on a note(located on the left side), marking it as favourite(adding "favourite: true" to the notes frontatter). 
The favourite category is at the very start of all existing categories. Pressing the "favourite" category button will display all notes within the notes folder with the "favourite",
I also want to be able to delete The Notes, by pressing a red cross on the very right of the displayed note(for fallback it should ask if the note should be deleted with a selfbuilt UI, not relxing on obsidians pop-up function).
New notes can also be Created here.

I also want to be able to access "Support Notes" via the Support categories. Those are the symptoms asked about in the journal entry (Mood, Sleep, Regulation, Stress, Anxiety, Exhaustion, Sensory Load, Social Load). The support section will be below the normal category section, with a bit of space between them

Through The MyNotes Interface I also want to be able to access "Learning", which is a seperate Interface optimised for Learning. But I will be working on that later.


## The Technological buildup
### MyNotes Buildup
All Notes Created with the "{NotePlusIcon} New" Button will be within the "Notes" Folder. On clicking the button a window is going to pop up (not the internal Obsidian Window, but a self styled one) Having a Textinput field & A "Create" Button. The Text typed into the textinput will be the new notes name.
Pressing the Create button will create the new note inside the Notes folder and open it directly. The Note will NOT be another interface but actually a normal markdown file

Available Categories will be grabbed from the Note "Categories" inside the "Maintenance/MyNotes" Folder (If not available, it will be created, if available; pass)



### Individual Note Heading
The created markdownfile will have a page header equipped with different buttons.
On the very top left side, there are two buttons "Home" which brings the user back to home and "<- MyNotes" directing the user back to MyNotes. They are on top of each other. Home being at the top, and MyNotes below it. 
Then there is a one line spaceing
Next Line has the heading "Categories" on the very left and a "Add Category" Button on the very right side. Pressing the Add Category button will have a textinput and a "+" button on its right side pop up below it. Typing the categoryname there and pressing the "+" Button Will do the following
- Add That category in the notes frontmatter value "category", this frontmatter is build up in a list. The Category Name is in doubleSquare Backets: [[Categoryname]]
- Add that Category into the frontmatter of the File "Categories" inside the "Maintenance/MyNotes" folder (If not available, it will be created)
	- This ensures Cloudsync is working properly as internal plugindata does not get transfered with Obsidian cloud sync
- The Created category will be listed down below as an active button, indicating its connection
- Categories can be selected or unselected dynamically, adding or removing that category to the Notes frontmatter AND adding or substracting the number count to the category counter of the frontmatter of the note"categories" within the folder "Maintenance/MyNotes"
- Available categories are listed horizontally, with a linebreak if the categories have reached the documents width
- Multiple Categories can be selected
- Below the Categories there is a small heading "Support Note" box that can be ticked, indicating wether or not the Note is being declared as a support note
	- Ticking that box will display the existing Support categories and make the value "SupportNote" in the notes frontmatter set to true.
		- unticking the box will make the support notes vanish again and set the SupportNote value to false
		- selecting a support note will add that support note to the Notes Frontmatter; multiple selections can be made

## Graphical Build-up
The Interface starts with a Home Button on the left side and a "Learning" Button on the right side.
One Line below the centered Heading "MyNotes" will follow, having normal text color. 
A light heading on the left side "Categories" comes next followed by the listed categories below indicating the start of the Categories section. On the right side in the same line there will be a "{NotePlusIcon} New" Button to create a new Note
All created Categories are listed there chronologicaly
the build up is horizontally. As soon as the line is full the next line with categories will start. Available categories will be grabbed from the Frontmatter of the Note "Categories"
The Special things about the listed categories: The more notes are in a certain category, the bigger/more present the category button will be.
To not have to scan through each note everytime the amount of notes within the category will be grabbed from the Frontmatter of the note "Categories" within the folder "Maintenance/MyNotes"
The size will be calculated by getting the average notes within a category. This amount will define the average size, Everything above will increase in size/presence everyhting below will decrease in size/presence.
The categories section will end here. The Category Section will be framed in a border with the Whole systems Main colour
Clicking on a category will highlight it, indicating its activeness. clicking another category will unselect the old category and ofc highlight the newly selected one

___

Below The category section the Support note section will start
There is a little space after the category section
A "Support Notes" headline, anchored on the left side will be on the first line
Followed by the listed Support Categories, listed horizontally not growing in size
Support categories are the Sympoms tracked in the Summary
Those support categories have different colors:
- Mood : green
- Sleep: light blue
- Regulation: Puple
- Stress: Orange
- Anxiety: Red
- Exhaution: little Darker Blue
- Sensory Load: Yellow
- Social Load: Pink (EC407A)
Support Note Categories are listed horizontally