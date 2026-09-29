import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getCloudWatchMetricData } from '../services/cloudwatchService';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { environment, status, serviceType, search } = req.query;

    const whereClause: any = {};
    if (environment && environment !== 'All') whereClause.environment = String(environment);
    if (status && status !== 'All') whereClause.status = String(status);
    if (serviceType && serviceType !== 'All') whereClause.serviceType = String(serviceType);
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { host: { contains: String(search) } },
        { serviceType: { contains: String(search) } }
      ];
    }

    const servers = await prisma.server.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { incidents: { where: { status: { in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'] } } } }
        }
      }
    });

    return res.json(servers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const server = await prisma.server.findUnique({
      where: { id: req.params.id },
      include: {
        incidents: { orderBy: { createdAt: 'desc' }, take: 5, include: { assignedTo: true } },
        alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
        healthChecks: { orderBy: { timestamp: 'desc' }, take: 20 },
        logs: { orderBy: { timestamp: 'desc' }, take: 25 },
      }
    });

    if (!server) return res.status(404).json({ error: 'Service not found' });
    return res.json(server);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id/metrics', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '24H' } = req.query;
    const range = String(timeRange).toUpperCase();
    const server = await prisma.server.findUnique({ where: { id: req.params.id } });
    if (!server) return res.status(404).json({ error: 'Service not found' });

    const now = Date.now();
    let pointCount = 12;
    let stepMs = 2 * 60 * 60 * 1000;

    if (range === '1H') {
      pointCount = 12;
      stepMs = 5 * 60 * 1000; // 5 min steps
    } else if (range === '6H') {
      pointCount = 12;
      stepMs = 30 * 60 * 1000; // 30 min steps
    } else if (range === '24H') {
      pointCount = 12;
      stepMs = 2 * 60 * 60 * 1000; // 2 hour steps
    } else if (range === '7D') {
      pointCount = 14;
      stepMs = 12 * 60 * 60 * 1000; // 12 hour steps
    } else if (range === '30D') {
      pointCount = 15;
      stepMs = 2 * 24 * 60 * 60 * 1000; // 2 day steps
    }

    const generatedMetrics = [];
    for (let i = pointCount - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * stepMs);
      const seed = Math.sin(i * 1.2) * 8;
      const latSeed = Math.cos(i * 1.5) * 25;

      generatedMetrics.push({
        id: `gen-${i}`,
        serverId: server.id,
        cpu: Math.max(10, Math.min(99, +(server.currentCpu + seed).toFixed(1))),
        memory: Math.max(20, Math.min(95, +(server.currentMemory + (seed * 0.5)).toFixed(1))),
        disk: server.currentDisk,
        latencyMs: Math.max(5, Math.floor(server.currentLatency + latSeed)),
        requestsSec: Math.floor(180 + Math.sin(i) * 60),
        errorRate: server.status === 'CRITICAL' ? +(1.8 + Math.random() * 2).toFixed(2) : +(0.02 + Math.random() * 0.1).toFixed(2),
        networkIn: +(3.2 + Math.random() * 2).toFixed(2),
        networkOut: +(11.4 + Math.random() * 4).toFixed(2),
        timestamp: timestamp.toISOString(),
      });
    }

    const cwData = await getCloudWatchMetricData('CPUUtilization', server.host, new Date(now - pointCount * stepMs), new Date());

    return res.json({
      metrics: generatedMetrics,
      cloudwatch: cwData,
      timeRange: range,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

const serviceCreateSchema = z.object({
  name: z.string().min(2),
  host: z.string().min(2),
  environment: z.string(),
  serviceType: z.string(),
  monitoringUrl: z.string().optional(),
  checkInterval: z.number().default(10),
  cpuThreshold: z.number().default(80),
  memThreshold: z.number().default(85),
  diskThreshold: z.number().default(90),
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = serviceCreateSchema.parse(req.body);

    const newServer = await prisma.server.create({
      data: {
        ...data,
        status: 'HEALTHY',
        currentCpu: +(15 + Math.random() * 25).toFixed(1),
        currentMemory: +(30 + Math.random() * 20).toFixed(1),
        currentDisk: +(20 + Math.random() * 15).toFixed(1),
        currentLatency: Math.floor(20 + Math.random() * 50),
        uptimePercent: 99.99,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_SERVICE',
        details: `Registered new service: ${newServer.name} (${newServer.host})`
      }
    });

    return res.status(201).json(newServer);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.server.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Service removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
