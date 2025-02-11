#!/usr/bin/env node

const { main } = require("../lib/utils");
const { InstallationLogger } = require("../lib/InstallationLogger");

const logger = new InstallationLogger();

process.on("uncaughtException", (error) => {
  logger.logError(`Erreur non gérée: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.logError(`Promesse rejetée non gérée: ${error.message}`);
  process.exit(1);
});

main().catch((error) => {
  logger.logError(`Erreur générale: ${error.message}`);
  process.exit(1);
});
