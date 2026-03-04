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

export interface PackageDependency {
  id: string;
  package_id: string;
  dependency_name: string;
  dependency_version: string | null;
  is_dev_dependency: boolean;
  created_at: string;
}

export interface PackageWithStats extends Package {
  stats: Stat[];
  package_versions?: PackageVersion[];
  package_dependencies?: PackageDependency[];
}

export interface CreatePackageInput {
  name: string;
  type: "npm" | "vscode";
  url: string;
}

export interface RefreshResponse {
  package: PackageWithStats;
  message: string;
  refreshed: boolean;
  saved: boolean;
}

export interface RefreshAllResponse {
  packages: PackageWithStats[];
  refreshed: number;
  skipped: number;
  failed: number;
}
