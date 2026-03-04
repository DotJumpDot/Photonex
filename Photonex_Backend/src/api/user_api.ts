import { Router, type Request, type Response } from "express";
import * as userService from "../service/user_service.js";
import type { CreateUserInput } from "../types/user_type.js";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { AuthRequest } from "../types/auth_type.js";

const router = Router();

import * as authService from "../service/auth_service.js";

// Helper function to generate a unique username from email
function generateUsername(email: string): string {
  // Extract part before @ and add random suffix
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}_${suffix}`;
}

// POST /api/auth/callback - Handle OAuth callback
router.post("/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, provider, provider_id } = req.body as CreateUserInput;

    if (!email || !provider || !provider_id) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (provider !== "google" && provider !== "github") {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }

    const username = generateUsername(email);

    const user = await userService.getOrCreateUser({
      username,
      email,
      provider,
      provider_id,
    });

    const token = authService.generateToken(user);

    res.json({ user, token });
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me - Get current user
router.get("/me", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
