import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, TrendingUp, DollarSign, Globe, Loader2, RefreshCw } from 'lucide-react';
import { FadeIn } from '@/components/magicui/fade-in';
import Hero from '@/components/layout/Hero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { newsService } from '@/services/news.service';
import { useToast } from '@/components/ui/use-toast';

const NewsCard = ({ article }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
    >
      {article.image_url && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {article.entities && article.entities.length > 0 && (
            <>
              {article.entities.slice(0, 3).map((entity, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {entity.symbol || entity.name}
                </Badge>
              ))}
            </>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDate(article.published_at)}
          </span>
        </div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {article.description || article.snippet}
        </p>
        {article.source && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            {article.sentiment && (
              <Badge
                variant={
                  article.sentiment === 'negative'
                    ? 'destructive'
                    : 'secondary'
                }
                className={
                  article.sentiment === 'positive'
                    ? 'text-xs bg-green-500/10 text-green-600 border-green-500/20'
                    : 'text-xs'
                }
              >
                {article.sentiment}
              </Badge>
            )}
          </div>
        )}
      </div>
    </a>
  );
};

const News = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All News', icon: Globe, filter: 'general' },
    { id: 'crypto', name: 'Crypto', icon: TrendingUp, filter: 'crypto' },
    { id: 'stock', name: 'Stocks', icon: DollarSign, filter: 'stocks' },
    { id: 'political', name: 'Political', icon: Newspaper, filter: 'political' },
  ];

  const fetchNews = async (category = 'all', isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await newsService.getNews(category);
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch news',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const handleRefresh = () => {
    fetchNews(activeCategory, true);
  };

  const heroIcons = [
    { Icon: Newspaper, gradient: 'bg-gradient-to-r from-blue-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t('news.title') || 'Market News'}
        subtitle={t('news.subtitle') || 'Stay updated with the latest crypto, stock market, and political news'}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          {/* Category Tabs */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1">
              <TabsList className="bg-muted/60 w-full h-auto flex flex-wrap justify-start gap-1 p-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex items-center gap-2 text-sm flex-1 min-w-[100px]"
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
              title="Refresh news"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* News Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading news...</p>
              </div>
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, index) => (
                <NewsCard key={article.uuid || index} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No news available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try refreshing or check back later
              </p>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
};

export default News;
