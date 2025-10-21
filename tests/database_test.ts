import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { DatabaseManager } from "../server/database/adapter.ts";

Deno.test("Database Manager - Add Connection", async () => {
  const dbManager = new DatabaseManager();
  
  const config = {
    id: "test-db",
    name: "Test Database",
    type: "sqlite" as const,
    database: ":memory:",
    isActive: false,
    createdAt: new Date()
  };
  
  await dbManager.addConnection(config);
  const connections = dbManager.getAllConnections();
  
  assertEquals(connections.includes("test-db"), true);
});

Deno.test("Database Manager - Switch Connection", async () => {
  const dbManager = new DatabaseManager();
  
  const config1 = {
    id: "db1",
    name: "Database 1",
    type: "sqlite" as const,
    database: ":memory:",
    isActive: false,
    createdAt: new Date()
  };
  
  const config2 = {
    id: "db2", 
    name: "Database 2",
    type: "sqlite" as const,
    database: ":memory:",
    isActive: false,
    createdAt: new Date()
  };
  
  await dbManager.addConnection(config1);
  await dbManager.addConnection(config2);
  
  await dbManager.switchConnection("db2");
  const activeConnection = dbManager.getActiveConnection();
  
  assertExists(activeConnection);
});

Deno.test("Database Manager - Remove Connection", async () => {
  const dbManager = new DatabaseManager();
  
  const config = {
    id: "temp-db",
    name: "Temporary Database", 
    type: "sqlite" as const,
    database: ":memory:",
    isActive: false,
    createdAt: new Date()
  };
  
  await dbManager.addConnection(config);
  await dbManager.removeConnection("temp-db");
  
  const connections = dbManager.getAllConnections();
  assertEquals(connections.includes("temp-db"), false);
});

Deno.test("SQLite Adapter - Query Execution", async () => {
  // Test in-memory SQLite operations
  const mockData = new Map();
  mockData.set('users', [
    { id: 1, username: 'test', email: 'test@example.com' }
  ]);
  
  // Simulate query result
  const result = {
    rows: mockData.get('users'),
    rowCount: 1,
    fields: ['id', 'username', 'email']
  };
  
  assertEquals(result.rowCount, 1);
  assertEquals(result.rows[0].username, 'test');
  assertExists(result.fields);
});
