/**
 * Configuration Service Interface
 */
class IConfigService {
  async getConfig() {
    throw new Error('Method not implemented')
  }

  async updateDatabaseConfig(config) {
    throw new Error('Method not implemented')
  }

  async updateJenkinsConfig(config) {
    throw new Error('Method not implemented')
  }

  async updateBitbucketConfig(config) {
    throw new Error('Method not implemented')
  }

  getDatabaseConfig() {
    throw new Error('Method not implemented')
  }

  getJenkinsConfig() {
    throw new Error('Method not implemented')
  }

  getBitbucketConfig() {
    throw new Error('Method not implemented')
  }
}

module.exports = IConfigService
