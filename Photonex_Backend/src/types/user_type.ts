export interface User {
  id: string;
  username: string;
  email: string | null;
  provider: "google" | "github" | "email" | null;
  provider_id?: string | null;
  password_hash?: string | null;
  created_at: string;
}

export interface CreateUserInput {
  username: string;
  email?: string | null;
  provider?: "google" | "github" | "email" | null;
  provider_id?: string | null;
  password_hash?: string | null;
}

export interface AuthCallback {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}
