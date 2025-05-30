/**
 * Centralized list of all available permissions in the application
 * Used for role-based access control and permission checking
 */

import { UserRole } from "@/types/globals";
import { z } from "zod";

// Permission definitions
export enum Permission {
  // Store permissions
  STORE_CREATE = "store:create",
  STORE_READ = "store:read",
  STORE_READ_ALL = "store:read-all",
  STORE_UPDATE = "store:update",
  STORE_DELETE = "store:delete",

  // Product permissions
  PRODUCT_CREATE = "product:create",
  PRODUCT_READ = "product:read",
  PRODUCT_UPDATE = "product:update",
  PRODUCT_DELETE = "product:delete",
  PRODUCT_MANAGE_PRICES = "product:manage-prices",

  // Order permissions
  ORDER_CREATE = "order:create",
  ORDER_READ = "order:read",
  ORDER_READ_OWN = "order:read-own",
  ORDER_READ_ALL = "order:read-all",
  ORDER_UPDATE = "order:update",
  ORDER_DELETE = "order:delete",
  ORDER_APPROVE = "order:approve",
  ORDER_REJECT = "order:reject",
  ORDER_GENERATE_PO = "order:generate-po",

  // Visit permissions
  VISIT_CREATE = "visit:create",
  VISIT_READ = "visit:read",
  VISIT_READ_OWN = "visit:read-own",
  VISIT_READ_ALL = "visit:read-all",
  VISIT_UPDATE = "visit:update",
  VISIT_DELETE = "visit:delete",
  VISIT_DELETE_ALL = "visit:delete-all",

  // User permissions
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_MANAGE_ROLES = "user:manage-roles",
  USER_DELETE = "user:delete",

  // Report permissions
  REPORT_VIEW = "report:view",

  // Dashboard permissions
  BASIC = "basic",
}

// Mapping of user roles to their associated permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Full system access
    Permission.STORE_CREATE,
    Permission.STORE_READ,
    Permission.STORE_READ_ALL,
    Permission.STORE_UPDATE,
    Permission.STORE_DELETE,

    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_MANAGE_PRICES,

    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_READ_ALL,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
    Permission.ORDER_APPROVE,
    Permission.ORDER_REJECT,
    Permission.ORDER_GENERATE_PO,

    Permission.VISIT_CREATE,
    Permission.VISIT_READ,
    Permission.VISIT_READ_ALL,
    Permission.VISIT_UPDATE,
    Permission.VISIT_DELETE,
    Permission.VISIT_DELETE_ALL,

    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_MANAGE_ROLES,
    Permission.USER_DELETE,

    Permission.REPORT_VIEW,

    Permission.BASIC,
  ],
  SALES: [
    // Create orders and perform visits
    Permission.STORE_READ,
    Permission.STORE_CREATE,

    Permission.PRODUCT_READ,

    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_READ_OWN,
    Permission.ORDER_UPDATE,

    Permission.VISIT_CREATE,
    Permission.VISIT_READ,
    Permission.VISIT_READ_OWN,
    Permission.VISIT_UPDATE,

    Permission.BASIC,
  ],
  MANAGER: [
    // Reporting and analytics (read-only access)
    Permission.STORE_READ,
    Permission.STORE_READ_ALL,

    Permission.PRODUCT_READ,

    Permission.ORDER_READ,
    Permission.ORDER_READ_ALL,

    Permission.VISIT_READ,
    Permission.VISIT_READ_ALL,

    Permission.USER_READ,

    Permission.REPORT_VIEW,

    Permission.BASIC,
  ],

  BASIC: [Permission.BASIC], // Limited dashboard access
};

/**
 * Zod schema for validating permission checks
 */
export const PermissionCheckSchema = z.object({
  userId: z.string().uuid(),
  userRole: z.enum(["ADMIN", "MANAGER", "SALES", "BASIC"]),
  isActive: z.boolean(),
  permission: z.nativeEnum(Permission),
  resourceOwnerId: z.string().uuid().optional(),
});

/**
 * Type definition for permission checks
 */
export type PermissionCheck = z.infer<typeof PermissionCheckSchema>;

/**
 * Helper function to validate and map user roles to their corresponding permission sets
 */
export function validateUserRole(role: string): UserRole {
  const validRoles: UserRole[] = ["ADMIN", "MANAGER", "SALES", "BASIC"];
  return validRoles.includes(role as UserRole) ? (role as UserRole) : "BASIC";
}
/**
 * Helper function to check if a user has a specific permission
 * Based on the user's role and the permission to check
 */
export function hasPermission(
  userRole: UserRole,
  permission: Permission,
  isUserActive: boolean = true,
  userId?: string,
  resourceOwnerId?: string
): boolean {
  // Check if the user is active, if not, return false
  if (!isUserActive && permission !== Permission.BASIC) {
    return false;
  }

  // Check if the user has the required permission
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions?.includes(permission)) {
    return false;
  }

  // Special case: ownership-based permissions
  if (
    permission === Permission.ORDER_READ_OWN ||
    permission === Permission.VISIT_READ_OWN
  ) {
    return userId === resourceOwnerId;
  }

  return true;
}

/**
 * Helper function to check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[],
  isUserActive: boolean = true,
  userId?: string,
  resourceOwnerId?: string
): boolean {
  return permissions.some((permission) =>
    hasPermission(userRole, permission, isUserActive, userId, resourceOwnerId)
  );
}

/**
 * Helper function to check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[],
  isUserActive: boolean = true,
  userId?: string,
  resourceOwnerId?: string
): boolean {
  return permissions.every((permission) =>
    hasPermission(userRole, permission, isUserActive, userId, resourceOwnerId)
  );
}

/**
 * Helper function to check if a user is an admin
 */
export function isAdmin(
  userRole: UserRole,
  isUserActive: boolean = true
): boolean {
  return isUserActive && userRole === "ADMIN";
}

/**
 * Helper function to check if a user is a manager or admin
 */
export function isManagerOrAdmin(
  userRole: UserRole,
  isUserActive: boolean = true
): boolean {
  return isUserActive && (userRole === "ADMIN" || userRole === "MANAGER");
}

/**
 * Helper function to check if a user is a manager, admin, or sales
 */
export function isSalesOrAbove(
  userRole: UserRole,
  isUserActive: boolean = true
): boolean {
  return (
    isUserActive &&
    (userRole === "ADMIN" || userRole === "MANAGER" || userRole === "SALES")
  );
}

/**
 * Resource-specific permission checkers
 */
export const ResourcePermissions = {
  // Store permissions
  canCreateStore: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.STORE_CREATE, isActive),

  canViewAllStores: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.STORE_READ_ALL, isActive),

  // Order permissions
  canApproveOrder: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.ORDER_APPROVE, isActive),

  canGeneratePO: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.ORDER_GENERATE_PO, isActive),

  canViewOwnOrders: (
    role: UserRole,
    isActive: boolean,
    userId: string,
    orderOwnerId: string
  ) =>
    hasPermission(
      role,
      Permission.ORDER_READ_OWN,
      isActive,
      userId,
      orderOwnerId
    ),

  // Visit permissions
  canCreateVisit: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.VISIT_CREATE, isActive),

  canViewAllVisits: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.VISIT_READ_ALL, isActive),

  canDeleteAllVisits: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.VISIT_DELETE_ALL, isActive),

  // User permissions
  canManageRoles: (role: UserRole, isActive: boolean) =>
    hasPermission(role, Permission.USER_MANAGE_ROLES, isActive),
} as const;

/**
 * Business logic helpers
 */
export const BusinessRules = {
  // Store creation rules
  getDefaultStoreStatus: (role: UserRole) => {
    return role === "ADMIN" ? "TERVERIFIKASI" : "BARU";
  },

  // Order editing rules
  canEditOrder: (
    role: UserRole,
    orderStatus: string,
    userId: string,
    orderOwnerId: string
  ) => {
    if (role === "ADMIN") return true;
    if (
      role === "SALES" &&
      orderStatus === "DRAFT" &&
      userId === orderOwnerId
    ) {
      return true;
    }
    return false;
  },

  // Visit requirement rules
  isVisitRequiredForOrder: (role: UserRole) => {
    return role === "SALES"; // ADMIN can create orders without visits
  },
} as const;

/**
 * Error messages for permission-related errors
 */
export const PERMISSION_ERRORS = {
  UNAUTHORIZED: "Anda tidak memiliki izin untuk mengakses resource ini",
  INSUFFICIENT_ROLE: "Role Anda tidak memiliki izin untuk operasi ini",
  RESOURCE_OWNERSHIP: "Anda hanya bisa mengakses resource milik Anda sendiri",
  ADMIN_REQUIRED: "Operasi ini hanya bisa dilakukan oleh Admin",
  DRAFT_ONLY_EDIT: "Order hanya bisa diedit saat status DRAFT",
  VISIT_REQUIRED: "Kunjungan wajib dibuat sebelum membuat order",
} as const;

/**
 * Hierarchy of user roles
 */
export const ROLE_HIERARCHY = {
  ADMIN: 4,
  MANAGER: 3,
  SALES: 2,
  BASIC: 1,
} as const;

/**
 * Helper function to check if a user role is higher or equal to another role
 */
export function isRoleHigherOrEqual(
  userRole: UserRole,
  compareRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[compareRole];
}
