import fs from "fs";
import path from "path";
import {
  installPackageViaExec,
  verifyPackageInstallation,
} from "../utils/npm-commands.js";
import {
  askUserContribution,
  askUserForAlternative,
} from "../utils/cli-helpers.js";

export async function installPackage(
  packageName,
  logger,
  packageDB,
  configManager,
) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.logInfo(`Tentative d'installation de ${packageName}`);

      const result = await installPackageViaExec(packageName);
      if (!result.success) {
        throw new Error(result.error);
      }

      const isInstalled = await verifyPackageInstallation(packageName);

      if (isInstalled) {
        logger.logSuccess(`${packageName} installé avec succès`);

        const searchResult = packageDB.findSimilarPackages(packageName);
        if (!searchResult.exact) {
          const willContribute = await configManager.getWillContribute(logger);
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
          logger,
        );

        if (selectedAlternative) {
          try {
            await installPackage(
              selectedAlternative.name,
              logger,
              packageDB,
              configManager,
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

export async function runInstall(logger, packageDB, configManager) {
  logger.logStep("Chargement de la base de données des packages");
  await packageDB.loadFromFile();

  const requirementsPath = path.join(process.cwd(), "requirements.txt");
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(requirementsPath)) {
    autoGenerateRequirements(requirementsPath, packageJsonPath, logger);
    return;
  }

  const content = fs.readFileSync(requirementsPath, "utf8");
  const packages = content
    .split("\n")
    .map((line) => line.trim())
    // Supporter le format name@version en extrayant juste le nom
    // Le pattern gère les scoped packages (@scope/name@version)
    .map((line) => line.replace(/@[~^>=<]*\d[^\s]*$/, ""))
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
      await installPackage(packageName, logger, packageDB, configManager);
      successCount++;
    } catch (error) {
      logger.logError(
        `Échec de l'installation de ${packageName}: ${error.message}`,
      );
      failedCount++;
    }

    logger.updateProgress(i + 1, packageName);
  }

  logger.showSummary(successCount, failedCount);
}

function autoGenerateRequirements(requirementsPath, packageJsonPath, logger) {
  if (!fs.existsSync(packageJsonPath)) {
    logger.logError("Le fichier package.json n'existe pas !");
    logger.logInfo("Créez un package.json avec: npm init -y");
    return false;
  }

  logger.logInfo(
    "requirements.txt introuvable — génération automatique depuis package.json",
  );

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const deps = [];
  if (packageJson.dependencies) {
    deps.push(...Object.keys(packageJson.dependencies));
  }
  if (packageJson.devDependencies) {
    deps.push(...Object.keys(packageJson.devDependencies));
  }

  if (deps.length === 0) {
    logger.logWarning(
      "Aucune dépendance trouvée dans package.json pour générer requirements.txt",
    );
    return false;
  }

  const lines = [];
  lines.push("# Généré automatiquement depuis package.json par packi");
  lines.push(`# Date: ${new Date().toISOString()}`);
  for (const name of deps.sort()) {
    lines.push(name);
  }

  fs.writeFileSync(requirementsPath, lines.join("\n") + "\n", "utf8");
  logger.logSuccess(
    `requirements.txt créé avec ${deps.length} package(s) depuis package.json`,
  );
  return true;
}
