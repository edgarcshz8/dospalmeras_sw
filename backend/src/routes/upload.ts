import { Router } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '../r2';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
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

  const ext = req.file.originalname.split('.').pop();
  const key = `sections/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  try {
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const imageUrl = `${R2_PUBLIC_URL}/${key}`;

    const result = await pool.query(
      'UPDATE menu_sections SET image_url = $1 WHERE id = $2 RETURNING *',
      [imageUrl, req.params.id]
    );
    res.json({ image_url: imageUrl, section: result.rows[0] });
  } catch (err) {
    console.error('Error subiendo imagen a R2:', err);
    res.status(500).json({ error: 'Error subiendo la imagen' });
  }
});

export default router;
