import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../sql/user_sql.js";
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
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function register(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  console.log(`[Auth Service] Starting registration for: ${email}`);
  
  console.log("[Auth Service] Checking if user exists...");
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    console.log("[Auth Service] User already exists");
    throw new Error("User already exists");
  }
  console.log("[Auth Service] User does not exist, proceeding...");

  console.log("[Auth Service] Hashing password...");
  const passwordHash = await hashPassword(password);
  console.log("[Auth Service] Password hashed successfully");

  console.log("[Auth Service] Creating user in database...");
  const newUser = await createUser({
    email,
    provider: "email",
    password_hash: passwordHash,
  });
  console.log("[Auth Service] User created:", newUser.id);

  console.log("[Auth Service] Generating token...");
  const token = generateToken(newUser);
  console.log("[Auth Service] Token generated successfully");
  
  return { user: newUser, token };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const user = await findUserByEmail(email);
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
