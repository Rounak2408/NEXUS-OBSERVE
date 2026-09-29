import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const servers = await prisma.server.findMany();

    const nodes = [
      {
        id: 'internet',
        name: 'INTERNET TRAFFIC',
        serviceType: 'Internet',
        status: 'HEALTHY',
        latency: 0,
        cpu: 0,
        requests: '12.4k req/s',
        environment: 'Global'
      },
      ...servers.map(s => ({
        id: s.id,
        name: s.name,
        serviceType: s.serviceType,
        status: s.status,
        latency: s.currentLatency,
        cpu: s.currentCpu,
        memory: s.currentMemory,
        host: s.host,
        environment: s.environment,
        uptimePercent: s.uptimePercent,
      }))
    ];

    const cdn = servers.find(s => s.name.includes('CloudFront'))?.id;
    const nginx = servers.find(s => s.name.includes('NGINX'))?.id;
    const auth = servers.find(s => s.name.includes('Auth'))?.id;
    const checkout = servers.find(s => s.name.includes('Checkout'))?.id;
    const payment = servers.find(s => s.name.includes('Payment'))?.id;
    const user = servers.find(s => s.name.includes('User'))?.id;
    const redis = servers.find(s => s.name.includes('Redis'))?.id;
    const rds = servers.find(s => s.name.includes('RDS'))?.id;
    const analytics = servers.find(s => s.name.includes('PostgreSQL'))?.id;
    const worker1 = servers.find(s => s.name.includes('Worker 1'))?.id;
    const worker2 = servers.find(s => s.name.includes('Worker 2'))?.id;
    const kafka = servers.find(s => s.name.includes('Kafka'))?.id;
    const prom = servers.find(s => s.name.includes('Prometheus'))?.id;

    const links = [];

    // Tier 0 -> Tier 1 (Internet to Load Balancers)
    if (cdn) links.push({ source: 'internet', target: cdn });
    if (nginx) links.push({ source: 'internet', target: nginx });
    if (cdn && nginx) links.push({ source: cdn, target: nginx });

    // Tier 1 -> Tier 2 (Load Balancers to Web/Auth APIs)
    if (nginx && auth) links.push({ source: nginx, target: auth });
    if (nginx && checkout) links.push({ source: nginx, target: checkout });
    if (nginx && payment) links.push({ source: nginx, target: payment });
    if (nginx && user) links.push({ source: nginx, target: user });
    if (cdn && auth) links.push({ source: cdn, target: auth });

    // Tier 2 internal & Tier 2 -> Tier 3
    if (checkout && payment) links.push({ source: checkout, target: payment });

    // APIs to Data Stores (Redis & RDS)
    if (auth && redis) links.push({ source: auth, target: redis });
    if (checkout && redis) links.push({ source: checkout, target: redis });
    if (user && redis) links.push({ source: user, target: redis });
    if (checkout && rds) links.push({ source: checkout, target: rds });
    if (payment && rds) links.push({ source: payment, target: rds });
    if (user && rds) links.push({ source: user, target: rds });
    if (auth && rds) links.push({ source: auth, target: rds });

    // Data replication (RDS to Analytics PostgreSQL)
    if (rds && analytics) links.push({ source: rds, target: analytics });

    // Event Streaming & Workers (Checkout -> Kafka -> Workers)
    if (checkout && kafka) links.push({ source: checkout, target: kafka });
    if (payment && kafka) links.push({ source: payment, target: kafka });
    if (kafka && worker1) links.push({ source: kafka, target: worker1 });
    if (kafka && worker2) links.push({ source: kafka, target: worker2 });

    // Monitoring server links (Prometheus probes)
    if (prom && nginx) links.push({ source: nginx, target: prom });
    if (prom && rds) links.push({ source: rds, target: prom });

    return res.json({ nodes, links });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
