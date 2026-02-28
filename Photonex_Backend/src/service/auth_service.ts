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
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);
  const newUser = await createUser({
    email,
    provider: "email",
    password_hash: passwordHash,
  });

  const token = generateToken(newUser);
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
