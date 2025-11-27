import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z.string().optional(),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number",
    }),
    stock: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: "Stock must be a non-negative number",
    }),
    categoryId: z.string().uuid("Invalid category ID"),
    subcategoryId: z.string().uuid("Invalid subcategory ID"),
    businessId: z.string().uuid("Invalid business ID"),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0).optional(),
    stock: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0).optional(),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional(),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});

export const searchProductSchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["price", "createdAt", "name"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});
