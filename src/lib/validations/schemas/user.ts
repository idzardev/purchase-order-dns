import { z } from "zod";
import { UserRoleEnum } from "./enums";
import { commonValidations } from "./common";

/**
 * Helper function untuk menerapkan aturan bisnis:
 * User tidak aktif harus memiliki role BASIC
 */
const enforceInactiveBasicRoleRule = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data) => {
      // Jika user tidak aktif, role harus BASIC
      if (!data.isActive && data.role !== "BASIC") {
        return false;
      }
      return true;
    },
    {
      message: "User tidak aktif harus memiliki role BASIC",
      path: ["role"],
    }
  );

/**
 * Base user schema dengan field-field umum
 * Berisi field yang digunakan bersama di berbagai schema validasi user
 */
const userBaseSchema = z.object({
  role: UserRoleEnum.default("BASIC"),
  isActive: z.boolean().default(true),
});

/**
 * Schema user lengkap untuk validasi di server
 * Sesuai dengan Auth.js dan Prisma schema
 */
export const UserSchema = z.object({
  id: commonValidations.id,
  name: z.string().nullable().optional(),
  email: commonValidations.email,
  emailVerified: z.date().nullable().optional(),
  image: z
    .string()
    .url("URL gambar tidak valid")
    .nullable()
    .optional()
    .refine((val) => !val || val.startsWith("https://"), {
      message: "URL gambar harus menggunakan protokol HTTPS",
    }),
  role: userBaseSchema.shape.role,
  isActive: userBaseSchema.shape.isActive,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema untuk membuat user baru (dari Auth.js provider)
 */
export const CreateUserSchema = z.object({
  email: commonValidations.email,
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  role: userBaseSchema.shape.role,
  isActive: userBaseSchema.shape.isActive,
});

/**
 * Schema untuk update user
 * Digunakan ketika admin mengubah data user
 */
export const UpdateUserSchema = z.object({
  id: commonValidations.id,
  name: z.string().nullable().optional(),
  role: userBaseSchema.shape.role.optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema client-side untuk form update role user
 * Digunakan untuk validasi form di UI manajemen role
 * Termasuk aturan bisnis: user tidak aktif harus memiliki role BASIC
 */
export const UpdateUserRoleFormSchema = enforceInactiveBasicRoleRule(
  z.object({
    id: commonValidations.id,
    role: userBaseSchema.shape.role,
    isActive: userBaseSchema.shape.isActive,
  })
);

/**
 * Schema client-side untuk manajemen user
 * Digunakan di antarmuka admin untuk manajemen user
 */
export const UserManagementFormSchema = enforceInactiveBasicRoleRule(
  z.object({
    id: commonValidations.id,
    role: userBaseSchema.shape.role,
    isActive: userBaseSchema.shape.isActive,
    name: z.string().nullable().optional(),
  })
);

// Export tipe untuk integrasi TypeScript yang lebih baik
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UpdateUserRoleForm = z.infer<typeof UpdateUserRoleFormSchema>;
export type UserManagementForm = z.infer<typeof UserManagementFormSchema>;
