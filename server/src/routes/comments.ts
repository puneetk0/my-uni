import { Router } from 'express';
import { z } from 'zod';
import { Comment } from '../models/Comment';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/achievements/:id/comments', async (req, res) => {
  const list = await Comment.find({ achievementId: req.params.id }).sort({ createdAt: 1 });
  res.json(list);
});

const CreateSchema = z.object({ body: z.string().min(1) });
router.post('/achievements/:id/comments', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const doc = await Comment.create({ achievementId: req.params.id, userId: req.userId, body: parsed.data.body });
  res.status(201).json(doc);
});

router.delete('/comments/:commentId', requireAuth, async (req: AuthedRequest, res) => {
  const doc = await Comment.findById(req.params.commentId);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (String(doc.userId) !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await doc.deleteOne();
  res.json({ ok: true });
});

export default router;
