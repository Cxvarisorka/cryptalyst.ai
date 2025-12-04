import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/magicui/fade-in";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Wallet,
  BarChart3,
  UserPlus,
  UserMinus,
  Users,
  FileText,
  Briefcase,
} from "lucide-react";
import userService from "@/services/user.service";
import followService from "@/services/follow.service";
import portfolioCollectionService from "@/services/portfolioCollection.service";
import postService from "@/services/post.service";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/posts/PostCard";
import Hero from "@/components/layout/Hero";

export default function UserProfile() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [portfolioCollections, setPortfolioCollections] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchUserProfile();
    if (!isOwnProfile) {
      fetchFollowStats();
      checkFollowStatus();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getUserProfile(userId);
      setProfile(response.data);
      setIsPrivate(false);

      // Fetch portfolios and posts for all accessible profiles
      fetchPortfolioCollections();
      fetchUserPosts();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 403) {
        // Profile is private and user doesn't have access
        setIsPrivate(true);
        setProfile(error.response.data.data);
      } else if (error.response?.status === 404) {
        // User not found
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStats = async () => {
    try {
      const response = await followService.getFollowStats(userId);
      setFollowStats(response.data);
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await followService.checkFollowStatus(userId);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const fetchPortfolioCollections = async () => {
    try {
      const response = await portfolioCollectionService.getUserPublicCollections(userId);
      setPortfolioCollections(response.data || []);
    } catch (error) {
      console.error("Error fetching portfolio collections:", error);
    }
  };

  const fetchUserPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await postService.getFeed({ userId: userId, limit: 20 });
      setUserPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        setFollowStats((prev) => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setUserPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const fetchFollowers = async () => {
    setFollowListLoading(true);
    try {
      const response = await followService.getFollowers(userId, 1, 50);
      setFollowers(response.data || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setFollowListLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setFollowListLoading(true);
    try {
      const response = await followService.getFollowing(userId, 1, 50);
      setFollowing(response.data || []);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setFollowListLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "$0.00";
    }
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background pt-20">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          <Button onClick={() => navigate(-1)} variant="outline" className="mb-4 sm:mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("profile.back")}
          </Button>
          <Card className="bg-card border-border/60">
            <CardContent className="py-8 sm:py-12">
              <div className="text-center text-muted-foreground text-sm sm:text-base">
                {t("profile.notFound")}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const heroIcons = [
    { Icon: Users, gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={profile.name}
        subtitle={isPrivate ? t("profile.privateProfile") : isOwnProfile ? t("profile.yourProfile") : t("profile.userProfile")}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      >
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("profile.back")}
        </Button>
        {!isOwnProfile && !isPrivate && (
          <Button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={isFollowing ? "bg-muted hover:bg-muted/80" : "bg-gradient-money"}
          >
            {followLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isFollowing ? (
              <UserMinus className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {isFollowing ? t("profile.unfollow") : t("profile.follow")}
          </Button>
        )}
      </Hero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-10">

        <FadeIn className="space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <Card className="bg-card border-border/60">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-money flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground break-words">
                        {profile.name}
                      </h1>
                      {!isPrivate && profile.email && (
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{profile.email}</span>
                        </div>
                      )}
                      {profile.createdAt && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {t("profile.joined")} {formatDate(profile.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Follow Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="font-bold text-foreground">{followStats.followers}</span>
                        <span className="text-muted-foreground ml-1">{t("profile.followers")}</span>
                      </div>
                      <div>
                        <span className="font-bold text-foreground">{followStats.following}</span>
                        <span className="text-muted-foreground ml-1">{t("profile.following")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button and Status */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {!isOwnProfile && (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`w-full sm:w-auto ${
                          isFollowing
                            ? "bg-muted hover:bg-muted/80 text-foreground"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }`}
                      >
                        {followLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : isFollowing ? (
                          <UserMinus className="w-4 h-4 mr-2" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        {isFollowing ? t("profile.unfollow") : t("profile.follow")}
                      </Button>
                    )}
                    {isPrivate ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted w-full sm:w-auto justify-center">
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t("profile.privateAccount")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 w-full sm:w-auto justify-center">
                        <Eye className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">{t("profile.publicProfile")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Private Profile Message */}
          {isPrivate && (
            <Card className="bg-card border-border/60">
              <CardContent className="py-12">
                <div className="text-center px-4">
                  <EyeOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">{t("profile.privateTitle")}</h2>
                  <p className="text-base text-muted-foreground">
                    {t("profile.privateMessage", { name: profile.name })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Tabs */}
          {!isPrivate && (
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card border border-border/60">
                <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  {t("profile.posts")}
                </TabsTrigger>
                <TabsTrigger value="portfolios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t("profile.portfolios")}
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => {
                    if (followers.length === 0) fetchFollowers();
                    if (following.length === 0) fetchFollowing();
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t("profile.connections") || "Connections"}
                </TabsTrigger>
              </TabsList>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6 space-y-4">
                {postsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onPostDeleted={handlePostDeleted}
                        onCommentClick={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border/60">
                    <CardContent className="py-12">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">{t("profile.noPosts")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.noPostsMessage", { name: profile.name })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Portfolios Tab */}
              <TabsContent value="portfolios" className="mt-6 space-y-4">
                {portfolioCollections.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {portfolioCollections.map((collection) => (
                      <Card
                        key={collection._id}
                        className="bg-card border-border/60 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/portfolio/${collection._id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${collection.color}20` }}
                              >
                                <Briefcase className="w-6 h-6" style={{ color: collection.color }} />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{collection.name}</CardTitle>
                                <CardDescription className="text-sm">
                                  {collection.assetCount} {t("profile.assets")}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {collection.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{collection.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border/60">
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {t("profile.noPortfolios")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("profile.noPortfoliosMessage", { name: profile.name })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
