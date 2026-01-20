import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import type { CancelOrderResponse, ApiError, Order } from '@/types/order.types';
import { OrderStatus } from '@/types/order.types';

/**
 * React Query mutation hook for cancelling orders
 * Implements optimistic updates for instant UI feedback
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    CancelOrderResponse,
    ApiError,
    { orderId: number; refund: boolean },
    { previousOrders?: Order[] }
  >({
    mutationFn: ({ orderId, refund }) =>
      ordersService.cancelOrder(orderId, refund),
    
    // Optimistic update: update UI immediately before server responds
    onMutate: async ({ orderId }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // Snapshot previous value for rollback on error
      const previousOrders = queryClient.getQueryData<Order[]>(['orders']);

      // Optimistically update order status to cancelled
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(
          ['orders'],
          previousOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: OrderStatus.CANCELLED }
              : order
          )
        );
      }

      return { previousOrders };
    },

    // On error: rollback to previous state
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
    },

    // Always refetch after mutation completes to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
