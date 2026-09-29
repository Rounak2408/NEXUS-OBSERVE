import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, serverId, level, limit = '100' } = req.query;

    const where: any = {};
    if (serverId && serverId !== 'All') where.serverId = String(serverId);
    if (level && level !== 'All') where.level = String(level);
    if (search) {
      where.OR = [
        { message: { contains: String(search) } },
        { source: { contains: String(search) } }
      ];
    }

    const logs = await prisma.log.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(500, parseInt(String(limit), 10)),
      include: { server: { select: { name: true, serviceType: true, host: true } } }
    });

    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
