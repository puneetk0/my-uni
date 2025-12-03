import express from 'express';
import cors, { CorsOptions } from 'cors';
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

  const whitelist = (process.env.CORS_ORIGINS || env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser clients
      if (whitelist.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    // Let cors package reflect requested headers by default
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
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
