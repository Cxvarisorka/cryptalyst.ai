import { useQuery } from '@tanstack/react-query';
import { getMarketData, getCryptoData, getStockData, getCryptoById, getStockBySymbol, searchCrypto, searchStocks } from '@/services/marketDataService';

// Query keys
export const marketKeys = {
  all: ['market'],
  allData: () => [...marketKeys.all, 'all'],
  crypto: () => [...marketKeys.all, 'crypto'],
  cryptoList: (limit) => [...marketKeys.crypto(), 'list', limit],
  cryptoDetail: (id) => [...marketKeys.crypto(), 'detail', id],
  cryptoSearch: (query) => [...marketKeys.crypto(), 'search', query],
  stocks: () => [...marketKeys.all, 'stocks'],
  stockList: (limit) => [...marketKeys.stocks(), 'list', limit],
  stockDetail: (symbol) => [...marketKeys.stocks(), 'detail', symbol],
  stockSearch: (query) => [...marketKeys.stocks(), 'search', query],
};

/**
 * Hook to fetch all market data (crypto + stocks)
 * Cached for 1 minute, will use socket updates for real-time
 */
export function useMarketData(options = {}) {
  return useQuery({
    queryKey: marketKeys.allData(),
    queryFn: getMarketData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch crypto data
 */
export function useCryptoData(limit = 100, options = {}) {
  return useQuery({
    queryKey: marketKeys.cryptoList(limit),
    queryFn: () => getCryptoData(limit),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch stock data
 */
export function useStockData(limit = 100, options = {}) {
  return useQuery({
    queryKey: marketKeys.stockList(limit),
    queryFn: () => getStockData(limit),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single crypto by ID
 */
export function useCryptoById(id, options = {}) {
  return useQuery({
    queryKey: marketKeys.cryptoDetail(id),
    queryFn: () => getCryptoById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds for detail pages
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single stock by symbol
 */
export function useStockBySymbol(symbol, options = {}) {
  return useQuery({
    queryKey: marketKeys.stockDetail(symbol),
    queryFn: () => getStockBySymbol(symbol),
    enabled: !!symbol,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to search crypto
 */
export function useCryptoSearch(query, options = {}) {
  return useQuery({
    queryKey: marketKeys.cryptoSearch(query),
    queryFn: () => searchCrypto(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to search stocks
 */
export function useStockSearch(query, options = {}) {
  return useQuery({
    queryKey: marketKeys.stockSearch(query),
    queryFn: () => searchStocks(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}
