export interface Package {
  id: string;
  user_id: string;
  name: string;
  type: "npm" | "vscode";
  url: string;
  created_at: string;
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

export interface PackageWithStats extends Package {
  stats: Stat[];
}

export interface CreatePackageInput {
  name: string;
  type: "npm" | "vscode";
  url: string;
}
