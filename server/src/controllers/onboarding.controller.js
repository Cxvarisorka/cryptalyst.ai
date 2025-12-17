const User = require('../models/user.model');
const { completeOnboardingTask, getOnboardingStatus, TASK_LIST } = require('../services/onboarding.service');

/**
 * Get onboarding status
 * GET /api/onboarding
 */
exports.getOnboarding = async (req, res) => {
  try {
    const result = await getOnboardingStatus(req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Complete a specific task
 * POST /api/onboarding/task/:taskId
 */
exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!TASK_LIST.includes(taskId)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }

    const result = await completeOnboardingTask(req.user.id, taskId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dismiss onboarding widget
 * POST /api/onboarding/dismiss
 */
exports.dismissOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.onboarding) {
      user.onboarding = {};
    }

    user.onboarding.dismissedAt = new Date();
    user.markModified('onboarding');
    await user.save();

    res.json({ success: true, message: 'Onboarding dismissed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reset onboarding (for testing)
 * POST /api/onboarding/reset
 */
exports.resetOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.onboarding = {
      isCompleted: false,
      dismissedAt: null,
      tasks: {}
    };

    user.markModified('onboarding');
    await user.save();

    res.json({ success: true, message: 'Onboarding reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
