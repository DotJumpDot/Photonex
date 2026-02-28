import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.API_KEY;

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[API Key Middleware] ${req.method} ${req.path} - Checking API key...`);

  // Skip API key validation for OPTIONS requests (CORS preflight)
  if (req.method === "OPTIONS") {
    console.log(`[API Key Middleware] OPTIONS request - skipping validation`);
    next();
    return;
  }

  const apiKey = req.headers["x-api-key"];
  console.log(`[API Key Middleware] Received API key: ${apiKey ? "present" : "missing"}`);

  if (!API_KEY) {
    console.error(`[API Key Middleware] ERROR: API_KEY not configured on server`);
    res.status(500).json({ error: "API key not configured on server" });
    return;
  }

  if (!apiKey) {
    console.error(`[API Key Middleware] ERROR: No API key provided in request headers`);
    res.status(401).json({ error: "API key required" });
    return;
  }

  if (apiKey !== API_KEY) {
    console.error(
      `[API Key Middleware] ERROR: Invalid API key. Expected: ${API_KEY.substring(0, 5)}..., Received: ${String(apiKey).substring(0, 5)}...`
    );
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  console.log(`[API Key Middleware] API key validated successfully`);
  next();
};
