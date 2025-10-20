const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock data for development
const mockRepositories = [
  {
    id: 1,
    name: 'user-service-db',
    description: 'Database migrations for user service',
    branch: 'main',
    lastCommit: '2 hours ago',
    author: 'John Doe',
    changesets: 15,
    status: 'active',
    url: 'https://bitbucket.org/company/user-service-db',
  },
  // Add more mock data as needed
]

const mockPipelines = [
  {
    id: 1,
    name: 'Production Deployment',
    repository: 'user-service-db',
    status: 'running',
    progress: 65,
    lastRun: '5 minutes ago',
    duration: '2m 34s',
    triggeredBy: 'John Doe',
    environment: 'production',
    jenkinsUrl: 'https://jenkins.company.com/job/prod-deploy/123',
  },
  // Add more mock data as needed
]

// API Routes

// Repositories
app.get('/api/repositories', (req, res) => {
  res.json(mockRepositories)
})

app.post('/api/repositories', (req, res) => {
  const newRepo = {
    id: mockRepositories.length + 1,
    ...req.body,
    status: 'active',
    changesets: 0,
    lastCommit: 'Just now',
    author: 'Current User'
  }
  mockRepositories.push(newRepo)
  res.status(201).json(newRepo)
})

// Pipelines
app.get('/api/pipelines', (req, res) => {
  res.json(mockPipelines)
})

app.post('/api/pipelines/:id/run', (req, res) => {
  const pipelineId = parseInt(req.params.id)
  const pipeline = mockPipelines.find(p => p.id === pipelineId)
  
  if (pipeline) {
    pipeline.status = 'running'
    pipeline.progress = 0
    pipeline.lastRun = 'Just now'
    res.json(pipeline)
  } else {
    res.status(404).json({ error: 'Pipeline not found' })
  }
})

app.post('/api/pipelines/:id/stop', (req, res) => {
  const pipelineId = parseInt(req.params.id)
  const pipeline = mockPipelines.find(p => p.id === pipelineId)
  
  if (pipeline) {
    pipeline.status = 'stopped'
    pipeline.progress = 0
    res.json(pipeline)
  } else {
    res.status(404).json({ error: 'Pipeline not found' })
  }
})

// Jenkins Integration
app.get('/api/jenkins/jobs', async (req, res) => {
  try {
    // Mock Jenkins API response
    const jobs = [
      { name: 'prod-deploy', status: 'success', lastBuild: 123 },
      { name: 'staging-deploy', status: 'running', lastBuild: 456 },
      { name: 'dev-deploy', status: 'failed', lastBuild: 789 },
    ]
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Jenkins jobs' })
  }
})

app.post('/api/jenkins/build/:jobName', async (req, res) => {
  try {
    const { jobName } = req.params
    // Mock Jenkins build trigger
    res.json({ message: `Build triggered for ${jobName}`, buildNumber: Math.floor(Math.random() * 1000) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger Jenkins build' })
  }
})

// Bitbucket Integration
app.get('/api/bitbucket/repositories', async (req, res) => {
  try {
    // Mock Bitbucket API response
    const repositories = [
      { name: 'user-service-db', full_name: 'company/user-service-db', clone_links: [] },
      { name: 'payment-db-migrations', full_name: 'company/payment-db-migrations', clone_links: [] },
    ]
    res.json({ values: repositories })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Bitbucket repositories' })
  }
})

app.get('/api/bitbucket/repositories/:repo/branches', async (req, res) => {
  try {
    const { repo } = req.params
    // Mock Bitbucket branches response
    const branches = [
      { name: 'main', target: { hash: 'abc123' } },
      { name: 'develop', target: { hash: 'def456' } },
      { name: 'feature/new-migration', target: { hash: 'ghi789' } },
    ]
    res.json({ values: branches })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repository branches' })
  }
})

// Liquibase Operations
app.post('/api/liquibase/update', async (req, res) => {
  try {
    const { environment, changelogFile, contexts } = req.body
    // Mock Liquibase update operation
    res.json({ 
      message: 'Migration completed successfully',
      changesetsExecuted: 3,
      duration: '1m 23s'
    })
  } catch (error) {
    res.status(500).json({ error: 'Migration failed' })
  }
})

app.post('/api/liquibase/rollback', async (req, res) => {
  try {
    const { environment, tag } = req.body
    // Mock Liquibase rollback operation
    res.json({ 
      message: 'Rollback completed successfully',
      changesetsRolledBack: 2,
      duration: '45s'
    })
  } catch (error) {
    res.status(500).json({ error: 'Rollback failed' })
  }
})

app.get('/api/liquibase/status/:environment', async (req, res) => {
  try {
    const { environment } = req.params
    // Mock Liquibase status
    res.json({
      environment,
      pendingChangesets: Math.floor(Math.random() * 10),
      lastMigration: new Date().toISOString(),
      currentVersion: 'v2.1.5'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get migration status' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})
