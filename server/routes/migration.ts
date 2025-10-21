import { Router } from "oak";
import { dbManager } from "../services/database.ts";
import { LiquibaseService } from "../services/liquibase.ts";

const migrationRouter = new Router();
const liquibaseService = new LiquibaseService();

// Get dashboard statistics
migrationRouter.get("/api/dashboard/stats", async (ctx) => {
  try {
    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.body = {
        databases: 0,
        migrations: 0,
        pending: 0,
        failed: 0
      };
      return;
    }

    const migrations = await db.query("SELECT status FROM migrations");
    const successful = migrations.rows.filter(m => m.status === 'success').length;
    const failed = migrations.rows.filter(m => m.status === 'failed').length;
    const pending = migrations.rows.filter(m => m.status === 'pending').length;

    ctx.response.body = {
      databases: dbManager.getAllConnections().length,
      migrations: successful,
      pending: pending,
      failed: failed
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Get recent activity
migrationRouter.get("/api/dashboard/activity", async (ctx) => {
  try {
    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.body = { activities: [] };
      return;
    }

    const result = await db.query(`
      SELECT filename, status, executed_at, execution_time, error_message
      FROM migrations 
      ORDER BY executed_at DESC 
      LIMIT 10
    `);

    const activities = result.rows.map(row => ({
      id: crypto.randomUUID(),
      title: `Migration ${row.status}`,
      subtitle: row.filename,
      status: row.status,
      time: new Date(row.executed_at).toLocaleString(),
      executionTime: row.execution_time,
      error: row.error_message
    }));

    ctx.response.body = { activities };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Get all migrations
migrationRouter.get("/api/migrations", async (ctx) => {
  try {
    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.body = { migrations: [] };
      return;
    }

    const result = await db.query(`
      SELECT * FROM migrations 
      ORDER BY executed_at DESC
    `);

    ctx.response.body = { migrations: result.rows };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Execute migration
migrationRouter.post("/api/migrations/execute", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { changelogFile, command = "update" } = body;

    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No active database connection" };
      return;
    }

    // Record migration start
    await db.query(
      "INSERT INTO migrations (filename, status) VALUES (?, ?)",
      [changelogFile, "running"]
    );

    const startTime = Date.now();
    
    try {
      const result = await liquibaseService.executeMigration(command, changelogFile);
      const executionTime = Date.now() - startTime;

      // Update migration status
      await db.query(
        "UPDATE migrations SET status = ?, execution_time = ? WHERE filename = ? AND status = ?",
        ["success", executionTime, changelogFile, "running"]
      );

      ctx.response.body = {
        success: true,
        result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Update migration status with error
      await db.query(
        "UPDATE migrations SET status = ?, execution_time = ?, error_message = ? WHERE filename = ? AND status = ?",
        ["failed", executionTime, error.message, changelogFile, "running"]
      );

      throw error;
    }
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false,
      error: error.message 
    };
  }
});

// Get migration status
migrationRouter.get("/api/migrations/status", async (ctx) => {
  try {
    const result = await liquibaseService.getStatus();
    ctx.response.body = { status: result };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Rollback migration
migrationRouter.post("/api/migrations/rollback", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { count = 1 } = body;

    const result = await liquibaseService.rollback(count);
    
    ctx.response.body = {
      success: true,
      result
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false,
      error: error.message 
    };
  }
});

export { migrationRouter };
