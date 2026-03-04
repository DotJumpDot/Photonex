import { Router, type Request, type Response } from "express";
import { body, param, validationResult } from "express-validator";
import * as packageService from "../service/package_service.js";
import type { CreatePackageInput } from "../types/package_type.js";
import { authenticateToken } from "../middleware/auth_middleware.js";
import { AuthRequest } from "../types/auth_type.js";

const router = Router();

// GET /api/packages - Get all packages for user (protected)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const packages = await packageService.getUserPackagesWithStats(userId);
    return res.json({ packages });
  } catch (error) {
    console.error("Get packages error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/packages - Add a new package (protected)
router.post(
  "/",
  authenticateToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("type").isIn(["npm", "vscode"]).withMessage("Type must be npm or vscode"),
    body("url").notEmpty().withMessage("URL is required"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as AuthRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { type, url } = req.body;

      // Extract clean package name from URL
      const cleanName = packageService.extractPackageNameFromUrl(url, type);

      const input: CreatePackageInput = {
        user_id: userId,
        name: cleanName,
        type,
        url,
      };

      const pkg = await packageService.addPackage(input);
      return res.status(201).json({ package: pkg });
    } catch (error) {
      console.error("Add package error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/packages/:id - Delete a package (protected)
router.delete(
  "/:id",
  authenticateToken,
  [param("id").isUUID().withMessage("Invalid package ID")],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as AuthRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const id = req.params.id as string;
      await packageService.removePackage(id, userId);

      return res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Delete package error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/packages/:id/refresh - Refresh package stats (protected)
router.post(
  "/:id/refresh",
  authenticateToken,
  [param("id").isUUID().withMessage("Invalid package ID")],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as AuthRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const id = req.params.id as string;

      // Get package details
      const packages = await packageService.getUserPackages(userId);
      const pkg = packages.find((p) => p.id === id);

      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }

      await packageService.refreshPackageStats(id, pkg.type, pkg.name);

      // Return updated package with stats
      const updatedPackages = await packageService.getUserPackagesWithStats(userId);
      const updatedPkg = updatedPackages.find((p) => p.id === id);

      return res.json({ package: updatedPkg });
    } catch (error) {
      console.error("Refresh package error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/packages/refresh-all - Refresh all package stats (protected)
router.post("/refresh-all", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const packages = await packageService.getUserPackages(userId);

    const results = await Promise.allSettled(
      packages.map((pkg) => packageService.refreshPackageStats(pkg.id, pkg.type, pkg.name))
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    // Return updated packages
    const updatedPackages = await packageService.getUserPackagesWithStats(userId);

    return res.json({
      packages: updatedPackages,
      refreshed: packages.length - failed,
      failed,
    });
  } catch (error) {
    console.error("Refresh all packages error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
