import readline from "readline";
import fs from "fs";

export async function askUserContribution(logger) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "\nSouhaitez-vous contribuer en ajoutant ce package à notre base de données ? (o/n) ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "o");
      },
    );
  });
}

export async function askUserForAlternative(suggestions, logger) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\nVoulez-vous installer un package suggéré ? (numéro ou "n" pour annuler) ',
      (answer) => {
        rl.close();
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
      },
    );
  });
}

export function readPackageJsonDeps(packageJsonPath) {
  const packages = [];
  try {
    if (fs.existsSync(packageJsonPath)) {
      const content = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (content.dependencies) {
        for (const name of Object.keys(content.dependencies)) {
          packages.push(name);
        }
      }
      if (content.devDependencies) {
        for (const name of Object.keys(content.devDependencies)) {
          packages.push(name);
        }
      }
    }
  } catch (error) {
    // Ignore parse errors
  }
  return packages;
}
