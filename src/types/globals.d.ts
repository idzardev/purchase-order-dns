/**
 * Type definitions for global scope
 * Used for better maintainability and type checking
 */
export {};

/**
 * User roles
 */
export type UserRole = "ADMIN" | "MANAGER" | "SALES" | "BASIC";

/**
 * Custom JWT session claims
 */
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}
