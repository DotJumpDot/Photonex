import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserByUsername } from "../sql/user_sql.js";
import { User } from "../types/user_type.js";
import { JwtPayload } from "../types/auth_type.js";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Custom error classes for better error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class ConflictError extends AuthError {
  constructor(message: string) {
    super(message, "CONFLICT_ERROR", 409);
    this.name = "ConflictError";
  }
}

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
  // Validate username
  if (!username || username.trim().length < 3) {
    throw new ValidationError("Username must be at least 3 characters long");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError("Username can only contain letters, numbers, and underscores");
  }

  // Validate password
  if (!password || password.length < 4) {
    throw new ValidationError("Password must be at least 4 characters long");
  }

  // Validate email if provided
  if (email && !isValidEmail(email)) {
    throw new ValidationError("Please provide a valid email address");
  }

  // Check if username exists
  const existingUserByUsername = await findUserByUsername(username);
  if (existingUserByUsername) {
    throw new ConflictError("This username is already taken. Please choose a different one.");
  }

  // Check email only if provided
  if (email) {
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError("An account with this email already exists.");
    }
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const newUser = await createUser({
    username: username.trim(),
    email: email ? email.toLowerCase().trim() : null,
    provider: email ? "email" : null,
    password_hash: passwordHash,
  });

  const token = generateToken(newUser);
  return { user: newUser, token };
}

export async function login(
  loginInput: string,
  password: string
): Promise<{ user: User; token: string }> {
  // Validate input
  if (!loginInput || !loginInput.trim()) {
    throw new ValidationError("Please enter your username or email");
  }

  if (!password) {
    throw new ValidationError("Please enter your password");
  }

  // Try to find user by username or email
  const normalizedInput = loginInput.trim();
  let user = await findUserByUsername(normalizedInput);

  if (!user) {
    user = await findUserByEmail(normalizedInput.toLowerCase());
  }

  // Check if user exists and has password (not OAuth-only)
  if (!user) {
    throw new AuthenticationError("We couldn't find an account with those credentials.");
  }

  if (!user.password_hash) {
    throw new AuthenticationError(
      "This account was created with a social login. Please use Google or GitHub to sign in."
    );
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError("The password you entered is incorrect.");
  }

  const token = generateToken(user);
  return { user, token };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
