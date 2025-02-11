const chalk = require("chalk");

class InstallationLogger {
  constructor() {
    this.startTime = Date.now();
    this.totalSteps = 0;
    this.currentStep = 0;
  }

  init(totalSteps) {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    console.log("\n=== Début de l'installation ===");
    console.log(`Nombre total de packages à installer: ${totalSteps}\n`);
  }

  drawProgressBar(percentage) {
    const width = 40;
    const completed = Math.floor(width * (percentage / 100));
    const remaining = width - completed;
    const bar = "█".repeat(completed) + "░".repeat(remaining);
    process.stdout.write(`\r[${bar}] ${percentage.toFixed(1)}%`);
  }

  logStep(message) {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    console.log(`\n[${timestamp}] ${chalk.blue("📍")} ${message}`);
  }

  logSuccess(message) {
    console.log(`\n ${chalk.green("✅")} ${message}`);
  }

  logError(message) {
    console.error(`\n ${chalk.red("❌")} ${message}`);
  }

  logInfo(message) {
    console.log(`\n ${chalk.blue("ℹ️")} ${message}`);
  }

  logWarning(message) {
    console.log(`\n ${chalk.yellow("⚠️")} ${message}`);
  }

  logSuggestions(suggestions) {
    console.log(`\n ${chalk.blue("💡")} Suggestions de packages similaires:`);
    suggestions.forEach((pkg, index) => {
      console.log(
        `   ${index + 1}. ${chalk.green(pkg.name)} (${
          pkg.downloads
        } téléchargements) - Similarité: ${(pkg.similarity * 100).toFixed(1)}%`
      );
    });
  }

  updateProgress(step, packageName) {
    this.currentStep = step;
    const percentage = (step / this.totalSteps) * 100;
    this.drawProgressBar(percentage);
  }

  showSummary(success, failed) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log("\n\n=== Résumé de l'installation ===");
    console.log(`${chalk.blue("⏱️")}  Durée totale: ${duration} secondes`);
    console.log(
      `${chalk.green("✅")} Packages installés avec succès: ${success}`
    );
    console.log(`${chalk.red("❌")} Échecs d'installation: ${failed}`);
  }
}

module.exports = { InstallationLogger };
