import { PluginSettingTab, Setting } from "obsidian";
import type NeuralGardenPlugin from "./plugin";

export type NeuralGardenSettings = {
  forcedBreaksEnabled: boolean;
};

export const DEFAULT_SETTINGS: NeuralGardenSettings = {
  forcedBreaksEnabled: true,
};

export class NeuralGardenSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: NeuralGardenPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Forced Breaks")
      .setDesc("Automatically pause the Task Manager after enough completed-task energy accumulates.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.forcedBreaksEnabled)
        .onChange(async (value) => {
          await this.plugin.setForcedBreaksEnabled(value);
        }));
  }
}