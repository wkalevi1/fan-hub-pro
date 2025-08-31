const express = require('express');
const router = express.Router();
const Fan = require('../models/Fan');

// GET /api/fans/top - Get top fans
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topFans = await Fan.find({ isTopFan: true })
      .sort({ points: -1 })
      .limit(parseInt(limit));
    
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

// GET /api/fans - Get all fans
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'points' } = req.query;
    const skip = (page - 1) * limit;
    
    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { points: -1 };
    }
    
    const fans = await Fan.find()
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

// POST /api/fans - Create new fan
router.post('/', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if username already exists
    const existingFan = await Fan.findOne({ username });
    if (existingFan) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken'
      });
    }
    
    const fan = new Fan({
      username,
      email
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

// GET /api/fans/:id - Get single fan
router.get('/:id', async (req, res) => {
  try {
    const fan = await Fan.findById(req.params.id).select('-email');
    
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

module.exports = router;