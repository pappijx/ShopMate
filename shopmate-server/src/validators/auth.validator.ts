import { z } from "zod";
import { Role } from "@prisma/client";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const chooseRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: "Role must be either BUYER or SELLER" }),
    }),
  }),
});
