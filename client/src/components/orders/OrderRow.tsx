'use client';

import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { OrderStatus, type Order } from '@/types/order.types';

interface OrderRowProps {
  order: Order;
  onCancel: (order: Order) => void;
  index: number;
}

/**
 * Individual order row component
 * Animated entrance with Framer Motion
 */
export function OrderRow({ order, onCancel, index }: OrderRowProps) {
  const canCancel =
    order.status === OrderStatus.PENDING_PAYMENT ||
    order.status === OrderStatus.CONFIRMED;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05, // Stagger animation
        ease: 'easeOut',
      }}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{order.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.customer.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.store.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {formatCurrency(order.amount_cents)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDateTime(order.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {canCancel ? (
          <Button
            variant="danger"
            onClick={() => onCancel(order)}
            className="text-sm px-3 py-1"
          >
            Cancel Order
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">No actions</span>
        )}
      </td>
    </motion.tr>
  );
}
