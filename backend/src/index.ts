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

// Migración idempotente: libera daily_menus de restricciones del diseño original
async function runMigrations() {
  try {
    // Eliminar constraints únicos conocidos
    await pool.query(
      `ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS daily_menus_slot_number_date_key`
    );
    await pool.query(
      `ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS daily_menus_slot_number_key`
    );
    // Eliminar cualquier CHECK constraint que limite slot_number (ej: BETWEEN 1 AND 5)
    await pool.query(`
      DO $$
      DECLARE c record;
      BEGIN
        FOR c IN
          SELECT conname FROM pg_constraint
          WHERE conrelid = 'daily_menus'::regclass AND contype = 'c'
        LOOP
          EXECUTE 'ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS ' || quote_ident(c.conname);
        END LOOP;
      END $$;
    `);
    // Eliminar columna date si aún existe
    await pool.query(
      `ALTER TABLE daily_menus DROP COLUMN IF EXISTS date`
    );
    // Agregar columna image_url si no existe
    await pool.query(
      `ALTER TABLE daily_menus ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL`
    );
    // Agregar columna subtitle a secciones si no existe
    await pool.query(
      `ALTER TABLE menu_sections ADD COLUMN IF NOT EXISTS subtitle VARCHAR(200) DEFAULT NULL`
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
