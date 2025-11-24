import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { Search, Users, TrendingUp, Loader2, Eye, EyeOff, Wallet } from "lucide-react";
import userService from "@/services/user.service";

export default function Community() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getPublicUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const response = await userService.getPublicUsers(searchQuery);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchUsers();
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <FadeIn className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-money flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <GradientText>{t("community.title")}</GradientText>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">{t("community.subtitle")}</p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="bg-card border-border/60">
            <CardContent className="pt-4 sm:pt-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("community.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    type="submit"
                    disabled={searching}
                    className="bg-gradient-money hover:opacity-90 h-10 sm:h-12 px-4 sm:px-6 flex-1 sm:flex-initial text-sm sm:text-base"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      t("community.search")
                    )}
                  </Button>
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearSearch}
                      className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                    >
                      {t("community.clear")}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Users Grid */}
        {users.length === 0 ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-8 sm:py-12">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-medium mb-2">{t("community.noUsers")}</p>
                <p className="text-sm">
                  {searchQuery
                    ? t("community.noUsersDesc")
                    : t("community.beFirst")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {users.map((user) => (
              <FadeIn key={user._id}>
                <Card
                  className="bg-card border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleViewProfile(user._id)}
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-money flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                          {user.name}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">
                          {user.email}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          {user.settings?.privacy?.profileVisibility === 'public' ? (
                            <div className="flex items-center gap-1 text-xs text-green-500">
                              <Eye className="w-3 h-3" />
                              <span>{t("community.public")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <EyeOff className="w-3 h-3" />
                              <span>{t("community.private")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {user.portfolioStats && (
                    <CardContent className="pt-3 sm:pt-4 border-t border-border/60">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{t("community.portfolioValue")}</span>
                          </div>
                          <span className="font-semibold text-foreground text-sm sm:text-base">
                            {formatPrice(user.portfolioStats?.totalValue || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{t("community.assets")}</span>
                          </div>
                          <span className="font-semibold text-foreground text-sm sm:text-base">
                            {user.portfolioStats?.assetCount || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  )}

                  {!user.portfolioStats && (
                    <CardContent className="pt-3 sm:pt-4 border-t border-border/60">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        {t("community.portfolioHidden")}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
