import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/public', async (_req, res) => {
  try {
    const sections = await pool.query(
      'SELECT * FROM menu_sections WHERE is_active = true ORDER BY display_order, id'
    );
    const items = await pool.query(
      'SELECT * FROM menu_items WHERE is_active = true ORDER BY section_id, display_order, id'
    );
    const result = sections.rows.map(s => ({
      ...s,
      items: items.rows.filter(i => i.section_id === s.id),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_sections ORDER BY display_order, id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { name, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const result = await pool.query(
      'INSERT INTO menu_sections (name, display_order) VALUES ($1, $2) RETURNING *',
      [name, display_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { name, display_order, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_sections SET
        name = COALESCE($1, name),
        display_order = COALESCE($2, display_order),
        is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING *`,
      [name, display_order, is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_sections WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
