import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectMongo } from './db/mongoose';
import authRoutes from './routes/auth';
import achievementRoutes from './routes/achievements';
import commentRoutes from './routes/comments';
import upvoteRoutes from './routes/upvotes';
import opportunityRoutes from './routes/opportunities';

async function main() {
  await connectMongo();

  const app = express();
  app.use(helmet());
app.use(cors({ 
  origin: [env.CORS_ORIGIN], // Allow both origins
  credentials: true 
}));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/achievements', achievementRoutes);
  app.use('/api', commentRoutes);
  app.use('/api', upvoteRoutes);
  app.use('/api/opportunities', opportunityRoutes);

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(env.PORT, () => console.log(`API listening on :${env.PORT}`));
}



main().catch((e) => {
  console.error(e);
  process.exit(1);
});
