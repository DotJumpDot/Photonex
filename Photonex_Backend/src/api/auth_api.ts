import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import * as authService from "../service/auth_service.js";
import { AuthError } from "../service/auth_service.js";

const router = Router();

// Error response helper
function createErrorResponse(error: any) {
  // Handle our custom auth errors
  if (error instanceof AuthError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        type: error.name,
      },
    };
  }

  // Handle validation errors from express-validator
  if (Array.isArray(error) && error[0]?.msg) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check your input and try again.",
        type: "ValidationError",
        details: error.map((e: any) => ({
          field: e.path,
          message: e.msg,
        })),
      },
    };
  }

  // Generic error fallback
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: error?.message || "An unexpected error occurred. Please try again later.",
      type: "InternalError",
    },
  };
}

// POST /api/auth/register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").optional({ nullable: true }).isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 4 })
      .withMessage("Password must be at least 4 characters long"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = createErrorResponse(errors.array());
      res.status(400).json(errorResponse);
      return;
    }

    try {
      const { username, email, password } = req.body;
      const { user, token } = await authService.register(username, email || null, password);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at,
          },
          token,
        },
        message: "Account created successfully! Welcome aboard.",
      });
    } catch (error: any) {
      console.error("[Auth API] Register error:", error);

      if (error instanceof AuthError) {
        res.status(error.statusCode).json(createErrorResponse(error));
        return;
      }

      res.status(500).json(createErrorResponse(error));
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("loginInput").exists().withMessage("Username or email is required"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = createErrorResponse(errors.array());
      res.status(400).json(errorResponse);
      return;
    }

    try {
      const { loginInput, password } = req.body;
      const { user, token } = await authService.login(loginInput, password);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at,
          },
          token,
        },
        message: "Welcome back! You've successfully signed in.",
      });
    } catch (error: any) {
      console.error("[Auth API] Login error:", error);

      if (error instanceof AuthError) {
        res.status(error.statusCode).json(createErrorResponse(error));
        return;
      }

      res.status(500).json(createErrorResponse(error));
    }
  }
);

export default router;
