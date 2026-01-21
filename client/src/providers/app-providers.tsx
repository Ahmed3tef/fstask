"use client";

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { Toaster } from '@/components/ui/sonner';

/**
 * Central providers wrapper
 * All app-level providers should be added here
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}

      {/* Global UI Components */}
      <Toaster />

      {/* Future providers can be added here:
          <ThemeProvider>
          <AuthProvider>
          <AnalyticsProvider>
      */}
    </QueryProvider>
  );
}