import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
  Divider,
  Chip,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faUser, faLock, faBuilding } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

function Login() {
  const theme = useTheme()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authMethods, setAuthMethods] = useState({
    local: true,
    saml: false,
    samlLoginUrl: null
  })

  useEffect(() => {
    // Check available authentication methods
    const fetchAuthMethods = async () => {
      try {
        const response = await axios.get('/auth/methods')
        setAuthMethods(response.data)
      } catch (error) {
        console.error('Failed to fetch auth methods:', error)
      }
    }
    
    fetchAuthMethods()
    
    // Check for token in URL (SAML callback)
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      window.location.href = '/'
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.username, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleSAMLLogin = () => {
    window.location.href = authMethods.samlLoginUrl
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: theme.shadows[10],
        }}
        className="scale-in"
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
                mb: 2,
              }}
            >
              <FontAwesomeIcon icon={faDatabase} style={{ fontSize: '2rem' }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Liquibase UI
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Sign in to manage your database migrations
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* SAML Login */}
          {authMethods.saml && (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSAMLLogin}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 3,
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark,
                  }
                }}
                startIcon={<FontAwesomeIcon icon={faBuilding} />}
              >
                Sign in with Active Directory
              </Button>

              {authMethods.local && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Chip label="OR" sx={{ mx: 2 }} />
                  <Divider sx={{ flex: 1 }} />
                </Box>
              )}
            </>
          )}

          {/* Local Login */}
          {authMethods.local && (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <FontAwesomeIcon 
                      icon={faUser} 
                      style={{ 
                        marginRight: 8, 
                        color: theme.palette.text.secondary 
                      }} 
                    />
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <FontAwesomeIcon 
                      icon={faLock} 
                      style={{ 
                        marginRight: 8, 
                        color: theme.palette.text.secondary 
                      }} 
                    />
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="outlined"
                size="large"
                disabled={loading || !formData.username || !formData.password}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In with Local Account'
                )}
              </Button>
            </form>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {authMethods.local && 'Default credentials: admin / password'}
              {authMethods.saml && !authMethods.local && 'Use your Active Directory credentials'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faUser, faLock } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const theme = useTheme()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.username, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: theme.shadows[10],
        }}
        className="scale-in"
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
                mb: 2,
              }}
            >
              <FontAwesomeIcon icon={faDatabase} style={{ fontSize: '2rem' }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Liquibase UI
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Sign in to manage your database migrations
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <FontAwesomeIcon 
                    icon={faUser} 
                    style={{ 
                      marginRight: 8, 
                      color: theme.palette.text.secondary 
                    }} 
                  />
                ),
              }}
            />

            <TextField
              fullWidth
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <FontAwesomeIcon 
                    icon={faLock} 
                    style={{ 
                      marginRight: 8, 
                      color: theme.palette.text.secondary 
                    }} 
                  />
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !formData.username || !formData.password}
              sx={{
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Default credentials: admin / password
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
