const DIContainer = require('./DIContainer')
const { DatabaseConnectionFactory } = require('../factories/DatabaseConnectionFactory')

// Service implementations
const ConfigService = require('../services/ConfigService')
const JenkinsService = require('../services/JenkinsService')
const BitbucketService = require('../services/BitbucketService')
const LiquibaseService = require('../services/LiquibaseService')
const SAMLService = require('../services/SAMLService')

/**
 * Service Registry - Configures Dependency Injection
 * Implements Dependency Inversion Principle
 */
class ServiceRegistry {
  static configure() {
    const container = new DIContainer()

    // Register factories
    container.registerSingleton('databaseConnectionFactory', () => new DatabaseConnectionFactory())

    // Register core services
    container.registerSingleton('configService', () => new ConfigService())

    // Register services with dependencies
    container.registerSingleton('jenkinsService', (configService) => 
      new JenkinsService(configService), ['configService'])

    container.registerSingleton('bitbucketService', (configService) => 
      new BitbucketService(configService), ['configService'])

    container.registerSingleton('liquibaseService', (configService, databaseConnectionFactory) => 
      new LiquibaseService(configService, databaseConnectionFactory), 
      ['configService', 'databaseConnectionFactory'])

    container.registerSingleton('samlService', (configService) => 
      new SAMLService(configService), ['configService'])

    return container
  }
}

module.exports = ServiceRegistry
