/**
 * Liquibase Service Interface
 */
class ILiquibaseService {
  async testDatabaseConnection(dbConfig = null) {
    throw new Error('Method not implemented')
  }

  async update(changelogFile, contexts = '', dbConfig = null) {
    throw new Error('Method not implemented')
  }

  async rollback(changelogFile, tag, dbConfig = null) {
    throw new Error('Method not implemented')
  }

  async status(changelogFile, dbConfig = null) {
    throw new Error('Method not implemented')
  }

  async validate(changelogFile) {
    throw new Error('Method not implemented')
  }

  async generateChangeLog(outputFile, dbConfig = null) {
    throw new Error('Method not implemented')
  }

  async diff(sourceDbConfig, targetDbConfig) {
    throw new Error('Method not implemented')
  }
}

module.exports = ILiquibaseService
