import { DatabaseAdapter, DatabaseConnection, QueryResult } from "../adapter.ts";

export class SQLiteAdapter implements DatabaseAdapter {
  private data: Map<string, any[]> = new Map();
  
  constructor(private config: DatabaseConnection) {}

  async connect(): Promise<void> {
    // Initialize in-memory data store for demo
    this.data.set('users', [
      { id: 1, username: 'admin', password: 'password', email: 'admin@liquibase.com', created_at: new Date().toISOString() }
    ]);
    
    this.data.set('migrations', [
      { id: 1, filename: 'db.changelog-001.xml', status: 'success', executed_at: new Date().toISOString(), execution_time: 45 },
      { id: 2, filename: 'db.changelog-002.xml', status: 'success', executed_at: new Date().toISOString(), execution_time: 23 },
      { id: 3, filename: 'db.changelog-003.xml', status: 'pending', executed_at: null, execution_time: null }
    ]);
    
    this.data.set('database_connections', []);
  }

  async disconnect(): Promise<void> {
    // Nothing to disconnect for in-memory store
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    // Simple query parser for demo
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.includes('select') && sqlLower.includes('users')) {
      const users = this.data.get('users') || [];
      if (sqlLower.includes('where')) {
        // Handle login query
        const user = users.find(u => u.username === params[0] && u.password === params[1]);
        return {
          rows: user ? [user] : [],
          rowCount: user ? 1 : 0,
          fields: user ? Object.keys(user) : []
        };
      }
      return { rows: users, rowCount: users.length, fields: users.length > 0 ? Object.keys(users[0]) : [] };
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('migrations')) {
      const migrations = this.data.get('migrations') || [];
      return { rows: migrations, rowCount: migrations.length, fields: migrations.length > 0 ? Object.keys(migrations[0]) : [] };
    }
    
    if (sqlLower.includes('insert') && sqlLower.includes('migrations')) {
      const migrations = this.data.get('migrations') || [];
      const newMigration = {
        id: migrations.length + 1,
        filename: params[0],
        status: params[1],
        executed_at: new Date().toISOString(),
        execution_time: null
      };
      migrations.push(newMigration);
      this.data.set('migrations', migrations);
      return { rows: [], rowCount: 1 };
    }
    
    if (sqlLower.includes('update') && sqlLower.includes('migrations')) {
      const migrations = this.data.get('migrations') || [];
      const migration = migrations.find(m => m.filename === params[2] && m.status === params[3]);
      if (migration) {
        migration.status = params[0];
        migration.execution_time = params[1];
        if (params.length > 4) migration.error_message = params[4];
      }
      return { rows: [], rowCount: migration ? 1 : 0 };
    }
    
    // Default response for other queries
    return { rows: [], rowCount: 0 };
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async getSchema(): Promise<any> {
    return {
      users: [
        { name: 'id', type: 'INTEGER', nullable: false },
        { name: 'username', type: 'TEXT', nullable: false },
        { name: 'password', type: 'TEXT', nullable: false },
        { name: 'email', type: 'TEXT', nullable: true }
      ],
      migrations: [
        { name: 'id', type: 'INTEGER', nullable: false },
        { name: 'filename', type: 'TEXT', nullable: false },
        { name: 'status', type: 'TEXT', nullable: false },
        { name: 'executed_at', type: 'DATETIME', nullable: true }
      ]
    };
  }
}
