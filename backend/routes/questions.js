const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions - Get all answered questions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const questions = await Question.find({ answer: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Question.countDocuments({ answer: { $exists: true, $ne: null } });
    
    // Format questions for frontend
    const formattedQuestions = questions.map(q => ({
      id: q._id,
      question: q.text,
      answer: q.answer,
      type: q.answer?.includes('http') ? 'video' : 'text',
      videoThumbnail: q.answer?.includes('http') ? q.answer : null,
      duration: q.answer?.includes('http') ? '4:32' : null,
      likes: Math.floor(Math.random() * 50) + 10, // Mock likes for now
      timestamp: q.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedQuestions,
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

// POST /api/questions - Submit new question
router.post('/', async (req, res) => {
  try {
    const { question, fanName = 'Fan Anónimo' } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }
    
    const newQuestion = new Question({
      text: question.trim(),
      fanName: fanName.trim()
    });
    
    await newQuestion.save();
    
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

// PUT /api/questions/:id/answer - Answer a question (admin only)
router.put('/:id/answer', async (req, res) => {
  try {
    const { answer } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    question.answer = answer;
    await question.save();
    
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

// GET /api/questions/pending - Get unanswered questions (admin only)
router.get('/pending', async (req, res) => {
  try {
    const pendingQuestions = await Question.find({ 
      $or: [
        { answer: { $exists: false } },
        { answer: null },
        { answer: '' }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: pendingQuestions,
      total: pendingQuestions.length
    });
  } catch (error) {
    console.error('Error fetching pending questions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching pending questions'
    });
  }
});

module.exports = router;