import { Router } from 'express';
import { protect, adminOnly } from './middleware/admin.middleware.js';
import AuditLog from './models/AuditLog.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/logs', async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [['timestamp', 'DESC']], limit: 200 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post('/logs', async (req, res) => {
  // Optional: allow pushing logs via API (secured)
  try {
    const { userId, action, resourceType, resourceId, details } = req.body;
    await AuditLog.create({ userId, action, resourceType, resourceId, details, timestamp: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
