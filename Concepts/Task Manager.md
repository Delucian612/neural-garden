## Task Manager Concept
[[02 Notes/Notebook concept|Notebook concept]]
### Graphical Build-Up
The Graphical Interface of the Task Manager is built up in the following way

#### Line-by-Line Static Build up:
1. "Add New Task" Headline, indicating the Taskmanager, on the very right, a "Overdrive Mode" button: if OverdriveAvailabilty is true, bordercolor && text will be(#00F0FF) else if its false its (#DDDDFF), Textcolor = normal textcolor
2. **TaskInput**: Inline Text input with "Task" as a Placeholder, THe TaskInput field is stylised the following way 
	descInput.style.border = "1px solid var(--background-modifier-border)";
	descInput.style.backgroundColor = "var(--background-primary)";
	descInput.style.color = "var(--text-normal)";

3. String "Effort" on the left side, and a EnergyProgressBar(displaying the % of the CurrentEnergy/MaxEnergy) on the right side
4. EffortButtons(BorderColor) "Easy Peasy"(#3FD6FF), "Easy"(#39E05A), "Medium"(#F0A04C), "Hard"(#E06E2C), "Heavy"(#FF6565)
5. TaskList
	If Empty it will Display "add Tasks above"
	Tasks listed are listed the following way:
	Task Name on the left, spacing, then EffortLevel as a pill-shaped Badge(Easy peasy, Easy, Medium, yada yada), followed by a Edit Button, followed by a "X"(Color: (#FF6565)) to delete the task

A Border around Line 1-4 acting in following way:
	formDiv.style.gap = "8px";
	formDiv.style.padding = "10px";
	formDiv.style.borderRadius = "10px";
	formDiv.style.border = "2px solid rgba(236, 154, 99, 0.6)";
	formDiv.style.backgroundColor = "rgba(0,0,0,0.02)";

The General Background will be transparent

#### Visual effects
Typing in a Task into the Inline Text input and pressing one of the EffortButton Graphically makes following things happen:
- The clicked EffortButtons background will be highlighted in its border colour for a quick time, until released + 0.2 seconds, fading to transparent again
- Lists down that Task into the Task list, letting it slowly fade it at the first position possible, pushing the other tasks down one step, then highlighting the background for a second and then return the background value to transparent
- When A Task is completed by the User, it can be clicked(or tapped in case of mobile device), which lets a little motivational message(good Job, Another one done,... (5 different messages in total)) fade in stay for a second and then fade out again. as soon as the motivational message is gone, the task fades out and dissapears. The motivational message is being displayed in a pill form, have a (#F8B719) background and (#FFFFFF) text. Size should be The line height of the Task. 
- When the CurrentEnergy is 1.15x the MaxEnergy, a warning sign is shown next to the Energy bar
- The Progress bar changes its colours in a floating way. 
	const energyStops = [
	    { percent: 0,   color: [0x3F, 0xD6, 0xFF] },
	    { percent: 60,  color: [0x31, 0xC9, 0x50] },
	    { percent: 90,  color: [0xD0, 0x87, 0x2E] },
	    { percent: 100, color: [0xFB, 0x2C, 0x36] },
	    { percent: 115, color: [0xFF, 0x00, 0x00] }

Overdrive Mode
Clicking the Overdrive Mode Button will let following things  graphically happen (as long as the Overdrive Mode is active)
- The button will light up, declaring its activeness
- all other colours within the taskmangerinterface slowly transition to (#00F0FF)
- The size of the EffortProgressBars horizontal size will be 1.5 times longer, indicating the more energy availability

Forced Break
- As soon as A forced break gets triggered(in the way its listed below) all listed tasks will fade & vanish visually, being replaced with a Button "Break Mode" which forces the User to take a break. as soon as the button is pressed, a bigger Timer (about twice the line size) with the calculated Breaktime will run down. As soon as it hits 0 the Tasks will fade back in and the timer will vanish.
- During the Forced break, below the timer a message is displayed like "have a break" or "get some rest", a variation of atleast 5 sentences, motivating the user to effectively take a fucking break.
- If the user gets back into the app after the timer wouldve hit 0, the task manager checks wether or not it is time to displays the tasks again
- All colours of the Interface will decrease in saturation during the Forced Break time
- Tasks can not be added during that time, the buttons will have a little shaky effect, visually giving unfunctionallity as a feedback

"X" Button --> Delete Button
Pressing it will highlight the affected Task in Red, display a message "delete?", and display a Button "yes" next to the "X" Button. Pressing the Yes button will remove the Task from the list
___
### Technological / Mathematical / Programming Built up
Below describes the way the Taskmanager operates and is built up.
All Data Will be Stored, Read And written inside the frontmatter of the file "TaskManager.md" in the Folder "Mainentance/TaskManager". If the file/folder does not exist, it will be created

#### Variables in use
##### Base Variables
**MaxEnergy** = the maximum amount of available Energy
**TotalEnergy** = The total amount of all energy costs of the tasks Completed and not completed
**SpentEnergy** = Amount of completed Tasks
**Task** = [{TaskName, Energy: Amount, Completed:(boolean)}],

##### New Features

*Overdrive*
**OverdriveAvailablility**(boolean) = whether or not the overdrive is available
**Overdrive**(boolean) = Whether or not the Overdrive is currently active

*Forced Break*
**Resting**(Boolean) = indicates whether or not Resting is active
**ForcedBreak** = Gets triggered when the ForcedBreakThreshold is being executed by the ForcedBreakEnergy going above its value
**ForcedBreakThreshold** = Energy needed to trigger A Forced Break (for now maybe 50?)
**ForcedBreakEnergy** = Amount of energy gathered by completed tasks.
**ForcedBreakEnergyEx** = Value of ForcedBreakEnergy going above the ForcedBreakThreshold
**ForcedBreakAdd** = ForcedbreakEnergyEx / ForcedBreakThreshold
**ForcedBreakLength** = Predefined value for the lenght of a break (for the start we will go for 20 minutes)
**ForcedBreakTime** = ForcedBreakLenght + ForcedBreakLength x ForcedBreakAdd

#### Active Use
##### Task Creation
A Task is being typed into the TaskInput (2. Line in Line-By-Line Static Build up)
A Press on A Button(4th line in Line-by-Line Build Up) will create a Task and list it down below at the task list. (The Interface probably has to reload after that, so the task can be displayed properly, but not quite sure yet)
**The Button Values**:
- Easy Peasy: 5 Energy
- Easy : 15 Energy
- Medium: 30 Energy
- Hard : 50 Energy
- Heavy: 70 Energy

##### Task Edit
Pressing the Edit Button on a specific Task will "unlock" the name by making it an inline text field; making it writable, The edit button will change to a "save" button which saves the information typed into when being pressed on && changes back to the inactive "edit" button. The badges will become editable as well. Hovering over the affected energybadge, will make the other badges drop down, and selectable by clicking on them, changing the badge, and changing the tasks energy value in the taskmanagers frontmatter. 

Pressing the "x" will make following happen
A message appears on top of the Task Name:
"Do you want to delete this task?" 
The "x" button will be renamed to "cancel"
A button left to the "x/no" will appear, named "delete"
if delete is being pressed
	the affected task will be deleted from the Taskmanagers frontmatter
	vanish from the UI, by slowly fading into the colour (#FF6565), and then slowly fading to 100% transparency. Once thats reached it is gone, and the other tasks move up to fill the empty space
if "cancel" is being pressed
	the deletion process is being stopped and everything remains the same

##### EnergyProgressBar
Its % is being calculated by TotalEnergy / MaxEnergy
The Progressbar changes its colours in a floating was "energyStops"
When 115% Percent is reached a little Warning Icon is displayed on the left side of the progressbar indicating to CALM THE FUCK DOWN.

##### TaskCompletion
Pressing (Or clicking) the task following will happen:
- The TaskManagers Frontmatter will now add the completed Task **Energy: Amount** to the total **SpentEnergy** 
- The Tasks **Completed** will be set to true
- The Task will follow the Described visual effects above

#### Forced Break
If **ForcedBreakEnergy** reaches or goes beyond the **ForcedBreakThreshold** the **ForcedBreak** is being set to *true*, which hides the current tasks and instead displays a "Wind-Down" (and the duration the pause will have) which can be pressed. This will trigger the **Resting** to *true*. the button will disappear. A timer will Display the remaining time until the Task manager is working again. Task cannot be added during that time. The task managers interface is blocked, all colors of the task manager will lose 90% saturation, basically "gray" out. 
At the end of the **Resting** Mode, The **ForcedBreak** && **Resting** Values will return to false, allowing to operate the task manager in a normal way again. The Length and End of the Break will be determined and calculated with the help of the value **ForcedBreakTime** && **ForcedBreakLength**

**ForcedBreakTime** Will be calculated and executed in the following way:
If **ForcedBreakEnergy** goes beyond **ForcedBreakThreshold** it will start the **ForceBreak** procedure.
To know how long the Break is going to be it will calculate the breaks length in a following way:
We need some calculations before doing the main calculation before:
**ForcedBreakEnergyEx** = **ForcedBreakenergy** - **ForcedBreakThreshold** (this is to calculate the "Excess Energy" going above the Treshold)
**ForcedBreakAdd** = **ForcedBreakEnergyEx** / **ForcedBreakThreshold** (This will calculate a factor, to increase the breaks length by the amount over the Treshold)
And then finally the Time Calculation
**ForcedBreaktime** = **ForcedBreakLength** + **ForcedBreakLength** + **ForcedBreakAdd**


- **Example calculation**
- Starting **ForcedBreakEnergy** == *40 Energy* (in this test scenario) 
- **ForcedBreakLength** == *20 Minutes*
- **ForceBreakTreshhold** == *50 Energy*
- Task gets executed: Learning *70 Energy*
- New **ForcedBreakEnergy** == *110 Energy*
- **ForcedBreak gets triggered to true**
- **ForcedBreakAdd** == (*110 - 50*) / *50* = *1.2*
- **ForcedBreakTime** == *20 Minutes* + *20 Minutes* x *1.2* = *44 Min*
- As soon as the "Break" button is pressed:
- **ExecutedBreakTime** == *17:11*
- **ForcedBreakEnd** == *17:11* + *44 min* = *17:55*
- **ForcedBreakTimer** == *17:55* - *Current.Time* 

The calculation will rather go for a ending time, to avoid the timer not counting down when the app is closed. Then when coming back online and "resting" && "Forced Break" being true, it looks up wether or not its after that time to unlock the interface again.

### Overdrive Mode
- *Overdrive Mode*
	*Electric Blue Button in the TaskManagers Interface*
	*Can be pressed in case there is alot of things to do on that day*
	- Reads, Uses and controls following values:
		- **OverdriveMode** == true/false
		- **OverdriveAftereffects** == true/false
		- **OverdriveAvailability** == true/false
		- **MaxEnergy**
		- **ForcedBreakThreshold**
	- *When being pressed following happens*
		- Checks if **OverdriveAvailability** is True or false
			- if its *false* = nothing happens, little feedback "currently not available" button is generally greyed out
			- if its **true**
				- **OverdriveMode** == true
				- *TaskmanagerUI* will be Coloured cyan and "charged"
				- **MaxEnergy** will be doubled for that day
				- **ForcedBreakThreshold** will be doubled for that day
				- When doing the daily reflection, the **OverdriveMode** && **OverdriveAvailability** will be set to *false* and The **OverdriveAftereffects** will be set to *true*
					- If the **OverdriveAftereffects** are set to true, the **MaxEnergy** & **ForcedBreakThreshold** in the Journal entry executing the code will be will be halfed from its normal vaules  
				- If the next journal entry detects the **OverdriveAftereffects** a are being turned on it will turn them off again, normalising the values
	- The overdrive availability recharges to „true“ by the weekly recap. 