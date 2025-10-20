const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// Load environment variables
dotenv.config()

// Import DI container and setup
const ServiceRegistry = require('./container/ServiceRegistry')
const logger = require('./logger')
const { authMiddleware, setupSession } = require('./auth')
const { validate, schemas } = require('./validation')

// Initialize dependency injection container
const container = ServiceRegistry.configure()

// Resolve services from container
const configService = container.resolve('configService')
const jenkinsService = container.resolve('jenkinsService')
const bitbucketService = container.resolve('bitbucketService')
const liquibaseService = container.resolve('liquibaseService')
const samlService = container.resolve('samlService')

const app = express()
const PORT = process.env.PORT || 3001

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs')
}

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}))

// Setup session middleware for SAML
setupSession(app)

// Initialize SAML strategy
samlService.initializeStrategy().catch(error => {
  logger.error('Failed to initialize SAML strategy:', error)
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get('User-Agent') })
  next()
})

// Routes
const createConfigRoutes = require('./routes/configRoutes')
const createAuthRoutes = require('./routes/authRoutes')

// Setup routes with dependency injection
app.use('/api/config', createConfigRoutes(configService, jenkinsService, bitbucketService, liquibaseService))
app.use('/auth', createAuthRoutes(configService, samlService))

// Legacy auth routes for backward compatibility
app.use('/api/auth', createAuthRoutes(configService, samlService))

// Authentication Routes
app.post('/api/auth/login', validate('login'), async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await authenticateUser(username, password)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user)
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

// Repository Routes
app.get('/api/repositories', authMiddleware, async (req, res) => {
  try {
    const repositories = await bitbucketService.getRepositories()
    res.json(repositories)
  } catch (error) {
    logger.error('Failed to fetch repositories:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/repositories', authMiddleware, validate('repository'), async (req, res) => {
  try {
    const { name, url, branch } = req.body
    // In production, save to database
    const repository = { id: Date.now(), name, url, branch, createdAt: new Date() }
    res.status(201).json(repository)
  } catch (error) {
    logger.error('Failed to create repository:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/repositories/:repo/branches', authMiddleware, async (req, res) => {
  try {
    const { repo } = req.params
    const branches = await bitbucketService.getBranches(repo)
    res.json(branches)
  } catch (error) {
    logger.error('Failed to fetch branches:', error)
    res.status(500).json({ error: error.message })
  }
})

// Pipeline Routes
app.get('/api/pipelines', authMiddleware, async (req, res) => {
  try {
    const jobs = await jenkinsService.getJobs()
    res.json(jobs)
  } catch (error) {
    logger.error('Failed to fetch pipelines:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/pipelines/:id/run', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { parameters } = req.body
    const result = await jenkinsService.buildJob(id, parameters)
    res.json(result)
  } catch (error) {
    logger.error('Failed to run pipeline:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/pipelines/:job/:build/status', authMiddleware, async (req, res) => {
  try {
    const { job, build } = req.params
    const status = await jenkinsService.getBuildStatus(job, build)
    res.json(status)
  } catch (error) {
    logger.error('Failed to get build status:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/pipelines/:job/:build/logs', authMiddleware, async (req, res) => {
  try {
    const { job, build } = req.params
    const logs = await jenkinsService.getBuildLog(job, build)
    res.json({ logs })
  } catch (error) {
    logger.error('Failed to get build logs:', error)
    res.status(500).json({ error: error.message })
  }
})

// Environment Routes
app.get('/api/environments', authMiddleware, async (req, res) => {
  try {
    // In production, fetch from database
    const environments = [
      {
        id: 1,
        name: 'Production',
        dbType: 'postgresql',
        host: process.env.PROD_DB_HOST,
        port: process.env.PROD_DB_PORT,
        database: process.env.PROD_DB_NAME
      }
    ]
    res.json(environments)
  } catch (error) {
    logger.error('Failed to fetch environments:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/environments', authMiddleware, validate('environment'), async (req, res) => {
  try {
    const environment = { id: Date.now(), ...req.body, createdAt: new Date() }
    // In production, save to database
    res.status(201).json(environment)
  } catch (error) {
    logger.error('Failed to create environment:', error)
    res.status(500).json({ error: error.message })
  }
})

// Liquibase Routes
app.post('/api/liquibase/update', authMiddleware, validate('migration'), async (req, res) => {
  try {
    const { environment, changelogFile, contexts } = req.body
    // Get environment config from database
    const dbConfig = {
      type: 'postgresql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
    
    const result = await liquibaseService.update(dbConfig, changelogFile, contexts)
    res.json(result)
  } catch (error) {
    logger.error('Migration failed:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/liquibase/rollback', authMiddleware, validate('rollback'), async (req, res) => {
  try {
    const { environment, changelogFile, tag } = req.body
    const dbConfig = {
      type: 'postgresql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
    
    const result = await liquibaseService.rollback(dbConfig, changelogFile, tag)
    res.json(result)
  } catch (error) {
    logger.error('Rollback failed:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/liquibase/status/:environment', authMiddleware, async (req, res) => {
  try {
    const { environment } = req.params
    const dbConfig = {
      type: 'postgresql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
    
    const changelogFile = process.env.LIQUIBASE_CHANGELOG_PATH || 'db/changelog/db.changelog-master.xml'
    const result = await liquibaseService.status(dbConfig, changelogFile)
    res.json(result)
  } catch (error) {
    logger.error('Failed to get migration status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
