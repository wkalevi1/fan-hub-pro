const mongoose = require("mongoose");

const FanSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  points: { 
    type: Number, 
    default: 0 
  },
  isTopFan: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Fan", FanSchema);