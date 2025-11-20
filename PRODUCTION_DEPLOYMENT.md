# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Call Center English AI platform to production. The platform is designed to be deployed on cloud platforms like AWS, DigitalOcean, Heroku, or any VPS provider.

---

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Domain name registered and configured
- [ ] SSL/TLS certificate obtained (Let's Encrypt recommended)
- [ ] PostgreSQL database provisioned (managed service recommended)
- [ ] Server/VPS provisioned (minimum 2GB RAM, 2 vCPU)
- [ ] OpenAI API account with sufficient credits
- [ ] Email service configured (optional)
- [ ] CDN configured (optional)
- [ ] Monitoring and logging setup (recommended)

### Code & Configuration
- [ ] All environment variables configured
- [ ] JWT secret changed to strong random string
- [ ] Database URL updated to production database
- [ ] OpenAI API key added
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Error logging configured

### Security
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] Security headers configured

### Testing
- [ ] All API endpoints tested
- [ ] Database connections verified
- [ ] File uploads tested
- [ ] Authentication flow tested
- [ ] Payment flow tested (if enabled)
- [ ] Email notifications tested (if enabled)
- [ ] Error handling verified
- [ ] Performance tested

---

## Deployment Options

### Option 1: AWS EC2 + RDS (Recommended)

#### Step 1: Set Up EC2 Instance

```bash
# Launch EC2 instance (Ubuntu 22.04)
# Instance type: t3.medium or larger
# Storage: 30GB SSD minimum

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL client
sudo apt-get install -y postgresql-client

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

#### Step 2: Set Up RDS Database

```bash
# Create RDS PostgreSQL instance
# Engine: PostgreSQL 14
# Instance class: db.t3.micro (minimum)
# Storage: 20GB
# Backup retention: 7 days
# Multi-AZ: Yes (for production)

# Get RDS endpoint and create database
PGPASSWORD=your-password psql -h your-rds-endpoint.rds.amazonaws.com \
  -U postgres -c "CREATE DATABASE call_center_english_ai_prod;"

# Create user
PGPASSWORD=your-password psql -h your-rds-endpoint.rds.amazonaws.com \
  -U postgres -c "CREATE USER app_user WITH PASSWORD 'strong-password';"

# Grant privileges
PGPASSWORD=your-password psql -h your-rds-endpoint.rds.amazonaws.com \
  -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE call_center_english_ai_prod TO app_user;"
```

#### Step 3: Deploy Application

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/your-repo/call_center_english_ai.git
cd call_center_english_ai

# Install dependencies
pnpm install

# Create production environment file
sudo nano .env.production
# Add all required environment variables

# Build frontend
pnpm build

# Run database migrations
pnpm db:push

# Start application with PM2
sudo npm install -g pm2
pm2 start "pnpm start" --name "call-center-ai"
pm2 startup
pm2 save
```

#### Step 4: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/call-center-ai

# Add the following configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}

# Enable configuration
sudo ln -s /etc/nginx/sites-available/call-center-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Set Up SSL Certificate

```bash
# Obtain SSL certificate with Let's Encrypt
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
sudo systemctl enable certbot.timer
```

### Option 2: DigitalOcean App Platform

```bash
# 1. Create app.yaml in project root
cat > app.yaml << 'EOF'
name: call-center-english-ai
services:
  - name: api
    github:
      repo: your-username/call_center_english_ai
      branch: main
    build_command: pnpm install && pnpm build
    run_command: pnpm start
    http_port: 5000
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${db.connection_string}
      - key: OPENAI_API_KEY
        scope: RUN_TIME
        value: ${OPENAI_API_KEY}

databases:
  - name: db
    engine: PG
    version: "14"
    production: true
EOF

# 2. Deploy to DigitalOcean
doctl apps create --spec app.yaml
```

### Option 3: Heroku Deployment

```bash
# 1. Install Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create your-app-name

# 4. Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-strong-secret
heroku config:set OPENAI_API_KEY=your-api-key

# 6. Create Procfile
cat > Procfile << 'EOF'
web: pnpm start
EOF

# 7. Deploy
git push heroku main
```

---

## Post-Deployment Configuration

### 1. Set Up Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
```

### 2. Configure Backups

```bash
# Set up automated PostgreSQL backups
# For AWS RDS: Enable automated backups in console
# For self-managed: Use pg_dump with cron

# Example cron job for daily backups
0 2 * * * pg_dump -h localhost -U app_user call_center_english_ai_prod | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### 3. Set Up Monitoring & Alerts

```bash
# Option 1: Sentry for error tracking
npm install @sentry/node

# Option 2: DataDog for monitoring
# Option 3: New Relic for APM
```

### 4. Configure Email Notifications

```bash
# Update SMTP configuration in .env.production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Performance Optimization

### 1. Enable Caching

```bash
# Install Redis
sudo apt-get install -y redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Update .env.production
REDIS_URL=redis://localhost:6379
```

### 2. Configure CDN

```bash
# Use CloudFront (AWS) or Cloudflare
# Point static assets to CDN
# Update VITE_API_URL to use CDN for static files
```

### 3. Database Optimization

```bash
# Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_progress_user_id ON userProgress(userId);
CREATE INDEX idx_lessons_module ON lessons(module);

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### 4. Enable Compression

```bash
# Nginx gzip is already configured in the example above
# Verify it's working:
curl -I -H "Accept-Encoding: gzip" https://yourdomain.com
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all other traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt-get install -y fail2ban

# Configure for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates

```bash
# Enable automatic security updates
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Database Security

```bash
# Restrict database access to application server only
# Use security groups in AWS or firewall rules

# Enable SSL for database connections
# Update DATABASE_URL to use sslmode=require
```

---

## Monitoring & Maintenance

### Daily Tasks
- Monitor error logs
- Check API response times
- Verify database connectivity
- Monitor disk space usage

### Weekly Tasks
- Review security logs
- Check backup integrity
- Analyze performance metrics
- Review user feedback

### Monthly Tasks
- Update dependencies
- Security patches
- Database optimization
- Performance tuning

### Quarterly Tasks
- Full security audit
- Capacity planning
- Disaster recovery testing
- Cost optimization

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs call-center-ai

# Check Node.js version
node --version

# Check dependencies
pnpm list

# Rebuild
pnpm install
pnpm build
```

### Database Connection Issues

```bash
# Test connection
psql -h your-rds-endpoint.rds.amazonaws.com -U app_user -d call_center_english_ai_prod

# Check connection string
echo $DATABASE_URL

# Verify security groups (AWS)
# Allow port 5432 from application server
```

### High CPU/Memory Usage

```bash
# Check process usage
pm2 monit

# Check Node.js memory
node --max-old-space-size=2048 server/index.ts

# Check database queries
EXPLAIN ANALYZE SELECT * FROM your_table;
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate expiration
openssl s_client -connect yourdomain.com:443 -showcerts

# Force renewal
sudo certbot renew --force-renewal
```

---

## Rollback Procedure

If deployment fails:

```bash
# Stop current application
pm2 stop call-center-ai

# Revert to previous version
git revert HEAD
git push origin main

# Reinstall dependencies
pnpm install

# Rebuild
pnpm build

# Restart application
pm2 start call-center-ai

# Verify
curl https://yourdomain.com/api/health
```

---

## Scaling Considerations

### Horizontal Scaling

```bash
# Use load balancer (AWS ALB, Nginx)
# Deploy multiple application instances
# Use managed database (RDS)
# Use managed cache (ElastiCache)
```

### Vertical Scaling

```bash
# Increase instance size
# Increase database resources
# Increase memory allocation
# Optimize queries and code
```

---

## Cost Optimization

| Service | Estimated Cost | Optimization |
|---------|---|---|
| **Compute** | $20-50/month | Use t3.micro for low traffic |
| **Database** | $15-30/month | Use db.t3.micro for low traffic |
| **Storage** | $5-10/month | Use S3 with lifecycle policies |
| **CDN** | $5-20/month | Cache static assets |
| **OpenAI** | $10-50/month | Cache responses, optimize prompts |
| **Total** | **$55-160/month** | Implement optimizations |

---

## Support & Documentation

- **API Documentation:** `/api/docs`
- **Health Check:** `GET /api/health`
- **Status Page:** `https://yourdomain.com/status`
- **Error Logs:** `/var/log/call_center_ai/app.log`
- **Database Logs:** CloudWatch (AWS) or system logs

---

## Conclusion

Your Call Center English AI platform is now production-ready. Follow this guide carefully to ensure a smooth deployment. Monitor the application closely after deployment and adjust configurations as needed based on real-world usage patterns.

For support, refer to the comprehensive documentation included in the project repository.

---

**Last Updated:** November 17, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
