import { z } from "zod";
import { commonValidations } from "./common";
import { ProductTypeEnum } from "./enums";

/**
 * Price validation helper
 * Creates a decimal schema compatible with Prisma Decimal(8,2)
 */
const createPriceSchema = (fieldName: string) =>
  z
    .number()
    .positive(`${fieldName} harus angka positif`)
    .max(999999.99, `${fieldName} maksimal 999.999,99`)
    .transform((val) => Number(val.toFixed(2)));

/**
 * Base product schema with common fields
 * Contains core product data without pricing information
 */
const productBaseSchema = z.object({
  name: commonValidations.name,
  code: z
    .string()
    .trim()
    .min(3, "Kode produk minimal 3 karakter")
    .regex(
      /^[A-Z0-9-]+$/,
      "Kode produk hanya boleh huruf kapital, angka, dan strip"
    )
    .nullable()
    .optional(),
  imageUrl: commonValidations.url,
  description: commonValidations.description,
  category: ProductTypeEnum,
  isActive: z.boolean().default(true),
});

/**
 * Base price schema with common price fields
 * Used for consistent price validation across schemas
 * All prices are limited to maximum 999.999,99 as per database design
 */
const priceBaseSchema = z.object({
  grosirPrice: createPriceSchema("Harga grosir"),
  semiGrosirPrice: createPriceSchema("Harga semi-grosir"),
  retailPrice: createPriceSchema("Harga retail"),
  modernPrice: createPriceSchema("Harga modern"),
});

/**
 * Complete product schema for server-side validation
 * Used for database operations and API endpoints
 */
export const ProductSchema = productBaseSchema.extend({
  id: commonValidations.id,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema for creating new products
 * Combines product data with price list information
 */
export const CreateProductSchema = productBaseSchema.extend({
  grosirPrice: createPriceSchema("Harga grosir"),
  semiGrosirPrice: createPriceSchema("Harga semi-grosir"),
  retailPrice: createPriceSchema("Harga retail"),
  modernPrice: createPriceSchema("Harga modern"),
});

/**
 * Base schema for updating products without validation
 */
const updateProductBaseSchema = productBaseSchema.partial().extend({
  id: commonValidations.id,
  grosirPrice: createPriceSchema("Harga grosir").optional(),
  semiGrosirPrice: createPriceSchema("Harga semi-grosir").optional(),
  retailPrice: createPriceSchema("Harga retail").optional(),
  modernPrice: createPriceSchema("Harga modern").optional(),
});

/**
 * Schema for updating existing products
 * All fields are optional except ID
 */
export const UpdateProductSchema = updateProductBaseSchema;

/**
 * Price list schema for server-side validation
 * Used for managing product pricing
 */
export const PriceListSchema = z.object({
  id: commonValidations.id,
  productId: commonValidations.id,
  grosirPrice: createPriceSchema("Harga grosir"),
  semiGrosirPrice: createPriceSchema("Harga semi-grosir"),
  retailPrice: createPriceSchema("Harga retail"),
  modernPrice: createPriceSchema("Harga modern"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema for creating price lists
 * Omits the ID field which is auto-generated
 */
export const CreatePriceListSchema = PriceListSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating price lists
 * All fields are optional except productId
 */
export const UpdatePriceListSchema = z.object({
  productId: commonValidations.id,
  grosirPrice: createPriceSchema("Harga grosir").optional(),
  semiGrosirPrice: createPriceSchema("Harga semi-grosir").optional(),
  retailPrice: createPriceSchema("Harga retail").optional(),
  modernPrice: createPriceSchema("Harga modern").optional(),
});

/**
 * Client-side price schema for form handling
 * Handles string inputs from form fields and coerces to proper types
 */
const clientPriceSchema = (fieldName: string) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        if (isNaN(num)) throw new Error(`${fieldName} harus berupa angka`);
        return num;
      }
      return val;
    })
    .refine((val) => val > 0, `${fieldName} harus angka positif`)
    .refine((val) => val <= 999999.99, `${fieldName} maksimal 999.999,99`)
    .transform((val) => Number(val.toFixed(2)));

/**
 * Client-side schema for product form
 * Handles string inputs from form fields and coerces to proper types
 */
export const ProductFormSchema = z.object({
  name: commonValidations.name,
  code: z
    .string()
    .trim()
    .min(3, "Kode produk minimal 3 karakter")
    .regex(
      /^[A-Z0-9-]+$/,
      "Kode produk hanya boleh huruf kapital, angka, dan strip"
    )
    .or(z.literal(""))
    .nullable()
    .optional(),
  imageUrl: commonValidations.url,
  description: commonValidations.description,
  category: ProductTypeEnum,
  isActive: z.boolean().default(true),
  grosirPrice: clientPriceSchema("Harga grosir"),
  semiGrosirPrice: clientPriceSchema("Harga semi-grosir"),
  retailPrice: clientPriceSchema("Harga retail"),
  modernPrice: clientPriceSchema("Harga modern"),
});

/**
 * Helper function to validate if a price set follows business rules
 * Ensures proper price hierarchy (grosir <= semi-grosir <= retail <= modern)
 */
export function validatePriceHierarchy(data: {
  grosirPrice: number;
  semiGrosirPrice: number;
  retailPrice: number;
  modernPrice: number;
}): boolean {
  const { grosirPrice, semiGrosirPrice, retailPrice, modernPrice } = data;
  return (
    grosirPrice <= semiGrosirPrice &&
    semiGrosirPrice <= retailPrice &&
    retailPrice <= modernPrice
  );
}

/**
 * Extension of product form schema with price hierarchy validation
 * Used when strict validation of price relationships is required
 */
export const ProductFormSchemaWithHierarchy = ProductFormSchema.refine(
  (data) => {
    // Only validate hierarchy if all prices are provided
    if (
      typeof data.grosirPrice === "number" &&
      typeof data.semiGrosirPrice === "number" &&
      typeof data.retailPrice === "number" &&
      typeof data.modernPrice === "number"
    ) {
      return validatePriceHierarchy({
        grosirPrice: data.grosirPrice,
        semiGrosirPrice: data.semiGrosirPrice,
        retailPrice: data.retailPrice,
        modernPrice: data.modernPrice,
      });
    }
    return true;
  },
  {
    message:
      "Harga harus mengikuti hierarki: Grosir ≤ Semi-Grosir ≤ Retail ≤ Modern",
    path: ["modernPrice"], // Points to the last field in the hierarchy
  }
);

/**
 * Schema for product search/filtering
 * Used for query parameters in API endpoints
 */
export const ProductSearchSchema = z.object({
  search: z.string().optional(),
  category: ProductTypeEnum.optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "code", "category", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Zod schema for validating and parsing search parameters
 */
export const searchParamsSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num < 1 ? 1 : num;
    })
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num < 1 ? 10 : Math.min(num, 100);
    })
    .default(10),
  search: z.string().optional(),
  category: ProductTypeEnum.optional(),
  isActive: z
    .union([
      z.literal("true"),
      z.literal("false"),
      z.literal("all"),
      z.boolean(),
    ])
    .transform((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      if (val === "all") return undefined;
      return undefined;
    })
    .optional(),
});

/**
 * Zod schema for validating and parsing history parameters
 */
export const historyParamsSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num < 1 ? 1 : num;
    })
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num < 1 ? 10 : Math.min(num, 100);
    })
    .default(10),
});

/**
 * Schema for bulk operations
 */
export const BulkProductOperationSchema = z.object({
  productIds: z
    .array(commonValidations.id)
    .min(1, "Minimal 1 produk harus dipilih"),
  action: z.enum(["activate", "deactivate", "delete"]),
});

/**
 * Schema for product price comparison
 */
export const ProductPriceComparisonSchema = z.object({
  productIds: z
    .array(commonValidations.id)
    .min(2, "Minimal 2 produk untuk perbandingan")
    .max(5, "Maksimal 5 produk untuk perbandingan"),
});

// Type exports for better TypeScript integration
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type PriceList = z.infer<typeof PriceListSchema>;
export type CreatePriceList = z.infer<typeof CreatePriceListSchema>;
export type UpdatePriceList = z.infer<typeof UpdatePriceListSchema>;
export type ProductForm = z.infer<typeof ProductFormSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type HistoryParams = z.infer<typeof historyParamsSchema>;
export type BulkProductOperation = z.infer<typeof BulkProductOperationSchema>;
export type ProductPriceComparison = z.infer<
  typeof ProductPriceComparisonSchema
>;

/**
 * Utility functions for price operations
 */
export const PriceUtils = {
  /**
   * Format price to Indonesian Rupiah
   */
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  },

  /**
   * Calculate price difference percentage
   */
  calculatePriceDifference: (oldPrice: number, newPrice: number): number => {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  },

  /**
   * Get price by type from product
   */
  getPriceByType: (
    product: {
      grosirPrice: number;
      semiGrosirPrice: number;
      retailPrice: number;
      modernPrice: number;
    },
    priceType: "GROSIR" | "SEMI_GROSIR" | "RETAIL" | "MODERN"
  ): number => {
    switch (priceType) {
      case "GROSIR":
        return product.grosirPrice;
      case "SEMI_GROSIR":
        return product.semiGrosirPrice;
      case "RETAIL":
        return product.retailPrice;
      case "MODERN":
        return product.modernPrice;
      default:
        return product.modernPrice;
    }
  },

  /**
   * Validate if custom price is reasonable compared to standard prices
   */
  validateCustomPrice: (
    customPrice: number,
    standardPrices: {
      grosirPrice: number;
      semiGrosirPrice: number;
      retailPrice: number;
      modernPrice: number;
    }
  ): { isValid: boolean; message?: string } => {
    const { grosirPrice, modernPrice } = standardPrices;
    const minAllowed = grosirPrice * 0.8; // 20% below wholesale
    const maxAllowed = modernPrice * 1.2; // 20% above modern

    if (customPrice < minAllowed) {
      return {
        isValid: false,
        message: `Harga kustom terlalu rendah (minimum: ${PriceUtils.formatPrice(
          minAllowed
        )})`,
      };
    }

    if (customPrice > maxAllowed) {
      return {
        isValid: false,
        message: `Harga kustom terlalu tinggi (maksimum: ${PriceUtils.formatPrice(
          maxAllowed
        )})`,
      };
    }

    return { isValid: true };
  },
} as const;
