import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import aiUsageService from '@/services/aiUsage.service';

/**
 * Custom hook for tracking AI usage
 * Provides usage stats, limit checks, and real-time updates
 */
export function useAIUsage() {
  const { user, isAuthenticated } = useAuth();
  const [usage, setUsage] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsage = useCallback(async () => {
    if (!isAuthenticated) {
      setUsage(null);
      setLimits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [statsResponse, limitsResponse] = await Promise.all([
        aiUsageService.getUsageStats(),
        aiUsageService.getPlanLimits()
      ]);

      if (statsResponse.success) {
        setUsage(statsResponse.data);
      }
      if (limitsResponse.success) {
        setLimits(limitsResponse.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch usage data');
      console.error('Error fetching AI usage:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Check if user can perform a specific analysis
  const checkCanAnalyze = useCallback(async (type) => {
    if (!isAuthenticated) {
      return { allowed: true, message: 'Sign in to track usage' };
    }

    try {
      const response = await aiUsageService.checkUsage(type);
      return response.data;
    } catch (err) {
      console.error('Error checking usage:', err);
      return { allowed: false, message: err.message };
    }
  }, [isAuthenticated]);

  // Update usage from API response (called after analysis completes)
  const updateUsage = useCallback((newUsage) => {
    if (newUsage) {
      setUsage(prev => ({
        ...prev,
        ...newUsage
      }));
    }
  }, []);

  // Calculate usage percentages for display
  const getUsagePercentages = useCallback(() => {
    if (!usage) return { daily: 0, monthly: 0 };

    return {
      daily: Math.min(100, (usage.dailyUsed / usage.dailyLimit) * 100),
      monthly: Math.min(100, (usage.monthlyUsed / usage.monthlyLimit) * 100)
    };
  }, [usage]);

  // Check if user is at or near limits
  const getLimitStatus = useCallback(() => {
    if (!usage) return { atDailyLimit: false, atMonthlyLimit: false, nearLimit: false };

    const dailyPercent = (usage.dailyUsed / usage.dailyLimit) * 100;
    const monthlyPercent = (usage.monthlyUsed / usage.monthlyLimit) * 100;

    return {
      atDailyLimit: usage.dailyRemaining <= 0,
      atMonthlyLimit: usage.monthlyRemaining <= 0,
      nearDailyLimit: dailyPercent >= 80 && usage.dailyRemaining > 0,
      nearMonthlyLimit: monthlyPercent >= 80 && usage.monthlyRemaining > 0,
      nearLimit: dailyPercent >= 80 || monthlyPercent >= 80
    };
  }, [usage]);

  // Fetch usage on mount and when auth changes
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    limits,
    loading,
    error,
    refetch: fetchUsage,
    checkCanAnalyze,
    updateUsage,
    getUsagePercentages,
    getLimitStatus,
    isAuthenticated
  };
}

export default useAIUsage;
