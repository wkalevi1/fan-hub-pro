const express = require('express');
const router = express.Router();
const Outfit = require('../models/Outfit');
const Vote = require('../models/Vote');
const Fan = require('../models/Fan');

// GET /api/outfits - Get all outfits with ranking
router.get('/', async (req, res) => {
  try {
    const outfits = await Outfit.find({ isActive: true })
      .populate('comments.fanId', 'username avatar badges')
      .sort({ votes: -1, createdAt: -1 });
    
    // Calculate percentages
    const totalVotes = await Vote.countDocuments();
    
    const outfitsWithRanking = await Promise.all(
      outfits.map(async (outfit, index) => {
        const voteCount = await Vote.countDocuments({ outfitId: outfit._id });
        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        
        return {
          ...outfit.toObject(),
          votes: voteCount,
          percentage,
          ranking: index + 1
        };
      })
    );
    
    res.json({
      success: true,
      data: outfitsWithRanking,
      total: outfits.length
    });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching outfits'
    });
  }
});

// GET /api/outfits/:id - Get single outfit
router.get('/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id)
      .populate('comments.fanId', 'username avatar badges');
    
    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }
    
    const voteCount = await Vote.countDocuments({ outfitId: outfit._id });
    const totalVotes = await Vote.countDocuments();
    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        ...outfit.toObject(),
        votes: voteCount,
        percentage
      }
    });
  } catch (error) {
    console.error('Error fetching outfit:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching outfit'
    });
  }
});

// POST /api/outfits - Create new outfit (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, image, description, category } = req.body;
    
    const outfit = new Outfit({
      title,
      image,
      description,
      category
    });
    
    await outfit.save();
    
    res.status(201).json({
      success: true,
      data: outfit,
      message: 'Outfit created successfully'
    });
  } catch (error) {
    console.error('Error creating outfit:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating outfit'
    });
  }
});

// POST /api/outfits/:id/comment - Add comment to outfit
router.post('/:id/comment', async (req, res) => {
  try {
    const { text, emoji, fanId } = req.body;
    const outfitId = req.params.id;
    
    const outfit = await Outfit.findById(outfitId);
    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }
    
    const comment = {
      text,
      emoji,
      fanId: fanId || null
    };
    
    outfit.comments.push(comment);
    await outfit.save();
    
    // Add points to fan if logged in
    if (fanId) {
      const fan = await Fan.findById(fanId);
      if (fan) {
        await fan.addPoints(5, 'comment');
      }
    }
    
    await outfit.populate('comments.fanId', 'username avatar badges');
    
    res.json({
      success: true,
      data: outfit,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Error adding comment'
    });
  }
});

// GET /api/outfits/trending/weekly - Get trending outfits this week
router.get('/trending/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trendingVotes = await Vote.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$outfitId',
          weeklyVotes: { $sum: 1 }
        }
      },
      {
        $sort: { weeklyVotes: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'outfits',
          localField: '_id',
          foreignField: '_id',
          as: 'outfit'
        }
      },
      {
        $unwind: '$outfit'
      }
    ]);
    
    res.json({
      success: true,
      data: trendingVotes,
      period: 'weekly'
    });
  } catch (error) {
    console.error('Error fetching trending outfits:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching trending outfits'
    });
  }
});

module.exports = router;