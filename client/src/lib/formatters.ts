import { OrderStatus } from '@/types/order.types';

/**
 * Formats cents to currency string
 * @example formatCurrency(5000) => "$50.00"
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

/**
 * Formats ISO date string to user-friendly format
 * @example formatDate("2024-01-01T12:00:00Z") => "Jan 1, 2024"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Formats ISO date string to include time
 * @example formatDateTime("2024-01-01T12:00:00Z") => "Jan 1, 2024, 12:00 PM"
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Converts OrderStatus enum to human-readable text
 */
export function formatStatus(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'Pending Payment';
    case OrderStatus.CONFIRMED:
      return 'Confirmed';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Gets appropriate CSS classes for status badge
 */
export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case OrderStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
