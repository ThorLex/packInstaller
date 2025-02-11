const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");

class PackageDatabase {
  constructor() {
    this.packages = new Map();
    this.existsFilePath = path.join(process.cwd(), "exists.txt");
    this.lastIndex = 0;
  }

  async loadFromFile() {
    try {
      const content = await fs.promises.readFile(this.existsFilePath, "utf8");
      const lines = content.split("\n");

      for (const line of lines) {
        const match = line.match(
          /(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)\s+-\s+(\d+)/
        );
        if (match) {
          const [_, index, name, url, downloads] = match;
          this.lastIndex = Math.max(this.lastIndex, parseInt(index));
          this.packages.set(name.toLowerCase(), {
            index: parseInt(index),
            name,
            url,
            downloads: parseInt(downloads),
          });
        }
      }
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

  async updatePackageDownloads(packageName, downloads) {
    const entry = this.packages.get(packageName.toLowerCase());
    if (entry) {
      entry.downloads = downloads;
      await this.saveToFile();
      return true;
    }
    return false;
  }

  async saveToFile() {
    const sortedPackages = Array.from(this.packages.values()).sort(
      (a, b) => a.index - b.index
    );

    const content =
      sortedPackages
        .map(
          (pkg) => `${pkg.index}. [${pkg.name}](${pkg.url}) - ${pkg.downloads}`
        )
        .join("\n") + "\n";

    await fs.promises.writeFile(this.existsFilePath, content);
  }
}

module.exports = { PackageDatabase };
