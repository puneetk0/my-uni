import { Router } from 'express';
import { z } from 'zod';
import { Opportunity } from '../models/Opportunity';
import { requireAuth, AuthedRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  const { type } = req.query as { type?: string };
  const filter: any = { status: 'approved' };
  if (type && type !== 'all') filter.type = type;
  const list = await Opportunity.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.string().optional(),
  organization: z.string().optional(),
  location: z.string().optional(),
  applyUrl: z.string().url().optional(),
  detailsUrl: z.string().url().optional(),
  joinTeamUrl: z.string().url().optional(),
  eligibility: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  customTypeLabel: z.string().optional(),
  isStartup: z.boolean().optional(),
  startupName: z.string().optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const payload = parsed.data as any;
  if (payload.deadline) payload.deadline = new Date(payload.deadline);
  const doc = await Opportunity.create({ ...payload, status: 'pending', createdBy: req.userId });
  res.status(201).json(doc);
});

// Admin/faculty: list pending opportunities
router.get('/pending/list', requireAuth, requireRole(['faculty', 'admin']), async (_req, res) => {
  const list = await Opportunity.find({ status: 'pending' }).sort({ createdAt: -1 });
  res.json(list);
});

// Admin/faculty: review opportunity
const ReviewSchema = z.object({ status: z.enum(['approved', 'rejected']), rejectionReason: z.string().optional() });
router.post('/:id/review', requireAuth, requireRole(['faculty', 'admin']), async (req, res) => {
  const parsed = ReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { status, rejectionReason } = parsed.data;
  const item = await Opportunity.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  (item as any).status = status;
  if (status === 'rejected') (item as any).rejectionReason = rejectionReason || 'Not specified';
  await item.save();
  res.json(item);
});

export default router;
