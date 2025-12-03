import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { signAccess, signRefresh, verifyToken } from '../utils/jwt';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, password, name } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });
  const accessToken = signAccess(String(user._id));
  const refreshToken = signRefresh(String(user._id));
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken });
});

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
    accessToken: signAccess(String(user._id)),
    refreshToken: signRefresh(String(user._id)),
  });
});

router.post('/refresh', (req, res) => {
  const token = req.body.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ error: 'Missing refreshToken' });
  try {
    const payload = verifyToken(token);
    if (payload.type !== 'refresh') return res.status(401).json({ error: 'Invalid token' });
    return res.json({ accessToken: signAccess(payload.sub) });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const u = await User.findById(req.userId).select('_id email name avatarUrl role');
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { id: u._id, email: u.email, name: u.name, avatarUrl: u.avatarUrl, role: (u as any).role } });
});

export default router;
