import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createOrderSchema = z.object({
  body: z.object({
    businessId: z.string().uuid("Invalid business ID"),
    items: z.array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be positive"),
      })
    ).min(1, "At least one item is required"),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      errorMap: () => ({ message: "Invalid order status" }),
    }),
  }),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});
