import React, { useState, useEffect } from 'react';
import { X, Hash, Globe, Lock, Users, TrendingUp, TrendingDown, Search, ImagePlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
 * Clean, simple form for creating new posts with image upload
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
  const handleImageChange = (e) => {
    console.log('🖼️ Image selection triggered');
    const files = Array.from(e.target.files);
    console.log('📁 Files selected:', files.length, files);

    if (files.length === 0) {
      console.log('⚠️ No files selected');
      return;
    }

    // Validate max 4 images
    if (files.length + selectedImages.length > 4) {
      console.log('❌ Too many images:', files.length + selectedImages.length);
      setError(t('feed.postForm.errors.maxImages') || 'Maximum 4 images allowed');
      e.target.value = '';
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      console.log('❌ Invalid file types:', invalidFiles);
      setError('Only JPEG, PNG, and WebP images are allowed');
      e.target.value = '';
      return;
    }

    // Validate file sizes (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      console.log('❌ Files too large:', oversizedFiles);
      setError('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    // Update selected images
    const newImages = [...selectedImages, ...files].slice(0, 4);
    setSelectedImages(newImages);
    console.log('✅ Updated selectedImages:', newImages.length);

    // Create preview URLs
    const newFilePreviews = files.map(file => {
      const url = URL.createObjectURL(file);
      console.log('🎨 Created preview URL:', url);
      return url;
    });
    const allPreviews = [...imagePreviews, ...newFilePreviews].slice(0, 4);
    setImagePreviews(allPreviews);
    console.log('✅ Updated imagePreviews:', allPreviews);

    setError('');
    e.target.value = '';
  };

  /**
   * Remove selected image
   */
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  /**
   * Cleanup preview URLs on unmount
   */
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
    console.log('📤 Form submission started');
    console.log('📊 Form data:', formData);
    console.log('🖼️ Selected images:', selectedImages.length, selectedImages);

    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.asset.symbol || !formData.asset.name) {
        throw new Error(t('feed.postForm.errors.selectAsset'));
      }
      if (!formData.content.trim()) {
        throw new Error(t('feed.postForm.errors.contentRequired'));
      }
      if (formData.content.length > 5000) {
        throw new Error(t('feed.postForm.errors.contentTooLong'));
      }

      console.log('✅ Validation passed, calling API with images:', selectedImages.length);

      // Call API with images
      const response = await postService.createPost(formData, selectedImages);

      console.log('✅ Post created - Full response:', response);
      console.log('📝 Post created - Post data:', response.data);
      console.log('🖼️ Images in response:', response.data.images?.length || 0);

      // Cleanup preview URLs after successful submission
      imagePreviews.forEach(url => URL.revokeObjectURL(url));

      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error('❌ Error creating post:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || t('feed.postForm.errors.createFailed'));
    } finally {
      setLoading(false);
      console.log('📤 Form submission ended');
    }
  };

  const filteredCrypto = filterAssets(marketAssets.crypto);
  const filteredStocks = filterAssets(marketAssets.stocks);

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col max-h-[calc(100vh-200px)]">
      {/* Scrollable Form Area */}
      <div className="overflow-y-auto px-6 py-4">
        <div className="space-y-6">

          {/* Asset Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.postForm.selectAssetRequired')}</Label>

            {!formData.asset.symbol ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssetSelector(true)}
                disabled={!!preselectedAsset}
                className="w-full justify-start h-12"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('feed.postForm.chooseAsset')}
              </Button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                {formData.asset.image && (
                  <img
                    src={formData.asset.image}
                    alt={formData.asset.symbol}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">${formData.asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{formData.asset.name}</div>
                </div>
                {!preselectedAsset && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      asset: { symbol: '', name: '', type: 'crypto', image: '' },
                    }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sentiment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.postForm.sentiment')}</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={formData.sentiment === 'bullish' ? 'default' : 'outline'}
                onClick={() => handleSentimentChange('bullish')}
                className={formData.sentiment === 'bullish' ? 'bg-success hover:bg-success/90' : ''}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('feed.postForm.bullish')}
              </Button>
              <Button
                type="button"
                variant={formData.sentiment === 'bearish' ? 'default' : 'outline'}
                onClick={() => handleSentimentChange('bearish')}
                className={formData.sentiment === 'bearish' ? 'bg-danger hover:bg-danger/90' : ''}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                {t('feed.postForm.bearish')}
              </Button>
              <Button
                type="button"
                variant={formData.sentiment === 'neutral' ? 'default' : 'outline'}
                onClick={() => handleSentimentChange('neutral')}
              >
                {t('feed.postForm.neutral')}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.postForm.content')}</Label>
            <textarea
              rows={6}
              placeholder={t('feed.postForm.contentPlaceholder')}
              value={formData.content}
              onChange={handleContentChange}
              required
              maxLength={5000}
              className="w-full px-4 py-3 bg-background border rounded-lg resize-none focus:ring-2 focus:ring-primary"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.content.length} / 5000
            </div>
          </div>

          {/* Image Upload - REDESIGNED */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t('feed.postForm.images') || 'Images'}</Label>
              <span className="text-xs text-muted-foreground font-medium">
                {selectedImages.length} / 4
              </span>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-video group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onLoad={() => console.log(`✅ Image ${index + 1} loaded`)}
                      onError={() => console.error(`❌ Image ${index + 1} failed`)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1.5 hover:scale-110 transition-transform shadow-lg"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {selectedImages.length < 4 && (
              <div>
                <input
                  type="file"
                  id="images-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Label
                  htmlFor="images-upload"
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <span className="font-medium">{t('feed.postForm.addImages') || 'Add Images'}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('feed.postForm.imageHint') || 'PNG, JPG, WebP - Max 5MB each'}
                  </span>
                </Label>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.postForm.tags')}</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t('feed.postForm.tagsPlaceholder')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTag(e);
                }}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Hash className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('feed.postForm.visibility')}</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, visibility: value }))}
            >
              <SelectTrigger>
                <SelectValue />
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
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer with Actions */}
      <div className="border-t px-6 py-4 bg-muted/30">
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {t('feed.postForm.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || !formData.asset.symbol}
            className="min-w-[120px]"
          >
            {loading ? t('feed.postForm.posting') : t('feed.postForm.post')}
          </Button>
        </div>
      </div>

      {/* Asset Selector Modal - Inside Dialog */}
      {showAssetSelector && (
        <div className="absolute inset-0 bg-background z-50 flex flex-col">
          <div className="w-full h-full overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{t('feed.postForm.selectAsset')}</h3>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('feed.postForm.searchAssets')}
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={activeAssetTab} onValueChange={setActiveAssetTab} className="w-full">
              <div className="px-4 pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crypto">
                    {t('feed.postForm.cryptocurrency')} ({filteredCrypto.length})
                  </TabsTrigger>
                  <TabsTrigger value="stocks">
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
                        filteredCrypto.map((crypto) => (
                          <button
                            key={crypto.id}
                            type="button"
                            onClick={() => handleAssetSelect(crypto, 'crypto')}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors w-full text-left"
                          >
                            {crypto.image && (
                              <img src={crypto.image} alt={crypto.symbol} className="w-8 h-8 rounded-full" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{crypto.symbol}</div>
                              <p className="text-sm text-muted-foreground truncate">{crypto.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">${crypto.price?.toLocaleString() || 'N/A'}</p>
                              <p className={`text-xs ${crypto.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                {crypto.change24h?.toFixed(2)}%
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="stocks" className="mt-0 space-y-2">
                      {filteredStocks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">{t('feed.postForm.noStocks')}</div>
                      ) : (
                        filteredStocks.map((stock) => (
                          <button
                            key={stock.symbol}
                            type="button"
                            onClick={() => handleAssetSelect(stock, 'stock')}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors w-full text-left"
                          >
                            {stock.image && (
                              <img src={stock.image} alt={stock.symbol} className="w-8 h-8 rounded-full" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{stock.symbol}</div>
                              <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">${stock.price?.toLocaleString() || 'N/A'}</p>
                              <p className={`text-xs ${stock.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                {stock.change24h?.toFixed(2)}%
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </form>
  );
};

export default PostCreationForm;
