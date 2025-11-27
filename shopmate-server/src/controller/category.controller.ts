import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
      _count: {
        select: { products: true },
      },
    },
  });

  return ApiResponse.success(res, categories);
});

export const getSubcategories = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: {
        include: {
          _count: {
            select: { products: true },
          },
        },
      },
    },
  });

  if (!category) {
    return ApiResponse.error(res, "Category not found", 404);
  }

  return ApiResponse.success(res, category);
});
