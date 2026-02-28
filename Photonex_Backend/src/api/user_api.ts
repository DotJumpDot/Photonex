import { Router, type Request, type Response } from "express";
import * as userService from "../service/user_service.js";
import type { CreateUserInput } from "../types/user_type.js";

const router = Router();

// POST /api/auth/callback - Handle OAuth callback
router.post("/callback", async (req: Request, res: Response) => {
  try {
    const { email, provider, provider_id } = req.body as CreateUserInput;

    if (!email || !provider || !provider_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (provider !== "google" && provider !== "github") {
      return res.status(400).json({ error: "Invalid provider" });
    }

    const user = await userService.getOrCreateUser({
      email,
      provider,
      provider_id,
    });

    return res.json({ user });
  } catch (error) {
    console.error("Auth callback error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me - Get current user
router.get("/me", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["user-id"] as string;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
