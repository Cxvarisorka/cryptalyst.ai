import { useQuery } from '@tanstack/react-query';
import { newsService } from '@/services/news.service';

// Query keys
export const newsKeys = {
  all: ['news'],
  byCategory: (category, limit) => [...newsKeys.all, 'category', category, limit],
  bySymbols: (symbols, limit) => [...newsKeys.all, 'symbols', symbols.join(','), limit],
  search: (query, limit) => [...newsKeys.all, 'search', query, limit],
};

/**
 * Hook to fetch news by category
 * Cached for 5 minutes - news doesn't change that frequently
 */
export function useNews(category = 'all', limit = 30, options = {}) {
  return useQuery({
    queryKey: newsKeys.byCategory(category, limit),
    queryFn: () => newsService.getNews(category, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,   // 15 minutes
    ...options,
  });
}

/**
 * Hook to fetch news by symbols/tickers
 */
export function useNewsBySymbols(symbols, limit = 20, options = {}) {
  return useQuery({
    queryKey: newsKeys.bySymbols(symbols, limit),
    queryFn: () => newsService.getNewsBySymbols(symbols, limit),
    enabled: symbols && symbols.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to search news
 */
export function useNewsSearch(query, limit = 20, options = {}) {
  return useQuery({
    queryKey: newsKeys.search(query, limit),
    queryFn: () => newsService.searchNews(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}
