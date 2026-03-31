#!/usr/bin/env node
import { PackageDatabase } from "./src/classes/PackageDatabase.js";
import { InstallationLogger } from "./src/classes/InstallationLogger.js";
import { ConfigManager } from "./src/classes/ConfigManager.js";
import { runInstall } from "./src/commands/install.js";
import { runFreeze } from "./src/commands/freeze.js";

async function main() {
  const args = process.argv.slice(2);
  const logger = new InstallationLogger();
  const packageDB = new PackageDatabase();
  const configManager = new ConfigManager();

  // Commande freeze
  if (args[0] === "freeze") {
    await runFreeze(logger);
    return;
  }

  // Commande install (par défaut)
  await runInstall(logger, packageDB, configManager);
}

// Gestion des erreurs
main().catch((error) => {
  console.error("❌ Erreur générale:", error.message);
  process.exit(1);
});
