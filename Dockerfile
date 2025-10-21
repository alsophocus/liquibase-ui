FROM denoland/deno:1.38.3

# Set working directory
WORKDIR /app

# Copy dependency files
COPY deno.json deno.lock* ./

# Cache dependencies
RUN deno cache --lock=deno.lock main.ts || deno cache main.ts

# Copy source code
COPY . .

# Create non-root user for security
RUN groupadd -r liquibase && useradd -r -g liquibase liquibase
RUN chown -R liquibase:liquibase /app
USER liquibase

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD deno eval "fetch('http://localhost:8000/api/dashboard/stats').then(r => r.ok ? Deno.exit(0) : Deno.exit(1)).catch(() => Deno.exit(1))"

# Start application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "--allow-run", "main.ts"]
