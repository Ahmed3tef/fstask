"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatusBadge } from './status-badge';
import { CancelOrderDialog } from './cancel-order-dialog';
import type { Order, OrderStatus } from '@/types/order.types';
import { AlertCircle, XCircle } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  error: any;
}

/**
 * Orders table component
 * Displays paginated orders with cancel functionality
 * Handles loading, error, and empty states
 */
export function OrdersTable({ orders, isLoading, isError, error }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCancelClick = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const canCancel = (status: OrderStatus) => {
    return status === 'PENDING_PAYMENT' || status === 'CONFIRMED';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Orders</AlertTitle>
        <AlertDescription>
          {error?.message || 'Failed to load orders. Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Orders Found</AlertTitle>
        <AlertDescription>
          There are no orders matching your current filters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Store</TableHead>
              <TableHead >Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>{order.store.name}</TableCell>
                <TableCell className=" font-mono">
                  {formatAmount(order.amount_cents)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell>
                  {canCancel(order.status) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className='bg-red-50 text-red-700 border-red-700 hover:bg-red-100 hover:text-red-800 hover:border-red-800'
                      onClick={() => handleCancelClick(order)}
                      aria-label={`Cancel order ${order.id}`}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CancelOrderDialog
        order={selectedOrder}
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
}
