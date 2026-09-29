import { prisma } from '../db';
import { CONFIG } from '../config';

let monitoringInterval: NodeJS.Timeout | null = null;

export const startMonitoringEngine = () => {
  if (monitoringInterval) return;

  console.log(`[Monitoring Engine] Started live monitoring engine (DEMO_MODE=${CONFIG.DEMO_MODE})`);

  monitoringInterval = setInterval(async () => {
    try {
      const servers = await prisma.server.findMany();
      if (servers.length === 0) return;

      for (const server of servers) {
        // Calculate dynamic fluctuations
        let deltaCpu = (Math.random() - 0.49) * 4;
        let deltaMem = (Math.random() - 0.49) * 2;
        let deltaLat = (Math.random() - 0.48) * 15;

        // If server is Checkout API, let's keep it slightly degraded for realism unless resolved
        let targetCpu = Math.max(10, Math.min(99, +(server.currentCpu + deltaCpu).toFixed(1)));
        let targetMem = Math.max(20, Math.min(95, +(server.currentMemory + deltaMem).toFixed(1)));
        let targetDisk = Math.max(15, Math.min(95, +(server.currentDisk + (Math.random() * 0.1)).toFixed(1)));
        let targetLat = Math.max(15, Math.min(1200, +(server.currentLatency + deltaLat).toFixed(0)));
        let reqSec = Math.floor(120 + Math.random() * 400);
        let errorRate = targetCpu > 85 ? +(1.5 + Math.random() * 3.5).toFixed(2) : +(0.01 + Math.random() * 0.2).toFixed(2);

        // Determine status based on thresholds
        let status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
        if (targetCpu >= server.cpuThreshold + 10 || targetMem >= server.memThreshold + 10 || targetLat > 600) {
          status = 'CRITICAL';
        } else if (targetCpu >= server.cpuThreshold || targetMem >= server.memThreshold || targetLat > 350) {
          status = 'DEGRADED';
        }

        // Update server
        await prisma.server.update({
          where: { id: server.id },
          data: {
            currentCpu: targetCpu,
            currentMemory: targetMem,
            currentDisk: targetDisk,
            currentLatency: targetLat,
            status,
            lastCheckAt: new Date(),
          }
        });

        // Insert metric sample
        await prisma.metric.create({
          data: {
            serverId: server.id,
            cpu: targetCpu,
            memory: targetMem,
            disk: targetDisk,
            latencyMs: targetLat,
            requestsSec: reqSec,
            errorRate,
            networkIn: +(2.5 + Math.random() * 5.5).toFixed(2),
            networkOut: +(8.1 + Math.random() * 12.3).toFixed(2),
            timestamp: new Date()
          }
        });

        // Insert HealthCheck
        await prisma.healthCheck.create({
          data: {
            serverId: server.id,
            statusCode: status === 'CRITICAL' ? 503 : status === 'DEGRADED' ? 429 : 200,
            responseTime: targetLat,
            isHealthy: status === 'HEALTHY',
            errorMessage: status === 'CRITICAL' ? 'High latency & CPU bottleneck detected' : null
          }
        });

        // Occasionally generate alert or log if status changed to warning/critical
        if (status === 'CRITICAL' && Math.random() > 0.6) {
          await prisma.alert.create({
            data: {
              serverId: server.id,
              title: `Critical CPU/Latency Threshold Exceeded`,
              message: `${server.name} CPU reached ${targetCpu}% (Threshold: ${server.cpuThreshold}%), Latency ${targetLat}ms`,
              severity: 'CRITICAL',
            }
          });

          await prisma.log.create({
            data: {
              serverId: server.id,
              level: 'ERROR',
              message: `High latency bottleneck detected on ${server.name}: ${targetLat}ms`,
              source: server.serviceType,
              metadata: JSON.stringify({ cpu: targetCpu, memory: targetMem, latencyMs: targetLat })
            }
          });
        }
      }
    } catch (err: any) {
      console.error('[Monitoring Engine Error]', err.message);
    }
  }, 10000); // every 10 sec
};

export const stopMonitoringEngine = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
};
