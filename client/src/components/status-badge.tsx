import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order.types';

interface StatusBadgeProps {
  status: OrderStatus;
}

/**
 * Status badge component with color-coded variants
 * Visual indicator for order status
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<OrderStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string; }> = {
    [OrderStatus.PENDING_PAYMENT]: {
      variant: 'default',
      label: 'Pending Payment',
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50',
    },
    [OrderStatus.CONFIRMED]: {
      variant: 'default',
      label: 'Confirmed',
      color: 'bg-green-50 text-green-700 hover:bg-green-50',
    },
    [OrderStatus.CANCELLED]: {
      variant: 'default',
      label: 'Cancelled',
      color: 'bg-red-50 text-red-700 hover:bg-red-50',
    },
  };

  const config = variants[status];

  return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
}
