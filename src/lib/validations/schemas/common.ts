import { z } from "zod";

/**
 * Centralized validation rules used across the application
 * Provides consistent validation patterns and error messages
 */
export const commonValidations = {
  // Base identifiers
  id: z.string().uuid("ID harus berformat UUID yang valid"),

  // String fiedls with common validation rules
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  description: z.string().trim().optional().nullable(),
  email: z.string().email("Format email tidak valid"),

  // Phone number with international format support
  phoneNumber: z.union([
    z
      .string()
      .regex(/^(\+[0-9]{1,3})?[0-9]{10,13}$/, "Nomor telepon tidak valid"),
    z.literal(""),
    z.null(),
  ]),

  // Numerical fields with validation
  price: z.coerce
    .number()
    .positive("Harga harus angka positif")
    .transform((val) => Number(val.toFixed(2))), // Always 2 decimal places for consistency

  discount: z.coerce
    .number()
    .nonnegative("Diskon tidak boleh negatif")
    .default(0)
    .transform((val) => Number(val.toFixed(2))), // Always 2 decimal places

  // Date fields with validation
  date: z.coerce.date({
    errorMap: () => ({
      message: "Format tanggal tidak valid",
    }),
  }),

  // URL fields
  url: z
    .string()
    .url("URL tidak valid")
    .refine((url) => !url || url.startsWith("https://"), {
      message: "URL harus menggunakan protokol HTTPS",
    })
    .optional()
    .nullable(),
};

/**
 * Helper function to make a field optional
 * @param schema Zod schema to make optional
 * @returns A new schema with the field as optional
 */
export function optionalField<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}

/**
 * Interface for data with price type
 */
interface PriceTypeData {
  priceType: string;
  customPrice?: number | null;
}

/**
 * Shared refinement for custom price validation
 * Used in both order creation and update schemas
 */
export const customPriceRefinement = [
  (data: PriceTypeData) =>
    data.priceType === "CUSTOM"
      ? data.customPrice !== null &&
        data.customPrice !== undefined &&
        data.customPrice > 0
      : true,
  {
    message: "Harga kustom wajib diisi jika tipe harga adalah CUSTOM",
    path: ["customPrice"],
  },
] as const;

/**
 * Interface for data with price type and custom price reason
 */
interface CustomPriceReasonData extends PriceTypeData {
  customPriceReason?: string | null;
}

/**
 * Shared refinement for custom price reason validation
 * Used in both order creation and update schemas
 */
export const customPriceReasonRefinement = [
  (data: CustomPriceReasonData) => {
    if (data.priceType === "CUSTOM") {
      return (
        data.customPriceReason !== null &&
        data.customPriceReason !== undefined &&
        data.customPriceReason.trim() !== ""
      );
    }
    return true;
  },
  {
    message: "Alasan harga kustom wajib diisi jika tipe harga adalah CUSTOM",
    path: ["customPriceReason"],
  },
] as const;

/**
 * Type guard to check if a value is not null or undefined
 * Useful for filtering arrays and handling optional values
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Helper to create validation error message for required fields
 */
export function requiredMessage(fieldName: string): string {
  return `${fieldName} wajib diisi`;
}
