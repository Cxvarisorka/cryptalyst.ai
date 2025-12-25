import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postService from '@/services/post.service';

// Query keys
export const postKeys = {
  all: ['posts'],
  feed: (params) => [...postKeys.all, 'feed', params],
  followingFeed: (params) => [...postKeys.all, 'following', params],
  byAsset: (symbol, params) => [...postKeys.all, 'asset', symbol, params],
  byUser: (userId, params) => [...postKeys.all, 'user', userId, params],
  detail: (postId) => [...postKeys.all, 'detail', postId],
  comments: (postId, params) => [...postKeys.all, 'comments', postId, params],
  search: (query, params) => [...postKeys.all, 'search', query, params],
};

/**
 * Hook to fetch feed posts
 * Cached for 1 minute - feeds update frequently
 */
export function useFeed(params = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.feed(params),
    queryFn: () => postService.getFeed(params),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch following feed
 */
export function useFollowingFeed(params = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.followingFeed(params),
    queryFn: () => postService.getFollowingFeed(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch posts by asset symbol
 */
export function usePostsByAsset(symbol, params = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.byAsset(symbol, params),
    queryFn: () => postService.getPostsByAsset(symbol, params),
    enabled: !!symbol,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch posts by user
 */
export function usePostsByUser(userId, params = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.byUser(userId, params),
    queryFn: () => postService.getPostsByUser(userId, params),
    enabled: !!userId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch a single post by ID
 */
export function usePost(postId, options = {}) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postService.getPostById(postId),
    enabled: !!postId,
    staleTime: 30 * 1000, // 30 seconds for detail
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch comments for a post
 */
export function useComments(postId, params = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.comments(postId, params),
    queryFn: () => postService.getComments(postId, params),
    enabled: !!postId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to search posts
 */
export function usePostSearch(query, params = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.search(query, params),
    queryFn: () => postService.searchPosts(query, params),
    enabled: !!query && query.length >= 2,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create a post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postData, images }) => postService.createPost(postData, images),
    onSuccess: () => {
      // Invalidate feed queries to refetch
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to toggle like on a post
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => postService.toggleLike(postId),
    onSuccess: (data, postId) => {
      // Invalidate specific post and feeds
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to create a comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentData }) => postService.createComment(postId, commentData),
    onSuccess: (data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId, {}) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
