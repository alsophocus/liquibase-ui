import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  LinearProgress,
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
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCogs,
  faSearch,
  faPlus,
  faPlay,
  faStop,
  faPause,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faClock,
  faUser,
  faCalendarAlt,
  faExternalLinkAlt,
  faHistory,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'

function Pipelines() {
  const theme = useTheme()
  const [pipelines, setPipelines] = useState([
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
    {
      id: 2,
      name: 'Staging Migration',
      repository: 'payment-db-migrations',
      status: 'success',
      progress: 100,
      lastRun: '1 hour ago',
      duration: '1m 45s',
      triggeredBy: 'Jane Smith',
      environment: 'staging',
      jenkinsUrl: 'https://jenkins.company.com/job/staging-deploy/456',
    },
    {
      id: 3,
      name: 'Development Sync',
      repository: 'analytics-warehouse',
      status: 'failed',
      progress: 0,
      lastRun: '2 hours ago',
      duration: '45s',
      triggeredBy: 'Mike Johnson',
      environment: 'development',
      jenkinsUrl: 'https://jenkins.company.com/job/dev-deploy/789',
    },
    {
      id: 4,
      name: 'Rollback Pipeline',
      repository: 'user-service-db',
      status: 'pending',
      progress: 0,
      lastRun: 'Never',
      duration: '-',
      triggeredBy: 'System',
      environment: 'production',
      jenkinsUrl: 'https://jenkins.company.com/job/rollback/101',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState(null)
  const [pipelineHistory, setPipelineHistory] = useState([])

  const filteredPipelines = pipelines.filter(pipeline =>
    pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pipeline.repository.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'info'
      case 'success': return 'success'
      case 'failed': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return faClock
      case 'success': return faCheckCircle
      case 'failed': return faTimesCircle
      case 'pending': return faExclamationTriangle
      default: return faClock
    }
  }

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production': return 'error'
      case 'staging': return 'warning'
      case 'development': return 'info'
      default: return 'default'
    }
  }

  const handleRunPipeline = (pipelineId) => {
    setPipelines(prev => prev.map(p => 
      p.id === pipelineId 
        ? { ...p, status: 'running', progress: 0, lastRun: 'Just now' }
        : p
    ))
  }

  const handleStopPipeline = (pipelineId) => {
    setPipelines(prev => prev.map(p => 
      p.id === pipelineId 
        ? { ...p, status: 'failed', progress: 0 }
        : p
    ))
  }

  const handleViewHistory = (pipeline) => {
    setSelectedPipeline(pipeline)
    setPipelineHistory([
      { id: 1, status: 'success', date: '2024-01-15 14:30', duration: '2m 15s', triggeredBy: 'John Doe' },
      { id: 2, status: 'success', date: '2024-01-15 12:15', duration: '1m 58s', triggeredBy: 'Jane Smith' },
      { id: 3, status: 'failed', date: '2024-01-15 10:45', duration: '45s', triggeredBy: 'Mike Johnson' },
      { id: 4, status: 'success', date: '2024-01-14 16:20', duration: '2m 30s', triggeredBy: 'John Doe' },
    ])
    setOpenDialog(true)
  }

  const PipelineCard = ({ pipeline }) => (
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
            <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
              <FontAwesomeIcon icon={faCogs} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {pipeline.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pipeline.repository}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={pipeline.status}
            color={getStatusColor(pipeline.status)}
            size="small"
            sx={{ textTransform: 'capitalize' }}
            icon={<FontAwesomeIcon icon={getStatusIcon(pipeline.status)} />}
          />
        </Box>

        {pipeline.status === 'running' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pipeline.progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={pipeline.progress}
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.grey[200],
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Chip 
            label={pipeline.environment}
            color={getEnvironmentColor(pipeline.environment)}
            size="small"
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faClock} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {pipeline.duration}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon 
              icon={faUser} 
              style={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}
            />
            <Typography variant="body2" color="text.secondary">
              {pipeline.triggeredBy}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {pipeline.lastRun}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {pipeline.status === 'running' ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FontAwesomeIcon icon={faStop} />}
              onClick={() => handleStopPipeline(pipeline.id)}
              color="error"
              sx={{ flex: 1 }}
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FontAwesomeIcon icon={faPlay} />}
              onClick={() => handleRunPipeline(pipeline.id)}
              sx={{ flex: 1 }}
            >
              Run
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<FontAwesomeIcon icon={faHistory} />}
            onClick={() => handleViewHistory(pipeline)}
            sx={{ flex: 1 }}
          >
            History
          </Button>
          <Tooltip title="Open in Jenkins">
            <IconButton 
              size="small"
              onClick={() => window.open(pipeline.jenkinsUrl, '_blank')}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
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
          Pipelines
        </Typography>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          sx={{ borderRadius: 3 }}
        >
          Create Pipeline
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search pipelines..."
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
        {filteredPipelines.map((pipeline) => (
          <Grid item xs={12} md={6} lg={4} key={pipeline.id}>
            <PipelineCard pipeline={pipeline} />
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
          Pipeline History - {selectedPipeline?.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {pipelineHistory.map((run, index) => (
              <React.Fragment key={run.id}>
                <ListItem>
                  <ListItemIcon>
                    <FontAwesomeIcon 
                      icon={getStatusIcon(run.status)}
                      style={{ 
                        color: theme.palette[getStatusColor(run.status)]?.main || theme.palette.text.secondary 
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body1">
                          Build #{pipelineHistory.length - index}
                        </Typography>
                        <Chip 
                          label={run.status}
                          color={getStatusColor(run.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {run.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {run.duration}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          By: {run.triggeredBy}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < pipelineHistory.length - 1 && <Divider />}
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

export default Pipelines
