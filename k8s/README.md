# Kubernetes Deployment

## Resilient Architecture Features

### High Availability
- **3 replicas** minimum with pod anti-affinity
- **Rolling updates** with zero downtime
- **Pod Disruption Budget** ensures minimum 2 pods always available
- **Health checks** with liveness and readiness probes

### Auto-Scaling
- **Horizontal Pod Autoscaler** scales 3-10 pods based on CPU/memory
- **Resource requests/limits** for proper scheduling
- **Graceful scaling** policies to prevent thrashing

### Security
- **Network policies** restrict pod-to-pod communication
- **Security context** runs as non-root user
- **SSL termination** at ingress with automatic certificates
- **Secrets management** for sensitive configuration

### Monitoring & Observability
- **Prometheus metrics** via ServiceMonitor
- **Health endpoints** for monitoring
- **Structured logging** to stdout/stderr
- **Resource monitoring** with requests/limits

## Prerequisites

1. **Kubernetes cluster** (1.19+)
2. **NGINX Ingress Controller**
3. **Cert-Manager** (for SSL certificates)
4. **Prometheus Operator** (optional, for monitoring)
5. **Metrics Server** (for HPA)

## Quick Deployment

```bash
# Deploy everything
./deploy.sh

# Or manually:
kubectl apply -f k8s/
```

## Configuration

### 1. Update Secrets
Edit `secret.yaml` with your actual credentials:
```yaml
stringData:
  JWT_SECRET: "your-production-jwt-secret"
  JENKINS_URL: "https://your-jenkins.com"
  JENKINS_TOKEN: "your-api-token"
  # ... other secrets
```

### 2. Update Ingress
Edit `ingress.yaml` with your domain:
```yaml
spec:
  tls:
  - hosts:
    - your-domain.com
  rules:
  - host: your-domain.com
```

### 3. Container Registry
Update `deployment.yaml` with your registry:
```yaml
image: your-registry/liquibase-ui:latest
```

## Scaling Configuration

### Manual Scaling
```bash
kubectl scale deployment liquibase-ui --replicas=5 -n liquibase-ui
```

### Auto-Scaling Tuning
Edit `hpa.yaml` to adjust thresholds:
```yaml
metrics:
- type: Resource
  resource:
    name: cpu
    target:
      averageUtilization: 70  # Scale at 70% CPU
```

## Monitoring

### Check Status
```bash
# Pod status
kubectl get pods -n liquibase-ui

# HPA status
kubectl get hpa -n liquibase-ui

# Events
kubectl get events -n liquibase-ui --sort-by='.lastTimestamp'
```

### View Logs
```bash
# All pods
kubectl logs -n liquibase-ui -l app=liquibase-ui -f

# Specific pod
kubectl logs -n liquibase-ui <pod-name> -f
```

### Resource Usage
```bash
kubectl top pods -n liquibase-ui
kubectl top nodes
```

## Troubleshooting

### Common Issues

1. **Pods not starting**:
   ```bash
   kubectl describe pod <pod-name> -n liquibase-ui
   ```

2. **Database connection issues**:
   ```bash
   kubectl logs -n liquibase-ui -l app=postgres
   ```

3. **Ingress not working**:
   ```bash
   kubectl describe ingress liquibase-ui-ingress -n liquibase-ui
   ```

### Debug Commands
```bash
# Get into a pod
kubectl exec -it <pod-name> -n liquibase-ui -- /bin/sh

# Port forward for local testing
kubectl port-forward svc/liquibase-ui-service 8080:80 -n liquibase-ui
```

## Backup & Recovery

### Database Backup
```bash
kubectl exec -n liquibase-ui postgres-0 -- pg_dump -U liquibase liquibase_ui > backup.sql
```

### Configuration Backup
```bash
kubectl get secret liquibase-ui-secrets -n liquibase-ui -o yaml > secrets-backup.yaml
kubectl get configmap liquibase-ui-config -n liquibase-ui -o yaml > config-backup.yaml
```

## Updates & Rollbacks

### Rolling Update
```bash
kubectl set image deployment/liquibase-ui liquibase-ui=liquibase-ui:v2.0.0 -n liquibase-ui
```

### Rollback
```bash
kubectl rollout undo deployment/liquibase-ui -n liquibase-ui
```

### Check Rollout Status
```bash
kubectl rollout status deployment/liquibase-ui -n liquibase-ui
```

## Resource Requirements

### Minimum Cluster Resources
- **CPU**: 2 cores total
- **Memory**: 4GB total
- **Storage**: 20GB for PostgreSQL
- **Nodes**: 2+ (for anti-affinity)

### Production Recommendations
- **CPU**: 4+ cores
- **Memory**: 8GB+
- **Storage**: 100GB+ SSD
- **Nodes**: 3+ across availability zones
