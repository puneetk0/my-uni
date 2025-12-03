import dotenv from 'dotenv';
import path from 'path';

// Load server/.env first (if present)
dotenv.config();
// Also attempt to load project-root .env (../.env) so users don't need to duplicate
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const required = (key: string, altKey?: string): string => {
  const v = process.env[key];
  if (v) return v;
  if (altKey) {
    const alt = process.env[altKey];
    if (alt) return alt;
  }
  throw new Error(`Missing env var: ${key}${altKey ? ` (or ${altKey})` : ''}`);
};

export const env: {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
} = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),
  // Support either MONGODB_URL or MONGODB_URI
  MONGODB_URL: required('MONGODB_URL', 'MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
