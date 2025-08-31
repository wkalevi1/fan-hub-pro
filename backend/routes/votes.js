const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Outfit = require('../models/Outfit');
const Fan = require('../models/Fan');

// POST /api/votes - Cast a vote
router.post('/', async (req, res) => {
  try {
    const { outfitId, fanId, voteType = 'like' } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Check if user already voted for this outfit
    const existingVote = await Vote.findOne({ outfitId, userIp });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: 'You have already voted for this outfit'
      });
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
      userIp,
      userAgent,
      voteType
    });
    
    await vote.save();
    
    // Update outfit vote count
    const voteCount = await Vote.countDocuments({ outfitId });
    outfit.votes = voteCount;
    
    // Update percentage for all outfits
    const totalVotes = await Vote.countDocuments();
    outfit.percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
    await outfit.save();
    
    // Add points to fan if logged in
    if (fanId) {
      const fan = await Fan.findById(fanId);
      if (fan) {
        await fan.addPoints(10, 'vote');
      }
    }
    
    res.json({
      success: true,
      data: {
        vote,
        outfit: {
          id: outfit._id,
          votes: voteCount,
          percentage: outfit.percentage
        }
      },
      message: 'Vote cast successfully!'
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already voted for this outfit'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error casting vote'
    });
  }
});

// GET /api/votes/user/:ip - Get user's votes by IP
router.get('/user/:ip', async (req, res) => {
  try {
    const userIp = req.params.ip;
    const votes = await Vote.find({ userIp })
      .populate('outfitId', 'title image')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: votes,
      total: votes.length
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user votes'
    });
  }
});

// GET /api/votes/outfit/:id - Get votes for specific outfit
router.get('/outfit/:id', async (req, res) => {
  try {
    const outfitId = req.params.id;
    const votes = await Vote.find({ outfitId })
      .populate('fanId', 'username avatar level badges')
      .sort({ createdAt: -1 });
    
    const voteStats = await Vote.aggregate([
      { $match: { outfitId: mongoose.Types.ObjectId(outfitId) } },
      {
        $group: {
          _id: '$voteType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        votes,
        stats: voteStats,
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
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyVotes = await Vote.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    const topOutfits = await Vote.aggregate([
      {
        $group: {
          _id: '$outfitId',
          voteCount: { $sum: 1 }
        }
      },
      {
        $sort: { voteCount: -1 }
      },
      {
        $limit: 5
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
      data: {
        totalVotes,
        todayVotes,
        weeklyVotes,
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

// DELETE /api/votes/:id - Remove vote (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const vote = await Vote.findByIdAndDelete(req.params.id);
    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found'
      });
    }
    
    // Update outfit vote counts
    const voteCount = await Vote.countDocuments({ outfitId: vote.outfitId });
    const outfit = await Outfit.findById(vote.outfitId);
    if (outfit) {
      outfit.votes = voteCount;
      const totalVotes = await Vote.countDocuments();
      outfit.percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      await outfit.save();
    }
    
    res.json({
      success: true,
      message: 'Vote removed successfully'
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({
      success: false,
      error: 'Error removing vote'
    });
  }
});

module.exports = router;