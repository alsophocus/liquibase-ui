import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  Tab,
  Tabs,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGear,
  faSave,
  faFlask,
  faKey,
  faServer,
  faCodeBranch,
  faBell,
  faUser,
  faTrash,
  faEdit,
  faPlus,
  faDatabase,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

function Settings() {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const [config, setConfig] = useState({
    database: {
      type: 'postgresql',
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
    },
    jenkins: {
      url: '',
      username: '',
      token: '',
      enabled: false,
    },
    bitbucket: {
      url: 'https://api.bitbucket.org/2.0',
      username: '',
      appPassword: '',
      workspace: '',
      enabled: false,
    }
  })

  const [testResults, setTestResults] = useState({
    database: null,
    jenkins: null,
    bitbucket: null,
  })

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/config')
      setConfig(response.data)
    } catch (error) {
      showSnackbar('Failed to load configuration', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    // Clear test result when config changes
    setTestResults(prev => ({ ...prev, [section]: null }))
  }

  const handleSaveConfig = async (section) => {
    try {
      setLoading(true)
      await axios.post(`/api/config/${section}`, config[section])
      showSnackbar(`${section.charAt(0).toUpperCase() + section.slice(1)} configuration saved successfully`)
    } catch (error) {
      showSnackbar(error.response?.data?.error || `Failed to save ${section} configuration`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async (section) => {
    try {
      setTestLoading(prev => ({ ...prev, [section]: true }))
      const response = await axios.post(`/api/config/${section}/test`, config[section])
      setTestResults(prev => ({ ...prev, [section]: { success: true, ...response.data } }))
      showSnackbar(`${section.charAt(0).toUpperCase() + section.slice(1)} connection successful`)
    } catch (error) {
      setTestResults(prev => ({ ...prev, [section]: { success: false, error: error.response?.data?.error || 'Connection failed' } }))
      showSnackbar(error.response?.data?.error || `${section.charAt(0).toUpperCase() + section.slice(1)} connection failed`, 'error')
    } finally {
      setTestLoading(prev => ({ ...prev, [section]: false }))
    }
  }

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  const TestResult = ({ result }) => {
    if (!result) return null
    
    return (
      <Alert 
        severity={result.success ? 'success' : 'error'}
        icon={<FontAwesomeIcon icon={result.success ? faCheckCircle : faTimesCircle} />}
        sx={{ mt: 2 }}
      >
        {result.success ? 'Connection successful' : result.error}
        {result.version && ` (Version: ${result.version})`}
        {result.user && ` (User: ${result.user})`}
      </Alert>
    )
  }

  if (loading && !config.database.host) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Settings
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Database" 
              icon={<FontAwesomeIcon icon={faDatabase} />}
              iconPosition="start"
            />
            <Tab 
              label="Jenkins" 
              icon={<FontAwesomeIcon icon={faServer} />}
              iconPosition="start"
            />
            <Tab 
              label="Bitbucket" 
              icon={<FontAwesomeIcon icon={faCodeBranch} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Database Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Database Type</InputLabel>
                  <Select
                    value={config.database.type}
                    label="Database Type"
                    onChange={(e) => handleConfigChange('database', 'type', e.target.value)}
                  >
                    <MenuItem value="postgresql">PostgreSQL</MenuItem>
                    <MenuItem value="mysql">MySQL</MenuItem>
                    <MenuItem value="oracle">Oracle</MenuItem>
                    <MenuItem value="sqlserver">SQL Server</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Host"
                  value={config.database.host}
                  onChange={(e) => handleConfigChange('database', 'host', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={config.database.port}
                  onChange={(e) => handleConfigChange('database', 'port', parseInt(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Database Name"
                  value={config.database.database}
                  onChange={(e) => handleConfigChange('database', 'database', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={config.database.username}
                  onChange={(e) => handleConfigChange('database', 'username', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={config.database.password}
                  onChange={(e) => handleConfigChange('database', 'password', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    onClick={() => handleSaveConfig('database')}
                    disabled={loading}
                  >
                    Save Configuration
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={testLoading.database ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faFlask} />}
                    onClick={() => handleTestConnection('database')}
                    disabled={testLoading.database || !config.database.host}
                  >
                    Test Connection
                  </Button>
                </Box>
                <TestResult result={testResults.database} />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Jenkins Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.jenkins.enabled}
                      onChange={(e) => handleConfigChange('jenkins', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Jenkins Integration"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Jenkins URL"
                  value={config.jenkins.url}
                  onChange={(e) => handleConfigChange('jenkins', 'url', e.target.value)}
                  disabled={!config.jenkins.enabled}
                  placeholder="https://jenkins.your-company.com"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={config.jenkins.username}
                  onChange={(e) => handleConfigChange('jenkins', 'username', e.target.value)}
                  disabled={!config.jenkins.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Token"
                  type="password"
                  value={config.jenkins.token}
                  onChange={(e) => handleConfigChange('jenkins', 'token', e.target.value)}
                  disabled={!config.jenkins.enabled}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    onClick={() => handleSaveConfig('jenkins')}
                    disabled={loading}
                  >
                    Save Configuration
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={testLoading.jenkins ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faFlask} />}
                    onClick={() => handleTestConnection('jenkins')}
                    disabled={testLoading.jenkins || !config.jenkins.enabled || !config.jenkins.url}
                  >
                    Test Connection
                  </Button>
                </Box>
                <TestResult result={testResults.jenkins} />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Bitbucket Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.bitbucket.enabled}
                      onChange={(e) => handleConfigChange('bitbucket', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Bitbucket Integration"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bitbucket URL"
                  value={config.bitbucket.url}
                  onChange={(e) => handleConfigChange('bitbucket', 'url', e.target.value)}
                  disabled={!config.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={config.bitbucket.username}
                  onChange={(e) => handleConfigChange('bitbucket', 'username', e.target.value)}
                  disabled={!config.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Workspace"
                  value={config.bitbucket.workspace}
                  onChange={(e) => handleConfigChange('bitbucket', 'workspace', e.target.value)}
                  disabled={!config.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="App Password"
                  type="password"
                  value={config.bitbucket.appPassword}
                  onChange={(e) => handleConfigChange('bitbucket', 'appPassword', e.target.value)}
                  disabled={!config.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    onClick={() => handleSaveConfig('bitbucket')}
                    disabled={loading}
                  >
                    Save Configuration
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={testLoading.bitbucket ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faFlask} />}
                    onClick={() => handleTestConnection('bitbucket')}
                    disabled={testLoading.bitbucket || !config.bitbucket.enabled || !config.bitbucket.username}
                  >
                    Test Connection
                  </Button>
                </Box>
                <TestResult result={testResults.bitbucket} />
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Settings
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  Tab,
  Tabs,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGear,
  faSave,
  faFlask,
  faKey,
  faServer,
  faCodeBranch,
  faBell,
  faUser,
  faTrash,
  faEdit,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'

function Settings() {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [settings, setSettings] = useState({
    jenkins: {
      url: 'https://jenkins.company.com',
      username: 'admin',
      token: '••••••••••••••••',
      enabled: true,
    },
    bitbucket: {
      url: 'https://bitbucket.org',
      username: 'company-user',
      appPassword: '••••••••••••••••',
      workspace: 'company',
      enabled: true,
    },
    notifications: {
      emailEnabled: true,
      slackEnabled: false,
      webhookEnabled: true,
      onSuccess: true,
      onFailure: true,
      onPending: false,
    },
    liquibase: {
      defaultChangelogPath: 'db/changelog/db.changelog-master.xml',
      defaultContexts: 'dev,test,prod',
      validateChecksums: true,
      dropFirst: false,
    }
  })

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API Key', created: '2024-01-10', lastUsed: '2024-01-15' },
    { id: 2, name: 'Staging API Key', created: '2024-01-12', lastUsed: '2024-01-14' },
  ])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  const handleTestConnection = (service) => {
    // Test connection logic here
    console.log(`Testing ${service} connection`)
  }

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Settings
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Jenkins" 
              icon={<FontAwesomeIcon icon={faServer} />}
              iconPosition="start"
            />
            <Tab 
              label="Bitbucket" 
              icon={<FontAwesomeIcon icon={faCodeBranch} />}
              iconPosition="start"
            />
            <Tab 
              label="Notifications" 
              icon={<FontAwesomeIcon icon={faBell} />}
              iconPosition="start"
            />
            <Tab 
              label="Liquibase" 
              icon={<FontAwesomeIcon icon={faGear} />}
              iconPosition="start"
            />
            <Tab 
              label="API Keys" 
              icon={<FontAwesomeIcon icon={faKey} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Jenkins Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.jenkins.enabled}
                      onChange={(e) => handleSettingChange('jenkins', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Jenkins Integration"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Jenkins URL"
                  value={settings.jenkins.url}
                  onChange={(e) => handleSettingChange('jenkins', 'url', e.target.value)}
                  disabled={!settings.jenkins.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={settings.jenkins.username}
                  onChange={(e) => handleSettingChange('jenkins', 'username', e.target.value)}
                  disabled={!settings.jenkins.enabled}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Token"
                  type="password"
                  value={settings.jenkins.token}
                  onChange={(e) => handleSettingChange('jenkins', 'token', e.target.value)}
                  disabled={!settings.jenkins.enabled}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faFlask} />}
                    onClick={() => handleTestConnection('Jenkins')}
                    disabled={!settings.jenkins.enabled}
                  >
                    Test Connection
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Bitbucket Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.bitbucket.enabled}
                      onChange={(e) => handleSettingChange('bitbucket', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Bitbucket Integration"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bitbucket URL"
                  value={settings.bitbucket.url}
                  onChange={(e) => handleSettingChange('bitbucket', 'url', e.target.value)}
                  disabled={!settings.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Workspace"
                  value={settings.bitbucket.workspace}
                  onChange={(e) => handleSettingChange('bitbucket', 'workspace', e.target.value)}
                  disabled={!settings.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={settings.bitbucket.username}
                  onChange={(e) => handleSettingChange('bitbucket', 'username', e.target.value)}
                  disabled={!settings.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="App Password"
                  type="password"
                  value={settings.bitbucket.appPassword}
                  onChange={(e) => handleSettingChange('bitbucket', 'appPassword', e.target.value)}
                  disabled={!settings.bitbucket.enabled}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faFlask} />}
                    onClick={() => handleTestConnection('Bitbucket')}
                    disabled={!settings.bitbucket.enabled}
                  >
                    Test Connection
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Notification Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Notification Channels
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.slackEnabled}
                        onChange={(e) => handleSettingChange('notifications', 'slackEnabled', e.target.checked)}
                      />
                    }
                    label="Slack Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.webhookEnabled}
                        onChange={(e) => handleSettingChange('notifications', 'webhookEnabled', e.target.checked)}
                      />
                    }
                    label="Webhook Notifications"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Notification Events
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.onSuccess}
                        onChange={(e) => handleSettingChange('notifications', 'onSuccess', e.target.checked)}
                      />
                    }
                    label="Successful Migrations"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.onFailure}
                        onChange={(e) => handleSettingChange('notifications', 'onFailure', e.target.checked)}
                      />
                    }
                    label="Failed Migrations"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.onPending}
                        onChange={(e) => handleSettingChange('notifications', 'onPending', e.target.checked)}
                      />
                    }
                    label="Pending Approvals"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faSave} />}
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Liquibase Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default Changelog Path"
                  value={settings.liquibase.defaultChangelogPath}
                  onChange={(e) => handleSettingChange('liquibase', 'defaultChangelogPath', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default Contexts"
                  value={settings.liquibase.defaultContexts}
                  onChange={(e) => handleSettingChange('liquibase', 'defaultContexts', e.target.value)}
                  helperText="Comma-separated list of contexts"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.liquibase.validateChecksums}
                        onChange={(e) => handleSettingChange('liquibase', 'validateChecksums', e.target.checked)}
                      />
                    }
                    label="Validate Checksums"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.liquibase.dropFirst}
                        onChange={(e) => handleSettingChange('liquibase', 'dropFirst', e.target.checked)}
                      />
                    }
                    label="Drop First (Development Only)"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faSave} />}
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                API Keys
              </Typography>
              <Button
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                size="small"
              >
                Generate Key
              </Button>
            </Box>
            
            <List>
              {apiKeys.map((key, index) => (
                <React.Fragment key={key.id}>
                  <ListItem>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faKey} />
                    </ListItemIcon>
                    <ListItemText
                      primary={key.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Chip label={`Created: ${key.created}`} size="small" />
                          <Chip label={`Last used: ${key.lastUsed}`} size="small" />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <FontAwesomeIcon icon={faEdit} />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < apiKeys.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Settings
