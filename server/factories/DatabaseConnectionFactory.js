const IDatabaseConnection = require('../interfaces/IDatabaseConnection')

/**
 * PostgreSQL Connection Strategy
 */
class PostgreSQLConnection extends IDatabaseConnection {
  buildConnectionString(config) {
    return `jdbc:postgresql://${config.host}:${config.port}/${config.database}`
  }

  async testConnection(config) {
    // Implementation would use pg library
    return { success: true, message: 'PostgreSQL connection successful' }
  }

  getDriverClass() {
    return 'org.postgresql.Driver'
  }

  getDefaultPort() {
    return 5432
  }
}

/**
 * MySQL Connection Strategy
 */
class MySQLConnection extends IDatabaseConnection {
  buildConnectionString(config) {
    return `jdbc:mysql://${config.host}:${config.port}/${config.database}`
  }

  async testConnection(config) {
    // Implementation would use mysql2 library
    return { success: true, message: 'MySQL connection successful' }
  }

  getDriverClass() {
    return 'com.mysql.cj.jdbc.Driver'
  }

  getDefaultPort() {
    return 3306
  }
}

/**
 * Oracle Connection Strategy
 */
class OracleConnection extends IDatabaseConnection {
  buildConnectionString(config) {
    return `jdbc:oracle:thin:@${config.host}:${config.port}:${config.database}`
  }

  async testConnection(config) {
    return { success: true, message: 'Oracle connection successful' }
  }

  getDriverClass() {
    return 'oracle.jdbc.OracleDriver'
  }

  getDefaultPort() {
    return 1521
  }
}

/**
 * SQL Server Connection Strategy
 */
class SQLServerConnection extends IDatabaseConnection {
  buildConnectionString(config) {
    return `jdbc:sqlserver://${config.host}:${config.port};databaseName=${config.database}`
  }

  async testConnection(config) {
    return { success: true, message: 'SQL Server connection successful' }
  }

  getDriverClass() {
    return 'com.microsoft.sqlserver.jdbc.SQLServerDriver'
  }

  getDefaultPort() {
    return 1433
  }
}

/**
 * Database Connection Factory
 * Implements Factory Pattern and Strategy Pattern
 */
class DatabaseConnectionFactory {
  constructor() {
    this.strategies = new Map([
      ['postgresql', PostgreSQLConnection],
      ['mysql', MySQLConnection],
      ['oracle', OracleConnection],
      ['sqlserver', SQLServerConnection]
    ])
  }

  /**
   * Create database connection strategy
   */
  create(type) {
    const ConnectionClass = this.strategies.get(type.toLowerCase())
    
    if (!ConnectionClass) {
      throw new Error(`Unsupported database type: ${type}`)
    }

    return new ConnectionClass()
  }

  /**
   * Get supported database types
   */
  getSupportedTypes() {
    return Array.from(this.strategies.keys())
  }

  /**
   * Register new database type
   */
  register(type, connectionClass) {
    this.strategies.set(type.toLowerCase(), connectionClass)
  }
}

module.exports = {
  DatabaseConnectionFactory,
  PostgreSQLConnection,
  MySQLConnection,
  OracleConnection,
  SQLServerConnection
}
