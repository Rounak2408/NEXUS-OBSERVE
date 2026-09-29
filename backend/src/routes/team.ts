import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        incidents: {
          where: { status: { in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'] } },
          select: { id: true, title: true, severity: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
