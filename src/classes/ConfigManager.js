import fs from "fs";
import path from "path";
import { askUserContribution } from "../utils/cli-helpers.js";

export class ConfigManager {
  constructor(configPath = null) {
    this.configPath =
      configPath || path.join(process.cwd(), ".package-installer-config.json");
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de la configuration:", error);
    }
    return { willContribute: null };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la configuration:", error);
    }
  }

  async getWillContribute(logger) {
    if (this.config.willContribute === null) {
      const answer = await askUserContribution(logger);
      this.config.willContribute = answer;
      this.saveConfig();
    }
    return this.config.willContribute;
  }
}
