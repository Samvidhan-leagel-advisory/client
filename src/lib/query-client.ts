import { QueryClient } from '@tanstack/react-query';

/**
 * Shared client for TanStack Query. Use `apiClient` from `@/api-client` in
 * query/mutation functions so auth headers from `axios.js` apply consistently.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
