import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Link2, Repeat2, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * ShareModal Component
 * Modal for sharing posts with multiple options (copy link, repost)
 */
const ShareModal = ({ isOpen, onClose, post, onShare, onRepost }) => {
  const { t } = useTranslation();
  const [shareComment, setShareComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reposted, setReposted] = useState(false);

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(postUrl);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Call onShare to increment share count
      if (onShare) {
        await onShare();
      }
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleRepost = async () => {
    try {
      setLoading(true);
      await onRepost(shareComment);
      setReposted(true);
      setTimeout(() => {
        setReposted(false);
        onClose();
        setShareComment('');
      }, 1500);
    } catch (error) {
      console.error('Error reposting:', error);
      alert(error.response?.data?.message || 'Failed to share post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setShareComment('');
      setCopied(false);
      setReposted(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('share.title') || 'Share Post'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link Option */}
          <Button
            onClick={handleCopyLink}
            disabled={copied}
            variant="outline"
            className="w-full justify-start h-auto py-3 border-border hover:bg-muted"
          >
            <div className="flex items-center gap-3 w-full">
              {copied ? (
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-success" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="text-left flex-1">
                <div className="font-semibold text-foreground">
                  {copied ? (t('share.linkCopied') || 'Link Copied!') : (t('share.copyLink') || 'Copy Link')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('share.copyLinkDesc') || 'Share the post via link'}
                </div>
              </div>
            </div>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-popover px-2 text-muted-foreground">{t('share.or') || 'or'}</span>
            </div>
          </div>

          {/* Repost to Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <Repeat2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {t('share.shareToTimeline') || 'Share to Your Timeline'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('share.shareToTimelineDesc') || 'Repost to your followers'}
                </div>
              </div>
            </div>

            {/* Optional Comment */}
            <Textarea
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value)}
              placeholder={t('share.addComment') || 'Add your thoughts... (optional)'}
              className="min-h-[80px] bg-card border-border text-foreground resize-none"
              maxLength={1000}
            />

            {/* Character count */}
            <div className="text-xs text-muted-foreground text-right">
              {shareComment.length}/1000
            </div>

            {/* Original Post Preview */}
            <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                {post.userId?.avatar && (
                  <img
                    src={post.userId.avatar}
                    alt={post.userId.name}
                    className="w-6 h-6 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="font-medium text-foreground">{post.userId?.name}</span>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                {post.content}
              </p>
            </div>

            {/* Share Button */}
            <Button
              onClick={handleRepost}
              disabled={loading || reposted}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              {reposted ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('share.shared') || 'Shared!'}
                </>
              ) : loading ? (
                t('share.sharing') || 'Sharing...'
              ) : (
                <>
                  <Repeat2 className="w-4 h-4 mr-2" />
                  {t('share.share') || 'Share'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
