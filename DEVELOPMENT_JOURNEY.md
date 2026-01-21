# 🚀 Development Journey - Order Management System

## 📖 Overview

This is an **improved version** of an Order Management System built as a job interview assignment. After completing V1, I rebuilt the system with better architecture, cleaner patterns, and stronger foundation.

### ⏱️ Time Investment

| Phase | Duration |
|-------|----------|
| Planning & Code Review | ~2 hours |
| Implementation | ~1 hour |
| Testing & Refinement | ~2 hours |
| **Total** | **~5 hours** |

**Key Insight:** V2 was faster to implement because architectural decisions were already validated.

---

## 🎯 What Was Delivered

### Core Requirements
- ✅ NestJS REST API (`GET /orders`, `DELETE /orders/:id`)
- ✅ Next.js frontend with orders management
- ✅ Order cancellation with optional refund
- ✅ Clean architecture & comprehensive testing

### Beyond Requirements
- ✅ Server-side pagination with filtering
- ✅ Optimistic UI updates
- ✅ Toast notifications
- ✅ Comprehensive error handling
- ✅ Reusable pagination helper
- ✅ Accessibility features

---

## 🏗️ Key Architecture Decisions

### Backend (NestJS)

**1. Transaction-Based Refunds**
```typescript
await this.dataSource.transaction(async (manager) => {
  // 1. Deduct from store balance
  // 2. Update order status
  // Both succeed or both fail - prevents partial refunds
});
```

**2. Enum-Based Status Management**
```typescript
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export const CANCELLABLE_STATUSES = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.CONFIRMED,
];
```
**Why:** Type safety + clear business rules.

**3. Reusable Pagination Helper**
- Generic `PaginationHelper.paginate<T>()` works with any entity
- Built-in validation (min/max limits, edge cases)
- Consistent with NestJS class-based patterns

---

### Frontend (Next.js)

**1. React Query for Server State**
```typescript
// Factory pattern (not singleton) for Next.js SSR compatibility
const [queryClient] = useState(() => new QueryClient(...));
```
**Why:** Prevents state sharing between SSR requests.

**2. Optimistic Updates**
- UI updates instantly → request sent → rollback on error
- Great UX with minimal complexity

**3. shadcn/ui Component Library**
**Why:** Production-ready, accessible, consistent, faster than custom components.

**4. Pure Function API Services**
```typescript
function all(params: OrdersQueryParams) {
  return apiClient.get<Response>(URL, { params })
    .then(res => res.data);
}
```
**Why:** Cleaner, easier to test, consistent return types.

---

## 🛠️ Tech Stack

### Backend
- NestJS + TypeORM + SQLite
- TypeScript + Jest
- class-validator for DTOs

### Frontend
- Next.js 15 + React 19
- React Query + Axios
- shadcn/ui + Tailwind CSS
- Sonner (toasts) + Lucide (icons)

---

## ✨ Key Features

1. **Paginated Orders List** - Server-side, 10 items/page
2. **Status Filtering** - Filter by status, persisted in URL
3. **Order Cancellation** - With/without refund, validates status & balance
4. **Optimistic Updates** - Instant UI feedback with rollback
5. **Toast Notifications** - Success/error messages
6. **Error Handling** - Type-safe, user-friendly messages
7. **Loading States** - Skeletons, spinners, disabled states
8. **Accessibility** - Semantic HTML, ARIA, keyboard navigation
9. **Responsive Design** - Mobile-first approach

---

## 📊 V1 vs V2 Comparison

**Note:** V1 implementation is available on the `feat/orders` branch for reference.

| Aspect | V1 (feat/orders) | V2 (feat/pagination-and-shadcn) |
|--------|------------------|----------------------------------|
| UI Library | Custom components | shadcn/ui |
| Animations | Framer Motion | Minimal |
| Providers | Inline in layout | Centralized AppProviders |
| API Services | Object literal | Pure functions |
| Pagination | Inline in service | Reusable PaginationHelper |
| Optimistic Updates | ❌ | ✅ |
| Toasts | ❌ | ✅ |

**Lesson:** Better architecture = faster development + higher quality.

**Branch Structure:**
- `feat/orders` - First implementation (V1)
- `feat/pagination-and-shadcn` - Improved implementation (V2)

---

## 🚧 Challenges & Solutions

### 1. Database Schema Constraint
**Problem:** DB only allowed CONFIRMED/CANCELLED, but code needed PENDING_PAYMENT.

**Solution:** Aligned code to uppercase statuses, documented schema limitation.

### 2. React Query Singleton Issue
**Problem:** Singleton pattern causes SSR issues in Next.js.

**Solution:** Used factory pattern with `useState(() => new QueryClient())`.

### 3. Pagination Reusability
**Problem:** Logic would be duplicated across services.

**Solution:** Created generic `PaginationHelper` class with validation.

---

## 🧪 Testing

### Backend
- ✅ Service unit tests (~95% coverage)
- ✅ Controller tests (~90% coverage)
- ✅ Comprehensive error scenarios

### Frontend
- ✅ Manual testing (all scenarios)
- 🔄 Future: Add Vitest + Playwright for automation

---

## 🎓 Key Takeaways

1. **Iteration is valuable** - V2 was significantly better than V1
2. **Choose the right tools** - shadcn/ui & React Query saved hours
3. **Architecture matters** - Good structure makes everything easier
4. **Type safety** - Prevents runtime surprises
5. **Test as you go** - Don't wait until the end

---

## 📚 References

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeORM Docs](https://typeorm.io/)

---

**Built with 💙 by a [Ahmed Atef](https://www.linkedin.com/in/ahmed-atef-alattafy/) who cares about quality.**
