import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/daily-menu', dailyMenuRouter);
app.use('/api/upload', uploadRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
