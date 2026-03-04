import { Request } from "express";

export interface JwtPayload {
  userId: string;
  username: string;
  email?: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
