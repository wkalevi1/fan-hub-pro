const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Outfit = require('../models/Outfit');
const Fan = require('../models/Fan');

// POST /api/votes - Cast a vote
router.post('/', async (req, res) => {
  try {
    const { outfitId, fanId, reaction = '💖' } = req.body;
    
    // Check if fan already voted for this outfit
    if (fanId) {
      const existingVote = await Vote.findOne({ outfitId, fanId });
      if (existingVote) {
        return res.status(400).json({
          success: false,
          error: 'You have already voted for this outfit'
        });
      }
    }
    
    // Verify outfit exists
    const outfit = await Outfit.findById(outfitId);
    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }
    
    // Create vote
    const vote = new Vote({
      outfitId,
      fanId: fanId || null,
      reaction
    });
    
    await vote.save();
    
    // Update outfit vote count
    outfit.votes += 1;
    await outfit.save();
    
    // Add points to fan if logged in
    if (fanId) {
      const fan = await Fan.findById(fanId);
      if (fan) {
        fan.points += 10;
        // Check if should become top fan (e.g., 100+ points)
        if (fan.points >= 100) {
          fan.isTopFan = true;
        }
        await fan.save();
      }
    }
    
    // Calculate new percentage
    const totalVotes = await Vote.countDocuments();
    const percentage = totalVotes > 0 ? Math.round((outfit.votes / totalVotes) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        vote,
        outfit: {
          id: outfit._id,
          votes: outfit.votes,
          percentage
        }
      },
      message: 'Vote cast successfully!'
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      error: 'Error casting vote'
    });
  }
});

// GET /api/votes/outfit/:id - Get votes for specific outfit
router.get('/outfit/:id', async (req, res) => {
  try {
    const votes = await Vote.find({ outfitId: req.params.id })
      .populate('fanId', 'username')
      .sort({ createdAt: -1 });
    
    const reactions = votes.reduce((acc, vote) => {
      acc[vote.reaction] = (acc[vote.reaction] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        votes,
        reactions,
        total: votes.length
      }
    });
  } catch (error) {
    console.error('Error fetching outfit votes:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching outfit votes'
    });
  }
});

// GET /api/votes/stats - Get voting statistics
router.get('/stats', async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVotes = await Vote.countDocuments({
      createdAt: { $gte: today }
    });
    
    const topOutfits = await Outfit.find()
      .sort({ votes: -1 })
      .limit(5)
      .select('title votes imageUrl');
    
    res.json({
      success: true,
      data: {
        totalVotes,
        todayVotes,
        topOutfits
      }
    });
  } catch (error) {
    console.error('Error fetching vote stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching vote stats'
    });
  }
});

module.exports = router;