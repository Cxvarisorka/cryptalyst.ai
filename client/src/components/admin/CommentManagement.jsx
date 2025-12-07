import { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import adminService from '@/services/admin.service';

const CommentManagement = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComments();
  }, [pagination.page, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await adminService.getAllComments(params);
      setComments(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      alert('Failed to delete comment');
      console.error(err);
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && comments.length === 0) {
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
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment._id} className="bg-card border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={
                        comment.userId?.avatar ||
                        `https://ui-avatars.com/api/?name=${comment.userId?.name || 'User'}`
                      }
                      alt={comment.userId?.name || 'User'}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {comment.userId?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comment.userId?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <p className="text-foreground mb-3">
                    {truncateText(comment.content)}
                  </p>

                  {/* Post Context */}
                  {comment.postId && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Comment on post:
                      </p>
                      <div className="flex items-center space-x-2">
                        {comment.postId.asset?.symbol && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                            {comment.postId.asset.symbol}
                          </span>
                        )}
                        <p className="text-sm text-foreground">
                          {truncateText(comment.postId.content, 80)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    {comment.likesCount !== undefined && (
                      <>
                        <span>•</span>
                        <span>{comment.likesCount} likes</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {comment.postId?._id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/social/${comment.postId._id}`)}
                      className="text-primary hover:bg-primary/10"
                      title="View post"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-destructive hover:bg-destructive/10"
                    title="Delete comment"
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
                Page {pagination.page} of {pagination.pages} ({pagination.total} total comments)
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

export default CommentManagement;
