# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install Liquibase
RUN apk add --no-cache openjdk11-jre wget && \
    wget -O liquibase.tar.gz https://github.com/liquibase/liquibase/releases/download/v4.25.0/liquibase-4.25.0.tar.gz && \
    mkdir /opt/liquibase && \
    tar -xzf liquibase.tar.gz -C /opt/liquibase && \
    ln -s /opt/liquibase/liquibase /usr/local/bin/liquibase && \
    rm liquibase.tar.gz

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S liquibase -u 1001

# Copy built application
COPY --from=builder --chown=liquibase:nodejs /app/dist ./dist
COPY --from=builder --chown=liquibase:nodejs /app/server ./server
COPY --from=builder --chown=liquibase:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=liquibase:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown liquibase:nodejs logs

# Switch to non-root user
USER liquibase

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server/index.js"]
