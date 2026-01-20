import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '@/database/entities/order.entity';
import { StoreEntity } from '@/database/entities/store.entity';
import { OrderStatus, CANCELLABLE_STATUSES } from '@/database/entities/order-status.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private ordersRepository: Repository<OrderEntity>,
    @InjectRepository(StoreEntity)
    private storesRepository: Repository<StoreEntity>,
    private dataSource: DataSource,
  ) {}

  /**
   * Fetches all orders with customer and store relations
   * Returns orders with nested customer and store objects
   */
  async listOrders(): Promise<OrderEntity[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'store'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Cancels an order with optional refund processing
   * 
   * Business Rules:
   * 1. Order must exist
   * 2. Order must be in 'PENDING_PAYMENT' or 'CONFIRMED' status
   * 3. Cannot cancel an already CANCELLED order
   * 4. If refund=true: store must have sufficient balance
   * 5. Balance deduction and order update happen atomically
   * 
   * @param id - Order ID to cancel
   * @param refund - Whether to process a refund (deduct from store balance)
   * @returns Updated order with relations
   */
  async cancelOrder(id: string, refund: boolean): Promise<OrderEntity> {
    // Parse and validate ID
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    // Fetch order with store relation (needed for balance check)
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'store'],
    });

    // Validation: Order must exist
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validation: Order must not already be CANCELLED
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already CANCELLED');
    }

    // Validation: Only cancellable statuses (PENDING_PAYMENT/CONFIRMED) are allowed
    // This is extensible - if we add new statuses, just update CANCELLABLE_STATUSES
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Order with status '${order.status}' cannot be cancelled`,
      );
    }

    // If refund is requested, validate store balance and process refund
    if (refund) {
      // Check if store has sufficient balance for refund
      if (order.store.balance_cents < order.amount_cents) {
        throw new BadRequestException('Insufficient balance');
      }

      // Use transaction to ensure atomicity
      // Both balance deduction and order cancellation must succeed together
      await this.dataSource.transaction(async (manager) => {
        // Deduct refund amount from store balance
        await manager.update(
          StoreEntity,
          { id: order.store_id },
          {
            balance_cents: () => `balance_cents - ${order.amount_cents}`,
          },
        );

        // Update order status to cancelled
        await manager.update(
          OrderEntity,
          { id: orderId },
          {
            status: OrderStatus.CANCELLED,
            updated_at: new Date(),
          },
        );
      });
    } else {
      // No refund - just cancel the order without balance check
      await this.ordersRepository.update(
        { id: orderId },
        {
          status: OrderStatus.CANCELLED,
          updated_at: new Date(),
        },
      );
    }

    // Fetch and return the updated order with fresh relations
    const updatedOrder = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'store'],
    });

    return updatedOrder!;
  }
}
