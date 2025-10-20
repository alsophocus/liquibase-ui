#!/bin/bash

set -e

echo "🚀 Deploying Liquibase UI to Minikube"

# Check if minikube is running
if ! minikube status | grep -q "Running"; then
    echo "❌ Minikube is not running. Please start it with: minikube start"
    exit 1
fi

# Set docker environment to minikube
echo "📦 Setting Docker environment to Minikube"
eval $(minikube docker-env)

# Build Docker image in Minikube
echo "🔨 Building Docker image in Minikube"
docker build -f Dockerfile.minikube -t liquibase-ui:latest .

# Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes"
kubectl apply -f minikube-deploy.yaml

# Wait for deployment
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/liquibase-ui -n liquibase-ui

# Get service URL
echo "🌐 Getting service URL..."
MINIKUBE_IP=$(minikube ip)
NODE_PORT=30080

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Status:"
kubectl get pods -n liquibase-ui
echo ""
echo "🔗 Access URLs:"
echo "   Frontend: http://$MINIKUBE_IP:$NODE_PORT"
echo "   API Health: http://$MINIKUBE_IP:$NODE_PORT/api/health"
echo ""
echo "🔑 Default Login:"
echo "   Username: admin"
echo "   Password: password"
echo ""
echo "📝 Useful commands:"
echo "   View logs: kubectl logs -n liquibase-ui -l app=liquibase-ui -f"
echo "   Port forward: kubectl port-forward svc/liquibase-ui-service 8080:80 -n liquibase-ui"
echo "   Delete: kubectl delete -f minikube-deploy.yaml"
