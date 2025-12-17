import { useCallback } from 'react';
import axios from 'axios';

// Custom event name for onboarding updates
export const ONBOARDING_UPDATE_EVENT = 'onboarding:taskCompleted';

/**
 * Dispatch event to notify widget of task completion
 */
const notifyOnboardingUpdate = () => {
  window.dispatchEvent(new CustomEvent(ONBOARDING_UPDATE_EVENT));
};

/**
 * Hook for tracking onboarding task completion from the client-side
 * Used for tasks that can't be tracked on the backend (like viewing analytics tab)
 */
export function useOnboardingTracker() {
  const completeTask = useCallback(async (taskId) => {
    try {
      const response = await axios.post(`/onboarding/task/${taskId}`);
      // Notify the widget to refresh
      notifyOnboardingUpdate();
      return true;
    } catch (error) {
      // Silently fail - onboarding tracking shouldn't break the app
      console.error('Failed to complete onboarding task:', error);
      return false;
    }
  }, []);

  return { completeTask };
}

export default useOnboardingTracker;
