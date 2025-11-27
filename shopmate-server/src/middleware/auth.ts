import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/response";
import { Role } from "@prisma/client";

interface JwtPayload {
  userId: string;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return ApiResponse.error(res, "Authentication required", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, "Invalid or expired token", 401);
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, "Authentication required", 401);
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Required role: ${roles.join(" or ")}`,
        403
      );
    }

    next();
  };
};

export const requireSeller = requireRole(Role.SELLER);
export const requireBuyer = requireRole(Role.BUYER);
