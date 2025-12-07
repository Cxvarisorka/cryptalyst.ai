import { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import adminService from '@/services/admin.service';

const PostManagement = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await adminService.getAllPosts(params);
      setPosts(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (
      !confirm(
        'Are you sure you want to delete this post? This action cannot be undone and will also delete all comments on this post.'
      )
    ) {
      return;
    }

    try {
      await adminService.deletePost(postId);
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post');
      console.error(err);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="bg-card border-border/60">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts by content or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={
                        post.userId?.avatar ||
                        `https://ui-avatars.com/api/?name=${post.userId?.name || 'User'}`
                      }
                      alt={post.userId?.name || 'User'}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {post.userId?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.userId?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {post.asset?.symbol || 'N/A'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {post.asset?.name || 'N/A'}
                    </span>
                    {post.sentiment && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          post.sentiment === 'bullish'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : post.sentiment === 'bearish'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {post.sentiment}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-foreground mb-2">
                    {truncateText(post.content)}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs text-primary hover:underline"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{post.likesCount || 0} likes</span>
                    <span>•</span>
                    <span>{post.commentsCount || 0} comments</span>
                    <span>•</span>
                    <span>{post.sharesCount || 0} shares</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/social/${post._id}`)}
                    className="text-primary hover:bg-primary/10"
                    title="View post"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePost(post._id)}
                    className="text-destructive hover:bg-destructive/10"
                    title="Delete post"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card className="bg-card border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total posts)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PostManagement;
