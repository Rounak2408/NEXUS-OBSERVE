import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, severity, search } = req.query;

    const where: any = {};
    if (status && status !== 'All') where.status = String(status);
    if (severity && severity !== 'All') where.severity = String(severity);
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } }
      ];
    }

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        server: true,
        assignedTo: true,
        timeline: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });

    return res.json(incidents);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        server: {
          include: {
            metrics: { orderBy: { timestamp: 'desc' }, take: 24 },
            logs: { orderBy: { timestamp: 'desc' }, take: 15 },
            alerts: { orderBy: { createdAt: 'desc' }, take: 10 }
          }
        },
        assignedTo: true,
        timeline: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    return res.json(incident);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

const actionSchema = z.object({
  action: z.enum(['ACKNOWLEDGE', 'ASSIGN', 'ESCALATE', 'RESOLVE', 'CLOSE']),
  assignedToId: z.string().optional(),
  note: z.string().optional()
});

router.put('/:id/action', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { action, assignedToId, note } = actionSchema.parse(req.body);
    const incident = await prisma.incident.findUnique({ where: { id: req.params.id } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    let newStatus = incident.status;
    let timelineMessage = '';
    let resolvedAt = incident.resolvedAt;
    let durationMins = incident.durationMins;

    const authorName = req.user?.name || 'System';

    if (action === 'ACKNOWLEDGE') {
      newStatus = 'IDENTIFIED';
      timelineMessage = `Incident acknowledged by ${authorName}. ${note || ''}`;
    } else if (action === 'ASSIGN') {
      timelineMessage = `Incident assigned to engineer. ${note || ''}`;
    } else if (action === 'ESCALATE') {
      timelineMessage = `Incident escalated to Level 3 SRE Incident Commander by ${authorName}. ${note || ''}`;
    } else if (action === 'RESOLVE') {
      newStatus = 'RESOLVED';
      resolvedAt = new Date();
      durationMins = Math.round((resolvedAt.getTime() - incident.startedAt.getTime()) / 60000);
      timelineMessage = `Incident marked as RESOLVED by ${authorName}. Root cause addressed. ${note || ''}`;
    } else if (action === 'CLOSE') {
      newStatus = 'CLOSED';
      timelineMessage = `Incident ticket officially CLOSED by ${authorName}. Post-mortem review complete.`;
    }

    const updated = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        status: newStatus,
        assignedToId: assignedToId || incident.assignedToId,
        resolvedAt,
        durationMins,
      },
      include: {
        server: true,
        assignedTo: true,
        timeline: { orderBy: { timestamp: 'asc' } }
      }
    });

    await prisma.incidentTimeline.create({
      data: {
        incidentId: incident.id,
        message: timelineMessage.trim(),
        author: authorName,
      }
    });

    return res.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/timeline', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const entry = await prisma.incidentTimeline.create({
      data: {
        incidentId: req.params.id,
        message,
        author: req.user?.name || 'System User'
      }
    });

    return res.status(201).json(entry);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
