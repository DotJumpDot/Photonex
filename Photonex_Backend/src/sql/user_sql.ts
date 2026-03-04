import { supabase } from "../db.js";
import type { User, CreateUserInput } from "../types/user_type.js";

export async function findUserByProviderId(
  provider: string,
  providerId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("provider", provider)
    .eq("provider_id", providerId)
    .single();

  if (error) return null;
  return data as User;
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

  if (error) return null;
  return data as User;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return data as User;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

  if (error) return null;
  return data as User;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: input.username,
      email: input.email,
      provider: input.provider,
      provider_id: input.provider_id,
      password_hash: input.password_hash,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data as User;
}
