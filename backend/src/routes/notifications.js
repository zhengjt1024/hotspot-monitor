import { Router } from 'express';
import db from '../db.js';

const router = Router();

// List notifications
router.get('/', (req, res) => {
  const { unread, limit = 50 } = req.query;
  let query = 'SELECT n.*, t.title as topic_title, t.url as topic_url FROM notifications n LEFT JOIN topics t ON n.topic_id = t.id WHERE 1=1';
  const params = [];

  if (unread === '1') {
    query += ' AND n.is_read = 0';
  }

  query += ' ORDER BY n.created_at DESC LIMIT ?';
  params.push(Number(limit));

  const notifications = db.prepare(query).all(...params);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get().count;

  res.json({ notifications, unreadCount });
});

// Mark as read
router.patch('/:id/read', (req, res) => {
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'notification not found' });
  res.json({ success: true });
});

// Mark all as read
router.patch('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
  res.json({ success: true });
});

export default router;
