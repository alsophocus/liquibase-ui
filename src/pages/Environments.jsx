import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  useTheme,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faServer,
  faSearch,
  faPlus,
  faDatabase,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faClock,
  faPlay,
  faRedo,
  faEye,
  faEdit,
  faTrash,
  faHistory,
} from '@fortawesome/free-solid-svg-icons'

function Environments() {
  const theme = useTheme()
  const [environments, setEnvironments] = useState([
    {
      id: 1,
      name: 'Production',
      description: 'Production database environment',
      status: 'healthy',
      dbType: 'PostgreSQL',
      version: 'v2.1.5',
      lastMigration: '2024-01-15 14:30',
      changesets: 45,
      pendingChanges: 0,
      url: 'prod-db.company.com:5432',
      migrations: [
        { version: 'v2.1.5', date: '2024-01-15 14:30', status: 'success' },
        { version: 'v2.1.4', date: '2024-01-14 16:20', status: 'success' },
        { version: 'v2.1.3', date: '2024-01-13 10:15', status: 'success' },
      ]
    },
    {
      id: 2,
      name: 'Staging',
      description: 'Staging environment for testing',
      status: 'migrating',
      dbType: 'PostgreSQL',
      version: 'v2.1.6',
      lastMigration: '2024-01-15 15:45',
      changesets: 47,
      pendingChanges: 2,
      url: 'staging-db.company.com:5432',
      progress: 75,
      migrations: [
        { version: 'v2.1.6', date: '2024-01-15 15:45', status: 'running' },
        { version: 'v2.1.5', date: '2024-01-15 14:30', status: 'success' },
        { version: 'v2.1.4', date: '2024-01-14 16:20', status: 'success' },
      ]
    },
    {
      id: 3,
      name: 'Development',
      description: 'Development environment',
      status: 'error',
      dbType: 'MySQL',
      version: 'v2.1.4',
      lastMigration: '2024-01-15 16:00',
      changesets: 43,
      pendingChanges: 5,
      url: 'dev-db.company.com:3306',
      migrations: [
        { version: 'v2.1.5', date: '2024-01-15 16:00', status: 'failed' },
        { version: 'v2.1.4', date: '2024-01-14 16:20', status: 'success' },
        { version: 'v2.1.3', date: '2024-01-13 10:15', status: 'success' },
      ]
    },
    {
      id: 4,
      name: 'Testing',
      description: 'Automated testing environment',
      status: 'pending',
      dbType: 'PostgreSQL',
      version: 'v2.1.3',
      lastMigration: '2024-01-13 10:15',
      changesets: 40,
      pendingChanges: 7,
      url: 'test-db.company.com:5432',
      migrations: [
        { version: 'v2.1.3', date: '2024-01-13 10:15', status: 'success' },
        { version: 'v2.1.2', date: '2024-01-12 14:30', status: 'success' },
        { version: 'v2.1.1', date: '2024-01-11 09:45', status: 'success' },
      ]
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState(null)

  const filteredEnvironments = environments.filter(env =>
    env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    env.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success'
      case 'migrating': return 'info'
      case 'error': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return faCheckCircle
      case 'migrating': return faClock
      case 'error': return faTimesCircle
      case 'pending': return faExclamationTriangle
      default: return faClock
    }
  }

  const getMigrationStatusIcon = (status) => {
    switch (status) {
      case 'success': return faCheckCircle
      case 'failed': return faTimesCircle
      case 'running': return faClock
      default: return faClock
    }
  }

  const getMigrationStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success'
      case 'failed': return 'error'
      case 'running': return 'info'
      default: return 'default'
    }
  }

  const handleViewHistory = (environment) => {
    setSelectedEnvironment(environment)
    setOpenDialog(true)
  }

  const EnvironmentCard = ({ environment }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        }
      }}
      className="scale-in"
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
              <FontAwesomeIcon icon={faServer} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {environment.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {environment.description}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={environment.status}
            color={getStatusColor(environment.status)}
            size="small"
            sx={{ textTransform: 'capitalize' }}
            icon={<FontAwesomeIcon icon={getStatusIcon(environment.status)} />}
          />
        </Box>

        {environment.status === 'migrating' && environment.progress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Migration Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {environment.progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={environment.progress}
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.grey[200],
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faDatabase} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {environment.dbType}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {environment.version}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Changesets: {environment.changesets}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending: {environment.pendingChanges}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Last Migration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {environment.lastMigration}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace' }}>
          {environment.url}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={faPlay} />}
            sx={{ flex: 1 }}
            disabled={environment.status === 'migrating'}
          >
            Migrate
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={faHistory} />}
            onClick={() => handleViewHistory(environment)}
            sx={{ flex: 1 }}
          >
            History
          </Button>
          <Tooltip title="Rollback">
            <IconButton size="small">
              <FontAwesomeIcon icon={faRedo} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Environments
        </Typography>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          sx={{ borderRadius: 3 }}
        >
          Add Environment
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search environments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredEnvironments.map((environment) => (
          <Grid item xs={12} md={6} lg={4} key={environment.id}>
            <EnvironmentCard environment={environment} />
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Migration History - {selectedEnvironment?.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedEnvironment?.migrations.map((migration, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <FontAwesomeIcon 
                      icon={getMigrationStatusIcon(migration.status)}
                      style={{ 
                        color: theme.palette[getMigrationStatusColor(migration.status)]?.main || theme.palette.text.secondary 
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body1">
                          {migration.version}
                        </Typography>
                        <Chip 
                          label={migration.status}
                          color={getMigrationStatusColor(migration.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={migration.date}
                  />
                </ListItem>
                {index < selectedEnvironment.migrations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Environments
