import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@/database/entities/order-status.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  // Mock service methods
  const mockOrdersService = {
    listOrders: jest.fn(),
    cancelOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listOrders', () => {
    it('should return mapped DTOs from service', async () => {
      const mockOrders = [
        {
          id: 1,
          amount_cents: 5000,
          status: OrderStatus.CONFIRMED,
          created_at: new Date(),
          updated_at: new Date(),
          customer: { id: 1, name: 'John Doe' },
          store: { id: 1, name: 'Store A', balance_cents: 100000 },
        },
      ];

      mockOrdersService.listOrders.mockResolvedValue(mockOrders);

      const result = await controller.listOrders();

      expect(service.listOrders).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('customer');
      expect(result[0]).toHaveProperty('store');
      // Verify balance is not exposed in response
      expect(result[0].store).not.toHaveProperty('balance_cents');
    });
  });

  describe('cancelOrder', () => {
    it('should delegate to service and return success response', async () => {
      const mockOrder = {
        id: 1,
        amount_cents: 5000,
        status: OrderStatus.CANCELLED,
        created_at: new Date(),
        updated_at: new Date(),
        customer: { id: 1, name: 'John Doe' },
        store: { id: 1, name: 'Store A', balance_cents: 95000 },
      };

      mockOrdersService.cancelOrder.mockResolvedValue(mockOrder);

      const result = await controller.cancelOrder('1', { refund: true });

      expect(service.cancelOrder).toHaveBeenCalledWith('1', true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('refund processed');
      expect(result.order.status).toBe(OrderStatus.CANCELLED);
    });

    it('should return appropriate message for cancel without refund', async () => {
      const mockOrder = {
        id: 1,
        amount_cents: 5000,
        status: OrderStatus.CANCELLED,
        created_at: new Date(),
        updated_at: new Date(),
        customer: { id: 1, name: 'John Doe' },
        store: { id: 1, name: 'Store A', balance_cents: 100000 },
      };

      mockOrdersService.cancelOrder.mockResolvedValue(mockOrder);

      const result = await controller.cancelOrder('1', { refund: false });

      expect(service.cancelOrder).toHaveBeenCalledWith('1', false);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order CANCELLED successfully');
    });
  });
});
