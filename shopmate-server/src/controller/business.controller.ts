import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import fs from "fs";
import path from "path";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, address, ownerContact } = req.body;
  const ownerId = req.user!.id;
  const logoUrl = req.file ? `/uploads/businesses/${req.file.filename}` : null;

  const business = await prisma.business.create({
    data: {
      name,
      description,
      address,
      ownerContact,
      ownerId,
      logoUrl,
    },
  });

  return ApiResponse.success(res, business, "Business created successfully", 201);
});

export const getMyBusinesses = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;

  const businesses = await prisma.business.findMany({
    where: { ownerId },
    include: {
      _count: {
        select: { products: true, orders: true },
      },
    },
  });

  return ApiResponse.success(res, businesses);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      products: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!business) {
    return ApiResponse.error(res, "Business not found", 404);
  }

  return ApiResponse.success(res, business);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, address, ownerContact } = req.body;
  const ownerId = req.user!.id;

  // Check ownership
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) {
    return ApiResponse.error(res, "Business not found", 404);
  }
  if (existing.ownerId !== ownerId) {
    return ApiResponse.error(res, "Unauthorized", 403);
  }

  // Handle logo update
  let logoUrl = existing.logoUrl;
  if (req.file) {
    // Delete old logo
    if (existing.logoUrl) {
      const oldPath = path.join(process.cwd(), existing.logoUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    logoUrl = `/uploads/businesses/${req.file.filename}`;
  }

  const business = await prisma.business.update({
    where: { id },
    data: {
      name,
      description,
      address,
      ownerContact,
      logoUrl,
    },
  });

  return ApiResponse.success(res, business, "Business updated successfully");
});

export const deleteBusiness = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user!.id;

  // Check ownership
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) {
    return ApiResponse.error(res, "Business not found", 404);
  }
  if (existing.ownerId !== ownerId) {
    return ApiResponse.error(res, "Unauthorized", 403);
  }

  // Delete logo file
  if (existing.logoUrl) {
    const logoPath = path.join(process.cwd(), existing.logoUrl);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }
  }

  await prisma.business.delete({ where: { id } });

  return ApiResponse.success(res, null, "Business deleted successfully");
});
