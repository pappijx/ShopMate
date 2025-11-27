import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import { OrderStatus } from "@prisma/client";

// Buyer: Create order
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { businessId, items } = req.body; // items: [{productId, quantity}]
  const userId = req.user!.id;

  // Get business and verify seller
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    return ApiResponse.error(res, "Business not found", 404);
  }

  // Calculate total and verify products
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.businessId !== businessId) {
      return ApiResponse.error(res, `Invalid product: ${item.productId}`, 400);
    }
    if (product.stock < item.quantity) {
      return ApiResponse.error(res, `Insufficient stock for ${product.name}`, 400);
    }

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    orderItems.push({
      productId: item.productId,
      businessId,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // Create order with items
  const order = await prisma.order.create({
    data: {
      userId,
      businessId,
      sellerId: business.ownerId,
      total,
      orderItems: {
        create: orderItems,
      },
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      business: true,
    },
  });

  // Update product stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }

  return ApiResponse.success(res, order, "Order created successfully", 201);
});

// Buyer: Get my orders
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      business: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.success(res, orders);
});

// Get order by ID (buyer or seller)
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      business: true,
      seller: { select: { id: true, name: true, email: true } },
      user: { select: { id: true, name: true, email: true } },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return ApiResponse.error(res, "Order not found", 404);
  }

  // Check authorization
  if (order.userId !== userId && order.sellerId !== userId) {
    return ApiResponse.error(res, "Unauthorized", 403);
  }

  return ApiResponse.success(res, order);
});

// Seller: Get orders for my businesses
export const getSellerOrders = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = req.user!.id;

  const orders = await prisma.order.findMany({
    where: { sellerId },
    include: {
      business: true,
      user: { select: { id: true, name: true, email: true } },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.success(res, orders);
});

// Seller: Update order status
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const sellerId = req.user!.id;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return ApiResponse.error(res, "Order not found", 404);
  }

  if (order.sellerId !== sellerId) {
    return ApiResponse.error(res, "Unauthorized", 403);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      business: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  return ApiResponse.success(res, updatedOrder, "Order status updated");
});
