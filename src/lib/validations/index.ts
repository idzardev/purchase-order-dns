/**
 * Main export file for validation schemas
 * Centralizes all validation schemas for easy imports throughout the application
 */

// Common validation schemas and utilities
export * from "./schemas/common";
export * from "./schemas/enums";

// User-related schemas and types
import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UpdateUserRoleFormSchema,
  UserManagementFormSchema,
  type User,
  type CreateUser,
  type UpdateUser,
  type UpdateUserRoleForm,
  type UserManagementForm,
} from "./schemas/user";

// Product-related schemas and types
import {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  PriceListSchema,
  CreatePriceListSchema,
  UpdatePriceListSchema,
  ProductFormSchema,
  ProductFormSchemaWithHierarchy,
  validatePriceHierarchy,
  searchParamsSchema,
  historyParamsSchema,
  type Product,
  type CreateProduct,
  type UpdateProduct,
  type PriceList,
  type CreatePriceList,
  type UpdatePriceList,
  type ProductForm,
  type SearchParams,
  type HistoryParams,
} from "./schemas/product";

// Store-related schemas and types
import {
  StoreSchema,
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreFormSchema,
  StoreUniquenessSchema,
  StoreFilterSchema,
  type Store,
  type CreateStore,
  type UpdateStore,
  type StoreForm,
  type StoreUniqueness,
  type StoreFilter,
} from "./schemas/store";

// Visit-related schemas and types
import {
  VisitSchema,
  CreateVisitSchema,
  UpdateVisitSchema,
  VisitFormSchema,
  VisitFilterSchema,
  VisitWithOrderSchema,
  VisitStatsSchema,
  calculateVisitDuration,
  type Visit,
  type CreateVisit,
  type UpdateVisit,
  type VisitForm,
  type VisitFilter,
  type VisitWithOrder,
  type VisitStats,
} from "./schemas/visit";

// Order-related schemas and types
import {
  OrderSchema,
  OrderItemSchema,
  CreateOrderSchema,
  CreateOrderItemSchema,
  UpdateOrderSchema,
  UpdateOrderItemSchema,
  UpdateOrderStatusSchema,
  OrderFormSchema,
  OrderFilterSchema,
  GeneratePurchaseOrderSchema,
  StatusHistoryEntrySchema,
  generateOrderNumber,
  validateStatusTransition,
  statusTransitionMap,
  type Order,
  type OrderItem,
  type CreateOrder,
  type CreateOrderItem,
  type UpdateOrder,
  type UpdateOrderItem,
  type UpdateOrderStatus,
  type OrderForm,
  type OrderFilter,
  type GeneratePurchaseOrder,
  type StatusHistoryEntry,
} from "./schemas/order";

// Re-export all schemas and types
export {
  // User schemas
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UpdateUserRoleFormSchema,
  UserManagementFormSchema,

  // Product schemas
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  PriceListSchema,
  CreatePriceListSchema,
  UpdatePriceListSchema,
  ProductFormSchema,
  ProductFormSchemaWithHierarchy,
  validatePriceHierarchy,
  searchParamsSchema,
  historyParamsSchema,

  // Store schemas
  StoreSchema,
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreFormSchema,
  StoreUniquenessSchema,
  StoreFilterSchema,

  // Visit schemas
  VisitSchema,
  CreateVisitSchema,
  UpdateVisitSchema,
  VisitFormSchema,
  VisitFilterSchema,
  VisitWithOrderSchema,
  VisitStatsSchema,
  calculateVisitDuration,

  // Order schemas
  OrderSchema,
  OrderItemSchema,
  CreateOrderSchema,
  CreateOrderItemSchema,
  UpdateOrderSchema,
  UpdateOrderItemSchema,
  UpdateOrderStatusSchema,
  OrderFormSchema,
  OrderFilterSchema,
  GeneratePurchaseOrderSchema,
  StatusHistoryEntrySchema,
  generateOrderNumber,
  validateStatusTransition,
  statusTransitionMap,

  // User types
  type User,
  type CreateUser,
  type UpdateUser,
  type UpdateUserRoleForm,
  type UserManagementForm,

  // Product types
  type Product,
  type CreateProduct,
  type UpdateProduct,
  type PriceList,
  type CreatePriceList,
  type UpdatePriceList,
  type ProductForm,
  type SearchParams,
  type HistoryParams,

  // Store types
  type Store,
  type CreateStore,
  type UpdateStore,
  type StoreForm,
  type StoreUniqueness,
  type StoreFilter,

  // Visit types
  type Visit,
  type CreateVisit,
  type UpdateVisit,
  type VisitForm,
  type VisitFilter,
  type VisitWithOrder,
  type VisitStats,

  // Order types
  type Order,
  type OrderItem,
  type CreateOrder,
  type CreateOrderItem,
  type UpdateOrder,
  type UpdateOrderItem,
  type UpdateOrderStatus,
  type OrderForm,
  type OrderFilter,
  type GeneratePurchaseOrder,
  type StatusHistoryEntry,
};

/**
 * Grouped validation schemas for domain-oriented imports
 * Allows for more organized and contextual imports
 */
export const ValidationSchemas = {
  User: {
    Schema: UserSchema,
    Create: CreateUserSchema,
    Update: UpdateUserSchema,
    Forms: {
      UpdateRole: UpdateUserRoleFormSchema,
      Management: UserManagementFormSchema,
    },
  },
  Product: {
    Schema: ProductSchema,
    Create: CreateProductSchema,
    Update: UpdateProductSchema,
    Form: {
      Basic: ProductFormSchema,
      WithHierarchy: ProductFormSchemaWithHierarchy,
    },
    Helpers: {
      validatePriceHierarchy,
    },
    Params: {
      search: searchParamsSchema,
      history: historyParamsSchema,
    },
  },
  PriceList: {
    Schema: PriceListSchema,
    Create: CreatePriceListSchema,
    Update: UpdatePriceListSchema,
  },
  Store: {
    Schema: StoreSchema,
    Create: CreateStoreSchema,
    Update: UpdateStoreSchema,
    Form: StoreFormSchema,
    Uniqueness: StoreUniquenessSchema,
    Filter: StoreFilterSchema,
  },
  Visit: {
    Schema: VisitSchema,
    Create: CreateVisitSchema,
    Update: UpdateVisitSchema,
    Form: VisitFormSchema,
    Filter: VisitFilterSchema,
    WithOrder: VisitWithOrderSchema,
    Stats: VisitStatsSchema,
    Helpers: {
      calculateVisitDuration,
    },
  },
  Order: {
    Schema: OrderSchema,
    Create: CreateOrderSchema,
    Update: UpdateOrderSchema,
    UpdateStatus: UpdateOrderStatusSchema,
    Item: {
      Schema: OrderItemSchema,
      Create: CreateOrderItemSchema,
      Update: UpdateOrderItemSchema,
    },
    Form: OrderFormSchema,
    Filter: OrderFilterSchema,
    GeneratePO: GeneratePurchaseOrderSchema,
    StatusHistory: StatusHistoryEntrySchema,
    Helpers: {
      generateOrderNumber,
      validateStatusTransition,
      statusTransitionMap,
    },
  },
};

// Default export for convenience
export default ValidationSchemas;
