import { Router } from 'express';
import db from '../db.js';
import { runMonitorCycle } from '../services/scheduler.js';

const router = Router();

// List topics with pagination and filters
router.get('/', (req, res) => {
  const { keyword_id, verified, page = 1, limit = 30 } = req.query;
  let query = 'SELECT t.*, k.keyword as keyword_name FROM topics t LEFT JOIN keywords k ON t.keyword_id = k.id WHERE 1=1';
  const params = [];

  if (keyword_id) {
    query += ' AND t.keyword_id = ?';
    params.push(keyword_id);
  }
  if (verified === '1') {
    query += ' AND t.is_verified = 1 AND t.is_fake = 0';
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ' ORDER BY t.published_at DESC, t.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const topics = db.prepare(query).all(...params);
  res.json({ topics, total, page: Number(page), limit: Number(limit) });
});

// Get topic by id
router.get('/:id', (req, res) => {
  const topic = db.prepare(
    'SELECT t.*, k.keyword as keyword_name FROM topics t LEFT JOIN keywords k ON t.keyword_id = k.id WHERE t.id = ?'
  ).get(req.params.id);
  if (!topic) return res.status(404).json({ error: 'topic not found' });
  res.json(topic);
});

// Manual trigger: run monitoring now
router.post('/trigger', async (req, res) => {
  res.json({ message: 'Monitoring cycle triggered', status: 'running' });
  try {
    await runMonitorCycle();
  } catch (err) {
    console.error('[Trigger] Monitor cycle failed:', err.message);
  }
});

// Get stats
router.get('/stats/summary', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM topics').get().count;
  const verified = db.prepare('SELECT COUNT(*) as count FROM topics WHERE is_verified = 1 AND is_fake = 0').get().count;
  const fake = db.prepare('SELECT COUNT(*) as count FROM topics WHERE is_fake = 1').get().count;
  const today = db.prepare(
    "SELECT COUNT(*) as count FROM topics WHERE date(created_at) = date('now')"
  ).get().count;

  const sources = db.prepare(
    'SELECT source, COUNT(*) as count FROM topics GROUP BY source'
  ).all();

  res.json({ total, verified, fake, today, sources });
});

export default router;
