import { Application } from "oak";
import { oakCors } from "cors";
import { authRouter } from "./server/routes/auth.ts";
import { databaseRouter } from "./server/routes/database.ts";
import { migrationRouter } from "./server/routes/migration.ts";
import { staticRouter } from "./server/routes/static.ts";
import { websocketRouter } from "./server/routes/websocket.ts";
import { initializeDatabase } from "./server/services/database.ts";
import { 
  rateLimitMiddleware, 
  inputValidationMiddleware, 
  securityHeadersMiddleware,
  loggingMiddleware 
} from "./server/middleware/security.ts";

const app = new Application();

// Initialize database first
console.log("🔄 Initializing database...");
const dbInitialized = await initializeDatabase();
if (!dbInitialized) {
  console.error("❌ Failed to initialize database. Exiting...");
  Deno.exit(1);
}

// Security middleware
app.use(loggingMiddleware());
app.use(securityHeadersMiddleware());
app.use(rateLimitMiddleware(100, 60000)); // 100 requests per minute
app.use(inputValidationMiddleware());

// CORS middleware
app.use(oakCors({
  origin: true,
  credentials: true,
}));

// Routes
app.use(authRouter.routes());
app.use(databaseRouter.routes());
app.use(migrationRouter.routes());
app.use(websocketRouter.routes());
app.use(staticRouter.routes());

// Global error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Server error:", err);
    
    // Don't expose internal errors in production
    const isDev = Deno.env.get("NODE_ENV") !== "production";
    
    ctx.response.status = err.status || 500;
    ctx.response.body = {
      error: isDev ? err.message : "Internal server error",
      ...(isDev && { stack: err.stack })
    };
  }
});

// 404 handler
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = { error: "Not found" };
});

const PORT = parseInt(Deno.env.get("PORT") || "8000");
console.log(`🚀 Liquibase UI Server running on http://localhost:${PORT}`);
console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
console.log(`🛡️ Security: Rate limiting, input validation, security headers enabled`);

await app.listen({ port: PORT });
