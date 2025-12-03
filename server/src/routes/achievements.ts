import { Router } from 'express';
import { z } from 'zod';
import { Achievement } from '../models/Achievement';
import { requireAuth, AuthedRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  const { type, status } = req.query as { type?: string; status?: string };
  const filter: any = {};
  if (type && type !== 'all') filter.type = type;
  if (status) filter.status = status;
  else filter.status = 'approved';
  const items = await Achievement.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// List achievements for a specific user (self-only unless faculty/admin)
router.get('/user/:userId', requireAuth, async (req: AuthedRequest, res) => {
  const { userId } = req.params;
  try {
    if (req.userId !== userId) {
      // Only elevated roles can view others
      // simple check using requireRole-like logic inline to avoid extra query here
      return res.status(403).json({ error: 'Forbidden' });
    }
    const list = await Achievement.find({ userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

const CreateSchema = z.object({
  title: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  achievementDate: z.string().optional(),
  isFeatured: z.boolean().optional(),
  photos: z.array(z.string()).optional(),
  mediaUrl: z.string().optional(),
  howItStarted: z.string().optional(),
  howWeBuiltIt: z.string().optional(),
  whatWeAchieved: z.string().optional(),
  whatWeLearned: z.string().optional(),
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const doc = await Achievement.create({ ...parsed.data, userId: req.userId });
  res.status(201).json(doc);
});

router.patch('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (String(item.userId) !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(item, req.body);
  await item.save();
  res.json(item);
});

router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (String(item.userId) !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await item.deleteOne();
  res.json({ ok: true });
});

// Admin/faculty: list pending
router.get('/pending/list', requireAuth, requireRole(['faculty', 'admin']), async (_req, res) => {
  const items = await Achievement.find({ status: 'pending' }).sort({ createdAt: -1 });
  res.json(items);
});

// Admin/faculty: review achievement
const ReviewSchema = z.object({ status: z.enum(['approved', 'rejected']), rejectionReason: z.string().optional() });
router.post('/:id/review', requireAuth, requireRole(['faculty', 'admin']), async (req, res) => {
  const parsed = ReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { status, rejectionReason } = parsed.data;
  const item = await Achievement.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.status = status;
  if (status === 'rejected') (item as any).rejectionReason = rejectionReason || 'Not specified';
  await item.save();
  res.json(item);
});

export default router;
