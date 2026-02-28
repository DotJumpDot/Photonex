import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import * as authService from "../service/auth_service.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    console.log("[Auth API] Register endpoint called");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("[Auth API] Validation errors:", errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      console.log(`[Auth API] Attempting to register user: ${email}`);
      const { user, token } = await authService.register(email, password);
      console.log("[Auth API] User registered successfully:", user.id);
      res.status(201).json({ user, token });
    } catch (error: any) {
      console.error("[Auth API] Register error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.json({ user, token });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({ error: error.message || "Login failed" });
    }
  }
);

export default router;
