import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const map = {};
  settings.forEach(s => { map[s.key] = s.value; });
  res.json(map);
});

router.put('/', (req, res) => {
  const entries = req.body;
  if (!entries || typeof entries !== 'object') {
    return res.status(400).json({ error: 'body must be an object of key-value pairs' });
  }
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(entries)) {
      upsert.run(key, String(value));
    }
  });
  tx();
  res.json({ success: true });
});

export default router;
