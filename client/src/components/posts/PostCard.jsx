import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, Edit2, Globe, Users, Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/post.service';
import { formatDistanceToNow } from 'date-fns';

/**
 * PostCard Component
 * Displays a single post with interactions (like, comment, share) and sentiment
 */
const PostCard = ({ post, onPostDeleted, onPostUpdated, onCommentClick, onTagClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [loading, setLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editVisibility, setEditVisibility] = useState(post.visibility || 'public');
  const [editTags, setEditTags] = useState((post.tags || []).join(', '));

  // More robust author check - convert to strings and check both id and _id
  const isAuthor = user && post.userId && (
    String(post.userId._id || post.userId.id) === String(user._id || user.id)
  );

  /**
   * Initialize like status from post data
   */
  React.useEffect(() => {
    // If post includes isLikedByUser field, use it
    if (typeof post.isLikedByUser === 'boolean') {
      setLiked(post.isLikedByUser);
    }
  }, [post.isLikedByUser]);

  /**
   * Handle like toggle
   */
  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like posts');
      return;
    }

    try {
      setLoading(true);
      const response = await postService.toggleLike(post._id);

      if (response.data.liked) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle share
   */
  const handleShare = async () => {
    try {
      await postService.sharePost(post._id);
      setSharesCount((prev) => prev + 1);

      if (navigator.share) {
        await navigator.share({
          title: `${post.userId?.name || 'User'}'s post about ${post.asset?.symbol || 'asset'}`,
          text: post.content.substring(0, 200),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing post:', error);
      }
    }
  };

  /**
   * Handle edit post
   */
  const handleEdit = async () => {
    try {
      setLoading(true);
      const tags = editTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const updateData = {
        content: editContent,
        visibility: editVisibility,
        tags,
      };

      const response = await postService.updatePost(post._id, updateData);

      if (onPostUpdated) {
        onPostUpdated(response.data);
      }

      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete post
   */
  const handleDelete = async () => {
    try {
      setLoading(true);
      await postService.deletePost(post._id);
      setShowDeleteDialog(false);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get visibility icon
   */
  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'public':
        return <Globe className="w-3 h-3 text-muted-foreground" />;
      case 'followers':
        return <Users className="w-3 h-3 text-muted-foreground" />;
      case 'private':
        return <Lock className="w-3 h-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  /**
   * Get sentiment badge
   */
  const getSentimentBadge = () => {
    if (!post.sentiment || post.sentiment === 'neutral') return null;

    if (post.sentiment === 'bullish') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-full text-xs font-medium">
          <TrendingUp className="w-3 h-3" />
          Bullish
        </span>
      );
    }

    if (post.sentiment === 'bearish') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger/20 text-danger rounded-full text-xs font-medium">
          <TrendingDown className="w-3 h-3" />
          Bearish
        </span>
      );
    }

    return null;
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <>
    <Card className="bg-card border-border hover:border-border/80 transition-colors">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between gap-2">
          {/* User Info & Asset */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar
              className="w-8 h-8 sm:w-10 sm:h-10 bg-muted text-foreground flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (post.userId?._id) navigate(`/profile/${post.userId._id}`);
              }}
            >
              {post.userId?.avatar ? (
                <img src={post.userId.avatar} alt={post.userId.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs sm:text-sm">{post.userId?.name?.charAt(0) || 'U'}</span>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h4
                  className="text-foreground font-medium text-sm sm:text-base truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.userId?._id) navigate(`/profile/${post.userId._id}`);
                  }}
                >
                  {post.userId?.name || 'Unknown User'}
                </h4>
                <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">•</span>
                <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">{formatTime(post.createdAt)}</span>
                <span className="flex-shrink-0">{getVisibilityIcon()}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                {post.asset?.image && (
                  <img
                    src={post.asset.image}
                    alt={post.asset?.symbol || 'Asset'}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  />
                )}
                <span className="text-primary text-xs sm:text-sm font-medium">
                  ${post.asset?.symbol || 'N/A'}
                </span>
                <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">{post.asset?.name || 'Unknown'}</span>
                <span className="text-xs text-muted-foreground px-1.5 sm:px-2 py-0.5 bg-muted rounded">
                  {post.asset?.type || 'unknown'}
                </span>
                {getSentimentBadge()}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border">
                <DropdownMenuItem
                  onClick={() => setShowEditDialog(true)}
                  disabled={loading}
                  className="hover:bg-muted cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Content */}
        <p className="text-card-foreground whitespace-pre-wrap text-sm sm:text-base">{post.content || ''}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick && onTagClick(tag)}
                className="text-xs sm:text-sm text-primary hover:text-primary-light cursor-pointer hover:underline transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                ? 'grid-cols-2'
                : post.images.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            {post.images.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg ${
                  post.images.length === 1 ? 'aspect-video' : 'aspect-square'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(image.url, '_blank')}
                />
              </div>
            ))}
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={loading}
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-danger transition-colors group"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  liked ? 'fill-danger text-danger' : 'group-hover:scale-110'
                }`}
              />
              <span className="text-xs sm:text-sm">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => onCommentClick && onCommentClick(post)}
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-all" />
              <span className="text-xs sm:text-sm">{post.commentsCount || 0}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-success transition-colors group"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-all" />
              <span className="text-xs sm:text-sm">{sharesCount}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Edit Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl bg-popover border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Content
            </label>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind about this asset?"
              className="min-h-[120px] bg-card border-border text-foreground"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="trading, bullish, analysis"
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Visibility
            </label>
            <Select value={editVisibility} onValueChange={setEditVisibility}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
                <SelectItem value="private">Private - Only Me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={loading}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={loading || !editContent.trim()}
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Delete Post?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {loading ? 'Deleting...' : 'Delete Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default PostCard;
