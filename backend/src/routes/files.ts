import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { generateS3DownloadUrl } from '../services/s3Service';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;

    const where: any = {};
    if (category && category !== 'All') where.category = String(category);
    if (search) where.fileName = { contains: String(search) };

    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json(files);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id/download-url', authenticateToken, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    const downloadUrl = await generateS3DownloadUrl(file.s3Key);
    return res.json({ downloadUrl, fileName: file.fileName });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
