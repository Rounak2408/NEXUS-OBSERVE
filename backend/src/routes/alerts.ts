import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { severity, isAcknowledged } = req.query;

    const where: any = {};
    if (severity && severity !== 'All') where.severity = String(severity);
    if (isAcknowledged === 'true') where.isAcknowledged = true;
    if (isAcknowledged === 'false') where.isAcknowledged = false;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { server: true }
    });

    return res.json(alerts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id/ack', authenticateToken, async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: {
        isAcknowledged: true,
        acknowledgedAt: new Date()
      }
    });

    return res.json(alert);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
