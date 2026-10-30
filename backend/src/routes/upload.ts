import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpeg|jpg|png|gif|webp)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

router.post('/section/:id', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const imageUrl = `/uploads/${req.file.filename}`;
  try {
    const result = await pool.query(
      'UPDATE menu_sections SET image_url = $1 WHERE id = $2 RETURNING *',
      [imageUrl, req.params.id]
    );
    res.json({ image_url: imageUrl, section: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
