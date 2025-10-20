const axios = require('axios')
const logger = require('../logger')

class JenkinsService {
  constructor() {
    this.baseURL = process.env.JENKINS_URL
    this.username = process.env.JENKINS_USERNAME
    this.token = process.env.JENKINS_TOKEN
    this.auth = {
      username: this.username,
      password: this.token
    }
  }

  async getJobs() {
    try {
      const response = await axios.get(`${this.baseURL}/api/json`, {
        auth: this.auth,
        params: { tree: 'jobs[name,color,lastBuild[number,timestamp,result,duration]]' }
      })
      return response.data.jobs
    } catch (error) {
      logger.error('Failed to fetch Jenkins jobs:', error.message)
      throw new Error('Failed to connect to Jenkins')
    }
  }

  async getJob(jobName) {
    try {
      const response = await axios.get(`${this.baseURL}/job/${jobName}/api/json`, {
        auth: this.auth
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch Jenkins job ${jobName}:`, error.message)
      throw new Error(`Failed to fetch job ${jobName}`)
    }
  }

  async buildJob(jobName, parameters = {}) {
    try {
      const url = Object.keys(parameters).length > 0
        ? `${this.baseURL}/job/${jobName}/buildWithParameters`
        : `${this.baseURL}/job/${jobName}/build`

      const response = await axios.post(url, parameters, {
        auth: this.auth,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      return { success: true, queueId: response.headers.location }
    } catch (error) {
      logger.error(`Failed to build Jenkins job ${jobName}:`, error.message)
      throw new Error(`Failed to trigger build for ${jobName}`)
    }
  }

  async getBuildStatus(jobName, buildNumber) {
    try {
      const response = await axios.get(`${this.baseURL}/job/${jobName}/${buildNumber}/api/json`, {
        auth: this.auth
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to get build status for ${jobName}/${buildNumber}:`, error.message)
      throw new Error(`Failed to get build status`)
    }
  }

  async getBuildLog(jobName, buildNumber) {
    try {
      const response = await axios.get(`${this.baseURL}/job/${jobName}/${buildNumber}/consoleText`, {
        auth: this.auth
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to get build log for ${jobName}/${buildNumber}:`, error.message)
      throw new Error(`Failed to get build log`)
    }
  }
}

module.exports = new JenkinsService()
