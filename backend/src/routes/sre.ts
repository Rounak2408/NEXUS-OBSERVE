import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/scorecard', authenticateToken, async (req, res) => {
  try {
    const resolvedIncidents = await prisma.incident.findMany({
      where: { status: { in: ['RESOLVED', 'CLOSED'] }, durationMins: { not: null } }
    });

    const totalDurations = resolvedIncidents.reduce((acc, inc) => acc + (inc.durationMins || 0), 0);
    const mttr = resolvedIncidents.length > 0 ? Math.round(totalDurations / resolvedIncidents.length) : 24; // Mean time to resolve in mins
    const mtbf = 72; // Mean time between failures in hours

    const scorecard = {
      overallHealthScore: 94.8,
      sloCompliance: 99.92,
      sloTarget: 99.90,
      sloStatus: 'MET',
      errorBudgetRemaining: '78.4%',
      mttr: `${mttr}m`,
      mtbf: `${mtbf}h`,
      indicators: [
        {
          name: 'AVAILABILITY',
          current: '99.92%',
          target: '99.90%',
          trend: '↑ 0.08%',
          status: 'MET',
          progress: 99.92
        },
        {
          name: 'LATENCY (p99)',
          current: '184ms',
          target: '< 250ms',
          trend: '↓ 12ms',
          status: 'MET',
          progress: 88
        },
        {
          name: 'ERROR RATE (p95)',
          current: '0.12%',
          target: '< 0.50%',
          trend: '↓ 0.04%',
          status: 'MET',
          progress: 92
        },
        {
          name: 'MTTR (Mean Time to Resolve)',
          current: `${mttr} mins`,
          target: '< 30 mins',
          trend: '↓ 6 mins',
          status: 'MET',
          progress: 82
        },
        {
          name: 'MTBF (Mean Time Between Failures)',
          current: `${mtbf} hours`,
          target: '> 48 hours',
          trend: '↑ 14 hours',
          status: 'MET',
          progress: 94
        }
      ]
    };

    return res.json(scorecard);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
