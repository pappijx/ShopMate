import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return ApiResponse.error(res, "User already exists", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return ApiResponse.success(
    res,
    userWithoutPassword,
    "User created successfully",
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return ApiResponse.error(res, "Invalid credentials", 401);
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return ApiResponse.error(res, "Invalid credentials", 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return ApiResponse.success(res, userWithoutPassword, "Login successful");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return ApiResponse.error(res, "Refresh token required", 401);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    return ApiResponse.success(res, null, "Token refreshed");
  } catch (error) {
    return ApiResponse.error(res, "Invalid refresh token", 401);
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return ApiResponse.success(res, null, "Logged out successfully");
});

export const chooseRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  const userId = req.user!.id;

  // Update user role
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  const { password: _, ...userWithoutPassword } = user;

  return ApiResponse.success(res, userWithoutPassword, "Role updated successfully");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { password: _, ...userWithoutPassword } = user;

  return ApiResponse.success(res, userWithoutPassword);
});
