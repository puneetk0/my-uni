import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = hdr.slice('Bearer '.length);
  try {
    const payload = verifyToken(token);
    if (payload.type !== 'access') return res.status(401).json({ error: 'Invalid token' });
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(roles: Array<'user' | 'faculty' | 'admin'>) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
      const u = await User.findById(req.userId).select('role');
      if (!u) return res.status(401).json({ error: 'Unauthorized' });
      if (!roles.includes((u as any).role)) return res.status(403).json({ error: 'Forbidden' });
      next();
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  };
}
