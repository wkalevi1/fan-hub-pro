const mongoose = require('mongoose');

const FanSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null but enforce uniqueness when present
    lowercase: true
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
  },
  bio: {
    type: String,
    maxlength: 200
  },
  location: {
    type: String,
    maxlength: 100
  },
  socialMedia: {
    instagram: String,
    twitter: String,
    tiktok: String
  },
  stats: {
    votesGiven: {
      type: Number,
      default: 0
    },
    questionsAsked: {
      type: Number,
      default: 0
    },
    wallpapersDownloaded: {
      type: Number,
      default: 0
    },
    commentsPosted: {
      type: Number,
      default: 0
    }
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      newContent: {
        type: Boolean,
        default: true
      },
      liveStreams: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profilePublic: {
        type: Boolean,
        default: true
      },
      showStats: {
        type: Boolean,
        default: true
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isVip: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for fan level based on points
FanSchema.virtual('calculatedLevel').get(function() {
  return Math.floor(this.points / 100) + 1;
});

// Methods for gamification
FanSchema.methods.addPoints = async function(points, activity) {
  this.points += points;
  this.level = Math.floor(this.points / 100) + 1;
  
  // Update activity stats
  switch(activity) {
    case 'vote':
      this.stats.votesGiven += 1;
      break;
    case 'question':
      this.stats.questionsAsked += 1;
      break;
    case 'download':
      this.stats.wallpapersDownloaded += 1;
      break;
    case 'comment':
      this.stats.commentsPosted += 1;
      break;
  }
  
  // Check for new badges
  await this.checkForNewBadges();
  await this.save();
};

FanSchema.methods.checkForNewBadges = async function() {
  const badges = [];
  
  // Voting badges
  if (this.stats.votesGiven >= 10 && !this.badges.find(b => b.name === 'Voter')) {
    badges.push({ name: 'Voter', icon: '🗳️', description: 'Voted 10 times' });
  }
  if (this.stats.votesGiven >= 50 && !this.badges.find(b => b.name === 'Super Voter')) {
    badges.push({ name: 'Super Voter', icon: '🏆', description: 'Voted 50 times' });
  }
  
  // Question badges
  if (this.stats.questionsAsked >= 5 && !this.badges.find(b => b.name === 'Curious')) {
    badges.push({ name: 'Curious', icon: '❓', description: 'Asked 5 questions' });
  }
  
  // Level badges
  if (this.level >= 5 && !this.badges.find(b => b.name === 'Rising Star')) {
    badges.push({ name: 'Rising Star', icon: '⭐', description: 'Reached level 5' });
  }
  if (this.level >= 10 && !this.badges.find(b => b.name === 'Super Fan')) {
    badges.push({ name: 'Super Fan', icon: '👑', description: 'Reached level 10' });
  }
  
  this.badges.push(...badges);
};

// Get top fans by points
FanSchema.statics.getTopFans = async function(limit = 10) {
  return await this.find({ isVerified: true })
    .sort({ points: -1, level: -1 })
    .limit(limit)
    .select('username avatar points level badges stats');
};

// Get recent active fans
FanSchema.statics.getRecentActive = async function(limit = 20) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return await this.find({ lastActive: { $gte: oneDayAgo } })
    .sort({ lastActive: -1 })
    .limit(limit)
    .select('username avatar lastActive level');
};

module.exports = mongoose.model('Fan', FanSchema);