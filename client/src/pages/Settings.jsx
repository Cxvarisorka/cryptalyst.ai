import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { GradientText } from "@/components/magicui/gradient-text";
import { FadeIn } from "@/components/magicui/fade-in";
import settingsService from "@/services/settings.service";
import { User, Lock, Settings as SettingsIcon, Mail, Globe, Calendar, Palette, Shield, Eye, EyeOff, CreditCard } from "lucide-react";
import Hero from "@/components/layout/Hero";
import SubscriptionManagement from "@/components/settings/SubscriptionManagement";

export default function Settings() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: ""
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [preferences, setPreferences] = useState({
    currency: "USD",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    theme: "system"
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showPortfolio: false,
    dataSharing: false
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || ""
      });
      setPreferences({
        currency: user.settings?.currency || "USD",
        timezone: user.settings?.timezone || "UTC",
        dateFormat: user.settings?.dateFormat || "MM/DD/YYYY",
        theme: user.settings?.theme || "system"
      });
      setPrivacy({
        profileVisibility: user.settings?.privacy?.profileVisibility || "private",
        showPortfolio: user.settings?.privacy?.showPortfolio || false,
        dataSharing: user.settings?.privacy?.dataSharing || false
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.updateProfile(profile);
      await refreshUser();
      toast({
        title: t('settings.common.success'),
        description: t('settings.profile.success')
      });
    } catch (error) {
      toast({
        title: t('settings.common.error'),
        description: error.response?.data?.message || t('settings.profile.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast({
        title: t('settings.common.error'),
        description: t('settings.security.passwordMismatch'),
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      await settingsService.updatePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: t('settings.common.success'),
        description: t('settings.security.success')
      });
    } catch (error) {
      toast({
        title: t('settings.common.error'),
        description: error.response?.data?.message || t('settings.security.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.updatePreferences(preferences);
      await refreshUser();
      toast({
        title: t('settings.common.success'),
        description: t('settings.preferences.success')
      });
    } catch (error) {
      toast({
        title: t('settings.common.error'),
        description: error.response?.data?.message || t('settings.preferences.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.updatePrivacy(privacy);
      await refreshUser();
      toast({
        title: t('settings.common.success'),
        description: 'Privacy settings updated successfully'
      });
    } catch (error) {
      toast({
        title: t('settings.common.error'),
        description: error.response?.data?.message || 'Failed to update privacy settings',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const heroIcons = [
    { Icon: SettingsIcon, gradient: 'bg-gradient-to-r from-purple-500 to-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <TabsList className="flex flex-col lg:flex-col h-fit bg-card/50 border border-border/60 p-2 gap-2">
              <TabsTrigger
                value="profile"
                className="w-full justify-start gap-3 data-[state=active]:bg-gradient-money data-[state=active]:text-white"
              >
                <User size={18} />
                <span>{t('settings.tabs.profile')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="w-full justify-start gap-3 data-[state=active]:bg-gradient-money data-[state=active]:text-white"
              >
                <Lock size={18} />
                <span>{t('settings.tabs.security')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="w-full justify-start gap-3 data-[state=active]:bg-gradient-money data-[state=active]:text-white"
              >
                <SettingsIcon size={18} />
                <span>{t('settings.tabs.preferences')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="w-full justify-start gap-3 data-[state=active]:bg-gradient-money data-[state=active]:text-white"
              >
                <Shield size={18} />
                <span>{t('settings.tabs.privacy')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="w-full justify-start gap-3 data-[state=active]:bg-gradient-money data-[state=active]:text-white"
              >
                <CreditCard size={18} />
                <span>Subscription</span>
              </TabsTrigger>
            </TabsList>

            <div className="lg:col-span-3">

        <TabsContent value="profile">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{t('settings.profile.title')}</CardTitle>
                  <CardDescription>{t('settings.profile.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User size={16} className="text-muted-foreground" />
                      {t('settings.profile.name')}
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder={t('settings.profile.namePlaceholder')}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      {t('settings.profile.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder={t('settings.profile.emailPlaceholder')}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="flex items-center gap-2">
                    <Globe size={16} className="text-muted-foreground" />
                    {t('settings.profile.avatar')}
                  </Label>
                  <Input
                    id="avatar"
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    placeholder={t('settings.profile.avatarPlaceholder')}
                    className="h-11"
                  />
                  {profile.avatar && (
                    <div className="flex items-center gap-3 mt-3 p-3 bg-muted/50 rounded-lg">
                      <img src={profile.avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <span className="text-sm text-muted-foreground">{t('settings.profile.avatarPreview')}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="bg-gradient-money hover:opacity-90">
                    {loading ? t('settings.profile.saving') : t('settings.profile.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{t('settings.security.title')}</CardTitle>
                  <CardDescription>{t('settings.security.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {user?.oauthProvider ? (
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Lock size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('settings.security.oauthAccount')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.security.oauthNotice').replace('{provider}', user.oauthProvider)}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="flex items-center gap-2">
                      <Lock size={16} className="text-muted-foreground" />
                      {t('settings.security.currentPassword')}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={password.currentPassword}
                      onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                      placeholder={t('settings.security.currentPasswordPlaceholder')}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="flex items-center gap-2">
                        <Lock size={16} className="text-muted-foreground" />
                        {t('settings.security.newPassword')}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={password.newPassword}
                        onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                        placeholder={t('settings.security.newPasswordPlaceholder')}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <Lock size={16} className="text-muted-foreground" />
                        {t('settings.security.confirmPassword')}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={password.confirmPassword}
                        onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                        placeholder={t('settings.security.confirmPasswordPlaceholder')}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={loading} className="bg-gradient-money hover:opacity-90">
                      {loading ? t('settings.security.updating') : t('settings.security.updatePassword')}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{t('settings.preferences.title')}</CardTitle>
                  <CardDescription>{t('settings.preferences.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="flex items-center gap-2">
                      <Globe size={16} className="text-muted-foreground" />
                      {t('settings.preferences.currency')}
                    </Label>
                    <select
                      id="currency"
                      className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    >
                      <option value="USD">{t('settings.preferences.currencies.usd')}</option>
                      <option value="EUR">{t('settings.preferences.currencies.eur')}</option>
                      <option value="GBP">{t('settings.preferences.currencies.gbp')}</option>
                      <option value="JPY">{t('settings.preferences.currencies.jpy')}</option>
                      <option value="CNY">{t('settings.preferences.currencies.cny')}</option>
                      <option value="INR">{t('settings.preferences.currencies.inr')}</option>
                      <option value="AUD">{t('settings.preferences.currencies.aud')}</option>
                      <option value="CAD">{t('settings.preferences.currencies.cad')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      {t('settings.preferences.dateFormat')}
                    </Label>
                    <select
                      id="dateFormat"
                      className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme" className="flex items-center gap-2">
                    <Palette size={16} className="text-muted-foreground" />
                    {t('settings.preferences.theme')}
                  </Label>
                  <select
                    id="theme"
                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  >
                    <option value="light">{t('settings.preferences.themes.light')}</option>
                    <option value="dark">{t('settings.preferences.themes.dark')}</option>
                    <option value="system">{t('settings.preferences.themes.system')}</option>
                  </select>
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="bg-gradient-money hover:opacity-90">
                    {loading ? t('settings.preferences.saving') : t('settings.preferences.savePreferences')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-money flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{t('privacy.title')}</CardTitle>
                  <CardDescription>{t('privacy.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePrivacyUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-lg border border-border/60 bg-muted/30">
                    <div className="flex items-start gap-3 flex-1">
                      {privacy.profileVisibility === 'public' ? (
                        <Eye size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <EyeOff size={20} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="profileVisibility" className="text-sm sm:text-base font-semibold">
                          {t('privacy.profileVisibility')}
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {t('privacy.profileVisibilityDesc')}
                        </p>
                      </div>
                    </div>
                    <select
                      id="profileVisibility"
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto sm:ml-4"
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    >
                      <option value="public">{t('privacy.public')}</option>
                      <option value="private">{t('privacy.private')}</option>
                    </select>
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border border-border/60 bg-muted/30">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="showPortfolio" className="text-sm sm:text-base font-semibold">
                          {t('privacy.showPortfolio')}
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {t('privacy.showPortfolioDesc')}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="showPortfolio"
                      checked={privacy.showPortfolio}
                      onChange={(e) => setPrivacy({ ...privacy, showPortfolio: e.target.checked })}
                      disabled={privacy.profileVisibility === 'private'}
                      className="mt-1 h-5 w-5 rounded border-input focus:ring-2 focus:ring-primary disabled:opacity-50 flex-shrink-0"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border border-border/60 bg-muted/30">
                    <div className="flex items-start gap-3 flex-1">
                      <Globe size={20} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="dataSharing" className="text-sm sm:text-base font-semibold">
                          {t('privacy.dataSharing')}
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {t('privacy.dataSharingDesc')}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="dataSharing"
                      checked={privacy.dataSharing}
                      onChange={(e) => setPrivacy({ ...privacy, dataSharing: e.target.checked })}
                      className="mt-1 h-5 w-5 rounded border-input focus:ring-2 focus:ring-primary flex-shrink-0"
                    />
                  </div>
                </div>

                {privacy.profileVisibility === 'public' && (
                  <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <Eye size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground mb-1 text-sm sm:text-base">{t('privacy.publicNotice')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('privacy.publicNoticeDesc', { portfolio: privacy.showPortfolio ? t('privacy.publicNoticePortfolio') : '' }).replace('{portfolio}', privacy.showPortfolio ? t('privacy.publicNoticePortfolio') : '')}
                      </p>
                    </div>
                  </div>
                )}

                {privacy.profileVisibility === 'private' && (
                  <div className="flex items-start gap-3 p-4 bg-muted border border-border/60 rounded-lg">
                    <EyeOff size={20} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground mb-1 text-sm sm:text-base">{t('privacy.privateNotice')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('privacy.privateNoticeDesc')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="bg-gradient-money hover:opacity-90">
                    {loading ? t('privacy.saving') : t('privacy.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManagement />
        </TabsContent>
            </div>
          </div>
      </Tabs>
      </div>
    </div>
  );
}
