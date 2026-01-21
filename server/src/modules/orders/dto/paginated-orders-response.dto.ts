import { OrderResponseDto } from './order-response.dto';

/**
 * Pagination metadata
 */
export class PaginationMetaDto {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated response for GET /orders
 * Contains items array and pagination metadata
 */
export class PaginatedOrdersResponseDto {
  items: OrderResponseDto[];
  meta: PaginationMetaDto;
}
