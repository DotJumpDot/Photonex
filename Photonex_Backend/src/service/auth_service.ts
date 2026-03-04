import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserByUsername } from "../sql/user_sql.js";
import { User } from "../types/user_type.js";
import { JwtPayload } from "../types/auth_type.js";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function register(
  username: string,
  email: string | null,
  password: string
): Promise<{ user: User; token: string }> {
  console.log(`[Auth Service] Starting registration for username: ${username}`);

  console.log("[Auth Service] Checking if username exists...");
  const existingUserByUsername = await findUserByUsername(username);
  if (existingUserByUsername) {
    console.log("[Auth Service] Username already exists");
    throw new Error("Username already exists");
  }

  // Check email only if provided
  if (email) {
    console.log("[Auth Service] Checking if email exists...");
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      console.log("[Auth Service] Email already exists");
      throw new Error("Email already exists");
    }
  }

  console.log("[Auth Service] Hashing password...");
  const passwordHash = await hashPassword(password);
  console.log("[Auth Service] Password hashed successfully");

  console.log("[Auth Service] Creating user in database...");
  const newUser = await createUser({
    username,
    email,
    provider: email ? "email" : null,
    password_hash: passwordHash,
  });
  console.log("[Auth Service] User created:", newUser.id);

  console.log("[Auth Service] Generating token...");
  const token = generateToken(newUser);
  console.log("[Auth Service] Token generated successfully");

  return { user: newUser, token };
}

export async function login(
  loginInput: string,
  password: string
): Promise<{ user: User; token: string }> {
  // Try to find user by username or email
  let user = await findUserByUsername(loginInput);

  if (!user) {
    user = await findUserByEmail(loginInput);
  }

  if (!user || !user.password_hash) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);
  return { user, token };
}
