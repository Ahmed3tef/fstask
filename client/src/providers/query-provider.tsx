"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
    mutations: {
      retry: false,
    },
  },
};

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}