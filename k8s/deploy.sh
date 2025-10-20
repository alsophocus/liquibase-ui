#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Liquibase UI to Kubernetes${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Current cluster context:${NC}"
kubectl config current-context

# Confirm deployment
read -p "Deploy to this cluster? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Deployment cancelled${NC}"
    exit 0
fi

# Build and push Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build -t liquibase-ui:latest .

# Tag for registry (update with your registry)
# docker tag liquibase-ui:latest your-registry/liquibase-ui:latest
# docker push your-registry/liquibase-ui:latest

# Apply Kubernetes manifests
echo -e "${YELLOW}📦 Applying Kubernetes manifests...${NC}"

kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
kubectl apply -f network-policy.yaml
kubectl apply -f monitoring.yaml

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/liquibase-ui -n liquibase-ui

# Check pod status
echo -e "${YELLOW}📊 Pod status:${NC}"
kubectl get pods -n liquibase-ui

# Get service information
echo -e "${YELLOW}🌐 Service information:${NC}"
kubectl get svc -n liquibase-ui

# Get ingress information
echo -e "${YELLOW}🔗 Ingress information:${NC}"
kubectl get ingress -n liquibase-ui

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎉 Liquibase UI is now running on Kubernetes${NC}"

# Show logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
kubectl logs -n liquibase-ui -l app=liquibase-ui --tail=10
