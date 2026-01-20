import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import type { Order, ApiError } from '@/types/order.types';

/**
 * React Query hook for fetching orders
 * Provides loading, error, and data states with automatic caching
 */
export function useOrders() {
  return useQuery<Order[], ApiError>({
    queryKey: ['orders'],
    queryFn: ordersService.fetchOrders,
  });
}
