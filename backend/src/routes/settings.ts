import { Router } from 'express';
import { CONFIG } from '../config';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  return res.json({
    demoMode: CONFIG.DEMO_MODE,
    awsRegion: CONFIG.AWS_REGION,
    integrations: {
      cloudwatch: { connected: true, status: CONFIG.DEMO_MODE ? 'Simulated (Demo Mode)' : 'Active (IAM Role)' },
      s3: { connected: true, status: CONFIG.DEMO_MODE ? 'Simulated (Demo Mode)' : `Active (${CONFIG.AWS_S3_BUCKET})` },
      rds: { connected: true, status: 'Connected (MySQL RDS)' },
      vpc: { connected: true, status: 'vpc-084a9192f1 (us-east-1)' },
      securityGroup: { connected: true, status: 'sg-0a811b74f (Port 3306 & 8080)' }
    }
  });
});

export default router;
