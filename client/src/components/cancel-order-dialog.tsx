"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCancelOrder } from '@/hooks/use-orders';
import type { Order } from '@/types/order.types';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from './ui/separator';

interface CancelOrderDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Cancel order dialog component
 * Provides options to cancel with or without refund
 * Displays loading and error states
 * Shows success toast notification on successful cancellation
 */
export function CancelOrderDialog({
  order,
  open,
  onClose,
}: CancelOrderDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const cancelMutation = useCancelOrder();

  const handleCancel = async (refund: boolean) => {
    if (!order) return;

    setError(null);
    try {
      await cancelMutation.mutateAsync({ orderId: order.id, refund });

      // Show success toast notification
      toast.success('Order cancelled successfully', {
        description: refund
          ? `Order #${order.id} cancelled with refund processed`
          : `Order #${order.id} cancelled without refund`,
        duration: 3000,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');

      // Show error toast as well for better visibility
      toast.error('Failed to cancel order', {
        description: err.message || 'An unexpected error occurred',
        duration: 4000,
      });
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!order) return null;

  const amountFormatted = `$${(order.amount_cents / 100).toFixed(2)}`;

  return (
    <Dialog open={open} onOpenChange={handleClose} >
      <DialogContent className="sm:max-w-lg" >
        <DialogHeader>
          <DialogTitle>Cancel Order #{order.id}</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order?
          </DialogDescription>
        </DialogHeader>

        <Separator />
        <div className="py-2 mb-2">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{order.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Store:</span>
              <span className="font-medium">{order.store.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{amountFormatted}</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="!justify-center flex-col sm:flex-row flex w-full">

          <Button
            variant="secondary"
            onClick={() => handleCancel(false)}
            disabled={cancelMutation.isPending}
          >
            Cancel Without Refund
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleCancel(true)}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Processing...' : 'Cancel With Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
