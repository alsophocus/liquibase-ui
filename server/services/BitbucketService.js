const axios = require('axios')
const logger = require('../logger')
const IBitbucketService = require('../interfaces/IBitbucketService')

/**
 * Bitbucket Service Implementation
 * Implements Single Responsibility Principle and Dependency Inversion
 */
class BitbucketService extends IBitbucketService {
  constructor(configService) {
    super()
    this.configService = configService
  }

  getConfig() {
    return this.configService.getBitbucketConfig()
  }

  async testConnection() {
    const config = this.getConfig()
    if (!config.enabled || !config.username) {
      throw new Error('Bitbucket not configured')
    }

    try {
      const response = await axios.get(`${config.url}/user`, {
        auth: { username: config.username, password: config.appPassword },
        timeout: 10000
      })
      return { success: true, user: response.data.display_name }
    } catch (error) {
      logger.error('Bitbucket connection test failed:', error.message)
      throw new Error('Failed to connect to Bitbucket')
    }
  }

  async getRepositories() {
    const config = this.getConfig()
    if (!config.enabled) {
      throw new Error('Bitbucket not configured')
    }

    try {
      const response = await axios.get(`${config.url}/repositories/${config.workspace}`, {
        auth: { username: config.username, password: config.appPassword },
        params: { pagelen: 100 }
      })
      return response.data.values
    } catch (error) {
      logger.error('Failed to fetch Bitbucket repositories:', error.message)
      throw new Error('Failed to connect to Bitbucket')
    }
  }

  async getRepository(repoName) {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/repositories/${config.workspace}/${repoName}`, {
        auth: { username: config.username, password: config.appPassword }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch repository ${repoName}:`, error.message)
      throw new Error(`Failed to fetch repository ${repoName}`)
    }
  }

  async getBranches(repoName) {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/repositories/${config.workspace}/${repoName}/refs/branches`, {
        auth: { username: config.username, password: config.appPassword },
        params: { pagelen: 100 }
      })
      return response.data.values
    } catch (error) {
      logger.error(`Failed to fetch branches for ${repoName}:`, error.message)
      throw new Error(`Failed to fetch branches`)
    }
  }

  async getCommits(repoName, branch = 'main') {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/repositories/${config.workspace}/${repoName}/commits/${branch}`, {
        auth: { username: config.username, password: config.appPassword },
        params: { pagelen: 10 }
      })
      return response.data.values
    } catch (error) {
      logger.error(`Failed to fetch commits for ${repoName}:`, error.message)
      throw new Error(`Failed to fetch commits`)
    }
  }

  async getFileContent(repoName, filePath, branch = 'main') {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/repositories/${config.workspace}/${repoName}/src/${branch}/${filePath}`, {
        auth: { username: config.username, password: config.appPassword }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch file ${filePath} from ${repoName}:`, error.message)
      throw new Error(`Failed to fetch file content`)
    }
  }

  async createPullRequest(repoName, data) {
    const config = this.getConfig()
    try {
      const response = await axios.post(`${config.url}/repositories/${config.workspace}/${repoName}/pullrequests`, data, {
        auth: { username: config.username, password: config.appPassword },
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to create pull request for ${repoName}:`, error.message)
      throw new Error(`Failed to create pull request`)
    }
  }
}

module.exports = BitbucketService
