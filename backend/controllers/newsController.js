const News = require('../models/News');
const axios = require('axios');
const socket = require('../config/socket');

exports.getAllNews = async (req, res, next) => {
  try {
    const { category, severity, page = 1, limit = 20 } = req.query;
    const result = await News.getAll({ category, severity, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    next(error);
  }
};

exports.createNews = async (req, res, next) => {
  try {
    // Process with AI service for sentiment and severity
    const aiAnalysis = await analyzeWithAI(req.body.content);
    
    const newsData = {
      ...req.body,
      sentiment: aiAnalysis.sentiment,
      severity_score: aiAnalysis.severity_score,
      category: aiAnalysis.category || req.body.category
    };
    
    const news = await News.create(newsData);
    
    // Emit socket event
    socket.io.emit('news:new', news);
    
    res.status(201).json(news);
  } catch (error) {
    next(error);
  }
};

exports.updateNews = async (req, res, next) => {
  try {
    const news = await News.update(req.params.id, req.body);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Emit socket event
    socket.io.emit('news:update', news);
    
    res.json(news);
  } catch (error) {
    next(error);
  }
};

exports.deleteNews = async (req, res, next) => {
  try {
    const result = await News.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Emit socket event
    socket.io.emit('news:delete', { id: req.params.id });
    
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    next(error);
  }
};

async function analyzeWithAI(content) {
  try {
    const response = await axios.post('http://ai-service:5000/analyze', { content });
    return response.data;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return { sentiment: 0, severity_score: 5, category: 'unclassified' };
  }
}