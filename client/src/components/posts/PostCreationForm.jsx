import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Hash, Globe, Lock, Users, TrendingUp, TrendingDown, Search, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import postService from '../../services/post.service';
import { useAuth } from '../../contexts/AuthContext';
import { getMarketData } from '../../services/marketDataService';
import { useTranslation } from 'react-i18next';

/**
 * PostCreationForm Component
 * Form for creating new posts about coins/stocks with sentiment analysis
 */
const PostCreationForm = ({ onPostCreated, onCancel, preselectedAsset = null }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marketAssets, setMarketAssets] = useState({ crypto: [], stocks: [] });
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [activeAssetTab, setActiveAssetTab] = useState('crypto');

  // Form state
  const [formData, setFormData] = useState({
    asset: preselectedAsset || {
      symbol: '',
      name: '',
      type: 'crypto',
      image: '',
    },
    content: '',
    tags: [],
    visibility: 'public',
    sentiment: 'neutral',
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  /**
   * Load market data for asset selection
   */
  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoadingAssets(true);
      const data = await getMarketData();
      setMarketAssets(data);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  /**
   * Handle asset selection
   */
  const handleAssetSelect = (asset, type) => {
    setFormData((prev) => ({
      ...prev,
      asset: {
        symbol: asset.symbol,
        name: asset.name,
        type: type,
        image: asset.image || '',
      },
    }));
    setShowAssetSelector(false);
    setAssetSearch('');
  };

  /**
   * Filter assets by search
   */
  const filterAssets = (assets) => {
    if (!assetSearch) return assets;
    const search = assetSearch.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search)
    );
  };

  /**
   * Handle content change
   */
  const handleContentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  /**
   * Handle sentiment selection
   */
  const handleSentimentChange = (sentiment) => {
    setFormData((prev) => ({
      ...prev,
      sentiment,
    }));
  };

  /**
   * Handle image selection
   */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (selectedImages.length + files.length > 4) {
      setError(t('feed.postForm.errors.maxImages'));
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setError(t('feed.postForm.errors.onlyImages'));
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t('feed.postForm.errors.imageSize'));
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  /**
   * Remove selected image
   */
  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /**
   * Add tag
   */
  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();

    if (tag && !formData.tags.includes(tag)) {
      if (formData.tags.length >= 10) {
        setError(t('feed.postForm.errors.maxTags'));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
      setError('');
    }
  };

  /**
   * Remove tag
   */
  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.asset.symbol || !formData.asset.name) {
        throw new Error(t('feed.postForm.errors.selectAsset'));
      }
      if (!formData.content.trim()) {
        throw new Error(t('feed.postForm.errors.contentRequired'));
      }
      if (formData.content.length > 5000) {
        throw new Error(t('feed.postForm.errors.contentTooLong'));
      }

      const response = await postService.createPost(formData, selectedImages);

      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || err.message || t('feed.postForm.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filteredCrypto = filterAssets(marketAssets.crypto);
  const filteredStocks = filterAssets(marketAssets.stocks);

  return (
    <Card className="w-full bg-card border-border">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Selection */}
          <div className="space-y-2">
            <Label className="text-card-foreground">{t('feed.postForm.selectAssetRequired')}</Label>

            {!formData.asset.symbol ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssetSelector(true)}
                  disabled={!!preselectedAsset}
                  className="w-full justify-start border-border hover:bg-muted text-muted-foreground"
                >
                  {t('feed.postForm.chooseAsset')}
                </Button>

                {/* Asset Selector Modal */}
                {showAssetSelector && (
                  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[80vh] bg-card border-border overflow-hidden">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-foreground">{t('feed.postForm.selectAsset')}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAssetSelector(false);
                              setAssetSearch('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder={t('feed.postForm.searchAssets')}
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                            className="pl-10 bg-background border-border text-foreground"
                          />
                        </div>
                      </div>

                      {/* Tabs */}
                      <Tabs value={activeAssetTab} onValueChange={setActiveAssetTab} className="w-full">
                        <div className="px-4 pt-2">
                          <TabsList className="grid w-full grid-cols-2 bg-muted">
                            <TabsTrigger value="crypto" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                              {t('feed.postForm.cryptocurrency')} ({filteredCrypto.length})
                            </TabsTrigger>
                            <TabsTrigger value="stocks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                              {t('feed.stocks')} ({filteredStocks.length})
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <div className="overflow-y-auto max-h-[50vh] p-4">
                          {loadingAssets ? (
                            <div className="text-center py-8 text-muted-foreground">{t('feed.postForm.loadingAssets')}</div>
                          ) : (
                            <>
                              <TabsContent value="crypto" className="mt-0 space-y-2">
                                {filteredCrypto.length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground">{t('feed.postForm.noCrypto')}</div>
                                ) : (
                                  <div className="grid gap-2">
                                    {filteredCrypto.map((crypto) => (
                                      <button
                                        key={crypto.id}
                                        type="button"
                                        onClick={() => handleAssetSelect(crypto, 'crypto')}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                                      >
                                        {crypto.image && (
                                          <img
                                            src={crypto.image}
                                            alt={crypto.symbol}
                                            className="w-8 h-8 rounded-full"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{crypto.symbol}</span>
                                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                                              #{crypto.market_cap_rank || 'N/A'}
                                            </span>
                                          </div>
                                          <p className="text-sm text-muted-foreground truncate">{crypto.name}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-medium text-foreground">
                                            ${crypto.price?.toLocaleString() || 'N/A'}
                                          </p>
                                          <p className={`text-xs ${
                                            crypto.change24h >= 0
                                              ? 'text-success'
                                              : 'text-danger'
                                          }`}>
                                            {crypto.change24h?.toFixed(2)}%
                                          </p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="stocks" className="mt-0 space-y-2">
                                {filteredStocks.length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground">{t('feed.postForm.noStocks')}</div>
                                ) : (
                                  <div className="grid gap-2">
                                    {filteredStocks.map((stock) => (
                                      <button
                                        key={stock.symbol}
                                        type="button"
                                        onClick={() => handleAssetSelect(stock, 'stock')}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                                      >
                                        {stock.image && (
                                          <img
                                            src={stock.image}
                                            alt={stock.symbol}
                                            className="w-8 h-8 rounded-full"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{stock.symbol}</span>
                                          </div>
                                          <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-medium text-foreground">
                                            ${stock.price?.toLocaleString() || 'N/A'}
                                          </p>
                                          <p className={`text-xs ${
                                            stock.change24h >= 0
                                              ? 'text-success'
                                              : 'text-danger'
                                          }`}>
                                            {stock.change24h?.toFixed(2)}%
                                          </p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </TabsContent>
                            </>
                          )}
                        </div>
                      </Tabs>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                {formData.asset.image && (
                  <img
                    src={formData.asset.image}
                    alt={formData.asset.symbol}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-semibold text-lg">${formData.asset.symbol}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded">
                      {formData.asset.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formData.asset.name}</p>
                </div>
                {!preselectedAsset && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        asset: { symbol: '', name: '', type: 'crypto', image: '' },
                      }));
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sentiment Buttons */}
          <div className="space-y-2">
            <Label className="text-card-foreground">{t('feed.postForm.sentiment')}</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.sentiment === 'bullish' ? 'default' : 'outline'}
                onClick={() => handleSentimentChange('bullish')}
                className={`${
                  formData.sentiment === 'bullish'
                    ? 'bg-success hover:bg-success/90 text-success-foreground'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('feed.postForm.bullish')}
              </Button>
              <Button
                type="button"
                variant={formData.sentiment === 'bearish' ? 'default' : 'outline'}
                onClick={() => handleSentimentChange('bearish')}
                className={`${
                  formData.sentiment === 'bearish'
                    ? 'bg-danger hover:bg-danger/90 text-danger-foreground'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                {t('feed.postForm.bearish')}
              </Button>
              <Button
                type="button"
                variant={formData.sentiment === 'neutral' ? 'default' : 'outline'}
                onClick={() => handleSentimentChange('neutral')}
                className={`${
                  formData.sentiment === 'neutral'
                    ? 'bg-muted-foreground hover:bg-muted-foreground/90 text-background'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {t('feed.postForm.neutral')}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-card-foreground">
              {t('feed.postForm.content')}
            </Label>
            <textarea
              id="content"
              rows={6}
              placeholder={t('feed.postForm.contentPlaceholder')}
              value={formData.content}
              onChange={handleContentChange}
              required
              maxLength={5000}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="text-right text-sm text-muted-foreground">
              {formData.content.length} / 5000
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-card-foreground">{t('feed.postForm.images')}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image-upload').click()}
                disabled={selectedImages.length >= 4}
                className="border-border hover:bg-muted"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('feed.postForm.addImages')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedImages.length} / 4 {t('feed.postForm.selected')}
              </span>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-danger hover:bg-danger/90 rounded-full"
                    >
                      <X className="w-3 h-3 text-danger-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-card-foreground">{t('feed.postForm.tags')}</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                type="text"
                placeholder={t('feed.postForm.tagsPlaceholder')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e);
                  }
                }}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="border-border hover:bg-muted"
              >
                <Hash className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-light"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility" className="text-card-foreground">{t('feed.postForm.visibility')}</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, visibility: value }))
              }
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={t('feed.postForm.selectVisibility')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('feed.postForm.public')}
                  </div>
                </SelectItem>
                <SelectItem value="followers">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('feed.postForm.followersOnly')}
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('feed.postForm.private')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="border-border hover:bg-muted"
              >
                {t('feed.postForm.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || !formData.asset.symbol}
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              {loading ? t('feed.postForm.posting') : t('feed.postForm.post')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostCreationForm;
