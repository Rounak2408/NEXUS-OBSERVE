import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';
import topologyRoutes from './routes/topology';
import incidentRoutes from './routes/incidents';
import alertRoutes from './routes/alerts';
import logRoutes from './routes/logs';
import analyticsRoutes from './routes/analytics';
import sreRoutes from './routes/sre';
import fileRoutes from './routes/files';
import teamRoutes from './routes/team';
import settingsRoutes from './routes/settings';
import notificationRoutes from './routes/notifications';
import { startMonitoringEngine } from './services/monitoringEngine';

const app = express();

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'NEXUS OBSERVE Backend API',
    demoMode: CONFIG.DEMO_MODE,
    timestamp: new Date().toISOString()
  });
});

// Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/topology', topologyRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sre', sreRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(CONFIG.PORT, () => {
  console.log(`====================================================`);
  console.log(` NEXUS OBSERVE Cloud Observability Backend Running `);
  console.log(` Port: ${CONFIG.PORT} | DEMO_MODE: ${CONFIG.DEMO_MODE}`);
  console.log(`====================================================`);
  startMonitoringEngine();
});
