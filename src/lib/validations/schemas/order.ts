import { z } from "zod";
import { commonValidations } from "./common";
import { DiscountTypeEnum, OrderStatusEnum, PriceTypeEnum } from "./enums";

/**
 * Schema for OrderNumber generation (server-side only)
 * Format: PO-YYYYMMDD-0000
 */
export const generateOrderNumber = (sequence: number = 1) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  const seq = String(sequence).padStart(3, "0");

  return `PO-${dateStr}-${seq}`;
};

/**
 * Decimal helper for Prisma compatibility
 * Handles string/number conversion for Decimal fields
 */
const decimalSchema = (
  maxDigits: number,
  decimalPlaces: number,
  message?: string
) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseFloat(val);
        if (isNaN(num)) throw new Error("Format angka tidak valid");
        return num;
      }
      return val;
    })
    .refine((val) => val >= 0, message || "Nilai harus non-negatif")
    .refine((val) => {
      const str = val.toString();
      const [integer, decimal] = str.split(".");
      return (
        integer.length <= maxDigits - decimalPlaces &&
        (!decimal || decimal.length <= decimalPlaces)
      );
    }, `Nilai melebihi ${maxDigits} digit dengan ${decimalPlaces} desimal`);

/**
 * Status transition validation
 * Defines valid status transitions based on business rules
 */
export const statusTransitionMap: Record<string, string[]> = {
  DRAFT: ["DISETUJUI", "TIDAK_TERKIRIM"],
  DISETUJUI: ["TERKIRIM", "TIDAK_TERKIRIM"],
  TERKIRIM: [], // Final status
  TIDAK_TERKIRIM: ["DISETUJUI"], // Can be re-approved
};

/**
 * Validates if status transition is allowed
 */
export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): boolean => {
  return statusTransitionMap[currentStatus]?.includes(newStatus) ?? false;
};

/**
 * Base schema for order item validation without refinements
 * Aligned with Prisma OrderItem model
 */
const orderItemBaseSchema = z.object({
  productId: commonValidations.id,
  quantity: z.number().int().positive("Jumlah harus bilangan bulat positif"),
  priceType: PriceTypeEnum.default("MODERN"),
  unitPrice: decimalSchema(8, 2, "Harga unit harus valid"),
  customPrice: decimalSchema(8, 2, "Harga kustom harus valid")
    .nullable()
    .optional(),
  customPriceReason: z.string().trim().nullable().optional(),
  itemDiscountType: DiscountTypeEnum.nullable().optional(),
  itemDiscountValue: decimalSchema(10, 2, "Nilai diskon harus valid").default(
    0
  ),
  itemDiscountAmount: decimalSchema(12, 2, "Jumlah diskon harus valid").default(
    0
  ),
  itemDiscountDescription: z.string().trim().nullable().optional(),
  subtotal: decimalSchema(11, 2, "Subtotal harus valid"),
  finalPrice: decimalSchema(10, 2, "Harga final harus valid"),
});

/**
 * Complete order item schema for server-side validation
 * Matches Prisma OrderItem model exactly
 */
export const OrderItemSchema = orderItemBaseSchema.extend({
  id: commonValidations.id,
  orderId: commonValidations.id,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Base schema for creating order items without refinements
 */
const createOrderItemBaseSchema = z.object({
  productId: commonValidations.id,
  quantity: z.number().int().positive("Jumlah harus bilangan bulat positif"),
  priceType: PriceTypeEnum.default("MODERN"),
  customPrice: decimalSchema(8, 2, "Harga kustom harus valid")
    .nullable()
    .optional(),
  customPriceReason: z.string().trim().nullable().optional(),
  itemDiscountType: DiscountTypeEnum.nullable().optional(),
  itemDiscountValue: decimalSchema(10, 2, "Nilai diskon harus valid").default(
    0
  ),
  itemDiscountDescription: z.string().trim().nullable().optional(),
});

/**
 * Schema for creating new order items
 * Handles price calculation logic automatically
 */
export const CreateOrderItemSchema = createOrderItemBaseSchema
  .refine(
    (data) => {
      // Custom price required for CUSTOM price type
      return (
        data.priceType !== "CUSTOM" ||
        (data.customPrice !== null &&
          data.customPrice !== undefined &&
          data.customPrice > 0)
      );
    },
    {
      message: "Harga kustom wajib diisi jika tipe harga adalah CUSTOM",
      path: ["customPrice"],
    }
  )
  .refine(
    (data) => {
      // Custom price reason required for CUSTOM price type
      return (
        data.priceType !== "CUSTOM" ||
        (data.customPriceReason !== null &&
          data.customPriceReason !== undefined &&
          data.customPriceReason.trim() !== "")
      );
    },
    {
      message: "Alasan harga kustom wajib diisi jika tipe harga adalah CUSTOM",
      path: ["customPriceReason"],
    }
  )
  .refine(
    (data) => {
      // Percentage discount cannot exceed 100%
      return (
        data.itemDiscountType !== "PERCENTAGE" || data.itemDiscountValue <= 100
      );
    },
    {
      message: "Diskon persentase tidak boleh melebihi 100%",
      path: ["itemDiscountValue"],
    }
  );

/**
 * Base schema for updating order items without refinements
 */
const updateOrderItemBaseSchema = createOrderItemBaseSchema.extend({
  id: z.string().uuid().optional(), // Optional for new items
  isDeleted: z.boolean().optional(), // For soft delete
});

/**
 * Schema for updating order items
 * Supports partial updates and item deletion
 */
export const UpdateOrderItemSchema = updateOrderItemBaseSchema
  .refine(
    (data) => {
      // Custom price required for CUSTOM price type
      return (
        data.priceType !== "CUSTOM" ||
        (data.customPrice !== null &&
          data.customPrice !== undefined &&
          data.customPrice > 0)
      );
    },
    {
      message: "Harga kustom wajib diisi jika tipe harga adalah CUSTOM",
      path: ["customPrice"],
    }
  )
  .refine(
    (data) => {
      // Custom price reason required for CUSTOM price type
      return (
        data.priceType !== "CUSTOM" ||
        (data.customPriceReason !== null &&
          data.customPriceReason !== undefined &&
          data.customPriceReason.trim() !== "")
      );
    },
    {
      message: "Alasan harga kustom wajib diisi jika tipe harga adalah CUSTOM",
      path: ["customPriceReason"],
    }
  )
  .refine(
    (data) => {
      // Percentage discount cannot exceed 100%
      return (
        data.itemDiscountType !== "PERCENTAGE" || data.itemDiscountValue <= 100
      );
    },
    {
      message: "Diskon persentase tidak boleh melebihi 100%",
      path: ["itemDiscountValue"],
    }
  );

/**
 * Schema for status history entries
 * Matches JSON structure in Prisma
 */
export const StatusHistoryEntrySchema = z.object({
  status: OrderStatusEnum,
  timestamp: z.date(),
  userId: z.string().uuid(),
  userName: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Base schema for order validation
 * Aligned with Prisma Order model
 */
const orderBaseSchema = z.object({
  orderNumber: z.string().min(1, "Nomor order wajib diisi"),
  orderDate: z.date().default(() => new Date()),
  status: OrderStatusEnum.default("DRAFT"),
  subtotal: decimalSchema(11, 2, "Subtotal harus valid"),
  total: decimalSchema(11, 2, "Total harus valid"),
  orderDiscountType: DiscountTypeEnum.nullable().optional(),
  orderDiscountValue: decimalSchema(
    10,
    2,
    "Nilai diskon order harus valid"
  ).default(0),
  orderDiscountAmount: decimalSchema(
    12,
    2,
    "Jumlah diskon order harus valid"
  ).default(0),
  orderDiscountDescription: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  deliveryDate: z.date().nullable().optional(),
  rejectionReason: z.string().trim().nullable().optional(),
  rejectedAt: z.date().nullable().optional(),
  rejectedBy: z.string().nullable().optional(),
  approvedAt: z.date().nullable().optional(),
  approvedBy: z.string().nullable().optional(),
  statusHistory: z.array(StatusHistoryEntrySchema).nullable().optional(),
  salesId: commonValidations.id,
  storeId: commonValidations.id,
  visitId: z.string().uuid().nullable().optional(),
});

/**
 * Complete order schema for server-side validation
 * Matches Prisma Order model exactly
 */
export const OrderSchema = orderBaseSchema.extend({
  id: commonValidations.id,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Base schema for creating orders without refinements
 */
const createOrderBaseSchema = z.object({
  // orderNumber will be auto-generated, not provided by client
  storeId: commonValidations.id,
  salesId: z.string().uuid().min(1, "Sales ID tidak boleh kosong"),
  visitId: z.string().uuid().nullable().optional(), // Optional for ADMIN
  orderDiscountType: DiscountTypeEnum.nullable().optional(),
  orderDiscountValue: decimalSchema(
    10,
    2,
    "Nilai diskon order harus valid"
  ).default(0),
  orderDiscountDescription: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  items: z
    .array(CreateOrderItemSchema)
    .min(1, "Order harus memiliki minimal 1 item"),
});

/**
 * Schema for creating new orders
 * Generates orderNumber automatically
 */
export const CreateOrderSchema = createOrderBaseSchema
  .refine(
    (data) => {
      // Percentage discount cannot exceed 100%
      return (
        data.orderDiscountType !== "PERCENTAGE" ||
        data.orderDiscountValue <= 100
      );
    },
    {
      message: "Diskon persentase tidak boleh melebihi 100%",
      path: ["orderDiscountValue"],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate products
      const productIds = data.items.map((item) => item.productId);
      return new Set(productIds).size === productIds.length;
    },
    {
      message: "Produk tidak boleh duplikat dalam satu order",
      path: ["items"],
    }
  );

/**
 * Base schema for updating orders without refinements
 */
const updateOrderBaseSchema = z.object({
  id: commonValidations.id,
  orderDiscountType: DiscountTypeEnum.nullable().optional(),
  orderDiscountValue: decimalSchema(
    10,
    2,
    "Nilai diskon order harus valid"
  ).optional(),
  orderDiscountDescription: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  deliveryDate: z.date().nullable().optional(),
  items: z
    .array(UpdateOrderItemSchema)
    .min(1, "Order harus memiliki minimal 1 item"),
});

/**
 * Schema for updating existing orders
 * Only allows updates when status is DRAFT
 */
export const UpdateOrderSchema = updateOrderBaseSchema
  .refine(
    (data) => {
      return (
        data.orderDiscountType !== "PERCENTAGE" ||
        data.orderDiscountValue === undefined ||
        data.orderDiscountValue <= 100
      );
    },
    {
      message: "Diskon persentase tidak boleh melebihi 100%",
      path: ["orderDiscountValue"],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate products in non-deleted items
      const nonDeletedItems = data.items.filter((item) => !item.isDeleted);
      const productIds = nonDeletedItems.map((item) => item.productId);
      return new Set(productIds).size === productIds.length;
    },
    {
      message: "Produk tidak boleh duplikat dalam satu order",
      path: ["items"],
    }
  );

/**
 * Schema for updating order status
 * Includes status transition validation
 */
export const UpdateOrderStatusSchema = z
  .object({
    id: commonValidations.id,
    currentStatus: OrderStatusEnum, // Required to validate transition
    newStatus: OrderStatusEnum,
    rejectionReason: z.string().trim().nullable().optional(),
    deliveryDate: z.date().nullable().optional(),
    userId: z.string().uuid("ID user tidak valid"),
    userName: z.string().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      // Validate status transition
      return validateStatusTransition(data.currentStatus, data.newStatus);
    },
    {
      message: "Transisi status tidak valid",
      path: ["newStatus"],
    }
  );

/**
 * Client-side schema for order form
 * Simplified for UI with automatic calculations
 */
export const OrderFormSchema = z
  .object({
    storeId: z.string().min(1, "Toko harus dipilih"),
    visitId: z.string().uuid().nullable().optional(),
    orderDiscountType: DiscountTypeEnum.nullable().optional(),
    orderDiscountValue: z.number().default(0),
    orderDiscountDescription: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          productId: z.string().min(1, "Produk harus dipilih"),
          quantity: z.number().int().positive("Jumlah harus positif"),
          priceType: PriceTypeEnum.default("MODERN"),
          customPrice: z.number().nullable().optional(),
          customPriceReason: z.string().nullable().optional(),
          itemDiscountType: DiscountTypeEnum.nullable().optional(),
          itemDiscountValue: z.number().default(0),
          itemDiscountDescription: z.string().nullable().optional(),
          isDeleted: z.boolean().optional(),
        })
      )
      .min(1, "Order harus memiliki minimal 1 item"),
  })
  .refine(
    (data) => {
      // Ensure at least one active item
      const activeItems = data.items.filter((item) => !item.isDeleted);
      return activeItems.length > 0;
    },
    {
      message: "Order harus memiliki minimal 1 item aktif",
      path: ["items"],
    }
  )
  .refine(
    (data) => {
      return (
        data.orderDiscountType !== "PERCENTAGE" ||
        data.orderDiscountValue <= 100
      );
    },
    {
      message: "Diskon persentase tidak boleh melebihi 100%",
      path: ["orderDiscountValue"],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate products in active items
      const activeItems = data.items.filter((item) => !item.isDeleted);
      const productIds = activeItems.map((item) => item.productId);
      return new Set(productIds).size === productIds.length;
    },
    {
      message: "Produk tidak boleh duplikat dalam satu order",
      path: ["items"],
    }
  );

/**
 * Schema for order filtering
 * Supports complex filtering for different user roles
 */
export const OrderFilterSchema = z.object({
  search: z.string().optional(),
  storeId: z.string().nullable().optional(),
  salesId: z.string().nullable().optional(),
  status: OrderStatusEnum.nullable().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  sortBy: z.enum(["orderDate", "orderNumber", "total", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Schema for purchase order generation
 */
export const GeneratePurchaseOrderSchema = z.object({
  orderId: commonValidations.id,
  adminId: commonValidations.id,
});

// Type exports for TypeScript integration
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type UpdateOrderItem = z.infer<typeof UpdateOrderItemSchema>;
export type UpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema>;
export type OrderFilter = z.infer<typeof OrderFilterSchema>;
export type StatusHistoryEntry = z.infer<typeof StatusHistoryEntrySchema>;
export type GeneratePurchaseOrder = z.infer<typeof GeneratePurchaseOrderSchema>;

// Client-side types
export type OrderForm = z.infer<typeof OrderFormSchema>;
