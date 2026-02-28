export interface Package {
  id: string;
  user_id: string;
  name: string;
  type: "npm" | "vscode";
  url: string;
  created_at: string;
}

export interface CreatePackageInput {
  user_id: string;
  name: string;
  type: "npm" | "vscode";
  url: string;
}

export interface Stat {
  id: string;
  package_id: string;
  downloads: number | null;
  version: string | null;
  rating: number | null;
  installs: number | null;
  recorded_at: string;
}

export interface CreateStatInput {
  package_id: string;
  downloads?: number | null;
  version?: string;
  rating?: number | null;
  installs?: number | null;
}

export interface NpmPackageData {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  time: {
    modified: string;
    created: string;
    [version: string]: string;
  };
  distTags: {
    latest: string;
    [tag: string]: string;
  };
}

export interface NpmDownloadsData {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface VscodeExtensionData {
  extensionId: string;
  extensionName: string;
  displayName: string;
  shortDescription: string;
  publisher: {
    publisherId: string;
    publisherName: string;
    displayName: string;
  };
  versions: Array<{
    version: string;
    lastUpdated: string;
  }>;
  statistics: Array<{
    statisticName: string;
    value: number;
  }>;
}

export interface PackageWithStats extends Package {
  stats: Stat[];
}
