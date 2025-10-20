import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDatabase,
  faPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faServer,
  faKey,
  faEye,
  faEyeSlash,
  faFlask,
  faCopy,
  faDownload,
  faUpload,
  faWifi,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'

const Connections = () => {
  const theme = useTheme()
  const [connections, setConnections] = useState([
    {
      id: 1,
      name: 'Production Database',
      type: 'postgresql',
      host: 'prod-db.company.com',
      port: 5432,
      database: 'liquibase_prod',
      username: 'liquibase_user',
      status: 'connected',
      lastTested: '2024-01-16 15:30:00',
      environment: 'production',
    },
    {
      id: 2,
      name: 'Staging Database',
      type: 'mysql',
      host: 'staging-db.company.com',
      port: 3306,
      database: 'liquibase_staging',
      username: 'staging_user',
      status: 'connected',
      lastTested: '2024-01-16 15:25:00',
      environment: 'staging',
    },
    {
      id: 3,
      name: 'Development Database',
      type: 'postgresql',
      host: 'dev-db.company.com',
      port: 5432,
      database: 'liquibase_dev',
      username: 'dev_user',
      status: 'error',
      lastTested: '2024-01-16 14:00:00',
      environment: 'development',
      error: 'Connection timeout',
    },
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testingConnection, setTestingConnection] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    environment: 'development',
  })

  const databaseTypes = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'oracle', label: 'Oracle' },
    { value: 'sqlserver', label: 'SQL Server' },
    { value: 'h2', label: 'H2' },
  ]

  const environments = ['development', 'staging', 'production']

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return theme.palette.success.main
      case 'disconnected': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return faWifi
      case 'disconnected': return faExclamationCircle
      case 'error': return faTimes
      default: return faExclamationTriangle
    }
  }

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production': return theme.palette.error.main
      case 'staging': return theme.palette.warning.main
      case 'development': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const handleOpenDialog = (connection = null) => {
    if (connection) {
      setSelectedConnection(connection)
      setFormData({
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: '••••••••',
        environment: connection.environment,
      })
      setIsEditing(true)
    } else {
      setSelectedConnection(null)
      setFormData({
        name: '',
        type: 'postgresql',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        environment: 'development',
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedConnection(null)
    setShowPassword(false)
  }

  const handleTestConnection = async (connectionId) => {
    setTestingConnection(connectionId)
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestingConnection(null)
    
    // Update connection status
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'connected', lastTested: new Date().toISOString() }
        : conn
    ))
  }

  const handleSaveConnection = () => {
    if (isEditing) {
      setConnections(prev => prev.map(conn => 
        conn.id === selectedConnection.id 
          ? { ...conn, ...formData, lastTested: new Date().toISOString() }
          : conn
      ))
    } else {
      const newConnection = {
        id: Date.now(),
        ...formData,
        status: 'disconnected',
        lastTested: null,
      }
      setConnections(prev => [...prev, newConnection])
    }
    handleCloseDialog()
  }

  const handleDeleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const ConnectionCard = ({ connection, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        sx={{ 
          mb: 2,
          border: `2px solid ${alpha(getStatusColor(connection.status), 0.3)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <motion.div
                animate={{ 
                  scale: connection.status === 'connected' ? [1, 1.1, 1] : 1,
                }}
                transition={{ 
                  duration: 2, 
                  repeat: connection.status === 'connected' ? Infinity : 0 
                }}
              >
                <FontAwesomeIcon 
                  icon={getStatusIcon(connection.status)} 
                  style={{ color: getStatusColor(connection.status), fontSize: '1.2rem' }}
                />
              </motion.div>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {connection.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={connection.environment.toUpperCase()} 
                size="small"
                sx={{ 
                  bgcolor: alpha(getEnvironmentColor(connection.environment), 0.1),
                  color: getEnvironmentColor(connection.environment),
                  fontWeight: 600,
                }}
              />
              <Chip 
                label={connection.status.toUpperCase()} 
                size="small"
                sx={{ 
                  bgcolor: alpha(getStatusColor(connection.status), 0.1),
                  color: getStatusColor(connection.status),
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Database Type</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {connection.type.toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Host</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {connection.host}:{connection.port}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Database</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {connection.database}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Last Tested</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {connection.lastTested ? new Date(connection.lastTested).toLocaleString() : 'Never'}
              </Typography>
            </Grid>
          </Grid>

          {connection.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {connection.error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Username: {connection.username}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Test Connection">
                <IconButton 
                  size="small" 
                  onClick={() => handleTestConnection(connection.id)}
                  disabled={testingConnection === connection.id}
                >
                  {testingConnection === connection.id ? (
                    <CircularProgress size={16} />
                  ) : (
                    <FontAwesomeIcon icon={faFlask} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Connection">
                <IconButton size="small" onClick={() => handleOpenDialog(connection)}>
                  <FontAwesomeIcon icon={faEdit} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Connection">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDeleteConnection(connection.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <FontAwesomeIcon icon={faServer} />
          </motion.div>
          Database Connections
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
        >
          Add Connection
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Active Connections ({connections.length})
            </Typography>
            
            <AnimatePresence>
              {connections.map((connection, index) => (
                <ConnectionCard key={connection.id} connection={connection} index={index} />
              ))}
            </AnimatePresence>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Connection Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {[
                  { label: 'Connected', count: connections.filter(c => c.status === 'connected').length, color: theme.palette.success.main },
                  { label: 'Disconnected', count: connections.filter(c => c.status === 'disconnected').length, color: theme.palette.warning.main },
                  { label: 'Error', count: connections.filter(c => c.status === 'error').length, color: theme.palette.error.main },
                ].map(({ label, count, color }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: alpha(color, 0.1),
                        border: `1px solid ${alpha(color, 0.3)}`,
                        cursor: 'pointer',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {label}
                      </Typography>
                      <Chip 
                        label={count} 
                        size="small" 
                        sx={{ 
                          bgcolor: color, 
                          color: 'white',
                          fontWeight: 600,
                        }} 
                      />
                    </Box>
                  </motion.div>
                ))}
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Test All Connections', icon: faFlask },
                  { label: 'Export Configuration', icon: faDownload },
                  { label: 'Import Configuration', icon: faUpload },
                  { label: 'Connection Templates', icon: faCopy },
                ].map(({ label, icon }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FontAwesomeIcon icon={icon} />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {label}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Connection' : 'Add New Connection'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Connection Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Database Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Database Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {databaseTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Database Name"
                value={formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={formData.environment}
                  label="Environment"
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                >
                  {environments.map(env => (
                    <MenuItem key={env} value={env}>
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveConnection} 
            variant="contained"
            disabled={!formData.name || !formData.host || !formData.database}
          >
            {isEditing ? 'Update' : 'Create'} Connection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Connections
