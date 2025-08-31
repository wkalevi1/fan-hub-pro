const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxlength: 500
  },
  answer: {
    type: String,
    maxlength: 2000
  },
  answerType: {
    type: String,
    enum: ['text', 'video'],
    default: 'text'
  },
  videoThumbnail: {
    type: String
  },
  videoDuration: {
    type: String
  },
  videoUrl: {
    type: String
  },
  fanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fan'
  },
  userIp: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'archived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['fitness', 'lifestyle', 'fashion', 'personal', 'other'],
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Search index for questions
QuestionSchema.index({ question: 'text', answer: 'text' });

// Get trending questions (most liked recently)
QuestionSchema.statics.getTrending = async function(limit = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return await this.find({
    status: 'answered',
    isPublic: true,
    createdAt: { $gte: oneWeekAgo }
  })
  .sort({ likes: -1, createdAt: -1 })
  .limit(limit)
  .populate('fanId', 'username avatar');
};

// Get questions by category
QuestionSchema.statics.getByCategory = async function(category, limit = 20) {
  return await this.find({
    category,
    status: 'answered',
    isPublic: true
  })
  .sort({ isPinned: -1, createdAt: -1 })
  .limit(limit)
  .populate('fanId', 'username avatar');
};

module.exports = mongoose.model('Question', QuestionSchema);