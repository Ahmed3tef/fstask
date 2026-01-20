'use client';

import { OrdersTable } from '@/components/orders/OrdersTable';

/**
 * Main orders page
 * Clean, minimal logic - all complexity in child components
 */
export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage customer orders with refund processing
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrdersTable />
      </main>
    </div>
  );
}
