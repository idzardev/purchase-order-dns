import { z } from "zod";

/**
 * Enum definitions for application domain
 * All application enums are centralized here for better maintainability
 * Aligned with Prisma schema enums
 */

// User Role Definitions
export const UserRoleEnum = z.enum([
  "ADMIN", // Full system access
  "SALES", // Create orders and perform visits
  "MANAGER", // Reporting and analytics
  "BASIC", // Limited dashboard access
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

// Product Type Definitions (renamed from CategoryProduct)
export const ProductTypeEnum = z.enum(["BISCUIT", "CANDY"]);
export type ProductType = z.infer<typeof ProductTypeEnum>;

// Store Type Definitions
export const StoreTypeEnum = z.enum([
  "BARU", // New store, needs verification
  "TERVERIFIKASI", // Verified active store
  "TIDAK_AKTIF", // Inactive store
]);
export type StoreType = z.infer<typeof StoreTypeEnum>;

// Order Status Definitions
export const OrderStatusEnum = z.enum([
  "DRAFT", // Initial order status, editable
  "DISETUJUI", // Approved by admin
  "TERKIRIM", // Delivered to customer
  "TIDAK_TERKIRIM", // Not delivered, with optional reason
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Discount Type Definitions
export const DiscountTypeEnum = z.enum([
  "PERCENTAGE", // Percentage discount (0-100%)
  "FIXED", // Fixed amount discount
]);
export type DiscountType = z.infer<typeof DiscountTypeEnum>;

// Price Type Definitions
export const PriceTypeEnum = z.enum([
  "GROSIR", // Wholesale price
  "SEMI_GROSIR", // Semi-wholesale price
  "RETAIL", // Retail price
  "MODERN", // Modern retail price (default)
  "CUSTOM", // Custom price with reason required
]);
export type PriceType = z.infer<typeof PriceTypeEnum>;

// Group all enums for easier import
export const Enums = {
  UserRole: UserRoleEnum,
  ProductType: ProductTypeEnum,
  StoreType: StoreTypeEnum,
  OrderStatus: OrderStatusEnum,
  DiscountType: DiscountTypeEnum,
  PriceType: PriceTypeEnum,
};

// Enum labels for UI display
export const EnumLabels = {
  UserRole: {
    ADMIN: "Administrator",
    SALES: "Sales",
    MANAGER: "Manager",
    BASIC: "Basic User",
  },
  ProductType: {
    BISCUIT: "Biskuit",
    CANDY: "Permen",
  },
  StoreType: {
    BARU: "Baru",
    TERVERIFIKASI: "Terverifikasi",
    TIDAK_AKTIF: "Tidak Aktif",
  },
  OrderStatus: {
    DRAFT: "Draft",
    DISETUJUI: "Disetujui",
    TERKIRIM: "Terkirim",
    TIDAK_TERKIRIM: "Tidak Terkirim",
  },
  DiscountType: {
    PERCENTAGE: "Persentase",
    FIXED: "Nominal",
  },
  PriceType: {
    GROSIR: "Grosir",
    SEMI_GROSIR: "Semi Grosir",
    RETAIL: "Retail",
    MODERN: "Modern",
    CUSTOM: "Kustom",
  },
} as const;

// Enum colors for UI styling
export const EnumColors = {
  OrderStatus: {
    DRAFT: "gray",
    DISETUJUI: "blue",
    TERKIRIM: "green",
    TIDAK_TERKIRIM: "red",
  },
  StoreType: {
    BARU: "yellow",
    TERVERIFIKASI: "green",
    TIDAK_AKTIF: "red",
  },
  UserRole: {
    ADMIN: "purple",
    SALES: "blue",
    MANAGER: "green",
    BASIC: "gray",
  },
} as const;
