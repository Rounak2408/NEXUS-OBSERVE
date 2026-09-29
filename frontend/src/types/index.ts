export type Role = 'ADMIN' | 'DEVOPS_ENGINEER' | 'VIEWER';
export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED' | 'CLOSED';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  incidents?: Incident[];
}

export interface Server {
  id: string;
  name: string;
  host: string;
  environment: string;
  serviceType: string;
  monitoringUrl?: string;
  status: ServiceStatus;
  cpuThreshold: number;
  memThreshold: number;
  diskThreshold: number;
  checkInterval: number;
  currentCpu: number;
  currentMemory: number;
  currentDisk: number;
  currentLatency: number;
  uptimePercent: number;
  lastCheckAt: string;
  createdAt: string;
  incidents?: Incident[];
  alerts?: Alert[];
  healthChecks?: HealthCheck[];
  logs?: Log[];
}

export interface Metric {
  id: string;
  serverId: string;
  cpu: number;
  memory: number;
  disk: number;
  latencyMs: number;
  requestsSec: number;
  errorRate: number;
  networkIn: number;
  networkOut: number;
  timestamp: string;
}

export interface HealthCheck {
  id: string;
  serverId: string;
  statusCode: number;
  responseTime: number;
  isHealthy: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  serverId?: string;
  server?: Server;
  title: string;
  message: string;
  severity: Severity;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface IncidentTimeline {
  id: string;
  incidentId: string;
  message: string;
  author: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  serverId?: string;
  server?: Server;
  assignedToId?: string;
  assignedTo?: User;
  startedAt: string;
  resolvedAt?: string;
  durationMins?: number;
  timeline?: IncidentTimeline[];
  createdAt: string;
}

export interface Log {
  id: string;
  serverId?: string;
  server?: {
    name: string;
    serviceType: string;
    host: string;
  };
  level: LogLevel;
  message: string;
  metadata?: string;
  source: string;
  timestamp: string;
}

export interface FileItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  s3Bucket: string;
  category: string;
  environment: string;
  uploadedBy: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Critical' | 'Incident' | 'Recovery' | 'System';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface SREIndicator {
  name: string;
  current: string;
  target: string;
  trend: string;
  status: 'MET' | 'AT_RISK' | 'BREACHED';
  progress: number;
}

export interface SREScorecard {
  overallHealthScore: number;
  sloCompliance: number;
  sloTarget: number;
  sloStatus: string;
  errorBudgetRemaining: string;
  mttr: string;
  mtbf: string;
  indicators: SREIndicator[];
}

export interface TopologyNode {
  id: string;
  name: string;
  serviceType: string;
  status: ServiceStatus;
  latency: number;
  cpu: number;
  memory?: number;
  host?: string;
  environment?: string;
  uptimePercent?: number;
}

export interface TopologyLink {
  source: string;
  target: string;
}
