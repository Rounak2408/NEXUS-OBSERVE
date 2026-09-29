import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { CONFIG } from '../config';

let cloudwatchClient: CloudWatchClient | null = null;

try {
  if (!CONFIG.DEMO_MODE) {
    cloudwatchClient = new CloudWatchClient({ region: CONFIG.AWS_REGION });
  }
} catch (e) {
  console.warn('[CloudWatch] SDK initialization fallback to DEMO_MODE');
}

export const getCloudWatchMetricData = async (metricName: string, instanceId: string, startTime: Date, endTime: Date) => {
  if (CONFIG.DEMO_MODE || !cloudwatchClient) {
    // Synthetic data generator for demo mode
    const points = [];
    let curr = new Date(startTime);
    let baseVal = metricName === 'CPUUtilization' ? 45 : metricName === 'Latency' ? 140 : 8;

    while (curr <= endTime) {
      const noise = (Math.random() - 0.48) * 10;
      const val = Math.max(2, Math.min(99, +(baseVal + noise).toFixed(2)));
      points.push({
        timestamp: new Date(curr).toISOString(),
        value: val
      });
      curr = new Date(curr.getTime() + 5 * 60 * 1000); // 5 min intervals
    }
    return points;
  }

  try {
    const command = new GetMetricDataCommand({
      MetricDataQueries: [
        {
          Id: 'm1',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: metricName,
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Average'
          }
        }
      ],
      StartTime: startTime,
      EndTime: endTime
    });

    const response = await cloudwatchClient.send(command);
    const results = response.MetricDataResults?.[0];
    if (!results || !results.Timestamps || !results.Values) return [];

    return results.Timestamps.map((t, idx) => ({
      timestamp: t.toISOString(),
      value: results.Values![idx]
    }));
  } catch (err: any) {
    console.error('[CloudWatch Error]', err.message);
    return [];
  }
};
