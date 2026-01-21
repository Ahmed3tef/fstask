import { OrderStatus } from '@/database/entities/order-status.enum';
import { OrderEntity } from '@/database/entities/order.entity';

// DTOs for clean API responses with nested relations
// These decouple our internal entities from external API contracts

export class CustomerResponseDto {
  id: number;
  name: string;
}

export class StoreResponseDto {
  id: number;
  name: string;
  // Note: balance_cents is intentionally excluded from public API responses
  // for security/privacy reasons unless specifically needed
}

export class OrderResponseDto {
  id: number;
  amount_cents: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  customer: CustomerResponseDto;
  store: StoreResponseDto;

  /**
   * Maps OrderEntity to OrderResponseDto
   * Ensures consistent response shape and hides internal fields
   */
  static fromEntity(order: OrderEntity): OrderResponseDto {
    return {
      id: order.id,
      amount_cents: order.amount_cents,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
      },
      store: {
        id: order.store.id,
        name: order.store.name,
      },
    };
  }
}
