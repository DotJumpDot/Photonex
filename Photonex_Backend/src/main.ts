import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import userApi from "./api/user_api.js";
import authApi from "./api/auth_api.js";
import packageApi from "./api/package_api.js";
import { validateApiKey } from "./middleware/api_key_middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[Request] ${req.method} ${req.path} - Origin: ${req.headers.origin || "no origin"}`);
  next();
});

// CORS middleware - must be before routes
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Handle OPTIONS requests for all API routes before API key validation
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    console.log("[CORS] Handling OPTIONS preflight request for /api");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(204).send();
    return;
  }
  next();
});

// API routes - protected by API key
app.use("/api/auth", validateApiKey, userApi);
app.use("/api/auth", validateApiKey, authApi);
app.use("/api/packages", validateApiKey, packageApi);

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("[Error Handler] Unhandled error:");
  console.error(`[Error Handler] Request: ${req.method} ${req.path}`);
  console.error(`[Error Handler] Error message: ${err.message}`);
  console.error(`[Error Handler] Error stack: ${err.stack}`);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`[404 Handler] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`🚀 Photonex Backend running on http://localhost:${PORT}`);
});

export default app;
