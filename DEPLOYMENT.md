# Deployment Guide

## Production Deployment Options

### 1. Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- SSL certificates (for HTTPS)
- Environment variables configured

#### Steps

1. **Configure environment variables**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your actual values
   ```

2. **Build and deploy**:
   ```bash
   # Build the Docker image
   npm run docker:build

   # Deploy with Docker Compose
   npm run docker:compose
   ```

3. **SSL Setup**:
   - Place your SSL certificates in the `ssl/` directory
   - Update `nginx.conf` with your domain name
   - Restart the containers

### 2. Manual Deployment

#### Prerequisites
- Node.js 18+ installed
- Liquibase CLI installed
- Nginx or Apache for reverse proxy
- PostgreSQL/MySQL database

#### Steps

1. **Install dependencies**:
   ```bash
   npm ci --production
   ```

2. **Build frontend**:
   ```bash
   npm run build
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

4. **Start the application**:
   ```bash
   npm run start:prod
   ```

5. **Configure reverse proxy** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### 3. Cloud Deployment

#### AWS ECS/Fargate
1. Push Docker image to ECR
2. Create ECS task definition
3. Deploy to ECS cluster
4. Configure ALB for load balancing

#### Kubernetes
1. Build and push Docker image
2. Apply Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/
   ```

## Environment Configuration

### Required Environment Variables

```bash
# Security
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=liquibase_ui
DB_USERNAME=liquibase_user
DB_PASSWORD=secure_password

# Jenkins
JENKINS_URL=https://jenkins.company.com
JENKINS_USERNAME=liquibase-user
JENKINS_TOKEN=your_api_token

# Bitbucket
BITBUCKET_USERNAME=your_username
BITBUCKET_APP_PASSWORD=your_app_password
BITBUCKET_WORKSPACE=your_workspace

# Liquibase
LIQUIBASE_PATH=/usr/local/bin/liquibase
LIQUIBASE_CHANGELOG_PATH=db/changelog/db.changelog-master.xml
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure rate limiting
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable security headers (Helmet.js)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

## Monitoring and Logging

### Application Logs
- Logs are written to `logs/` directory
- Use log aggregation tools (ELK stack, Splunk)
- Monitor error rates and response times

### Health Checks
- Health endpoint: `/api/health`
- Monitor database connectivity
- Check Jenkins/Bitbucket API availability

### Metrics
- Set up application performance monitoring (APM)
- Monitor resource usage (CPU, memory, disk)
- Track migration success/failure rates

## Backup and Recovery

### Database Backups
- Regular automated backups of application database
- Test restore procedures
- Document recovery time objectives (RTO)

### Configuration Backups
- Version control all configuration files
- Backup environment variables securely
- Document deployment procedures

## Scaling Considerations

### Horizontal Scaling
- Application is stateless and can be scaled horizontally
- Use load balancer for multiple instances
- Consider session storage for authentication

### Database Scaling
- Use read replicas for read-heavy workloads
- Consider connection pooling
- Monitor database performance

## Troubleshooting

### Common Issues

1. **Authentication failures**:
   - Check JWT secret configuration
   - Verify token expiration settings

2. **Jenkins/Bitbucket connection issues**:
   - Verify API credentials
   - Check network connectivity
   - Review rate limiting settings

3. **Liquibase execution failures**:
   - Verify Liquibase CLI installation
   - Check database connectivity
   - Review changelog file paths

### Debug Mode
```bash
LOG_LEVEL=debug npm run start:prod
```

### Log Analysis
```bash
# View error logs
tail -f logs/error.log

# View all logs
tail -f logs/combined.log
```
