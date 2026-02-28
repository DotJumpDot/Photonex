import { supabase } from "../db.js";
import type {
  Package,
  CreatePackageInput,
  Stat,
  CreateStatInput,
  PackageWithStats,
} from "../types/package_type.js";

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
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create package: ${error.message}`);
  }

  return data as Package;
}

export async function deletePackage(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from("packages").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete package: ${error.message}`);
  }
}

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

export async function createStat(input: CreateStatInput): Promise<Stat> {
  const { data, error } = await supabase
    .from("stats")
    .insert({
      package_id: input.package_id,
      downloads: input.downloads || null,
      version: input.version || null,
      rating: input.rating || null,
      installs: input.installs || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create stat: ${error.message}`);
  }

  return data as Stat;
}

export async function getPackagesWithStats(userId: string): Promise<PackageWithStats[]> {
  const { data, error } = await supabase
    .from("packages")
    .select(
      `
      *,
      stats (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get packages with stats: ${error.message}`);
  }

  return data as PackageWithStats[];
}
