const passport = require('passport')
const { Strategy: SamlStrategy } = require('passport-saml')
const logger = require('../logger')
const ISAMLService = require('../interfaces/ISAMLService')

/**
 * SAML Service Implementation
 * Implements Single Responsibility Principle for SAML authentication
 */
class SAMLService extends ISAMLService {
  constructor(configService) {
    super()
    this.configService = configService
    this.strategy = null
  }

  getSAMLConfig() {
    const config = this.configService.getConfig()
    return config.saml || {
      enabled: false,
      entryPoint: process.env.SAML_ENTRY_POINT || '',
      issuer: process.env.SAML_ISSUER || 'liquibase-ui',
      callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3001/auth/saml/callback',
      cert: process.env.SAML_CERT || '',
      privateCert: process.env.SAML_PRIVATE_CERT || '',
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      attributeMapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
      },
      roleMapping: {
        admin: ['Liquibase-Admins', 'Domain Admins'],
        user: ['Liquibase-Users', 'Domain Users']
      }
    }
  }

  async initializeStrategy() {
    const config = this.getSAMLConfig()
    
    if (!config.enabled) {
      logger.info('SAML authentication is disabled')
      return null
    }

    const samlOptions = {
      entryPoint: config.entryPoint,
      issuer: config.issuer,
      callbackUrl: config.callbackUrl,
      cert: config.cert,
      privateCert: config.privateCert,
      identifierFormat: config.identifierFormat,
      acceptedClockSkewMs: 300000, // 5 minutes
      attributeConsumingServiceIndex: false,
      disableRequestedAuthnContext: true,
      forceAuthn: false,
      skipRequestCompression: true,
      authnRequestBinding: 'HTTP-Redirect',
      signatureAlgorithm: 'sha256'
    }

    this.strategy = new SamlStrategy(samlOptions, async (profile, done) => {
      try {
        const user = await this.validateSAMLResponse(profile)
        return done(null, user)
      } catch (error) {
        logger.error('SAML authentication failed:', error)
        return done(error, null)
      }
    })

    passport.use('saml', this.strategy)
    logger.info('SAML strategy initialized')
    return this.strategy
  }

  async validateSAMLResponse(profile) {
    logger.info('Validating SAML response for user:', profile.nameID)
    
    const user = await this.mapUserAttributes(profile)
    const roles = await this.getUserRoles(profile)
    
    return {
      id: user.email,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      roles: roles,
      authMethod: 'saml',
      lastLogin: new Date(),
      profile: profile
    }
  }

  async mapUserAttributes(profile) {
    const config = this.getSAMLConfig()
    const mapping = config.attributeMapping
    
    const user = {
      email: this.getAttributeValue(profile, mapping.email) || profile.nameID,
      firstName: this.getAttributeValue(profile, mapping.firstName) || '',
      lastName: this.getAttributeValue(profile, mapping.lastName) || '',
    }

    // Validate required fields
    if (!user.email) {
      throw new Error('Email is required for SAML authentication')
    }

    return user
  }

  async getUserRoles(profile) {
    const config = this.getSAMLConfig()
    const roleMapping = config.roleMapping
    const userGroups = this.getAttributeValue(profile, config.attributeMapping.groups) || []
    
    const roles = []
    
    // Check admin roles
    if (roleMapping.admin.some(group => userGroups.includes(group))) {
      roles.push('admin')
    }
    
    // Check user roles
    if (roleMapping.user.some(group => userGroups.includes(group))) {
      roles.push('user')
    }
    
    // Default role if no specific roles found
    if (roles.length === 0) {
      roles.push('user')
    }
    
    return roles
  }

  getAttributeValue(profile, attributeName) {
    if (!profile.attributes || !attributeName) {
      return null
    }
    
    const value = profile.attributes[attributeName]
    
    if (Array.isArray(value)) {
      return value.length > 0 ? value : null
    }
    
    return value || null
  }

  generateMetadata() {
    if (!this.strategy) {
      throw new Error('SAML strategy not initialized')
    }
    
    return this.strategy.generateServiceProviderMetadata(
      this.getSAMLConfig().privateCert,
      this.getSAMLConfig().cert
    )
  }

  async logout(req) {
    return new Promise((resolve, reject) => {
      if (!this.strategy) {
        return resolve('/login')
      }
      
      this.strategy.logout(req, (err, url) => {
        if (err) {
          logger.error('SAML logout error:', err)
          return reject(err)
        }
        resolve(url || '/login')
      })
    })
  }
}

module.exports = SAMLService
