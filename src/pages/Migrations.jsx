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
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Fab,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlay,
  faStop,
  faHistory,
  faPlus,
  faDownload,
  faUpload,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faClock,
  faDatabase,
  faCode,
  faEye,
  faRedo,
  faUndo,
  faFileCode,
  faCog,
} from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'

const Migrations = () => {
  const theme = useTheme()
  const [migrations, setMigrations] = useState([
    {
      id: 1,
      filename: 'V1__Create_users_table.sql',
      description: 'Create users table with basic fields',
      status: 'executed',
      executedAt: '2024-01-15 10:30:00',
      checksum: 'abc123def456',
      author: 'john.doe',
      contexts: ['dev', 'test', 'prod'],
    },
    {
      id: 2,
      filename: 'V2__Add_user_roles.sql',
      description: 'Add roles and permissions system',
      status: 'pending',
      executedAt: null,
      checksum: 'def456ghi789',
      author: 'jane.smith',
      contexts: ['dev', 'test'],
    },
    {
      id: 3,
      filename: 'V3__Update_user_schema.sql',
      description: 'Update user schema with new fields',
      status: 'failed',
      executedAt: '2024-01-16 14:20:00',
      checksum: 'ghi789jkl012',
      author: 'bob.wilson',
      contexts: ['dev'],
      error: 'Column already exists',
    },
  ])

  const [selectedContext, setSelectedContext] = useState('dev')
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedMigration, setSelectedMigration] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [showNewMigration, setShowNewMigration] = useState(false)

  const contexts = ['dev', 'test', 'prod']
  const migrationSteps = [
    'Validate changelog',
    'Check database connection',
    'Execute migrations',
    'Update changelog table',
    'Complete'
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'executed': return theme.palette.success.main
      case 'pending': return theme.palette.warning.main
      case 'failed': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'executed': return faCheck
      case 'pending': return faClock
      case 'failed': return faTimes
      default: return faExclamationTriangle
    }
  }

  const handleRunMigrations = async () => {
    setIsRunning(true)
    setProgress(0)
    setActiveStep(0)

    // Simulate migration process
    for (let i = 0; i <= 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setActiveStep(i)
      setProgress((i + 1) * 20)
    }

    setIsRunning(false)
    // Update migration statuses
    setMigrations(prev => prev.map(m => 
      m.status === 'pending' ? { ...m, status: 'executed', executedAt: new Date().toISOString() } : m
    ))
  }

  const MigrationCard = ({ migration, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          border: `2px solid ${alpha(getStatusColor(migration.status), 0.3)}`,
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
                animate={{ rotate: migration.status === 'pending' ? 360 : 0 }}
                transition={{ duration: 2, repeat: migration.status === 'pending' ? Infinity : 0 }}
              >
                <FontAwesomeIcon 
                  icon={getStatusIcon(migration.status)} 
                  style={{ color: getStatusColor(migration.status), fontSize: '1.2rem' }}
                />
              </motion.div>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {migration.filename}
              </Typography>
            </Box>
            <Chip 
              label={migration.status.toUpperCase()} 
              size="small"
              sx={{ 
                bgcolor: alpha(getStatusColor(migration.status), 0.1),
                color: getStatusColor(migration.status),
                fontWeight: 600,
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {migration.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {migration.contexts.map(context => (
              <Chip 
                key={context} 
                label={context} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Author: {migration.author} | Checksum: {migration.checksum.substring(0, 8)}...
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => {
                  setSelectedMigration(migration)
                  setOpenDialog(true)
                }}>
                  <FontAwesomeIcon icon={faEye} />
                </IconButton>
              </Tooltip>
              <Tooltip title="View SQL">
                <IconButton size="small">
                  <FontAwesomeIcon icon={faCode} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {migration.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {migration.error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div
            animate={{ rotate: isRunning ? 360 : 0 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          >
            <FontAwesomeIcon icon={faDatabase} />
          </motion.div>
          Database Migrations
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Context</InputLabel>
            <Select
              value={selectedContext}
              label="Context"
              onChange={(e) => setSelectedContext(e.target.value)}
            >
              {contexts.map(context => (
                <MenuItem key={context} value={context}>
                  {context.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Migration Control
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faPlay} />}
                    onClick={handleRunMigrations}
                    disabled={isRunning}
                    sx={{ 
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    Run Migrations
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faUndo} />}
                    disabled={isRunning}
                  >
                    Rollback
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faHistory} />}
                  >
                    History
                  </Button>
                </Box>
              </Box>

              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                          }
                        }} 
                      />
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        {migrationSteps[activeStep]} ({progress}%)
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
                {migrationSteps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Migration Files ({migrations.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setShowNewMigration(!showNewMigration)}
            >
              New Migration
            </Button>
          </Box>

          <Collapse in={showNewMigration}>
            <Card sx={{ mb: 3, border: `2px dashed ${theme.palette.primary.main}` }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Create New Migration</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Migration Name"
                      placeholder="Add_user_preferences"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Author"
                      placeholder="john.doe"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      placeholder="Brief description of the migration"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" startIcon={<FontAwesomeIcon icon={faFileCode} />}>
                        Generate SQL
                      </Button>
                      <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faUpload} />}>
                        Upload File
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>

          <AnimatePresence>
            {migrations.map((migration, index) => (
              <MigrationCard key={migration.id} migration={migration} index={index} />
            ))}
          </AnimatePresence>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Migration Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {[
                  { label: 'Executed', count: migrations.filter(m => m.status === 'executed').length, color: theme.palette.success.main },
                  { label: 'Pending', count: migrations.filter(m => m.status === 'pending').length, color: theme.palette.warning.main },
                  { label: 'Failed', count: migrations.filter(m => m.status === 'failed').length, color: theme.palette.error.main },
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
                  { label: 'Validate Changelog', icon: faCheck },
                  { label: 'Generate Docs', icon: faFileCode },
                  { label: 'Export Schema', icon: faDownload },
                  { label: 'Database Status', icon: faCog },
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Migration Details: {selectedMigration?.filename}
        </DialogTitle>
        <DialogContent>
          {selectedMigration && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedMigration.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2">{selectedMigration.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Author</Typography>
                  <Typography variant="body2">{selectedMigration.author}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Checksum</Typography>
                  <Typography variant="body2">{selectedMigration.checksum}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Executed At</Typography>
                  <Typography variant="body2">{selectedMigration.executedAt || 'Not executed'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
        onClick={() => setShowNewMigration(true)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </Fab>
    </Box>
  )
}

export default Migrations
