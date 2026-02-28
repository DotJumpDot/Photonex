import axios from "axios";
import * as packageSql from "../sql/package_sql.js";
import type {
  Package,
  CreatePackageInput,
  PackageWithStats,
  NpmPackageData,
  NpmDownloadsData,
  VscodeExtensionData,
} from "../types/package_type.js";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const NPM_DOWNLOADS_URL = "https://api.npmjs.org";
const VSCODE_MARKETPLACE_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";

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

export async function refreshPackageStats(packageId: string, type: "npm" | "vscode", name: string) {
  try {
    if (type === "npm") {
      const npmData = await fetchNpmPackageData(name);
      const npmDownloads = await fetchNpmDownloads(name);

      await packageSql.createStat({
        package_id: packageId,
        downloads: npmDownloads.downloads,
        version: npmData.version,
      });
    } else {
      const vscodeData = await fetchVscodeExtensionData(name);
      const installs = vscodeData.statistics.find((s) => s.statisticName === "install")?.value || 0;
      const rating =
        vscodeData.statistics.find((s) => s.statisticName === "averagerating")?.value || null;
      const latestVersion = vscodeData.versions[0]?.version || "";

      await packageSql.createStat({
        package_id: packageId,
        installs,
        rating,
        version: latestVersion,
      });
    }
  } catch (error) {
    console.error(`Failed to refresh stats for ${name}:`, error);
    throw error;
  }
}

async function fetchNpmPackageData(packageName: string): Promise<NpmPackageData> {
  const response = await axios.get(`${NPM_REGISTRY_URL}/${packageName}`);
  const data = response.data;

  return {
    name: data.name,
    version: data["dist-tags"]?.latest || data.version,
    description: data.description,
    author: data.author?.name || data.author,
    license: data.license,
    time: data.time,
    distTags: data["dist-tags"],
  };
}

async function fetchNpmDownloads(packageName: string): Promise<NpmDownloadsData> {
  const response = await axios.get(`${NPM_DOWNLOADS_URL}/downloads/point/last-week/${packageName}`);
  return response.data;
}

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
    }
  );

  const extension = response.data.results[0]?.extensions[0];

  if (!extension) {
    throw new Error(`Extension ${extensionId} not found`);
  }

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
    versions: extension.versions.map((v: { version: string; lastUpdated: string }) => ({
      version: v.version,
      lastUpdated: v.lastUpdated,
    })),
    statistics: extension.statistics.map((s: { statisticName: string; value: number }) => ({
      statisticName: s.statisticName,
      value: s.value,
    })),
  };
}

export function extractPackageNameFromUrl(url: string, type: "npm" | "vscode"): string {
  if (type === "npm") {
    // Handle npmjs.com URLs like https://www.npmjs.com/package/cometsight
    const match = url.match(/npmjs\.com\/package\/([^/]+)/);
    if (match) return match[1];

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
