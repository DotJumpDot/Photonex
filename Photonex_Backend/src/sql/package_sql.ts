import { supabase } from "../db.js";
import type {
  Package,
  CreatePackageInput,
  UpdatePackageInput,
  Stat,
  CreateStatInput,
  PackageWithStats,
  PackageVersion,
  CreatePackageVersionInput,
  PackageDependency,
  CreatePackageDependencyInput,
} from "../types/package_type.js";

// Package queries
export async function getPackagesByUserId(userId: string): Promise<Package[]> {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get packages: ${error.message}`);
  }

  return data as Package[];
}

export async function getPackageById(id: string): Promise<Package | null> {
  const { data, error } = await supabase.from("packages").select("*").eq("id", id).single();

  if (error) return null;
  return data as Package;
}

export async function createPackage(input: CreatePackageInput): Promise<Package> {
  const { data, error } = await supabase
    .from("packages")
    .insert({
      user_id: input.user_id,
      name: input.name,
      type: input.type,
      url: input.url,
      keywords: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create package: ${error.message}`);
  }

  return data as Package;
}

export async function updatePackage(id: string, input: UpdatePackageInput): Promise<Package> {
  const { data, error } = await supabase
    .from("packages")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update package: ${error.message}`);
  }

  return data as Package;
}

export async function deletePackage(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from("packages").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete package: ${error.message}`);
  }
}

// Stats queries
export async function getStatsByPackageId(packageId: string): Promise<Stat[]> {
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("package_id", packageId)
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }

  return data as Stat[];
}

export async function getLatestStatByPackageId(packageId: string): Promise<Stat | null> {
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("package_id", packageId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as Stat;
}

export async function createStat(input: CreateStatInput): Promise<Stat> {
  const { data, error } = await supabase
    .from("stats")
    .insert({
      package_id: input.package_id,
      downloads: input.downloads ?? null,
      total_downloads: input.total_downloads ?? null,
      installs: input.installs ?? null,
      version: input.version ?? null,
      version_count: input.version_count ?? 0,
      unpacked_size: input.unpacked_size ?? null,
      file_count: input.file_count ?? null,
      dependencies_count: input.dependencies_count ?? 0,
      dev_dependencies_count: input.dev_dependencies_count ?? 0,
      rating: input.rating ?? null,
      rating_count: input.rating_count ?? null,
      trending_daily: input.trending_daily ?? null,
      trending_monthly: input.trending_monthly ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create stat: ${error.message}`);
  }

  return data as Stat;
}

// Check if recent stats exist (within X minutes)
export async function hasRecentStats(packageId: string, minutes: number = 1): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("stats")
    .select("id")
    .eq("package_id", packageId)
    .gte("recorded_at", cutoffTime)
    .limit(1);

  if (error) return false;
  return data && data.length > 0;
}

// Package versions queries
export async function getVersionsByPackageId(packageId: string): Promise<PackageVersion[]> {
  const { data, error } = await supabase
    .from("package_versions")
    .select("*")
    .eq("package_id", packageId)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get versions: ${error.message}`);
  }

  return data as PackageVersion[];
}

export async function getVersionByPackageAndVersion(
  packageId: string,
  version: string
): Promise<PackageVersion | null> {
  const { data, error } = await supabase
    .from("package_versions")
    .select("*")
    .eq("package_id", packageId)
    .eq("version", version)
    .single();

  if (error) return null;
  return data as PackageVersion;
}

export async function createPackageVersion(
  input: CreatePackageVersionInput
): Promise<PackageVersion> {
  const { data, error } = await supabase
    .from("package_versions")
    .insert({
      package_id: input.package_id,
      version: input.version,
      downloads: input.downloads ?? null,
      unpacked_size: input.unpacked_size ?? null,
      file_count: input.file_count ?? null,
      published_at: input.published_at ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create package version: ${error.message}`);
  }

  return data as PackageVersion;
}

export async function updatePackageVersion(
  id: string,
  input: Partial<CreatePackageVersionInput>
): Promise<PackageVersion> {
  const { data, error } = await supabase
    .from("package_versions")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update package version: ${error.message}`);
  }

  return data as PackageVersion;
}

export async function deletePackageVersionsByPackageId(packageId: string): Promise<void> {
  const { error } = await supabase.from("package_versions").delete().eq("package_id", packageId);

  if (error) {
    throw new Error(`Failed to delete package versions: ${error.message}`);
  }
}

// Package dependencies queries
export async function getDependenciesByPackageId(packageId: string): Promise<PackageDependency[]> {
  const { data, error } = await supabase
    .from("package_dependencies")
    .select("*")
    .eq("package_id", packageId)
    .order("dependency_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to get dependencies: ${error.message}`);
  }

  return data as PackageDependency[];
}

export async function createPackageDependency(
  input: CreatePackageDependencyInput
): Promise<PackageDependency> {
  const { data, error } = await supabase
    .from("package_dependencies")
    .insert({
      package_id: input.package_id,
      dependency_name: input.dependency_name,
      dependency_version: input.dependency_version ?? null,
      is_dev_dependency: input.is_dev_dependency ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create package dependency: ${error.message}`);
  }

  return data as PackageDependency;
}

export async function deletePackageDependenciesByPackageId(packageId: string): Promise<void> {
  const { error } = await supabase
    .from("package_dependencies")
    .delete()
    .eq("package_id", packageId);

  if (error) {
    throw new Error(`Failed to delete package dependencies: ${error.message}`);
  }
}

// Combined queries
export async function getPackagesWithStats(userId: string): Promise<PackageWithStats[]> {
  const { data, error } = await supabase
    .from("packages")
    .select(
      `
      *,
      stats (*),
      package_versions (*),
      package_dependencies (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get packages with stats: ${error.message}`);
  }

  return data as PackageWithStats[];
}

export async function getPackageWithStatsById(packageId: string): Promise<PackageWithStats | null> {
  const { data, error } = await supabase
    .from("packages")
    .select(
      `
      *,
      stats (*),
      package_versions (*),
      package_dependencies (*)
    `
    )
    .eq("id", packageId)
    .single();

  if (error) return null;
  return data as PackageWithStats;
}
