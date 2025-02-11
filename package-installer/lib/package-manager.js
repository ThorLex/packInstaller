const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

class PackageManager {
  constructor() {
    this.requirementsPath = path.join(process.cwd(), "requirements.txt");
  }

  async readRequirements() {
    try {
      const content = await fs.promises.readFile(this.requirementsPath, "utf8");
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));
    } catch (error) {
      throw new Error(
        `Erreur de lecture de requirements.txt: ${error.message}`
      );
    }
  }

  async updatePackageInRequirements(oldPackage, newPackage) {
    try {
      await this.backupRequirements();

      let content = await fs.promises.readFile(this.requirementsPath, "utf8");
      const lines = content.split("\n");

      const updatedLines = lines.map((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine === oldPackage) {
          return line.replace(oldPackage, newPackage);
        }
        return line;
      });

      await fs.promises.writeFile(
        this.requirementsPath,
        updatedLines.join("\n")
      );
      return true;
    } catch (error) {
      throw new Error(
        `Erreur de mise à jour de requirements.txt: ${error.message}`
      );
    }
  }

  async backupRequirements() {
    const backupPath = `${this.requirementsPath}.backup`;
    try {
      await fs.promises.copyFile(this.requirementsPath, backupPath);
      return true;
    } catch (error) {
      throw new Error(`Erreur de création du backup: ${error.message}`);
    }
  }

  async createEmptyRequirements() {
    const template = `# Liste des packages à installer
# Un package par ligne
# Exemple:
# express
# lodash
# moment
`;
    try {
      await fs.promises.writeFile(this.requirementsPath, template);
      return true;
    } catch (error) {
      throw new Error(
        `Erreur de création du fichier requirements.txt: ${error.message}`
      );
    }
  }

  async verifyPackageInstallation(packageName) {
    return new Promise((resolve) => {
      exec(`npm list ${packageName} --depth=0`, (error, stdout, stderr) => {
        resolve(!error && stdout.includes(packageName));
      });
    });
  }

  async installPackage(packageName) {
    return new Promise((resolve, reject) => {
      exec(`npm install ${packageName}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

module.exports = { PackageManager };
