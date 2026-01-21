"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatus } from '@/types/order.types';

interface StatusFilterProps {
  value: OrderStatus | 'all';
  onChange: (value: OrderStatus | 'all') => void;
}

/**
 * Status filter dropdown component
 * Allows filtering orders by status
 */
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
        Filter by Status:
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="status-filter" className="w-[200px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value={OrderStatus.PENDING_PAYMENT}>Pending Payment</SelectItem>
          <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
          <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
