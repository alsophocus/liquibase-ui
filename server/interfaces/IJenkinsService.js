/**
 * Jenkins Service Interface
 */
class IJenkinsService {
  async testConnection() {
    throw new Error('Method not implemented')
  }

  async getJobs() {
    throw new Error('Method not implemented')
  }

  async getJob(jobName) {
    throw new Error('Method not implemented')
  }

  async buildJob(jobName, parameters = {}) {
    throw new Error('Method not implemented')
  }

  async getBuildStatus(jobName, buildNumber) {
    throw new Error('Method not implemented')
  }

  async getBuildLog(jobName, buildNumber) {
    throw new Error('Method not implemented')
  }
}

module.exports = IJenkinsService
