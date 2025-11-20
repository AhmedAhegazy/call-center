# Monitoring & Logging Setup Guide

## Overview

This guide provides instructions for setting up comprehensive monitoring, logging, and alerting for the Call Center English AI platform in production.

---

## 1. Application Logging

### PM2 Logging

```bash
# Install PM2 logging module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true

# View logs
pm2 logs call-center-ai
pm2 logs call-center-ai --err
pm2 logs call-center-ai --lines 100
```

### Application-Level Logging

```typescript
// Update server/index.ts with logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Use in routes
logger.info('User logged in', { userId: user.id });
logger.error('Database connection failed', { error: err.message });
```

---

## 2. Error Tracking with Sentry

### Setup

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/tracing

# Install Sentry CLI
npm install -g @sentry/cli
```

### Configuration

```typescript
// server/index.ts
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      app: true,
      request: true,
    }),
  ],
});

// Add Sentry middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### Environment Variable

```bash
# Add to .env.production
SENTRY_DSN=https://your-key@sentry.io/project-id
```

---

## 3. Performance Monitoring with New Relic

### Setup

```bash
# Install New Relic agent
npm install newrelic
```

### Configuration

```javascript
// newrelic.js
exports.config = {
  app_name: ['Call Center English AI'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-api-key',
      'request.headers.x-access-token'
    ]
  }
};
```

### Usage

```typescript
// Import at the top of server/index.ts
require('newrelic');
```

---

## 4. Metrics Collection with Prometheus

### Installation

```bash
# Install Prometheus client
npm install prom-client
```

### Configuration

```typescript
// server/middleware/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const databaseQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users'
});
```

### Metrics Endpoint

```typescript
// server/routes/metrics.ts
import express from 'express';
import { register } from 'prom-client';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

export default router;
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'call-center-ai'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/api/metrics'
```

---

## 5. Visualization with Grafana

### Installation

```bash
# Using Docker
docker run -d -p 3000:3000 grafana/grafana:latest

# Or install directly
sudo apt-get install -y grafana-server
sudo systemctl start grafana-server
```

### Data Source Configuration

1. Go to http://localhost:3000
2. Login with admin/admin
3. Add Prometheus data source:
   - URL: http://localhost:9090
   - Access: Browser

### Create Dashboards

**Dashboard 1: Application Health**
- Request rate (requests/sec)
- Error rate (%)
- Response time (p50, p95, p99)
- Active users

**Dashboard 2: Database Performance**
- Query duration (ms)
- Query count
- Connection pool usage
- Slow queries

**Dashboard 3: Infrastructure**
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O

---

## 6. Alerting

### Prometheus Alerts

```yaml
# alert.rules.yml
groups:
  - name: call-center-ai
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "High response time detected"
          description: "P95 response time is {{ $value }}s"

      - alert: DatabaseDown
        expr: up{job="postgresql"} == 0
        for: 1m
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"
```

### Slack Notifications

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'slack'
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## 7. Database Monitoring

### PostgreSQL Monitoring

```bash
# Install pgAdmin for database monitoring
docker run -d \
  -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4
```

### Query Performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second

-- Check slow queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

---

## 8. Uptime Monitoring

### Uptime Robot

```bash
# Create monitoring endpoint
# GET /api/health

# Configure Uptime Robot:
# 1. Go to https://uptimerobot.com
# 2. Add new monitor
# 3. URL: https://yourdomain.com/api/health
# 4. Interval: 5 minutes
# 5. Alert contacts: email, Slack, etc.
```

### Custom Health Check

```typescript
// server/routes/health.ts
import express from 'express';
import { testConnection } from '../db';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database
    await testConnection();

    // Check OpenAI API
    const openaiStatus = process.env.OPENAI_API_KEY ? 'ok' : 'missing';

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'ok',
      openai: openaiStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

export default router;
```

---

## 9. Log Aggregation with ELK Stack

### Setup

```bash
# Install Elasticsearch
docker run -d \
  -e discovery.type=single-node \
  -p 9200:9200 \
  docker.elastic.co/elasticsearch/elasticsearch:8.0.0

# Install Kibana
docker run -d \
  -p 5601:5601 \
  -e ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
  docker.elastic.co/kibana/kibana:8.0.0

# Install Logstash
docker run -d \
  -p 5000:5000 \
  -v logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
  docker.elastic.co/logstash/logstash:8.0.0
```

### Application Integration

```bash
# Install Winston Elasticsearch transport
npm install winston-elasticsearch
```

```typescript
// Configure Winston to send logs to Elasticsearch
import WinstonElasticsearch from 'winston-elasticsearch';

const esTransport = new WinstonElasticsearch({
  level: 'info',
  clientOpts: { node: 'http://localhost:9200' },
  index: 'call-center-ai-logs',
});

logger.add(esTransport);
```

---

## 10. Backup Monitoring

### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="call_center_english_ai_prod"
DB_USER="app_user"
DB_HOST="your-rds-endpoint.rds.amazonaws.com"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/

# Log backup
echo "Backup completed: $DATE" >> /var/log/backups.log
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
0 2 * * * /usr/local/bin/backup-db.sh
```

### Backup Verification

```bash
# Test restore from backup
# 1. Create test database
# 2. Restore backup
# 3. Verify data integrity
# 4. Delete test database

createdb test_restore
gunzip -c /backups/db_latest.sql.gz | psql test_restore
psql test_restore -c "SELECT COUNT(*) FROM users;"
dropdb test_restore
```

---

## 11. Security Monitoring

### Failed Login Attempts

```sql
-- Monitor failed login attempts
SELECT user_id, COUNT(*) as attempts, MAX(created_at) as last_attempt
FROM audit_logs
WHERE action = 'login_failed'
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 5;
```

### API Rate Limiting

```typescript
// Monitor rate limit violations
const rateLimitViolations = new Counter({
  name: 'rate_limit_violations_total',
  help: 'Total number of rate limit violations',
  labelNames: ['ip_address', 'endpoint']
});
```

---

## 12. Dashboard Examples

### Real-time Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ Call Center English AI - Production Dashboard           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Status: 🟢 HEALTHY                                      │
│ Uptime: 99.95%  |  Requests/sec: 245  |  Errors: 0.2%  │
│                                                         │
│ Response Time (ms)      Database Queries (ms)           │
│ ┌──────────────────┐   ┌──────────────────┐            │
│ │ P50: 45          │   │ P50: 12          │            │
│ │ P95: 120         │   │ P95: 45          │            │
│ │ P99: 250         │   │ P99: 120         │            │
│ └──────────────────┘   └──────────────────┘            │
│                                                         │
│ Active Users: 1,245  |  CPU: 35%  |  Memory: 42%       │
│                                                         │
│ Recent Errors: 0  |  Alerts: 0  |  Last Check: 30s ago │
└─────────────────────────────────────────────────────────┘
```

---

## Monitoring Checklist

- [ ] Application logging configured
- [ ] Error tracking with Sentry enabled
- [ ] Performance monitoring with New Relic/Datadog
- [ ] Metrics collection with Prometheus
- [ ] Visualization with Grafana
- [ ] Alerting configured with Slack
- [ ] Database monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation with ELK
- [ ] Backup monitoring enabled
- [ ] Security monitoring in place
- [ ] Dashboard created and accessible

---

## Support

For monitoring issues:
1. Check logs: `pm2 logs`
2. Verify services: `docker ps`
3. Test endpoints: `curl http://localhost:5000/api/health`
4. Review Grafana dashboards
5. Check Sentry for errors

---

**Last Updated:** November 17, 2025  
**Status:** ✅ Production Ready
