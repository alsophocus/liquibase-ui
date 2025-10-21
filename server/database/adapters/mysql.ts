import { Client } from "mysql";
import { DatabaseAdapter, DatabaseConnection, QueryResult } from "../adapter.ts";

export class MySQLAdapter implements DatabaseAdapter {
  private client: Client | null = null;
  
  constructor(private config: DatabaseConnection) {}

  async connect(): Promise<void> {
    this.client = await new Client().connect({
      hostname: this.config.host || "localhost",
      port: this.config.port || 3306,
      username: this.config.username,
      password: this.config.password,
      db: this.config.database,
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.client) throw new Error("Database not connected");
    
    try {
      const result = await this.client.execute(sql, params);
      return {
        rows: result.rows || [],
        rowCount: result.affectedRows || 0,
        fields: result.fields?.map(f => f.name) || []
      };
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  async getSchema(): Promise<any> {
    const tables = await this.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [this.config.database]);
    
    const schema: any = {};
    for (const table of tables.rows) {
      const columns = await this.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?
      `, [table.TABLE_NAME, this.config.database]);
      schema[table.TABLE_NAME] = columns.rows;
    }
    
    return schema;
  }
}
