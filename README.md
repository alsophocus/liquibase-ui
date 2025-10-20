# Liquibase UI

Enterprise-grade web interface for managing Liquibase database migrations with Jenkins and Bitbucket integration. Built with SOLID principles, Material Design 3, and production-ready Kubernetes deployment.

## 🚀 Quick Start (Kubernetes)

Deploy the complete stack with one command:

```bash
# Clone repository
git clone https://github.com/alsophocus/liquibase-ui.git
cd liquibase-ui

# Deploy with Helm (Recommended)
helm install liquibase-ui ./helm/liquibase-ui \
  --create-namespace \
  --namespace liquibase-ui

# Access the application
kubectl port-forward svc/liquibase-ui 8080:80 -n liquibase-ui
# Open http://localhost:8080
```

## 📦 What Gets Installed

### Core Application Stack
- **Liquibase UI** (React + Node.js) - 3 replicas with auto-scaling
- **PostgreSQL Database** - Persistent storage with StatefulSet
- **NGINX Ingress** - SSL termination and load balancing
- **SSL Certificates** - Automatic Let's Encrypt certificates

### Integrated Services
- **Jenkins Integration** - Pipeline management and build automation
- **Bitbucket Integration** - Repository and branch management
- **Liquibase CLI** - Database migration execution
- **Prometheus Monitoring** - Metrics collection and alerting

### Kubernetes Resources
```yaml
# Deployed Resources:
- Namespace: liquibase-ui
- Deployment: liquibase-ui (3+ replicas)
- StatefulSet: postgresql
- Services: liquibase-ui-service, postgresql-service
- Ingress: SSL-enabled with automatic certificates
- HPA: Auto-scaling 3-10 pods based on CPU/memory
- PDB: Pod disruption budget for high availability
- NetworkPolicy: Security policies
- ServiceMonitor: Prometheus metrics
- Secrets: Encrypted configuration storage
- ConfigMaps: Application configuration
```

## 🛠️ Prerequisites

### Required
- **Kubernetes 1.19+** (EKS, GKE, AKS, or on-premises)
- **Helm 3.0+** for package management
- **kubectl** configured for your cluster

### Recommended Add-ons
- **NGINX Ingress Controller**
  ```bash
  helm upgrade --install ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --namespace ingress-nginx --create-namespace
  ```

- **Cert-Manager** (for SSL certificates)
  ```bash
  helm install cert-manager jetstack/cert-manager \
    --namespace cert-manager --create-namespace \
    --set installCRDs=true
  ```

- **Prometheus Operator** (for monitoring)
  ```bash
  helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring --create-namespace
  ```

## 🔧 Configuration

### 1. Basic Installation
```bash
# Install with default settings
helm install liquibase-ui ./helm/liquibase-ui
```

### 2. Production Installation
```bash
# Use production values
helm install liquibase-ui ./helm/liquibase-ui \
  --namespace liquibase-ui \
  --create-namespace \
  --values ./helm/liquibase-ui/values-production.yaml
```

### 3. Custom Configuration
```bash
# Customize domain and scaling
helm install liquibase-ui ./helm/liquibase-ui \
  --set ingress.hosts[0].host=liquibase.your-company.com \
  --set autoscaling.maxReplicas=20 \
  --set postgresql.primary.persistence.size=100Gi
```

### 4. External Services
```bash
# Use external PostgreSQL
helm install liquibase-ui ./helm/liquibase-ui \
  --set postgresql.enabled=false \
  --set externalDatabase.host=your-postgres.com \
  --set externalDatabase.database=liquibase_ui
```

## 🌐 Access Methods

### 1. Port Forward (Development)
```bash
kubectl port-forward svc/liquibase-ui 8080:80 -n liquibase-ui
# Access: http://localhost:8080
```

### 2. Ingress (Production)
```bash
# Configure your domain in values.yaml
ingress:
  hosts:
    - host: liquibase.your-company.com
# Access: https://liquibase.your-company.com
```

### 3. Load Balancer
```bash
# Change service type to LoadBalancer
helm upgrade liquibase-ui ./helm/liquibase-ui \
  --set service.type=LoadBalancer
```

## 🔐 Default Credentials

- **Username**: `admin`
- **Password**: `password`

⚠️ **Change default credentials in production!**

## 📊 Monitoring & Management

### Check Deployment Status
```bash
# Overall status
helm status liquibase-ui -n liquibase-ui

# Pod status
kubectl get pods -n liquibase-ui

# Auto-scaling status
kubectl get hpa -n liquibase-ui

# Ingress status
kubectl get ingress -n liquibase-ui
```

### View Logs
```bash
# Application logs
kubectl logs -n liquibase-ui -l app.kubernetes.io/name=liquibase-ui -f

# Database logs
kubectl logs -n liquibase-ui -l app.kubernetes.io/name=postgresql -f
```

### Scale Manually
```bash
# Scale to 5 replicas
kubectl scale deployment liquibase-ui --replicas=5 -n liquibase-ui

# Or via Helm
helm upgrade liquibase-ui ./helm/liquibase-ui \
  --set replicaCount=5
```

## 🔄 Updates & Maintenance

### Upgrade Application
```bash
# Update to new version
helm upgrade liquibase-ui ./helm/liquibase-ui \
  --set image.tag=v2.0.0

# Check rollout status
kubectl rollout status deployment/liquibase-ui -n liquibase-ui
```

### Rollback
```bash
# Rollback to previous version
helm rollback liquibase-ui -n liquibase-ui

# Or specific revision
helm rollback liquibase-ui 1 -n liquibase-ui
```

### Backup Database
```bash
# Create backup
kubectl exec -n liquibase-ui liquibase-ui-postgresql-0 -- \
  pg_dump -U liquibase liquibase_ui > backup-$(date +%Y%m%d).sql
```

## 🏗️ Architecture

### High Availability Features
- **Multi-replica deployment** with pod anti-affinity
- **Auto-scaling** based on CPU and memory usage
- **Rolling updates** with zero downtime
- **Pod disruption budgets** ensure minimum availability
- **Health checks** with automatic restart on failure

### Security Features
- **Network policies** restrict inter-pod communication
- **Non-root containers** with security contexts
- **Encrypted secrets** for sensitive configuration
- **SSL/TLS termination** with automatic certificates
- **Rate limiting** and security headers

### Scalability Features
- **Horizontal pod autoscaler** (3-10 pods default)
- **Persistent storage** with StatefulSets
- **Load balancing** across multiple replicas
- **Resource limits** prevent resource exhaustion

## 🔧 Configuration Options

### Key Helm Values
| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of app replicas | `3` |
| `image.tag` | Application image tag | `latest` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.hosts[0].host` | Application hostname | `liquibase.example.com` |
| `autoscaling.enabled` | Enable auto-scaling | `true` |
| `autoscaling.minReplicas` | Minimum replicas | `3` |
| `autoscaling.maxReplicas` | Maximum replicas | `10` |
| `postgresql.enabled` | Enable PostgreSQL | `true` |
| `postgresql.primary.persistence.size` | Database storage | `10Gi` |
| `monitoring.enabled` | Enable monitoring | `true` |
| `networkPolicy.enabled` | Enable network policies | `true` |

### Environment-Specific Values
- **Development**: `values.yaml` (default)
- **Production**: `values-production.yaml`
- **Custom**: Create your own values file

## 🚨 Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n liquibase-ui
   kubectl logs <pod-name> -n liquibase-ui
   ```

2. **Database connection issues**
   ```bash
   kubectl logs -n liquibase-ui -l app.kubernetes.io/name=postgresql
   kubectl exec -it liquibase-ui-postgresql-0 -n liquibase-ui -- psql -U liquibase
   ```

3. **Ingress not working**
   ```bash
   kubectl describe ingress liquibase-ui -n liquibase-ui
   kubectl get events -n liquibase-ui --sort-by='.lastTimestamp'
   ```

4. **Auto-scaling not working**
   ```bash
   kubectl describe hpa liquibase-ui -n liquibase-ui
   kubectl top pods -n liquibase-ui
   ```

### Debug Commands
```bash
# Get into application pod
kubectl exec -it <pod-name> -n liquibase-ui -- /bin/sh

# Check resource usage
kubectl top pods -n liquibase-ui
kubectl top nodes

# View all resources
kubectl get all -n liquibase-ui
```

## 🗑️ Uninstall

```bash
# Remove application
helm uninstall liquibase-ui -n liquibase-ui

# Remove namespace (optional)
kubectl delete namespace liquibase-ui

# Remove persistent volumes (if needed)
kubectl delete pvc -n liquibase-ui --all
```

## 📚 Additional Resources

- **Helm Chart Documentation**: [helm/README.md](helm/README.md)
- **Kubernetes Manifests**: [k8s/](k8s/)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Documentation**: Available at `/api/health` endpoint

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/alsophocus/liquibase-ui/issues)
- **Documentation**: [Wiki](https://github.com/alsophocus/liquibase-ui/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/alsophocus/liquibase-ui/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
