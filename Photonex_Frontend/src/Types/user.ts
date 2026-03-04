export interface User {
  id: string;
  username: string;
  email: string | null;
  provider: "google" | "github" | "email" | null;
  provider_id?: string | null;
  password_hash?: string | null;
  created_at: string;
}

export interface AuthCallbackInput {
  email: string;
  provider: "google" | "github";
  provider_id: string;
}
