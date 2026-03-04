// Package Types
export interface Package {
  id: string;
  user_id: string;
  name: string;
  type: "npm" | "vscode";
  url: string;
  // Package metadata
  description: string | null;
  author: string | null;
  license: string | null;
  homepage: string | null;
  repository_url: string | null;
  bugs_url: string | null;
  keywords: string[];
  // NPM specific
  npm_last_modified: string | null;
  // VS Code specific
  vscode_publisher: string | null;
  vscode_display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageInput {
  user_id: string;
  name: string;
  type: "npm" | "vscode";
  url: string;
}

export interface UpdatePackageInput {
  description?: string | null;
  author?: string | null;
  license?: string | null;
  homepage?: string | null;
  repository_url?: string | null;
  bugs_url?: string | null;
  keywords?: string[];
  npm_last_modified?: string | null;
  vscode_publisher?: string | null;
  vscode_display_name?: string | null;
}

// Stat Types
export interface Stat {
  id: string;
  package_id: string;
  // Download/Install metrics
  downloads: number | null;
  total_downloads: number | null;
  installs: number | null;
  // Version info
  version: string | null;
  version_count: number;
  // Package size metrics
  unpacked_size: number | null;
  file_count: number | null;
  // Dependency counts
  dependencies_count: number;
  dev_dependencies_count: number;
  // VS Code specific
  rating: number | null;
  rating_count: number | null;
  trending_daily: number | null;
  trending_monthly: number | null;
  // Metadata
  recorded_at: string;
}

export interface CreateStatInput {
  package_id: string;
  downloads?: number | null;
  total_downloads?: number | null;
  installs?: number | null;
  version?: string | null;
  version_count?: number;
  unpacked_size?: number | null;
  file_count?: number | null;
  dependencies_count?: number;
  dev_dependencies_count?: number;
  rating?: number | null;
  rating_count?: number | null;
  trending_daily?: number | null;
  trending_monthly?: number | null;
}

// Package Version Types
export interface PackageVersion {
  id: string;
  package_id: string;
  version: string;
  downloads: number | null;
  unpacked_size: number | null;
  file_count: number | null;
  published_at: string | null;
  created_at: string;
}

export interface CreatePackageVersionInput {
  package_id: string;
  version: string;
  downloads?: number | null;
  unpacked_size?: number | null;
  file_count?: number | null;
  published_at?: string | null;
}

// Package Dependency Types
export interface PackageDependency {
  id: string;
  package_id: string;
  dependency_name: string;
  dependency_version: string | null;
  is_dev_dependency: boolean;
  created_at: string;
}

export interface CreatePackageDependencyInput {
  package_id: string;
  dependency_name: string;
  dependency_version?: string | null;
  is_dev_dependency?: boolean;
}

// Combined Types
export interface PackageWithStats extends Package {
  stats: Stat[];
  versions?: PackageVersion[];
  dependencies?: PackageDependency[];
}

// NPM API Response Types
export interface NpmPackageData {
  name: string;
  version: string;
  description?: string;
  author?: string | { name: string; email?: string; url?: string };
  license?: string | { type: string; url: string };
  homepage?: string;
  repository?: { type: string; url: string } | string;
  bugs?: { url: string; email?: string } | string;
  keywords?: string[];
  time: {
    modified: string;
    created: string;
    [version: string]: string;
  };
  distTags: {
    latest: string;
    [tag: string]: string;
  };
  "dist-tags"?: {
    latest: string;
    [tag: string]: string;
  };
  versions: {
    [version: string]: {
      name: string;
      version: string;
      dist?: {
        unpackedSize?: number;
        unpacked_size?: number;
        fileCount?: number;
        file_count?: number;
        size?: number;
      };
      dependencies?: { [name: string]: string };
      devDependencies?: { [name: string]: string };
      peerDependencies?: { [name: string]: string };
      publish_time?: number;
      _npmUser?: { name: string };
    };
  };
  dist?: {
    unpackedSize?: number;
    unpacked_size?: number;
    fileCount?: number;
    file_count?: number;
    size?: number;
  };
  dependencies?: { [name: string]: string };
  devDependencies?: { [name: string]: string };
  peerDependencies?: { [name: string]: string };
}

export interface NpmDownloadsData {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface NpmTotalDownloadsData {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface NpmVersionDownloads {
  [version: string]: number;
}

// VS Code Marketplace API Response Types
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
    properties?: Array<{
      key: string;
      value: string;
    }>;
  }>;
  statistics: Array<{
    statisticName: string;
    value: number;
  }>;
  categories?: string[];
  tags?: string[];
  license?: string;
  repository?: string;
  homepage?: string;
  bugs?: string;
}
