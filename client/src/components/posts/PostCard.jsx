import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, Globe, Users, Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/post.service';
import { formatDistanceToNow } from 'date-fns';

/**
 * PostCard Component
 * Displays a single post with interactions (like, comment, share) and sentiment
 */
const PostCard = ({ post, onPostDeleted, onPostUpdated, onCommentClick }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [loading, setLoading] = useState(false);

  const isAuthor = user && post.userId?._id === user._id;

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
          title: `${post.userId?.name || 'User'}'s post about ${post.asset.symbol}`,
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
   * Handle delete post
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setLoading(true);
      await postService.deletePost(post._id);
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
    <Card className="bg-card border-border hover:border-border/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* User Info & Asset */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-muted text-foreground">
              {post.userId?.avatar ? (
                <img src={post.userId.avatar} alt={post.userId.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm">{post.userId?.name?.charAt(0) || 'U'}</span>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-foreground font-medium">{post.userId?.name || 'Unknown User'}</h4>
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-muted-foreground text-sm">{formatTime(post.createdAt)}</span>
                {getVisibilityIcon()}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {post.asset.image && (
                  <img
                    src={post.asset.image}
                    alt={post.asset.symbol}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span className="text-primary text-sm font-medium">
                  ${post.asset.symbol}
                </span>
                <span className="text-muted-foreground text-sm">{post.asset.name}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                  {post.asset.type}
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
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content */}
        <p className="text-card-foreground whitespace-pre-wrap">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-primary hover:text-primary-light cursor-pointer"
              >
                #{tag}
              </span>
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
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={loading}
              className="flex items-center gap-2 text-muted-foreground hover:text-danger transition-colors group"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  liked ? 'fill-danger text-danger' : 'group-hover:scale-110'
                }`}
              />
              <span className="text-sm">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => onCommentClick && onCommentClick(post)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-all" />
              <span className="text-sm">{post.commentsCount || 0}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-muted-foreground hover:text-success transition-colors group"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-all" />
              <span className="text-sm">{sharesCount}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
