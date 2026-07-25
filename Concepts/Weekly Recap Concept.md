# How do I want to Build the Weekly Recap?

## What Effects should the Weekly recap have?
The Weekly Recap should have following Effects. 

### Calculations
- Recalculate the Task-Managers Break-length & Frequency as well as the general Availability, based on
	- Average Stress
		- If Stress is above a certain value(for now 60,70,80,90), the forcedBreakThreshold decreases by  (for now 1.1, 1.3, 1.5, 1.7), leading to a higher frequency
		- If stress is below a certain value(for now 30,20,10), the forcedBreakThreshold increases(for now by 1.1, 1.3, 1.5), leading to less frequent breaks
	- Average Exhaustion
		- If Exhaustion is above a certain value(for now 60,70,80,90), the forcedBreakLength get longer by (for now 1.1, 1.3, 1.5, 1.7) times
		- If Exhaustion is below a certain value(for now 30,20,10), the breaks get shorter by x(for now 1.1, 1.3, 1.5) times
	- Average **Completed** Tasks Energy
		- Will always adapt to the months baseline. Meaning:
			- In the Monthly recap a TaskEnergy variable is set, defining a base level (e.g. monthly average energy = 120; BaseTaskEnergy = 120)
				- If the BaseTaskEnergy does not exist yet, due to having just started the notebook, its gonna be 120 for now.
			- The BaseTaskEnergy will be doubled, then added to the weekly average Energy to then get devided through 3, so there is a certain "middle ground", which makes the energy not spike to much up & down
			- Example 1: BaseTaskEnergy = 120; WeeklyAverageEnergy = 150
				- **new** maxEnergy = ((120 x 2) + 150) / 3
					- maxEnergy = 130
			- Example 2:: BaseTaskEnergy = 150; WeeklyAverageEnergy = 220
				- **new** maxEnergy = ((150 x 2)+220) / 3
					- 173.33
			- Example 3: BaseTaskEnergy = 165; WeeklyAverageEnergy = 95
				- **new** maxEnergy = ((165 x 2)+95) / 3
					- 141.66
- Journal calculations
	- AvgMood = the average Mood throughout the processed days
	- AvgSleep = the average Mood throughout the processed days
	- AvgRegulation = the average Regulation throughout the processed days
	- AvgStress = the average Stress throughout the processed days
	- AvgAnxiety = the average Anxiety throughout the processed days
	- AvgExhaustion = the average Exhaustion throughout the processed days
	- AvgSensory = the average Sensory Load throughout the processed days
	- AvgSocial = the average Social Load throughout the processed days
- Emotions
	- How often each Emotion appeared
	- How much of the positive emotions happened vs how often the negative emotions happened (count)
- Tracker
	- Which tracker has been ticked off how many times
- All Daily Journals within the Week will be used for the Weekly Recap. 
    - The Frontmatter value "processed" of the Daily Journals used will be set to true. indicating they have been used. (i dont know why, but i just want that to be done)
____
### We have some numbers, what now?
When Pressing the Weekly Recap Button (Weeknumber highlighted) It will instantly go into the Note (Like Open it, not "previewing" it). Then When Opening the weekly Recap for the first time(like really for the first time. If its been opened after creation its not having all the dynamic build up), It will start completely Blank. A Heading "Weekly Recap" will fade in, below it A Button(No buttonBorder, no Shadow, No Buttonbackground, Just Plain text) "Generate My Weekly Recap" will be displayed. Hovering over it will make highlight in Cyan.
Pressing it will make the Button dissapear, And start the calculations in the background. A "Take a deep Breath In" will slowly fade in, then a number counter 1 --> 2 --> 3 --> 4 will appear below. As soon as it hit the 2 It will slowly fade out, being gone after 4 to then have a  "Hold" fade in, once again with then with a number counter below it 1 --> 2 --> 3 --> 4, starting to fade out when the counter hit 2, being gone at 4 and last but not least "Breathe Out" fading in a little bit faster, directly fading in the timer below but this time counting down from 5 --> 4 --> 3 --> 2 --> 1, both vanishing and the weekly summary will start to face in, but only the Symptom Recap (Mood, Sleep, Regulation, Stress, Anxiety, Exhaustion, Sensory Load, Social Load) slowly rolling up. The Special thing here 
First The system is going to Display the average values of each symptom with the help of a progressbar, The Buildup should be similar to the one in the Journal Entry. The important thing here:
Each Symptom is fading in individual, displaying the Name of the symptom, then the progressbar and then a text describing the value like "your Mood has been great, keep doing what kept you grounded" or something like that. SymptomName, Progressbar, and  description Text each have a 0.3 sec delay of *fading in*. When its fully displayed, its gonna wait for 0.3 sec and then display the next symptom. Up until the Point it listed all of the symptoms, Progressbars and DescribingText.
Scrolling down, will make it reveal the next sections Emotions & Tracker.
First Emotions:
A Kind of Progressbar is gonna fade in. The Progressbar is split in the middle, When its going left, its red, when its going right its green.
The system now looks how often positive emotions have happened and how often negative emotions have happened in total. If the positive emotions outweigh, the Bar is going to the right "positive", If the negative outweigh its going to the left side. 
Below the Emotions "ProgressBar" the according Emotions will slowly pop up and fade in (Positive on the right, negative on the left) The more often an emotion has been present on that day, the bigger its size and more present it is in general.
What comes now is the tracker, showing all of the Tracker which have been ticked off during the affected days in its assigned color, once a gain the more often they appeared, the bigger they are, And Highlighting the Tracker with the Highest number, kind of highlighting it as a "weekly Winner" making it glow/shine in gold 
If there are two(or more), the affected with the highest number will shine.
That is the end of the tracker system. The User now needs to actively scroll down again to reveal more information.
This is when the support system Strikes, slowly fading in.
"Support System" as a heading fading in
then "considering your current symptoms, you should take a look at following Notes" fading in
The Support system works as following:
Based on the weekly averages of a symptom or when a symptom has been in a critical range, the support system activates, going hand in hand with the MyNotes support Notes.
If the Weekly average of a symptom is within a critical range OR a Singular Entry has a **concerning** range the system will Grab a Note From the Support system, Listing it and the Symptom which made it be listed. Clicking the Note will open it in a new Window. Ranges will be defined in the next Section. Per Weekly Recap, Each SupportNote can only be listed once. (e.g. Meditation cannot be listed Twice even if would cover mood and sleep & Both are affected) 
If there are Critical Symptoms, not having a support note yet, the system Lists the symptom and displaying something alike "consider Working on a Solution for this problem"(But in Nice, psychological and more effective)
Each Support Note and its affected Symptom are fading in after each other, with a 1 sec. delay between them. a Maximum of 4 Support Notes is being shown. Support Notes will be placed into the Support Section within the Home note, after the old support notes (If there were any) were removed from the Support Section.
So To know which Notes Currently are within the Support section, the System Reads the state of the last created Weekly Recap, in whichs frontmatter those notes are being stored under the Value "SupportNotes". THEY SHOULD NOT BE IN BRACKETS, as I want to avoid some unnecessary Linking.
The system also has some "support hints" stored. Those are one-liners, with a quick Psychological effect, being released exactly like the Support notes, but will be highlighted and presented differently. Per symptoms, to grant variety, 1 of 5 different tips/hints are randomly chosen if an symptom is affected. Those have no limit. As the way they are being shown works a little different (described below)
### Support Section in the Home note
- Listed Support Notes from the Weekly Recap will be listed here.
- The Section will be below the Task Manager with some spacing between them
### Support Hints in the Home Note
- Listed Support Hints will be shown below the category select buttons
- They will fade in, stay for a couple of seconds, then fade out again to have the next support hint being shown.
	- it should be avoided to have 2 support hints being shown consecutively
	- The Hint shown will be randomly choosen
	- The fade-in, stay, fade-out should work similar to that to the task manager break messages

### Critical Ranges for average symptoms
#### Support Hints 
Due to Support hint being a soft-stabilizer, being rather perceived passively, its gonna activate its function earlier. It has following ranges:
average mood, sleep or regulation below 50
average stress, anxiety, exhaustion, sensory load or social load above 60
##### Critical Daily Range:
It also is acting if a single day is in a very critical range:
mood, sleep or regulation below 30
Stress, Anxiety, Exhaustion, Sensory Load, Social Load above 80

#### Support Notes
Due to Support Notes being a hard-stabilizer, which is rather being actively worked on than being passively perceived, the 

average mood, sleep or regulation below 35
average stress, anxiety, exhaustion, sensory load or social load above 70
##### Critical Daily Range:
It also is reacting when a single day is in a VERY critical range:
mood, sleep or regulation below 20
Stress, Anxiety, Exhaustion, Sensory Load, Social Load above 85
Affected Days are being shown, with the affected symptoms

#### Task Manager
The Last Section. The Taskmanager feedback displaying if the maxEnergy(but not using the variable name, but something more human) has increased or decreased, if the breaks got lengthened or shortened(no color) or if the breaks will be more frequent or less frequent. (but with nice wording), If nothing has changed, nothing has changed.

The VERY Very last section "Seeding" is a Textinput field, allowing the user to type in 2 things the user wants to next month (max characters: 15). Pressing the "Ok"(or something more fitting) makes the Textinputs Lock in, and then slowly vanish and fade out. The textinputs values will be stored in the notes frontmatter

All of the values calculated and written down will be placed in the week notes frontmatter. Able to be stored. As well as the Journal Entries being used for that weekly recap will  be listed in the weekly Notes Frontmater as [[Linked Note]] to connect them for the graph

## Preview
Like the daily Journals have a preview, the weekly recap ofc also get an preview, which will be shown by clicking once(the preview will open by clicking once WHEN the Recap has been created already. if it has not been created already it will go on with the procedure stated at the top)