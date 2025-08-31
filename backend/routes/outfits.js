const express = require('express');
const router = express.Router();
const Outfit = require('../models/Outfit');
const Vote = require('../models/Vote');

// GET /api/outfits - Get all outfits with ranking
router.get('/', async (req, res) => {
  try {
    const outfits = await Outfit.find().sort({ votes: -1, createdAt: -1 });
    
    // Calculate percentages and add ranking
    const totalVotes = await Vote.countDocuments();
    
    const outfitsWithStats = outfits.map((outfit, index) => ({
      id: outfit._id,
      title: outfit.title,
      image: outfit.imageUrl,
      votes: outfit.votes,
      percentage: totalVotes > 0 ? Math.round((outfit.votes / totalVotes) * 100) : 0,
      ranking: index + 1,
      comments: [] // Will be populated from votes with reactions
    }));
    
    res.json({
      success: true,
      data: outfitsWithStats,
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

// GET /api/outfits/:id - Get single outfit with reactions
router.get('/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    
    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: 'Outfit not found'
      });
    }
    
    // Get reactions for this outfit
    const votes = await Vote.find({ outfitId: req.params.id })
      .populate('fanId', 'username')
      .sort({ createdAt: -1 });
    
    const comments = votes.map(vote => ({
      id: vote._id,
      text: vote.reaction,
      emoji: vote.reaction,
      fanName: vote.fanId?.username || 'Fan Anónimo'
    }));
    
    const totalVotes = await Vote.countDocuments();
    const percentage = totalVotes > 0 ? Math.round((outfit.votes / totalVotes) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        id: outfit._id,
        title: outfit.title,
        image: outfit.imageUrl,
        votes: outfit.votes,
        percentage,
        comments
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

// POST /api/outfits - Create new outfit
router.post('/', async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    
    const outfit = new Outfit({
      title,
      imageUrl
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

module.exports = router;