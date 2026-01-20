import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderResponseDto, CancelOrderResponseDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * Returns all orders with nested customer and store information
   */
  @Get('orders')
  async listOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersService.listOrders();
    // Map entities to DTOs for clean API response
    return orders.map((order) => OrderResponseDto.fromEntity(order));
  }

  /**
   * DELETE /orders/:id
   * Cancels an order with optional refund processing
   * Returns 200 (not 204) because we return the updated order data
   */
  @Delete('orders/:id')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { refund: boolean },
  ): Promise<CancelOrderResponseDto> {
    const order = await this.ordersService.cancelOrder(id, body.refund);

    return {
      success: true,
      message: body.refund
        ? 'Order CANCELLED with refund processed'
        : 'Order CANCELLED successfully',
      order: OrderResponseDto.fromEntity(order),
    };
  }
}
