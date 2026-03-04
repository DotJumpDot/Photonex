import axios from "axios";
import * as packageSql from "../sql/package_sql.js";
import type {
  Package,
  CreatePackageInput,
  PackageWithStats,
  NpmPackageData,
  NpmDownloadsData,
  NpmTotalDownloadsData,
  VscodeExtensionData,
} from "../types/package_type.js";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const NPM_DOWNLOADS_URL = "https://api.npmjs.org";
const VSCODE_MARKETPLACE_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";

// Rate limiting configuration
const REFRESH_COOLDOWN_MINUTES = 1;

export async function getUserPackages(userId: string): Promise<Package[]> {
  return await packageSql.getPackagesByUserId(userId);
}

export async function getUserPackagesWithStats(userId: string): Promise<PackageWithStats[]> {
  return await packageSql.getPackagesWithStats(userId);
}

export async function addPackage(input: CreatePackageInput): Promise<Package> {
  const pkg = await packageSql.createPackage(input);

  // Fetch and store initial stats
  await refreshPackageStats(pkg.id, pkg.type, pkg.name);

  return pkg;
}

export async function removePackage(id: string, userId: string): Promise<void> {
  await packageSql.deletePackage(id, userId);
}

export async function refreshPackageStats(
  packageId: string,
  type: "npm" | "vscode",
  name: string,
  force: boolean = false
): Promise<{ refreshed: boolean; saved: boolean; message: string }> {
  try {
    // Get latest saved stats for comparison
    const latestStat = await packageSql.getLatestStatByPackageId(packageId);
    const canSaveNewStat =
      force || !(await packageSql.hasRecentStats(packageId, REFRESH_COOLDOWN_MINUTES));

    if (type === "npm") {
      return await refreshNpmPackageStats(packageId, name, latestStat, canSaveNewStat);
    } else {
      return await refreshVscodePackageStats(packageId, name, latestStat, canSaveNewStat);
    }
  } catch (error) {
    console.error(`Failed to refresh stats for ${name}:`, error);
    throw error;
  }
}

async function refreshNpmPackageStats(
  packageId: string,
  packageName: string,
  latestStat: any,
  canSaveNewStat: boolean
): Promise<{ refreshed: boolean; saved: boolean; message: string }> {
  // Fetch all data concurrently
  const [npmData, weeklyDownloads, totalDownloads] = await Promise.all([
    fetchNpmPackageData(packageName),
    fetchNpmDownloads(packageName),
    fetchNpmTotalDownloads(packageName).catch(() => null),
  ]);

  // Extract metadata
  // NPM uses 'dist-tags' with hyphen, not camelCase
  const distTags = (npmData["dist-tags"] as Record<string, string>) || {};
  const latestVersion = distTags?.latest || npmData.version;
  const latestVersionData = latestVersion ? npmData.versions?.[latestVersion] : null;

  // Always update package metadata (static info that doesn't change often)
  const authorName = extractAuthorName(npmData.author);
  const licenseStr = extractLicense(npmData.license);
  const repoUrl = extractRepositoryUrl(npmData.repository);
  const bugsUrl = extractBugsUrl(npmData.bugs);

  await packageSql.updatePackage(packageId, {
    description: npmData.description || null,
    author: authorName,
    license: licenseStr,
    homepage: npmData.homepage || null,
    repository_url: repoUrl,
    bugs_url: bugsUrl,
    keywords: npmData.keywords || [],
    npm_last_modified: npmData.time?.modified || null,
  });

  // Calculate stats
  const versionCount = Object.keys(npmData.versions || {}).length;
  const distInfo = latestVersionData?.dist || npmData.dist;
  // Try multiple field names that NPM might use
  const unpackedSize = distInfo?.unpackedSize || distInfo?.unpacked_size || distInfo?.size || null;
  const fileCount = distInfo?.fileCount || distInfo?.file_count || null;
  const deps = latestVersionData?.dependencies || npmData.dependencies || {};
  const devDeps = latestVersionData?.devDependencies || npmData.devDependencies || {};

  // Check if data has actually changed
  const hasDataChanged =
    !latestStat ||
    latestStat.version !== latestVersion ||
    latestStat.downloads !== weeklyDownloads.downloads ||
    latestStat.total_downloads !== (totalDownloads?.downloads || null) ||
    latestStat.version_count !== versionCount ||
    latestStat.unpacked_size !== unpackedSize ||
    latestStat.dependencies_count !== Object.keys(deps).length;

  let _saved = false;
  if (canSaveNewStat && hasDataChanged) {
    // Create new stat record only if cooldown passed AND data changed
    await packageSql.createStat({
      package_id: packageId,
      downloads: weeklyDownloads.downloads,
      total_downloads: totalDownloads?.downloads || null,
      version: latestVersion,
      version_count: versionCount,
      unpacked_size: unpackedSize,
      file_count: fileCount,
      dependencies_count: Object.keys(deps).length,
      dev_dependencies_count: Object.keys(devDeps).length,
    });
    _saved = true;
  }

  // Always update versions and dependencies (these are lookup tables)
  await updateNpmVersionHistory(packageId, packageName, npmData);
  await updatePackageDependencies(packageId, deps, devDeps);

  if (!canSaveNewStat) {
    return {
      refreshed: true,
      saved: false,
      message: "Data fetched but not saved (within cooldown period)",
    };
  }
  if (!hasDataChanged) {
    return {
      refreshed: true,
      saved: false,
      message: "Data fetched but not saved (no changes detected)",
    };
  }
  return { refreshed: true, saved: _saved, message: "Stats refreshed and saved successfully" };
}

async function refreshVscodePackageStats(
  packageId: string,
  extensionId: string,
  latestStat: any,
  canSaveNewStat: boolean
): Promise<{ refreshed: boolean; saved: boolean; message: string }> {
  const vscodeData = await fetchVscodeExtensionData(extensionId);

  // Extract stats
  const installs = vscodeData.statistics.find((s) => s.statisticName === "install")?.value || 0;
  const rating =
    vscodeData.statistics.find((s) => s.statisticName === "averagerating")?.value || null;
  const ratingCount =
    vscodeData.statistics.find((s) => s.statisticName === "ratingcount")?.value || null;
  const trendingDaily =
    vscodeData.statistics.find((s) => s.statisticName === "trendingdaily")?.value || null;
  const trendingMonthly =
    vscodeData.statistics.find((s) => s.statisticName === "trendingmonthly")?.value || null;

  const latestVersion = vscodeData.versions[0]?.version || "";
  const versionCount = vscodeData.versions.length;

  // Always update package metadata
  await packageSql.updatePackage(packageId, {
    description: vscodeData.shortDescription || null,
    author: vscodeData.publisher?.displayName || vscodeData.publisher?.publisherName || null,
    license: vscodeData.license || null,
    homepage: vscodeData.homepage || null,
    repository_url: vscodeData.repository || null,
    bugs_url: vscodeData.bugs || null,
    keywords: vscodeData.tags || vscodeData.categories || [],
    vscode_publisher: vscodeData.publisher?.publisherName || null,
    vscode_display_name: vscodeData.displayName || null,
  });

  // Check if data has actually changed
  const hasDataChanged =
    !latestStat ||
    latestStat.version !== latestVersion ||
    latestStat.installs !== installs ||
    latestStat.rating !== rating ||
    latestStat.version_count !== versionCount;

  let _saved = false;
  if (canSaveNewStat && hasDataChanged) {
    // Create new stat record only if cooldown passed AND data changed
    await packageSql.createStat({
      package_id: packageId,
      installs,
      rating,
      rating_count: ratingCount,
      version: latestVersion,
      version_count: versionCount,
      trending_daily: trendingDaily,
      trending_monthly: trendingMonthly,
    });
    _saved = true;
  }

  // Always update version history
  await updateVscodeVersionHistory(packageId, vscodeData);

  if (!canSaveNewStat) {
    return {
      refreshed: true,
      saved: false,
      message: "Data fetched but not saved (within cooldown period)",
    };
  }
  if (!hasDataChanged) {
    return {
      refreshed: true,
      saved: false,
      message: "Data fetched but not saved (no changes detected)",
    };
  }
  return { refreshed: true, saved: _saved, message: "Stats refreshed and saved successfully" };
}

async function updateNpmVersionHistory(
  packageId: string,
  _packageName: string,
  npmData: NpmPackageData
): Promise<void> {
  // Delete old versions and recreate
  await packageSql.deletePackageVersionsByPackageId(packageId);

  const versions = Object.entries(npmData.versions || {});

  for (const [version, versionData] of versions) {
    const publishTime = npmData.time?.[version];

    await packageSql.createPackageVersion({
      package_id: packageId,
      version,
      unpacked_size: versionData.dist?.unpackedSize || null,
      file_count: versionData.dist?.fileCount || null,
      published_at: publishTime || null,
    });
  }
}

async function updateVscodeVersionHistory(
  packageId: string,
  vscodeData: VscodeExtensionData
): Promise<void> {
  // Delete old versions and recreate
  await packageSql.deletePackageVersionsByPackageId(packageId);

  for (const version of vscodeData.versions) {
    await packageSql.createPackageVersion({
      package_id: packageId,
      version: version.version,
      published_at: version.lastUpdated || null,
    });
  }
}

async function updatePackageDependencies(
  packageId: string,
  dependencies: { [name: string]: string },
  devDependencies: { [name: string]: string }
): Promise<void> {
  // Delete old dependencies and recreate
  await packageSql.deletePackageDependenciesByPackageId(packageId);

  // Insert regular dependencies
  for (const [name, version] of Object.entries(dependencies)) {
    await packageSql.createPackageDependency({
      package_id: packageId,
      dependency_name: name,
      dependency_version: version,
      is_dev_dependency: false,
    });
  }

  // Insert dev dependencies
  for (const [name, version] of Object.entries(devDependencies)) {
    await packageSql.createPackageDependency({
      package_id: packageId,
      dependency_name: name,
      dependency_version: version,
      is_dev_dependency: true,
    });
  }
}

// NPM API functions
async function fetchNpmPackageData(packageName: string): Promise<NpmPackageData> {
  const response = await axios.get(`${NPM_REGISTRY_URL}/${packageName}`, {
    timeout: 10000,
  });
  return response.data;
}

async function fetchNpmDownloads(packageName: string): Promise<NpmDownloadsData> {
  const response = await axios.get(
    `${NPM_DOWNLOADS_URL}/downloads/point/last-week/${packageName}`,
    {
      timeout: 10000,
    }
  );
  return response.data;
}

async function fetchNpmTotalDownloads(packageName: string): Promise<NpmTotalDownloadsData> {
  // Get downloads from the beginning of time (or a very early date)
  const startDate = "2000-01-01";
  const endDate = new Date().toISOString().split("T")[0];
  const response = await axios.get(
    `${NPM_DOWNLOADS_URL}/downloads/point/${startDate}:${endDate}/${packageName}`,
    { timeout: 10000 }
  );
  return response.data;
}

// VS Code Marketplace API function
async function fetchVscodeExtensionData(extensionId: string): Promise<VscodeExtensionData> {
  const response = await axios.post(
    VSCODE_MARKETPLACE_URL,
    {
      filters: [
        {
          criteria: [
            {
              filterType: 7,
              value: extensionId,
            },
          ],
        },
      ],
      flags: 439,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json;api-version=3.0-preview.1",
      },
      timeout: 10000,
    }
  );

  const extension = response.data.results[0]?.extensions[0];

  if (!extension) {
    throw new Error(`Extension ${extensionId} not found`);
  }

  // Extract additional URLs from properties
  const properties = extension.versions[0]?.properties || [];
  const repoProperty = properties.find(
    (p: { key: string; value: string }) => p.key === "Microsoft.VisualStudio.Services.Links.Source"
  );
  const bugsProperty = properties.find(
    (p: { key: string; value: string }) => p.key === "Microsoft.VisualStudio.Services.Links.Support"
  );
  const licenseProperty = properties.find(
    (p: { key: string; value: string }) => p.key === "Microsoft.VisualStudio.Services.Links.License"
  );

  return {
    extensionId: extension.extensionId,
    extensionName: extension.extensionName,
    displayName: extension.displayName,
    shortDescription: extension.shortDescription,
    publisher: {
      publisherId: extension.publisher.publisherId,
      publisherName: extension.publisher.publisherName,
      displayName: extension.publisher.displayName,
    },
    versions: extension.versions.map(
      (v: {
        version: string;
        lastUpdated: string;
        properties?: Array<{ key: string; value: string }>;
      }) => ({
        version: v.version,
        lastUpdated: v.lastUpdated,
        properties: v.properties,
      })
    ),
    statistics: extension.statistics.map((s: { statisticName: string; value: number }) => ({
      statisticName: s.statisticName,
      value: s.value,
    })),
    categories: extension.categories,
    tags: extension.tags,
    license: licenseProperty?.value,
    repository: repoProperty?.value,
    homepage: extension.homepage,
    bugs: bugsProperty?.value,
  };
}

// Helper functions
function extractAuthorName(author: unknown): string | null {
  if (!author) return null;
  if (typeof author === "string") return author;
  if (typeof author === "object" && author !== null) {
    return (author as { name?: string }).name || null;
  }
  return null;
}

function extractLicense(license: unknown): string | null {
  if (!license) return null;
  if (typeof license === "string") return license;
  if (typeof license === "object" && license !== null) {
    return (license as { type?: string }).type || null;
  }
  return null;
}

function extractRepositoryUrl(repo: unknown): string | null {
  if (!repo) return null;
  if (typeof repo === "string") return repo;
  if (typeof repo === "object" && repo !== null) {
    return (repo as { url?: string }).url || null;
  }
  return null;
}

function extractBugsUrl(bugs: unknown): string | null {
  if (!bugs) return null;
  if (typeof bugs === "string") return bugs;
  if (typeof bugs === "object" && bugs !== null) {
    return (bugs as { url?: string }).url || null;
  }
  return null;
}

export function extractPackageNameFromUrl(url: string, type: "npm" | "vscode"): string {
  if (type === "npm") {
    // Handle npmjs.com URLs like https://www.npmjs.com/package/cometsight
    const match = url.match(/npmjs\.com\/package\/([^/]+)/);
    if (match) return match[1];

    // Handle scoped packages URLs like https://www.npmjs.com/package/@scope/package
    const scopedMatch = url.match(/npmjs\.com\/package\/(@[^/]+\/[^/]+)/);
    if (scopedMatch) return scopedMatch[1];

    // Handle plain package names
    if (!url.includes("/")) return url;

    return url;
  } else {
    // Handle VS Code Marketplace URLs like https://marketplace.visualstudio.com/items?itemName=DotJumpDot.color-flow
    const match = url.match(/itemName=([^&]+)/);
    if (match) return match[1];

    // Handle plain extension IDs like publisher.extension
    if (url.includes(".")) return url;

    return url;
  }
}
