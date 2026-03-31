export interface Package {
  index: number;
  name: string;
  url: string;
  downloads: number;
  similarity?: number;
}

export interface SearchResult {
  exact: Package | null;
  suggestions: Package[];
  bestSimilarity?: number;
  similarity?: number;
}

export class PackageDatabase {
  constructor(existsFilePath?: string);
  loadFromFile(): Promise<boolean>;
  addNewPackage(packageName: string, downloads?: number): Promise<Package>;
  findSimilarPackages(
    packageName: string,
    similarityThreshold?: number,
  ): SearchResult;
}

export class InstallationLogger {
  init(totalSteps: number): void;
  logStep(message: string): void;
  logSuccess(message: string): void;
  logError(message: string): void;
  logInfo(message: string): void;
  logWarning(message: string): void;
  logSuggestions(suggestions: Package[]): void;
  updateProgress(step: number, packageName: string): void;
  showSummary(success: number, failed: number): void;
}

export class ConfigManager {
  constructor(configPath?: string);
  loadConfig(): any;
  saveConfig(): void;
  getWillContribute(logger: InstallationLogger): Promise<boolean>;
}
