import type {
  Package,
  PackageWithStats,
  CreatePackageInput,
  RefreshResponse,
  RefreshAllResponse,
} from "../Types";

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

  async refreshPackage(id: string, force: boolean = false): Promise<RefreshResponse> {
    const response = await getHttp().post(
      `/packages/${id}/refresh`,
      {},
      {
        params: { force },
      }
    );
    return response.data;
  },

  async refreshAllPackages(force: boolean = false): Promise<RefreshAllResponse> {
    const response = await getHttp().post(
      "/packages/refresh-all",
      {},
      {
        params: { force },
      }
    );
    return response.data;
  },
};
