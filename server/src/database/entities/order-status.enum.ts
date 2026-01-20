/**
 * Order status enum for type-safe status handling
 * Centralizes all possible order statuses in the system
 */
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

/**
 * Statuses that allow order cancellation
 * Only PENDING_PAYMENT and CONFIRMED orders can be cancelled
 */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.CONFIRMED,
];
