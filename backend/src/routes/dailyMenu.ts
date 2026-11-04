import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Público: menús activos para mostrar en la carta
router.get('/today', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM daily_menus WHERE is_active = true ORDER BY slot_number, id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Admin: lista todos los menús permanentes
router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM daily_menus ORDER BY slot_number, id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Admin: crea un menú permanente nuevo
router.post('/', requireAuth, async (req, res) => {
  const { title, description, price } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'El nombre del menú es obligatorio' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO daily_menus (slot_number, title, description, price, is_active, updated_at)
       VALUES (
         (SELECT COALESCE(MAX(slot_number), 0) + 1 FROM daily_menus),
         $1, $2, $3, false, NOW()
       )
       RETURNING *`,
      [title.trim(), description || null, price ?? null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Admin: activa o desactiva un menú
router.patch('/:id', requireAuth, async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active debe ser boolean' });
  }
  try {
    const result = await pool.query(
      `UPDATE daily_menus SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Admin: edita título, descripción y precio
router.put('/:id', requireAuth, async (req, res) => {
  const { title, description, price } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'El nombre del menú es obligatorio' });
  }
  try {
    const result = await pool.query(
      `UPDATE daily_menus SET
        title = $1,
        description = $2,
        price = $3,
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title.trim(), description || null, price ?? null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Admin: elimina permanentemente
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM daily_menus WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
