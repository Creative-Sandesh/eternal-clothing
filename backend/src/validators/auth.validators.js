import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters").max(128);
const email = z.string().trim().toLowerCase().email("A valid email is required");

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email,
  password,
  phoneNumber: z.string().trim().max(30).optional().or(z.literal("")),
  referralCode: z.string().trim().max(20).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: password,
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
