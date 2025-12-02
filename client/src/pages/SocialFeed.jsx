import React, { useState, useEffect } from 'react';
import { Plus, Filter, TrendingUp, Search, X, Tag, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PostCreationForm from '../components/posts/PostCreationForm';
import PostCard from '../components/posts/PostCard';
import CommentSection from '../components/posts/CommentSection';
import postService from '../services/post.service';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Hero from '../components/layout/Hero';

/**
 * SocialFeed Page
 * Main feed page for viewing and creating posts about coins/stocks
 */
const SocialFeed = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    assetType: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    searchQuery: '',
    tag: null, // Selected tag filter
  });

  useEffect(() => {
    loadPosts(true);
  }, [filters]);

  const loadPosts = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;

      const params = {
        page: currentPage,
        limit: 10,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      if (filters.assetType && filters.assetType !== 'all') {
        params.assetType = filters.assetType;
      }

      if (filters.tag) {
        params.tag = filters.tag;
      }

      const response = await postService.getFeed(params);

      if (reset) {
        setPosts(response.data);
        setPage(1);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
    loadPosts(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreateDialog(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const handleCommentClick = (post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleTagClick = (tag) => {
    setFilters((prev) => ({ ...prev, tag, searchQuery: '' }));
  };

  const clearTagFilter = () => {
    setFilters((prev) => ({ ...prev, tag: null }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.searchQuery.trim()) {
      loadPosts(true);
      return;
    }

    try {
      setLoading(true);
      const response = await postService.searchPosts(filters.searchQuery, {
        page: 1,
        limit: 10,
      });
      setPosts(response.data);
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(1);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const heroIcons = [
    { Icon: MessageSquare, gradient: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero
        title={t('feed.title') || 'Community Feed'}
        subtitle={t('feed.subtitle') || 'Share your insights and connect with other traders'}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      >
        {user && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-money">
                <Plus className="w-4 h-4 mr-2" />
                {t('feed.createPost') || 'Create Post'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-popover border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {t('feed.newPost') || 'Create New Post'}
                </DialogTitle>
              </DialogHeader>
              <PostCreationForm
                onPostCreated={handlePostCreated}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

        {/* Actions & Filters - Full width */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Search & Create */}
          <div className="flex gap-2 sm:gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-1.5 sm:gap-2">
              <Input
                type="text"
                placeholder={t('feed.searchPlaceholder') || 'Search posts...'}
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-border hover:bg-muted px-2 sm:px-3"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {user && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground whitespace-nowrap">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('feed.createPost') || 'Create Post'}</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-popover border-border max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      {t('feed.newPost') || 'Create New Post'}
                    </DialogTitle>
                  </DialogHeader>
                  <PostCreationForm
                    onPostCreated={handlePostCreated}
                    onCancel={() => setShowCreateDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <Select
              value={filters.assetType}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, assetType: value }))
              }
            >
              <SelectTrigger className="w-[140px] sm:w-[180px] bg-card border-border text-foreground text-sm sm:text-base">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <SelectValue placeholder={t('feed.assetType') || 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('feed.allAssets') || 'All Assets'}</SelectItem>
                <SelectItem value="crypto">{t('feed.crypto') || 'Crypto'}</SelectItem>
                <SelectItem value="stock">{t('feed.stocks') || 'Stocks'}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger className="w-[140px] sm:w-[180px] bg-card border-border text-foreground text-sm sm:text-base">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <SelectValue placeholder={t('feed.sortBy') || 'Sort'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">{t('feed.latest') || 'Latest'}</SelectItem>
                <SelectItem value="likesCount">{t('feed.mostLiked') || 'Most Liked'}</SelectItem>
                <SelectItem value="commentsCount">{t('feed.mostDiscussed') || 'Most Discussed'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Active Tag Filter */}
            {filters.tag && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">#{filters.tag}</span>
                <button
                  onClick={clearTagFilter}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label="Clear tag filter"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feed Content - Centered with max width */}
        <div className="max-w-3xl mx-auto">
          {/* Feed Tabs */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="bg-card border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t('feed.allPosts') || 'All Posts'}
            </TabsTrigger>
            {user && (
              <TabsTrigger value="following" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t('feed.following') || 'Following'}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {/* Posts List */}
            {loading && page === 1 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground mt-4">{t('feed.loading') || 'Loading posts...'}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">{t('feed.noPosts') || 'No posts found'}</p>
                {user && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-primary hover:bg-primary-dark text-primary-foreground"
                  >
                    {t('feed.createFirstPost') || 'Create First Post'}
                  </Button>
                )}
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                    onCommentClick={handleCommentClick}
                    onTagClick={handleTagClick}
                  />
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      className="border-border hover:bg-muted"
                    >
                      {loading ? (t('feed.loading') || 'Loading...') : (t('feed.loadMore') || 'Load More Posts')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4 mt-6">
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">{t('feed.followingComingSoon') || 'Following feed coming soon!'}</p>
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Comments Dialog */}
      {selectedPost && (
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent className="max-w-2xl bg-popover border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t('feed.comments') || 'Comments'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <PostCard post={selectedPost} onCommentClick={() => {}} />
              <CommentSection
                postId={selectedPost._id}
                initialCommentsCount={selectedPost.commentsCount}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SocialFeed;
