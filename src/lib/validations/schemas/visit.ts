import { z } from "zod";
import { commonValidations } from "./common";
import { OrderSchema } from "./order";

/**
 * Base visit schema with common fields
 * Contains core visit data without related entities
 */
const visitBaseSchema = z.object({
  storeId: commonValidations.id,
  salesId: commonValidations.id,
  visitDate: z
    .date({
      required_error: "Tanggal kunjungan wajib diisi",
    })
    .default(() => new Date()),
  checkInTime: z.date({
    required_error: "Waktu check-in wajib diisi",
  }),
  visitDuration: z.number().int().nonnegative().nullable().optional(), // in minutes
  isStockChecked: z.boolean().default(false),
  isDebtCollected: z.boolean().default(false),
  notes: z.string().trim().nullable().optional(),
});

/**
 * Complete visit schema for server-side validation
 * Used for database operations and API endpoints
 */
export const VisitSchema = visitBaseSchema.extend({
  id: commonValidations.id,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema for creating new visits
 * Includes optional flag to indicate if an order will be created
 */
export const CreateVisitSchema = visitBaseSchema.extend({
  // Flag to indicate if an order will be created during visit submission
  hasOrder: z.boolean().default(false),
});

/**
 * Schema for updating existing visits
 * All fields are optional except ID
 */
export const UpdateVisitSchema = visitBaseSchema.partial().extend({
  id: commonValidations.id,
});

/**
 * Client-side schema for visit form
 * Handles string inputs from form fields and coerces to proper types
 */
export const VisitFormSchema = z.object({
  storeId: z.string().min(1, "Toko harus dipilih"),
  visitDate: z.date({
    required_error: "Tanggal kunjungan wajib diisi",
  }),
  checkInTime: z.date({
    required_error: "Waktu check-in wajib diisi",
  }),
  isStockChecked: z.boolean().default(false),
  isDebtCollected: z.boolean().default(false),
  notes: z.string().trim().or(z.literal("")).nullable().optional(),
  hasOrder: z.boolean().default(false),
});

/**
 * Schema for search filtering visits
 * Used for client-side filtering
 */
export const VisitFilterSchema = z.object({
  search: z.string().optional(),
  storeId: z.string().nullable().optional(),
  salesId: z.string().nullable().optional(),
  fromDate: z.date().nullable().optional(),
  toDate: z.date().nullable().optional(),
  hasOrder: z.enum(["true", "false", "all"]).nullable().optional(),
  isStockChecked: z.boolean().nullable().optional(),
  isDebtCollected: z.boolean().nullable().optional(),
});

/**
 * Schema for visit with associated order data
 * Used for displaying visit details with order information
 */
export const VisitWithOrderSchema = VisitSchema.extend({
  order: OrderSchema.nullable().optional(), // One-to-one relation through visitId in Order
  store: z
    .object({
      id: z.string(),
      name: z.string(),
      province: z.string(),
      regency: z.string(),
      district: z.string(),
    })
    .optional(),
  sales: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
    })
    .optional(),
});

/**
 * Schema for visit statistics/summary
 */
export const VisitStatsSchema = z.object({
  totalVisits: z.number(),
  visitsWithOrder: z.number(),
  stockChecked: z.number(),
  debtCollected: z.number(),
  avgDuration: z.number().nullable(), // average duration in minutes
});

/**
 * Helper to calculate visit duration
 * Returns duration in minutes between checkIn and creation time
 */
export function calculateVisitDuration(
  checkInTime: Date,
  createdAt: Date
): number {
  const diffMs = createdAt.getTime() - checkInTime.getTime();
  return Math.floor(diffMs / 60000); // Convert to minutes
}

// Type exports for better TypeScript integration
export type Visit = z.infer<typeof VisitSchema>;
export type CreateVisit = z.infer<typeof CreateVisitSchema>;
export type UpdateVisit = z.infer<typeof UpdateVisitSchema>;
export type VisitForm = z.infer<typeof VisitFormSchema>;
export type VisitFilter = z.infer<typeof VisitFilterSchema>;
export type VisitWithOrder = z.infer<typeof VisitWithOrderSchema>;
export type VisitStats = z.infer<typeof VisitStatsSchema>;
