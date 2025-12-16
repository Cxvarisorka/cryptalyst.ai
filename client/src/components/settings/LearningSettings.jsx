import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import settingsService from '@/services/settings.service';
import {
  Target,
  Clock,
  Bell,
  Volume2,
  Sparkles,
  Award,
  Loader2,
  Calendar
} from 'lucide-react';
import { XPAchievements } from '@/components/learning';

const LearningSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState({
    dailyGoal: 15,
    reminderEnabled: true,
    reminderTime: '09:00',
    showLeaderboard: true,
    soundEffects: true,
    celebrationAnimations: true
  });

  const loadLearningStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsService.getLearningStats();
      if (response.success && response.stats) {
        setStats(response.stats);
        if (response.stats.preferences) {
          setPreferences(prev => ({
            ...prev,
            ...response.stats.preferences
          }));
        }
      }
    } catch (error) {
      console.error('Error loading learning stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning stats. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLearningStats();
  }, [loadLearningStats]);

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      await settingsService.updateLearning({ preferences });
      toast({
        title: 'Success!',
        description: 'Learning preferences updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update learning preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* XP & Achievements Component */}
      <XPAchievements
        stats={stats}
        loading={loading}
        onRefresh={loadLearningStats}
        showXPRewards={true}
      />

      {/* Learning Preferences Card */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Daily Goal */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Daily Learning Goal
              </Label>
              <div className="flex items-center gap-4 flex-wrap">
                {[5, 10, 15, 30, 60].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setPreferences({ ...preferences, dailyGoal: minutes })}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      preferences.dailyGoal === minutes
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reminder */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Daily Reminders</Label>
                    <p className="text-sm text-muted-foreground mt-1">Get notified to maintain your streak</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reminderEnabled}
                  onChange={(e) => setPreferences({ ...preferences, reminderEnabled: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground mt-1">Play sounds on XP gains and level ups</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => setPreferences({ ...preferences, soundEffects: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>

              {/* Celebration Animations */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Celebration Animations</Label>
                    <p className="text-sm text-muted-foreground mt-1">Show confetti on achievements</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.celebrationAnimations}
                  onChange={(e) => setPreferences({ ...preferences, celebrationAnimations: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>

              {/* Show Leaderboard */}
              <div className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-semibold">Show on Leaderboard</Label>
                    <p className="text-sm text-muted-foreground mt-1">Compete with other learners</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.showLeaderboard}
                  onChange={(e) => setPreferences({ ...preferences, showLeaderboard: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-input"
                />
              </div>
            </div>

            {/* Reminder Time */}
            {preferences.reminderEnabled && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Reminder Time
                </Label>
                <input
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                  className="h-11 w-full md:w-48 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handlePreferencesUpdate}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningSettings;
