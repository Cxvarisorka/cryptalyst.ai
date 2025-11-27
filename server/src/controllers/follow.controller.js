const Follow = require('../models/follow.model');
const User = require('../models/user.model');

/**
 * Follow a user
 */
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is trying to follow themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userId,
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user',
      });
    }

    // Create follow relationship
    const follow = new Follow({
      follower: req.user._id,
      following: userId,
    });

    await follow.save();

    res.status(201).json({
      success: true,
      message: 'Successfully followed user',
      data: follow,
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow user',
    });
  }
};

/**
 * Unfollow a user
 */
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: userId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this user',
      });
    }

    res.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
    });
  }
};

/**
 * Get followers of a user
 */
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({ following: userId });

    res.json({
      success: true,
      data: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers',
    });
  }
};

/**
 * Get users that a user is following
 */
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({ follower: userId });

    res.json({
      success: true,
      data: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following',
    });
  }
};

/**
 * Check if current user is following a specific user
 */
exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const isFollowing = await Follow.exists({
      follower: req.user._id,
      following: userId,
    });

    res.json({
      success: true,
      data: {
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check follow status',
    });
  }
};

/**
 * Get follow stats for a user (follower count, following count)
 */
exports.getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
    ]);

    res.json({
      success: true,
      data: {
        followers: followersCount,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error('Error fetching follow stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follow stats',
    });
  }
};
