'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCancelOrder } from '@/hooks/orders/useCancelOrder';
import { formatCurrency } from '@/lib/formatters';
import type { Order } from '@/types/order.types';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: (cancelled?: boolean) => void;
  order: Order | null;
}

/**
 * Cancel order modal with refund options
 * Handles success/error states and displays inline error messages
 */
export function CancelOrderModal({
  isOpen,
  onClose,
  order,
}: CancelOrderModalProps) {
  const [error, setError] = useState<string | null>(null);
  const cancelMutation = useCancelOrder();

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleCancel = async (refund: boolean) => {
    if (!order) return;

    setError(null);

    try {
      await cancelMutation.mutateAsync({
        orderId: order.id,
        refund,
      });
      onClose(true);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    }
  };

  const handleClose = () => {
    // Prevent closing while mutation is in progress
    if (!cancelMutation.isPending) {
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Order"
    >
      <div className="space-y-4">
        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium text-gray-900">#{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium text-gray-900">
              {order.customer.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Store:</span>
            <span className="font-medium text-gray-900">{order.store.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(order.amount_cents)}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-2">Choose a cancellation option:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>
              <strong>With Refund:</strong> Deducts {formatCurrency(order.amount_cents)} from
              store balance
            </li>
            <li>
              <strong>Without Refund:</strong> Cancels order without affecting customer and store balance
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
            role="alert"
          >
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="danger"
            onClick={() => handleCancel(true)}
            isLoading={cancelMutation.isPending}
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            Cancel with Refund
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCancel(false)}
            isLoading={cancelMutation.isPending}
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            Cancel without Refund
          </Button>
        </div>
      </div>
    </Modal>
  );
}