import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/today', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM daily_menus
       WHERE date = CURRENT_DATE AND is_active = true
       ORDER BY slot_number`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      'SELECT * FROM daily_menus WHERE date = $1 ORDER BY slot_number',
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { slot_number, date, title, description, price } = req.body;
  if (!slot_number || slot_number < 1 || slot_number > 5) {
    return res.status(400).json({ error: 'slot_number debe estar entre 1 y 5' });
  }
  const menuDate = date || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `INSERT INTO daily_menus (slot_number, date, title, description, price, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (slot_number, date)
       DO UPDATE SET title = $3, description = $4, price = $5, is_active = true, updated_at = NOW()
       RETURNING *`,
      [slot_number, menuDate, title, description || null, price ?? null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { title, description, price, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE daily_menus SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = $3,
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [title, description, price ?? null, is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM daily_menus WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
