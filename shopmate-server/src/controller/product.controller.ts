import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import fs from "fs";
import path from "path";

// Seller: Create product
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, stock, categoryId, subcategoryId, businessId } = req.body;
  const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

  // Verify business ownership
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || business.ownerId !== req.user!.id) {
    return ApiResponse.error(res, "Unauthorized or business not found", 403);
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      subcategoryId,
      businessId,
      imageUrl,
    },
    include: {
      category: true,
      subcategory: true,
      business: true,
    },
  });

  return ApiResponse.success(res, product, "Product created successfully", 201);
});

// Seller: Update product
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId, subcategoryId } = req.body;

  // Check ownership
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { business: true },
  });

  if (!existing) {
    return ApiResponse.error(res, "Product not found", 404);
  }
  if (existing.business.ownerId !== req.user!.id) {
    return ApiResponse.error(res, "Unauthorized", 403);
  }

  // Handle image update
  let imageUrl = existing.imageUrl;
  if (req.file) {
    if (existing.imageUrl) {
      const oldPath = path.join(process.cwd(), existing.imageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    imageUrl = `/uploads/products/${req.file.filename}`;
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(categoryId && { categoryId }),
      ...(subcategoryId && { subcategoryId }),
      imageUrl,
    },
    include: {
      category: true,
      subcategory: true,
      business: true,
    },
  });

  return ApiResponse.success(res, product, "Product updated successfully");
});

// Seller: Delete product
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { business: true },
  });

  if (!existing) {
    return ApiResponse.error(res, "Product not found", 404);
  }
  if (existing.business.ownerId !== req.user!.id) {
    return ApiResponse.error(res, "Unauthorized", 403);
  }

  // Delete image
  if (existing.imageUrl) {
    const imagePath = path.join(process.cwd(), existing.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await prisma.product.delete({ where: { id } });

  return ApiResponse.success(res, null, "Product deleted successfully");
});

// Public: Get products by business
export const getByBusiness = asyncHandler(async (req: Request, res: Response) => {
  const { businessId } = req.params;

  const products = await prisma.product.findMany({
    where: { businessId },
    include: {
      category: true,
      subcategory: true,
    },
  });

  return ApiResponse.success(res, products);
});

// Public: Search products with filters
export const search = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, subcategoryId, minPrice, maxPrice, search, sortBy = "createdAt", order = "desc" } = req.query;

  const where: any = {};

  if (categoryId) where.categoryId = categoryId;
  if (subcategoryId) where.subcategoryId = subcategoryId;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      business: { select: { id: true, name: true, address: true } },
    },
    orderBy: { [sortBy as string]: order },
  });

  return ApiResponse.success(res, products);
});

// Public: Get single product
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      business: true,
    },
  });

  if (!product) {
    return ApiResponse.error(res, "Product not found", 404);
  }

  return ApiResponse.success(res, product);
});

// Public: Compare prices across shops for same subcategory
export const compareBySubcategory = asyncHandler(async (req: Request, res: Response) => {
  const { subcategoryId } = req.query;

  if (!subcategoryId) {
    return ApiResponse.error(res, "subcategoryId is required", 400);
  }

  const products = await prisma.product.findMany({
    where: { subcategoryId: subcategoryId as string },
    include: {
      business: { select: { id: true, name: true, address: true } },
      subcategory: { include: { category: true } },
    },
    orderBy: { price: "asc" },
  });

  // Group by business for comparison
  const comparison = products.reduce((acc: any, product) => {
    const businessId = product.business.id;
    if (!acc[businessId]) {
      acc[businessId] = {
        business: product.business,
        products: [],
      };
    }
    acc[businessId].products.push(product);
    return acc;
  }, {});

  return ApiResponse.success(res, {
    subcategory: products[0]?.subcategory || null,
    comparison: Object.values(comparison),
    totalProducts: products.length,
  });
});
