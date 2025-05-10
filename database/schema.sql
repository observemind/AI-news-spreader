-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- News articles table
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL,
    severity_score DECIMAL(3,1) NOT NULL DEFAULT 0,
    sentiment DECIMAL(3,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bot activity logs
CREATE TABLE bot_logs (
    id SERIAL PRIMARY KEY,
    bot_name VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_severity ON news(severity_score);
CREATE INDEX idx_news_created ON news(created_at);