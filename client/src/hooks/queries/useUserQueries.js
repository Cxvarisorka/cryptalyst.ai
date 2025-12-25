import { useQuery } from '@tanstack/react-query';
import userService from '@/services/user.service';

// Query keys
export const userKeys = {
  all: ['users'],
  publicUsers: (searchQuery) => [...userKeys.all, 'public', searchQuery || 'all'],
  profile: (userId) => [...userKeys.all, 'profile', userId],
  myProfile: () => [...userKeys.all, 'me'],
};

/**
 * Hook to fetch public users (for community page)
 * Cached for 2 minutes
 */
export function usePublicUsers(searchQuery = '', options = {}) {
  return useQuery({
    queryKey: userKeys.publicUsers(searchQuery),
    queryFn: () => userService.getPublicUsers(searchQuery),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch a specific user's profile
 * Cached for 2 minutes
 */
export function useUserProfile(userId, options = {}) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch current user's profile
 */
export function useMyProfile(options = {}) {
  return useQuery({
    queryKey: userKeys.myProfile(),
    queryFn: () => userService.getMyProfile(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}
