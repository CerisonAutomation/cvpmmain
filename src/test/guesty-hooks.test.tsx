import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useListings } from '../lib/guesty/hooks';
import { guestyClient } from '../lib/guesty/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../lib/guesty/client', () => ({
  guestyClient: {
    getListings: vi.fn(),
    getListing: vi.fn(),
    createQuote: vi.fn(),
    getQuote: vi.fn(),
    getListingCalendar: vi.fn(),
    getCities: vi.fn(),
    getReviews: vi.fn(),
    getRatePlans: vi.fn(),
    getPaymentProvider: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Guesty Hooks', () => {
  it('useListings should fetch and return listings', async () => {
    const mockListings = [{ _id: '1', title: 'Test' }];
    vi.mocked(guestyClient.getListings).mockResolvedValue(mockListings as any);

    const { result } = renderHook(() => useListings(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(mockListings), { timeout: 3000 });
  });
});
