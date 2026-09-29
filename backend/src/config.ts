import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'nexus_observe_jwt_secret_key_2026',
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'nexus-observe-telemetry-reports',
};
