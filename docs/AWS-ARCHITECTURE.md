# NEXUS OBSERVE — AWS Architecture Documentation

## 1. System Overview

NEXUS OBSERVE is an enterprise Cloud Observability & SRE Incident Management platform architected for high availability, fault tolerance, and secure telemetry ingestion on Amazon Web Services (AWS).

```
                      +-------------------+
                      |   CloudFront CDN  |
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |  ALB / Edge NGINX |
                      +---------+---------+
                                |
              +-----------------+-----------------+
              |                 |                 |
              v                 v                 v
        +-----------+     +-----------+     +-----------+
        |  Auth API |     | Web API   |     | Worker 01 |
        +-----+-----+     +-----+-----+     +-----+-----+
              |                 |                 |
              +-----------------+-----------------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
   +-------------------+                 +-------------------+
   |  AWS RDS MySQL    |                 |   AWS S3 Bucket   |
   | (Private Subnet)  |                 | (Presigned URLs)  |
   +-------------------+                 +-------------------+
```

## 2. AWS Service Components

### AWS EC2 & Auto Scaling Group
- **Runtimes**: Containerized Node.js TypeScript API backend services hosted on EC2 T3.medium instances behind an Application Load Balancer (ALB).
- **Auto Scaling**: Target tracking policy scaling based on CloudWatch CPUUtilization (> 75%) and RequestCountPerTarget.

### AWS CloudWatch Integration
- **SDK Integration**: Uses `@aws-sdk/client-cloudwatch` (v3).
- **Metrics Ingested**: `CPUUtilization`, `NetworkIn`, `NetworkOut`, `StatusCheckFailed`, `Latency`, `DiskSpaceUtilization`.
- **Alarms**: Triggers automated alert webhooks when metric thresholds cross configured limits.

### AWS S3 File Management
- **Bucket**: `nexus-observe-telemetry-reports`
- **Security**: Public Access Blocked. Uses IAM role-based `@aws-sdk/s3-request-presigner` for generating temporary (1-hour expiry) secure download URLs.
- **Artifact Types**: Diagnostic heap dumps, log archives (`.json.gz`), monthly SLA reports, and raw telemetry CSV exports.

### AWS RDS MySQL Production Database
- **Engine**: MySQL 8.0 Multi-AZ deployment.
- **Networking**: Deployed in Private Subnets with Security Groups restricted to inbound traffic on Port 3306 from EC2 application security groups only.

### AWS IAM & VPC Security
- **IAM Roles**: EC2 Instance Profile attached with `CloudWatchReadOnlyAccess` and `AmazonS3FullAccess` policies (Zero hardcoded credentials in source code).
- **Security Groups**: Minimum privilege rules enforcing strict ingress / egress boundaries.
