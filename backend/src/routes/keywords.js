import { Router } from 'express';
import db from '../db.js';

const router = Router();

// List all keywords
router.get('/', (req, res) => {
  const keywords = db.prepare('SELECT * FROM keywords ORDER BY created_at DESC').all();
  res.json(keywords);
});

// Add keyword
router.post('/', (req, res) => {
  const { keyword, category, source_types } = req.body;
  if (!keyword?.trim()) {
    return res.status(400).json({ error: 'keyword is required' });
  }
  const stmt = db.prepare(
    'INSERT INTO keywords (keyword, category, source_types) VALUES (?, ?, ?)'
  );
  const result = stmt.run(keyword.trim(), category || '', source_types || 'web,twitter');
  const created = db.prepare('SELECT * FROM keywords WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// Update keyword
router.put('/:id', (req, res) => {
  const { keyword, category, source_types, enabled } = req.body;
  const existing = db.prepare('SELECT * FROM keywords WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'keyword not found' });

  db.prepare(`
    UPDATE keywords SET
      keyword = COALESCE(?, keyword),
      category = COALESCE(?, category),
      source_types = COALESCE(?, source_types),
      enabled = COALESCE(?, enabled),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    keyword?.trim() || null,
    category ?? null,
    source_types ?? null,
    enabled ?? null,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM keywords WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete keyword
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM keywords WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'keyword not found' });
  res.json({ success: true });
});

// Toggle keyword
router.patch('/:id/toggle', (req, res) => {
  const existing = db.prepare('SELECT * FROM keywords WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'keyword not found' });
  db.prepare('UPDATE keywords SET enabled = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(existing.enabled ? 0 : 1, req.params.id);
  const updated = db.prepare('SELECT * FROM keywords WHERE id = ?').get(req.params.id);
  res.json(updated);
});

export default router;
