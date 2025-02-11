const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { InstallationLogger } = require("./InstallationLogger");
const { PackageDatabase } = require("./PackageDatabase");
const { PackageManager } = require("./PackageManager");

async function askUserForAlternative(suggestions, logger) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    logger.logInfo("Choisissez une option :");
    logger.logInfo("- Entrez le numéro du package à installer");
    logger.logInfo("- Appuyez sur Entrée pour ignorer");

    rl.question("Votre choix : ", (answer) => {
      rl.close();
      const index = parseInt(answer) - 1;
      if (index >= 0 && index < suggestions.length) {
        resolve(suggestions[index]);
      } else {
        resolve(null);
      }
    });
  });
}

async function handleFailedInstallation(
  packageName,
  suggestions,
  logger,
  packageDB,
  packageManager
) {
  if (suggestions.length > 0) {
    logger.logError(`Échec de l'installation de ${packageName}`);
    logger.logSuggestions(suggestions);

    const selectedPackage = await askUserForAlternative(suggestions, logger);

    if (selectedPackage) {
      try {
        await packageManager.updatePackageInRequirements(
          packageName,
          selectedPackage.name
        );
        logger.logSuccess(
          `Le fichier requirements.txt a été mis à jour avec ${selectedPackage.name}`
        );
        logger.logInfo(
          `Une sauvegarde a été créée dans requirements.txt.backup`
        );

        return await installPackage(
          selectedPackage.name,
          logger,
          packageDB,
          packageManager
        );
      } catch (error) {
        logger.logError(
          `Erreur lors de la mise à jour du package: ${error.message}`
        );
        return false;
      }
    }
  }
  return false;
}

async function installPackage(packageName, logger, packageDB, packageManager) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.logInfo(`Installation de ${packageName}`);

      await packageManager.installPackage(packageName);
      const isInstalled = await packageManager.verifyPackageInstallation(
        packageName
      );

      if (isInstalled) {
        logger.logSuccess(`${packageName} installé avec succès`);
        resolve(true);
      } else {
        throw new Error("L'installation n'a pas pu être vérifiée");
      }
    } catch (error) {
      const searchResult = packageDB.findSimilarPackages(packageName);

      if (searchResult.bestSimilarity >= 0.4) {
        const success = await handleFailedInstallation(
          packageName,
          searchResult.suggestions,
          logger,
          packageDB,
          packageManager
        );
        if (success) {
          resolve(true);
        } else {
          reject(new Error(`Échec de l'installation de ${packageName}`));
        }
      } else {
        reject(error);
      }
    }
  });
}

async function createRequirementsFile(logger, packageManager) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    logger.logInfo("Le fichier requirements.txt n'existe pas.");
    logger.logInfo("Voulez-vous le créer maintenant ? (o/n)");

    rl.question("Votre choix : ", async (answer) => {
      rl.close();
      if (answer.toLowerCase() === "o") {
        try {
          await packageManager.createEmptyRequirements();
          logger.logSuccess("Fichier requirements.txt créé avec succès !");
          logger.logInfo(
            "Éditez le fichier et ajoutez vos packages (un par ligne)"
          );
          logger.logInfo("Puis relancez le script");
        } catch (error) {
          logger.logError(
            `Erreur lors de la création du fichier: ${error.message}`
          );
        }
      }
      resolve();
    });
  });
}

async function main() {
  const logger = new InstallationLogger();
  const packageDB = new PackageDatabase();
  const packageManager = new PackageManager();

  logger.logStep("Initialisation");
  await packageDB.loadFromFile();

  if (!fs.existsSync(packageManager.requirementsPath)) {
    await createRequirementsFile(logger, packageManager);
    return;
  }

  try {
    const packages = await packageManager.readRequirements();

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
        await installPackage(packageName, logger, packageDB, packageManager);
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
  } catch (error) {
    logger.logError(
      `Erreur lors de la lecture ou du traitement des packages: ${error.message}`
    );
  }
}

module.exports = {
  main,
  installPackage,
  createRequirementsFile,
  handleFailedInstallation,
  askUserForAlternative,
};
