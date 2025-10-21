import { DatabaseManager } from "../database/adapter.ts";

// Global database manager instance
export const dbManager = new DatabaseManager();

// Initialize default SQLite connection
export async function initializeDatabase() {
  try {
    await dbManager.addConnection({
      id: "default-sqlite",
      name: "Default SQLite",
      type: "sqlite",
      database: "./liquibase-ui.db",
      isActive: true,
      createdAt: new Date()
    });
    
    console.log("✅ Default database initialized");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}
