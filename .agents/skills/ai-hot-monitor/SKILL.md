---
name: ai-hot-monitor
description: >-
  AI-powered hot topic monitoring and alert system. Use when monitoring keywords, tracking AI/news trends,
  detecting fake content, or gathering real-time hot topics from web and Twitter. Provides REST API for
  keyword management, topic discovery, AI verification, and push notifications.
  Triggers: monitor hot topics, track keywords, discover AI news, detect fake news, get real-time alerts,
  hot topic aggregation, content authenticity verification.
---

# AI Hot Monitor Skill

Use this skill to delegate hot topic monitoring and content verification to the AI Hot Monitor backend.
The system aggregates content from multiple sources (Web search, Twitter/X), uses AI to verify authenticity,
and sends notifications for high-relevance discoveries.

## How It Works

1. The backend runs at `http://localhost:3001` with Express + SQLite
2. Keywords define what to monitor; results flow through AI verification (OpenRouter)
3. Topics are collected from web scraping and Twitter API (twitterapi.io)
4. Notifications fire when verified, high-relevance content is found

## Available Endpoints

Run commands against the API to manage monitoring:

### Health Check
`curl http://localhost:3001/api/health`

### Keywords
- List: `curl http://localhost:3001/api/keywords`
- Add: `curl -X POST http://localhost:3001/api/keywords -H "Content-Type: application/json" -d '{"keyword":"Claude 4","category":"AI","source_types":"web,twitter"}'`
- Delete: `curl -X DELETE http://localhost:3001/api/keywords/1`
- Toggle: `curl -X PATCH http://localhost:3001/api/keywords/1/toggle`

### Topics
- List: `curl "http://localhost:3001/api/topics?page=1&limit=20"`
- Verified only: `curl "http://localhost:3001/api/topics?verified=1"`
- Stats: `curl http://localhost:3001/api/topics/stats/summary`
- Trigger scan: `curl -X POST http://localhost:3001/api/topics/trigger`

### Notifications
- List: `curl http://localhost:3001/api/notifications`
- Unread only: `curl "http://localhost:3001/api/notifications?unread=1"`
- Mark read: `curl -X PATCH http://localhost:3001/api/notifications/1/read`
- Mark all read: `curl -X PATCH http://localhost:3001/api/notifications/read-all`

## Setup

Before using, ensure the backend is running:

```bash
cd backend
cp .env.example .env
# Edit .env with your OpenRouter and Twitter API keys
npm install
npm run dev
```

Then start the frontend (optional):
```bash
cd frontend
npm install
npm run dev
```

## Workflow Examples

### Monitor a new AI model release
1. Add keyword: `curl -X POST http://localhost:3001/api/keywords -H "Content-Type: application/json" -d '{"keyword":"GPT-5 release","category":"AI大模型","source_types":"web,twitter"}'`
2. Trigger immediate scan: `curl -X POST http://localhost:3001/api/topics/trigger`
3. Check results after 10s: `curl "http://localhost:3001/api/topics?verified=1"`
4. Check notifications: `curl "http://localhost:3001/api/notifications?unread=1"`

### Get a summary report
Use the bundled `report.py` script:
`python scripts/report.py`

### Clear old data
Use the bundled `cleanup.py` script:
`python scripts/cleanup.py --days 7`
