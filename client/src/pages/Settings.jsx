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
import { User, Lock, Settings as SettingsIcon, Mail, Globe, Calendar, Palette } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-10">
        <FadeIn className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>{t('settings.title')}</GradientText>
          </h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </FadeIn>

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
                      <img src={profile.avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover" />
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
            </div>
          </div>
      </Tabs>
      </div>
    </div>
  );
}
