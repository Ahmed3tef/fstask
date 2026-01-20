import { OrderStatus } from '@/types/order.types';
import { formatStatus, getStatusColor } from '@/lib/formatters';

interface StatusBadgeProps {
  status: OrderStatus;
}

/**
 * Status badge with color-coded pills
 * Accessible with semantic HTML
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}
