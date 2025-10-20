/**
 * Database Connection Interface
 */
class IDatabaseConnection {
  buildConnectionString(config) {
    throw new Error('Method not implemented')
  }

  async testConnection(config) {
    throw new Error('Method not implemented')
  }

  getDriverClass() {
    throw new Error('Method not implemented')
  }

  getDefaultPort() {
    throw new Error('Method not implemented')
  }
}

module.exports = IDatabaseConnection
