import { Router } from "oak";
import { dbManager } from "../services/database.ts";
import { DatabaseConnection } from "../database/adapter.ts";

const databaseRouter = new Router();

// Get all database connections
databaseRouter.get("/api/databases", async (ctx) => {
  try {
    const connections = dbManager.getAllConnections();
    ctx.response.body = { connections };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Add new database connection
databaseRouter.post("/api/databases", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const config: DatabaseConnection = {
      id: crypto.randomUUID(),
      name: body.name,
      type: body.type,
      host: body.host,
      port: body.port,
      database: body.database,
      username: body.username,
      password: body.password,
      isActive: false,
      createdAt: new Date()
    };

    await dbManager.addConnection(config);
    
    ctx.response.body = { 
      success: true, 
      connection: config 
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Test database connection
databaseRouter.post("/api/databases/test", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const config: DatabaseConnection = {
      id: "test",
      name: body.name,
      type: body.type,
      host: body.host,
      port: body.port,
      database: body.database,
      username: body.username,
      password: body.password,
      isActive: false,
      createdAt: new Date()
    };

    const isValid = await dbManager.testConnection(config);
    
    ctx.response.body = { 
      success: isValid,
      message: isValid ? "Connection successful" : "Connection failed"
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      message: error.message 
    };
  }
});

// Switch active database connection
databaseRouter.post("/api/databases/:id/activate", async (ctx) => {
  try {
    const id = ctx.params.id;
    await dbManager.switchConnection(id);
    
    ctx.response.body = { 
      success: true,
      message: `Switched to database ${id}`
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Remove database connection
databaseRouter.delete("/api/databases/:id", async (ctx) => {
  try {
    const id = ctx.params.id;
    await dbManager.removeConnection(id);
    
    ctx.response.body = { 
      success: true,
      message: `Database ${id} removed`
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Get database schema
databaseRouter.get("/api/databases/schema", async (ctx) => {
  try {
    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No active database connection" };
      return;
    }

    const schema = await db.getSchema();
    ctx.response.body = { schema };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Execute custom query
databaseRouter.post("/api/databases/query", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { sql, params = [] } = body;

    const db = dbManager.getActiveConnection();
    if (!db) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No active database connection" };
      return;
    }

    const result = await db.query(sql, params);
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

export { databaseRouter };
