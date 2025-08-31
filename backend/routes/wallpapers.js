const express = require('express');
const router = express.Router();
const Wallpaper = require('../models/Wallpaper');

// GET /api/wallpapers - Get all wallpapers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;
    
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { downloads: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const wallpapers = await Wallpaper.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Wallpaper.countDocuments();
    
    // Format wallpapers for frontend
    const formattedWallpapers = wallpapers.map(w => ({
      id: w._id,
      title: w.title,
      image: w.imageUrl,
      downloads: w.downloads,
      category: 'lifestyle' // Default category for now
    }));
    
    res.json({
      success: true,
      data: formattedWallpapers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching wallpapers'
    });
  }
});

// POST /api/wallpapers/:id/download - Track wallpaper download
router.post('/:id/download', async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    
    if (!wallpaper) {
      return res.status(404).json({
        success: false,
        error: 'Wallpaper not found'
      });
    }
    
    // Increment download count
    wallpaper.downloads += 1;
    await wallpaper.save();
    
    res.json({
      success: true,
      data: {
        id: wallpaper._id,
        downloads: wallpaper.downloads,
        downloadUrl: wallpaper.imageUrl
      },
      message: 'Download tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({
      success: false,
      error: 'Error tracking download'
    });
  }
});

// POST /api/wallpapers - Create new wallpaper
router.post('/', async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    
    const wallpaper = new Wallpaper({
      title,
      imageUrl
    });
    
    await wallpaper.save();
    
    res.status(201).json({
      success: true,
      data: wallpaper,
      message: 'Wallpaper created successfully'
    });
  } catch (error) {
    console.error('Error creating wallpaper:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating wallpaper'
    });
  }
});

// GET /api/wallpapers/popular - Get popular wallpapers
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const popular = await Wallpaper.find()
      .sort({ downloads: -1 })
      .limit(parseInt(limit));
    
    const formattedWallpapers = popular.map(w => ({
      id: w._id,
      title: w.title,
      image: w.imageUrl,
      downloads: w.downloads,
      category: 'lifestyle'
    }));
    
    res.json({
      success: true,
      data: formattedWallpapers,
      type: 'popular'
    });
  } catch (error) {
    console.error('Error fetching popular wallpapers:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching popular wallpapers'
    });
  }
});

module.exports = router;