const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const newsApiSource = require('./sources/newsapi');
const webScraperSource = require('./sources/webscraper');

const app = express();
app.use(express.json());

// Sources to crawl
const sources = [
  { name: 'newsapi', handler: newsApiSource },
  { name: 'webscraper', handler: webScraperSource }
];

// Track bot activity
async function logActivity(botName, action, status, details = {}) {
  try {
    await axios.post('http://backend:5000/api/bots/logs', {
      bot_name: botName,
      action,
      status,
      details
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Process and send news to backend
async function processArticle(article, source) {
  try {
    // Send to AI for analysis
    const aiResponse = await axios.post('http://ai-service:5000/analyze', {
      content: article.content,
      title: article.title
    });
    
    // Create news in system
    await axios.post('http://backend:5000/api/news', {
      title: article.title,
      content: article.content,
      source: source,
      category: aiResponse.data.category,
      sentiment: aiResponse.data.sentiment,
      severity_score: aiResponse.data.severity_score
    });
    
    return true;
  } catch (error) {
    console.error('Failed to process article:', error);
    return false;
  }
}

// Run crawler job
async function runCrawler() {
  for (const source of sources) {
    try {
      console.log(`Starting crawler for ${source.name}`);
      await logActivity(source.name, 'crawl_start', 'running');
      
      const articles = await source.handler.fetchArticles();
      console.log(`Found ${articles.length} articles from ${source.name}`);
      
      let processed = 0;
      for (const article of articles) {
        const success = await processArticle(article, source.name);
        if (success) processed++;
      }
      
      await logActivity(source.name, 'crawl_complete', 'success', {
        total: articles.length,
        processed
      });
    } catch (error) {
      console.error(`Error in ${source.name} crawler:`, error);
      await logActivity(source.name, 'crawl_error', 'failed', {
        error: error.message
      });
    }
  }
}

// Schedule crawlers
cron.schedule('*/30 * * * *', runCrawler);  // Run every 30 minutes

// API endpoints
app.get('/status', (req, res) => {
  res.json({ status: 'running' });
});

app.post('/run', async (req, res) => {
  try {
    runCrawler();
    res.json({ message: 'Crawler job started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Crawler service running on port ${PORT}`);
  console.log('Scheduled crawler will run every 30 minutes');
});