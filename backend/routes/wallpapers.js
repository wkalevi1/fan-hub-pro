const express = require('express');
const router = express.Router();
const Wallpaper = require('../models/Wallpaper');
const Fan = require('../models/Fan');

// GET /api/wallpapers - Get all wallpapers with filtering
router.get('/', async (req, res) => {
  try {
    const { category = 'all', page = 1, limit = 12, sort = 'newest' } = req.query;
    
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { downloads: -1, likes: -1 };
        break;
      case 'mostLiked':
        sortOptions = { likes: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const wallpapers = await Wallpaper.getByCategory(
      category, 
      parseInt(page), 
      parseInt(limit)
    );
    
    // Apply sorting
    const sortedWallpapers = await Wallpaper.find({
      isActive: true,
      ...(category !== 'all' && { category })
    })
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
    
    const total = await Wallpaper.countDocuments({
      isActive: true,
      ...(category !== 'all' && { category })
    });
    
    res.json({
      success: true,
      data: sortedWallpapers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filter: { category, sort }
    });
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching wallpapers'
    });
  }
});

// GET /api/wallpapers/popular - Get popular wallpapers
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const popular = await Wallpaper.getPopular(parseInt(limit));
    
    res.json({
      success: true,
      data: popular,
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

// GET /api/wallpapers/categories - Get available categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Wallpaper.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalCount = await Wallpaper.countDocuments({ isActive: true });
    
    const categoriesWithAll = [
      { _id: 'all', count: totalCount },
      ...categories
    ];
    
    res.json({
      success: true,
      data: categoriesWithAll
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching categories'
    });
  }
});

// GET /api/wallpapers/search - Search wallpapers
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be at least 2 characters long'
      });
    }
    
    const results = await Wallpaper.search(q.trim(), parseInt(limit));
    
    res.json({
      success: true,
      data: results,
      searchTerm: q.trim(),
      total: results.length
    });
  } catch (error) {
    console.error('Error searching wallpapers:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching wallpapers'
    });
  }
});

// GET /api/wallpapers/:id - Get single wallpaper
router.get('/:id', async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    
    if (!wallpaper || !wallpaper.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Wallpaper not found'
      });
    }
    
    res.json({
      success: true,
      data: wallpaper
    });
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching wallpaper'
    });
  }
});

// POST /api/wallpapers/:id/download - Track wallpaper download
router.post('/:id/download', async (req, res) => {
  try {
    const { fanId } = req.body;
    const wallpaper = await Wallpaper.findById(req.params.id);
    
    if (!wallpaper || !wallpaper.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Wallpaper not found'
      });
    }
    
    // Increment download count
    await wallpaper.incrementDownload();
    
    // Add points to fan if logged in
    if (fanId) {
      const fan = await Fan.findById(fanId);
      if (fan) {
        await fan.addPoints(5, 'download');
      }
    }
    
    res.json({
      success: true,
      data: {
        id: wallpaper._id,
        downloads: wallpaper.downloads + 1,
        downloadUrl: wallpaper.image
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

// POST /api/wallpapers/:id/like - Like a wallpaper
router.post('/:id/like', async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findById(req.params.id);
    
    if (!wallpaper || !wallpaper.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Wallpaper not found'
      });
    }
    
    wallpaper.likes += 1;
    await wallpaper.save();
    
    res.json({
      success: true,
      data: {
        id: wallpaper._id,
        likes: wallpaper.likes
      },
      message: 'Wallpaper liked!'
    });
  } catch (error) {
    console.error('Error liking wallpaper:', error);
    res.status(500).json({
      success: false,
      error: 'Error liking wallpaper'
    });
  }
});

// POST /api/wallpapers - Create new wallpaper (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      image,
      thumbnail,
      description,
      category,
      resolution,
      tags,
      isPremium = false
    } = req.body;
    
    const wallpaper = new Wallpaper({
      title,
      image,
      thumbnail,
      description,
      category,
      resolution,
      tags: tags || [],
      isPremium
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

// GET /api/wallpapers/stats/summary - Get wallpaper statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalWallpapers = await Wallpaper.countDocuments({ isActive: true });
    const totalDownloads = await Wallpaper.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    
    const totalLikes = await Wallpaper.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    
    const topWallpapers = await Wallpaper.find({ isActive: true })
      .sort({ downloads: -1 })
      .limit(5)
      .select('title downloads likes category');
    
    const categoryStats = await Wallpaper.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalWallpapers,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        topWallpapers,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching wallpaper stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching wallpaper stats'
    });
  }
});

module.exports = router;