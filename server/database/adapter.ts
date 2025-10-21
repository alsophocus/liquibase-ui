export interface DatabaseConnection {
  id: string;
  name: string;
  type: "sqlite" | "postgresql" | "mysql";
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  connectionString?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  testConnection(): Promise<boolean>;
  getSchema(): Promise<any>;
}

export interface QueryResult {
  rows: any[];
  rowCount: number;
  fields?: string[];
}

export class DatabaseManager {
  private connections = new Map<string, DatabaseAdapter>();
  private activeConnection: string | null = null;

  async addConnection(config: DatabaseConnection): Promise<void> {
    const adapter = await this.createAdapter(config);
    await adapter.connect();
    this.connections.set(config.id, adapter);
    
    if (!this.activeConnection) {
      this.activeConnection = config.id;
    }
  }

  async removeConnection(id: string): Promise<void> {
    const adapter = this.connections.get(id);
    if (adapter) {
      await adapter.disconnect();
      this.connections.delete(id);
      
      if (this.activeConnection === id) {
        this.activeConnection = this.connections.keys().next().value || null;
      }
    }
  }

  async switchConnection(id: string): Promise<void> {
    if (this.connections.has(id)) {
      this.activeConnection = id;
    } else {
      throw new Error(`Connection ${id} not found`);
    }
  }

  getActiveConnection(): DatabaseAdapter | null {
    return this.activeConnection ? this.connections.get(this.activeConnection) || null : null;
  }

  getAllConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  async testConnection(config: DatabaseConnection): Promise<boolean> {
    try {
      const adapter = await this.createAdapter(config);
      await adapter.connect();
      const result = await adapter.testConnection();
      await adapter.disconnect();
      return result;
    } catch {
      return false;
    }
  }

  private async createAdapter(config: DatabaseConnection): Promise<DatabaseAdapter> {
    switch (config.type) {
      case "sqlite":
        const { SQLiteAdapter } = await import("./adapters/sqlite.ts");
        return new SQLiteAdapter(config);
      case "postgresql":
        const { PostgreSQLAdapter } = await import("./adapters/postgresql.ts");
        return new PostgreSQLAdapter(config);
      case "mysql":
        const { MySQLAdapter } = await import("./adapters/mysql.ts");
        return new MySQLAdapter(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}
