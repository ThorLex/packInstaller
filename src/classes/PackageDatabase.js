import fs from "fs";
import path from "path";
import stringSimilarity from "string-similarity";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PackageDatabase {
  constructor(existsFilePath = null) {
    this.packages = new Map();
    this.existsFilePath =
      existsFilePath || path.join(process.cwd(), "exists.txt");
    this.lastIndex = 0;
  }

  async loadFromFile() {
    try {
      if (!fs.existsSync(this.existsFilePath)) {
        return true;
      }

      const content = await fs.promises.readFile(this.existsFilePath, "utf8");
      const lines = content.split("\n");
      let lastIndex = 0;

      for (const line of lines) {
        const match = line.match(
          /(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)\s+-\s+(\d+)/,
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
        error.message,
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
