# Liquibase UI - Production Deployment Guide

## Quick Start

### Development
```bash
# Start development server
deno task dev

# Run tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
```

### Production with Docker
```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f liquibase-ui

# Stop services
docker-compose down
```

## Security Features

### 🛡️ Built-in Security
- **Rate Limiting:** 100 requests/minute per IP, 5 login attempts/minute
- **Input Validation:** SQL injection prevention, payload size limits
- **Security Headers:** CSP, XSS protection, frame options
- **Secure Tokens:** Cryptographically secure random tokens
- **Request Logging:** Security event monitoring

### 🔐 Authentication
- **Token Expiration:** 24-hour token lifetime
- **Automatic Cleanup:** Expired tokens removed hourly
- **Secure Generation:** 256-bit random tokens
- **Input Sanitization:** Username/password length limits

## Environment Variables

```bash
# Server Configuration
PORT=8000                    # Server port (default: 8000)
NODE_ENV=production         # Environment mode

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_TYPE=postgresql    # sqlite, postgresql, mysql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=liquibase_db
DATABASE_USER=liquibase
DATABASE_PASSWORD=password

# Security Configuration
JWT_SECRET=your-secret-key
RATE_LIMIT_MAX=100         # Requests per minute
RATE_LIMIT_WINDOW=60000    # Window in milliseconds
```

## Docker Deployment

### Single Container
```bash
# Build image
docker build -t liquibase-ui .

# Run container
docker run -d \
  --name liquibase-ui \
  -p 8000:8000 \
  -e NODE_ENV=production \
  liquibase-ui
```

### Docker Compose (Recommended)
```bash
# Production stack with PostgreSQL and Nginx
docker-compose up -d

# Scale application
docker-compose up -d --scale liquibase-ui=3
```

## Kubernetes Deployment

### Basic Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: liquibase-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: liquibase-ui
  template:
    metadata:
      labels:
        app: liquibase-ui
    spec:
      containers:
      - name: liquibase-ui
        image: liquibase-ui:v0.3.0-alpha
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: liquibase-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/dashboard/stats
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/dashboard/stats
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Performance Optimization

### 🚀 Production Settings
- **Connection Pooling:** Database connection reuse
- **Gzip Compression:** Nginx compression enabled
- **Static Caching:** 1-year cache for assets
- **Rate Limiting:** Prevents abuse and DoS
- **Health Checks:** Container health monitoring

### 📊 Monitoring
```bash
# Application logs
docker-compose logs -f liquibase-ui

# Database logs
docker-compose logs -f postgres

# Nginx access logs
docker-compose logs -f nginx

# System metrics
docker stats
```

## SSL/TLS Configuration

### Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Self-Signed Certificate (Development)
```bash
# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# Update nginx.conf to enable HTTPS
```

## Database Setup

### PostgreSQL (Recommended)
```sql
-- Create database and user
CREATE DATABASE liquibase_db;
CREATE USER liquibase WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE liquibase_db TO liquibase;

-- Connect to database
\c liquibase_db

-- Create tables (handled by application)
```

### MySQL
```sql
CREATE DATABASE liquibase_db;
CREATE USER 'liquibase'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON liquibase_db.* TO 'liquibase'@'%';
FLUSH PRIVILEGES;
```

## Backup Strategy

### Database Backup
```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U liquibase liquibase_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U liquibase liquibase_db < backup.sql
```

### Application Backup
```bash
# Backup configuration and logs
tar -czf liquibase-ui-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml nginx.conf logs/
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs liquibase-ui

# Check port conflicts
netstat -tulpn | grep :8000
```

**Database connection failed:**
```bash
# Test database connectivity
docker-compose exec liquibase-ui deno eval "
  const client = new Client('postgresql://liquibase:password@postgres:5432/liquibase_db');
  await client.connect();
  console.log('Connected successfully');
"
```

**High memory usage:**
```bash
# Monitor container resources
docker stats liquibase-ui

# Adjust memory limits in docker-compose.yml
```

### Performance Tuning

**Database Optimization:**
```sql
-- PostgreSQL performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

**Application Tuning:**
```bash
# Increase file descriptor limits
ulimit -n 65536

# Optimize Deno runtime
export DENO_V8_FLAGS="--max-old-space-size=4096"
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall rules
- [ ] Set up log monitoring
- [ ] Enable database encryption
- [ ] Regular security updates
- [ ] Backup verification
- [ ] Access control review

## Maintenance

### Regular Tasks
```bash
# Update containers
docker-compose pull
docker-compose up -d

# Clean up old images
docker image prune -f

# Rotate logs
docker-compose exec nginx logrotate /etc/logrotate.conf

# Database maintenance
docker-compose exec postgres vacuumdb -U liquibase -d liquibase_db
```

### Health Monitoring
```bash
# Application health
curl -f http://localhost:8000/api/dashboard/stats

# Database health
docker-compose exec postgres pg_isready -U liquibase

# Nginx health
curl -f http://localhost/nginx_status
```
