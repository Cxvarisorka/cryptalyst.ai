import React, { useState, useEffect } from 'react';
import { Send, Heart, Trash2, MoreVertical, Reply } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/post.service';
import { formatDistanceToNow } from 'date-fns';

/**
 * CommentItem Component
 * Displays a single comment with replies
 */
const CommentItem = ({ comment, onDelete, onReply, currentUserId }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = currentUserId && comment.userId?._id === currentUserId;

  const handleLike = async () => {
    try {
      const response = await postService.toggleCommentLike(comment._id);
      if (response.data.liked) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 bg-muted text-foreground flex-shrink-0">
          {comment.userId?.avatar ? (
            <img
              src={comment.userId.avatar}
              alt={comment.userId.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs">{comment.userId?.name?.charAt(0) || 'U'}</span>
          )}
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.userId?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
              </div>

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border">
                    <DropdownMenuItem
                      onClick={() => onDelete(comment._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm text-card-foreground">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 px-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-muted-foreground hover:text-danger transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  liked ? 'fill-danger text-danger' : ''
                }`}
              />
              <span className="text-xs">{likesCount > 0 && likesCount}</span>
            </button>

            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span className="text-xs">Reply</span>
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-primary hover:text-primary-light"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
                {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>

              {showReplies && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-border">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      onDelete={onDelete}
                      onReply={onReply}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * CommentSection Component
 * Displays comments for a post and allows adding new comments
 */
const CommentSection = ({ postId, initialCommentsCount = 0 }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await postService.getComments(postId, {
        page: 1,
        limit: 20,
        includeReplies: true,
      });

      setComments(response.data);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const response = await postService.getComments(postId, {
        page: nextPage,
        limit: 20,
        includeReplies: true,
      });

      setComments((prev) => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmitting(true);

      const commentData = {
        content: newComment,
        parentCommentId: replyTo?._id || null,
      };

      const response = await postService.createComment(postId, commentData);

      if (replyTo) {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === replyTo._id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data],
              };
            }
            return comment;
          })
        );
      } else {
        setComments((prev) => [response.data, ...prev]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await postService.deleteComment(commentId);

      setComments((prev) =>
        prev.filter((comment) => {
          if (comment._id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter((reply) => reply._id !== commentId);
          }
          return true;
        })
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    document.getElementById('comment-input')?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Replying to {replyTo.userId?.name}</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-destructive hover:text-destructive/80"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Avatar className="w-8 h-8 bg-muted text-foreground flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs">{user?.name?.charAt(0) || 'U'}</span>
              )}
            </Avatar>

            <div className="flex-1 flex gap-2">
              <input
                id="comment-input"
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? `Reply to ${replyTo.userId?.name}...` : 'Write a comment...'}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={2000}
              />
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !newComment.trim()}
                className="rounded-full bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onDelete={handleDelete}
              onReply={handleReply}
              currentUserId={user?._id}
            />
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                className="border-border hover:bg-muted"
              >
                Load More Comments
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
