import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrderEntity } from '@/database/entities/order.entity';
import { StoreEntity } from '@/database/entities/store.entity';
import { OrderStatus } from '@/database/entities/order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<Repository<OrderEntity>>;
  let storesRepository: jest.Mocked<Repository<StoreEntity>>;
  let dataSource: jest.Mocked<DataSource>;

  // Test fixtures
  const mockCustomer = {
    id: 1,
    name: 'John Doe',
  };

  const mockStore = {
    id: 1,
    name: 'Store A',
    balance_cents: 100000, // $1000
  };

  const mockOrder = {
    id: 1,
    store_id: 1,
    customer_id: 1,
    amount_cents: 5000, // $50
    status: OrderStatus.CONFIRMED,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    customer: mockCustomer,
    store: mockStore,
  };

  // Mock transaction manager
  const mockTransactionManager = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    // Create mock repositories
    const mockOrdersRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const mockStoresRepo = {
      findOne: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn((callback) => callback(mockTransactionManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrdersRepo,
        },
        {
          provide: getRepositoryToken(StoreEntity),
          useValue: mockStoresRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepository = module.get(getRepositoryToken(OrderEntity));
    storesRepository = module.get(getRepositoryToken(StoreEntity));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listOrders', () => {
    it('should return all orders with relations', async () => {
      const mockOrders = [mockOrder];
      ordersRepository.find.mockResolvedValue(mockOrders as any);

      const result = await service.listOrders();

      expect(ordersRepository.find).toHaveBeenCalledWith({
        relations: ['customer', 'store'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockOrders);
      expect(result[0]).toHaveProperty('customer');
      expect(result[0]).toHaveProperty('store');
    });

    it('should return empty array when no orders exist', async () => {
      ordersRepository.find.mockResolvedValue([]);

      const result = await service.listOrders();

      expect(result).toEqual([]);
    });
  });

  describe('cancelOrder', () => {
    describe('validation errors', () => {
      it('should throw BadRequestException for invalid order ID', async () => {
        await expect(service.cancelOrder('invalid', false)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.cancelOrder('invalid', false)).rejects.toThrow(
          'Invalid order ID',
        );
      });

      it('should throw NotFoundException when order does not exist', async () => {
        ordersRepository.findOne.mockResolvedValue(null);

        await expect(service.cancelOrder('999', false)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.cancelOrder('999', false)).rejects.toThrow(
          'Order with ID 999 not found',
        );
      });

      it('should throw BadRequestException when order is already CANCELLED', async () => {
        const cancelledOrder = {
          ...mockOrder,
          status: OrderStatus.CANCELLED,
        };
        ordersRepository.findOne.mockResolvedValue(cancelledOrder as any);

        await expect(service.cancelOrder('1', false)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.cancelOrder('1', false)).rejects.toThrow(
          'Order is already CANCELLED',
        );
      });

      it('should throw BadRequestException for non-cancellable status', async () => {
        // If we add more statuses in the future (e.g., 'shipped'), they shouldn't be cancellable
        const nonCancellableOrder = {
          ...mockOrder,
          status: 'shipped' as any, // Hypothetical future status
        };
        ordersRepository.findOne.mockResolvedValue(nonCancellableOrder as any);

        await expect(service.cancelOrder('1', false)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.cancelOrder('1', false)).rejects.toThrow(
          "Order with status 'shipped' cannot be cancelled",
        );
      });
    });

    describe('cancel without refund', () => {
      it('should cancel order without checking balance', async () => {
        ordersRepository.findOne
          .mockResolvedValueOnce(mockOrder as any) // Initial fetch
          .mockResolvedValueOnce({
            ...mockOrder,
            status: OrderStatus.CANCELLED,
          } as any); // Final fetch

        const result = await service.cancelOrder('1', false);

        expect(ordersRepository.update).toHaveBeenCalledWith(
          { id: 1 },
          expect.objectContaining({
            status: OrderStatus.CANCELLED,
          }),
        );
        expect(dataSource.transaction).not.toHaveBeenCalled();
        expect(result.status).toBe(OrderStatus.CANCELLED);
      });

      it('should work even with zero store balance', async () => {
        const orderWithZeroBalance = {
          ...mockOrder,
          store: { ...mockStore, balance_cents: 0 },
        };
        ordersRepository.findOne
          .mockResolvedValueOnce(orderWithZeroBalance as any)
          .mockResolvedValueOnce({
            ...orderWithZeroBalance,
            status: OrderStatus.CANCELLED,
          } as any);

        const result = await service.cancelOrder('1', false);

        expect(result.status).toBe(OrderStatus.CANCELLED);
        expect(dataSource.transaction).not.toHaveBeenCalled();
      });
    });

    describe('cancel with refund - success cases', () => {
      it('should process refund when store has sufficient balance', async () => {
        ordersRepository.findOne
          .mockResolvedValueOnce(mockOrder as any)
          .mockResolvedValueOnce({
            ...mockOrder,
            status: OrderStatus.CANCELLED,
            store: { ...mockStore, balance_cents: 95000 },
          } as any);

        const result = await service.cancelOrder('1', true);

        // Verify transaction was used
        expect(dataSource.transaction).toHaveBeenCalled();
        expect(mockTransactionManager.update).toHaveBeenCalledTimes(2);

        // Verify store balance deduction
        expect(mockTransactionManager.update).toHaveBeenCalledWith(
          StoreEntity,
          { id: mockOrder.store_id },
          {
            balance_cents: expect.any(Function),
          },
        );

        // Verify order status update
        expect(mockTransactionManager.update).toHaveBeenCalledWith(
          OrderEntity,
          { id: mockOrder.id },
          expect.objectContaining({
            status: OrderStatus.CANCELLED,
          }),
        );

        expect(result.status).toBe(OrderStatus.CANCELLED);
      });

      it('should handle exact balance match (balance equals order amount)', async () => {
        const exactBalanceOrder = {
          ...mockOrder,
          amount_cents: 100000,
          store: { ...mockStore, balance_cents: 100000 },
        };
        ordersRepository.findOne
          .mockResolvedValueOnce(exactBalanceOrder as any)
          .mockResolvedValueOnce({
            ...exactBalanceOrder,
            status: OrderStatus.CANCELLED,
          } as any);

        const result = await service.cancelOrder('1', true);

        expect(dataSource.transaction).toHaveBeenCalled();
        expect(result.status).toBe(OrderStatus.CANCELLED);
      });

      it('should work for PENDING_PAYMENT status', async () => {
        const pendingOrder = {
          ...mockOrder,
          status: OrderStatus.PENDING_PAYMENT,
        };
        ordersRepository.findOne
          .mockResolvedValueOnce(pendingOrder as any)
          .mockResolvedValueOnce({
            ...pendingOrder,
            status: OrderStatus.CANCELLED,
          } as any);

        const result = await service.cancelOrder('1', true);

        expect(result.status).toBe(OrderStatus.CANCELLED);
        expect(dataSource.transaction).toHaveBeenCalled();
      });
    });

    describe('cancel with refund - insufficient balance', () => {
      it('should throw error when store balance is less than order amount', async () => {
        const insufficientBalanceOrder = {
          ...mockOrder,
          amount_cents: 5000,
          store: { ...mockStore, balance_cents: 4999 }, // $49.99 vs $50
        };
        ordersRepository.findOne.mockResolvedValue(
          insufficientBalanceOrder as any,
        );

        await expect(service.cancelOrder('1', true)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.cancelOrder('1', true)).rejects.toThrow(
          'Insufficient balance',
        );

        // Transaction should not be called
        expect(dataSource.transaction).not.toHaveBeenCalled();
      });

      it('should throw error when store balance is zero', async () => {
        const zeroBalanceOrder = {
          ...mockOrder,
          store: { ...mockStore, balance_cents: 0 },
        };
        ordersRepository.findOne.mockResolvedValue(zeroBalanceOrder as any);

        await expect(service.cancelOrder('1', true)).rejects.toThrow(
          'Insufficient balance',
        );
        expect(dataSource.transaction).not.toHaveBeenCalled();
      });

      it('should throw error when store balance is negative (edge case)', async () => {
        const negativeBalanceOrder = {
          ...mockOrder,
          store: { ...mockStore, balance_cents: -1000 },
        };
        ordersRepository.findOne.mockResolvedValue(
          negativeBalanceOrder as any,
        );

        await expect(service.cancelOrder('1', true)).rejects.toThrow(
          'Insufficient balance',
        );
      });
    });

    describe('updated_at timestamp', () => {
      it('should update the updated_at field on cancellation', async () => {
        const originalDate = new Date('2024-01-01');
        const orderToUpdate = {
          ...mockOrder,
          updated_at: originalDate,
        };

        ordersRepository.findOne
          .mockResolvedValueOnce(orderToUpdate as any)
          .mockResolvedValueOnce({
            ...orderToUpdate,
            status: OrderStatus.CANCELLED,
            updated_at: new Date('2024-01-02'),
          } as any);

        await service.cancelOrder('1', false);

        expect(ordersRepository.update).toHaveBeenCalledWith(
          { id: 1 },
          expect.objectContaining({
            updated_at: expect.any(Date),
          }),
        );
      });
    });

    describe('relations in response', () => {
      it('should return updated order with customer and store relations', async () => {
        ordersRepository.findOne
          .mockResolvedValueOnce(mockOrder as any)
          .mockResolvedValueOnce({
            ...mockOrder,
            status: OrderStatus.CANCELLED,
          } as any);

        const result = await service.cancelOrder('1', false);

        // Verify final fetch includes relations
        expect(ordersRepository.findOne).toHaveBeenLastCalledWith({
          where: { id: 1 },
          relations: ['customer', 'store'],
        });

        expect(result).toHaveProperty('customer');
        expect(result).toHaveProperty('store');
        expect(result.customer.name).toBe('John Doe');
        expect(result.store.name).toBe('Store A');
      });
    });
  });
});
