import type { Package, PackageWithStats, CreatePackageInput } from "../Types";

function getHttp() {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$http;
}

export const packageService = {
  async getPackages(): Promise<{ packages: PackageWithStats[] }> {
    const response = await getHttp().get("/packages");
    return response.data;
  },

  async addPackage(input: CreatePackageInput): Promise<{ package: Package }> {
    const response = await getHttp().post("/packages", input);
    return response.data;
  },

  async deletePackage(id: string): Promise<{ message: string }> {
    const response = await getHttp().delete(`/packages/${id}`);
    return response.data;
  },

  async refreshPackage(id: string): Promise<{ package: PackageWithStats }> {
    const response = await getHttp().post(`/packages/${id}/refresh`);
    return response.data;
  },

  async refreshAllPackages(): Promise<{
    packages: PackageWithStats[];
    refreshed: number;
    failed: number;
  }> {
    const response = await getHttp().post("/packages/refresh-all");
    return response.data;
  },
};
