import http from "./http";
import type { User, AuthCallbackInput } from "../Types";

export const authService = {
  async callback(input: AuthCallbackInput): Promise<{ user: User }> {
    const response = await http.post("/auth/callback", input);
    return response.data;
  },

  async getMe(): Promise<{ user: User }> {
    const response = await http.get("/auth/me");
    return response.data;
  },

  setUserId(userId: string): void {
    localStorage.setItem("user_id", userId);
  },

  getUserId(): string | null {
    return localStorage.getItem("user_id");
  },

  clearUserId(): void {
    localStorage.removeItem("user_id");
  },
};

export default http;
