# Liquibase UI Helm Chart

This Helm chart deploys Liquibase UI with high availability, auto-scaling, and production-ready features.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- NGINX Ingress Controller
- Cert-Manager (for SSL certificates)
- Prometheus Operator (optional, for monitoring)

## Installation

### Quick Start

```bash
# Add the chart repository (if published)
helm repo add liquibase-ui https://your-repo.com/charts
helm repo update

# Install with default values
helm install liquibase-ui liquibase-ui/liquibase-ui

# Or install from local chart
helm install liquibase-ui ./helm/liquibase-ui
```

### Production Installation

```bash
# Create namespace
kubectl create namespace liquibase-ui

# Install with production values
helm install liquibase-ui ./helm/liquibase-ui \
  --namespace liquibase-ui \
  --values ./helm/liquibase-ui/values-production.yaml
```

### Custom Installation

```bash
# Install with custom values
helm install liquibase-ui ./helm/liquibase-ui \
  --namespace liquibase-ui \
  --set image.tag=v2.0.0 \
  --set ingress.hosts[0].host=liquibase.example.com \
  --set secrets.jenkinsUrl=https://jenkins.example.com
```

## Configuration

### Key Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `3` |
| `image.repository` | Image repository | `liquibase-ui` |
| `image.tag` | Image tag | `latest` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.hosts[0].host` | Hostname | `liquibase.example.com` |
| `autoscaling.enabled` | Enable HPA | `true` |
| `autoscaling.minReplicas` | Minimum replicas | `3` |
| `autoscaling.maxReplicas` | Maximum replicas | `10` |
| `postgresql.enabled` | Enable PostgreSQL | `true` |
| `monitoring.enabled` | Enable monitoring | `true` |
| `networkPolicy.enabled` | Enable network policies | `true` |

### Secrets Configuration

Update these values for production:

```yaml
secrets:
  jwtSecret: "your-production-jwt-secret"
  jenkinsUrl: "https://jenkins.your-company.com"
  jenkinsUsername: "liquibase-user"
  jenkinsToken: "your_jenkins_api_token"
  bitbucketUsername: "your_bitbucket_username"
  bitbucketAppPassword: "your_bitbucket_app_password"
  bitbucketWorkspace: "your_workspace"
```

### Ingress Configuration

```yaml
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: liquibase.your-domain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: liquibase-ui-tls
      hosts:
        - liquibase.your-domain.com
```

## Upgrading

```bash
# Upgrade to new version
helm upgrade liquibase-ui ./helm/liquibase-ui \
  --namespace liquibase-ui \
  --values ./helm/liquibase-ui/values-production.yaml

# Rollback if needed
helm rollback liquibase-ui 1 --namespace liquibase-ui
```

## Monitoring

### Check Status

```bash
# Check deployment status
helm status liquibase-ui --namespace liquibase-ui

# Check pods
kubectl get pods -n liquibase-ui

# Check HPA
kubectl get hpa -n liquibase-ui

# Check ingress
kubectl get ingress -n liquibase-ui
```

### View Logs

```bash
# View application logs
kubectl logs -n liquibase-ui -l app.kubernetes.io/name=liquibase-ui -f

# View PostgreSQL logs
kubectl logs -n liquibase-ui -l app.kubernetes.io/name=postgresql -f
```

### Metrics

If monitoring is enabled, metrics are available at:
- Application health: `/api/health`
- Prometheus metrics: Scraped automatically by ServiceMonitor

## Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment liquibase-ui --replicas=8 -n liquibase-ui

# Or using Helm
helm upgrade liquibase-ui ./helm/liquibase-ui \
  --namespace liquibase-ui \
  --set replicaCount=8
```

### Auto-Scaling Configuration

```yaml
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

## Security

### Network Policies

Network policies are enabled by default and restrict:
- Ingress: Only from ingress controller and same pods
- Egress: Only to PostgreSQL, HTTPS, HTTP, and DNS

### Security Context

Pods run with security hardening:
- Non-root user (1001)
- Read-only root filesystem
- Dropped capabilities
- No privilege escalation

## Backup and Recovery

### Database Backup

```bash
# Create backup
kubectl exec -n liquibase-ui liquibase-ui-postgresql-0 -- \
  pg_dump -U liquibase_prod liquibase_ui_prod > backup.sql

# Restore backup
kubectl exec -i -n liquibase-ui liquibase-ui-postgresql-0 -- \
  psql -U liquibase_prod liquibase_ui_prod < backup.sql
```

### Configuration Backup

```bash
# Backup Helm values
helm get values liquibase-ui -n liquibase-ui > values-backup.yaml

# Backup secrets
kubectl get secret liquibase-ui-secrets -n liquibase-ui -o yaml > secrets-backup.yaml
```

## Troubleshooting

### Common Issues

1. **Pods not starting**:
   ```bash
   kubectl describe pod <pod-name> -n liquibase-ui
   kubectl logs <pod-name> -n liquibase-ui
   ```

2. **Ingress not working**:
   ```bash
   kubectl describe ingress liquibase-ui -n liquibase-ui
   ```

3. **Database connection issues**:
   ```bash
   kubectl logs -n liquibase-ui -l app.kubernetes.io/name=postgresql
   ```

### Debug Commands

```bash
# Get into application pod
kubectl exec -it <pod-name> -n liquibase-ui -- /bin/sh

# Port forward for local testing
kubectl port-forward svc/liquibase-ui 8080:80 -n liquibase-ui

# Check resource usage
kubectl top pods -n liquibase-ui
```

## Uninstallation

```bash
# Uninstall the release
helm uninstall liquibase-ui --namespace liquibase-ui

# Delete namespace (optional)
kubectl delete namespace liquibase-ui
```

## Development

### Testing Changes

```bash
# Lint the chart
helm lint ./helm/liquibase-ui

# Dry run installation
helm install liquibase-ui ./helm/liquibase-ui --dry-run --debug

# Template rendering
helm template liquibase-ui ./helm/liquibase-ui
```

### Packaging

```bash
# Package the chart
helm package ./helm/liquibase-ui

# Generate index
helm repo index .
```
