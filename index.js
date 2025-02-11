const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const stringSimilarity = require("string-similarity");

// Classe pour gérer la base de données des packages
class PackageDatabase {
  constructor() {
    this.packages = new Map();
    this.existsFilePath = path.join(process.cwd(), "exists.txt");
  }

  async loadFromFile() {
    try {
      const content = await fs.promises.readFile(this.existsFilePath, "utf8");
      const lines = content.split("\n");
      let lastIndex = 0;

      for (const line of lines) {
        const match = line.match(
          /(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)\s+-\s+(\d+)/
        );
        if (match) {
          const [_, index, name, url, downloads] = match;
          lastIndex = Math.max(lastIndex, parseInt(index));
          this.packages.set(name.toLowerCase(), {
            index: parseInt(index),
            name,
            url,
            downloads: parseInt(downloads),
          });
        }
      }
      this.lastIndex = lastIndex;
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de la lecture de la base de packages:",
        error.message
      );
      return false;
    }
  }

  async addNewPackage(packageName, downloads = 0) {
    const newIndex = this.lastIndex + 1;
    const entry = {
      index: newIndex,
      name: packageName,
      url: `https://www.npmjs.org/package/${packageName}`,
      downloads,
    };

    this.packages.set(packageName.toLowerCase(), entry);
    this.lastIndex = newIndex;

    const newLine = `${newIndex}. [${packageName}](${entry.url}) - ${downloads}\n`;
    await fs.promises.appendFile(this.existsFilePath, newLine);
    return entry;
  }

  findSimilarPackages(packageName, similarityThreshold = 0.4) {
    const searchName = packageName.toLowerCase();

    if (this.packages.has(searchName)) {
      return {
        exact: this.packages.get(searchName),
        suggestions: [],
        similarity: 1,
      };
    }

    const packageNames = Array.from(this.packages.keys());
    const matches = stringSimilarity.findBestMatch(searchName, packageNames);

    const suggestions = matches.ratings
      .filter((match) => match.rating > similarityThreshold)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map((match) => ({
        ...this.packages.get(match.target),
        similarity: match.rating,
      }));

    return {
      exact: null,
      suggestions,
      bestSimilarity: suggestions.length > 0 ? suggestions[0].similarity : 0,
    };
  }
}

// Classe pour gérer les logs et l'interface utilisateur
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
        `   ${index + 1}. ${pkg.name} (${
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
    console.log(`⏱️  Durée totale: ${duration} secondes`);
    console.log(`✅ Packages installés avec succès: ${success}`);
    console.log(`❌ Échecs d'installation: ${failed}`);
  }
}

// Fonctions utilitaires
async function verifyPackageInstallation(packageName) {
  return new Promise((resolve) => {
    exec(`npm list ${packageName} --depth=0`, (error, stdout, stderr) => {
      resolve(!error && stdout.includes(packageName));
    });
  });
}

async function askUserContribution(logger) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(
      "\nSouhaitez-vous contribuer en ajoutant ce package à notre base de données ? (o/n) ",
      (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === "o");
      }
    );
  });
}

async function askUserForAlternative(suggestions, logger) {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(
      '\nVoulez-vous installer un package suggéré ? (numéro ou "n" pour annuler) ',
      (answer) => {
        readline.close();
        if (answer.toLowerCase() === "n") {
          resolve(null);
        } else {
          const index = parseInt(answer) - 1;
          if (index >= 0 && index < suggestions.length) {
            resolve(suggestions[index]);
          } else {
            resolve(null);
          }
        }
      }
    );
  });
}

// Fonction principale d'installation
async function installPackage(packageName, logger, packageDB) {
  // Ajoutez cette nouvelle classe pour gérer la configuration
  class ConfigManager {
    constructor() {
      this.configPath = path.join(
        process.cwd(),
        ".package-installer-config.json"
      );
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
        console.error(
          "Erreur lors de la sauvegarde de la configuration:",
          error
        );
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

  // Modifiez la fonction installPackage pour utiliser ConfigManager
  async function installPackage(packageName, logger, packageDB, configManager) {
    return new Promise(async (resolve, reject) => {
      try {
        logger.logInfo(`Tentative d'installation de ${packageName}`);

        await new Promise((resolveExec, rejectExec) => {
          exec(`npm install ${packageName}`, (error, stdout, stderr) => {
            if (error) rejectExec(error);
            else resolveExec(stdout);
          });
        });

        const isInstalled = await verifyPackageInstallation(packageName);

        if (isInstalled) {
          logger.logSuccess(`${packageName} installé avec succès`);

          const searchResult = packageDB.findSimilarPackages(packageName);
          if (!searchResult.exact) {
            const willContribute = await configManager.getWillContribute(
              logger
            );
            if (willContribute) {
              await packageDB.addNewPackage(packageName);
              logger.logSuccess(`${packageName} ajouté à la base de données`);
            }
          }

          resolve(true);
        } else {
          throw new Error("L'installation n'a pas pu être vérifiée");
        }
      } catch (error) {
        const searchResult = packageDB.findSimilarPackages(packageName);

        if (searchResult.bestSimilarity >= 0.4) {
          logger.logError(`Échec de l'installation de ${packageName}`);
          logger.logSuggestions(searchResult.suggestions);

          const selectedAlternative = await askUserForAlternative(
            searchResult.suggestions,
            logger
          );

          if (selectedAlternative) {
            try {
              await installPackage(
                selectedAlternative.name,
                logger,
                packageDB,
                configManager
              );
              resolve(true);
            } catch (retryError) {
              reject(retryError);
            }
          } else {
            reject(new Error("Installation annulée par l'utilisateur"));
          }
        } else {
          reject(error);
        }
      }
    });
  }

  // Modifiez la fonction main pour utiliser ConfigManager
  async function main() {
    // Ajoutez cette nouvelle classe pour gérer la configuration
    class ConfigManager {
      constructor() {
        this.configPath = path.join(
          process.cwd(),
          ".package-installer-config.json"
        );
        this.config = this.loadConfig();
      }

      loadConfig() {
        try {
          if (fs.existsSync(this.configPath)) {
            return JSON.parse(fs.readFileSync(this.configPath, "utf8"));
          }
        } catch (error) {
          console.error(
            "Erreur lors de la lecture de la configuration:",
            error
          );
        }
        return { willContribute: null };
      }

      saveConfig() {
        try {
          fs.writeFileSync(
            this.configPath,
            JSON.stringify(this.config, null, 2)
          );
        } catch (error) {
          console.error(
            "Erreur lors de la sauvegarde de la configuration:",
            error
          );
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

    // Modifiez la fonction installPackage pour utiliser ConfigManager
    async function installPackage(
      packageName,
      logger,
      packageDB,
      configManager
    ) {
      return new Promise(async (resolve, reject) => {
        try {
          logger.logInfo(`Tentative d'installation de ${packageName}`);

          await new Promise((resolveExec, rejectExec) => {
            exec(`npm install ${packageName}`, (error, stdout, stderr) => {
              if (error) rejectExec(error);
              else resolveExec(stdout);
            });
          });

          const isInstalled = await verifyPackageInstallation(packageName);

          if (isInstalled) {
            logger.logSuccess(`${packageName} installé avec succès`);

            const searchResult = packageDB.findSimilarPackages(packageName);
            if (!searchResult.exact) {
              const willContribute = await configManager.getWillContribute(
                logger
              );
              if (willContribute) {
                await packageDB.addNewPackage(packageName);
                logger.logSuccess(`${packageName} ajouté à la base de données`);
              }
            }

            resolve(true);
          } else {
            throw new Error("L'installation n'a pas pu être vérifiée");
          }
        } catch (error) {
          const searchResult = packageDB.findSimilarPackages(packageName);

          if (searchResult.bestSimilarity >= 0.4) {
            logger.logError(`Échec de l'installation de ${packageName}`);
            logger.logSuggestions(searchResult.suggestions);

            const selectedAlternative = await askUserForAlternative(
              searchResult.suggestions,
              logger
            );

            if (selectedAlternative) {
              try {
                await installPackage(
                  selectedAlternative.name,
                  logger,
                  packageDB,
                  configManager
                );
                resolve(true);
              } catch (retryError) {
                reject(retryError);
              }
            } else {
              reject(new Error("Installation annulée par l'utilisateur"));
            }
          } else {
            reject(error);
          }
        }
      });
    }

    // Modifiez la fonction main pour utiliser ConfigManager
    async function main() {
      const logger = new InstallationLogger();
      const packageDB = new PackageDatabase();
      const configManager = new ConfigManager();

      logger.logStep("Chargement de la base de données des packages");
      await packageDB.loadFromFile();

      const requirementsPath = path.join(process.cwd(), "requirements.txt");
      if (!fs.existsSync(requirementsPath)) {
        logger.logError("Le fichier requirements.txt n'existe pas");
        return;
      }

      const content = fs.readFileSync(requirementsPath, "utf8");
      const packages = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

      if (packages.length === 0) {
        logger.logWarning(
          "Aucun package à installer trouvé dans requirements.txt"
        );
        return;
      }

      logger.init(packages.length);

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < packages.length; i++) {
        const packageName = packages[i];

        try {
          await installPackage(packageName, logger, packageDB, configManager);
          successCount++;
        } catch (error) {
          logger.logError(
            `Échec de l'installation de ${packageName}: ${error.message}`
          );
          failedCount++;
        }

        logger.updateProgress(i + 1, packageName);
      }
      logger.showSummary(successCount, failedCount);
    }
    const logger = new InstallationLogger();
    const packageDB = new PackageDatabase();
    const configManager = new ConfigManager();

    logger.logStep("Chargement de la base de données des packages");
    await packageDB.loadFromFile();

    const requirementsPath = path.join(process.cwd(), "requirements.txt");
    if (!fs.existsSync(requirementsPath)) {
      logger.logError("Le fichier requirements.txt n'existe pas !");
      logger.logInfo(
        "Pour créer le fichier requirements.txt, vous pouvez utiliser une des méthodes suivantes :"
      );
      logger.logInfo("1. Manuellement :");
      console.log("   touch requirements.txt");
      console.log("   # ou");
      console.log("   echo '' > requirements.txt");

      logger.logInfo("2. Depuis package.json :");
      console.log(
        "   npm list --depth=0 | grep -v 'npm@' | sed '1d' | awk -F' ' '{print $2}' | sed 's/@.*$//' > requirements.txt"
      );

      logger.logInfo("3. Depuis les dépendances existantes :");
      console.log(
        "   npm list --parseable --depth=0 | sed '1d' | sed 's/.*node_modules\\/\\(.*\\)/\\1/' | sed 's/@.*$//' > requirements.txt"
      );

      logger.logInfo(
        "4. Si vous avez un autre nom de fichier, vous pouvez le renommer :"
      );
      console.log("   mv votre_fichier.txt requirements.txt");

      logger.logWarning(
        "Après avoir créé le fichier, ajoutez vos packages (un par ligne)"
      );
      console.log("Exemple de contenu requirements.txt :");
      console.log("express\nlodash\nmoment\naxios");

      return;
    }

    const content = fs.readFileSync(requirementsPath, "utf8");
    const packages = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    if (packages.length === 0) {
      logger.logWarning(
        "Aucun package à installer trouvé dans requirements.txt"
      );
      return;
    }

    logger.init(packages.length);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < packages.length; i++) {
      const packageName = packages[i];

      try {
        await installPackage(packageName, logger, packageDB, configManager);
        successCount++;
      } catch (error) {
        logger.logError(
          `Échec de l'installation de ${packageName}: ${error.message}`
        );
        failedCount++;
      }

      logger.updateProgress(i + 1, packageName);
    }

    logger.showSummary(successCount, failedCount);
  }
  return new Promise(async (resolve, reject) => {
    try {
      logger.logInfo(`Tentative d'installation de ${packageName}`);

      await new Promise((resolveExec, rejectExec) => {
        exec(`npm install ${packageName}`, (error, stdout, stderr) => {
          if (error) rejectExec(error);
          else resolveExec(stdout);
        });
      });

      const isInstalled = await verifyPackageInstallation(packageName);

      if (isInstalled) {
        logger.logSuccess(`${packageName} installé avec succès`);

        const searchResult = packageDB.findSimilarPackages(packageName);
        if (!searchResult.exact) {
          const willContribute = await askUserContribution(logger);
          if (willContribute) {
            await packageDB.addNewPackage(packageName);
            logger.logSuccess(`${packageName} ajouté à la base de données`);
          }
        }

        resolve(true);
      } else {
        throw new Error("L'installation n'a pas pu être vérifiée");
      }
    } catch (error) {
      const searchResult = packageDB.findSimilarPackages(packageName);

      if (searchResult.bestSimilarity >= 0.4) {
        logger.logError(`Échec de l'installation de ${packageName}`);
        logger.logSuggestions(searchResult.suggestions);

        const selectedAlternative = await askUserForAlternative(
          searchResult.suggestions,
          logger
        );

        if (selectedAlternative) {
          try {
            await installPackage(selectedAlternative.name, logger, packageDB);
            resolve(true);
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          reject(new Error("Installation annulée par l'utilisateur"));
        }
      } else {
        reject(error);
      }
    }
  });
}

// Fonction principale
async function main() {
  const logger = new InstallationLogger();
  const packageDB = new PackageDatabase();

  logger.logStep("Chargement de la base de données des packages");
  await packageDB.loadFromFile();

  const requirementsPath = path.join(process.cwd(), "requirements.txt");
  if (!fs.existsSync(requirementsPath)) {
    logger.logError("Le fichier requirements.txt n'existe pas !");
    logger.logInfo(
      "Pour créer le fichier requirements.txt, vous pouvez utiliser une des méthodes suivantes :"
    );
    logger.logInfo(
      "verifier qu'il s'agit de requirement's' et pas requirement "
    );
    logger.logInfo("1. Manuellement :");
    console.log("   touch requirements.txt");
    console.log("   # ou");
    console.log("   echo '' > requirements.txt");

    logger.logInfo("2. Depuis package.json :");
    console.log(
      "   npm list --depth=0 | grep -v 'npm@' | sed '1d' | awk -F' ' '{print $2}' | sed 's/@.*$//' > requirements.txt"
    );

    logger.logInfo("3. Depuis les dépendances existantes :");
    console.log(
      "   npm list --parseable --depth=0 | sed '1d' | sed 's/.*node_modules\\/\\(.*\\)/\\1/' | sed 's/@.*$//' > requirements.txt"
    );

    logger.logInfo(
      "4. Si vous avez un autre nom de fichier, vous pouvez le renommer :"
    );
    console.log("   mv votre_fichier.txt requirements.txt");

    logger.logWarning(
      "Après avoir créé le fichier, ajoutez vos packages (un par ligne)"
    );
    console.log("Exemple de contenu requirements.txt :");
    console.log("express\nlodash\nmoment\naxios");

    return;
  }

  const content = fs.readFileSync(requirementsPath, "utf8");
  const packages = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (packages.length === 0) {
    logger.logWarning("Aucun package à installer trouvé dans requirements.txt");
    return;
  }

  logger.init(packages.length);

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];

    try {
      await installPackage(packageName, logger, packageDB);
      successCount++;
    } catch (error) {
      logger.logError(
        `Échec de l'installation de ${packageName}: ${error.message}`
      );
      failedCount++;
    }

    logger.updateProgress(i + 1, packageName);
  }

  logger.showSummary(successCount, failedCount);
}

// Lancement du script
main().catch((error) => {
  console.error("Erreur générale:", error);
  process.exit(1);
});
