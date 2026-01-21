import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@/database/entities/order-status.enum';

/**
 * DTO for validating GET /orders query parameters
 * Supports pagination and status filtering
 */
export class ListOrdersQueryDto {
  /**
   * Page number (1-based)
   * Defaults to 1 if not provided
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be greater than or equal to 1' })
  page?: number = 1;

  /**
   * Filter by order status
   * Must be a valid OrderStatus enum value
   */
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'status must be a valid OrderStatus' })
  status?: OrderStatus;
}
