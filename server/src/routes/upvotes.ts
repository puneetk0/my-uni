import { Router } from 'express';
import { Upvote } from '../models/Upvote';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/achievements/:id/upvotes/count', async (req, res) => {
  const c = await Upvote.countDocuments({ achievementId: req.params.id });
  res.json({ count: c });
});

router.post('/achievements/:id/upvotes/toggle', requireAuth, async (req: AuthedRequest, res) => {
  const existing = await Upvote.findOne({ achievementId: req.params.id, userId: req.userId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ upvoted: false });
  }
  await Upvote.create({ achievementId: req.params.id, userId: req.userId });
  return res.json({ upvoted: true });
});

export default router;
