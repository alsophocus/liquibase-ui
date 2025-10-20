const axios = require('axios')
const logger = require('../logger')
const IJenkinsService = require('../interfaces/IJenkinsService')

/**
 * Jenkins Service Implementation
 * Implements Single Responsibility Principle and Dependency Inversion
 */
class JenkinsService extends IJenkinsService {
  constructor(configService) {
    super()
    this.configService = configService
  }

  getConfig() {
    return this.configService.getJenkinsConfig()
  }

  async testConnection() {
    const config = this.getConfig()
    if (!config.enabled || !config.url) {
      throw new Error('Jenkins not configured')
    }

    try {
      const response = await axios.get(`${config.url}/api/json`, {
        auth: { username: config.username, password: config.token },
        timeout: 10000
      })
      return { success: true, version: response.data.version }
    } catch (error) {
      logger.error('Jenkins connection test failed:', error.message)
      throw new Error('Failed to connect to Jenkins')
    }
  }

  async getJobs() {
    const config = this.getConfig()
    if (!config.enabled) {
      throw new Error('Jenkins not configured')
    }

    try {
      const response = await axios.get(`${config.url}/api/json`, {
        auth: { username: config.username, password: config.token },
        params: { tree: 'jobs[name,color,lastBuild[number,timestamp,result,duration]]' }
      })
      return response.data.jobs
    } catch (error) {
      logger.error('Failed to fetch Jenkins jobs:', error.message)
      throw new Error('Failed to connect to Jenkins')
    }
  }

  async getJob(jobName) {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/job/${jobName}/api/json`, {
        auth: { username: config.username, password: config.token }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch Jenkins job ${jobName}:`, error.message)
      throw new Error(`Failed to fetch job ${jobName}`)
    }
  }

  async buildJob(jobName, parameters = {}) {
    const config = this.getConfig()
    try {
      const url = Object.keys(parameters).length > 0
        ? `${config.url}/job/${jobName}/buildWithParameters`
        : `${config.url}/job/${jobName}/build`

      const response = await axios.post(url, parameters, {
        auth: { username: config.username, password: config.token },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      return { success: true, queueId: response.headers.location }
    } catch (error) {
      logger.error(`Failed to build Jenkins job ${jobName}:`, error.message)
      throw new Error(`Failed to trigger build for ${jobName}`)
    }
  }

  async getBuildStatus(jobName, buildNumber) {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/job/${jobName}/${buildNumber}/api/json`, {
        auth: { username: config.username, password: config.token }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to get build status for ${jobName}/${buildNumber}:`, error.message)
      throw new Error(`Failed to get build status`)
    }
  }

  async getBuildLog(jobName, buildNumber) {
    const config = this.getConfig()
    try {
      const response = await axios.get(`${config.url}/job/${jobName}/${buildNumber}/consoleText`, {
        auth: { username: config.username, password: config.token }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to get build log for ${jobName}/${buildNumber}:`, error.message)
      throw new Error(`Failed to get build log`)
    }
  }
}

module.exports = JenkinsService
