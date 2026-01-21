import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@/database/entities/order-status.enum';
import { PaginatedOrdersResponseDto, ListOrdersQueryDto } from './dto';
import { OrderEntity } from '@/database/entities/order.entity';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

  // Mock orders data for testing
  const mockOrders = [
    {
      id: 1,
      amount_cents: 5000,
      status: OrderStatus.CONFIRMED,
      created_at: new Date('2026-01-20T10:00:00Z'),
      updated_at: new Date('2026-01-20T10:00:00Z'),
      customer: { id: 1, name: 'John Doe' },
      store: { id: 1, name: 'Store A' },
    },
    {
      id: 2,
      amount_cents: 3000,
      status: OrderStatus.PENDING_PAYMENT,
      created_at: new Date('2026-01-19T10:00:00Z'),
      updated_at: new Date('2026-01-19T10:00:00Z'),
      customer: { id: 2, name: 'Jane Smith' },
      store: { id: 2, name: 'Store B' },
    },
    {
      id: 3,
      amount_cents: 7500,
      status: OrderStatus.CANCELLED,
      created_at: new Date('2026-01-18T10:00:00Z'),
      updated_at: new Date('2026-01-18T10:00:00Z'),
      customer: { id: 3, name: 'Bob Johnson' },
      store: { id: 1, name: 'Store A' },
    },
    {
      id: 4,
      amount_cents: 4200,
      status: OrderStatus.CONFIRMED,
      created_at: new Date('2026-01-17T10:00:00Z'),
      updated_at: new Date('2026-01-17T10:00:00Z'),
      customer: { id: 1, name: 'John Doe' },
      store: { id: 3, name: 'Store C' },
    },
    {
      id: 5,
      amount_cents: 9900,
      status: OrderStatus.PENDING_PAYMENT,
      created_at: new Date('2026-01-16T10:00:00Z'),
      updated_at: new Date('2026-01-16T10:00:00Z'),
      customer: { id: 4, name: 'Alice Williams' },
      store: { id: 2, name: 'Store B' },
    },
    {
      id: 6,
      amount_cents: 6100,
      status: OrderStatus.CONFIRMED,
      created_at: new Date('2026-01-15T10:00:00Z'),
      updated_at: new Date('2026-01-15T10:00:00Z'),
      customer: { id: 2, name: 'Jane Smith' },
      store: { id: 1, name: 'Store A' },
    },
    {
      id: 7,
      amount_cents: 2500,
      status: OrderStatus.CANCELLED,
      created_at: new Date('2026-01-14T10:00:00Z'),
      updated_at: new Date('2026-01-14T10:00:00Z'),
      customer: { id: 3, name: 'Bob Johnson' },
      store: { id: 2, name: 'Store B' },
    },
    {
      id: 8,
      amount_cents: 8300,
      status: OrderStatus.PENDING_PAYMENT,
      created_at: new Date('2026-01-13T10:00:00Z'),
      updated_at: new Date('2026-01-13T10:00:00Z'),
      customer: { id: 5, name: 'Charlie Brown' },
      store: { id: 3, name: 'Store C' },
    },
    {
      id: 9,
      amount_cents: 5500,
      status: OrderStatus.CONFIRMED,
      created_at: new Date('2026-01-12T10:00:00Z'),
      updated_at: new Date('2026-01-12T10:00:00Z'),
      customer: { id: 1, name: 'John Doe' },
      store: { id: 1, name: 'Store A' },
    },
    {
      id: 10,
      amount_cents: 7200,
      status: OrderStatus.PENDING_PAYMENT,
      created_at: new Date('2026-01-11T10:00:00Z'),
      updated_at: new Date('2026-01-11T10:00:00Z'),
      customer: { id: 2, name: 'Jane Smith' },
      store: { id: 2, name: 'Store B' },
    },
    {
      id: 11,
      amount_cents: 3800,
      status: OrderStatus.CONFIRMED,
      created_at: new Date('2026-01-10T10:00:00Z'),
      updated_at: new Date('2026-01-10T10:00:00Z'),
      customer: { id: 4, name: 'Alice Williams' },
      store: { id: 3, name: 'Store C' },
    },
    {
      id: 12,
      amount_cents: 6700,
      status: OrderStatus.CANCELLED,
      created_at: new Date('2026-01-09T10:00:00Z'),
      updated_at: new Date('2026-01-09T10:00:00Z'),
      customer: { id: 5, name: 'Charlie Brown' },
      store: { id: 1, name: 'Store A' },
    },
    {
      id: 13,
      amount_cents: 4900,
      status: OrderStatus.PENDING_PAYMENT,
      created_at: new Date('2026-01-08T10:00:00Z'),
      updated_at: new Date('2026-01-08T10:00:00Z'),
      customer: { id: 3, name: 'Bob Johnson' },
      store: { id: 2, name: 'Store B' },
    },
    {
      id: 14,
      amount_cents: 8100,
      status: OrderStatus.CONFIRMED,
      created_at: new Date('2026-01-07T10:00:00Z'),
      updated_at: new Date('2026-01-07T10:00:00Z'),
      customer: { id: 1, name: 'John Doe' },
      store: { id: 3, name: 'Store C' },
    },
    {
      id: 15,
      amount_cents: 5300,
      status: OrderStatus.PENDING_PAYMENT,
      created_at: new Date('2026-01-06T10:00:00Z'),
      updated_at: new Date('2026-01-06T10:00:00Z'),
      customer: { id: 2, name: 'Jane Smith' },
      store: { id: 1, name: 'Store A' },
    },
  ];

  beforeEach(async () => {
    const mockOrdersService = {
      listOrders: jest.fn(),
      cancelOrder: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    ordersController = app.get<OrdersController>(OrdersController);
    ordersService = app.get<OrdersService>(OrdersService);
  });

  describe('listOrders', () => {
    it('should return paginated orders with default pagination (page 1, limit 10)', async () => {
      const query: ListOrdersQueryDto = { page: 1 };
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: mockOrders.slice(0, 10).map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 1,
          limit: 10,
          totalItems: 15,
          totalPages: 2,
          hasNextPage: true,
          hasPrevPage: false,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result).toEqual(expectedResponse);
      expect(result.items).toHaveLength(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPrevPage).toBe(false);
    });

    it('should return second page of results', async () => {
      const query: ListOrdersQueryDto = { page: 2 };
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: mockOrders.slice(10, 15).map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 2,
          limit: 10,
          totalItems: 15,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.items).toHaveLength(5);
      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(true);
    });

    it('should filter orders by CONFIRMED status', async () => {
      const query: ListOrdersQueryDto = { page: 1, status: OrderStatus.CONFIRMED };
      const confirmedOrders = mockOrders.filter(
        (o) => o.status === OrderStatus.CONFIRMED,
      );
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: confirmedOrders.map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 1,
          limit: 10,
          totalItems: 6,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.items.every((o) => o.status === OrderStatus.CONFIRMED)).toBe(true);
      expect(result.meta.totalItems).toBe(6);
    });

    it('should filter orders by PENDING_PAYMENT status', async () => {
      const query: ListOrdersQueryDto = { page: 1, status: OrderStatus.PENDING_PAYMENT };
      const pendingOrders = mockOrders.filter(
        (o) => o.status === OrderStatus.PENDING_PAYMENT,
      );
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: pendingOrders.map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 1,
          limit: 10,
          totalItems: 6,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.items.every((o) => o.status === OrderStatus.PENDING_PAYMENT)).toBe(
        true,
      );
      expect(result.meta.totalItems).toBe(6);
    });

    it('should filter orders by CANCELLED status', async () => {
      const query: ListOrdersQueryDto = { page: 1, status: OrderStatus.CANCELLED };
      const cancelledOrders = mockOrders.filter(
        (o) => o.status === OrderStatus.CANCELLED,
      );
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: cancelledOrders.map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 1,
          limit: 10,
          totalItems: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.items.every((o) => o.status === OrderStatus.CANCELLED)).toBe(true);
      expect(result.meta.totalItems).toBe(3);
    });

    it('should handle empty results correctly', async () => {
      const query: ListOrdersQueryDto = { page: 10 };
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: [],
        meta: {
          page: 10,
          limit: 10,
          totalItems: 15,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalItems).toBe(15);
    });

    it('should handle single page results correctly', async () => {
      const query: ListOrdersQueryDto = { page: 1 };
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: mockOrders.slice(0, 5).map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 1,
          limit: 10,
          totalItems: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(false);
    });

    it('should combine pagination and status filtering', async () => {
      const query: ListOrdersQueryDto = { page: 1, status: OrderStatus.CONFIRMED };
      const confirmedOrders = mockOrders.filter(
        (o) => o.status === OrderStatus.CONFIRMED,
      );
      const expectedResponse: PaginatedOrdersResponseDto = {
        items: confirmedOrders.slice(0, 10).map((o) => ({
          id: o.id,
          amount_cents: o.amount_cents,
          status: o.status,
          created_at: o.created_at,
          updated_at: o.updated_at,
          customer: o.customer,
          store: o.store,
        })),
        meta: {
          page: 1,
          limit: 10,
          totalItems: 6,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      jest.spyOn(ordersService, 'listOrders').mockResolvedValue(expectedResponse);

      const result = await ordersController.listOrders(query);

      expect(result.items.every((o) => o.status === OrderStatus.CONFIRMED)).toBe(true);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('cancelOrder', () => {
    const mockCancelledOrder: Partial<OrderEntity> = {
      id: 1,
      amount_cents: 5000,
      status: OrderStatus.CANCELLED,
      created_at: new Date('2026-01-20T10:00:00Z'),
      updated_at: new Date('2026-01-21T10:00:00Z'),
      customer: { id: 1, name: 'John Doe' },
      store: { id: 1, name: 'Store A', balance_cents: 100000 },
      store_id: 1,
      customer_id: 1,
    };

    it('should cancel order without refund', async () => {
      const cancelOrderSpy = jest.spyOn(ordersService, 'cancelOrder').mockResolvedValue(mockCancelledOrder as OrderEntity);

      const result = await ordersController.cancelOrder('1', { refund: false });

      expect(cancelOrderSpy).toHaveBeenCalledWith('1', false);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order CANCELLED successfully');
      expect(result.order.id).toBe(1);
      expect(result.order.status).toBe(OrderStatus.CANCELLED);
      expect(result.order.amount_cents).toBe(5000);
    });

    it('should cancel order with refund', async () => {
      const cancelOrderSpy = jest.spyOn(ordersService, 'cancelOrder').mockResolvedValue(mockCancelledOrder as OrderEntity);

      const result = await ordersController.cancelOrder('1', { refund: true });

      expect(cancelOrderSpy).toHaveBeenCalledWith('1', true);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order CANCELLED with refund processed');
      expect(result.order.id).toBe(1);
      expect(result.order.status).toBe(OrderStatus.CANCELLED);
    });

    it('should return order with nested customer and store data', async () => {
      jest.spyOn(ordersService, 'cancelOrder').mockResolvedValue(mockCancelledOrder as OrderEntity);

      const result = await ordersController.cancelOrder('1', { refund: false });

      expect(result.order.customer).toEqual({
        id: 1,
        name: 'John Doe',
      });
      expect(result.order.store).toEqual({
        id: 1,
        name: 'Store A',
      });
    });

    it('should handle service errors - order not found', async () => {
      jest.spyOn(ordersService, 'cancelOrder').mockRejectedValue(
        new Error('Order with ID 999 not found')
      );

      await expect(
        ordersController.cancelOrder('999', { refund: false })
      ).rejects.toThrow('Order with ID 999 not found');
    });

    it('should handle service errors - insufficient balance', async () => {
      jest.spyOn(ordersService, 'cancelOrder').mockRejectedValue(
        new Error('Insufficient balance')
      );

      await expect(
        ordersController.cancelOrder('1', { refund: true })
      ).rejects.toThrow('Insufficient balance');
    });

    it('should handle service errors - already cancelled', async () => {
      jest.spyOn(ordersService, 'cancelOrder').mockRejectedValue(
        new Error('Order is already CANCELLED')
      );

      await expect(
        ordersController.cancelOrder('1', { refund: false })
      ).rejects.toThrow('Order is already CANCELLED');
    });

    it('should handle service errors - invalid status', async () => {
      jest.spyOn(ordersService, 'cancelOrder').mockRejectedValue(
        new Error('Order with status \'CANCELLED\' cannot be cancelled')
      );

      await expect(
        ordersController.cancelOrder('3', { refund: false })
      ).rejects.toThrow('Order with status \'CANCELLED\' cannot be cancelled');
    });
  });
});
