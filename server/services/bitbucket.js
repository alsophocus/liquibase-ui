const axios = require('axios')
const logger = require('../logger')

class BitbucketService {
  constructor() {
    this.baseURL = process.env.BITBUCKET_URL || 'https://api.bitbucket.org/2.0'
    this.username = process.env.BITBUCKET_USERNAME
    this.appPassword = process.env.BITBUCKET_APP_PASSWORD
    this.workspace = process.env.BITBUCKET_WORKSPACE
    this.auth = {
      username: this.username,
      password: this.appPassword
    }
  }

  async getRepositories() {
    try {
      const response = await axios.get(`${this.baseURL}/repositories/${this.workspace}`, {
        auth: this.auth,
        params: { pagelen: 100 }
      })
      return response.data.values
    } catch (error) {
      logger.error('Failed to fetch Bitbucket repositories:', error.message)
      throw new Error('Failed to connect to Bitbucket')
    }
  }

  async getRepository(repoName) {
    try {
      const response = await axios.get(`${this.baseURL}/repositories/${this.workspace}/${repoName}`, {
        auth: this.auth
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch repository ${repoName}:`, error.message)
      throw new Error(`Failed to fetch repository ${repoName}`)
    }
  }

  async getBranches(repoName) {
    try {
      const response = await axios.get(`${this.baseURL}/repositories/${this.workspace}/${repoName}/refs/branches`, {
        auth: this.auth,
        params: { pagelen: 100 }
      })
      return response.data.values
    } catch (error) {
      logger.error(`Failed to fetch branches for ${repoName}:`, error.message)
      throw new Error(`Failed to fetch branches`)
    }
  }

  async getCommits(repoName, branch = 'main') {
    try {
      const response = await axios.get(`${this.baseURL}/repositories/${this.workspace}/${repoName}/commits/${branch}`, {
        auth: this.auth,
        params: { pagelen: 10 }
      })
      return response.data.values
    } catch (error) {
      logger.error(`Failed to fetch commits for ${repoName}:`, error.message)
      throw new Error(`Failed to fetch commits`)
    }
  }

  async getFileContent(repoName, filePath, branch = 'main') {
    try {
      const response = await axios.get(`${this.baseURL}/repositories/${this.workspace}/${repoName}/src/${branch}/${filePath}`, {
        auth: this.auth
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch file ${filePath} from ${repoName}:`, error.message)
      throw new Error(`Failed to fetch file content`)
    }
  }

  async createPullRequest(repoName, data) {
    try {
      const response = await axios.post(`${this.baseURL}/repositories/${this.workspace}/${repoName}/pullrequests`, data, {
        auth: this.auth,
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data
    } catch (error) {
      logger.error(`Failed to create pull request for ${repoName}:`, error.message)
      throw new Error(`Failed to create pull request`)
    }
  }
}

module.exports = new BitbucketService()
