const mongoose = require("mongoose");

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
  reaction: {
    type: String,
    enum: ['💖', '🔥', '👏'],
    default: '💖'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Prevent duplicate votes from same fan for same outfit
VoteSchema.index({ outfitId: 1, fanId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);