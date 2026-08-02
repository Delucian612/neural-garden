import { PluginSettingTab, Setting } from "obsidian";
import type NeuralGardenPlugin from "./plugin";
import type { OnboardingDemoState } from "./onboardingDemo";
import type { WalkthroughSection } from "./walkthroughs";

export type NeuralGardenSettings = {
  breakModeEnabled: boolean;
  generalColor: string;
  hoverColor: string;
  highlightColor: string;
  onboardingCompleted: boolean;
  onboardingDemo: OnboardingDemoState | null;
};

export const DEFAULT_SETTINGS: NeuralGardenSettings = {
  breakModeEnabled: true,
  generalColor: "#ec9a63",
  hoverColor: "#ffd2b0",
  highlightColor: "#00f0ff",
  onboardingCompleted: false,
  onboardingDemo: null,
};

export type AppearanceSettingKey = "generalColor" | "hoverColor" | "highlightColor";

export const APPEARANCE_SETTING_KEYS: AppearanceSettingKey[] = [
  "generalColor",
  "hoverColor",
  "highlightColor",
];

export const APPEARANCE_CSS_VARIABLES: Record<AppearanceSettingKey, string> = {
  generalColor: "--ng-color-general",
  hoverColor: "--ng-color-hover",
  highlightColor: "--ng-color-highlight",
};

export class NeuralGardenSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: NeuralGardenPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Neural Garden" });
    containerEl.createEl("h3", { text: "Appearance" });

    this.addColorGroup(
      "General buttons and borders",
      "Normal button borders, navigation, interface borders, and unassigned indicator lines.",
      "generalColor",
    );
    this.addColorGroup(
      "Hover",
      "Hovered button borders and their matching glow.",
      "hoverColor",
    );
    this.addColorGroup(
      "Highlights",
      "Available actions, current dates, and selected calendar days.",
      "highlightColor",
    );
    new Setting(containerEl)
      .setName("Restore all original colors")
      .setDesc("Return every color group to the original Neural Garden palette.")
      .addButton((button) => button
        .setButtonText("Restore all")
        .onClick(async () => {
          await this.plugin.resetAllAppearanceColors();
          this.display();
        }));

    containerEl.createEl("h3", { text: "Breaks" });
    new Setting(containerEl)
      .setName("Break mode")
      .setDesc("Enable energy-based breaks, including the Task Manager lock and break timer.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.breakModeEnabled)
        .onChange(async (value) => {
          await this.plugin.setBreakModeEnabled(value);
        }));

    containerEl.createEl("h3", { text: "Help and onboarding" });
    new Setting(containerEl)
      .setName("Full introduction")
      .setDesc("Replay the complete explanation without creating temporary demo data.")
      .addButton((button) => button
        .setButtonText("Replay")
        .onClick(async () => {
          await this.plugin.replayFullWalkthrough();
        }));

    let selectedSection: WalkthroughSection = "home";
    new Setting(containerEl)
      .setName("Section walkthrough")
      .setDesc("Choose the part of Neural Garden you want explained.")
      .addDropdown((dropdown) => dropdown
        .addOption("home", "Home and Task Manager")
        .addOption("mynotes", "MyNotes")
        .addOption("mylearning", "MyLearning")
        .addOption("journaling", "Journaling")
        .setValue(selectedSection)
        .onChange((value) => {
          selectedSection = value as WalkthroughSection;
        }))
      .addButton((button) => button
        .setButtonText("Replay")
        .onClick(async () => {
          await this.plugin.openWalkthrough(selectedSection);
        }));
  }

  private addColorGroup(
    name: string,
    description: string,
    key: AppearanceSettingKey,
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(description)
      .addColorPicker((picker) => picker
        .setValue(this.plugin.settings[key])
        .onChange(async (value) => {
          await this.plugin.setAppearanceColor(key, value);
        }))
      .addButton((button) => button
        .setButtonText("Reset")
        .onClick(async () => {
          await this.plugin.resetAppearanceColor(key);
          this.display();
        }));
  }
}