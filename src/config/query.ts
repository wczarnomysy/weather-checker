/**
 * React Query cache configuration
 * Centralized to ensure consistency across all queries
 */
export const QUERY_CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,  // 5 minutes - weather doesn't change quickly
  GC_TIME: 10 * 60 * 1000,    // 10 minutes - garbage collection time
} as const;
