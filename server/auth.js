const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const session = require('express-session')
const logger = require('./logger')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-change-in-production'

// Mock users - replace with database in production
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    authMethod: 'local'
  }
]

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username || user.email, 
      email: user.email,
      role: user.role || user.roles?.[0] || 'user',
      authMethod: user.authMethod || 'local'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

const authenticateUser = async (username, password) => {
  const user = users.find(u => u.username === username || u.email === username)
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return { 
    id: user.id, 
    username: user.username, 
    email: user.email,
    role: user.role,
    authMethod: 'local'
  }
}

const findOrCreateSAMLUser = async (samlUser) => {
  // In production, this would interact with a database
  let user = users.find(u => u.email === samlUser.email)
  
  if (!user) {
    // Create new user from SAML profile
    user = {
      id: users.length + 1,
      username: samlUser.email,
      email: samlUser.email,
      firstName: samlUser.firstName,
      lastName: samlUser.lastName,
      role: samlUser.roles.includes('admin') ? 'admin' : 'user',
      authMethod: 'saml',
      createdAt: new Date(),
      lastLogin: new Date()
    }
    users.push(user)
    logger.info(`Created new SAML user: ${user.email}`)
  } else {
    // Update existing user
    user.lastLogin = new Date()
    user.authMethod = 'saml'
    if (samlUser.roles.includes('admin')) {
      user.role = 'admin'
    }
    logger.info(`Updated existing SAML user: ${user.email}`)
  }
  
  return user
}

const authMiddleware = (req, res, next) => {
  // Check for JWT token first
  const token = req.header('Authorization')?.replace('Bearer ', '')
  
  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
      return next()
    }
  }
  
  // Check for session-based auth (SAML)
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.user = req.user
    return next()
  }
  
  return res.status(401).json({ error: 'Access denied. Authentication required.' })
}

const setupSession = (app) => {
  // Session configuration for SAML
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }))
  
  app.use(passport.initialize())
  app.use(passport.session())
  
  // Passport serialization
  passport.serializeUser((user, done) => {
    done(null, user.id || user.email)
  })
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = users.find(u => u.id === id || u.email === id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateUser,
  findOrCreateSAMLUser,
  authMiddleware,
  setupSession
}
