from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from transformers import pipeline
import numpy as np

app = FastAPI(title="News AI Analysis Service")

# Load sentiment model
sentiment_analyzer = pipeline("sentiment-analysis")

class NewsContent(BaseModel):
    content: str
    title: str = None

class AnalysisResponse(BaseModel):
    sentiment: float
    severity_score: float
    category: str

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_news(news: NewsContent):
    try:
        # Prepare content
        text = news.title + ". " + news.content if news.title else news.content
        text = text[:512]  # Truncate if too long
        
        # Get sentiment
        sentiment_result = sentiment_analyzer(text)[0]
        sentiment_score = sentiment_result["score"] if sentiment_result["label"] == "POSITIVE" else -sentiment_result["score"]
        
        # Calculate severity (simplified)
        high_words = ["disaster", "emergency", "crisis", "death", "fatal", "war"]
        medium_words = ["problem", "issue", "concern", "risk", "warning"]
        
        # Count occurrences
        high_count = sum(text.lower().count(word) for word in high_words)
        medium_count = sum(text.lower().count(word) for word in medium_words)
        
        # Calculate severity score (0-10)
        severity_score = min(5 + high_count * 2 + medium_count, 10)
        if sentiment_score < 0:
            severity_score = min(severity_score - sentiment_score * 2, 10)
        
        # Determine category
        if sentiment_score > 0.3:
            category = "positive"
        elif sentiment_score < -0.3:
            category = "negative" 
        else:
            category = "neutral"
        
        return AnalysisResponse(
            sentiment=round(sentiment_score, 2),
            severity_score=round(severity_score, 1),
            category=category
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000)