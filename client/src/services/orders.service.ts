import { apiClient } from '@/lib/api-client';
import type {
  Order,
  CancelOrderRequest,
  CancelOrderResponse,
} from '@/types/order.types';

/**
 * Orders API service
 * Encapsulates all order-related HTTP requests
 */
export const ordersService = {
  /**
   * Fetches all orders with customer and store information
   * GET /orders
   */
  async fetchOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  /**
   * Cancels an order with optional refund
   * DELETE /orders/:id
   * 
   * @param orderId - The order ID to cancel
   * @param refund - Whether to process a refund
   */
  async cancelOrder(
    orderId: number,
    refund: boolean,
  ): Promise<CancelOrderResponse> {
    const response = await apiClient.delete<CancelOrderResponse>(
      `/orders/${orderId}`,
      {
        data: { refund } satisfies CancelOrderRequest,
      },
    );
    return response.data;
  },
};
