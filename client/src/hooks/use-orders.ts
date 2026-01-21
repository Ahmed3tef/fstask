"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/orders.service';
import type { OrderStatus, PaginatedOrdersResponse } from '@/types/order.types';

/**
 * Query hook for fetching paginated orders
 * 
 * @param page - Current page number (1-based)
 * @param status - Optional status filter
 * @returns React Query result with orders data, loading, and error states
 */
export function useOrders(page: number, status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', { page, status }],
    queryFn: () => ordersApi.all({ page, status }),
    // Keep previous data while fetching new page for smooth UX
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Mutation hook for canceling orders
 * Implements optimistic updates for instant UI feedback
 * Automatically rolls back on error and refetches on success
 * 
 * @returns Mutation object with mutate function and loading/error states
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, refund }: { orderId: number; refund: boolean }) =>
      ordersApi.cancel(orderId, refund),
    
    // Optimistic update: Update UI immediately before server response
    onMutate: async ({ orderId }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // Snapshot all current orders queries for potential rollback
      const previousQueries = queryClient.getQueriesData<PaginatedOrdersResponse>({ 
        queryKey: ['orders'] 
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData<PaginatedOrdersResponse>(
        { queryKey: ['orders'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            items: old.items.map((order) =>
              order.id === orderId
                ? { ...order, status: 'CANCELLED' as OrderStatus }
                : order
            ),
          };
        }
      );

      // Return context with snapshot for rollback
      return { previousQueries };
    },

    // On error, rollback to previous state
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        // Restore all queries to their previous state
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
