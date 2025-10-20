import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDatabase,
  faCodeBranch,
  faCogs,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faClock,
  faPlay,
  faRefresh,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons'

function Dashboard() {
  const theme = useTheme()
  const [stats, setStats] = useState({
    totalDatabases: 12,
    activePipelines: 3,
    pendingMigrations: 7,
    successfulDeployments: 45,
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'success',
      message: 'Migration completed successfully on Production DB',
      timestamp: '2 minutes ago',
      icon: faCheckCircle,
      color: 'success',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Pending approval for staging environment',
      timestamp: '15 minutes ago',
      icon: faExclamationTriangle,
      color: 'warning',
    },
    {
      id: 3,
      type: 'info',
      message: 'New changeset detected in feature/user-auth branch',
      timestamp: '1 hour ago',
      icon: faCodeBranch,
      color: 'info',
    },
    {
      id: 4,
      type: 'error',
      message: 'Migration failed on Development DB',
      timestamp: '2 hours ago',
      icon: faTimesCircle,
      color: 'error',
    },
  ])

  const [environments, setEnvironments] = useState([
    {
      name: 'Production',
      status: 'healthy',
      lastMigration: '2024-01-15 14:30',
      version: 'v2.1.5',
      progress: 100,
    },
    {
      name: 'Staging',
      status: 'migrating',
      lastMigration: '2024-01-15 15:45',
      version: 'v2.1.6',
      progress: 75,
    },
    {
      name: 'Development',
      status: 'error',
      lastMigration: '2024-01-15 16:00',
      version: 'v2.1.4',
      progress: 0,
    },
  ])

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        }
      }}
      className="scale-in"
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FontAwesomeIcon 
                  icon={trend > 0 ? faArrowUp : faArrowDown}
                  style={{ 
                    color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontSize: '0.875rem'
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 500
                  }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            <FontAwesomeIcon icon={icon} style={{ fontSize: '1.5rem' }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success'
      case 'migrating': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return faCheckCircle
      case 'warning': return faExclamationTriangle
      case 'error': return faTimesCircle
      case 'info': return faCodeBranch
      default: return faClock
    }
  }

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Databases"
            value={stats.totalDatabases}
            icon={faDatabase}
            color="primary"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Pipelines"
            value={stats.activePipelines}
            icon={faCogs}
            color="secondary"
            trend={-2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Migrations"
            value={stats.pendingMigrations}
            icon={faClock}
            color="warning"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Successful Deployments"
            value={stats.successfulDeployments}
            icon={faCheckCircle}
            color="success"
            trend={12}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="slide-in">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Environment Status
                </Typography>
                <IconButton size="small">
                  <FontAwesomeIcon icon={faRefresh} />
                </IconButton>
              </Box>
              
              {environments.map((env, index) => (
                <Box key={env.name} sx={{ mb: index < environments.length - 1 ? 3 : 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {env.name}
                      </Typography>
                      <Chip 
                        label={env.status}
                        color={getStatusColor(env.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {env.version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {env.lastMigration}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {env.status === 'migrating' && (
                    <LinearProgress 
                      variant="determinate" 
                      value={env.progress}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.grey[200],
                      }}
                    />
                  )}
                  
                  {index < environments.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="slide-in">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              <List disablePadding>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <FontAwesomeIcon 
                          icon={getActivityIcon(activity.type)}
                          style={{ 
                            color: theme.palette[activity.color]?.main || theme.palette.text.secondary,
                            fontSize: '1.25rem'
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.timestamp}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: 500 }
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
