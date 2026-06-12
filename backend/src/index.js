import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import keywordsRouter from './routes/keywords.js';
import topicsRouter from './routes/topics.js';
import notificationsRouter from './routes/notifications.js';
import settingsRouter from './routes/settings.js';
import { startScheduler } from './services/scheduler.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init database
initDB();

// Routes
app.use('/api/keywords', keywordsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Monitor] Server running on http://localhost:${PORT}`);
  
  // Start periodic monitoring
  const checkInterval = parseInt(process.env.CHECK_INTERVAL_MINUTES || '30');
  startScheduler(checkInterval);
  console.log(`[Monitor] Scheduler started, checking every ${checkInterval} minutes`);
});
