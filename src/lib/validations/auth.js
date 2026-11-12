
import { z } from "zod";

// Registration validation
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must contain at least 3 characters")
      .max(100, "Full name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .max(255, "Email is too long"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),

    confirmPassword: z.string(),

    requestedRoleId: z
      .number()
      .int("Please select a valid role")
      .positive("Please select a role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Invalid password"),
});
