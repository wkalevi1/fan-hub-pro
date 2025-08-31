const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Fan = require('../models/Fan');

// GET /api/questions - Get all public answered questions
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20, status = 'answered' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    if (status) query.status = status;
    if (category && category !== 'all') query.category = category;
    
    const questions = await Question.find(query)
      .populate('fanId', 'username avatar level badges')
      .sort({ isPinned: -1, likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Question.countDocuments(query);
    
    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching questions'
    });
  }
});

// GET /api/questions/trending - Get trending questions
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trending = await Question.getTrending(parseInt(limit));
    
    res.json({
      success: true,
      data: trending,
      type: 'trending'
    });
  } catch (error) {
    console.error('Error fetching trending questions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching trending questions'
    });
  }
});

// GET /api/questions/category/:category - Get questions by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const questions = await Question.getByCategory(category, parseInt(limit));
    
    res.json({
      success: true,
      data: questions,
      category
    });
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching questions by category'
    });
  }
});

// GET /api/questions/:id - Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('fanId', 'username avatar level badges');
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching question'
    });
  }
});

// POST /api/questions - Submit new question
router.post('/', async (req, res) => {
  try {
    const { question, category = 'other', fanId } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;
    
    // Rate limiting: max 5 questions per IP per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayQuestions = await Question.countDocuments({
      userIp,
      createdAt: { $gte: today }
    });
    
    if (todayQuestions >= 5) {
      return res.status(429).json({
        success: false,
        error: 'Maximum 5 questions per day allowed'
      });
    }
    
    const newQuestion = new Question({
      question: question.trim(),
      category,
      fanId: fanId || null,
      userIp
    });
    
    await newQuestion.save();
    
    // Add points to fan if logged in
    if (fanId) {
      const fan = await Fan.findById(fanId);
      if (fan) {
        await fan.addPoints(15, 'question');
      }
    }
    
    await newQuestion.populate('fanId', 'username avatar level badges');
    
    res.status(201).json({
      success: true,
      data: newQuestion,
      message: 'Question submitted successfully! Stephanie will answer soon.'
    });
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting question'
    });
  }
});

// POST /api/questions/:id/like - Like a question
router.post('/:id/like', async (req, res) => {
  try {
    const questionId = req.params.id;
    const userIp = req.ip || req.connection.remoteAddress;
    
    // Check if user already liked this question (simple IP check)
    // In production, you'd want a more sophisticated system
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    question.likes += 1;
    await question.save();
    
    res.json({
      success: true,
      data: {
        id: question._id,
        likes: question.likes
      },
      message: 'Question liked!'
    });
  } catch (error) {
    console.error('Error liking question:', error);
    res.status(500).json({
      success: false,
      error: 'Error liking question'
    });
  }
});

// PUT /api/questions/:id/answer - Answer a question (admin only)
router.put('/:id/answer', async (req, res) => {
  try {
    const { answer, answerType = 'text', videoThumbnail, videoDuration, videoUrl } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    question.answer = answer;
    question.answerType = answerType;
    question.status = 'answered';
    
    if (answerType === 'video') {
      question.videoThumbnail = videoThumbnail;
      question.videoDuration = videoDuration;
      question.videoUrl = videoUrl;
    }
    
    await question.save();
    await question.populate('fanId', 'username avatar level badges');
    
    res.json({
      success: true,
      data: question,
      message: 'Question answered successfully'
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      error: 'Error answering question'
    });
  }
});

// GET /api/questions/search/:term - Search questions
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 20 } = req.query;
    
    const questions = await Question.find({
      status: 'answered',
      isPublic: true,
      $or: [
        { question: { $regex: term, $options: 'i' } },
        { answer: { $regex: term, $options: 'i' } }
      ]
    })
    .populate('fanId', 'username avatar level badges')
    .sort({ likes: -1, createdAt: -1 })
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: questions,
      searchTerm: term,
      total: questions.length
    });
  } catch (error) {
    console.error('Error searching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching questions'
    });
  }
});

// GET /api/questions/stats/summary - Get questions statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const answeredQuestions = await Question.countDocuments({ status: 'answered' });
    const pendingQuestions = await Question.countDocuments({ status: 'pending' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuestions = await Question.countDocuments({
      createdAt: { $gte: today }
    });
    
    const categoryStats = await Question.aggregate([
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
    
    res.json({
      success: true,
      data: {
        totalQuestions,
        answeredQuestions,
        pendingQuestions,
        todayQuestions,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching question stats'
    });
  }
});

module.exports = router;