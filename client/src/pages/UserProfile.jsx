import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, Mail, Calendar, Eye, EyeOff, Wallet, BarChart3 } from "lucide-react";
import userService from "@/services/user.service";

export default function UserProfile() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getUserProfile(userId);

      if (response.data.isPrivate) {
        setIsPrivate(true);
        setProfile(response.data);
      } else {
        setProfile(response.data);
        setIsPrivate(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 403) {
        setIsPrivate(true);
        setProfile(error.response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 sm:mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('profile.back')}
          </Button>
          <Card className="bg-card border-border/60">
            <CardContent className="py-8 sm:py-12">
              <div className="text-center text-muted-foreground text-sm sm:text-base">
                {t('profile.notFound')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('profile.back')}
        </Button>

        <FadeIn className="space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <Card className="bg-card border-border/60">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-money flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">{profile.name}</h1>
                    {!isPrivate && profile.email && (
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{profile.email}</span>
                      </div>
                    )}
                    {profile.createdAt && (
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{t('profile.joined')} {formatDate(profile.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isPrivate ? (
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-muted w-full sm:w-auto justify-center sm:justify-start">
                      <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">{t('profile.privateAccount')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 w-full sm:w-auto justify-center sm:justify-start">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span className="text-xs sm:text-sm text-green-500">{t('profile.publicProfile')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Private Profile Message */}
          {isPrivate && (
            <Card className="bg-card border-border/60">
              <CardContent className="py-8 sm:py-12">
                <div className="text-center px-4">
                  <EyeOff className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    {t('profile.privateTitle')}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('profile.privateMessage', { name: profile.name })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Section */}
          {!isPrivate && profile.portfolio && (
            <>
              {/* Portfolio Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      {t('profile.totalValue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                      {formatPrice(profile.portfolio.metrics.totalValue)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      {t('profile.change24h')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      profile.portfolio.metrics.dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {profile.portfolio.metrics.dayChangePercent >= 0 ? '+' : ''}
                      {profile.portfolio.metrics.dayChangePercent.toFixed(2)}%
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {formatPrice(Math.abs(profile.portfolio.metrics.dayChange))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      {t('profile.totalAssets')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                      {profile.portfolio.metrics.assetCount}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Holdings */}
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">{t('profile.holdings')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t('profile.holdingsDesc', { name: profile.name })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {profile.portfolio.assets.map((asset) => {
                      const value = (asset.price || 0) * (asset.quantity || 1);
                      const change = asset.change24h || 0;
                      const isPositive = change >= 0;

                      return (
                        <div
                          key={asset._id}
                          className="flex items-center justify-between rounded-md border border-border/60 p-2 sm:p-3 hover:bg-muted/30 transition-all duration-300 gap-2 sm:gap-3"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {asset.image && (
                              <img
                                src={asset.image}
                                alt={asset.name}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground truncate text-sm sm:text-base">
                                {asset.name}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {asset.quantity || 1} × {formatPrice(asset.price || 0)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-foreground text-sm sm:text-base">
                              {formatPrice(value)}
                            </div>
                            <div className={`text-xs sm:text-sm flex items-center justify-end gap-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* No Portfolio Shared Message */}
          {!isPrivate && !profile.portfolio && (
            <Card className="bg-card border-border/60">
              <CardContent className="py-8 sm:py-12">
                <div className="text-center px-4">
                  <Wallet className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    {t('profile.noPortfolio')}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('profile.noPortfolioMessage', { name: profile.name })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
