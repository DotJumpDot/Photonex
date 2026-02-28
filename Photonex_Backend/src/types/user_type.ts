export interface User {
  id: string;
  email: string;
  provider: "google" | "github";
  provider_id: string;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  provider: "google" | "github";
  provider_id: string;
}

export interface AuthCallback {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}
