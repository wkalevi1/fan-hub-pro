const mongoose = require('mongoose');

const WallpaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  image: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  description: {
    type: String,
    maxlength: 300
  },
  category: {
    type: String,
    enum: ['lifestyle', 'fitness', 'fashion', 'aesthetic', 'beach', 'golden-hour'],
    required: true
  },
  resolution: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: Number // in bytes
  },
  format: {
    type: String,
    enum: ['jpg', 'jpeg', 'png', 'webp'],
    default: 'jpg'
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  watermark: {
    enabled: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: 'Stephanie G Official'
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left', 'center', 'top-right'],
      default: 'bottom-right'
    }
  }
}, {
  timestamps: true
});

// Index for search and filtering
WallpaperSchema.index({ category: 1, isActive: 1 });
WallpaperSchema.index({ tags: 1 });
WallpaperSchema.index({ downloads: -1 });

// Get popular wallpapers
WallpaperSchema.statics.getPopular = async function(limit = 20) {
  return await this.find({ isActive: true })
    .sort({ downloads: -1, likes: -1 })
    .limit(limit);
};

// Get by category with pagination
WallpaperSchema.statics.getByCategory = async function(category, page = 1, limit = 12) {
  const skip = (page - 1) * limit;
  
  const query = { isActive: true };
  if (category !== 'all') {
    query.category = category;
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Search wallpapers
WallpaperSchema.statics.search = async function(searchTerm, limit = 20) {
  return await this.find({
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  })
  .sort({ downloads: -1 })
  .limit(limit);
};

// Increment download count
WallpaperSchema.methods.incrementDownload = async function() {
  this.downloads += 1;
  await this.save();
};

module.exports = mongoose.model('Wallpaper', WallpaperSchema);