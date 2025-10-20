const express = require('express')
const logger = require('../logger')
const { authMiddleware } = require('../auth')
const { validate, schemas } = require('../validation')

/**
 * Configuration Routes
 * Implements Interface Segregation Principle
 */
function createConfigRoutes(configService, jenkinsService, bitbucketService, liquibaseService) {
  const router = express.Router()

  // Get current configuration
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const config = await configService.getConfig()
      // Remove sensitive data from response
      const safeConfig = {
        database: {
          ...config.database,
          password: config.database.password ? '••••••••' : ''
        },
        jenkins: {
          ...config.jenkins,
          token: config.jenkins.token ? '••••••••' : ''
        },
        bitbucket: {
          ...config.bitbucket,
          appPassword: config.bitbucket.appPassword ? '••••••••' : ''
        }
      }
      res.json(safeConfig)
    } catch (error) {
      logger.error('Failed to get configuration:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Database configuration
  router.post('/database', authMiddleware, validate('environment'), async (req, res) => {
    try {
      const dbConfig = await configService.updateDatabaseConfig(req.body)
      res.json({ message: 'Database configuration updated', config: { ...dbConfig, password: '••••••••' } })
    } catch (error) {
      logger.error('Failed to update database config:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post('/database/test', authMiddleware, validate('environment'), async (req, res) => {
    try {
      const result = await liquibaseService.testDatabaseConnection(req.body)
      res.json(result)
    } catch (error) {
      logger.error('Database connection test failed:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Jenkins configuration
  router.post('/jenkins', authMiddleware, async (req, res) => {
    try {
      const { error } = schemas.jenkins.validate(req.body)
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
      }

      const jenkinsConfig = await configService.updateJenkinsConfig(req.body)
      res.json({ message: 'Jenkins configuration updated', config: { ...jenkinsConfig, token: '••••••••' } })
    } catch (error) {
      logger.error('Failed to update Jenkins config:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post('/jenkins/test', authMiddleware, async (req, res) => {
    try {
      const { error } = schemas.jenkins.validate(req.body)
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
      }

      // Temporarily update config for testing
      const originalConfig = await configService.getJenkinsConfig()
      await configService.updateJenkinsConfig(req.body)
      
      try {
        const result = await jenkinsService.testConnection()
        res.json(result)
      } finally {
        // Restore original config
        await configService.updateJenkinsConfig(originalConfig)
      }
    } catch (error) {
      logger.error('Jenkins connection test failed:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Bitbucket configuration
  router.post('/bitbucket', authMiddleware, async (req, res) => {
    try {
      const { error } = schemas.bitbucket.validate(req.body)
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
      }

      const bitbucketConfig = await configService.updateBitbucketConfig(req.body)
      res.json({ message: 'Bitbucket configuration updated', config: { ...bitbucketConfig, appPassword: '••••••••' } })
    } catch (error) {
      logger.error('Failed to update Bitbucket config:', error)
      res.status(500).json({ error: error.message })
    }
  })

  router.post('/bitbucket/test', authMiddleware, async (req, res) => {
    try {
      const { error } = schemas.bitbucket.validate(req.body)
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
      }

      // Temporarily update config for testing
      const originalConfig = await configService.getBitbucketConfig()
      await configService.updateBitbucketConfig(req.body)
      
      try {
        const result = await bitbucketService.testConnection()
        res.json(result)
      } finally {
        // Restore original config
        await configService.updateBitbucketConfig(originalConfig)
      }
    } catch (error) {
      logger.error('Bitbucket connection test failed:', error)
      res.status(500).json({ error: error.message })
    }
  })

  return router
}

module.exports = createConfigRoutes
