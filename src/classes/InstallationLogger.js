export class InstallationLogger {
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
    console.log(`\n[${timestamp}] 📍 ${message}`);
  }

  logSuccess(message) {
    console.log(`\n ✅ ${message}`);
  }

  logError(message) {
    console.error(`\n ❌ ${message}`);
  }

  logInfo(message) {
    console.log(`\n ℹ️ ${message}`);
  }

  logWarning(message) {
    console.log(`\n ⚠️ ${message}`);
  }

  logSuggestions(suggestions) {
    console.log("\n 💡 Suggestions de packages similaires:");
    suggestions.forEach((pkg, index) => {
      console.log(
        `   ${index + 1}. ${pkg.name} (${pkg.downloads} téléchargements) - Similarité: ${(pkg.similarity * 100).toFixed(1)}%`,
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
    console.log(`⏱️  Durée totale: ${duration} secondes`);
    console.log(`✅ Packages installés avec succès: ${success}`);
    console.log(`❌ Échecs d\'installation: ${failed}`);
  }
}
