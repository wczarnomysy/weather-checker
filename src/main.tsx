import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QUERY_CACHE_CONFIG } from './config/query'
import App from './App'
import './index.css'

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CACHE_CONFIG.STALE_TIME,
      gcTime: QUERY_CACHE_CONFIG.GC_TIME,
      retry: (failureCount, error) => {
        // Don't retry on 404s (city not found)
        if (error instanceof Error && error.message.includes('City not found')) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,   // Don't refetch on focus for weather app
      refetchOnReconnect: true,      // Do refetch when reconnected
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>)
