/**
 * SAML Service Interface
 */
class ISAMLService {
  async initializeStrategy() {
    throw new Error('Method not implemented')
  }

  async validateSAMLResponse(profile) {
    throw new Error('Method not implemented')
  }

  async mapUserAttributes(profile) {
    throw new Error('Method not implemented')
  }

  async getUserRoles(profile) {
    throw new Error('Method not implemented')
  }

  generateMetadata() {
    throw new Error('Method not implemented')
  }
}

module.exports = ISAMLService
