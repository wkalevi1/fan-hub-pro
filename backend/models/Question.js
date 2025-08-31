const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  fanName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  answer: {
    type: String // puede ser texto o link a video
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Question", QuestionSchema);