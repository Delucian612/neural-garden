# Home
## General
The Home note will always open whenever The App Starts or a new tab is being opened, as its being "the crossroad" to all of the functions the notebook as to deliver.

For simplicity and to reduce workloads for the ai, I might want to have the different parts of the Home note being programmed in their own code/file, and then just being placed / called within the home note. Making configuration and working on specific parts of the Home's more managable and easy. (Like Editing task manager does not require endless code to scroll through)


## Buildup
The width is the same as a normal note, making it behave almost everywhere identical and allowing for the same action area for everything.
The Home is being displayed in following order
1. Headline "Home"
2. Button Press Categories (Border color = #EC9A63, transparent background) && What they will do
	1. Journaling (left side)
		- Will Open the Journaling Interface (for now this will do nothing, but only show a placeholderbutton)
	2. My Notes (right side)
		- Will open the MyNotes Interface (for now this will do nothing but only show a placeholderbutton)
	3. Settings (left side)
		- Will Open the Settings Interface (for now this will do nothing but only show a placeholderbutton)
	4. +QuickNote (rightside) (concept in Main Concept.md)
	5. Weekly Recap (Only showing, when there is a certain amount of journal entries, and with the bordercolor (#00F0FF))
		- Will Execute A Weekly Recap (for now this will do nothing but only show a placeholderbutton) (Centered below the others)
3. Search Bar, being able to search for Notes containing tags, names of notes or some sort of OCR(if doable efficiently), listing affected notes below 
4. Task Manager (Concept in Task Manager.md)

Due to this whole concept being pretty interchangable, stuff can be added and removed easily.
___

### Button Styling and Graphics in 2. "Button Press Categories"
function makeButton(label, iconName, onClick, color = "#EC9A63") {
    const btn = document.createElement("button");
    btn.style.padding = "16px";
    btn.style.borderRadius = "10px";
    btn.style.border = `1px solid ${color}`;
    btn.style.background = "transparent";
    btn.style.fontSize = "14px";
    btn.style.width = "100%";
    btn.style.cursor = "pointer";
    btn.style.color = "var(--text-normal)";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.gap = "8px";
    btn.style.transition = "all 0.15s ease";

    const icon = makeIcon(iconName);
    const text = document.createElement("span");
    text.textContent = label;
    btn.appendChild(icon);
    btn.appendChild(text);

    btn.addEventListener("mouseenter", () => {
        btn.style.borderColor = "#FFD2B0";
        btn.style.boxShadow = "0 0 0 2px rgba(236, 154, 99, 0.25)";
    });
    btn.addEventListener("mouseleave", () => {
        btn.style.borderColor = color;
        btn.style.boxShadow = "none";
    });
    btn.addEventListener("touchstart", () => {
        btn.style.borderColor = "#FFD2B0";
        btn.style.boxShadow = "0 0 0 2px rgba(236, 154, 99, 0.25)";
    });
    btn.addEventListener("touchend", () => {
        setTimeout(() => {
            btn.style.borderColor = color;
            btn.style.boxShadow = "none";
        }, 150);
    });
    btn.onclick = onClick;
    return btn;
}