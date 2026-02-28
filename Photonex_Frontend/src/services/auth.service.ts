import http from "./http";
import type { User, AuthCallbackInput } from "../Types";

export const authService = {
  async callback(input: AuthCallbackInput): Promise<{ user: User; token: string }> {
    const response = await http.post("/auth/callback", input);
    return response.data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await http.post("/auth/login", { email, password });
    return response.data;
  },

  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await http.post("/auth/register", { email, password });
    return response.data;
  },

  async getMe(): Promise<{ user: User }> {
    const response = await http.get("/auth/me");
    return response.data;
  },

  setToken(token: string): void {
    localStorage.setItem("token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  clearToken(): void {
    localStorage.removeItem("token");
  },
};

export default http;
