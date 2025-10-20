const { exec } = require('child_process')
const { promisify } = require('util')
const logger = require('../logger')
const ILiquibaseService = require('../interfaces/ILiquibaseService')

const execAsync = promisify(exec)

/**
 * Liquibase Service Implementation
 * Implements Single Responsibility Principle and Dependency Inversion
 */
class LiquibaseService extends ILiquibaseService {
  constructor(configService, databaseConnectionFactory) {
    super()
    this.configService = configService
    this.databaseConnectionFactory = databaseConnectionFactory
    this.liquibasePath = process.env.LIQUIBASE_PATH || 'liquibase'
  }

  getDatabaseConfig() {
    return this.configService.getDatabaseConfig()
  }

  getDatabaseConnection(config = null) {
    const dbConfig = config || this.getDatabaseConfig()
    return this.databaseConnectionFactory.create(dbConfig.type)
  }

  async testDatabaseConnection(dbConfig = null) {
    const config = dbConfig || this.getDatabaseConfig()
    
    try {
      const connection = this.getDatabaseConnection(config)
      const url = connection.buildConnectionString(config)
      
      const command = [
        this.liquibasePath,
        `--url=${url}`,
        `--username=${config.username}`,
        `--password=${config.password}`,
        'status'
      ].join(' ')

      const result = await this.executeCommand(command)
      return { success: result.success, message: 'Database connection successful' }
    } catch (error) {
      logger.error('Database connection test failed:', error.message)
      throw new Error('Failed to connect to database')
    }
  }

  async executeCommand(command, options = {}) {
    try {
      logger.info(`Executing Liquibase command: ${command}`)
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minutes timeout
        ...options
      })
      
      if (stderr && !stderr.includes('INFO')) {
        logger.warn(`Liquibase stderr: ${stderr}`)
      }
      
      return { success: true, output: stdout, error: stderr }
    } catch (error) {
      logger.error(`Liquibase command failed: ${error.message}`)
      return { success: false, output: error.stdout, error: error.stderr || error.message }
    }
  }

  async update(changelogFile, contexts = '', dbConfig = null) {
    const config = dbConfig || this.getDatabaseConfig()
    const connection = this.getDatabaseConnection(config)
    const url = connection.buildConnectionString(config)
    
    const command = [
      this.liquibasePath,
      `--url=${url}`,
      `--username=${config.username}`,
      `--password=${config.password}`,
      `--changeLogFile=${changelogFile}`,
      contexts ? `--contexts=${contexts}` : '',
      'update'
    ].filter(Boolean).join(' ')

    return await this.executeCommand(command)
  }

  async rollback(changelogFile, tag, dbConfig = null) {
    const config = dbConfig || this.getDatabaseConfig()
    const connection = this.getDatabaseConnection(config)
    const url = connection.buildConnectionString(config)
    
    const command = [
      this.liquibasePath,
      `--url=${url}`,
      `--username=${config.username}`,
      `--password=${config.password}`,
      `--changeLogFile=${changelogFile}`,
      'rollback',
      tag
    ].join(' ')

    return await this.executeCommand(command)
  }

  async status(changelogFile, dbConfig = null) {
    const config = dbConfig || this.getDatabaseConfig()
    const connection = this.getDatabaseConnection(config)
    const url = connection.buildConnectionString(config)
    
    const command = [
      this.liquibasePath,
      `--url=${url}`,
      `--username=${config.username}`,
      `--password=${config.password}`,
      `--changeLogFile=${changelogFile}`,
      'status',
      '--verbose'
    ].join(' ')

    return await this.executeCommand(command)
  }

  async validate(changelogFile) {
    const command = [
      this.liquibasePath,
      `--changeLogFile=${changelogFile}`,
      'validate'
    ].join(' ')

    return await this.executeCommand(command)
  }

  async generateChangeLog(outputFile, dbConfig = null) {
    const config = dbConfig || this.getDatabaseConfig()
    const connection = this.getDatabaseConnection(config)
    const url = connection.buildConnectionString(config)
    
    const command = [
      this.liquibasePath,
      `--url=${url}`,
      `--username=${config.username}`,
      `--password=${config.password}`,
      `--changeLogFile=${outputFile}`,
      'generateChangeLog'
    ].join(' ')

    return await this.executeCommand(command)
  }

  async diff(sourceDbConfig, targetDbConfig) {
    const sourceConnection = this.getDatabaseConnection(sourceDbConfig)
    const targetConnection = this.getDatabaseConnection(targetDbConfig)
    
    const sourceUrl = sourceConnection.buildConnectionString(sourceDbConfig)
    const targetUrl = targetConnection.buildConnectionString(targetDbConfig)
    
    const command = [
      this.liquibasePath,
      `--url=${sourceUrl}`,
      `--username=${sourceDbConfig.username}`,
      `--password=${sourceDbConfig.password}`,
      `--referenceUrl=${targetUrl}`,
      `--referenceUsername=${targetDbConfig.username}`,
      `--referencePassword=${targetDbConfig.password}`,
      'diff'
    ].join(' ')

    return await this.executeCommand(command)
  }
}

module.exports = LiquibaseService
