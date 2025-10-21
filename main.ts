import { Application } from "oak";
import { oakCors } from "cors";
import { authRouter } from "./server/routes/auth.ts";
import { databaseRouter } from "./server/routes/database.ts";
import { migrationRouter } from "./server/routes/migration.ts";
import { staticRouter } from "./server/routes/static.ts";
import { initializeDatabase } from "./server/services/database.ts";

const app = new Application();

// Initialize database first
console.log("🔄 Initializing database...");
const dbInitialized = await initializeDatabase();
if (!dbInitialized) {
  console.error("❌ Failed to initialize database. Exiting...");
  Deno.exit(1);
}

// CORS middleware
app.use(oakCors({
  origin: true,
  credentials: true,
}));

// Routes
app.use(authRouter.routes());
app.use(databaseRouter.routes());
app.use(migrationRouter.routes());
app.use(staticRouter.routes());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Server error:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

const PORT = 8000;
console.log(`🚀 Liquibase UI Server running on http://localhost:${PORT}`);
console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
console.log(`🔐 Login: http://localhost:${PORT}/login.html`);

await app.listen({ port: PORT });
