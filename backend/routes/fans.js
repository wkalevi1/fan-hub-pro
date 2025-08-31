const express = require('express');
const router = express.Router();
const Fan = require('../models/Fan');

// GET /api/fans - Get all fans with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    const skip = (page - 1) * limit;
    
    let sortOptions = {};
    switch (sort) {
      case 'points':
        sortOptions = { points: -1, level: -1 };
        break;
      case 'level':
        sortOptions = { level: -1, points: -1 };
        break;
      case 'oldest':
        sortOptions = { joinedAt: 1 };
        break;
      default:
        sortOptions = { lastActive: -1 };
    }
    
    const fans = await Fan.find({})
      .select('-email') // Don't expose emails
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Fan.countDocuments();
    
    res.json({
      success: true,
      data: fans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fans:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching fans'
    });
  }
});

// GET /api/fans/top - Get top fans by points
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topFans = await Fan.getTopFans(parseInt(limit));
    
    res.json({
      success: true,
      data: topFans,
      type: 'top_fans'
    });
  } catch (error) {
    console.error('Error fetching top fans:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching top fans'
    });
  }
});

// GET /api/fans/recent - Get recently active fans
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const recentFans = await Fan.getRecentActive(parseInt(limit));
    
    res.json({
      success: true,
      data: recentFans,
      type: 'recent_active'
    });
  } catch (error) {
    console.error('Error fetching recent active fans:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching recent active fans'
    });
  }
});

// GET /api/fans/:id - Get single fan profile
router.get('/:id', async (req, res) => {
  try {
    const fan = await Fan.findById(req.params.id)
      .select('-email'); // Don't expose email
    
    if (!fan) {
      return res.status(404).json({
        success: false,
        error: 'Fan not found'
      });
    }
    
    res.json({
      success: true,
      data: fan
    });
  } catch (error) {
    console.error('Error fetching fan:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching fan'
    });
  }
});

// POST /api/fans - Create new fan profile
router.post('/', async (req, res) => {
  try {
    const { username, email, bio, location, socialMedia } = req.body;
    
    // Check if username already exists
    const existingFan = await Fan.findOne({ username });
    if (existingFan) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Fan.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
    }
    
    const fan = new Fan({
      username,
      email,
      bio,
      location,
      socialMedia: socialMedia || {}
    });
    
    await fan.save();
    
    // Remove email from response
    const fanResponse = fan.toObject();
    delete fanResponse.email;
    
    res.status(201).json({
      success: true,
      data: fanResponse,
      message: 'Fan profile created successfully'
    });
  } catch (error) {
    console.error('Error creating fan:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating fan profile'
    });
  }
});

// PUT /api/fans/:id - Update fan profile
router.put('/:id', async (req, res) => {
  try {
    const { bio, location, socialMedia, preferences } = req.body;
    
    const fan = await Fan.findById(req.params.id);
    if (!fan) {
      return res.status(404).json({
        success: false,
        error: 'Fan not found'
      });
    }
    
    // Update fields
    if (bio !== undefined) fan.bio = bio;
    if (location !== undefined) fan.location = location;
    if (socialMedia) fan.socialMedia = { ...fan.socialMedia, ...socialMedia };
    if (preferences) fan.preferences = { ...fan.preferences, ...preferences };
    
    fan.lastActive = new Date();
    await fan.save();
    
    // Remove email from response
    const fanResponse = fan.toObject();
    delete fanResponse.email;
    
    res.json({
      success: true,
      data: fanResponse,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating fan:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating fan profile'
    });
  }
});

// POST /api/fans/:id/activity - Update fan activity
router.post('/:id/activity', async (req, res) => {
  try {
    const fan = await Fan.findById(req.params.id);
    if (!fan) {
      return res.status(404).json({
        success: false,
        error: 'Fan not found'
      });
    }
    
    fan.lastActive = new Date();
    await fan.save();
    
    res.json({
      success: true,
      message: 'Activity updated'
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating activity'
    });
  }
});

// GET /api/fans/:id/stats - Get fan statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const fan = await Fan.findById(req.params.id);
    if (!fan) {
      return res.status(404).json({
        success: false,
        error: 'Fan not found'
      });
    }
    
    const stats = {
      level: fan.level,
      points: fan.points,
      badges: fan.badges.length,
      stats: fan.stats,
      joinedDaysAgo: Math.floor((new Date() - fan.joinedAt) / (1000 * 60 * 60 * 24)),
      isVip: fan.isVip
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching fan stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching fan stats'
    });
  }
});

// GET /api/fans/leaderboard/points - Get points leaderboard
router.get('/leaderboard/points', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const leaderboard = await Fan.find({})
      .select('username avatar points level badges stats isVip')
      .sort({ points: -1, level: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard,
      type: 'points_leaderboard'
    });
  } catch (error) {
    console.error('Error fetching points leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching points leaderboard'
    });
  }
});

// GET /api/fans/stats/summary - Get fan statistics summary
router.get('/stats/summary', async (req, res) => {
  try {
    const totalFans = await Fan.countDocuments();
    const vipFans = await Fan.countDocuments({ isVip: true });
    const verifiedFans = await Fan.countDocuments({ isVerified: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeTodayFans = await Fan.countDocuments({
      lastActive: { $gte: today }
    });
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newFansThisWeek = await Fan.countDocuments({
      joinedAt: { $gte: oneWeekAgo }
    });
    
    const levelDistribution = await Fan.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const averageStats = await Fan.aggregate([
      {
        $group: {
          _id: null,
          avgPoints: { $avg: '$points' },
          avgLevel: { $avg: '$level' },
          avgVotes: { $avg: '$stats.votesGiven' },
          avgQuestions: { $avg: '$stats.questionsAsked' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalFans,
        vipFans,
        verifiedFans,
        activeTodayFans,
        newFansThisWeek,
        levelDistribution,
        averageStats: averageStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Error fetching fan stats summary:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching fan stats summary'
    });
  }
});

module.exports = router;