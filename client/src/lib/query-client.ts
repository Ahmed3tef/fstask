import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 * Centralized settings for caching, refetching, and error handling
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data considered fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Cache garbage collection after 5 minutes
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      retry: 1, // Retry failed requests once
    },
    mutations: {
      retry: false, // Don't retry mutations automatically
    },
  },
});