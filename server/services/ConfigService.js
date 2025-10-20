const fs = require('fs').promises
const path = require('path')
const logger = require('../logger')
const IConfigService = require('../interfaces/IConfigService')

/**
 * Configuration Service Implementation
 * Implements Single Responsibility Principle
 */
class ConfigService extends IConfigService {
  constructor(configPath = null) {
    super()
    this.configFile = configPath || path.join(__dirname, '../config/runtime-config.json')
    this.config = {
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'liquibase_ui',
        username: process.env.DB_USERNAME || 'liquibase',
        password: process.env.DB_PASSWORD || '',
        type: 'postgresql'
      },
      jenkins: {
        url: process.env.JENKINS_URL || '',
        username: process.env.JENKINS_USERNAME || '',
        token: process.env.JENKINS_TOKEN || '',
        enabled: !!process.env.JENKINS_URL
      },
      bitbucket: {
        url: process.env.BITBUCKET_URL || 'https://api.bitbucket.org/2.0',
        username: process.env.BITBUCKET_USERNAME || '',
        appPassword: process.env.BITBUCKET_APP_PASSWORD || '',
        workspace: process.env.BITBUCKET_WORKSPACE || '',
        enabled: !!process.env.BITBUCKET_USERNAME
      }
    }
    this.loadConfig()
  }

  async loadConfig() {
    try {
      const data = await fs.readFile(this.configFile, 'utf8')
      const savedConfig = JSON.parse(data)
      this.config = { ...this.config, ...savedConfig }
      logger.info('Runtime configuration loaded')
    } catch (error) {
      logger.info('No runtime config file found, using environment variables')
      await this.saveConfig()
    }
  }

  async saveConfig() {
    try {
      const configDir = path.dirname(this.configFile)
      await fs.mkdir(configDir, { recursive: true })
      await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2))
      logger.info('Runtime configuration saved')
    } catch (error) {
      logger.error('Failed to save configuration:', error)
      throw error
    }
  }

  async getConfig() {
    return this.config
  }

  async updateDatabaseConfig(dbConfig) {
    this.config.database = { ...this.config.database, ...dbConfig }
    await this.saveConfig()
    return this.config.database
  }

  async updateJenkinsConfig(jenkinsConfig) {
    this.config.jenkins = { ...this.config.jenkins, ...jenkinsConfig }
    await this.saveConfig()
    return this.config.jenkins
  }

  async updateBitbucketConfig(bitbucketConfig) {
    this.config.bitbucket = { ...this.config.bitbucket, ...bitbucketConfig }
    await this.saveConfig()
    return this.config.bitbucket
  }

  getDatabaseConfig() {
    return this.config.database
  }

  getJenkinsConfig() {
    return this.config.jenkins
  }

  getBitbucketConfig() {
    return this.config.bitbucket
  }
}

module.exports = ConfigService
