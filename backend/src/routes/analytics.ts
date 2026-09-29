import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '24H' } = req.query;
    const range = String(timeRange).toUpperCase();

    const servers = await prisma.server.findMany();
    const totalServers = servers.length;
    const healthyCount = servers.filter(s => s.status === 'HEALTHY').length;
    const degradedCount = servers.filter(s => s.status === 'DEGRADED').length;
    const criticalCount = servers.filter(s => s.status === 'CRITICAL').length;

    const activeIncidents = await prisma.incident.count({
      where: { status: { in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'] } }
    });

    const activeAlerts = await prisma.alert.count({
      where: { isAcknowledged: false }
    });

    const avgLatency = Math.round(servers.reduce((acc, s) => acc + s.currentLatency, 0) / (totalServers || 1));
    const avgCpu = +(servers.reduce((acc, s) => acc + s.currentCpu, 0) / (totalServers || 1)).toFixed(1);
    const avgMemory = +(servers.reduce((acc, s) => acc + s.currentMemory, 0) / (totalServers || 1)).toFixed(1);
    const overallUptime = +(servers.reduce((acc, s) => acc + s.uptimePercent, 0) / (totalServers || 1)).toFixed(2);

    // Dynamic trend calculations based on selected timeRange
    const now = Date.now();
    let pointCount = 12;
    let stepMs = 2 * 60 * 60 * 1000; // default 24H -> 2 hour steps
    let timeFormatter = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:00`;

    if (range === '1H') {
      pointCount = 12;
      stepMs = 5 * 60 * 1000; // 5 min steps
      timeFormatter = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else if (range === '6H') {
      pointCount = 12;
      stepMs = 30 * 60 * 1000; // 30 min steps
      timeFormatter = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else if (range === '24H') {
      pointCount = 12;
      stepMs = 2 * 60 * 60 * 1000; // 2 hour steps
      timeFormatter = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:00`;
    } else if (range === '7D') {
      pointCount = 7;
      stepMs = 24 * 60 * 60 * 1000; // 1 day steps
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      timeFormatter = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;
    } else if (range === '30D') {
      pointCount = 10;
      stepMs = 3 * 24 * 60 * 60 * 1000; // 3 day steps
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      timeFormatter = (d: Date) => `${monthNames[d.getMonth()]} ${d.getDate()}`;
    }

    const trends = [];
    for (let i = pointCount - 1; i >= 0; i--) {
      const time = new Date(now - i * stepMs);
      const timeLabel = timeFormatter(time);

      // Noise factor depending on time index
      const seed = Math.sin(i * 1.5) * 20;
      const seedCpu = Math.cos(i * 0.8) * 6;

      const latVal = Math.max(10, Math.floor(avgLatency + seed));
      const cpuVal = Math.max(10, Math.min(99, +(avgCpu + seedCpu).toFixed(1)));
      const memVal = Math.max(15, Math.min(95, +(avgMemory + (Math.sin(i) * 2)).toFixed(1)));
      const errVal = range === '1H' ? +(0.05 + Math.random() * 0.1).toFixed(2) : +(0.15 + (i === 2 ? 1.8 : 0.05)).toFixed(2);

      trends.push({
        time: timeLabel,
        latency: latVal,
        cpu: cpuVal,
        memory: memVal,
        errorRate: errVal,
        availability: +(99.92 + (i === 2 ? -0.08 : 0.01)).toFixed(2)
      });
    }

    return res.json({
      summary: {
        totalServers,
        healthyCount,
        degradedCount,
        criticalCount,
        activeIncidents,
        activeAlerts,
        avgLatency,
        avgCpu,
        avgMemory,
        overallUptime,
      },
      timeRange: range,
      trends
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
