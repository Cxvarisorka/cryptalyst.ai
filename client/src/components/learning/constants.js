import {
  BookOpen,
  TrendingUp,
  Target,
  Zap,
  Star,
  Award,
  Trophy,
  Medal,
  Crown
} from 'lucide-react';

// XP amounts for different activities
export const XP_REWARDS = {
  lessonComplete: 25,
  courseComplete: 100,
  dailyStreak: 10,
  achievement: 50,
  quiz: 15
};

// Level titles with icons and colors
export const LEVEL_TITLES = {
  1: { name: 'Novice Trader', icon: BookOpen, color: 'text-slate-500' },
  2: { name: 'Apprentice Investor', icon: TrendingUp, color: 'text-green-500' },
  3: { name: 'Market Observer', icon: Target, color: 'text-blue-500' },
  4: { name: 'Chart Reader', icon: TrendingUp, color: 'text-cyan-500' },
  5: { name: 'Trend Spotter', icon: Zap, color: 'text-yellow-500' },
  6: { name: 'Technical Analyst', icon: Award, color: 'text-orange-500' },
  7: { name: 'Portfolio Manager', icon: Star, color: 'text-purple-500' },
  8: { name: 'Strategy Expert', icon: Trophy, color: 'text-pink-500' },
  9: { name: 'Trading Veteran', icon: Medal, color: 'text-red-500' },
  10: { name: 'Market Master', icon: Crown, color: 'text-amber-500' }
};

// All available achievements
export const ALL_ACHIEVEMENTS = [
  { id: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', xpReward: 50 },
  { id: 'first_course', name: 'Course Complete', description: 'Complete your first course', icon: '📚', xpReward: 100 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 75 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⚡', xpReward: 200 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', xpReward: 100 },
  { id: 'level_10', name: 'Expert Trader', description: 'Reach level 10', icon: '👑', xpReward: 250 },
  { id: 'lessons_10', name: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '📖', xpReward: 100 },
  { id: 'lessons_50', name: 'Knowledge Seeker', description: 'Complete 50 lessons', icon: '🎓', xpReward: 300 },
  { id: 'courses_3', name: 'Multi-skilled', description: 'Complete 3 courses', icon: '🏆', xpReward: 150 },
  { id: 'courses_10', name: 'Course Champion', description: 'Complete 10 courses', icon: '💎', xpReward: 500 }
];

// Helper to get level info
export const getLevelInfo = (level) => {
  const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) return LEVEL_TITLES[l];
  }
  return LEVEL_TITLES[1];
};
