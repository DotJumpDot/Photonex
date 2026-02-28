import * as userSql from "../sql/user_sql.js";
import type { User, CreateUserInput } from "../types/user_type.js";

export async function getOrCreateUser(input: CreateUserInput): Promise<User> {
  const existingUser = await userSql.findUserByProviderId(input.provider, input.provider_id);

  if (existingUser) {
    return existingUser;
  }

  return await userSql.createUser(input);
}

export async function getUserById(id: string): Promise<User | null> {
  return await userSql.findUserById(id);
}
