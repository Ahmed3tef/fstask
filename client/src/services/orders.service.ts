import { apiClient } from '@/lib/api-client';
import type {
  CancelOrderRequest,
  CancelOrderResponse,
  PaginatedOrdersResponse,
  OrdersQueryParams,
} from '@/types/order.types';

/**
 * Orders API Service
 * All order-related API calls
 */

const BASE_URL = '/orders';

/**
 * Get paginated orders with optional filtering
 * GET /orders?page=X&status=Y
 */
async function all(params: OrdersQueryParams) {
  return apiClient.get<PaginatedOrdersResponse>(BASE_URL, {
    params: {
      page: params.page,
      ...(params.status && { status: params.status }),
    },
  }).then(res => res.data);
}

/**
 * Cancel an order with optional refund
 * DELETE /orders/:id
 */
async function cancel(id: number, refund: boolean) {
  return apiClient.delete<CancelOrderResponse>(`${BASE_URL}/${id}`, {
    data: { refund } satisfies CancelOrderRequest,
  }).then(res => res.data);
}

export const ordersApi = {
  all,
  cancel,
};

export default ordersApi;
