import { Client } from "postgres";
import { DatabaseAdapter, DatabaseConnection, QueryResult } from "../adapter.ts";

export class PostgreSQLAdapter implements DatabaseAdapter {
  private client: Client | null = null;
  
  constructor(private config: DatabaseConnection) {}

  async connect(): Promise<void> {
    this.client = new Client({
      hostname: this.config.host || "localhost",
      port: this.config.port || 5432,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
    });
    
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.client) throw new Error("Database not connected");
    
    try {
      const result = await this.client.queryObject(sql, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.rows.length > 0 ? Object.keys(result.rows[0] as Record<string, any>) : []
      };
    } catch (error) {
      throw new Error(`Query failed: ${(error as Error).message}`);
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
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const schema: any = {};
    for (const table of tables.rows) {
      const columns = await this.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table.table_name]);
      schema[table.table_name] = columns.rows;
    }
    
    return schema;
  }
}
