import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  OrderResponseDto,
  CancelOrderResponseDto,
  CancelOrderDto,
  ListOrdersQueryDto,
  PaginatedOrdersResponseDto,
} from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * Returns paginated orders with nested customer and store information
   * Supports pagination via page query parameter and filtering by status
   */
  @Get('orders')
  async listOrders(
    @Query() query: ListOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.listOrders(query);
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
    @Body() body: CancelOrderDto,
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
