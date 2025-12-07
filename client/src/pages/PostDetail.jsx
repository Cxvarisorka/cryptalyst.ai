import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PostCard from '@/components/posts/PostCard';
import postService from '@/services/post.service';
import { useTranslation } from 'react-i18next';

/**
 * PostDetail Page
 * Displays a single post with full details and comments
 */
export default function PostDetail() {
  const { t } = useTranslation();
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getPostById(postId);
      setPost(response.data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = () => {
    navigate('/feed');
  };

  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pt-20">
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <Card className="bg-card border-border/60">
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t('post.notFound') || 'Post Not Found'}
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => navigate('/feed')} className="bg-primary hover:bg-primary-dark">
                  {t('post.goToFeed') || 'Go to Feed'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pt-20">
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        {post && (
          <PostCard
            post={post}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
            onCommentClick={() => {}}
          />
        )}
      </div>
    </div>
  );
}
