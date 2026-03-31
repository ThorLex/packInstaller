import fs from "fs";
import path from "path";
import { getInstalledPackages } from "../utils/npm-commands.js";
import { readPackageJsonDeps } from "../utils/cli-helpers.js";

export async function runFreeze(logger) {
  const requirementsPath = path.join(process.cwd(), "requirements.txt");
  const packageJsonPath = path.join(process.cwd(), "package.json");

  logger.logStep("Analyse des packages installés (freeze)");

  const installed = await getInstalledPackages();

  // Lire aussi le package.json pour compléter la liste
  const fromPackageJson = readPackageJsonDeps(packageJsonPath);

  // Fusionner : prendre les packages installés, ajouter ceux du package.json manquants
  const packageMap = new Map();
  for (const pkg of installed) {
    packageMap.set(pkg.name, pkg.version);
  }
  for (const name of fromPackageJson) {
    if (!packageMap.has(name)) {
      packageMap.set(name, "");
    }
  }

  if (packageMap.size === 0) {
    logger.logWarning("Aucun package trouvé dans le projet");
    return;
  }

  // Générer le contenu du requirements.txt
  const sortedEntries = [...packageMap.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const lines = [];
  lines.push("# Généré automatiquement par packi freeze");
  lines.push(`# Date: ${new Date().toISOString()}`);
  for (const [name, version] of sortedEntries) {
    if (version) {
      lines.push(`${name}@${version}`);
    } else {
      lines.push(name);
    }
  }

  const content = lines.join("\n") + "\n";

  if (fs.existsSync(requirementsPath)) {
    logger.logInfo("Mise à jour du fichier requirements.txt");
  } else {
    logger.logInfo("Création du fichier requirements.txt");
  }

  fs.writeFileSync(requirementsPath, content, "utf8");
  logger.logSuccess(
    `requirements.txt généré avec ${packageMap.size} package(s)`,
  );

  console.log("\nContenu de requirements.txt :");
  console.log("─".repeat(40));
  for (const [name, version] of sortedEntries) {
    if (version) {
      console.log(`  ${name}@${version}`);
    } else {
      console.log(`  ${name}`);
    }
  }
  console.log("─".repeat(40));
}
