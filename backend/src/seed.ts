import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('[Seed] Wiping existing database data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.file.deleteMany();
  await prisma.log.deleteMany();
  await prisma.incidentTimeline.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.healthCheck.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.server.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Creating demo users...');
  const passwordHash = await bcrypt.hash('demo123', 10);

  const alex = await prisma.user.create({
    data: {
      email: 'alex.rivera@nexusobserve.io',
      name: 'Alex Rivera',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    }
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah.chen@nexusobserve.io',
      name: 'Sarah Chen',
      passwordHash,
      role: 'DEVOPS_ENGINEER',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    }
  });

  const marcus = await prisma.user.create({
    data: {
      email: 'marcus.vance@nexusobserve.io',
      name: 'Marcus Vance',
      passwordHash,
      role: 'VIEWER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    }
  });

  console.log('[Seed] Creating infrastructure servers & services...');
  const serversData = [
    {
      name: 'AWS CloudFront CDN',
      host: 'cdn.nexusobserve.net',
      environment: 'Production',
      serviceType: 'Load Balancer',
      monitoringUrl: 'https://cdn.nexusobserve.net/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 75,
      memThreshold: 80,
      currentCpu: 28.4,
      currentMemory: 42.1,
      currentDisk: 18.5,
      currentLatency: 12,
      uptimePercent: 99.99,
    },
    {
      name: 'NGINX Edge Load Balancer',
      host: 'lb-prod-01.us-east-1.nexus.internal',
      environment: 'Production',
      serviceType: 'Load Balancer',
      monitoringUrl: 'http://10.0.1.10/nginx_status',
      status: 'HEALTHY' as const,
      cpuThreshold: 80,
      memThreshold: 85,
      currentCpu: 47.2,
      currentMemory: 61.8,
      currentDisk: 32.0,
      currentLatency: 24,
      uptimePercent: 99.98,
    },
    {
      name: 'Auth API Gateway',
      host: 'auth-api.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Auth API',
      monitoringUrl: 'http://10.0.2.14:8080/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 80,
      memThreshold: 85,
      currentCpu: 34.8,
      currentMemory: 55.4,
      currentDisk: 24.1,
      currentLatency: 45,
      uptimePercent: 99.98,
    },
    {
      name: 'Checkout API Service',
      host: 'checkout-api.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Web API',
      monitoringUrl: 'http://10.0.2.22:8080/health',
      status: 'DEGRADED' as const,
      cpuThreshold: 75,
      memThreshold: 80,
      currentCpu: 84.6,
      currentMemory: 82.1,
      currentDisk: 48.9,
      currentLatency: 482,
      uptimePercent: 99.85,
    },
    {
      name: 'Payment Gateway Broker',
      host: 'pay-service.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Payment Gateway',
      monitoringUrl: 'http://10.0.2.35:8080/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 80,
      memThreshold: 85,
      currentCpu: 52.1,
      currentMemory: 58.7,
      currentDisk: 30.2,
      currentLatency: 185,
      uptimePercent: 99.95,
    },
    {
      name: 'User & Profile API',
      host: 'user-api.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Web API',
      monitoringUrl: 'http://10.0.2.40:8080/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 80,
      memThreshold: 85,
      currentCpu: 29.3,
      currentMemory: 44.2,
      currentDisk: 22.8,
      currentLatency: 62,
      uptimePercent: 99.99,
    },
    {
      name: 'Redis L2 Session Cache',
      host: 'redis-primary.cache.nexus.internal',
      environment: 'Production',
      serviceType: 'Redis Cache',
      monitoringUrl: 'http://10.0.3.11:6379/ping',
      status: 'HEALTHY' as const,
      cpuThreshold: 70,
      memThreshold: 85,
      currentCpu: 18.5,
      currentMemory: 69.4,
      currentDisk: 12.1,
      currentLatency: 4,
      uptimePercent: 99.99,
    },
    {
      name: 'AWS RDS MySQL Primary',
      host: 'db-master.rds.us-east-1.amazonaws.com',
      environment: 'Production',
      serviceType: 'Database',
      monitoringUrl: 'http://10.0.4.5:3306/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 85,
      memThreshold: 90,
      currentCpu: 68.2,
      currentMemory: 74.9,
      currentDisk: 61.4,
      currentLatency: 18,
      uptimePercent: 99.99,
    },
    {
      name: 'PostgreSQL Analytics Warehouse',
      host: 'pg-analytics.staging.nexus.internal',
      environment: 'Staging',
      serviceType: 'Database',
      monitoringUrl: 'http://10.0.4.50:5432/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 85,
      memThreshold: 90,
      currentCpu: 41.0,
      currentMemory: 53.6,
      currentDisk: 52.0,
      currentLatency: 32,
      uptimePercent: 99.95,
    },
    {
      name: 'Async Notification Worker 1',
      host: 'worker-01.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Worker',
      monitoringUrl: 'http://10.0.5.12:9090/metrics',
      status: 'HEALTHY' as const,
      cpuThreshold: 90,
      memThreshold: 90,
      currentCpu: 58.7,
      currentMemory: 62.1,
      currentDisk: 38.4,
      currentLatency: 110,
      uptimePercent: 99.90,
    },
    {
      name: 'Telemetry Processing Worker 2',
      host: 'worker-02.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Worker',
      monitoringUrl: 'http://10.0.5.14:9090/metrics',
      status: 'HEALTHY' as const,
      cpuThreshold: 90,
      memThreshold: 90,
      currentCpu: 64.1,
      currentMemory: 68.9,
      currentDisk: 41.2,
      currentLatency: 95,
      uptimePercent: 99.90,
    },
    {
      name: 'Kafka Event Bus Stream',
      host: 'kafka-cluster.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Worker',
      monitoringUrl: 'http://10.0.5.88:9092/health',
      status: 'HEALTHY' as const,
      cpuThreshold: 80,
      memThreshold: 85,
      currentCpu: 31.6,
      currentMemory: 49.3,
      currentDisk: 36.8,
      currentLatency: 14,
      uptimePercent: 99.99,
    },
    {
      name: 'Prometheus & Grafana Server',
      host: 'monitor.prod.nexus.internal',
      environment: 'Production',
      serviceType: 'Monitoring',
      monitoringUrl: 'http://10.0.6.100:9090/-/healthy',
      status: 'HEALTHY' as const,
      cpuThreshold: 80,
      memThreshold: 85,
      currentCpu: 22.4,
      currentMemory: 51.0,
      currentDisk: 72.3,
      currentLatency: 28,
      uptimePercent: 99.99,
    }
  ];

  const createdServers = [];
  for (const s of serversData) {
    const server = await prisma.server.create({ data: s });
    createdServers.push(server);
  }

  const checkoutApiServer = createdServers.find(s => s.name.includes('Checkout API'))!;
  const rdsServer = createdServers.find(s => s.name.includes('RDS'))!;
  const worker2Server = createdServers.find(s => s.name.includes('Worker 2'))!;

  console.log('[Seed] Generating historical 24h metrics...');
  const now = Date.now();
  for (const server of createdServers) {
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000);
      const isCheckout = server.id === checkoutApiServer.id;
      const baseCpu = isCheckout && i < 3 ? 84 : server.currentCpu;
      const baseLat = isCheckout && i < 3 ? 480 : server.currentLatency;

      const cpuVal = Math.max(10, Math.min(98, +(baseCpu + (Math.random() - 0.5) * 12).toFixed(1)));
      const latVal = Math.max(5, Math.min(1000, +(baseLat + (Math.random() - 0.5) * 40).toFixed(0)));

      await prisma.metric.create({
        data: {
          serverId: server.id,
          cpu: cpuVal,
          memory: Math.max(20, Math.min(95, +(server.currentMemory + (Math.random() - 0.5) * 6).toFixed(1))),
          disk: server.currentDisk,
          latencyMs: latVal,
          requestsSec: Math.floor(150 + Math.random() * 300),
          errorRate: isCheckout && i < 3 ? 3.42 : +(Math.random() * 0.15).toFixed(2),
          networkIn: +(3.2 + Math.random() * 4).toFixed(2),
          networkOut: +(11.4 + Math.random() * 8).toFixed(2),
          timestamp: time
        }
      });
    }
  }

  console.log('[Seed] Creating active & historical incidents...');
  const inc1 = await prisma.incident.create({
    data: {
      title: 'Production API latency increased on checkout-api',
      description: 'Checkout API upstream p99 response times spiked to 482ms. Database connection pool under contention during peak checkout flow.',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      serverId: checkoutApiServer.id,
      assignedToId: alex.id,
      startedAt: new Date(now - 18 * 60 * 1000), // 18m ago
      durationMins: 18,
      timeline: {
        create: [
          { message: 'Critical alert triggered for CPU/Latency threshold (482ms)', author: 'System Alert Engine', timestamp: new Date(now - 18 * 60 * 1000) },
          { message: 'Incident automatically opened by CloudWatch Alarms', author: 'AWS CloudWatch', timestamp: new Date(now - 16 * 60 * 1000) },
          { message: 'Incident acknowledged by Alex Rivera', author: 'Alex Rivera', timestamp: new Date(now - 14 * 60 * 1000) },
          { message: 'Assigned lead SRE Alex Rivera to investigate query bottlenecks', author: 'Alex Rivera', timestamp: new Date(now - 12 * 60 * 1000) },
          { message: 'Inspecting database lock state and scaling RDS read replica pool', author: 'Alex Rivera', timestamp: new Date(now - 4 * 60 * 1000) }
        ]
      }
    }
  });

  const inc2 = await prisma.incident.create({
    data: {
      title: 'Database connection pool saturation on RDS Primary',
      description: 'Max connections threshold reached 88% capacity on AWS RDS MySQL Primary. Query queue time slightly elevated.',
      severity: 'HIGH',
      status: 'MONITORING',
      serverId: rdsServer.id,
      assignedToId: sarah.id,
      startedAt: new Date(now - 45 * 60 * 1000),
      durationMins: 45,
      timeline: {
        create: [
          { message: 'Alert triggered for DB active connections', author: 'System Alert Engine', timestamp: new Date(now - 45 * 60 * 1000) },
          { message: 'Sarah Chen assigned to incident', author: 'Sarah Chen', timestamp: new Date(now - 40 * 60 * 1000) },
          { message: 'Increased max_connections pool size dynamically in parameter group', author: 'Sarah Chen', timestamp: new Date(now - 20 * 60 * 1000) },
          { message: 'Traffic stabilizing. Monitoring connection pool metrics.', author: 'Sarah Chen', timestamp: new Date(now - 10 * 60 * 1000) }
        ]
      }
    }
  });

  const inc3 = await prisma.incident.create({
    data: {
      title: 'Memory leak detected on Telemetry Worker 2',
      description: 'Heap memory usage exceeded 85% safety threshold on async telemetry processing worker container.',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      serverId: worker2Server.id,
      assignedToId: sarah.id,
      startedAt: new Date(now - 180 * 60 * 1000),
      resolvedAt: new Date(now - 120 * 60 * 1000),
      durationMins: 60,
      timeline: {
        create: [
          { message: 'Warning alert triggered: Memory > 85%', author: 'System Alert Engine', timestamp: new Date(now - 180 * 60 * 1000) },
          { message: 'Container restarted by ECS Auto-healing task runner', author: 'AWS ECS Agent', timestamp: new Date(now - 150 * 60 * 1000) },
          { message: 'Memory garbage collection patch verified. Issue resolved.', author: 'Sarah Chen', timestamp: new Date(now - 120 * 60 * 1000) }
        ]
      }
    }
  });

  console.log('[Seed] Creating alert stream entries...');
  await prisma.alert.createMany({
    data: [
      {
        serverId: checkoutApiServer.id,
        title: 'CPU threshold exceeded on Checkout API',
        message: 'CPU utilization spiked to 84.6% (Threshold: 75%)',
        severity: 'CRITICAL',
        isAcknowledged: false,
        createdAt: new Date(now - 2 * 60 * 1000)
      },
      {
        serverId: rdsServer.id,
        title: 'Database connection pool warning',
        message: 'Active connections on RDS Primary reached 88%',
        severity: 'HIGH',
        isAcknowledged: true,
        acknowledgedAt: new Date(now - 35 * 60 * 1000),
        createdAt: new Date(now - 45 * 60 * 1000)
      },
      {
        serverId: worker2Server.id,
        title: 'Disk usage warning on Worker Server 2',
        message: 'Partition /var/log filled 78% capacity',
        severity: 'MEDIUM',
        isAcknowledged: true,
        acknowledgedAt: new Date(now - 70 * 60 * 1000),
        createdAt: new Date(now - 90 * 60 * 1000)
      },
      {
        serverId: createdServers[0].id, // CDN
        title: 'TLS Certificate Renewal Notice',
        message: 'Automated ACM certificate auto-renewed successfully',
        severity: 'INFO',
        isAcknowledged: true,
        createdAt: new Date(now - 180 * 60 * 1000)
      }
    ]
  });

  console.log('[Seed] Creating terminal logs...');
  await prisma.log.createMany({
    data: [
      {
        serverId: checkoutApiServer.id,
        level: 'ERROR',
        message: 'Database connection timeout on pool socket 10.0.4.5:3306',
        source: 'checkout-api',
        metadata: JSON.stringify({ timeoutMs: 5000, poolAvailable: 0 }),
        timestamp: new Date(now - 3 * 60 * 1000)
      },
      {
        serverId: checkoutApiServer.id,
        level: 'WARN',
        message: 'CPU utilization reached 84.6% on container checkout-api-v2',
        source: 'cgroup-monitor',
        timestamp: new Date(now - 4 * 60 * 1000)
      },
      {
        serverId: checkoutApiServer.id,
        level: 'INFO',
        message: 'API request completed POST /v1/checkout 184ms HTTP 200',
        source: 'checkout-api',
        timestamp: new Date(now - 5 * 60 * 1000)
      },
      {
        serverId: rdsServer.id,
        level: 'WARN',
        message: 'Slow query detected: SELECT * FROM orders WHERE user_id = ? AND status = ? (Execution time: 1.42s)',
        source: 'mysqld-slow',
        timestamp: new Date(now - 12 * 60 * 1000)
      },
      {
        serverId: createdServers[2].id, // Auth
        level: 'INFO',
        message: 'JWT token validated for user alex.rivera@nexusobserve.io',
        source: 'auth-service',
        timestamp: new Date(now - 15 * 60 * 1000)
      },
      {
        serverId: createdServers[1].id, // NGINX
        level: 'INFO',
        message: '192.168.1.102 - - [29/Sep/2026:16:12:05 +0000] "GET /api/v1/health HTTP/1.1" 200 48',
        source: 'nginx-access',
        timestamp: new Date(now - 20 * 60 * 1000)
      },
      {
        serverId: worker2Server.id,
        level: 'DEBUG',
        message: 'Kafka consumer partition 4 rebalance completed in 12ms',
        source: 'worker-kafka',
        timestamp: new Date(now - 30 * 60 * 1000)
      }
    ]
  });

  console.log('[Seed] Creating S3 file management records...');
  await prisma.file.createMany({
    data: [
      {
        fileName: 'SRE_Monthly_Reliability_Report_Q3_2026.pdf',
        fileSize: 4280192,
        mimeType: 'application/pdf',
        s3Key: 'reports/SRE_Monthly_Reliability_Report_Q3_2026.pdf',
        s3Bucket: 'nexus-observe-telemetry-reports',
        category: 'Report',
        environment: 'Production',
        uploadedBy: 'Alex Rivera',
        createdAt: new Date(now - 24 * 60 * 60 * 1000)
      },
      {
        fileName: 'Production_Metrics_Telemetry_Export_2026-09-28.csv',
        fileSize: 1894102,
        mimeType: 'text/csv',
        s3Key: 'exports/Production_Metrics_Telemetry_Export_2026-09-28.csv',
        s3Bucket: 'nexus-observe-telemetry-reports',
        category: 'CSV Export',
        environment: 'Production',
        uploadedBy: 'System Auto-Backup',
        createdAt: new Date(now - 12 * 60 * 60 * 1000)
      },
      {
        fileName: 'Incident_INC-4091_Diagnostic_HeapDump.bin',
        fileSize: 14890112,
        mimeType: 'application/octet-stream',
        s3Key: 'diagnostics/Incident_INC-4091_Diagnostic_HeapDump.bin',
        s3Bucket: 'nexus-observe-telemetry-reports',
        category: 'Diagnostic File',
        environment: 'Production',
        uploadedBy: 'Alex Rivera',
        createdAt: new Date(now - 15 * 60 * 1000)
      },
      {
        fileName: 'CloudWatch_Raw_Logs_Archive_2026-09-29.json.gz',
        fileSize: 8490112,
        mimeType: 'application/gzip',
        s3Key: 'logs/CloudWatch_Raw_Logs_Archive_2026-09-29.json.gz',
        s3Bucket: 'nexus-observe-telemetry-reports',
        category: 'Log Archive',
        environment: 'Production',
        uploadedBy: 'AWS CloudWatch Exporter',
        createdAt: new Date(now - 2 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('[Seed] Creating notification drawer items...');
  await prisma.notification.createMany({
    data: [
      {
        title: 'Critical Incident INC-4091 Opened',
        message: 'Checkout API latency increased to 482ms',
        category: 'Critical',
        read: false,
        linkUrl: '/incidents'
      },
      {
        title: 'CloudWatch Alarm Triggered',
        message: 'RDS MySQL Primary active connections exceeded 88%',
        category: 'Incident',
        read: false,
        linkUrl: '/alerts'
      },
      {
        title: 'System Recovery Confirmed',
        message: 'Memory usage on Worker Node 2 back to healthy range (64%)',
        category: 'Recovery',
        read: true,
        linkUrl: '/infrastructure'
      },
      {
        title: 'Weekly SRE Scorecard Ready',
        message: 'Overall SLO compliance achieved 99.92% (Target: 99.90%)',
        category: 'System',
        read: true,
        linkUrl: '/sre'
      }
    ]
  });

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
