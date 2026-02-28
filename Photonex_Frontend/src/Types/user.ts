export interface User {
  id: string;
  email: string;
  provider: "google" | "github";
  provider_id: string;
  created_at: string;
}

export interface AuthCallbackInput {
  email: string;
  provider: "google" | "github";
  provider_id: string;
}
