import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { sectionId } = req.query;
  if (!sectionId) return res.status(400).json({ error: 'sectionId requerido' });
  try {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE section_id = $1 ORDER BY display_order, id',
      [sectionId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { section_id, name, description, price, display_order } = req.body;
  if (!section_id || !name) return res.status(400).json({ error: 'section_id y nombre requeridos' });
  try {
    const result = await pool.query(
      'INSERT INTO menu_items (section_id, name, description, price, display_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [section_id, name, description || null, price ?? null, display_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { name, description, price, display_order, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_items SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = $3,
        display_order = COALESCE($4, display_order),
        is_active = COALESCE($5, is_active)
       WHERE id = $6 RETURNING *`,
      [name, description, price ?? null, display_order, is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
