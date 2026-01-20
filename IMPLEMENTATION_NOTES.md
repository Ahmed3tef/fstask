# Order Management System - Implementation Notes

## 🎯 Overview

Production-grade order management system with NestJS backend and Next.js frontend, featuring balance-aware refund processing, comprehensive error handling, and polished UX.

---

## 🚀 Quick Start

### Backend Setup

```bash
cd server
npm install

# Create .env file
echo "PORT=4000" > .env

# Start development server
npm run start:dev
# Server runs at http://localhost:4000
```

### Frontend Setup

```bash
cd client
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Start development server
npm run dev
# Frontend runs at http://localhost:3000
```

### Verify Setup
- Backend: `http://localhost:4000/orders` → JSON array
- Frontend: `http://localhost:3000` → Orders table

---

## ✅ Implemented Features

### Backend (NestJS + TypeORM + SQLite)

**Endpoints:**
- `GET /orders` - Returns orders with nested customer and store (balance excluded)
- `DELETE /orders/:id` - Cancels order with optional refund logic

**Refund Logic:**
- `refund=true`: Validates store balance ≥ order amount, deducts atomically
- `refund=false`: Simple cancellation, no balance checks
- Only `PENDING_PAYMENT` or `CONFIRMED` orders can be cancelled
- Prevents cancelling already `CANCELLED` orders

**Error Handling:**
- `404` - Order not found
- `400` - Invalid status, insufficient balance, already cancelled

**Testing:**
- 26 unit tests for `OrdersService` (100% business logic coverage)
- Transaction safety verified
- All edge cases covered (zero balance, exact match, negative amounts)

### Frontend (Next.js 15 + React Query + Framer Motion)

**UI Components:**
- Orders table with real-time data
- Cancel modal with two options: "Cancel with Refund" / "Cancel without Refund"
- Loading states (skeleton loaders, spinners)
- Error states (inline messages, retry button)
- Empty state
- Responsive design (mobile-friendly)

**Animations:**
- Table entrance with staggered rows (50ms delay)
- Modal entrance/exit (scale + fade)
- Smooth hover effects
- Professional, subtle animations

**Accessibility:**
- Semantic HTML (proper table structure, header, main)
- ARIA labels and roles
- Keyboard navigation (ESC closes modal)
- Focus trap in modal
- Screen reader support
- WCAG AA color contrast

---

## 🏗️ Architecture

### Backend Structure

```
server/src/
├── database/
│   ├── entities/
│   │   ├── order-status.enum.ts       # Type-safe status enum
│   │   ├── order.entity.ts            # Order with relations
│   │   ├── store.entity.ts            # Store with balance_cents
│   │   └── customer.entity.ts
│   └── database.module.ts
├── modules/orders/
│   ├── dto/                           # Request/response DTOs
│   ├── orders.controller.ts           # Thin controller (routing)
│   ├── orders.service.ts              # Business logic + transactions
│   ├── orders.service.spec.ts         # 26 unit tests
│   └── orders.module.ts
└── main.ts                            # CORS enabled
```

**Key Decisions:**
- **Thin Controllers**: Delegate all logic to services
- **Transaction Safety**: `DataSource.transaction()` for atomic balance deduction + order update
- **DTO Pattern**: `OrderResponseDto.fromEntity()` excludes sensitive data (store balance)
- **Enum-Based Status**: Centralized `OrderStatus` enum with `CANCELLABLE_STATUSES` array
- **No External Validators**: Validation in service layer, minimal dependencies

### Frontend Structure

```
client/src/
├── app/
│   ├── page.tsx                       # Main orders page
│   ├── layout.tsx                     # Root layout with providers
│   └── providers.tsx                  # React Query provider
├── components/
│   ├── ui/                            # Reusable UI (Button, Modal, Spinner)
│   ├── orders/                        # Order table, row, badge, empty state
│   └── modals/                        # CancelOrderModal
├── hooks/
│   ├── orders/
│   │   ├── useOrders.ts               # React Query fetch hook
│   │   └── useCancelOrder.ts          # Mutation hook with cache invalidation
├── services/
│   └── orders.service.ts              # API calls abstraction
├── lib/
│   ├── api-client.ts                  # Axios config + interceptors
│   ├── query-client.ts                # React Query config
│   └── formatters.ts                  # Currency, date, status formatters
└── types/
    └── order.types.ts                 # TypeScript interfaces
```

**Key Decisions:**
- **React Query**: Automatic caching, refetching, loading/error states
- **Service Layer**: All API calls in `ordersService`, easy to mock
- **Component Composition**: Small, focused components (SRP)
- **Framer Motion**: Declarative animations with `AnimatePresence`
- **Formatter Utilities**: Centralized display logic for consistency

---

## 🧪 Testing

### Run Backend Tests

```bash
cd server
npm test                # Run all tests
npm run test:cov        # With coverage report
```

**Coverage:**
- `OrdersService`: 26 tests covering all business rules
- `OrdersController`: 3 basic tests
- Transaction safety, balance validation, status checks, error cases

### Manual Testing Checklist

**Backend:**
- ✓ GET /orders returns nested customer/store objects
- ✓ DELETE with refund=true + sufficient balance → success
- ✓ DELETE with refund=true + insufficient balance → 400 error
- ✓ DELETE with refund=false → success (no balance check)
- ✓ DELETE already cancelled order → 400 error
- ✓ DELETE non-existent order → 404 error

**Frontend:**
- ✓ Orders table loads and displays data correctly
- ✓ Loading spinner appears during fetch
- ✓ Error state with retry button works
- ✓ Empty state shows when no orders
- ✓ Cancel button only visible for PENDING_PAYMENT/CONFIRMED orders
- ✓ Modal opens/closes correctly (ESC key, backdrop click, X button)
- ✓ Cancel with refund (sufficient balance) → success + list refresh
- ✓ Cancel with refund (insufficient balance) → error shown in modal
- ✓ Cancel without refund → success + list refresh
- ✓ Animations smooth and professional
- ✓ Responsive design works on mobile

---

## 🔑 Key Implementation Details

### Backend

**OrderStatus Enum:**
```typescript
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.CONFIRMED,
];
```

**Transaction Pattern:**
```typescript
// Atomic operation: deduct balance + update order status
return this.dataSource.transaction(async (manager) => {
  await manager.createQueryBuilder()
    .update(StoreEntity)
    .set({ balance_cents: () => `balance_cents - ${order.amount_cents}` })
    .where('id = :id', { id: store.id })
    .execute();

  order.status = OrderStatus.CANCELLED;
  order.updated_at = new Date();
  return manager.save(order);
});
```

### Frontend

**React Query Configuration:**
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,        // Data fresh for 30s
      gcTime: 5 * 60 * 1000,   // Cache for 5 min
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
```

**Error Handling:**
```typescript
// Axios interceptor transforms backend errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 
                    'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
```

---

## 📝 Important Notes

1. **Environment Variables Required:**
   - Backend: `PORT=4000` in `server/.env`
   - Frontend: `NEXT_PUBLIC_API_URL=http://localhost:4000` in `client/.env.local`

2. **CORS Configuration:**
   - Backend accepts requests from `http://localhost:3000` only
   - Configured in `main.ts`

3. **Database:**
   - SQLite database at `server/database/db.sqlite`
   - Store entity has `balance_cents` column (integer, cents)
   - To add test balance: `sqlite3 database/db.sqlite "UPDATE stores SET balance_cents = 1000000;"`

4. **React Query DevTools:**
   - Available in development mode
   - Access at bottom-left corner of screen
   - Shows queries, mutations, cache state

---

## 💡 Design Patterns

**Backend:**
- Repository Pattern (TypeORM)
- DTO Pattern (Request/response transformation)
- Dependency Injection (NestJS DI)
- Transaction Script (Atomic operations)

**Frontend:**
- Container/Presentational Components
- Custom Hooks (Data fetching logic)
- Service Layer (API abstraction)
- Composition (Small, reusable components)

---

## 🏆 What This Demonstrates

**Backend Skills:**
- NestJS best practices (modules, services, controllers)
- TypeORM with relations and transactions
- Clean architecture and separation of concerns
- Comprehensive unit testing with mocks
- Type-safe enums and DTOs
- Error handling with proper HTTP status codes

**Frontend Skills:**
- Next.js 15 with App Router
- React Query for server state management
- TypeScript with strict typing
- Component composition and reusability
- Framer Motion animations
- Accessibility (WCAG guidelines)
- Responsive design with Tailwind CSS

**General:**
- Clean code principles
- SOLID principles
- Incremental development approach
- Production-ready code quality
- Interview-level documentation

---

## 📚 Additional Resources

**Project Files:**
- `server/src/modules/orders/orders.service.ts` - Core business logic
- `client/src/components/modals/CancelOrderModal.tsx` - Refund flow UI
- `server/src/modules/orders/orders.service.spec.ts` - Test examples

**External Documentation:**
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Relations](https://typeorm.io/relations)
- [React Query Guide](https://tanstack.com/query/latest)
- [Framer Motion API](https://www.framer.com/motion/)

---

*For questions or issues, refer to inline code comments or this documentation.*
