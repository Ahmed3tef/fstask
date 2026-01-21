// TypeScript types matching backend DTOs
// Ensures type safety across frontend-backend boundary

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface Customer {
  id: number;
  name: string;
}

export interface Store {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  amount_cents: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  customer: Customer;
  store: Store;
}

export interface CancelOrderRequest {
  refund: boolean;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedOrdersResponse {
  items: Order[];
  meta: PaginationMeta;
}

export interface OrdersQueryParams {
  page: number;
  status?: OrderStatus;
}
