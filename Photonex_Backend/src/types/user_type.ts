export interface User {
  id: string;
  email: string;
  provider: "google" | "github" | "email";
  provider_id?: string;
  password_hash?: string;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  provider: "google" | "github" | "email";
  provider_id?: string;
  password_hash?: string;
}

export interface AuthCallback {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}
