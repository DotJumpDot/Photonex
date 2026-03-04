import type { User, AuthCallbackInput } from "../Types";

export interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    type: string;
    details?: Array<{ field: string; message: string }>;
  };
  message?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

function getHttp() {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$http;
}

export const authService = {
  async callback(input: AuthCallbackInput): Promise<AuthData> {
    const response = await getHttp().post("/auth/callback", input);
    return response.data;
  },

  async login(loginInput: string, password: string): Promise<AuthResponse<AuthData>> {
    const response = await getHttp().post("/auth/login", { loginInput, password });
    return response.data;
  },

  async register(
    username: string,
    email: string | null,
    password: string
  ): Promise<AuthResponse<AuthData>> {
    const response = await getHttp().post("/auth/register", { username, email, password });
    return response.data;
  },

  async getMe(): Promise<{ user: User }> {
    const response = await getHttp().get("/auth/me");
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
