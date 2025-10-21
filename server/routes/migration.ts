import { Router } from "oak";
import { dbManager } from "../services/database.ts";
import { LiquibaseService } from "../services/liquibase.ts";
import { broadcastUpdate } from "./websocket.ts";

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

// Get chart data for dashboard
migrationRouter.get("/api/dashboard/chart", async (ctx) => {
  try {
    const period = parseInt(ctx.request.url.searchParams.get("period") || "7");
    
    // Generate mock chart data for demo
    const labels = [];
    const successful = [];
    const failed = [];
    
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
      successful.push(Math.floor(Math.random() * 10) + 1);
      failed.push(Math.floor(Math.random() * 3));
    }
    
    ctx.response.body = {
      labels,
      successful,
      failed
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
      time: row.executed_at ? new Date(row.executed_at).toLocaleString() : 'Pending',
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

// Execute migration with real-time updates
migrationRouter.post("/api/migrations/execute", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const { changelogFile, command = "update" } = await body.value;

    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No active database connection" };
      return;
    }

    // Broadcast migration started
    broadcastUpdate({
      type: 'migration_started',
      filename: changelogFile,
      timestamp: new Date().toISOString()
    });

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

      // Broadcast success
      broadcastUpdate({
        type: 'migration_completed',
        filename: changelogFile,
        executionTime,
        timestamp: new Date().toISOString()
      });

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

      // Broadcast failure
      broadcastUpdate({
        type: 'migration_failed',
        filename: changelogFile,
        error: error.message,
        timestamp: new Date().toISOString()
      });

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
    const body = ctx.request.body({ type: "json" });
    const { count = 1 } = await body.value;

    const result = await liquibaseService.rollback(count);
    
    // Broadcast rollback
    broadcastUpdate({
      type: 'migration_rollback',
      count,
      timestamp: new Date().toISOString()
    });
    
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

// Validate changelog
migrationRouter.post("/api/migrations/validate", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const { changelogFile } = await body.value;

    const isValid = await liquibaseService.validateChangelog(changelogFile);
    
    ctx.response.body = {
      success: true,
      valid: isValid,
      message: isValid ? "Changelog is valid" : "Changelog validation failed"
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false,
      error: error.message 
    };
  }
});

// Generate diff
migrationRouter.post("/api/migrations/diff", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const { targetUrl, referenceUrl } = await body.value;

    // Mock diff generation for demo
    const diff = `
-- Liquibase Diff Report
-- Generated: ${new Date().toISOString()}

-- Missing Tables
CREATE TABLE new_table (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Missing Columns
ALTER TABLE existing_table ADD COLUMN new_column VARCHAR(100);

-- Missing Indexes
CREATE INDEX idx_name ON existing_table(name);
    `.trim();
    
    ctx.response.body = {
      success: true,
      diff
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
