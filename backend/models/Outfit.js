const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 200
  },
  emoji: {
    type: String,
    required: true
  },
  fanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fan'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OutfitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  votes: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema],
  category: {
    type: String,
    enum: ['casual', 'workout', 'elegant', 'sporty', 'beach'],
    default: 'casual'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update percentage after each vote change
OutfitSchema.methods.updatePercentage = async function(totalVotes) {
  if (totalVotes > 0) {
    this.percentage = Math.round((this.votes / totalVotes) * 100);
  } else {
    this.percentage = 0;
  }
  await this.save();
};

module.exports = mongoose.model('Outfit', OutfitSchema);