/**
 * Bitbucket Service Interface
 */
class IBitbucketService {
  async testConnection() {
    throw new Error('Method not implemented')
  }

  async getRepositories() {
    throw new Error('Method not implemented')
  }

  async getRepository(repoName) {
    throw new Error('Method not implemented')
  }

  async getBranches(repoName) {
    throw new Error('Method not implemented')
  }

  async getCommits(repoName, branch = 'main') {
    throw new Error('Method not implemented')
  }

  async getFileContent(repoName, filePath, branch = 'main') {
    throw new Error('Method not implemented')
  }

  async createPullRequest(repoName, data) {
    throw new Error('Method not implemented')
  }
}

module.exports = IBitbucketService
