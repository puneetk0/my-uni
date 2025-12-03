import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signAccess(userId: string) {
  return jwt.sign({ sub: userId, type: 'access' }, env.JWT_SECRET, { expiresIn: '30m' });
}

export function signRefresh(userId: string) {
  return jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; type: 'access' | 'refresh' };
}
