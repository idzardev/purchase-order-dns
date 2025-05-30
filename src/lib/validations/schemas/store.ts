import { z } from "zod";
import { commonValidations } from "./common";
import { StoreTypeEnum } from "./enums";

/**
 * Base store schema with common fields
 * Contains core store data without user information
 */
const storeBaseSchema = z.object({
  name: commonValidations.name,
  province: commonValidations.name,
  regency: commonValidations.name,
  district: commonValidations.name,
  address: z.string().min(5, "Alamat minimal 5 karakter").trim(),
  gmapsLink: z
    .string()
    .url("URL Google Maps tidak valid")
    .startsWith("https://", "URL harus menggunakan HTTPS")
    .nullable()
    .optional(),
  detailAddress: z.string().trim().nullable().optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+[0-9]{1,3})?[0-9]{10,13}$/, "Nomor telepon tidak valid")
    .or(z.literal(""))
    .nullable()
    .optional(),
  storeType: StoreTypeEnum.default("BARU"),
  isActive: z.boolean().default(true),
  notes: z.string().trim().nullable().optional(),
  ownerName: z
    .string()
    .trim()
    .min(2, "Nama pemilik minimal 2 karakter")
    .nullable()
    .optional(),
  ownerPhone: z
    .string()
    .regex(/^(\+[0-9]{1,3})?[0-9]{10,13}$/, "Nomor telepon pemilik tidak valid")
    .or(z.literal(""))
    .nullable()
    .optional(),
});

/**
 * Complete store schema for server-side validation
 * Used for database operations and API endpoints
 */
export const StoreSchema = storeBaseSchema.extend({
  id: commonValidations.id,
  userId: z.string().uuid().nullable().optional(), // createdBy user
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema for creating new stores
 * Omits the ID field which is auto-generated
 */
export const CreateStoreSchema = storeBaseSchema.extend({
  userId: z.string().uuid().nullable().optional(), // createdBy user
});

/**
 * Schema for updating existing stores
 * All fields are optional except ID
 */
export const UpdateStoreSchema = storeBaseSchema.partial().extend({
  id: commonValidations.id,
});

/**
 * Client-side schema for store form
 * Handles string inputs from form fields and coerces to proper types
 */
export const StoreFormSchema = z.object({
  name: commonValidations.name,
  province: commonValidations.name,
  regency: commonValidations.name,
  district: commonValidations.name,
  address: z.string().min(5, "Alamat minimal 5 karakter").trim(),
  gmapsLink: z
    .union([
      z
        .string()
        .url("URL Google Maps tidak valid")
        .startsWith("https://", "URL harus menggunakan HTTPS"),
      z.literal(""),
    ])
    .nullable()
    .optional(),
  detailAddress: z.string().trim().or(z.literal("")).nullable().optional(),
  phoneNumber: z
    .union([
      z
        .string()
        .regex(/^(\+[0-9]{1,3})?[0-9]{10,13}$/, "Nomor telepon tidak valid"),
      z.literal(""),
    ])
    .nullable()
    .optional(),
  storeType: StoreTypeEnum.default("BARU"),
  isActive: z.boolean().default(true),
  notes: z.string().trim().or(z.literal("")).nullable().optional(),
  ownerName: z
    .string()
    .trim()
    .min(2, "Nama pemilik minimal 2 karakter")
    .or(z.literal(""))
    .nullable()
    .optional(),
  ownerPhone: z
    .union([
      z
        .string()
        .regex(
          /^(\+[0-9]{1,3})?[0-9]{10,13}$/,
          "Nomor telepon pemilik tidak valid"
        ),
      z.literal(""),
    ])
    .nullable()
    .optional(),
});

/**
 * Schema for store uniqueness check
 * Based on unique constraint in Prisma schema
 */
export const StoreUniquenessSchema = z.object({
  name: commonValidations.name,
  province: commonValidations.name,
  regency: commonValidations.name,
  district: commonValidations.name,
});

/**
 * Schema for search filtering stores
 * Used for client-side filtering
 */
export const StoreFilterSchema = z.object({
  search: z.string().optional(),
  storeType: StoreTypeEnum.nullable().optional(),
  province: z.string().nullable().optional(),
  regency: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
  userId: z.string().uuid().nullable().optional(), // filter by creator
});

// Type exports for better TypeScript integration
export type Store = z.infer<typeof StoreSchema>;
export type CreateStore = z.infer<typeof CreateStoreSchema>;
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
export type StoreForm = z.infer<typeof StoreFormSchema>;
export type StoreFilter = z.infer<typeof StoreFilterSchema>;
export type StoreUniqueness = z.infer<typeof StoreUniquenessSchema>;
