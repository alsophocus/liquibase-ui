const express = require('express')
const passport = require('passport')
const logger = require('../logger')
const { generateToken, authenticateUser, findOrCreateSAMLUser, authMiddleware } = require('../auth')
const { validate } = require('../validation')

/**
 * Authentication Routes
 * Supports both local and SAML authentication
 */
function createAuthRoutes(configService, samlService) {
  const router = express.Router()

  // Local login
  router.post('/login', validate('login'), async (req, res) => {
    try {
      const { username, password } = req.body
      const user = await authenticateUser(username, password)
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = generateToken(user)
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role,
          authMethod: 'local'
        } 
      })
    } catch (error) {
      logger.error('Login error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // SAML login initiation
  router.get('/saml/login', (req, res, next) => {
    const config = configService.getConfig()
    
    if (!config.saml?.enabled) {
      return res.status(400).json({ error: 'SAML authentication is not enabled' })
    }
    
    passport.authenticate('saml', { 
      failureRedirect: '/login?error=saml_failed',
      failureFlash: true 
    })(req, res, next)
  })

  // SAML callback
  router.post('/saml/callback', 
    passport.authenticate('saml', { 
      failureRedirect: '/login?error=saml_callback_failed' 
    }),
    async (req, res) => {
      try {
        // Create or update user from SAML profile
        const user = await findOrCreateSAMLUser(req.user)
        
        // Generate JWT token for API access
        const token = generateToken(user)
        
        // Store token in session for frontend
        req.session.token = token
        req.session.user = user
        
        logger.info(`SAML login successful for user: ${user.email}`)
        
        // Redirect to frontend with token
        res.redirect(`/?token=${token}`)
      } catch (error) {
        logger.error('SAML callback error:', error)
        res.redirect('/login?error=saml_processing_failed')
      }
    }
  )

  // SAML logout
  router.post('/saml/logout', authMiddleware, async (req, res) => {
    try {
      const logoutUrl = await samlService.logout(req)
      
      req.logout((err) => {
        if (err) {
          logger.error('Logout error:', err)
        }
        req.session.destroy(() => {
          res.json({ logoutUrl })
        })
      })
    } catch (error) {
      logger.error('SAML logout error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  })

  // SAML metadata
  router.get('/saml/metadata', (req, res) => {
    try {
      const config = configService.getConfig()
      
      if (!config.saml?.enabled) {
        return res.status(400).json({ error: 'SAML authentication is not enabled' })
      }
      
      const metadata = samlService.generateMetadata()
      res.type('application/xml')
      res.send(metadata)
    } catch (error) {
      logger.error('SAML metadata error:', error)
      res.status(500).json({ error: 'Failed to generate metadata' })
    }
  })

  // Get authentication methods
  router.get('/methods', (req, res) => {
    const config = configService.getConfig()
    
    res.json({
      local: true,
      saml: config.saml?.enabled || false,
      samlLoginUrl: config.saml?.enabled ? '/auth/saml/login' : null
    })
  })

  // Standard logout
  router.post('/logout', authMiddleware, (req, res) => {
    if (req.user.authMethod === 'saml') {
      return res.json({ 
        message: 'Use SAML logout endpoint',
        samlLogout: true 
      })
    }
    
    res.json({ message: 'Logged out successfully' })
  })

  // Current user info
  router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user })
  })

  return router
}

module.exports = createAuthRoutes
