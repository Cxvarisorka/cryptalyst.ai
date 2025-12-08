import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, TrendingUp, DollarSign, Globe, Loader2, RefreshCw, Search, Filter } from 'lucide-react';
import { FadeIn } from '@/components/magicui/fade-in';
import Hero from '@/components/layout/Hero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [displayedNews, setDisplayedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [limit, setLimit] = useState(30);
  const [displayLimit, setDisplayLimit] = useState(12);

  const categories = [
    { id: 'all', name: 'All News', icon: Globe, filter: 'general' },
    { id: 'crypto', name: 'Crypto', icon: TrendingUp, filter: 'crypto' },
    { id: 'stock', name: 'Stocks', icon: DollarSign, filter: 'stocks' },
    { id: 'political', name: 'Political', icon: Newspaper, filter: 'political' },
  ];

  const fetchNews = async (category = 'all', isRefresh = false, customLimit = 30) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await newsService.getNews(category, customLimit);
      setNews(data);
      setDisplayLimit(12);
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
    fetchNews(activeCategory, false, limit);
  }, [activeCategory, limit]);

  // Filter news based on search, symbol, and sentiment
  useEffect(() => {
    let filtered = [...news];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Symbol filter
    if (symbolFilter) {
      filtered = filtered.filter((article) =>
        article.entities?.some(
          (entity) =>
            entity.symbol?.toLowerCase().includes(symbolFilter.toLowerCase()) ||
            entity.name?.toLowerCase().includes(symbolFilter.toLowerCase())
        )
      );
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter((article) => article.sentiment === sentimentFilter);
    }

    setDisplayedNews(filtered);
  }, [news, searchQuery, symbolFilter, sentimentFilter]);

  const handleRefresh = () => {
    fetchNews(activeCategory, true, limit);
  };

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 12);
  };

  const handleRequestMore = () => {
    setLoadingMore(true);
    setLimit((prev) => prev + 30);
    setTimeout(() => setLoadingMore(false), 500);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSymbolFilter('');
    setSentimentFilter('all');
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

          {/* Filters Section */}
          <div className="mb-6 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Filters</h3>
              {(searchQuery || symbolFilter || sentimentFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Symbol Filter */}
              <div>
                <Input
                  type="text"
                  placeholder="Filter by symbol (e.g., BTC, AAPL)..."
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value)}
                />
              </div>

              {/* Sentiment Filter */}
              <div>
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>

            {/* Filter Results Count */}
            {(searchQuery || symbolFilter || sentimentFilter !== 'all') && (
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {displayedNews.length} of {news.length} articles
              </div>
            )}
          </div>

          {/* News Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading news...</p>
              </div>
            </div>
          ) : displayedNews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedNews.slice(0, displayLimit).map((article, index) => (
                  <NewsCard key={article.uuid || index} article={article} />
                ))}
              </div>

              {/* Load More Section */}
              {displayLimit < displayedNews.length && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    Load More ({displayedNews.length - displayLimit} remaining)
                  </Button>
                </div>
              )}

              {/* Request More News */}
              {displayLimit >= displayedNews.length && displayedNews.length >= limit - 5 && (
                <div className="mt-8 text-center">
                  <div className="bg-muted/50 border border-border rounded-lg p-6">
                    <p className="text-muted-foreground mb-4">
                      You've seen all {displayedNews.length} articles. Want more?
                    </p>
                    <Button
                      onClick={handleRequestMore}
                      disabled={loadingMore}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Request 30 More Articles'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchQuery || symbolFilter || sentimentFilter !== 'all'
                  ? 'No news found matching your filters'
                  : 'No news available'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || symbolFilter || sentimentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Try refreshing or check back later'}
              </p>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
};

export default News;
