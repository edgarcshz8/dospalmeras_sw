import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import pool from './db';
import authRouter from './routes/auth';
import sectionsRouter from './routes/sections';
import itemsRouter from './routes/items';
import dailyMenuRouter from './routes/dailyMenu';
import uploadRouter from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/daily-menu', dailyMenuRouter);
app.use('/api/upload', uploadRouter);

// Migración idempotente: elimina date y restricciones únicas en slot_number
async function runMigrations() {
  try {
    await pool.query(
      `ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS daily_menus_slot_number_date_key`
    );
    await pool.query(
      `ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS daily_menus_slot_number_key`
    );
    await pool.query(
      `ALTER TABLE daily_menus DROP COLUMN IF EXISTS date`
    );
  } catch (err) {
    console.error('Error en migración:', err);
  }
}

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
