const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  outfitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
    required: true
  },
  fanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fan'
  },
  userIp: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  voteType: {
    type: String,
    enum: ['like', 'love', 'fire'],
    default: 'like'
  }
}, {
  timestamps: true
});

// Prevent duplicate votes from same IP for same outfit
VoteSchema.index({ outfitId: 1, userIp: 1 }, { unique: true });

// Analytics helper methods
VoteSchema.statics.getVotesByOutfit = async function(outfitId) {
  return await this.countDocuments({ outfitId });
};

VoteSchema.statics.getTotalVotes = async function() {
  return await this.countDocuments();
};

VoteSchema.statics.getTopVotedOutfits = async function(limit = 10) {
  return await this.aggregate([
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
      $limit: limit
    },
    {
      $lookup: {
        from: 'outfits',
        localField: '_id',
        foreignField: '_id',
        as: 'outfit'
      }
    }
  ]);
};

module.exports = mongoose.model('Vote', VoteSchema);