import { z } from "zod";

export const createBusinessSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Business name must be at least 2 characters"),
    description: z.string().optional(),
    address: z.string().optional(),
    ownerContact: z.string().optional(),
  }),
});

export const updateBusinessSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid business ID"),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    ownerContact: z.string().optional(),
  }),
});

export const getBusinessSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid business ID"),
  }),
});
