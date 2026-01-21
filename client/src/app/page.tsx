"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/use-orders';
import { OrdersTable } from '@/components/orders-table';
import { StatusFilter } from '@/components/status-filter';
import { PaginationControls } from '@/components/pagination-controls';
import { OrderStatus } from '@/types/order.types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get page and status from URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const statusParam = searchParams.get('status') as OrderStatus | null;
  const status = statusParam && Object.values(OrderStatus).includes(statusParam)
    ? statusParam
    : undefined;

  // Fetch orders with current filters
  const { data, isLoading, isError, error, refetch, isFetching } = useOrders(page, status);

  // Update URL when filters change
  const updateURL = (newPage: number, newStatus?: OrderStatus | 'all') => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (newStatus && newStatus !== 'all') {
      params.set('status', newStatus);
    }
    router.push(`/?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, status || 'all');
  };

  const handleStatusChange = (newStatus: OrderStatus | 'all') => {
    // Reset to page 1 when changing filter
    updateURL(1, newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track your orders
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusFilter
                value={status || 'all'}
                onChange={handleStatusChange}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refetch orders"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing…' : 'Refetch'}
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <OrdersTable
              orders={data?.items || []}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />

            {/* Pagination */}
            {data && data.items.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <PaginationControls
                  currentPage={data.meta.page}
                  totalPages={data.meta.totalPages}
                  hasNextPage={data.meta.hasNextPage}
                  hasPrevPage={data.meta.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Stats Footer */}
          {data && (
            <div className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {data.items.length} of {data.meta.totalItems} orders
                </span>
                <span>
                  {data.items.length} items per page
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
