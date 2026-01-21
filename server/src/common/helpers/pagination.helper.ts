import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Pagination configuration options
 */
export interface PaginationConfig {
  page?: number;
  limit?: number;
}

/**
 * Pagination helper class
 * Encapsulates pagination logic for reuse across services
 */
export class PaginationHelper {
  static readonly DEFAULT_LIMIT = 10;
  static readonly MIN_LIMIT = 1;
  static readonly MAX_LIMIT = 100;
  static readonly MIN_PAGE = 1;

  /**
   * Calculate pagination metadata
   * 
   * @param page - Current page number (1-based)
   * @param limit - Items per page
   * @param totalItems - Total number of items
   * @returns Pagination metadata
   */
  static calculateMeta(
    page: number,
    limit: number,
    totalItems: number,
  ): PaginationMeta {
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1;
    
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: totalItems > 0 && page < totalPages,
      hasPrevPage: totalItems > 0 && page > 1,
    };
  }

  /**
   * Calculate skip/offset for pagination
   * 
   * @param page - Current page number (1-based)
   * @param limit - Items per page
   * @returns Number of items to skip
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Validate and sanitize pagination parameters
   * 
   * @param page - Requested page number
   * @param limit - Requested items per page
   * @returns Validated pagination parameters
   */
  private static validateParams(
    page?: number,
    limit?: number,
  ): { page: number; limit: number } {
    const validPage = Math.max(PaginationHelper.MIN_PAGE, page ?? 1);
    const validLimit = Math.min(
      Math.max(PaginationHelper.MIN_LIMIT, limit ?? PaginationHelper.DEFAULT_LIMIT),
      PaginationHelper.MAX_LIMIT,
    );

    return { page: validPage, limit: validLimit };
  }

  /**
   * Paginate a TypeORM repository query
   * Generic helper that works with any entity
   * 
   * @param repository - TypeORM repository
   * @param options - Find options (where, relations, order, etc.)
   * @param config - Pagination configuration (page and limit)
   * @returns Paginated result with items and metadata
   * 
   * @example
   * ```typescript
   * const result = await PaginationHelper.paginate(
   *   ordersRepository,
   *   {
   *     where: { status: 'CONFIRMED' },
   *     relations: ['customer', 'store'],
   *     order: { created_at: 'DESC' },
   *   },
   *   { page: 1, limit: 10 }
   * );
   * ```
   */
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: Omit<FindManyOptions<T>, 'skip' | 'take'>,
    config: PaginationConfig = {},
  ): Promise<PaginatedResult<T>> {
    const { page, limit } = PaginationHelper.validateParams(
      config.page,
      config.limit,
    );

    const skip = PaginationHelper.calculateSkip(page, limit);

    const [items, totalItems] = await repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    const meta = PaginationHelper.calculateMeta(page, limit, totalItems);

    return { items, meta };
  }
}
