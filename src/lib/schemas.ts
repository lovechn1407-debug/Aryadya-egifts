import { z } from "zod";

// Base schemas for common fields
const phoneSchema = z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone must not exceed 15 digits").regex(/^\+?[0-9]+$/, "Invalid phone format");
const emailSchema = z.string().email("Invalid email format").max(255);
const idSchema = z.string().min(1, "ID cannot be empty").max(100);

// Auth Routes
export const AdminLoginSchema = z.object({
  password: z.string().min(1, "Password is required").max(100),
});

export const BuyerLoginSchema = z.object({
  phone: phoneSchema,
  email: emailSchema,
});

// Order Routes
export const CreatePendingOrderSchema = z.object({
  productId: idSchema,
  customizations: z.record(z.string(), z.any()).optional().default({}),
  buyerName: z.string().min(1, "Name is required").max(100),
  buyerEmail: emailSchema,
  buyerPhone: phoneSchema,
  price: z.number().min(0, "Price must be non-negative").max(1000000).optional(),
  previewUrl: z.string().url("Invalid URL format").max(1000).optional(),
});

export const UpdateCustomizationsSchema = z.object({
  orderId: idSchema,
  customizations: z.record(z.string(), z.any()),
});

export const OrderIdSchema = z.object({
  orderId: idSchema,
});

export const AdUnlockSchema = z.object({
  orderId: idSchema,
  finalize: z.boolean().optional(),
});

// Admin Preview Routes
export const UpdatePreviewSchema = z.object({
  targetId: idSchema,
  customizations: z.record(z.string(), z.any()),
});

// Cashfree Routes
export const CreateCashfreeOrderSchema = z.object({
  productId: idSchema,
  buyerName: z.string().min(1, "Name is required").max(100),
  buyerEmail: emailSchema,
  buyerPhone: phoneSchema,
  couponCode: z.string().max(50).optional(),
});

export const PayCashfreeOrderSchema = z.object({
  orderId: idSchema,
  couponCode: z.string().max(50).optional(),
});

export const CashfreeReturnSchema = z.object({
  order_id: idSchema,
  finalize: z.enum(["true", "false"]).optional(),
});

// Webhook validation can be complex, just validating the fields we extract
export const CashfreeWebhookSchema = z.object({
  data: z.object({
    order: z.object({
      order_id: idSchema,
      order_status: z.string().min(1).max(50),
    }),
  }).passthrough(),
}).passthrough();

export const FileIdSchema = z.object({
  fileId: idSchema,
});

// Utility function to format Zod errors
export function formatZodError(error: any) {
  if (error && Array.isArray(error.issues)) {
    return error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
  }
  if (error && Array.isArray(error.errors)) {
    return error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
  }
  return error?.message || "Validation failed";
}
